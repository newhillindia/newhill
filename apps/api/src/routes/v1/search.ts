import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  ValidationMiddleware, 
  SearchSchemas 
} from '../../middleware/validation';
import { CacheMiddleware, CacheConfigs } from '../../middleware/caching';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../middleware/errorHandler';
import { SearchResult, Product, ApiResponse } from '@newhill/shared/types/api';

const router = Router();

// Apply strict rate limiting for search
router.use(rateLimitConfigs.search);

/**
 * @swagger
 * /api/v1/search:
 *   post:
 *     summary: Search products with full-text search
 *     tags: [Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - q
 *             properties:
 *               q:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Search query
 *               filters:
 *                 type: object
 *                 properties:
 *                   category:
 *                     type: string
 *                   priceMin:
 *                     type: number
 *                     minimum: 0
 *                   priceMax:
 *                     type: number
 *                     minimum: 0
 *                   inStock:
 *                     type: boolean
 *                   certification:
 *                     type: string
 *                   tags:
 *                     type: array
 *                     items:
 *                       type: string
 *               language:
 *                 type: string
 *                 default: en
 *               region:
 *                 type: string
 *                 default: IN
 *               currency:
 *                 type: string
 *                 default: INR
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SearchResult'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid search query
 *       429:
 *         description: Rate limit exceeded
 */
router.post(
  '/',
  ValidationMiddleware.validateBody(SearchSchemas.query),
  CacheMiddleware.cache(CacheConfigs.searchResults),
  asyncHandler(async (req: Request, res: Response) => {
    const { q: query, filters, language, region, currency } = req.body;

    // Mock search results - in real implementation, this would use Elasticsearch or similar
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
      {
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
    ];

    // Mock search suggestions
    const suggestions = [
      'turmeric powder',
      'cumin seeds',
      'coriander powder',
      'garam masala',
      'red chili powder',
    ];

    // Mock "did you mean" suggestions
    const didYouMean = query.toLowerCase().includes('tumeric') ? ['turmeric'] : undefined;

    // Mock filter options
    const filterOptions = {
      categories: [
        { name: 'Spices', count: 25 },
        { name: 'Herbs', count: 15 },
        { name: 'Seasonings', count: 10 },
      ],
      priceRange: { min: 99, max: 999 },
      certifications: [
        { name: 'Organic', count: 20 },
        { name: 'FSSAI', count: 35 },
        { name: 'ISO', count: 15 },
      ],
    };

    const searchResult: SearchResult = {
      products: mockProducts,
      suggestions,
      didYouMean,
      filters: filterOptions,
    };

    const response: ApiResponse<SearchResult> = {
      success: true,
      data: searchResult,
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
 * /api/v1/search/suggestions:
 *   get:
 *     summary: Get search suggestions
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         description: Partial search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Maximum number of suggestions
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *     responses:
 *       200:
 *         description: Search suggestions
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
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 */
router.get(
  '/suggestions',
  ValidationMiddleware.validate({
    query: z.object({
      q: z.string().min(1).max(50),
      limit: z.coerce.number().min(1).max(20).default(10),
    }),
    headers: z.object({
      'accept-language': z.string().optional(),
    }),
  }),
  CacheMiddleware.cache({
    ttl: 600, // 10 minutes
    keyPrefix: 'search:suggestions:',
    varyBy: ['accept-language'],
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { q: query, limit } = req.query;
    const language = req.headers['accept-language'] || 'en';

    // Mock suggestions - in real implementation, this would query a search index
    const allSuggestions = [
      'turmeric powder',
      'cumin seeds',
      'coriander powder',
      'garam masala',
      'red chili powder',
      'black pepper',
      'cardamom',
      'cinnamon',
      'cloves',
      'bay leaves',
      'fenugreek seeds',
      'mustard seeds',
      'fennel seeds',
      'star anise',
      'nutmeg',
    ];

    const suggestions = allSuggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, Number(limit));

    const response: ApiResponse<{ suggestions: string[] }> = {
      success: true,
      data: { suggestions },
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
 * /api/v1/search/popular:
 *   get:
 *     summary: Get popular search terms
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: Maximum number of popular terms
 *       - in: header
 *         name: Accept-Language
 *         schema:
 *           type: string
 *           default: en
 *         description: Language preference
 *     responses:
 *       200:
 *         description: Popular search terms
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
 *                     popular:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           term:
 *                             type: string
 *                           count:
 *                             type: integer
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 */
router.get(
  '/popular',
  ValidationMiddleware.validate({
    query: z.object({
      limit: z.coerce.number().min(1).max(50).default(20),
    }),
    headers: z.object({
      'accept-language': z.string().optional(),
    }),
  }),
  CacheMiddleware.cache({
    ttl: 1800, // 30 minutes
    keyPrefix: 'search:popular:',
    varyBy: ['accept-language'],
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { limit } = req.query;
    const language = req.headers['accept-language'] || 'en';

    // Mock popular search terms - in real implementation, this would come from analytics
    const popularTerms = [
      { term: 'turmeric powder', count: 1250 },
      { term: 'cumin seeds', count: 980 },
      { term: 'garam masala', count: 850 },
      { term: 'coriander powder', count: 720 },
      { term: 'red chili powder', count: 650 },
      { term: 'black pepper', count: 580 },
      { term: 'cardamom', count: 520 },
      { term: 'cinnamon', count: 480 },
      { term: 'cloves', count: 420 },
      { term: 'bay leaves', count: 380 },
    ].slice(0, Number(limit));

    const response: ApiResponse<{ popular: Array<{ term: string; count: number }> }> = {
      success: true,
      data: { popular: popularTerms },
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

