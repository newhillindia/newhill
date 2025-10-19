import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ValidationMiddleware } from '../../middleware/validation';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../middleware/errorHandler';
import { PaymentService } from '../../services/PaymentService';
import { ShippingService } from '../../services/ShippingService';
import { PrismaClient } from '@prisma/client';
import { Logger } from '../../utils/logger';
import { MetricsCollector } from '../../utils/metrics';
import { ApiResponse, ValidationError } from '@newhill/shared/types/api';
import { PaymentProvider } from '@newhill/shared/types/payment';
import { ShippingProvider } from '@newhill/shared/types/shipping';

const router = Router();

// Initialize services
const prisma = new PrismaClient();
const logger = new Logger();
const metrics = new MetricsCollector();
const paymentService = new PaymentService(prisma, logger, metrics);
const shippingService = new ShippingService(prisma, logger, metrics);

// Apply rate limiting for webhooks
router.use(rateLimitConfigs.webhooks);

/**
 * @swagger
 * /api/v1/webhooks/payments/{provider}:
 *   post:
 *     summary: Handle payment webhooks
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [razorpay, dibsy, telr, moyasar, oman_net]
 *         description: Payment provider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook payload from payment provider
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *                     webhookId:
 *                       type: string
 *                     processed:
 *                       type: boolean
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid webhook payload
 *       401:
 *         description: Invalid webhook signature
 */
router.post(
  '/payments/:provider',
  ValidationMiddleware.validate({
    params: z.object({
      provider: z.enum(['razorpay', 'dibsy', 'telr', 'moyasar', 'oman_net']),
    }),
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.params;
    const signature = req.headers['x-razorpay-signature'] || 
                     req.headers['x-dibsy-signature'] || 
                     req.headers['x-telr-signature'] || 
                     req.headers['x-moyasar-signature'] || 
                     req.headers['x-oman-net-signature'] || 
                     req.headers['signature'] as string;

    if (!signature) {
      throw new ValidationError('Webhook signature is required');
    }

    try {
      logger.info('Processing payment webhook', {
        provider,
        event: req.body.event,
        traceId: req.traceId,
      });

      const webhook = await paymentService.processWebhook(
        provider as PaymentProvider,
        req.body,
        signature
      );

      // Update webhook as processed
      await prisma.payment.updateMany({
        where: { providerId: webhook.data?.payment?.id || webhook.data?.id },
        data: {
          status: webhook.data?.payment?.status?.toUpperCase() || 'PROCESSING',
          updatedAt: new Date(),
        },
      });

      // Update order status based on payment status
      if (webhook.data?.payment?.status === 'completed') {
        const payment = await prisma.payment.findFirst({
          where: { providerId: webhook.data.payment.id },
        });

        if (payment) {
          await prisma.order.update({
            where: { id: payment.orderId },
            data: {
              status: 'CONFIRMED',
              updatedAt: new Date(),
            },
          });
        }
      }

      const response: ApiResponse<{
        webhookId: string;
        processed: boolean;
      }> = {
        success: true,
        data: {
          webhookId: webhook.id,
          processed: true,
        },
        meta: {
          traceId: req.traceId || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Payment webhook processing failed', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: req.traceId,
      });

      // Return 200 to prevent webhook retries for certain errors
      if (error instanceof ValidationError) {
        res.status(200).json({
          success: false,
          error: {
            status: 400,
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
          meta: {
            traceId: req.traceId || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/webhooks/shipping/{provider}:
 *   post:
 *     summary: Handle shipping webhooks
 *     tags: [Webhooks]
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [shiprocket, gcc_logistics, aramex, dhl, blue_dart]
 *         description: Shipping provider
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Webhook payload from shipping provider
 *     responses:
 *       200:
 *         description: Webhook processed successfully
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
 *                     webhookId:
 *                       type: string
 *                     processed:
 *                       type: boolean
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid webhook payload
 *       401:
 *         description: Invalid webhook signature
 */
router.post(
  '/shipping/:provider',
  ValidationMiddleware.validate({
    params: z.object({
      provider: z.enum(['shiprocket', 'gcc_logistics', 'aramex', 'dhl', 'blue_dart']),
    }),
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { provider } = req.params;
    const signature = req.headers['x-shiprocket-signature'] || 
                     req.headers['x-gcc-logistics-signature'] || 
                     req.headers['x-aramex-signature'] || 
                     req.headers['x-dhl-signature'] || 
                     req.headers['x-blue-dart-signature'] || 
                     req.headers['signature'] as string;

    if (!signature) {
      throw new ValidationError('Webhook signature is required');
    }

    try {
      logger.info('Processing shipping webhook', {
        provider,
        event: req.body.event,
        traceId: req.traceId,
      });

      const webhook = await shippingService.processWebhook(
        provider as ShippingProvider,
        req.body,
        signature
      );

      // Update shipment status based on webhook data
      const shipmentId = webhook.data?.shipment?.id || webhook.data?.order_id;
      const status = webhook.data?.shipment?.status || webhook.data?.status;

      if (shipmentId && status) {
        await prisma.shipment.updateMany({
          where: { 
            OR: [
              { id: shipmentId },
              { trackingNumber: shipmentId },
            ],
          },
          data: {
            status: status.toUpperCase() as any,
            updatedAt: new Date(),
          },
        });

        // Update order status based on shipment status
        if (status === 'delivered') {
          const shipment = await prisma.shipment.findFirst({
            where: { 
              OR: [
                { id: shipmentId },
                { trackingNumber: shipmentId },
              ],
            },
          });

          if (shipment) {
            await prisma.order.update({
              where: { id: shipment.orderId },
              data: {
                status: 'DELIVERED',
                updatedAt: new Date(),
              },
            });
          }
        }
      }

      const response: ApiResponse<{
        webhookId: string;
        processed: boolean;
      }> = {
        success: true,
        data: {
          webhookId: webhook.id,
          processed: true,
        },
        meta: {
          traceId: req.traceId || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Shipping webhook processing failed', {
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: req.traceId,
      });

      // Return 200 to prevent webhook retries for certain errors
      if (error instanceof ValidationError) {
        res.status(200).json({
          success: false,
          error: {
            status: 400,
            code: 'VALIDATION_ERROR',
            message: error.message,
          },
          meta: {
            traceId: req.traceId || 'unknown',
            timestamp: new Date().toISOString(),
            version: 'v1',
          },
        });
        return;
      }

      throw error;
    }
  })
);

/**
 * @swagger
 * /api/v1/webhooks/test:
 *   post:
 *     summary: Test webhook endpoint
 *     tags: [Webhooks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [razorpay, dibsy, telr, moyasar, oman_net, shiprocket, gcc_logistics]
 *               type:
 *                 type: string
 *                 enum: [payment, shipping]
 *               event:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Test webhook processed
 */
router.post(
  '/test',
  ValidationMiddleware.validateBody(z.object({
    provider: z.string(),
    type: z.enum(['payment', 'shipping']),
    event: z.string(),
    data: z.any(),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const { provider, type, event, data } = req.body;

    try {
      logger.info('Processing test webhook', {
        provider,
        type,
        event,
        traceId: req.traceId,
      });

      let webhook;
      if (type === 'payment') {
        webhook = await paymentService.processWebhook(
          provider as PaymentProvider,
          { event, data },
          'test-signature'
        );
      } else {
        webhook = await shippingService.processWebhook(
          provider as ShippingProvider,
          { event, data },
          'test-signature'
        );
      }

      const response: ApiResponse<{
        webhookId: string;
        processed: boolean;
      }> = {
        success: true,
        data: {
          webhookId: webhook.id,
          processed: true,
        },
        meta: {
          traceId: req.traceId || 'unknown',
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
      };

      res.json(response);
    } catch (error) {
      logger.error('Test webhook processing failed', {
        provider,
        type,
        error: error instanceof Error ? error.message : 'Unknown error',
        traceId: req.traceId,
      });

      throw error;
    }
  })
);

export default router;