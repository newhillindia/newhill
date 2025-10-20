"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHIPPING_METHODS = exports.ShippingWebhookSchema = exports.ShippingRequestSchema = exports.ShippingTimeoutError = exports.ShippingProviderError = exports.ShippingValidationError = exports.ShippingError = void 0;
const zod_1 = require("zod");
// Error Types
class ShippingError extends Error {
    constructor(code, message, provider, details) {
        super(message);
        this.code = code;
        this.provider = provider;
        this.details = details;
        this.name = 'ShippingError';
    }
}
exports.ShippingError = ShippingError;
class ShippingValidationError extends ShippingError {
    constructor(message, details) {
        super('VALIDATION_ERROR', message, undefined, details);
    }
}
exports.ShippingValidationError = ShippingValidationError;
class ShippingProviderError extends ShippingError {
    constructor(provider, message, details) {
        super('PROVIDER_ERROR', message, provider, details);
    }
}
exports.ShippingProviderError = ShippingProviderError;
class ShippingTimeoutError extends ShippingError {
    constructor(provider, timeout) {
        super('TIMEOUT_ERROR', `Shipping request timed out after ${timeout}ms`, provider);
    }
}
exports.ShippingTimeoutError = ShippingTimeoutError;
// Validation Schemas
exports.ShippingRequestSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(1),
        sku: zod_1.z.string().optional(),
        quantity: zod_1.z.number().positive(),
        weight: zod_1.z.number().positive(),
        value: zod_1.z.number().positive(),
        description: zod_1.z.string().optional(),
    })),
    origin: zod_1.z.object({
        name: zod_1.z.string().min(1),
        company: zod_1.z.string().optional(),
        address1: zod_1.z.string().min(1),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1),
        state: zod_1.z.string().min(1),
        country: zod_1.z.string().length(2),
        postalCode: zod_1.z.string().min(1),
        phone: zod_1.z.string().min(1),
        email: zod_1.z.string().email().optional(),
    }),
    destination: zod_1.z.object({
        name: zod_1.z.string().min(1),
        company: zod_1.z.string().optional(),
        address1: zod_1.z.string().min(1),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1),
        state: zod_1.z.string().min(1),
        country: zod_1.z.string().length(2),
        postalCode: zod_1.z.string().min(1),
        phone: zod_1.z.string().min(1),
        email: zod_1.z.string().email().optional(),
    }),
    method: zod_1.z.enum(['standard', 'express', 'overnight', 'economy', 'priority']),
    weight: zod_1.z.number().positive(),
    dimensions: zod_1.z.object({
        length: zod_1.z.number().positive(),
        width: zod_1.z.number().positive(),
        height: zod_1.z.number().positive(),
    }),
    value: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3),
    instructions: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.ShippingWebhookSchema = zod_1.z.object({
    id: zod_1.z.string(),
    provider: zod_1.z.enum(['shiprocket', 'gcc_logistics', 'aramex', 'dhl', 'blue_dart']),
    event: zod_1.z.string(),
    data: zod_1.z.any(),
    signature: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    processed: zod_1.z.boolean().default(false),
    retryCount: zod_1.z.number().default(0),
});
// Shipping Methods Configuration
exports.SHIPPING_METHODS = {
    standard: {
        name: 'Standard Shipping',
        description: '5-7 business days',
        estimatedDays: 6,
        isAvailable: true,
    },
    express: {
        name: 'Express Shipping',
        description: '2-3 business days',
        estimatedDays: 3,
        isAvailable: true,
    },
    overnight: {
        name: 'Overnight Shipping',
        description: 'Next business day',
        estimatedDays: 1,
        isAvailable: true,
    },
    economy: {
        name: 'Economy Shipping',
        description: '7-10 business days',
        estimatedDays: 9,
        isAvailable: true,
    },
    priority: {
        name: 'Priority Shipping',
        description: '1-2 business days',
        estimatedDays: 2,
        isAvailable: true,
    },
};
