import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  ValidationMiddleware, 
  CommonSchemas, 
  CartSchemas 
} from '../../middleware/validation';
import { CacheMiddleware } from '../../middleware/caching';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { AuthMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { Cart, CartItem, ApiResponse, ConflictError } from '@newhill/shared/types/api';

const router = Router();

// Apply rate limiting
router.use(rateLimitConfigs.general);

// Require authentication for all cart routes
router.use(AuthMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/cart:
 *   get:
 *     summary: Get user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.get(
  '/',
  CacheMiddleware.cache({
    ttl: 0, // No caching for user-specific data
    keyPrefix: 'cart:',
    skipCache: () => true, // Always skip cache for authenticated users
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Mock cart data - in real implementation, this would query the database
    const mockCart: Cart = {
      id: 'cart-1',
      userId,
      items: [
        {
          id: 'item-1',
          productId: '1',
          variantId: '1',
          quantity: 2,
          price: 299,
          addedAt: new Date().toISOString(),
        },
        {
          id: 'item-2',
          productId: '2',
          quantity: 1,
          price: 199,
          addedAt: new Date().toISOString(),
        },
      ],
      subtotal: 797,
      tax: 143.46,
      shipping: 50,
      total: 990.46,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Cart> = {
      success: true,
      data: mockCart,
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
 * /api/v1/cart:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 *     responses:
 *       200:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Item already in cart
 */
router.post(
  '/',
  ValidationMiddleware.validateBody(CartSchemas.item),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { productId, variantId, quantity } = req.body;

    // Mock validation - in real implementation, this would check:
    // 1. Product exists and is active
    // 2. Variant exists (if provided)
    // 3. Stock availability
    // 4. B2B weight restrictions (5kg rule)

    // Mock cart update - in real implementation, this would update the database
    const mockCart: Cart = {
      id: 'cart-1',
      userId,
      items: [
        {
          id: 'item-1',
          productId,
          variantId,
          quantity,
          price: 299,
          addedAt: new Date().toISOString(),
        },
      ],
      subtotal: 299 * quantity,
      tax: 299 * quantity * 0.18,
      shipping: 50,
      total: 299 * quantity + 299 * quantity * 0.18 + 50,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Cart> = {
      success: true,
      data: mockCart,
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
 * /api/v1/cart:
 *   patch:
 *     summary: Update cart items
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartUpdate'
 *     responses:
 *       200:
 *         description: Cart updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 */
router.patch(
  '/',
  ValidationMiddleware.validateBody(CartSchemas.update),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { items } = req.body;

    // Mock cart update - in real implementation, this would update the database
    const mockCart: Cart = {
      id: 'cart-1',
      userId,
      items: items.map((item: any, index: number) => ({
        id: item.id || `item-${index + 1}`,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: 299,
        addedAt: new Date().toISOString(),
      })),
      subtotal: items.reduce((sum: number, item: any) => sum + 299 * item.quantity, 0),
      tax: items.reduce((sum: number, item: any) => sum + 299 * item.quantity * 0.18, 0),
      shipping: 50,
      total: items.reduce((sum: number, item: any) => sum + 299 * item.quantity + 299 * item.quantity * 0.18, 0) + 50,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Cart> = {
      success: true,
      data: mockCart,
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
 * /api/v1/cart/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Item not found in cart
 */
router.delete(
  '/:itemId',
  ValidationMiddleware.validate({
    params: z.object({
      itemId: z.string().uuid(),
    }),
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { itemId } = req.params;

    // Mock cart update - in real implementation, this would update the database
    const mockCart: Cart = {
      id: 'cart-1',
      userId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Cart> = {
      success: true,
      data: mockCart,
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
 * /api/v1/cart/merge:
 *   post:
 *     summary: Merge guest cart with user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartMerge'
 *     responses:
 *       200:
 *         description: Cart merged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 */
router.post(
  '/merge',
  ValidationMiddleware.validateBody(CartSchemas.merge),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { guestCartId } = req.body;

    // Mock cart merge - in real implementation, this would:
    // 1. Fetch guest cart
    // 2. Merge items with user cart
    // 3. Handle conflicts (same product/variant)
    // 4. Update quantities
    // 5. Delete guest cart

    const mockCart: Cart = {
      id: 'cart-1',
      userId,
      items: [
        {
          id: 'item-1',
          productId: '1',
          variantId: '1',
          quantity: 2,
          price: 299,
          addedAt: new Date().toISOString(),
        },
      ],
      subtotal: 598,
      tax: 107.64,
      shipping: 50,
      total: 755.64,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Cart> = {
      success: true,
      data: mockCart,
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
 * /api/v1/cart/clear:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 */
router.delete(
  '/clear',
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Mock cart clear - in real implementation, this would clear the database
    const mockCart: Cart = {
      id: 'cart-1',
      userId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      currency: 'INR',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Cart> = {
      success: true,
      data: mockCart,
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

