import { z } from 'zod';
export type PaymentProvider = 'razorpay' | 'dibsy' | 'telr' | 'moyasar' | 'oman_net';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod' | 'apple_pay' | 'google_pay';
export interface RegionConfig {
    code: string;
    name: string;
    currency: string;
    paymentProvider: PaymentProvider;
    shippingProvider: string;
    isActive: boolean;
}
export interface PaymentRequest {
    orderId: string;
    amount: number;
    currency: string;
    customer: {
        id: string;
        email: string;
        phone?: string;
        name: string;
    };
    billingAddress: Address;
    shippingAddress: Address;
    items: PaymentItem[];
    metadata?: Record<string, any>;
    idempotencyKey: string;
}
export interface PaymentItem {
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    sku?: string;
}
export interface Address {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone?: string;
}
export interface PaymentResponse {
    paymentId: string;
    status: PaymentStatus;
    amount: number;
    currency: string;
    provider: PaymentProvider;
    redirectUrl?: string;
    paymentUrl?: string;
    qrCode?: string;
    expiresAt?: string;
    metadata?: Record<string, any>;
}
export interface PaymentWebhook {
    id: string;
    provider: PaymentProvider;
    event: string;
    data: any;
    signature: string;
    timestamp: string;
    processed: boolean;
    retryCount: number;
}
export interface PaymentAdapter {
    readonly provider: PaymentProvider;
    readonly region: string;
    createPayment(request: PaymentRequest): Promise<PaymentResponse>;
    verifyPayment(paymentId: string, signature?: string): Promise<PaymentResponse>;
    refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse>;
    getPaymentStatus(paymentId: string): Promise<PaymentResponse>;
    validateWebhook(payload: any, signature: string): boolean;
    processWebhook(payload: any): Promise<PaymentWebhook>;
}
export interface PaymentConfig {
    provider: PaymentProvider;
    region: string;
    mode: 'sandbox' | 'live';
    credentials: {
        keyId: string;
        keySecret: string;
        webhookSecret: string;
    };
    settings: {
        timeout: number;
        retryAttempts: number;
        retryDelay: number;
    };
}
export declare class PaymentError extends Error {
    code: string;
    provider?: PaymentProvider | undefined;
    details?: any | undefined;
    constructor(code: string, message: string, provider?: PaymentProvider | undefined, details?: any | undefined);
}
export declare class PaymentValidationError extends PaymentError {
    constructor(message: string, details?: any);
}
export declare class PaymentProviderError extends PaymentError {
    constructor(provider: PaymentProvider, message: string, details?: any);
}
export declare class PaymentTimeoutError extends PaymentError {
    constructor(provider: PaymentProvider, timeout: number);
}
export declare const PaymentRequestSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    customer: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        email: string;
        phone?: string | undefined;
    }, {
        name: string;
        id: string;
        email: string;
        phone?: string | undefined;
    }>;
    billingAddress: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodString;
        postalCode: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>;
    shippingAddress: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodString;
        postalCode: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }, {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
        totalPrice: z.ZodNumber;
        sku: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        quantity: number;
        id: string;
        unitPrice: number;
        totalPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
    }, {
        name: string;
        quantity: number;
        id: string;
        unitPrice: number;
        totalPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
    }>, "many">;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    idempotencyKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currency: string;
    items: {
        name: string;
        quantity: number;
        id: string;
        unitPrice: number;
        totalPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
    }[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    };
    billingAddress: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    };
    idempotencyKey: string;
    orderId: string;
    amount: number;
    customer: {
        name: string;
        id: string;
        email: string;
        phone?: string | undefined;
    };
    metadata?: Record<string, any> | undefined;
}, {
    currency: string;
    items: {
        name: string;
        quantity: number;
        id: string;
        unitPrice: number;
        totalPrice: number;
        description?: string | undefined;
        sku?: string | undefined;
    }[];
    shippingAddress: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    };
    billingAddress: {
        firstName: string;
        lastName: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        company?: string | undefined;
        address2?: string | undefined;
        phone?: string | undefined;
    };
    idempotencyKey: string;
    orderId: string;
    amount: number;
    customer: {
        name: string;
        id: string;
        email: string;
        phone?: string | undefined;
    };
    metadata?: Record<string, any> | undefined;
}>;
export declare const PaymentWebhookSchema: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["razorpay", "dibsy", "telr", "moyasar", "oman_net"]>;
    event: z.ZodString;
    data: z.ZodAny;
    signature: z.ZodString;
    timestamp: z.ZodString;
    processed: z.ZodDefault<z.ZodBoolean>;
    retryCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    provider: "razorpay" | "dibsy" | "telr" | "moyasar" | "oman_net";
    id: string;
    event: string;
    signature: string;
    timestamp: string;
    processed: boolean;
    retryCount: number;
    data?: any;
}, {
    provider: "razorpay" | "dibsy" | "telr" | "moyasar" | "oman_net";
    id: string;
    event: string;
    signature: string;
    timestamp: string;
    data?: any;
    processed?: boolean | undefined;
    retryCount?: number | undefined;
}>;
export declare const REGION_CONFIGS: Record<string, RegionConfig>;
