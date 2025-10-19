import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { 
  ValidationMiddleware, 
  CommonSchemas, 
  AdminSchemas 
} from '../../middleware/validation';
import { CacheMiddleware } from '../../middleware/caching';
import { rateLimitConfigs } from '../../middleware/rateLimiter';
import { AuthMiddleware } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';
import { 
  AdminKPI, 
  AuditLog, 
  SystemToggle, 
  CurrencyRate, 
  ApiResponse, 
  PaginatedResponse 
} from '@newhill/shared/types/api';

const router = Router();

// Apply rate limiting
router.use(rateLimitConfigs.admin);

// Require admin authentication for all admin routes
router.use(AuthMiddleware.requireAdmin);

/**
 * @swagger
 * /api/v1/admin/kpi:
 *   get:
 *     summary: Get admin KPIs and metrics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter, year]
 *           default: month
 *         description: Time period for KPIs
 *     responses:
 *       200:
 *         description: Admin KPIs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AdminKPI'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get(
  '/kpi',
  ValidationMiddleware.validate({
    query: z.object({
      period: z.enum(['today', 'week', 'month', 'quarter', 'year']).default('month'),
    }),
  }),
  CacheMiddleware.cache({
    ttl: 300, // 5 minutes
    keyPrefix: 'admin:kpi:',
    varyBy: ['x-admin-user'],
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { period } = req.query;

    // Mock KPI data - in real implementation, this would query the database
    const mockKPI: AdminKPI = {
      revenue: {
        total: 1250000,
        today: 15000,
        thisMonth: 125000,
        lastMonth: 110000,
        growth: 13.6,
      },
      orders: {
        total: 2500,
        pending: 45,
        processing: 120,
        shipped: 180,
        delivered: 2100,
        cancelled: 55,
      },
      products: {
        total: 150,
        active: 140,
        outOfStock: 8,
        lowStock: 12,
      },
      customers: {
        total: 1200,
        new: 85,
        active: 950,
        b2b: 45,
      },
      averageOrderValue: 500,
      conversionRate: 3.2,
    };

    const response: ApiResponse<AdminKPI> = {
      success: true,
      data: mockKPI,
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
 * /api/v1/admin/products:
 *   get:
 *     summary: Get all products (admin view)
 *     tags: [Admin]
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
 *           enum: [active, inactive, all]
 *           default: all
 *         description: Filter by product status
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
 *                   allOf:
 *                     - $ref: '#/components/schemas/PaginatedResponse'
 *                     - type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Product'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get(
  '/products',
  ValidationMiddleware.validate({
    query: CommonSchemas.pagination.merge(z.object({
      status: z.enum(['active', 'inactive', 'all']).default('all'),
    })),
  }),
  CacheMiddleware.cache({
    ttl: 60, // 1 minute
    keyPrefix: 'admin:products:',
    varyBy: ['x-admin-user'],
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset, status } = req.query;

    // Mock products data - in real implementation, this would query the database
    const mockProducts = [
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
    ];

    const total = mockProducts.length;
    const startIndex = offset || (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = mockProducts.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<any>> = {
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
 * /api/v1/admin/products:
 *   post:
 *     summary: Create new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductCreate'
 *     responses:
 *       200:
 *         description: Product created
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
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post(
  '/products',
  ValidationMiddleware.validateBody(AdminSchemas.toggle), // Using toggle schema as placeholder
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    // Mock product creation - in real implementation, this would:
    // 1. Validate product data
    // 2. Create product in database
    // 3. Log audit trail
    // 4. Invalidate caches

    const mockProduct = {
      id: 'new-product-id',
      slug: 'new-product-slug',
      name: { en: 'New Product' },
      description: { en: 'New product description' },
      price: 299,
      currency: 'INR',
      category: 'spices',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<any> = {
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
 * /api/v1/admin/toggles:
 *   get:
 *     summary: Get system toggles
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System toggles
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
 *                     $ref: '#/components/schemas/SystemToggle'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get(
  '/toggles',
  CacheMiddleware.cache({
    ttl: 60, // 1 minute
    keyPrefix: 'admin:toggles:',
  }),
  asyncHandler(async (req: Request, res: Response) => {
    // Mock toggles data - in real implementation, this would query the database
    const mockToggles: SystemToggle[] = [
      {
        id: 'toggle-1',
        key: 'multiLang',
        value: true,
        description: 'Enable multi-language support',
        category: 'features',
        updatedBy: 'admin-1',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'toggle-2',
        key: 'multiCurrency',
        value: true,
        description: 'Enable multi-currency support',
        category: 'features',
        updatedBy: 'admin-1',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'toggle-3',
        key: 'enableB2B',
        value: true,
        description: 'Enable B2B features',
        category: 'business',
        updatedBy: 'admin-1',
        updatedAt: new Date().toISOString(),
      },
    ];

    const response: ApiResponse<SystemToggle[]> = {
      success: true,
      data: mockToggles,
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
 * /api/v1/admin/toggles:
 *   post:
 *     summary: Update system toggle
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SystemToggle'
 *     responses:
 *       200:
 *         description: Toggle updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemToggle'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.post(
  '/toggles',
  ValidationMiddleware.validateBody(AdminSchemas.toggle),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { key, value, description, category } = req.body;

    // Mock toggle update - in real implementation, this would:
    // 1. Update toggle in database
    // 2. Log audit trail
    // 3. Invalidate caches
    // 4. Notify other services

    const mockToggle: SystemToggle = {
      id: 'toggle-updated',
      key,
      value,
      description: description || '',
      category: category || 'general',
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse<SystemToggle> = {
      success: true,
      data: mockToggle,
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
 * /api/v1/admin/currency:
 *   get:
 *     summary: Get currency rates
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Currency rates
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
 *                     $ref: '#/components/schemas/CurrencyRate'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get(
  '/currency',
  CacheMiddleware.cache({
    ttl: 300, // 5 minutes
    keyPrefix: 'admin:currency:',
  }),
  asyncHandler(async (req: Request, res: Response) => {
    // Mock currency rates - in real implementation, this would query the database
    const mockRates: CurrencyRate[] = [
      {
        id: 'rate-1',
        from: 'USD',
        to: 'INR',
        rate: 83.25,
        source: 'api.exchangerate.com',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rate-2',
        from: 'EUR',
        to: 'INR',
        rate: 91.50,
        source: 'api.exchangerate.com',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rate-3',
        from: 'GBP',
        to: 'INR',
        rate: 105.75,
        source: 'api.exchangerate.com',
        updatedAt: new Date().toISOString(),
      },
    ];

    const response: ApiResponse<CurrencyRate[]> = {
      success: true,
      data: mockRates,
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
 * /api/v1/admin/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Admin]
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
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter by action
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filter by entity
 *     responses:
 *       200:
 *         description: Audit logs
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
 *                             $ref: '#/components/schemas/AuditLog'
 *                 meta:
 *                   $ref: '#/components/schemas/ApiMeta'
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin access required
 */
router.get(
  '/audit-logs',
  ValidationMiddleware.validate({
    query: CommonSchemas.pagination.merge(AdminSchemas.auditLogFilters),
  }),
  CacheMiddleware.cache({
    ttl: 60, // 1 minute
    keyPrefix: 'admin:audit-logs:',
    varyBy: ['x-admin-user'],
  }),
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, offset, userId, action, entity } = req.query;

    // Mock audit logs - in real implementation, this would query the database
    const mockAuditLogs: AuditLog[] = [
      {
        id: 'audit-1',
        userId: 'user-1',
        action: 'CREATE',
        entity: 'Product',
        entityId: 'product-1',
        changes: { name: 'New Product' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'audit-2',
        userId: 'user-2',
        action: 'UPDATE',
        entity: 'Order',
        entityId: 'order-1',
        changes: { status: 'shipped' },
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0...',
        createdAt: new Date().toISOString(),
      },
    ];

    const total = mockAuditLogs.length;
    const startIndex = offset || (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = mockAuditLogs.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<AuditLog>> = {
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

export default router;

