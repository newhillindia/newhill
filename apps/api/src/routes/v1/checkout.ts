import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  ValidationMiddleware, 
  CommonSchemas, 
  OrderSchemas 
} from '../../middleware/validation';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { AuthMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { PaymentService } from '../../services/PaymentService';
import { ShippingService } from '../../services/ShippingService';
import { PrismaClient } from '@prisma/client';
import { Logger } from '../../utils/logger';
import { MetricsCollector } from '../../utils/metrics';
import { ApiResponse, ValidationError, NotFoundError } from '@newhill/shared/types/api';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const logger = new Logger();
const metrics = new MetricsCollector();
const paymentService = new PaymentService(prisma, logger, metrics);
const shippingService = new ShippingService(prisma, logger, metrics);

// Apply rate limiting
router.use(rateLimitConfigs.checkout);

// Require authentication for all checkout routes
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/checkout/start:
 *   post:
 *     summary: Start checkout process
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckoutRequest'
 *     responses:
 *       200:
 *         description: Checkout started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                     payment:
 *                       $ref: '#/components/schemas/PaymentResponse'
 *                     shipping:
 *                       $ref: '#/components/schemas/ShippingResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Duplicate order (idempotency key)
 */
router.post(
  '/start',
  ValidationMiddleware.validateBody(OrderSchemas.checkout),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { items, shippingAddress, billingAddress, paymentMethod, shippingMethod, notes, idempotencyKey } = req.body;

    try {
      // 1. Validate and create order
      const order = await createOrder(userId, {
        items,
        shippingAddress,
        billingAddress,
        notes,
        idempotencyKey,
      });

      // 2. Calculate totals
      const totals = await calculateOrderTotals(order.id, items);

      // 3. Initiate payment
      const paymentResponse = await paymentService.initiatePayment({
        orderId: order.id,
        amount: totals.total,
        currency: totals.currency,
        customer: {
          id: userId,
          email: req.user!.email,
          name: req.user!.name || 'Customer',
        },
        billingAddress,
        shippingAddress,
        items: items.map(item => ({
          id: item.productId,
          name: `Product ${item.productId}`,
          quantity: item.quantity,
          unitPrice: item.price || 0,
          totalPrice: (item.price || 0) * item.quantity,
        })),
        idempotencyKey,
      });

      // 4. Get shipping rates
      const shippingRates = await shippingService.getShippingRates({
        origin: {
          name: 'Newhill Spices Warehouse',
          address1: 'Warehouse Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'IN',
          postalCode: '400001',
          phone: '+91-9876543210',
        },
        destination: shippingAddress,
        weight: calculateTotalWeight(items),
        method: shippingMethod,
        currency: totals.currency,
      });

      const response: ApiResponse<{
        order: any;
        payment: any;
        shipping: {
          rates: any[];
          selectedMethod: string;
        };
      }> = {
        success: true,
        data: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            total: totals.total,
            currency: totals.currency,
            items: items.map(item => ({
              id: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price || 0,
              total: (item.price || 0) * item.quantity,
            })),
            shippingAddress,
            billingAddress,
            createdAt: order.createdAt,
          },
          payment: paymentResponse,
          shipping: {
            rates: shippingRates,
            selectedMethod: shippingMethod,
          },
        },
        meta: {
          traceId: req.traceId || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Checkout start failed', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: req.traceId,
      });

      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/checkout/confirm:
 *   post:
 *     summary: Confirm checkout and process payment
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *               paymentId:
 *                 type: string
 *               signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Checkout confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                     payment:
 *                       $ref: '#/components/schemas/PaymentResponse'
 *                     shipment:
 *                       $ref: '#/components/schemas/ShippingResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 */
router.post(
  '/confirm',
  ValidationMiddleware.validateBody(z.object({
    orderId: z.string().uuid(),
    paymentId: z.string(),
    signature: z.string().optional(),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { orderId, paymentId, signature } = req.body;

    try {
      // 1. Verify payment
      const paymentResponse = await paymentService.verifyPayment(paymentId, signature);

      if (paymentResponse.status !== 'completed') {
        throw new ValidationError('Payment not completed');
      }

      // 2. Get order details
      const order = await prisma.order.findUnique({
        where: { id: orderId, userId },
        include: {
          shippingAddress: true,
          billingAddress: true,
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundError('Order');
      }

      // 3. Create shipment
      const shipmentResponse = await shippingService.createShipment({
        orderId: order.id,
        items: order.items.map(item => ({
          id: item.id,
          name: item.variant.product.name,
          sku: item.variant.id,
          quantity: item.quantity,
          weight: item.variant.weightInGrams,
          value: Number(item.unitPrice),
          description: `Spice: ${item.variant.product.name}`,
        })),
        origin: {
          name: 'Newhill Spices Warehouse',
          address1: 'Warehouse Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'IN',
          postalCode: '400001',
          phone: '+91-9876543210',
        },
        destination: {
          name: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          address1: order.shippingAddress.address1,
          address2: order.shippingAddress.address2,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          country: order.shippingAddress.country,
          postalCode: order.shippingAddress.postalCode,
          phone: order.shippingAddress.phone || '',
        },
        method: 'standard',
        weight: order.items.reduce((sum, item) => sum + item.variant.weightInGrams * item.quantity, 0),
        dimensions: {
          length: 30,
          width: 20,
          height: 15,
        },
        value: Number(order.totalAmount),
        currency: order.currency,
        instructions: order.notes || 'Handle with care - Spices',
      });

      // 4. Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          updatedAt: new Date(),
        },
      });

      const response: ApiResponse<{
        order: any;
        payment: any;
        shipment: any;
      }> = {
        success: true,
        data: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: 'confirmed',
            total: Number(order.totalAmount),
            currency: order.currency,
            items: order.items.map(item => ({
              id: item.id,
              productId: item.variant.product.id,
              variantId: item.variant.id,
              quantity: item.quantity,
              price: Number(item.unitPrice),
              total: Number(item.totalPrice),
            })),
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress,
            createdAt: order.createdAt,
          },
          payment: paymentResponse,
          shipment: shipmentResponse,
        },
        meta: {
          traceId: req.traceId || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Checkout confirmation failed', {
        userId,
        orderId,
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: req.traceId,
      });

      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/checkout/rates:
 *   post:
 *     summary: Get shipping rates
 *     tags: [Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination:
 *                 $ref: '#/components/schemas/Address'
 *               weight:
 *                 type: number
 *               currency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shipping rates retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ShippingRate'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 */
router.post(
  '/rates',
  ValidationMiddleware.validateBody(z.object({
    destination: z.object({
      firstName: z.string(),
      lastName: z.string(),
      address1: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
      postalCode: z.string(),
      phone: z.string().optional(),
    }),
    weight: z.number().positive(),
    currency: z.string().length(3),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { destination, weight, currency } = req.body;

    try {
      const rates = await shippingService.getShippingRates({
        origin: {
          name: 'Newhill Spices Warehouse',
          address1: 'Warehouse Address',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'IN',
          postalCode: '400001',
          phone: '+91-9876543210',
        },
        destination,
        weight,
        currency,
      });

      const response: ApiResponse<any[]> = {
        success: true,
        data: rates,
        meta: {
          traceId: req.traceId || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Shipping rates retrieval failed', {
        destination,
        weight,
        currency,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: req.traceId,
      });

      throw error;
    }
  })
);

// Helper functions
async function createOrder(userId: string, data: any) {
  const orderNumber = `NH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  return prisma.order.create({
    data: {
      userId,
      orderNumber,
      status: 'PENDING',
      totalAmount: 0, // Will be calculated
      currency: 'INR',
      shippingAddressId: 'temp', // Will be created
      billingAddressId: 'temp', // Will be created
      notes: data.notes,
    },
  });
}

async function calculateOrderTotals(orderId: string, items: any[]) {
  // Mock calculation - in real implementation, this would calculate from database
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% GST
  const shipping = 50; // Fixed shipping cost
  const total = subtotal + tax + shipping;

  return {
    subtotal,
    tax,
    shipping,
    total,
    currency: 'INR',
  };
}

function calculateTotalWeight(items: any[]): number {
  // Mock calculation - in real implementation, this would get from product variants
  return items.reduce((sum, item) => sum + (item.weight || 100) * item.quantity, 0);
}

export default router;

