import { z } from 'zod';

// Payment Provider Types
export type PaymentProvider = 'razorpay' | 'dibsy' | 'telr' | 'moyasar' | 'oman_net';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod' | 'apple_pay' | 'google_pay';

// Region Configuration
export interface RegionConfig {
  code: string;
  name: string;
  currency: string;
  paymentProvider: PaymentProvider;
  shippingProvider: string;
  isActive: boolean;
}

// Payment Request/Response Types
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

// Payment Adapter Interface
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

// Payment Configuration
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

// Error Types
export class PaymentError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider?: PaymentProvider,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class PaymentValidationError extends PaymentError {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, undefined, details);
  }
}

export class PaymentProviderError extends PaymentError {
  constructor(provider: PaymentProvider, message: string, details?: any) {
    super('PROVIDER_ERROR', message, provider, details);
  }
}

export class PaymentTimeoutError extends PaymentError {
  constructor(provider: PaymentProvider, timeout: number) {
    super('TIMEOUT_ERROR', `Payment request timed out after ${timeout}ms`, provider);
  }
}

// Validation Schemas
export const PaymentRequestSchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  customer: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    phone: z.string().optional(),
    name: z.string().min(1),
  }),
  billingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().length(2),
    postalCode: z.string().min(1),
    phone: z.string().optional(),
  }),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().length(2),
    postalCode: z.string().min(1),
    phone: z.string().optional(),
  }),
  items: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    description: z.string().optional(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    totalPrice: z.number().positive(),
    sku: z.string().optional(),
  })),
  metadata: z.record(z.any()).optional(),
  idempotencyKey: z.string().uuid(),
});

export const PaymentWebhookSchema = z.object({
  id: z.string(),
  provider: z.enum(['razorpay', 'dibsy', 'telr', 'moyasar', 'oman_net']),
  event: z.string(),
  data: z.any(),
  signature: z.string(),
  timestamp: z.string(),
  processed: z.boolean().default(false),
  retryCount: z.number().default(0),
});

// Region Configuration
export const REGION_CONFIGS: Record<string, RegionConfig> = {
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

