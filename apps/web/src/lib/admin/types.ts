// ===== ADMIN PANEL TYPES =====

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'B2B' | 'B2C';
  adminRole?: AdminRole;
  lastLogin: string;
  isActive: boolean;
  loginHistory: LoginHistory[];
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: AdminUser[];
}

export interface LoginHistory {
  id: string;
  ipAddress: string;
  userAgent: string;
  loginAt: string;
  success: boolean;
  location?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

// ===== DASHBOARD TYPES =====

export interface DashboardMetrics {
  totalSales: number;
  revenue: number;
  profitMargin: number;
  lowStockCount: number;
  pendingPayments: number;
  totalOrders: number;
  totalCustomers: number;
  pendingB2BApprovals: number;
}

export interface SalesTrend {
  date: string;
  sales: number;
  orders: number;
}

export interface TopSKU {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  growth: number;
}

export interface ChannelBreakdown {
  channel: string;
  orders: number;
  revenue: number;
  percentage: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'low_stock' | 'b2b_approval' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

// ===== PRODUCT MANAGEMENT TYPES =====

export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  organicCertified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED';
  variants: ProductVariant[];
  totalStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  weightInGrams: number;
  basePriceINR: number;
  stockQty: number;
  minOrderQty: number;
  maxOrderQty?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  lots: Lot[];
  currencyPrices: CurrencyPrice[];
}

export interface Lot {
  id: string;
  variantId: string;
  batchCode: string;
  originEstate: string;
  harvestedOn: string;
  bestBefore: string;
  qcNotes?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'BLOCKED' | 'QUARANTINE';
  qtyAvailable: number;
  qtyReserved: number;
  warehouseId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyPrice {
  id: string;
  variantId: string;
  currency: string;
  price: number;
  lastUpdated: string;
}

// ===== ORDER MANAGEMENT TYPES =====

export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  lotId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: {
    product: {
      name: string;
    };
    weightInGrams: number;
  };
  lot?: Lot;
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

// ===== CUSTOMER MANAGEMENT TYPES =====

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  role: 'B2C' | 'B2B';
  totalSpent: number;
  ordersCount: number;
  lastOrderDate: string;
  createdAt: string;
  profile?: {
    phone: string;
    city: string;
    state: string;
    country: string;
  };
  b2bApplication?: {
    businessName: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
  tags: string[];
  ltv: number;
}

// ===== B2B MANAGEMENT TYPES =====

export interface B2BApplication {
  id: string;
  businessName: string;
  businessType: string;
  gstVatNumber?: string;
  contactPerson: string;
  contactPhone: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  expectedMonthlyVolume: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export interface B2BQuote {
  id: string;
  quoteNumber: string;
  status: 'REQUESTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED';
  totalAmount: number;
  currency: string;
  validUntil?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  items: B2BQuoteItem[];
}

export interface B2BQuoteItem {
  id: string;
  quoteId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant: {
    product: {
      name: string;
    };
    weightInGrams: number;
  };
}

// ===== FINANCE TYPES =====

export interface FinanceMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  profitMargin: number;
  refunds: number;
  taxes: number;
  netRevenue: number;
  currency: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  refunds: number;
}

export interface PaymentProviderBreakdown {
  provider: string;
  orders: number;
  revenue: number;
  percentage: number;
  fees: number;
}

export interface RefundData {
  id: string;
  orderNumber: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
}

// ===== MARKETING TYPES =====

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
  isB2BOnly: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  position: 'hero' | 'top' | 'middle' | 'bottom';
  isActive: boolean;
  scheduledFrom: string;
  scheduledUntil: string;
  createdAt: string;
}

// ===== SUPPORT TYPES =====

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'GENERAL' | 'ORDER_ISSUE' | 'PRODUCT_QUESTION' | 'B2B_INQUIRY' | 'TECHNICAL_SUPPORT' | 'BILLING' | 'REFUND' | 'OTHER';
  assignedTo?: string;
  assignedUser?: {
    name: string;
    email: string;
  };
  tags: string[];
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  replies: TicketReply[];
}

export interface TicketReply {
  id: string;
  ticketId: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

// ===== TOGGLES TYPES =====

export interface SystemToggle {
  id: string;
  key: string;
  name: string;
  description: string;
  value: boolean;
  category: 'general' | 'features' | 'payments' | 'shipping' | 'marketing';
  isActive: boolean;
  updatedBy?: string;
  lastUpdated: string;
}

// ===== CMS TYPES =====

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: any;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  translations: CMSPageTranslation[];
}

export interface CMSPageTranslation {
  id: string;
  pageId: string;
  language: string;
  title: string;
  content: any;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== ANALYTICS TYPES =====

export interface AnalyticsMetrics {
  totalPageviews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversionRate: number;
  topPages: PageAnalytics[];
  trafficSources: TrafficSource[];
  deviceBreakdown: DeviceBreakdown[];
  geographicData: GeographicData[];
  conversionFunnel: ConversionStep[];
  realTimeUsers: number;
  systemHealth: SystemHealth;
}

export interface PageAnalytics {
  page: string;
  views: number;
  uniqueViews: number;
  bounceRate: number;
  avgTimeOnPage: number;
}

export interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  conversionRate: number;
}

export interface DeviceBreakdown {
  device: string;
  visitors: number;
  percentage: number;
  conversionRate: number;
}

export interface GeographicData {
  country: string;
  visitors: number;
  percentage: number;
  revenue: number;
}

export interface ConversionStep {
  step: string;
  visitors: number;
  conversionRate: number;
  dropOffRate: number;
}

export interface SystemHealth {
  uptime: number;
  responseTime: number;
  errorRate: number;
  databaseStatus: 'healthy' | 'warning' | 'critical';
  queueStatus: 'healthy' | 'warning' | 'critical';
}

// ===== API RESPONSE TYPES =====

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ===== FORM TYPES =====

export interface ProductFormData {
  name: string;
  description: string;
  category: string;
  images: string[];
  organicCertified: boolean;
  variants: {
    weightInGrams: number;
    basePriceINR: number;
    stockQty: number;
    minOrderQty: number;
    maxOrderQty?: number;
  }[];
}

export interface CouponFormData {
  code: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  value: number;
  minOrderValue?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: string;
  validUntil?: string;
  isB2BOnly: boolean;
}

export interface BannerFormData {
  title: string;
  description: string;
  image: string;
  link: string;
  position: 'hero' | 'top' | 'middle' | 'bottom';
  scheduledFrom: string;
  scheduledUntil: string;
}

export interface CMSPageFormData {
  title: string;
  slug: string;
  content: any;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

// ===== FILTER TYPES =====

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface CustomerFilters {
  search?: string;
  role?: string;
  ltv?: string;
  page?: number;
  limit?: number;
}

export interface TicketFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// ===== BULK ACTION TYPES =====

export interface BulkAction {
  action: string;
  itemIds: string[];
  metadata?: any;
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}


