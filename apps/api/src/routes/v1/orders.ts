import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  ValidationMiddleware, 
  CommonSchemas, 
  OrderSchemas 
} from '../../middleware/validation';
import { CacheMiddleware } from '../../middleware/caching';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { AuthMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { Order, ApiResponse, PaginatedResponse, NotFoundError } from '@newhill/shared/types/api';

const router = Router();

// Apply rate limiting
router.use(rateLimitConfigs.general);

// Require authentication for all order routes
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get user's orders
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, refunded]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/PaginatedResponse'
 *                     - type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Order'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get(
  '/',
  ValidationMiddleware.validate({
    query: CommonSchemas.pagination.merge(z.object({
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']).optional(),
    })),
  }),
  CacheMiddleware.cache({
    ttl: 0, // No caching for user-specific data
    keyPrefix: 'orders:',
    skipCache: () => true, // Always skip cache for authenticated users
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page, limit, offset, status } = req.query;

    // Mock orders data - in real implementation, this would query the database
    const mockOrders: Order[] = [
      {
        id: 'order-1',
        orderNumber: 'NH-2024-001',
        userId,
        items: [
          {
            id: 'item-1',
            productId: '1',
            variantId: '1',
            quantity: 2,
            price: 299,
            total: 598,
            productSnapshot: {
              id: '1',
              name: { en: 'Premium Turmeric Powder' },
              slug: 'premium-turmeric-powder',
            },
          },
        ],
        subtotal: 598,
        tax: 107.64,
        shipping: 50,
        discount: 0,
        total: 755.64,
        currency: 'INR',
        status: 'delivered',
        paymentStatus: 'paid',
        shippingAddress: {
          id: 'addr-1',
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'IN',
          phone: '+91-9876543210',
          isDefault: true,
        },
        billingAddress: {
          id: 'addr-1',
          firstName: 'John',
          lastName: 'Doe',
          address1: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'IN',
          phone: '+91-9876543210',
          isDefault: true,
        },
        paymentMethod: {
          id: 'pm-1',
          type: 'card',
          provider: 'razorpay',
          last4: '4242',
          brand: 'visa',
        },
        shippingMethod: {
          id: 'sm-1',
          name: 'Standard Shipping',
          description: '5-7 business days',
          cost: 50,
          estimatedDays: 5,
          isActive: true,
        },
        trackingNumber: 'TRK123456789',
        notes: 'Please deliver during business hours',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shippedAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
      },
    ];

    // Filter by status if provided
    const filteredOrders = status 
      ? mockOrders.filter(order => order.status === status)
      : mockOrders;

    const total = filteredOrders.length;
    const startIndex = offset || (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = filteredOrders.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<Order>> = {
      success: true,
      data: {
        items,
        pagination: {
          total,
          limit: Number(limit),
          offset: startIndex,
          page: Number(page),
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: startIndex > 0,
        },
      },
      meta: {
        traceId: req.traceId || 'unknown',
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    res.json(response);
  })
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 */
router.get(
  '/:id',
  ValidationMiddleware.validate({
    params: CommonSchemas.uuidParam,
  }),
  CacheMiddleware.cache({
    ttl: 0, // No caching for user-specific data
    keyPrefix: 'order:',
    skipCache: () => true, // Always skip cache for authenticated users
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Mock order data - in real implementation, this would query the database
    const mockOrder: Order = {
      id,
      orderNumber: 'NH-2024-001',
      userId,
      items: [
        {
          id: 'item-1',
          productId: '1',
          variantId: '1',
          quantity: 2,
          price: 299,
          total: 598,
          productSnapshot: {
            id: '1',
            name: { en: 'Premium Turmeric Powder' },
            slug: 'premium-turmeric-powder',
          },
        },
      ],
      subtotal: 598,
      tax: 107.64,
      shipping: 50,
      discount: 0,
      total: 755.64,
      currency: 'INR',
      status: 'delivered',
      paymentStatus: 'paid',
      shippingAddress: {
        id: 'addr-1',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
        phone: '+91-9876543210',
        isDefault: true,
      },
      billingAddress: {
        id: 'addr-1',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
        phone: '+91-9876543210',
        isDefault: true,
      },
      paymentMethod: {
        id: 'pm-1',
        type: 'card',
        provider: 'razorpay',
        last4: '4242',
        brand: 'visa',
      },
      shippingMethod: {
        id: 'sm-1',
        name: 'Standard Shipping',
        description: '5-7 business days',
        cost: 50,
        estimatedDays: 5,
        isActive: true,
      },
      trackingNumber: 'TRK123456789',
      notes: 'Please deliver during business hours',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      shippedAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
    };

    // Check if user owns this order
    if (mockOrder.userId !== userId) {
      throw new NotFoundError('Order');
    }

    const response: ApiResponse<Order> = {
      success: true,
      data: mockOrder,
      meta: {
        traceId: req.traceId || 'unknown',
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    res.json(response);
  })
);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create new order (checkout)
 *     tags: [Orders]
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
 *         description: Order created successfully
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
 *                       type: object
 *                       properties:
 *                         provider:
 *                           type: string
 *                         paymentId:
 *                           type: string
 *                         redirectUrl:
 *                           type: string
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
  '/',
  ValidationMiddleware.validateBody(OrderSchemas.checkout),
  rateLimitConfigs.checkout,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { items, shippingAddress, billingAddress, paymentMethod, shippingMethod, notes, idempotencyKey } = req.body;

    // Mock order creation - in real implementation, this would:
    // 1. Validate idempotency key
    // 2. Check stock availability
    // 3. Calculate totals and taxes
    // 4. Create order in database
    // 5. Process payment
    // 6. Send confirmation email

    const mockOrder: Order = {
      id: 'order-2',
      orderNumber: 'NH-2024-002',
      userId,
      items: items.map((item: any, index: number) => ({
        id: `item-${index + 1}`,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: 299,
        total: 299 * item.quantity,
        productSnapshot: {
          id: item.productId,
          name: { en: 'Product Name' },
          slug: 'product-slug',
        },
      })),
      subtotal: items.reduce((sum: number, item: any) => sum + 299 * item.quantity, 0),
      tax: items.reduce((sum: number, item: any) => sum + 299 * item.quantity * 0.18, 0),
      shipping: 50,
      discount: 0,
      total: items.reduce((sum: number, item: any) => sum + 299 * item.quantity + 299 * item.quantity * 0.18, 0) + 50,
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod: {
        id: shippingMethod,
        name: 'Standard Shipping',
        description: '5-7 business days',
        cost: 50,
        estimatedDays: 5,
        isActive: true,
      },
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<{
      order: Order;
      payment: {
        provider: string;
        paymentId: string;
        redirectUrl?: string;
      };
    }> = {
      success: true,
      data: {
        order: mockOrder,
        payment: {
          provider: paymentMethod.provider,
          paymentId: 'pay_123456789',
          redirectUrl: 'https://checkout.razorpay.com/v1/checkout.js',
        },
      },
      meta: {
        traceId: req.traceId || 'unknown',
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    res.json(response);
  })
);

/**
 * @swagger
 * /api/v1/orders/{id}/cancel:
 *   post:
 *     summary: Cancel order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order cancelled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Order not found
 *       409:
 *         description: Order cannot be cancelled
 */
router.post(
  '/:id/cancel',
  ValidationMiddleware.validate({
    params: CommonSchemas.uuidParam,
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    // Mock order cancellation - in real implementation, this would:
    // 1. Check if order can be cancelled
    // 2. Process refund if payment was made
    // 3. Update order status
    // 4. Restore inventory
    // 5. Send cancellation email

    const mockOrder: Order = {
      id,
      orderNumber: 'NH-2024-002',
      userId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'INR',
      status: 'cancelled',
      paymentStatus: 'refunded',
      shippingAddress: {
        id: 'addr-1',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
        phone: '+91-9876543210',
        isDefault: true,
      },
      billingAddress: {
        id: 'addr-1',
        firstName: 'John',
        lastName: 'Doe',
        address1: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400001',
        country: 'IN',
        phone: '+91-9876543210',
        isDefault: true,
      },
      paymentMethod: {
        id: 'pm-1',
        type: 'card',
        provider: 'razorpay',
        last4: '4242',
        brand: 'visa',
      },
      shippingMethod: {
        id: 'sm-1',
        name: 'Standard Shipping',
        description: '5-7 business days',
        cost: 50,
        estimatedDays: 5,
        isActive: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Order> = {
      success: true,
      data: mockOrder,
      meta: {
        traceId: req.traceId || 'unknown',
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    res.json(response);
  })
);

export default router;

