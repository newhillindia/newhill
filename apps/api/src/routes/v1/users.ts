import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../../utils/errors';

const router = Router();
const prisma = new PrismaClient();

// Apply rate limiting
router.use(rateLimitConfigs.general);

// Require authentication for all user routes
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserProfile'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get('/profile', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        b2bApplication: true
      }
    });

    if (!user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        b2bApplication: user.b2bApplication
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
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferredLanguage:
 *                 type: string
 *                 enum: [en, ar, hi]
 *               defaultCurrency:
 *                 type: string
 *                 enum: [INR, QAR, AED, SAR, OMR]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Authentication required
 */
router.put('/profile', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const { firstName, lastName, phone, preferredLanguage, defaultCurrency } = req.body;

    // Update or create user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        firstName,
        lastName,
        phone,
        preferredLanguage: preferredLanguage || 'en',
        defaultCurrency: defaultCurrency || 'INR'
      },
      create: {
        userId,
        firstName,
        lastName,
        phone,
        preferredLanguage: preferredLanguage || 'en',
        defaultCurrency: defaultCurrency || 'INR'
      }
    });

    res.json({
      success: true,
      data: profile,
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
 * /api/v1/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
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
 *                     totalOrders:
 *                       type: integer
 *                     totalSpent:
 *                       type: number
 *                     wishlistItems:
 *                       type: integer
 *                     addresses:
 *                       type: integer
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    const [totalOrders, totalSpent, wishlistItems, addresses] = await Promise.all([
      prisma.order.count({
        where: { userId, softDeleted: false }
      }),
      prisma.order.aggregate({
        where: { userId, softDeleted: false },
        _sum: { totalAmount: true }
      }),
      prisma.wishlistItem.count({
        where: { userId }
      }),
      prisma.address.count({
        where: { userId }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent._sum.totalAmount || 0,
        wishlistItems,
        addresses
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
 * /api/v1/users/impersonate:
 *   post:
 *     summary: Impersonate user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Impersonation successful
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 */
router.post('/impersonate', AuthMiddleware.requireAdmin, async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError('Email is required', 400, 'MISSING_EMAIL');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        b2bApplication: true
      }
    });

    if (!user) {
      throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
    }

    // In a real implementation, you would create a special session for impersonation
    // For now, we'll just return the user data
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile,
        b2bApplication: user.b2bApplication,
        impersonated: true
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: 'v1',
        note: 'This is a demo implementation. In production, proper impersonation session management would be implemented.'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
