# Phase 8: User Account & B2B Pages

## Overview

Phase 8 implements comprehensive user account management and B2B functionality for the Newhill Spices Platform. This phase enables end-to-end account management for retail users and wholesale functionality for B2B customers, with admin approval flows.

## 🎯 Objectives

- Enable comprehensive user account management
- Implement B2B wholesale functionality with admin controls
- Provide secure payment method storage and management
- Enable wishlist and saved items functionality
- Support admin user impersonation and B2B approvals
- Ensure all features are accessible and analytics-tracked

## 🏗️ Architecture

### Database Models

#### New Models Added
```prisma
model WishlistItem {
  id        String   @id @default(cuid())
  userId    String
  variantId String
  quantity  Int      @default(1)
  notes     String?  @db.Text
  isPublic  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user    User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@unique([userId, variantId])
  @@index([userId])
  @@index([isPublic])
}

model SavedPayment {
  id            String   @id @default(cuid())
  userId        String
  provider      String   // razorpay, stripe, etc.
  token         String   // encrypted payment token
  last4Digits   String   // last 4 digits of card
  expiryMonth   Int?
  expiryYear    Int?
  cardType      String?  // visa, mastercard, etc.
  isDefault     Boolean  @default(false)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isActive])
}

model B2BQuote {
  id                String        @id @default(cuid())
  userId            String
  quoteNumber       String        @unique
  status            B2BQuoteStatus @default(REQUESTED)
  totalAmount       Decimal?      @db.Decimal(10, 2)
  currency          String        @default("INR")
  validUntil        DateTime?
  adminNotes        String?       @db.Text
  customerNotes     String?       @db.Text
  reviewedAt        DateTime?
  reviewedBy        String?
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  user        User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  items       B2BQuoteItem[]
  auditLogs   AuditLog[]

  @@index([userId])
  @@index([status])
  @@index([quoteNumber])
}

model B2BQuoteItem {
  id        String   @id @default(cuid())
  quoteId   String
  variantId String
  quantity  Int
  unitPrice Decimal  @db.Decimal(10, 2)
  totalPrice Decimal @db.Decimal(10, 2)
  notes     String?  @db.Text
  createdAt DateTime @default(now())

  quote   B2BQuote       @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@index([quoteId])
  @@index([variantId])
}

enum B2BQuoteStatus {
  REQUESTED
  REVIEWED
  APPROVED
  REJECTED
  EXPIRED
  CONVERTED
}
```

### Frontend Pages

#### 1. User Account Dashboard (`/account`)
- **Overview Widgets**: Recent orders, quick stats, profile summary
- **Quick Links**: Direct access to orders, addresses, payments, wishlist
- **Admin Controls**: User impersonation (demo stub) for troubleshooting
- **B2B Dashboard**: Special section for B2B users with quote management

#### 2. Orders Management (`/account/orders`)
- **Order History**: Complete order list with filtering and search
- **Order Details**: Detailed view with timeline, items, and tracking
- **Actions**: Reorder, cancel, return, download invoice
- **Status Tracking**: Visual progress indicators for order status

#### 3. Address Management (`/account/addresses`)
- **Address List**: View all saved addresses with type indicators
- **Add/Edit Form**: Comprehensive address form with validation
- **Default Management**: Set default shipping/billing addresses
- **Validation**: PIN code, country, and phone number validation

#### 4. Payment History (`/account/payments`)
- **Payment History**: Complete transaction history with receipts
- **Saved Methods**: Manage stored payment methods securely
- **Receipt Download**: PDF receipt generation and download
- **Security**: Masked card information, secure token storage

#### 5. Wishlist (`/account/wishlist`)
- **Item Management**: Add, remove, and organize wishlist items
- **Sharing**: Public/private toggle and shareable links
- **Move to Cart**: Quick add to cart functionality
- **Notes**: Personal notes for each wishlist item

#### 6. B2B Dashboard (`/account/b2b`)
- **Quote Management**: Create, view, and manage bulk quotes
- **Bulk Orders**: Place and track large quantity orders
- **Sales Rep Contact**: Direct communication channels
- **Tiered Pricing**: Access to wholesale pricing after approval

### API Endpoints

#### User Management (`/api/v1/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /stats` - Get user statistics
- `POST /impersonate` - Admin user impersonation

#### Address Management (`/api/v1/addresses`)
- `GET /` - Get user addresses
- `POST /` - Create new address
- `PUT /:id` - Update address
- `DELETE /:id` - Delete address
- `POST /:id/default` - Set as default address

#### Payment Management (`/api/v1/payments`)
- `GET /` - Get payment history
- `GET /saved` - Get saved payment methods
- `POST /saved` - Save payment method
- `DELETE /saved/:id` - Delete saved payment
- `POST /saved/:id/default` - Set as default payment
- `GET /:id/receipt` - Download payment receipt

#### B2B Management (`/api/v1/b2b`)
- `GET /stats` - Get B2B statistics
- `GET /quotes` - Get B2B quotes
- `POST /quotes` - Create quote request
- `GET /quotes/:id` - Get quote details
- `POST /quotes/:id/convert` - Convert quote to order
- `GET /quotes/:id/pdf` - Download quote PDF

## 🔧 Key Features

### User Account Dashboard
- **Recent Orders**: Timeline preview with quick reorder
- **Quick Stats**: Total orders, spending, wishlist items, addresses
- **Profile Management**: Edit profile with validation
- **Admin Tools**: User impersonation for troubleshooting

### Orders Management
- **Advanced Filtering**: By status, date range, search terms
- **Order Details**: Complete order information with timeline
- **Actions**: Reorder, cancel, return, download invoice
- **Status Tracking**: Visual progress indicators

### Address Management
- **Multiple Addresses**: Support for multiple shipping/billing addresses
- **Validation**: Comprehensive address validation
- **Default Selection**: Set default addresses for faster checkout
- **Type Management**: Separate shipping and billing addresses

### Payment Management
- **Payment History**: Complete transaction history
- **Saved Methods**: Secure storage of payment methods
- **Receipt Download**: PDF receipt generation
- **Security**: Encrypted token storage, masked card details

### Wishlist Features
- **Item Management**: Add, remove, organize items
- **Sharing**: Public/private toggle with shareable links
- **Move to Cart**: Quick purchase functionality
- **Notes**: Personal notes for each item

### B2B Functionality
- **Quote Requests**: Bulk quote request system
- **Admin Approval**: Admin review and approval workflow
- **Tiered Pricing**: Wholesale pricing after approval
- **Sales Rep Contact**: Direct communication channels

## 🚀 Quick Start

### 1. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database
npx prisma db seed
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/newhill_spices"

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Payment Providers (for saved payments)
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

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

## 📱 User Experience

### Account Dashboard
- Clean, modern interface with quick access to all features
- Responsive design for mobile and desktop
- Real-time updates and notifications
- Intuitive navigation and user flows

### Order Management
- Visual order status tracking
- Easy reorder functionality
- Comprehensive order details
- Mobile-friendly interface

### Address Management
- Form validation with helpful error messages
- Quick address selection
- Default address management
- International address support

### Payment Management
- Secure payment method storage
- Easy receipt access
- Masked sensitive information
- Quick payment method selection

### Wishlist
- Visual product display
- Easy sharing functionality
- Quick add to cart
- Personal notes and organization

### B2B Dashboard
- Professional interface for business users
- Quote management system
- Direct sales rep contact
- Bulk order capabilities

## 🔒 Security Features

### Data Protection
- Encrypted payment token storage
- Masked sensitive information
- Secure API endpoints
- User authentication and authorization

### Admin Controls
- User impersonation for troubleshooting
- B2B approval workflows
- Audit logging for all actions
- Role-based access control

## 📊 Analytics & Tracking

### User Behavior
- Page view tracking
- Feature usage analytics
- Conversion tracking
- User journey analysis

### Business Metrics
- B2B quote conversion rates
- User engagement metrics
- Feature adoption rates
- Performance monitoring

## 🧪 Testing

### Test Coverage
- Unit tests for all components
- Integration tests for API endpoints
- E2E tests for user flows
- Performance testing

### Test Commands
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Checklist
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] CDN configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented

### Deployment Commands
```bash
# Build for production
npm run build

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 📈 Performance

### Optimization Features
- Lazy loading for images and components
- Efficient database queries
- Caching for frequently accessed data
- CDN integration for static assets

### Monitoring
- Real-time performance metrics
- Error tracking and alerting
- User experience monitoring
- Database performance monitoring

## 🔧 Maintenance

### Regular Tasks
- Database cleanup and optimization
- Security updates and patches
- Performance monitoring and tuning
- User feedback collection and analysis

### Support
- Comprehensive documentation
- User guides and tutorials
- Technical support channels
- Community forums

## 📞 Support

For questions or issues with Phase 8 implementation:

- **Technical Issues**: Contact development team
- **User Support**: Use in-app support or contact support@newhillspices.com
- **B2B Support**: Contact b2b@newhillspices.com
- **Admin Support**: Contact admin@newhillspices.com

---

**Phase 8 Status**: ✅ Complete
**Last Updated**: January 2024
**Version**: 1.0.0

## 🎉 Deliverables Summary

✅ **Account dashboard** with overview widgets, recent orders, and quick links
✅ **Orders management** with filtering, search, and status tracking
✅ **Address management** with validation and default address selection
✅ **Payment history** with receipt download functionality
✅ **Wishlist/saved items** with move-to-cart and sharing features
✅ **Saved payment methods** implemented as secure mock stubs
✅ **B2B dashboard** with bulk quote requests and tiered pricing
✅ **Admin controls** for user impersonation and B2B approvals
✅ **Database models** for all new functionality
✅ **API endpoints** for complete account management
✅ **E2E flows** tested for all major user journeys
✅ **All pages** accessible and analytics-tracked
