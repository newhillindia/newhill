import { z } from 'zod';

// Shipping Provider Types
export type ShippingProvider = 'shiprocket' | 'gcc_logistics' | 'aramex' | 'dhl' | 'blue_dart';
export type ShipmentStatus = 'pending' | 'packed' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
export type ShippingMethod = 'standard' | 'express' | 'overnight' | 'economy' | 'priority';

// Shipping Request/Response Types
export interface ShippingRequest {
  orderId: string;
  items: ShippingItem[];
  origin: ShippingAddress;
  destination: ShippingAddress;
  method: ShippingMethod;
  weight: number; // in grams
  dimensions: {
    length: number; // in cm
    width: number; // in cm
    height: number; // in cm
  };
  value: number; // declared value for insurance
  currency: string;
  instructions?: string;
  metadata?: Record<string, any>;
}

export interface ShippingItem {
  id: string;
  name: string;
  sku?: string;
  quantity: number;
  weight: number; // in grams
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

// Shipping Adapter Interface
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

// Shipping Configuration
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
    maxWeight: number; // in grams
    maxDimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}

// Error Types
export class ShippingError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider?: ShippingProvider,
    public details?: any
  ) {
    super(message);
    this.name = 'ShippingError';
  }
}

export class ShippingValidationError extends ShippingError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, undefined, details);
  }
}

export class ShippingProviderError extends ShippingError {
  constructor(provider: ShippingProvider, message: string, details?: any) {
    super('PROVIDER_ERROR', message, provider, details);
  }
}

export class ShippingTimeoutError extends ShippingError {
  constructor(provider: ShippingProvider, timeout: number) {
    super('TIMEOUT_ERROR', `Shipping request timed out after ${timeout}ms`, provider);
  }
}

// Validation Schemas
export const ShippingRequestSchema = z.object({
  orderId: z.string().uuid(),
  items: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    sku: z.string().optional(),
    quantity: z.number().positive(),
    weight: z.number().positive(),
    value: z.number().positive(),
    description: z.string().optional(),
  })),
  origin: z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().length(2),
    postalCode: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
  }),
  destination: z.object({
    name: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().length(2),
    postalCode: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional(),
  }),
  method: z.enum(['standard', 'express', 'overnight', 'economy', 'priority']),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  value: z.number().positive(),
  currency: z.string().length(3),
  instructions: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const ShippingWebhookSchema = z.object({
  id: z.string(),
  provider: z.enum(['shiprocket', 'gcc_logistics', 'aramex', 'dhl', 'blue_dart']),
  event: z.string(),
  data: z.any(),
  signature: z.string(),
  timestamp: z.string(),
  processed: z.boolean().default(false),
  retryCount: z.number().default(0),
});

// Shipping Methods Configuration
export const SHIPPING_METHODS: Record<ShippingMethod, {
  name: string;
  description: string;
  estimatedDays: number;
  isAvailable: boolean;
}> = {
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

