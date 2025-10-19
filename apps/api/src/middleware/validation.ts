import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@newhill/shared/types/api';

/**
 * Validation middleware factory
 */
export class ValidationMiddleware {
  /**
   * Validate request body
   */
  static validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          throw new ValidationError('Validation failed', details);
        }
        next(error);
      }
    };
  };

  /**
   * Validate request query parameters
   */
  static validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.query = schema.parse(req.query);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          throw new ValidationError('Query validation failed', details);
        }
        next(error);
      }
    };
  };

  /**
   * Validate request parameters
   */
  static validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.params = schema.parse(req.params);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          throw new ValidationError('Parameter validation failed', details);
        }
        next(error);
      }
    };
  };

  /**
   * Validate request headers
   */
  static validateHeaders = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.headers = schema.parse(req.headers);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          throw new ValidationError('Header validation failed', details);
        }
        next(error);
      }
    };
  };

  /**
   * Validate multiple parts of the request
   */
  static validate = (schemas: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
  }) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (schemas.body) {
          req.body = schemas.body.parse(req.body);
        }
        if (schemas.query) {
          req.query = schemas.query.parse(req.query);
        }
        if (schemas.params) {
          req.params = schemas.params.parse(req.params);
        }
        if (schemas.headers) {
          req.headers = schemas.headers.parse(req.headers);
        }
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const details = error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          }));
          throw new ValidationError('Validation failed', details);
        }
        next(error);
      }
    };
  };
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Pagination schema
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    offset: z.coerce.number().min(0).optional(),
  }),

  // UUID parameter schema
  uuidParam: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),

  // Slug parameter schema
  slugParam: z.object({
    slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  }),

  // Language header schema
  languageHeader: z.object({
    'accept-language': z.string().optional(),
    'content-language': z.string().optional(),
  }),

  // Currency header schema
  currencyHeader: z.object({
    'x-currency': z.string().length(3).optional(),
  }),

  // Region header schema
  regionHeader: z.object({
    'x-region': z.string().length(2).optional(),
  }),

  // API version header schema
  apiVersionHeader: z.object({
    'x-api-version': z.string().regex(/^v\d+$/).optional(),
  }),

  // Idempotency key header schema
  idempotencyKeyHeader: z.object({
    'idempotency-key': z.string().uuid('Invalid idempotency key format'),
  }),

  // Content type header schema
  contentTypeHeader: z.object({
    'content-type': z.string().includes('application/json'),
  }),

  // Authorization header schema
  authorizationHeader: z.object({
    authorization: z.string().regex(/^Bearer\s+.+$/, 'Invalid authorization header format'),
  }),

  // API key header schema
  apiKeyHeader: z.object({
    'x-api-key': z.string().min(1),
  }),

  // Trace ID header schema
  traceIdHeader: z.object({
    'x-trace-id': z.string().uuid('Invalid trace ID format').optional(),
  }),

  // Request ID header schema
  requestIdHeader: z.object({
    'x-request-id': z.string().uuid('Invalid request ID format').optional(),
  }),

  // CSRF token header schema
  csrfTokenHeader: z.object({
    'x-csrf-token': z.string().min(1),
  }),

  // User agent header schema
  userAgentHeader: z.object({
    'user-agent': z.string().min(1),
  }),

  // Referer header schema
  refererHeader: z.object({
    referer: z.string().url('Invalid referer URL').optional(),
  }),

  // Origin header schema
  originHeader: z.object({
    origin: z.string().url('Invalid origin URL').optional(),
  }),

  // Host header schema
  hostHeader: z.object({
    host: z.string().min(1),
  }),

  // Accept header schema
  acceptHeader: z.object({
    accept: z.string().min(1),
  }),

  // Cache control header schema
  cacheControlHeader: z.object({
    'cache-control': z.string().optional(),
  }),

  // ETag header schema
  etagHeader: z.object({
    etag: z.string().optional(),
  }),

  // If-None-Match header schema
  ifNoneMatchHeader: z.object({
    'if-none-match': z.string().optional(),
  }),

  // If-Modified-Since header schema
  ifModifiedSinceHeader: z.object({
    'if-modified-since': z.string().datetime().optional(),
  }),

  // Range header schema
  rangeHeader: z.object({
    range: z.string().regex(/^bytes=\d+-\d*$/, 'Invalid range header format').optional(),
  }),

  // Forwarded header schema
  forwardedHeader: z.object({
    forwarded: z.string().optional(),
  }),

  // X-Forwarded-For header schema
  xForwardedForHeader: z.object({
    'x-forwarded-for': z.string().optional(),
  }),

  // X-Forwarded-Proto header schema
  xForwardedProtoHeader: z.object({
    'x-forwarded-proto': z.enum(['http', 'https']).optional(),
  }),

  // X-Real-IP header schema
  xRealIpHeader: z.object({
    'x-real-ip': z.string().ip('Invalid IP address').optional(),
  }),

  // X-Forwarded-Host header schema
  xForwardedHostHeader: z.object({
    'x-forwarded-host': z.string().optional(),
  }),

  // X-Forwarded-Port header schema
  xForwardedPortHeader: z.object({
    'x-forwarded-port': z.string().regex(/^\d+$/, 'Invalid port number').optional(),
  }),
};

/**
 * Product validation schemas
 */
export const ProductSchemas = {
  // Product filters schema
  filters: z.object({
    category: z.string().optional(),
    subcategory: z.string().optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    weight: z.coerce.number().min(0).optional(),
    region: z.string().length(2).optional(),
    currency: z.string().length(3).optional(),
    inStock: z.coerce.boolean().optional(),
    certification: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'popularity']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),

  // Product creation schema
  create: z.object({
    name: z.record(z.string(), z.string()).min(1),
    description: z.record(z.string(), z.string()).min(1),
    shortDescription: z.record(z.string(), z.string()).min(1),
    price: z.number().min(0),
    currency: z.string().length(3),
    category: z.string().min(1),
    subcategory: z.string().optional(),
    weight: z.number().min(0),
    unit: z.enum(['g', 'kg', 'ml', 'l']),
    stockQuantity: z.number().min(0),
    images: z.array(z.string().url()).min(1),
    variants: z.array(z.object({
      name: z.string().min(1),
      weight: z.number().min(0),
      unit: z.string().min(1),
      price: z.number().min(0),
      sku: z.string().min(1),
    })).optional(),
    certifications: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
  }),

  // Product update schema
  update: z.object({
    name: z.record(z.string(), z.string()).optional(),
    description: z.record(z.string(), z.string()).optional(),
    shortDescription: z.record(z.string(), z.string()).optional(),
    price: z.number().min(0).optional(),
    currency: z.string().length(3).optional(),
    category: z.string().min(1).optional(),
    subcategory: z.string().optional(),
    weight: z.number().min(0).optional(),
    unit: z.enum(['g', 'kg', 'ml', 'l']).optional(),
    stockQuantity: z.number().min(0).optional(),
    images: z.array(z.string().url()).optional(),
    variants: z.array(z.object({
      id: z.string().uuid().optional(),
      name: z.string().min(1),
      weight: z.number().min(0),
      unit: z.string().min(1),
      price: z.number().min(0),
      sku: z.string().min(1),
      isActive: z.boolean().optional(),
    })).optional(),
    certifications: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
};

/**
 * Cart validation schemas
 */
export const CartSchemas = {
  // Cart item schema
  item: z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional(),
    quantity: z.number().min(1).max(100),
  }),

  // Cart update schema
  update: z.object({
    items: z.array(z.object({
      id: z.string().uuid().optional(),
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional(),
      quantity: z.number().min(1).max(100),
    })),
  }),

  // Cart merge schema
  merge: z.object({
    guestCartId: z.string().uuid(),
  }),
};

/**
 * Order validation schemas
 */
export const OrderSchemas = {
  // Checkout schema
  checkout: z.object({
    items: z.array(z.object({
      productId: z.string().uuid(),
      variantId: z.string().uuid().optional(),
      quantity: z.number().min(1).max(100),
    })).min(1),
    shippingAddress: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      company: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().length(2),
      phone: z.string().optional(),
    }),
    billingAddress: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      company: z.string().optional(),
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().length(2),
      phone: z.string().optional(),
    }),
    paymentMethod: z.object({
      type: z.enum(['card', 'upi', 'netbanking', 'wallet', 'cod']),
      provider: z.enum(['stripe', 'razorpay', 'paypal']),
      token: z.string().optional(),
    }),
    shippingMethod: z.string().uuid(),
    notes: z.string().optional(),
    idempotencyKey: z.string().uuid(),
  }),

  // Order status update schema
  statusUpdate: z.object({
    status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
    trackingNumber: z.string().optional(),
    notes: z.string().optional(),
  }),
};

/**
 * Search validation schemas
 */
export const SearchSchemas = {
  // Search query schema
  query: z.object({
    q: z.string().min(1).max(100),
    filters: ProductSchemas.filters.optional(),
    language: z.string().length(2).default('en'),
    region: z.string().length(2).default('IN'),
    currency: z.string().length(3).default('INR'),
  }),
};

/**
 * Admin validation schemas
 */
export const AdminSchemas = {
  // System toggle schema
  toggle: z.object({
    key: z.string().min(1),
    value: z.boolean(),
    description: z.string().optional(),
    category: z.string().optional(),
  }),

  // Currency rate schema
  currencyRate: z.object({
    from: z.string().length(3),
    to: z.string().length(3),
    rate: z.number().min(0),
    source: z.string().min(1),
  }),

  // Audit log filters schema
  auditLogFilters: z.object({
    userId: z.string().uuid().optional(),
    action: z.string().optional(),
    entity: z.string().optional(),
    entityId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
};

/**
 * Webhook validation schemas
 */
export const WebhookSchemas = {
  // Webhook event schema
  event: z.object({
    id: z.string().uuid(),
    type: z.string().min(1),
    data: z.any(),
    signature: z.string().min(1),
    timestamp: z.string().datetime(),
  }),

  // Payment webhook schema
  paymentWebhook: z.object({
    id: z.string(),
    type: z.string(),
    data: z.object({
      object: z.any(),
    }),
    created: z.number(),
  }),

  // Shipping webhook schema
  shippingWebhook: z.object({
    orderId: z.string().uuid(),
    trackingNumber: z.string().min(1),
    status: z.string().min(1),
    carrier: z.string().min(1),
    estimatedDelivery: z.string().datetime().optional(),
  }),
};

