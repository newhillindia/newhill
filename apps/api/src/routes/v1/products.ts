import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  ValidationMiddleware, 
  CommonSchemas, 
  ProductSchemas 
} from '../../middleware/validation';
import { CacheMiddleware, CacheConfigs } from '../../middleware/caching';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { AuthMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { Product, PaginatedResponse, ApiResponse } from '@newhill/shared/types/api';

const router = Router();

// Apply rate limiting
router.use(rateLimitConfigs.general);

/**
 * @swagger
 * /api/v1/products:
 *   get:
 *     summary: Get products with filtering and pagination
 *     tags: [Products]
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
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: boolean
 *         description: Filter by stock availability
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt, popularity]
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *       - in: header
 *         name: X-Currency
 *         schema:
 *           type: string
 *           default: INR
 *         description: Currency preference
 *       - in: header
 *         name: X-Region
 *         schema:
 *           type: string
 *           default: IN
 *         description: Region preference
 *     responses:
 *       200:
 *         description: List of products
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Product'
 *                     pagination:
 *                       $ref: '#/components/schemas/PaginationMeta'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 */
router.get(
  '/',
  ValidationMiddleware.validate({
    query: CommonSchemas.pagination.merge(ProductSchemas.filters),
    headers: z.object({
      'accept-language': z.string().optional(),
      'x-currency': z.string().optional(),
      'x-region': z.string().optional(),
    }),
  }),
  CacheMiddleware.cache(CacheConfigs.productList),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset, ...filters } = req.query;
    const language = req.headers['accept-language'] || 'en';
    const currency = req.headers['x-currency'] || 'INR';
    const region = req.headers['x-region'] || 'IN';

    // Mock data - in real implementation, this would query the database
    const mockProducts: Product[] = [
      {
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
      // Add more mock products...
    ];

    const total = mockProducts.length;
    const startIndex = offset || (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = mockProducts.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<Product>> = {
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
 * /api/v1/products/{slug}:
 *   get:
 *     summary: Get product by slug
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Product slug
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *       - in: header
 *         name: X-Currency
 *         schema:
 *           type: string
 *           default: INR
 *         description: Currency preference
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       404:
 *         description: Product not found
 */
router.get(
  '/:slug',
  ValidationMiddleware.validate({
    params: CommonSchemas.slugParam,
    headers: z.object({
      'accept-language': z.string().optional(),
      'x-currency': z.string().optional(),
    }),
  }),
  CacheMiddleware.cache(CacheConfigs.productDetail),
  asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;
    const language = req.headers['accept-language'] || 'en';
    const currency = req.headers['x-currency'] || 'INR';

    // Mock data - in real implementation, this would query the database
    const mockProduct: Product = {
      id: '1',
      slug,
      name: { en: 'Premium Turmeric Powder', hi: 'प्रीमियम हल्दी पाउडर' },
      description: { 
        en: 'High-quality turmeric powder with excellent color and aroma. Perfect for cooking and health benefits.',
        hi: 'उत्कृष्ट रंग और सुगंध के साथ उच्च गुणवत्ता वाला हल्दी पाउडर। खाना पकाने और स्वास्थ्य लाभ के लिए बिल्कुल सही।'
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
      variants: [
        {
          id: '1',
          productId: '1',
          name: '50g',
          weight: 50,
          unit: 'g',
          price: 149,
          sku: 'TUR-50G',
          isActive: true,
        },
        {
          id: '2',
          productId: '1',
          name: '200g',
          weight: 200,
          unit: 'g',
          price: 549,
          sku: 'TUR-200G',
          isActive: true,
        },
      ],
      lots: [
        {
          id: '1',
          productId: '1',
          lotNumber: 'LOT001',
          quantity: 50,
          reservedQuantity: 0,
          expiryDate: '2025-12-31',
          batchDate: '2024-01-15',
          isActive: true,
        },
      ],
      certifications: ['organic', 'fssai'],
      tags: ['turmeric', 'spice', 'powder'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<Product> = {
      success: true,
      data: mockProduct,
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
 * /api/v1/products/ids:
 *   get:
 *     summary: Get products by IDs (bulk fetch)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: ids
 *         required: true
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Comma-separated list of product IDs
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *     responses:
 *       200:
 *         description: List of products
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
 *                     $ref: '#/components/schemas/Product'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 */
router.get(
  '/ids',
  ValidationMiddleware.validate({
    query: z.object({
      ids: z.string().transform(str => str.split(',').map(id => id.trim())),
    }),
    headers: z.object({
      'accept-language': z.string().optional(),
    }),
  }),
  CacheMiddleware.cache({
    ttl: 300,
    keyPrefix: 'products:bulk:',
    varyBy: ['accept-language'],
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.query;
    const language = req.headers['accept-language'] || 'en';

    // Mock data - in real implementation, this would query the database
    const mockProducts: Product[] = ids.map((id: string) => ({
      id,
      slug: `product-${id}`,
      name: { en: `Product ${id}`, hi: `उत्पाद ${id}` },
      description: { 
        en: `Description for product ${id}`,
        hi: `उत्पाद ${id} के लिए विवरण`
      },
      shortDescription: { 
        en: `Product ${id}`,
        hi: `उत्पाद ${id}`
      },
      price: 299,
      currency: 'INR',
      category: 'spices',
      inStock: true,
      stockQuantity: 50,
      images: [`https://example.com/product-${id}.jpg`],
      variants: [],
      lots: [],
      certifications: ['organic'],
      tags: ['spice'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const response: ApiResponse<Product[]> = {
      success: true,
      data: mockProducts,
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

