# Phase 3: Product Catalog, Inventory & Pricing System Setup Guide

This guide covers the complete implementation of Phase 3: Product Catalog, Inventory & Pricing System for the Newhill Spices Platform.

## 🎯 Overview

Phase 3 implements a comprehensive product ecosystem with:
- **Product Hierarchy**: Product → ProductVariant → Lot → BatchInfo
- **Multi-Currency Pricing**: Dynamic conversion for India + GCC markets
- **Inventory Management**: Lot tracking, QC status, and stock validation
- **Discount System**: Flexible coupons and discount codes
- **Multi-Language Support**: English, Arabic, and Hindi translations
- **Audit Logging**: Complete tracking of all system changes
- **Regional Readiness**: Optimized for India and GCC markets

## 🚀 Quick Start

### 1. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with sample data
npx prisma db seed
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/newhill_spices"

# Currency API (for real-time rates)
CURRENCY_API_KEY=your-currency-api-key
CURRENCY_API_URL=https://api.exchangerate-api.com/v4/latest/INR

# Supabase (for Edge Functions)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Email (for notifications)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@newhillspices.com
```

### 3. Start Development Server

```bash
# Start the web application
npm run dev

# Or start all services with Docker
npm run docker:up
```

## 🗄️ Database Schema

### Core Entities

#### Product Hierarchy
```
Product (name, description, category, organicCertified)
  └── ProductVariant (weightInGrams, basePriceINR, stockQty)
      └── Lot (batchCode, originEstate, harvestedOn, bestBefore, qcNotes)
```

#### User & Order Management
```
User (email, role, profile)
  ├── Address (shipping/billing addresses)
  ├── Order (orderNumber, status, totalAmount)
  │   ├── OrderItem (variantId, quantity, unitPrice)
  │   ├── Payment (providerId, amount, status)
  │   └── Shipment (trackingNumber, carrier, status)
  └── CouponRedemption (discountId, amount)
```

#### Inventory & Pricing
```
InventoryLedger (variantId, lotId, changeType, quantity, reason)
CurrencyRate (fromCurrency, toCurrency, rate, lastUpdated)
CurrencyPrice (variantId, currency, price, lastUpdated)
```

### Key Features

- **UUID Primary Keys**: All entities use UUID for better scalability
- **Soft Deletion**: `softDeleted` flag for reversible deletion
- **Audit Logging**: Complete tracking of all changes
- **Multi-Currency**: Support for INR, QAR, AED, SAR, OMR
- **Multi-Language**: English, Arabic, Hindi translations

## 💰 Multi-Currency System

### Supported Currencies

| Currency | Symbol | Name | Decimals |
|----------|--------|------|----------|
| INR | ₹ | Indian Rupee | 2 |
| QAR | ر.ق | Qatari Riyal | 2 |
| AED | د.إ | UAE Dirham | 2 |
| SAR | ر.س | Saudi Riyal | 2 |
| OMR | ر.ع. | Omani Rial | 3 |

### Usage

```typescript
import { useCurrency } from '../hooks/useCurrency';

function ProductCard({ variantId }) {
  const { currency, getPrice, formatPrice } = useCurrency();
  const [price, setPrice] = useState(null);

  useEffect(() => {
    getPrice(variantId).then(setPrice);
  }, [variantId, currency]);

  return (
    <div>
      <h3>{product.name}</h3>
      <p>{price?.formatted}</p>
    </div>
  );
}
```

### Currency Conversion

- **Base Currency**: INR (Indian Rupee)
- **Dynamic Conversion**: Real-time rate calculation
- **Caching**: 1-hour cache for converted prices
- **Auto-Update**: Hourly rate updates via Edge Functions

## 📦 Inventory Management

### Lot Tracking

Each product variant can have multiple lots with:
- **Batch Code**: Unique identifier for traceability
- **Origin Estate**: Source of the spice
- **Harvest Date**: When the spice was harvested
- **Best Before**: Expiration date
- **QC Notes**: Quality control information
- **Status**: ACTIVE, EXPIRED, BLOCKED, QUARANTINE

### Stock Management

```typescript
import { checkStockAvailability, reserveStock } from '../lib/inventory';

// Check stock availability
const stockCheck = await checkStockAvailability(variantId, quantity, lotId);

// Reserve stock for order
const reservation = await reserveStock(variantId, quantity, lotId, orderId);
```

### Inventory Operations

- **Stock In**: Adding new inventory
- **Stock Out**: Order fulfillment
- **Adjustments**: Corrections, damages, transfers
- **Expired Lots**: Automatic blocking of expired lots
- **FIFO**: First In, First Out allocation

## 🎫 Discount System

### Discount Types

1. **Percentage Discount**: X% off order
2. **Fixed Amount**: ₹X off order
3. **Free Shipping**: Free delivery

### Usage Limits

- **Usage Limit**: Maximum number of uses
- **Minimum Order Value**: Required order amount
- **Maximum Discount**: Cap on discount amount
- **B2B Only**: Business customer exclusives

### API Usage

```typescript
// Validate discount code
const response = await fetch('/api/discounts/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'WELCOME10',
    orderAmount: 1500,
    type: 'discount'
  })
});

const validation = await response.json();
```

## 🌍 Multi-Language Support

### Supported Languages

- **English (en)**: Default language
- **Arabic (ar)**: Right-to-left support
- **Hindi (hi)**: Devanagari script

### Translation System

```typescript
import { getTranslation, getProductTranslation } from '../lib/translations';

// Get translation
const welcomeText = await getTranslation('common.welcome', 'ar');

// Get product translation
const product = await getProductTranslation(productId, 'hi');
```

### Translation Keys

All UI text is stored in the `TranslationKey` table with:
- **Key**: Unique identifier (e.g., 'product.addToCart')
- **Language**: Language code (en, ar, hi)
- **Value**: Translated text

## 🔒 Row Level Security (RLS)

### User Roles & Access

#### B2C Users
- View own orders and addresses
- Access own coupon redemptions
- Limited to 5kg order weight

#### B2B Users
- View bulk pricing
- Access lot availability
- No weight restrictions
- B2B-only discounts

#### Admin Users
- Full CRUD access
- Audit log access
- System management
- User management

### RLS Policies

```sql
-- Example: Users can only see their own orders
CREATE POLICY "Users can view own orders" ON "Order"
  FOR SELECT USING (auth.uid() = "userId");

-- Example: B2B users can see bulk pricing
CREATE POLICY "B2B users can see bulk pricing" ON "ProductVariant"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "User" 
      WHERE "id" = auth.uid() 
      AND "role" = 'B2B'
    )
  );
```

## 🤖 Automation & Edge Functions

### Currency Rate Updates

**Function**: `update-currency-rates`
**Schedule**: Hourly
**Purpose**: Update exchange rates from external API

```typescript
// Trigger manually
const response = await fetch('/api/currency/update-rates', {
  method: 'POST'
});
```

### Expired Lot Blocking

**Function**: `block-expired-lots`
**Schedule**: Daily at 2 AM
**Purpose**: Automatically block expired lots

```typescript
// Trigger manually
const response = await fetch('/api/inventory/block-expired', {
  method: 'POST'
});
```

### Stock Updates

**Function**: `update-stock-on-order`
**Trigger**: Order status changes
**Purpose**: Update inventory when orders are processed

## 📊 Seed Data

### Sample Data Included

1. **Users**: Admin, B2B buyer, 3 B2C users
2. **Products**: 6 spices × 4 variants each (24 variants)
3. **Lots**: Sample batches with origin stories
4. **Orders**: Sample orders with all statuses
5. **Discounts**: Welcome, B2B, and free shipping codes
6. **Translations**: Multi-language product data
7. **Currency Rates**: INR to GCC currency rates

### Seeding Commands

```bash
# Seed with sample data
npx prisma db seed

# Reset and reseed
npx prisma migrate reset
npx prisma db seed
```

## 🔍 API Endpoints

### Products

- `GET /api/products` - List products with filters
- `GET /api/products/[id]` - Get product details
- `GET /api/products/categories` - List categories

### Inventory

- `POST /api/inventory/validate` - Validate stock availability
- `GET /api/inventory/stock/[variantId]` - Get stock info
- `POST /api/inventory/reserve` - Reserve stock

### Discounts

- `POST /api/discounts/validate` - Validate discount code
- `GET /api/discounts/available` - Get available discounts
- `POST /api/discounts/apply` - Apply discount to order

### Currency

- `GET /api/currency/rates` - Get exchange rates
- `POST /api/currency/update-rates` - Update rates
- `GET /api/currency/supported` - Get supported currencies

## 🧪 Testing

### Test Scenarios

1. **Product Catalog**:
   - Browse products in different languages
   - Filter by category and organic status
   - View pricing in different currencies

2. **Inventory Management**:
   - Check stock availability
   - Reserve stock for orders
   - Handle expired lots

3. **Discount System**:
   - Apply discount codes
   - Validate coupon usage
   - Test B2B-only discounts

4. **Multi-Currency**:
   - Switch between currencies
   - Verify price conversions
   - Test rate updates

### Test Data

Use the seeded data for testing:
- **Admin**: admin@newhillspices.com / admin123
- **B2B**: b2b@restaurant.com / b2b123
- **B2C**: customer1@example.com / customer123

## 🚀 Deployment

### Production Setup

1. **Database**: Set up PostgreSQL with proper indexing
2. **Redis**: Configure for caching and rate limiting
3. **Edge Functions**: Deploy Supabase functions
4. **Monitoring**: Set up logging and alerting
5. **Backups**: Configure automated backups

### Environment Configuration

```env
# Production environment
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:6379
SUPABASE_URL=https://your-project.supabase.co
CURRENCY_API_KEY=your-production-api-key
```

## 🔧 Troubleshooting

### Common Issues

1. **Currency Conversion Failing**:
   - Check API key and rate limits
   - Verify database connection
   - Check Redis cache

2. **Stock Validation Errors**:
   - Verify lot status
   - Check inventory ledger
   - Ensure proper permissions

3. **Translation Not Loading**:
   - Check language code
   - Verify translation keys
   - Check fallback logic

4. **Discount Not Applying**:
   - Check usage limits
   - Verify order amount
   - Check B2B restrictions

### Debug Mode

Enable debug logging:
```env
DEBUG=true
LOG_LEVEL=debug
```

## 📈 Performance Optimization

### Database Indexes

- Product category and status
- Variant stock quantities
- Lot batch codes and status
- Currency rates and prices
- Audit log timestamps

### Caching Strategy

- Currency prices (1 hour)
- Product translations (24 hours)
- Exchange rates (1 hour)
- Stock availability (5 minutes)

### Query Optimization

- Use pagination for large datasets
- Implement proper filtering
- Optimize N+1 queries
- Use database views for complex queries

## 🔄 Next Steps

After completing Phase 3, you can proceed to:

1. **Phase 4**: Cart & Checkout Flow
2. **Phase 5**: Payment Integration
3. **Phase 6**: Shipping & Logistics
4. **Phase 7**: Analytics & Reporting

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Multi-Currency Best Practices](https://stripe.com/docs/currencies)

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the audit logs
3. Check the browser console
4. Review server logs
5. Check database queries

## 📄 License

This implementation is part of the Newhill Spices Platform and follows the project's licensing terms.
