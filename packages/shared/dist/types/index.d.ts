export * from './api';
export type { PaymentProvider, RegionConfig, PaymentRequest, PaymentItem, PaymentResponse, PaymentWebhook, PaymentAdapter, PaymentConfig, } from './payment';
export { PaymentError, PaymentValidationError, PaymentProviderError, PaymentTimeoutError, PaymentRequestSchema, PaymentWebhookSchema, } from './payment';
export type { ShippingProvider, ShipmentStatus, ShippingRequest, ShippingItem, ShippingAddress, ShippingResponse, ShippingUpdate, ShippingWebhook, ShippingConnector, ShippingRate, ShippingConfig, } from './shipping';
export { ShippingError, ShippingValidationError, ShippingProviderError, ShippingTimeoutError, ShippingRequestSchema, ShippingWebhookSchema, SHIPPING_METHODS, } from './shipping';
export interface LegacyProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    inStock: boolean;
    imageUrl: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface LegacyUser {
    id: number;
    email: string;
    name: string;
    role: 'admin' | 'customer';
    createdAt: string;
    updatedAt?: string;
}
export interface LegacyOrder {
    id: string;
    userId: number;
    products: LegacyOrderItem[];
    total: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    updatedAt?: string;
}
export interface LegacyOrderItem {
    productId: number;
    quantity: number;
    price: number;
}
export interface LegacyApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
    };
}
export interface LegacyPaginationParams {
    page: number;
    limit: number;
    total: number;
    pages: number;
}
export interface LegacyPaginatedResponse<T> {
    items: T[];
    pagination: LegacyPaginationParams;
}
