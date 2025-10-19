import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Apply rate limiting
router.use(rateLimitConfigs.general);

// Require authentication for all payment routes
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/payments:
 *   get:
 *     summary: Get user payment history
 *     tags: [Payments]
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
 *     responses:
 *       200:
 *         description: List of user payments
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
 *                             $ref: '#/components/schemas/Payment'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: {
          order: { userId }
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.payment.count({
        where: {
          order: { userId }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        items: payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/payments/saved:
 *   get:
 *     summary: Get saved payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved payment methods
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
 *                     $ref: '#/components/schemas/SavedPayment'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get('/saved', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const savedPayments = await prisma.savedPayment.findMany({
      where: { userId, isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: savedPayments,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/payments/saved:
 *   post:
 *     summary: Save payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - token
 *               - last4Digits
 *             properties:
 *               provider:
 *                 type: string
 *               token:
 *                 type: string
 *               last4Digits:
 *                 type: string
 *               expiryMonth:
 *                 type: integer
 *               expiryYear:
 *                 type: integer
 *               cardType:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Payment method saved successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 */
router.post('/saved', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const {
      provider,
      token,
      last4Digits,
      expiryMonth,
      expiryYear,
      cardType,
      isDefault
    } = req.body;

    // Validate required fields
    if (!provider || !token || !last4Digits) {
      throw new ApiError('Missing required fields', 400, 'MISSING_REQUIRED_FIELDS');
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.savedPayment.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const savedPayment = await prisma.savedPayment.create({
      data: {
        userId,
        provider,
        token, // In production, this should be encrypted
        last4Digits,
        expiryMonth,
        expiryYear,
        cardType,
        isDefault: isDefault || false
      }
    });

    res.status(201).json({
      success: true,
      data: savedPayment,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/payments/saved/{id}:
 *   delete:
 *     summary: Delete saved payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved payment ID
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
 *       404:
 *         description: Payment method not found
 *       401:
 *         description: Authentication required
 */
router.delete('/saved/:id', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const paymentId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if payment exists and belongs to user
    const existingPayment = await prisma.savedPayment.findFirst({
      where: { id: paymentId, userId }
    });

    if (!existingPayment) {
      throw new ApiError('Payment method not found', 404, 'PAYMENT_NOT_FOUND');
    }

    await prisma.savedPayment.delete({
      where: { id: paymentId }
    });

    res.json({
      success: true,
      data: { message: 'Payment method deleted successfully' },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/payments/saved/{id}/default:
 *   post:
 *     summary: Set saved payment as default
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved payment ID
 *     responses:
 *       200:
 *         description: Payment method set as default successfully
 *       404:
 *         description: Payment method not found
 *       401:
 *         description: Authentication required
 */
router.post('/saved/:id/default', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const paymentId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if payment exists and belongs to user
    const existingPayment = await prisma.savedPayment.findFirst({
      where: { id: paymentId, userId }
    });

    if (!existingPayment) {
      throw new ApiError('Payment method not found', 404, 'PAYMENT_NOT_FOUND');
    }

    // Unset other defaults
    await prisma.savedPayment.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false }
    });

    // Set this payment as default
    const payment = await prisma.savedPayment.update({
      where: { id: paymentId },
      data: { isDefault: true }
    });

    res.json({
      success: true,
      data: payment,
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/v1/payments/{id}/receipt:
 *   get:
 *     summary: Download payment receipt
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment receipt PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Authentication required
 */
router.get('/:id/receipt', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const paymentId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check if payment exists and belongs to user
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        order: { userId }
      },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                variant: {
                  include: {
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!payment) {
      throw new ApiError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    // In a real implementation, you would generate a PDF receipt
    // For now, we'll return a mock response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${paymentId}.pdf"`);
    
    // Mock PDF content (in production, use a PDF generation library)
    const mockPdf = Buffer.from('Mock PDF content for receipt');
    res.send(mockPdf);
  } catch (error) {
    next(error);
  }
});

export default router;
