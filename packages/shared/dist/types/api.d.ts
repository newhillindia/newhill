import { z } from 'zod';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        status: number;
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        traceId: string;
        timestamp: string;
        version: string;
    };
}
export interface PaginationMeta {
    total: number;
    limit: number;
    offset: number;
    page: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedResponse<T> {
    items: T[];
    pagination: PaginationMeta;
}
export type UserRole = 'consumer' | 'b2b' | 'admin';
export type Permission = 'read' | 'write' | 'delete' | 'admin';
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    permissions: Permission[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    preferences: {
        language: string;
        currency: string;
        region: string;
    };
}
export interface Product {
    id: string;
    slug: string;
    name: Record<string, string>;
    description: Record<string, string>;
    shortDescription: Record<string, string>;
    price: number;
    currency: string;
    category: string;
    subcategory?: string;
    weight: number;
    unit: 'g' | 'kg' | 'ml' | 'l';
    inStock: boolean;
    stockQuantity: number;
    images: string[];
    variants: ProductVariant[];
    lots: ProductLot[];
    certifications: string[];
    tags: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}
export interface ProductVariant {
    id: string;
    productId: string;
    name: string;
    weight: number;
    unit: string;
    price: number;
    sku: string;
    isActive: boolean;
}
export interface ProductLot {
    id: string;
    productId: string;
    lotNumber: string;
    quantity: number;
    reservedQuantity: number;
    expiryDate: string;
    batchDate: string;
    isActive: boolean;
    metadata?: Record<string, any>;
}
export interface CartItem {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    addedAt: string;
}
export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
}
export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
    currency: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: PaymentMethod;
    shippingMethod: ShippingMethod;
    trackingNumber?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    shippedAt?: string;
    deliveredAt?: string;
}
export interface OrderItem {
    id: string;
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    total: number;
    productSnapshot: Partial<Product>;
}
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
export interface Address {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault: boolean;
}
export interface PaymentMethod {
    id: string;
    type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
    provider: 'stripe' | 'razorpay' | 'paypal';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
}
export interface ShippingMethod {
    id: string;
    name: string;
    description: string;
    cost: number;
    estimatedDays: number;
    isActive: boolean;
}
export interface WishlistItem {
    id: string;
    userId: string;
    productId: string;
    addedAt: string;
    product: Product;
}
export interface SearchFilters {
    query?: string;
    category?: string;
    subcategory?: string;
    priceMin?: number;
    priceMax?: number;
    weight?: number;
    region?: string;
    currency?: string;
    inStock?: boolean;
    certification?: string;
    tags?: string[];
    sortBy?: 'name' | 'price' | 'createdAt' | 'popularity';
    order?: 'asc' | 'desc';
}
export interface SearchResult {
    products: Product[];
    suggestions: string[];
    didYouMean?: string[];
    filters: {
        categories: Array<{
            name: string;
            count: number;
        }>;
        priceRange: {
            min: number;
            max: number;
        };
        certifications: Array<{
            name: string;
            count: number;
        }>;
    };
}
export interface AdminKPI {
    revenue: {
        total: number;
        today: number;
        thisMonth: number;
        lastMonth: number;
        growth: number;
    };
    orders: {
        total: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    products: {
        total: number;
        active: number;
        outOfStock: number;
        lowStock: number;
    };
    customers: {
        total: number;
        new: number;
        active: number;
        b2b: number;
    };
    averageOrderValue: number;
    conversionRate: number;
}
export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    entity: string;
    entityId: string;
    changes: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}
export interface SystemToggle {
    id: string;
    key: string;
    value: boolean;
    description: string;
    category: string;
    updatedBy: string;
    updatedAt: string;
}
export interface CurrencyRate {
    id: string;
    from: string;
    to: string;
    rate: number;
    source: string;
    updatedAt: string;
}
export interface WebhookEvent {
    id: string;
    type: string;
    data: any;
    signature: string;
    timestamp: string;
    processed: boolean;
    retryCount: number;
}
export declare const PaginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    offset?: number | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export declare const ProductFiltersSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodString>;
    subcategory: z.ZodOptional<z.ZodString>;
    priceMin: z.ZodOptional<z.ZodNumber>;
    priceMax: z.ZodOptional<z.ZodNumber>;
    weight: z.ZodOptional<z.ZodNumber>;
    region: z.ZodOptional<z.ZodString>;
    currency: z.ZodOptional<z.ZodString>;
    inStock: z.ZodOptional<z.ZodBoolean>;
    certification: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "price", "createdAt", "popularity"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    sortBy: "name" | "price" | "createdAt" | "popularity";
    order: "asc" | "desc";
    category?: string | undefined;
    subcategory?: string | undefined;
    priceMin?: number | undefined;
    priceMax?: number | undefined;
    weight?: number | undefined;
    region?: string | undefined;
    currency?: string | undefined;
    inStock?: boolean | undefined;
    certification?: string | undefined;
    tags?: string[] | undefined;
}, {
    category?: string | undefined;
    subcategory?: string | undefined;
    priceMin?: number | undefined;
    priceMax?: number | undefined;
    weight?: number | undefined;
    region?: string | undefined;
    currency?: string | undefined;
    inStock?: boolean | undefined;
    certification?: string | undefined;
    tags?: string[] | undefined;
    sortBy?: "name" | "price" | "createdAt" | "popularity" | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export declare const SearchSchema: z.ZodObject<{
    query: z.ZodString;
    filters: z.ZodOptional<z.ZodObject<{
        category: z.ZodOptional<z.ZodString>;
        subcategory: z.ZodOptional<z.ZodString>;
        priceMin: z.ZodOptional<z.ZodNumber>;
        priceMax: z.ZodOptional<z.ZodNumber>;
        weight: z.ZodOptional<z.ZodNumber>;
        region: z.ZodOptional<z.ZodString>;
        currency: z.ZodOptional<z.ZodString>;
        inStock: z.ZodOptional<z.ZodBoolean>;
        certification: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        sortBy: z.ZodDefault<z.ZodEnum<["name", "price", "createdAt", "popularity"]>>;
        order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        sortBy: "name" | "price" | "createdAt" | "popularity";
        order: "asc" | "desc";
        category?: string | undefined;
        subcategory?: string | undefined;
        priceMin?: number | undefined;
        priceMax?: number | undefined;
        weight?: number | undefined;
        region?: string | undefined;
        currency?: string | undefined;
        inStock?: boolean | undefined;
        certification?: string | undefined;
        tags?: string[] | undefined;
    }, {
        category?: string | undefined;
        subcategory?: string | undefined;
        priceMin?: number | undefined;
        priceMax?: number | undefined;
        weight?: number | undefined;
        region?: string | undefined;
        currency?: string | undefined;
        inStock?: boolean | undefined;
        certification?: string | undefined;
        tags?: string[] | undefined;
        sortBy?: "name" | "price" | "createdAt" | "popularity" | undefined;
        order?: "asc" | "desc" | undefined;
    }>>;
    language: z.ZodDefault<z.ZodString>;
    region: z.ZodDefault<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    region: string;
    currency: string;
    query: string;
    language: string;
    filters?: {
        sortBy: "name" | "price" | "createdAt" | "popularity";
        order: "asc" | "desc";
        category?: string | undefined;
        subcategory?: string | undefined;
        priceMin?: number | undefined;
        priceMax?: number | undefined;
        weight?: number | undefined;
        region?: string | undefined;
        currency?: string | undefined;
        inStock?: boolean | undefined;
        certification?: string | undefined;
        tags?: string[] | undefined;
    } | undefined;
}, {
    query: string;
    region?: string | undefined;
    currency?: string | undefined;
    filters?: {
        category?: string | undefined;
        subcategory?: string | undefined;
        priceMin?: number | undefined;
        priceMax?: number | undefined;
        weight?: number | undefined;
        region?: string | undefined;
        currency?: string | undefined;
        inStock?: boolean | undefined;
        certification?: string | undefined;
        tags?: string[] | undefined;
        sortBy?: "name" | "price" | "createdAt" | "popularity" | undefined;
        order?: "asc" | "desc" | undefined;
    } | undefined;
    language?: string | undefined;
}>;
export declare const CartItemSchema: z.ZodObject<{
    productId: z.ZodString;
    variantId: z.ZodOptional<z.ZodString>;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
    variantId?: string | undefined;
}, {
    productId: string;
    quantity: number;
    variantId?: string | undefined;
}>;
export declare const CheckoutSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
    }, {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
    }>, "many">;
    shippingAddress: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
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
    billingAddress: z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        postalCode: z.ZodString;
        country: z.ZodString;
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
    paymentMethod: z.ZodObject<{
        type: z.ZodEnum<["card", "upi", "netbanking", "wallet", "cod"]>;
        provider: z.ZodEnum<["stripe", "razorpay", "paypal"]>;
        token: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "card" | "upi" | "netbanking" | "wallet" | "cod";
        provider: "stripe" | "razorpay" | "paypal";
        token?: string | undefined;
    }, {
        type: "card" | "upi" | "netbanking" | "wallet" | "cod";
        provider: "stripe" | "razorpay" | "paypal";
        token?: string | undefined;
    }>;
    shippingMethod: z.ZodString;
    notes: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodString;
}, "strip", z.ZodTypeAny, {
    items: {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
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
    paymentMethod: {
        type: "card" | "upi" | "netbanking" | "wallet" | "cod";
        provider: "stripe" | "razorpay" | "paypal";
        token?: string | undefined;
    };
    shippingMethod: string;
    idempotencyKey: string;
    notes?: string | undefined;
}, {
    items: {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
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
    paymentMethod: {
        type: "card" | "upi" | "netbanking" | "wallet" | "cod";
        provider: "stripe" | "razorpay" | "paypal";
        token?: string | undefined;
    };
    shippingMethod: string;
    idempotencyKey: string;
    notes?: string | undefined;
}>;
export declare class ApiError extends Error {
    status: number;
    code: string;
    details?: any;
    constructor(status: number, code: string, message: string, details?: any);
}
export declare class ValidationError extends ApiError {
    constructor(message: string, details?: any);
}
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
export declare class AuthorizationError extends ApiError {
    constructor(message?: string);
}
export declare class NotFoundError extends ApiError {
    constructor(resource?: string);
}
export declare class ConflictError extends ApiError {
    constructor(message: string);
}
export declare class RateLimitError extends ApiError {
    constructor(message?: string);
}
export declare class InternalServerError extends ApiError {
    constructor(message?: string);
}
