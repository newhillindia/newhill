import { z } from 'zod';

// Base API Response Types
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

// User Roles and Permissions
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

// Product Types
export interface Product {
  id: string;
  slug: string;
  name: Record<string, string>; // Multi-language support
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

// Cart Types
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

// Order Types
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

// Wishlist Types
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: string;
  product: Product;
}

// Search Types
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
    categories: Array<{ name: string; count: number }>;
    priceRange: { min: number; max: number };
    certifications: Array<{ name: string; count: number }>;
  };
}

// Admin Types
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

// Webhook Types
export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  signature: string;
  timestamp: string;
  processed: boolean;
  retryCount: number;
}

// Validation Schemas
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).optional(),
});

export const ProductFiltersSchema = z.object({
  category: z.string().optional(),
  subcategory: z.string().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  region: z.string().optional(),
  currency: z.string().optional(),
  inStock: z.boolean().optional(),
  certification: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'popularity']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: ProductFiltersSchema.optional(),
  language: z.string().default('en'),
  region: z.string().default('IN'),
  currency: z.string().default('INR'),
});

export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().min(1).max(100),
});

export const CheckoutSchema = z.object({
  items: z.array(CartItemSchema),
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().optional(),
    address1: z.string().min(1),
    address2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
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
    country: z.string().min(1),
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
});

// Error Types
export class ApiError extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, 'AUTHENTICATION_ERROR', message);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'AUTHORIZATION_ERROR', message);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(409, 'CONFLICT', message);
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(429, 'RATE_LIMIT_EXCEEDED', message);
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, 'INTERNAL_SERVER_ERROR', message);
  }
}

