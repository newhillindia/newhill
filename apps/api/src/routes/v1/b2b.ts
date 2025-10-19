import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Apply rate limiting
router.use(rateLimitConfigs.general);

// Require authentication for all B2B routes
router.use(AuthMiddleware.authenticate);

// Check if user has B2B role
router.use((req, res, next) => {
  if (req.user?.role !== 'B2B' && req.user?.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        status: 403,
        code: 'B2B_ACCESS_REQUIRED',
        message: 'B2B access required'
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1'
      }
    });
  }
  next();
});

/**
 * @swagger
 * /api/v1/b2b/stats:
 *   get:
 *     summary: Get B2B statistics
 *     tags: [B2B]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: B2B statistics
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
 *                     totalQuotes:
 *                       type: integer
 *                     pendingQuotes:
 *                       type: integer
 *                     approvedQuotes:
 *                       type: integer
 *                     totalValue:
 *                       type: number
 *                     averageOrderValue:
 *                       type: number
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: B2B access required
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const [totalQuotes, pendingQuotes, approvedQuotes, totalValue, averageOrderValue] = await Promise.all([
      prisma.b2BQuote.count({
        where: { userId }
      }),
      prisma.b2BQuote.count({
        where: { userId, status: 'REQUESTED' }
      }),
      prisma.b2BQuote.count({
        where: { userId, status: 'APPROVED' }
      }),
      prisma.b2BQuote.aggregate({
        where: { userId },
        _sum: { totalAmount: true }
      }),
      prisma.b2BQuote.aggregate({
        where: { userId },
        _avg: { totalAmount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalQuotes,
        pendingQuotes,
        approvedQuotes,
        totalValue: totalValue._sum.totalAmount || 0,
        averageOrderValue: averageOrderValue._avg.totalAmount || 0
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
 * /api/v1/b2b/quotes:
 *   get:
 *     summary: Get B2B quotes
 *     tags: [B2B]
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
 *           enum: [REQUESTED, REVIEWED, APPROVED, REJECTED, EXPIRED, CONVERTED]
 *         description: Filter by quote status
 *     responses:
 *       200:
 *         description: List of B2B quotes
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
 *                             $ref: '#/components/schemas/B2BQuote'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: B2B access required
 */
router.get('/quotes', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status;
    }

    const [quotes, total] = await Promise.all([
      prisma.b2BQuote.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.b2BQuote.count({
        where: whereClause
      })
    ]);

    res.json({
      success: true,
      data: {
        items: quotes,
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
 * /api/v1/b2b/quotes:
 *   post:
 *     summary: Create B2B quote request
 *     tags: [B2B]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     notes:
 *                       type: string
 *               customerNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quote request created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: B2B access required
 */
router.post('/quotes', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const { items, customerNotes } = req.body;

    // Generate quote number
    const quoteNumber = `B2B-${Date.now()}`;

    // Calculate total amount
    let totalAmount = 0;
    const quoteItems = [];

    for (const item of items || []) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });

      if (!variant) {
        throw new ApiError(`Product variant not found: ${item.variantId}`, 400, 'VARIANT_NOT_FOUND');
      }

      const unitPrice = variant.basePriceINR;
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      quoteItems.push({
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        notes: item.notes
      });
    }

    // Create quote with items
    const quote = await prisma.b2BQuote.create({
      data: {
        userId,
        quoteNumber,
        totalAmount,
        customerNotes,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: {
          create: quoteItems
        }
      },
      include: {
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
    });

    res.status(201).json({
      success: true,
      data: quote,
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
 * /api/v1/b2b/quotes/{id}:
 *   get:
 *     summary: Get B2B quote details
 *     tags: [B2B]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/B2BQuote'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: B2B access required
 */
router.get('/quotes/:id', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const quoteId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const quote = await prisma.b2BQuote.findFirst({
      where: { id: quoteId, userId },
      include: {
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
    });

    if (!quote) {
      throw new ApiError('Quote not found', 404, 'QUOTE_NOT_FOUND');
    }

    res.json({
      success: true,
      data: quote,
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
 * /api/v1/b2b/quotes/{id}/convert:
 *   post:
 *     summary: Convert quote to order
 *     tags: [B2B]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote converted to order successfully
 *       404:
 *         description: Quote not found
 *       400:
 *         description: Quote cannot be converted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: B2B access required
 */
router.post('/quotes/:id/convert', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const quoteId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const quote = await prisma.b2BQuote.findFirst({
      where: { id: quoteId, userId },
      include: {
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
    });

    if (!quote) {
      throw new ApiError('Quote not found', 404, 'QUOTE_NOT_FOUND');
    }

    if (quote.status !== 'APPROVED') {
      throw new ApiError('Only approved quotes can be converted to orders', 400, 'QUOTE_NOT_APPROVED');
    }

    // Update quote status to converted
    await prisma.b2BQuote.update({
      where: { id: quoteId },
      data: { status: 'CONVERTED' }
    });

    // In a real implementation, you would create an order here
    // For now, we'll just return success

    res.json({
      success: true,
      data: { message: 'Quote converted to order successfully' },
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
 * /api/v1/b2b/quotes/{id}/pdf:
 *   get:
 *     summary: Download quote PDF
 *     tags: [B2B]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quote ID
 *     responses:
 *       200:
 *         description: Quote PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Quote not found
 *       401:
 *         description: Authentication required
 *       403:
 *         description: B2B access required
 */
router.get('/quotes/:id/pdf', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const quoteId = req.params.id;

    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const quote = await prisma.b2BQuote.findFirst({
      where: { id: quoteId, userId },
      include: {
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
    });

    if (!quote) {
      throw new ApiError('Quote not found', 404, 'QUOTE_NOT_FOUND');
    }

    // In a real implementation, you would generate a PDF
    // For now, we'll return a mock response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quote-${quote.quoteNumber}.pdf"`);
    
    // Mock PDF content
    const mockPdf = Buffer.from('Mock PDF content for quote');
    res.send(mockPdf);
  } catch (error) {
    next(error);
  }
});

export default router;
