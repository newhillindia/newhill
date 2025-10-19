# Phase 2: Authentication & User Management Setup Guide

This guide covers the complete implementation of Phase 2: Authentication & User Management for the Newhill Spices Platform.

## 🎯 Overview

Phase 2 implements a comprehensive authentication and user management system with:
- Multi-provider authentication (Email OTP, Google OAuth, Credentials)
- Role-based access control (Admin, B2B, B2C)
- B2C order limits with B2B upgrade flow
- Multi-language support
- Admin dashboard with audit logging
- User profile management

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install web app dependencies
cd apps/web
npm install

# Install additional packages for authentication
npm install next-auth @auth/prisma-adapter prisma @prisma/client
npm install bcryptjs jsonwebtoken nodemailer
npm install react-hook-form @hookform/resolvers zod
npm install react-i18next i18next i18next-browser-languagedetector
npm install react-query @tanstack/react-query axios react-hot-toast
npm install lucide-react
```

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/newhill_spices"

# Email Configuration (for OTP)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@newhillspices.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Secret
JWT_SECRET=your-jwt-secret-key

# Redis (for OTP storage in production)
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 4. Start Development Server

```bash
# Start the web application
npm run dev

# Or start all services with Docker
npm run docker:up
```

## 🔐 Authentication Features

### Supported Authentication Methods

1. **Email OTP**: Passwordless authentication via email
2. **Google OAuth**: Social login with Google
3. **Credentials**: Traditional email/password login

### User Roles

- **B2C (Individual Customer)**: Personal use, 5kg order limit
- **B2B (Business Customer)**: Bulk orders, no weight limits
- **ADMIN**: Full platform access, audit logs, user management

### Role-Based Access Control

- `RoleGuard` component protects routes based on user roles
- API endpoints validate user permissions
- UI elements show/hide based on user role

## 🌍 Multi-Language Support

### Supported Languages

- English (en) - Default
- Spanish (es)
- French (fr)

### Language Features

- Automatic language detection
- Persistent language selection
- Translated authentication flows
- Localized error messages
- Multi-language email templates

### Adding New Languages

1. Add translations to `src/lib/i18n.ts`
2. Update language selector in profile
3. Add email templates for new language

## 🏢 B2B Application Flow

### Application Process

1. User attempts order > 5kg
2. System shows B2B upgrade prompt
3. User fills comprehensive application form
4. Admin reviews and approves/rejects
5. User gains B2B access upon approval

### Application Form Fields

- Business Information (name, type, tax details)
- Business Address
- Contact Information
- Expected Monthly Volume
- Website (optional)

## 👤 User Profile Management

### Profile Features

- Personal Information (name, phone, DOB)
- Address Management
- Language Preferences
- Currency Selection
- Real-time language switching

### Profile API

- `GET /api/profile` - Fetch user profile
- `PUT /api/profile` - Update user profile
- Automatic audit logging for changes

## 🔍 Admin Dashboard

### Admin Features

- User metrics and statistics
- Order management
- B2B application review
- Comprehensive audit logs
- System monitoring

### Audit Logging

All sensitive actions are logged with:
- User information
- Action type
- Timestamp
- IP address
- User agent
- Additional details

### Audit Log Actions

- `SIGN_IN` - User login
- `PROFILE_UPDATED` - Profile changes
- `B2B_APPLICATION_CREATED` - B2B applications
- `ADMIN_METRICS_ACCESSED` - Admin dashboard access

## 🛡️ Security Features

### Authentication Security

- JWT-based sessions
- Secure password hashing (bcrypt)
- OTP expiration (10 minutes)
- Rate limiting on auth endpoints
- CSRF protection

### Authorization Security

- Role-based route protection
- API endpoint authorization
- Admin-only features protection
- Audit trail for sensitive actions

### Data Protection

- Input validation with Zod
- SQL injection prevention (Prisma)
- XSS protection
- Secure headers

## 📱 API Endpoints

### Authentication

- `POST /api/auth/send-otp` - Send OTP email
- `GET /api/auth/[...nextauth]` - NextAuth endpoints

### User Management

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `POST /api/b2b/application` - Submit B2B application

### Admin

- `GET /api/admin/metrics` - Get dashboard metrics

## 🧪 Testing

### Test Authentication Flows

1. **Email OTP Flow**:
   - Enter email → Receive OTP → Verify → Login

2. **Google OAuth Flow**:
   - Click Google sign-in → OAuth flow → Login

3. **B2B Application Flow**:
   - Try to order >5kg → Upgrade prompt → Application form

4. **Role-based Access**:
   - Test admin-only routes
   - Test B2B-only features
   - Test B2C limitations

### Test Multi-language

1. Change language in profile
2. Verify UI translations
3. Test email templates
4. Check error messages

## 🚀 Deployment

### Environment Setup

1. Set up production database
2. Configure email service (SES recommended)
3. Set up Google OAuth credentials
4. Configure Redis for OTP storage
5. Set up monitoring and logging

### Production Considerations

- Use AWS SES for email delivery
- Implement Redis for OTP storage
- Set up proper logging and monitoring
- Configure rate limiting
- Set up backup and recovery

## 🔧 Troubleshooting

### Common Issues

1. **OTP not sending**: Check email configuration
2. **Google OAuth failing**: Verify client credentials
3. **Database errors**: Check Prisma connection
4. **Translation not working**: Verify i18n configuration

### Debug Mode

Enable debug mode in development:
```env
NODE_ENV=development
NEXTAUTH_DEBUG=true
```

## 📚 Next Steps

After completing Phase 2, you can proceed to:

1. **Phase 3**: Product Catalog & Inventory Management
2. **Phase 4**: Order Management & Payment Processing
3. **Phase 5**: Shipping & Logistics Integration
4. **Phase 6**: Analytics & Reporting

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the audit logs for errors
3. Check the browser console for client-side issues
4. Review server logs for backend issues

## 📄 License

This implementation is part of the Newhill Spices Platform and follows the project's licensing terms.
