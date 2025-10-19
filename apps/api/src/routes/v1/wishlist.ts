import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  ValidationMiddleware, 
  CommonSchemas 
} from '../../middleware/validation';
import { CacheMiddleware } from '../../middleware/caching';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { AuthMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { WishlistItem, Product, ApiResponse, PaginatedResponse, NotFoundError } from '@newhill/shared/types/api';

const router = Router();

// Apply rate limiting
router.use(rateLimitConfigs.general);

// Require authentication for all wishlist routes
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
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
 *         description: User's wishlist
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
 *                             $ref: '#/components/schemas/WishlistItem'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get(
  '/',
  ValidationMiddleware.validate({
    query: CommonSchemas.pagination,
  }),
  CacheMiddleware.cache({
    ttl: 0, // No caching for user-specific data
    keyPrefix: 'wishlist:',
    skipCache: () => true, // Always skip cache for authenticated users
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { page, limit, offset } = req.query;

    // Mock wishlist data - in real implementation, this would query the database
    const mockWishlistItems: WishlistItem[] = [
      {
        id: 'wish-1',
        userId,
        productId: '1',
        addedAt: new Date().toISOString(),
        product: {
          id: '1',
          slug: 'premium-turmeric-powder',
          name: { en: 'Premium Turmeric Powder', hi: 'प्रीमियम हल्दी पाउडर' },
          description: { 
            en: 'High-quality turmeric powder with excellent color and aroma',
            hi: 'उत्कृष्ट रंग और सुगंध के साथ उच्च गुणवत्ता वाला हल्दी पाउडर'
          },
          shortDescription: { 
            en: 'Premium turmeric powder',
            hi: 'प्रीमियम हल्दी पाउडर'
          },
          price: 299,
          currency: 'INR',
          category: 'spices',
          subcategory: 'powder',
          weight: 100,
          unit: 'g',
          inStock: true,
          stockQuantity: 50,
          images: ['https://example.com/turmeric.jpg'],
          variants: [],
          lots: [],
          certifications: ['organic', 'fssai'],
          tags: ['turmeric', 'spice', 'powder'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        id: 'wish-2',
        userId,
        productId: '2',
        addedAt: new Date().toISOString(),
        product: {
          id: '2',
          slug: 'organic-cumin-seeds',
          name: { en: 'Organic Cumin Seeds', hi: 'ऑर्गेनिक जीरा' },
          description: { 
            en: 'Premium organic cumin seeds with strong aroma and flavor',
            hi: 'मजबूत सुगंध और स्वाद के साथ प्रीमियम ऑर्गेनिक जीरा'
          },
          shortDescription: { 
            en: 'Organic cumin seeds',
            hi: 'ऑर्गेनिक जीरा'
          },
          price: 199,
          currency: 'INR',
          category: 'spices',
          subcategory: 'seeds',
          weight: 100,
          unit: 'g',
          inStock: true,
          stockQuantity: 30,
          images: ['https://example.com/cumin.jpg'],
          variants: [],
          lots: [],
          certifications: ['organic', 'fssai'],
          tags: ['cumin', 'spice', 'seeds', 'organic'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ];

    const total = mockWishlistItems.length;
    const startIndex = offset || (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = mockWishlistItems.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<WishlistItem>> = {
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
 * /api/v1/wishlist:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *                 description: Product ID to add to wishlist
 *     responses:
 *       200:
 *         description: Product added to wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WishlistItem'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Product already in wishlist
 */
router.post(
  '/',
  ValidationMiddleware.validateBody(z.object({
    productId: z.string().uuid(),
  })),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.body;

    // Mock wishlist item creation - in real implementation, this would:
    // 1. Check if product exists and is active
    // 2. Check if product is already in wishlist
    // 3. Add to wishlist in database

    const mockWishlistItem: WishlistItem = {
      id: 'wish-3',
      userId,
      productId,
      addedAt: new Date().toISOString(),
      product: {
        id: productId,
        slug: 'product-slug',
        name: { en: 'Product Name', hi: 'उत्पाद नाम' },
        description: { 
          en: 'Product description',
          hi: 'उत्पाद विवरण'
        },
        shortDescription: { 
          en: 'Product short description',
          hi: 'उत्पाद संक्षिप्त विवरण'
        },
        price: 299,
        currency: 'INR',
        category: 'spices',
        inStock: true,
        stockQuantity: 50,
        images: ['https://example.com/product.jpg'],
        variants: [],
        lots: [],
        certifications: ['organic'],
        tags: ['spice'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    const response: ApiResponse<WishlistItem> = {
      success: true,
      data: mockWishlistItem,
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
 * /api/v1/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Product ID to remove from wishlist
 *     responses:
 *       200:
 *         description: Product removed from wishlist
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
 *                     message:
 *                       type: string
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Product not found in wishlist
 */
router.delete(
  '/:productId',
  ValidationMiddleware.validate({
    params: z.object({
      productId: z.string().uuid(),
    }),
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId } = req.params;

    // Mock wishlist item removal - in real implementation, this would:
    // 1. Check if product exists in wishlist
    // 2. Remove from wishlist in database

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Product removed from wishlist' },
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
 * /api/v1/wishlist/clear:
 *   delete:
 *     summary: Clear all items from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist cleared
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
 *                     message:
 *                       type: string
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.delete(
  '/clear',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Mock wishlist clear - in real implementation, this would clear the database
    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Wishlist cleared' },
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
 * /api/v1/wishlist/share:
 *   post:
 *     summary: Generate shareable wishlist link
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shareable link generated
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
 *                     shareToken:
 *                       type: string
 *                     shareUrl:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.post(
  '/share',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Mock share token generation - in real implementation, this would:
    // 1. Generate unique share token
    // 2. Set expiration time
    // 3. Store in database
    // 4. Return shareable URL

    const shareToken = 'share_token_123456789';
    const shareUrl = `${process.env.FRONTEND_URL}/wishlist/shared/${shareToken}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const response: ApiResponse<{
      shareToken: string;
      shareUrl: string;
      expiresAt: string;
    }> = {
      success: true,
      data: {
        shareToken,
        shareUrl,
        expiresAt,
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
 * /api/v1/wishlist/shared/{shareToken}:
 *   get:
 *     summary: Get shared wishlist by token
 *     tags: [Wishlist]
 *     parameters:
 *       - in: path
 *         name: shareToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Share token
 *     responses:
 *       200:
 *         description: Shared wishlist
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
 *                     wishlist:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/WishlistItem'
 *                     sharedBy:
 *                       type: string
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       404:
 *         description: Shared wishlist not found or expired
 */
router.get(
  '/shared/:shareToken',
  ValidationMiddleware.validate({
    params: z.object({
      shareToken: z.string().min(1),
    }),
  }),
  CacheMiddleware.cache({
    ttl: 300, // 5 minutes
    keyPrefix: 'wishlist:shared:',
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { shareToken } = req.params;

    // Mock shared wishlist retrieval - in real implementation, this would:
    // 1. Validate share token
    // 2. Check expiration
    // 3. Return wishlist items

    const mockWishlistItems: WishlistItem[] = [
      {
        id: 'wish-1',
        userId: 'user-1',
        productId: '1',
        addedAt: new Date().toISOString(),
        product: {
          id: '1',
          slug: 'premium-turmeric-powder',
          name: { en: 'Premium Turmeric Powder' },
          description: { 
            en: 'High-quality turmeric powder with excellent color and aroma'
          },
          shortDescription: { 
            en: 'Premium turmeric powder'
          },
          price: 299,
          currency: 'INR',
          category: 'spices',
          inStock: true,
          stockQuantity: 50,
          images: ['https://example.com/turmeric.jpg'],
          variants: [],
          lots: [],
          certifications: ['organic'],
          tags: ['turmeric', 'spice'],
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ];

    const response: ApiResponse<{
      wishlist: WishlistItem[];
      sharedBy: string;
    }> = {
      success: true,
      data: {
        wishlist: mockWishlistItems,
        sharedBy: 'John Doe',
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

export default router;

