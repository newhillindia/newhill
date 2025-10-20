"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.RateLimitError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApiError = exports.CheckoutSchema = exports.CartItemSchema = exports.SearchSchema = exports.ProductFiltersSchema = exports.PaginationSchema = void 0;
const zod_1 = require("zod");
// Validation Schemas
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    offset: zod_1.z.number().min(0).optional(),
});
exports.ProductFiltersSchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    subcategory: zod_1.z.string().optional(),
    priceMin: zod_1.z.number().min(0).optional(),
    priceMax: zod_1.z.number().min(0).optional(),
    weight: zod_1.z.number().min(0).optional(),
    region: zod_1.z.string().optional(),
    currency: zod_1.z.string().optional(),
    inStock: zod_1.z.boolean().optional(),
    certification: zod_1.z.string().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    sortBy: zod_1.z.enum(['name', 'price', 'createdAt', 'popularity']).default('createdAt'),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
exports.SearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(100),
    filters: exports.ProductFiltersSchema.optional(),
    language: zod_1.z.string().default('en'),
    region: zod_1.z.string().default('IN'),
    currency: zod_1.z.string().default('INR'),
});
exports.CartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    variantId: zod_1.z.string().uuid().optional(),
    quantity: zod_1.z.number().min(1).max(100),
});
exports.CheckoutSchema = zod_1.z.object({
    items: zod_1.z.array(exports.CartItemSchema),
    shippingAddress: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        company: zod_1.z.string().optional(),
        address1: zod_1.z.string().min(1),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1),
        state: zod_1.z.string().min(1),
        postalCode: zod_1.z.string().min(1),
        country: zod_1.z.string().min(1),
        phone: zod_1.z.string().optional(),
    }),
    billingAddress: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        company: zod_1.z.string().optional(),
        address1: zod_1.z.string().min(1),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1),
        state: zod_1.z.string().min(1),
        postalCode: zod_1.z.string().min(1),
        country: zod_1.z.string().min(1),
        phone: zod_1.z.string().optional(),
    }),
    paymentMethod: zod_1.z.object({
        type: zod_1.z.enum(['card', 'upi', 'netbanking', 'wallet', 'cod']),
        provider: zod_1.z.enum(['stripe', 'razorpay', 'paypal']),
        token: zod_1.z.string().optional(),
    }),
    shippingMethod: zod_1.z.string().uuid(),
    notes: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().uuid(),
});
// Error Types
class ApiError extends Error {
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
class ValidationError extends ApiError {
    constructor(message, details) {
        super(400, 'VALIDATION_ERROR', message, details);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication required') {
        super(401, 'AUTHENTICATION_ERROR', message);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends ApiError {
    constructor(message = 'Insufficient permissions') {
        super(403, 'AUTHORIZATION_ERROR', message);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends ApiError {
    constructor(resource = 'Resource') {
        super(404, 'NOT_FOUND', `${resource} not found`);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApiError {
    constructor(message) {
        super(409, 'CONFLICT', message);
    }
}
exports.ConflictError = ConflictError;
class RateLimitError extends ApiError {
    constructor(message = 'Rate limit exceeded') {
        super(429, 'RATE_LIMIT_EXCEEDED', message);
    }
}
exports.RateLimitError = RateLimitError;
class InternalServerError extends ApiError {
    constructor(message = 'Internal server error') {
        super(500, 'INTERNAL_SERVER_ERROR', message);
    }
}
exports.InternalServerError = InternalServerError;
