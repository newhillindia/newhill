import { z } from 'zod';

// ===== ADMIN PANEL SCHEMAS =====

export const AdminRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  isActive: z.boolean().default(true)
});

export const AdminUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'B2B', 'B2C']),
  adminRoleId: z.string().optional(),
  isActive: z.boolean().default(true)
});

// ===== PRODUCT SCHEMAS =====

export const ProductVariantSchema = z.object({
  weightInGrams: z.number().positive('Weight must be positive'),
  basePriceINR: z.number().positive('Price must be positive'),
  stockQty: z.number().min(0, 'Stock quantity cannot be negative'),
  minOrderQty: z.number().min(1, 'Minimum order quantity must be at least 1'),
  maxOrderQty: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).default('ACTIVE')
});

export const ProductFormSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  organicCertified: z.boolean().default(false),
  variants: z.array(ProductVariantSchema).min(1, 'At least one variant is required')
});

export const LotSchema = z.object({
  batchCode: z.string().min(1, 'Batch code is required'),
  originEstate: z.string().min(1, 'Origin estate is required'),
  harvestedOn: z.string().datetime('Invalid harvest date'),
  bestBefore: z.string().datetime('Invalid best before date'),
  qcNotes: z.string().optional(),
  qtyAvailable: z.number().min(0, 'Quantity must be non-negative'),
  qtyReserved: z.number().min(0, 'Reserved quantity must be non-negative').default(0),
  warehouseId: z.string().optional()
});

// ===== ORDER SCHEMAS =====

export const OrderStatusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
  notes: z.string().optional()
});

export const OrderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).optional(),
  date: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// ===== CUSTOMER SCHEMAS =====

export const CustomerFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['B2C', 'B2B']).optional(),
  ltv: z.enum(['low', 'medium', 'high']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

export const CustomerUpdateSchema = z.object({
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  notes: z.string().optional()
});

// ===== B2B SCHEMAS =====

export const B2BApplicationActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  adminNotes: z.string().optional()
});

export const B2BQuoteActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'review']),
  adminNotes: z.string().optional()
});

export const B2BQuoteItemSchema = z.object({
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().positive('Unit price must be positive'),
  notes: z.string().optional()
});

export const B2BQuoteSchema = z.object({
  customerNotes: z.string().optional(),
  items: z.array(B2BQuoteItemSchema).min(1, 'At least one item is required'),
  validUntil: z.string().datetime().optional()
});

// ===== FINANCE SCHEMAS =====

export const FinanceFiltersSchema = z.object({
  period: z.enum(['7', '30', '90', '365']).default('30'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const RefundSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string().min(1, 'Refund reason is required'),
  notes: z.string().optional()
});

// ===== MARKETING SCHEMAS =====

export const CouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50),
  name: z.string().min(1, 'Coupon name is required').max(100),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().positive('Value must be positive'),
  minOrderValue: z.number().positive().optional(),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().positive().optional(),
  validFrom: z.string().datetime('Invalid valid from date'),
  validUntil: z.string().datetime().optional(),
  isB2BOnly: z.boolean().default(false)
});

export const BannerSchema = z.object({
  title: z.string().min(1, 'Banner title is required').max(100),
  description: z.string().optional(),
  image: z.string().url('Invalid image URL'),
  link: z.string().url('Invalid link URL'),
  position: z.enum(['hero', 'top', 'middle', 'bottom']),
  scheduledFrom: z.string().datetime('Invalid scheduled from date'),
  scheduledUntil: z.string().datetime('Invalid scheduled until date')
});

// ===== SUPPORT SCHEMAS =====

export const SupportTicketSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['GENERAL', 'ORDER_ISSUE', 'PRODUCT_QUESTION', 'B2B_INQUIRY', 'TECHNICAL_SUPPORT', 'BILLING', 'REFUND', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM')
});

export const TicketReplySchema = z.object({
  message: z.string().min(1, 'Message is required'),
  isInternal: z.boolean().default(false)
});

export const TicketStatusUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().optional()
});

export const TicketFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  category: z.enum(['GENERAL', 'ORDER_ISSUE', 'PRODUCT_QUESTION', 'B2B_INQUIRY', 'TECHNICAL_SUPPORT', 'BILLING', 'REFUND', 'OTHER']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// ===== TOGGLES SCHEMAS =====

export const ToggleUpdateSchema = z.object({
  enabled: z.boolean()
});

export const ToggleFiltersSchema = z.object({
  category: z.string().optional(),
  isActive: z.boolean().optional()
});

// ===== CMS SCHEMAS =====

export const CMSPageSchema = z.object({
  title: z.string().min(1, 'Page title is required').max(200),
  slug: z.string().min(1, 'Page slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.any(), // Rich content structure
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().default(false)
});

export const CMSPageTranslationSchema = z.object({
  language: z.string().min(2).max(5),
  title: z.string().min(1, 'Translation title is required').max(200),
  content: z.any(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional()
});

export const CMSPageFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['published', 'draft']).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20)
});

// ===== ANALYTICS SCHEMAS =====

export const AnalyticsFiltersSchema = z.object({
  period: z.enum(['7', '30', '90', '365']).default('30'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  entity: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional()
});

// ===== BULK ACTION SCHEMAS =====

export const BulkActionSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  itemIds: z.array(z.string()).min(1, 'At least one item must be selected'),
  metadata: z.any().optional()
});

// ===== AUDIT LOG SCHEMAS =====

export const AuditLogFiltersSchema = z.object({
  entity: z.string().optional(),
  action: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50)
});

// ===== EXPORT SCHEMAS =====

export const ExportSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'pdf']),
  filters: z.any().optional(),
  fields: z.array(z.string()).optional()
});

// ===== VALIDATION HELPERS =====

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validateUrl = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

export const validateDate = (date: string): boolean => {
  return z.string().datetime().safeParse(date).success;
};

export const validateSlug = (slug: string): boolean => {
  return z.string().regex(/^[a-z0-9-]+$/).safeParse(slug).success;
};

// ===== COMMON RESPONSE SCHEMAS =====

export const SuccessResponseSchema = z.object({
  success: z.boolean().default(true),
  message: z.string().optional(),
  data: z.any().optional()
});

export const ErrorResponseSchema = z.object({
  success: z.boolean().default(false),
  error: z.string(),
  details: z.any().optional()
});

export const PaginatedResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number()
  })
});

// ===== PERMISSION SCHEMAS =====

export const PermissionSchema = z.enum([
  'dashboard.view',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'orders.view',
  'orders.edit',
  'orders.delete',
  'customers.view',
  'customers.edit',
  'customers.delete',
  'b2b.view',
  'b2b.edit',
  'b2b.delete',
  'finance.view',
  'finance.export',
  'marketing.view',
  'marketing.edit',
  'support.view',
  'support.edit',
  'security.view',
  'security.edit',
  'toggles.view',
  'toggles.edit',
  'cms.view',
  'cms.edit',
  'analytics.view',
  'users.view',
  'users.edit',
  'users.delete',
  'audit.view'
]);

export const RolePermissionsSchema = z.object({
  permissions: z.array(PermissionSchema)
});


