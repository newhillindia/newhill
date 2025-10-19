# 🚀 Newhill Spices Platform - Developer Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [API Documentation](#api-documentation)
6. [Database Schema](#database-schema)
7. [Component Library](#component-library)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

Newhill Spices is a comprehensive e-commerce platform built with Next.js 14, featuring:
- **Multi-region support** (India + GCC)
- **Multi-currency** and **multi-language** capabilities
- **B2B and B2C** functionality
- **Admin dashboard** with full CRUD operations
- **Real-time analytics** with PostHog
- **Secure authentication** with NextAuth.js
- **Performance optimized** with lazy loading and SSR
- **Accessibility compliant** (WCAG AA)
- **SEO optimized** with structured data

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Analytics**: PostHog
- **File Storage**: Cloudinary
- **Email**: Resend
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel/AWS
- **CI/CD**: GitHub Actions

### Project Structure
```
apps/
├── web/                    # Next.js web application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/          # Utilities and configurations
│   │   ├── pages/        # Pages Router (legacy)
│   │   └── styles/       # Global styles
│   ├── public/           # Static assets
│   └── tests/            # Test files
├── api/                   # API server (if separate)
└── worker/               # Background workers

packages/
├── shared/               # Shared utilities
└── ui/                   # UI component library

infrastructure/           # AWS CDK infrastructure
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 8+
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/newhill-spices-platform.git
cd newhill-spices-platform

# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your API keys

# Set up Supabase database
# Run the SQL scripts in docs/database/

# Start development server
npm run dev
```

### Environment Variables
```bash
# Database & Authentication
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Authentication
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=info@newhillspices.com

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🔄 Development Workflow

### Branch Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/*`: Feature development
- `hotfix/*`: Critical fixes

### Code Standards
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type safety
- **Conventional Commits**: Commit messages

### Commands
```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run E2E tests
npm run test:a11y       # Run accessibility tests
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript check
npm run format          # Format code with Prettier

# Database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data
npm run db:reset        # Reset database
```

## 📡 API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/signin
POST /api/auth/signup
POST /api/auth/signout
GET  /api/auth/session
```

### Product Endpoints
```typescript
GET    /api/v1/products           # List products
GET    /api/v1/products/:id       # Get product details
POST   /api/v1/products           # Create product (admin)
PUT    /api/v1/products/:id       # Update product (admin)
DELETE /api/v1/products/:id       # Delete product (admin)
```

### Cart Endpoints
```typescript
GET    /api/v1/cart               # Get cart
POST   /api/v1/cart/add           # Add item to cart
PUT    /api/v1/cart/update        # Update cart item
DELETE /api/v1/cart/remove        # Remove item from cart
```

### Order Endpoints
```typescript
GET    /api/v1/orders             # List user orders
POST   /api/v1/orders             # Create order
GET    /api/v1/orders/:id         # Get order details
PUT    /api/v1/orders/:id/status   # Update order status (admin)
```

### Admin Endpoints
```typescript
GET    /api/admin/dashboard       # Admin dashboard data
GET    /api/admin/products        # Admin product management
GET    /api/admin/orders          # Admin order management
GET    /api/admin/customers       # Admin customer management
GET    /api/admin/analytics       # Admin analytics data
```

## 🗄️ Database Schema

### Core Tables
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'B2C' CHECK (role IN ('ADMIN', 'B2B', 'B2C')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name JSONB NOT NULL, -- Multi-language support
  description JSONB,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  organic_certified BOOLEAN DEFAULT FALSE,
  default_currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISCONTINUED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Feature Flags
```sql
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  type TEXT DEFAULT 'boolean' CHECK (type IN ('boolean', 'percentage', 'region', 'user_group')),
  value JSONB,
  conditions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🧩 Component Library

### Core Components
- `Header`: Main navigation header
- `Footer`: Site footer with links
- `ProductCard`: Product display card
- `CartButton`: Shopping cart button
- `RegionSelector`: Region/currency selector
- `LanguageSwitcher`: Language switcher
- `OptimizedImage`: Performance-optimized image component

### UI Components
- `Button`: Reusable button component
- `Input`: Form input component
- `Modal`: Modal dialog component
- `SkeletonLoader`: Loading skeleton component
- `Toast`: Notification toast component

### Usage Examples
```tsx
import { ProductCard } from '@/components/catalog/ProductCard';
import { RegionSelector } from '@/components/ui/RegionSelector';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

// Product card
<ProductCard
  product={product}
  onAddToCart={handleAddToCart}
  onAddToWishlist={handleAddToWishlist}
/>

// Region selector
<RegionSelector
  className="mb-4"
  showLabel={true}
/>

// Optimized image
<OptimizedImage
  src="/product-image.jpg"
  alt="Product image"
  width={300}
  height={200}
  priority={false}
/>
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### AWS Deployment
1. Set up AWS credentials
2. Run `npm run deploy:staging` for staging
3. Run `npm run deploy:production` for production

### Environment-Specific Configs
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

## 🧪 Testing

### Unit Tests (Vitest)
```bash
npm run test:unit
```
- Component testing
- Utility function testing
- Hook testing
- Mock implementations

### E2E Tests (Playwright)
```bash
npm run test:e2e
```
- User journey testing
- Cross-browser testing
- Mobile responsiveness testing

### Accessibility Tests
```bash
npm run test:a11y
```
- WCAG AA compliance
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation

### Test Coverage
- Target: 80%+ coverage
- Critical paths: 100% coverage
- Components: 90%+ coverage

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules
rm -rf node_modules
npm install
```

#### Database Connection Issues
```bash
# Check Supabase connection
npm run db:test-connection

# Reset database
npm run db:reset
```

#### Environment Variables
```bash
# Verify environment variables
npm run env:check
```

#### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check Core Web Vitals
npm run lighthouse
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Enable specific debug modules
DEBUG=next:* npm run dev
```

### Logs and Monitoring
- **Development**: Console logs
- **Staging**: Supabase logs
- **Production**: CloudWatch/Sentry logs

## 📞 Support

### Internal Resources
- **Slack**: #newhill-spices-dev
- **Wiki**: Internal documentation
- **Jira**: Issue tracking

### External Resources
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## 🎉 Congratulations!

You're now ready to contribute to the Newhill Spices platform! 

For questions or support, reach out to the development team or create an issue in the repository.

