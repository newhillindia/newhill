"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGION_CONFIGS = exports.PaymentWebhookSchema = exports.PaymentRequestSchema = exports.PaymentTimeoutError = exports.PaymentProviderError = exports.PaymentValidationError = exports.PaymentError = void 0;
const zod_1 = require("zod");
// Error Types
class PaymentError extends Error {
    constructor(code, message, provider, details) {
        super(message);
        this.code = code;
        this.provider = provider;
        this.details = details;
        this.name = 'PaymentError';
    }
}
exports.PaymentError = PaymentError;
class PaymentValidationError extends PaymentError {
    constructor(message, details) {
        super('VALIDATION_ERROR', message, undefined, details);
    }
}
exports.PaymentValidationError = PaymentValidationError;
class PaymentProviderError extends PaymentError {
    constructor(provider, message, details) {
        super('PROVIDER_ERROR', message, provider, details);
    }
}
exports.PaymentProviderError = PaymentProviderError;
class PaymentTimeoutError extends PaymentError {
    constructor(provider, timeout) {
        super('TIMEOUT_ERROR', `Payment request timed out after ${timeout}ms`, provider);
    }
}
exports.PaymentTimeoutError = PaymentTimeoutError;
// Validation Schemas
exports.PaymentRequestSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    currency: zod_1.z.string().length(3),
    customer: zod_1.z.object({
        id: zod_1.z.string().uuid(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        name: zod_1.z.string().min(1),
    }),
    billingAddress: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        company: zod_1.z.string().optional(),
        address1: zod_1.z.string().min(1),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1),
        state: zod_1.z.string().min(1),
        country: zod_1.z.string().length(2),
        postalCode: zod_1.z.string().min(1),
        phone: zod_1.z.string().optional(),
    }),
    shippingAddress: zod_1.z.object({
        firstName: zod_1.z.string().min(1),
        lastName: zod_1.z.string().min(1),
        company: zod_1.z.string().optional(),
        address1: zod_1.z.string().min(1),
        address2: zod_1.z.string().optional(),
        city: zod_1.z.string().min(1),
        state: zod_1.z.string().min(1),
        country: zod_1.z.string().length(2),
        postalCode: zod_1.z.string().min(1),
        phone: zod_1.z.string().optional(),
    }),
    items: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(1),
        description: zod_1.z.string().optional(),
        quantity: zod_1.z.number().positive(),
        unitPrice: zod_1.z.number().positive(),
        totalPrice: zod_1.z.number().positive(),
        sku: zod_1.z.string().optional(),
    })),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    idempotencyKey: zod_1.z.string().uuid(),
});
exports.PaymentWebhookSchema = zod_1.z.object({
    id: zod_1.z.string(),
    provider: zod_1.z.enum(['razorpay', 'dibsy', 'telr', 'moyasar', 'oman_net']),
    event: zod_1.z.string(),
    data: zod_1.z.any(),
    signature: zod_1.z.string(),
    timestamp: zod_1.z.string(),
    processed: zod_1.z.boolean().default(false),
    retryCount: zod_1.z.number().default(0),
});
// Region Configuration
exports.REGION_CONFIGS = {
    'IN': {
        code: 'IN',
        name: 'India',
        currency: 'INR',
        paymentProvider: 'razorpay',
        shippingProvider: 'shiprocket',
        isActive: true,
    },
    'QA': {
        code: 'QA',
        name: 'Qatar',
        currency: 'QAR',
        paymentProvider: 'dibsy',
        shippingProvider: 'gcc_logistics',
        isActive: true,
    },
    'AE': {
        code: 'AE',
        name: 'UAE',
        currency: 'AED',
        paymentProvider: 'telr',
        shippingProvider: 'gcc_logistics',
        isActive: true,
    },
    'SA': {
        code: 'SA',
        name: 'Saudi Arabia',
        currency: 'SAR',
        paymentProvider: 'moyasar',
        shippingProvider: 'gcc_logistics',
        isActive: true,
    },
    'OM': {
        code: 'OM',
        name: 'Oman',
        currency: 'OMR',
        paymentProvider: 'oman_net',
        shippingProvider: 'gcc_logistics',
        isActive: true,
    },
};
