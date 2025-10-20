import { z } from 'zod';
export type ShippingProvider = 'shiprocket' | 'gcc_logistics' | 'aramex' | 'dhl' | 'blue_dart';
export type ShipmentStatus = 'pending' | 'packed' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'economy' | 'priority';
export interface ShippingRequest {
    orderId: string;
    items: ShippingItem[];
    origin: ShippingAddress;
    destination: ShippingAddress;
    method: ShippingMethod;
    weight: number;
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    value: number;
    currency: string;
    instructions?: string;
    metadata?: Record<string, any>;
}
export interface ShippingItem {
    id: string;
    name: string;
    sku?: string;
    quantity: number;
    weight: number;
    value: number;
    description?: string;
}
export interface ShippingAddress {
    name: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
    email?: string;
}
export interface ShippingResponse {
    shipmentId: string;
    trackingNumber: string;
    status: ShipmentStatus;
    provider: ShippingProvider;
    method: ShippingMethod;
    cost: number;
    currency: string;
    estimatedDelivery: string;
    trackingUrl?: string;
    labelUrl?: string;
    metadata?: Record<string, any>;
}
export interface ShippingUpdate {
    shipmentId: string;
    trackingNumber: string;
    status: ShipmentStatus;
    location?: string;
    timestamp: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface ShippingWebhook {
    id: string;
    provider: ShippingProvider;
    event: string;
    data: any;
    signature: string;
    timestamp: string;
    processed: boolean;
    retryCount: number;
}
export interface ShippingConnector {
    readonly provider: ShippingProvider;
    readonly region: string;
    createShipment(request: ShippingRequest): Promise<ShippingResponse>;
    getShipmentStatus(shipmentId: string): Promise<ShippingResponse>;
    trackShipment(trackingNumber: string): Promise<ShippingUpdate[]>;
    cancelShipment(shipmentId: string, reason?: string): Promise<boolean>;
    validateWebhook(payload: any, signature: string): boolean;
    processWebhook(payload: any): Promise<ShippingWebhook>;
    getShippingRates(request: Partial<ShippingRequest>): Promise<ShippingRate[]>;
}
export interface ShippingRate {
    method: ShippingMethod;
    cost: number;
    currency: string;
    estimatedDays: number;
    description: string;
    isAvailable: boolean;
}
export interface ShippingConfig {
    provider: ShippingProvider;
    region: string;
    mode: 'sandbox' | 'live';
    credentials: {
        apiKey: string;
        apiSecret: string;
        webhookSecret: string;
    };
    settings: {
        timeout: number;
        retryAttempts: number;
        retryDelay: number;
        maxWeight: number;
        maxDimensions: {
            length: number;
            width: number;
            height: number;
        };
    };
}
export declare class ShippingError extends Error {
    code: string;
    provider?: ShippingProvider | undefined;
    details?: any | undefined;
    constructor(code: string, message: string, provider?: ShippingProvider | undefined, details?: any | undefined);
}
export declare class ShippingValidationError extends ShippingError {
    constructor(message: string, details?: any);
}
export declare class ShippingProviderError extends ShippingError {
    constructor(provider: ShippingProvider, message: string, details?: any);
}
export declare class ShippingTimeoutError extends ShippingError {
    constructor(provider: ShippingProvider, timeout: number);
}
export declare const ShippingRequestSchema: z.ZodObject<{
    orderId: z.ZodString;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
        weight: z.ZodNumber;
        value: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        value: number;
        weight: number;
        quantity: number;
        id: string;
        description?: string | undefined;
        sku?: string | undefined;
    }, {
        name: string;
        value: number;
        weight: number;
        quantity: number;
        id: string;
        description?: string | undefined;
        sku?: string | undefined;
    }>, "many">;
    origin: z.ZodObject<{
        name: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodString;
        postalCode: z.ZodString;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    }, {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    }>;
    destination: z.ZodObject<{
        name: z.ZodString;
        company: z.ZodOptional<z.ZodString>;
        address1: z.ZodString;
        address2: z.ZodOptional<z.ZodString>;
        city: z.ZodString;
        state: z.ZodString;
        country: z.ZodString;
        postalCode: z.ZodString;
        phone: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    }, {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    }>;
    method: z.ZodEnum<["standard", "express", "overnight", "economy", "priority"]>;
    weight: z.ZodNumber;
    dimensions: z.ZodObject<{
        length: z.ZodNumber;
        width: z.ZodNumber;
        height: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        length: number;
        width: number;
        height: number;
    }, {
        length: number;
        width: number;
        height: number;
    }>;
    value: z.ZodNumber;
    currency: z.ZodString;
    instructions: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    value: number;
    weight: number;
    currency: string;
    items: {
        name: string;
        value: number;
        weight: number;
        quantity: number;
        id: string;
        description?: string | undefined;
        sku?: string | undefined;
    }[];
    orderId: string;
    origin: {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    };
    destination: {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    };
    method: "standard" | "express" | "overnight" | "economy" | "priority";
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    metadata?: Record<string, any> | undefined;
    instructions?: string | undefined;
}, {
    value: number;
    weight: number;
    currency: string;
    items: {
        name: string;
        value: number;
        weight: number;
        quantity: number;
        id: string;
        description?: string | undefined;
        sku?: string | undefined;
    }[];
    orderId: string;
    origin: {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    };
    destination: {
        name: string;
        address1: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
        company?: string | undefined;
        address2?: string | undefined;
        email?: string | undefined;
    };
    method: "standard" | "express" | "overnight" | "economy" | "priority";
    dimensions: {
        length: number;
        width: number;
        height: number;
    };
    metadata?: Record<string, any> | undefined;
    instructions?: string | undefined;
}>;
export declare const ShippingWebhookSchema: z.ZodObject<{
    id: z.ZodString;
    provider: z.ZodEnum<["shiprocket", "gcc_logistics", "aramex", "dhl", "blue_dart"]>;
    event: z.ZodString;
    data: z.ZodAny;
    signature: z.ZodString;
    timestamp: z.ZodString;
    processed: z.ZodDefault<z.ZodBoolean>;
    retryCount: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    provider: "shiprocket" | "gcc_logistics" | "aramex" | "dhl" | "blue_dart";
    id: string;
    event: string;
    signature: string;
    timestamp: string;
    processed: boolean;
    retryCount: number;
    data?: any;
}, {
    provider: "shiprocket" | "gcc_logistics" | "aramex" | "dhl" | "blue_dart";
    id: string;
    event: string;
    signature: string;
    timestamp: string;
    data?: any;
    processed?: boolean | undefined;
    retryCount?: number | undefined;
}>;
export declare const SHIPPING_METHODS: Record<ShippingMethod, {
    name: string;
    description: string;
    estimatedDays: number;
    isAvailable: boolean;
}>;
