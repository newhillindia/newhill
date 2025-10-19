# Phase 4: API Layer Documentation

## Overview

The Newhill Spices Platform API is a comprehensive, role-aware API system designed for multi-language and multi-currency support across India and GCC markets. The API follows RESTful principles with versioning, comprehensive security, caching, and observability.

## API Architecture

### Base URL
- **Development**: `http://localhost:3001`
- **Production**: `https://api.newhillspices.com`

### Versioning
- **Current Version**: v1
- **Version Header**: `X-API-Version: v1`
- **URL Pattern**: `/api/v1/{endpoint}`

### Response Format
All API responses follow a standardized format:

```json
{
  "success": boolean,
  "data": object | array,
  "error": {
    "status": number,
    "code": string,
    "message": string,
    "details": object
  },
  "meta": {
    "traceId": string,
    "timestamp": string,
    "version": "v1"
  }
}
```

## Authentication & Authorization

### Authentication Methods
1. **JWT Bearer Token** (Primary)
2. **API Key** (For service-to-service)
3. **Session-based** (For web applications)

### User Roles
- **Consumer**: B2C customers with 5kg weight limit
- **B2B**: Business customers with bulk pricing
- **Admin**: Full system access

### Authorization Headers
```http
Authorization: Bearer <jwt-token>
X-API-Key: <api-key>
X-Currency: INR
X-Region: IN
Accept-Language: en
```

## API Endpoints

### Public APIs

#### Products
- `GET /api/v1/products` - List products with filtering
- `GET /api/v1/products/{slug}` - Get product details
- `GET /api/v1/products/ids` - Bulk fetch products by IDs

**Features:**
- Multi-language support via `Accept-Language` header
- Multi-currency support via `X-Currency` header
- Advanced filtering (category, price, weight, region, etc.)
- Pagination with metadata
- CDN caching with 5-minute TTL

#### Search
- `POST /api/v1/search` - Full-text search
- `GET /api/v1/search/suggestions` - Search suggestions
- `GET /api/v1/search/popular` - Popular search terms

**Features:**
- Rate limited (20 requests/minute)
- Multi-language search
- "Did you mean" suggestions
- Filter options and faceted search
- 2-minute cache TTL

### Authenticated APIs

#### Cart Management
- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart` - Add item to cart
- `PATCH /api/v1/cart` - Update cart items
- `DELETE /api/v1/cart/{itemId}` - Remove item
- `POST /api/v1/cart/merge` - Merge guest cart
- `DELETE /api/v1/cart/clear` - Clear cart

**Features:**
- Real-time stock validation
- B2B weight restrictions (5kg rule)
- Automatic tax calculation
- Cart persistence across sessions

#### Orders
- `GET /api/v1/orders` - List user's orders
- `GET /api/v1/orders/{id}` - Get order details
- `POST /api/v1/orders` - Create order (checkout)
- `POST /api/v1/orders/{id}/cancel` - Cancel order

**Features:**
- Idempotency key support
- Multi-step checkout process
- Payment integration (Razorpay, Stripe)
- Order status tracking
- Audit trail

#### Wishlist
- `GET /api/v1/wishlist` - Get user's wishlist
- `POST /api/v1/wishlist` - Add to wishlist
- `DELETE /api/v1/wishlist/{productId}` - Remove from wishlist
- `DELETE /api/v1/wishlist/clear` - Clear wishlist
- `POST /api/v1/wishlist/share` - Generate share link
- `GET /api/v1/wishlist/shared/{token}` - View shared wishlist

**Features:**
- Shareable wishlist links
- Product snapshot preservation
- Cross-device synchronization

### Admin APIs

#### KPIs & Analytics
- `GET /api/v1/admin/kpi` - Get system KPIs

**Metrics:**
- Revenue (total, daily, monthly, growth)
- Orders (counts by status)
- Products (total, active, stock levels)
- Customers (total, new, active, B2B)
- Conversion rates and AOV

#### Product Management
- `GET /api/v1/admin/products` - List all products
- `POST /api/v1/admin/products` - Create product
- `PUT /api/v1/admin/products/{id}` - Update product
- `DELETE /api/v1/admin/products/{id}` - Delete product

#### System Configuration
- `GET /api/v1/admin/toggles` - Get system toggles
- `POST /api/v1/admin/toggles` - Update toggle
- `GET /api/v1/admin/currency` - Get currency rates
- `POST /api/v1/admin/currency` - Update currency rate

#### Audit & Monitoring
- `GET /api/v1/admin/audit-logs` - Get audit logs

**Audit Events:**
- User actions
- System changes
- API calls
- Security events

### Webhook APIs

#### Payment Webhooks
- `POST /api/v1/webhooks/payments/razorpay` - Razorpay events
- `POST /api/v1/webhooks/payments/stripe` - Stripe events

#### Shipping Webhooks
- `POST /api/v1/webhooks/shipping/bluedart` - Blue Dart tracking
- `POST /api/v1/webhooks/shipping/delhivery` - Delhivery tracking
- `POST /api/v1/webhooks/shipping/fedex` - FedEx tracking

**Webhook Features:**
- Signature verification
- Idempotency handling
- Retry logic
- Event processing

## Security Features

### Rate Limiting
- **General API**: 100 requests/15 minutes
- **Search**: 20 requests/minute
- **Auth**: 5 requests/15 minutes
- **Checkout**: 3 requests/5 minutes
- **Admin**: 200 requests/15 minutes
- **Webhooks**: 100 requests/minute

### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HTTPS)

### Input Validation
- Zod schema validation
- XSS protection
- CSRF protection
- SQL injection prevention
- File upload validation

### Authentication Security
- JWT with secure signing
- Token expiration
- Refresh token rotation
- Role-based access control
- IP whitelisting (optional)

## Caching Strategy

### Cache Layers
1. **CDN Cache** (CloudFront)
   - Static assets: 1 day
   - Product images: 1 week
   - API responses: 5 minutes

2. **Edge Cache** (Redis)
   - Product listings: 5 minutes
   - Product details: 1 hour
   - Search results: 2 minutes
   - Categories: 30 minutes

3. **Application Cache**
   - User sessions: 24 hours
   - System toggles: 1 minute
   - Currency rates: 5 minutes

### Cache Invalidation
- Product updates → Clear product caches
- Order changes → Clear user caches
- System changes → Clear admin caches
- Manual invalidation via admin panel

## Error Handling

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "message": "Invalid email format"
    }
  },
  "meta": {
    "traceId": "req-123456",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  }
}
```

## Monitoring & Observability

### Logging
- **Structured Logging**: JSON format with trace IDs
- **Log Levels**: ERROR, WARN, INFO, DEBUG
- **Log Destinations**: CloudWatch, Sentry, Console
- **Log Retention**: 30 days (production), 7 days (development)

### Metrics
- **Request Metrics**: Count, latency, error rate
- **Business Metrics**: Orders, revenue, conversion
- **System Metrics**: CPU, memory, database connections
- **Custom Metrics**: Cache hit rate, payment success rate

### Tracing
- **Distributed Tracing**: Request flow across services
- **Trace ID**: Unique identifier for each request
- **Span Information**: Service boundaries and timing
- **Error Tracking**: Detailed error context and stack traces

## Multi-Language Support

### Language Headers
- `Accept-Language: en` (English)
- `Accept-Language: hi` (Hindi)
- `Accept-Language: ar` (Arabic)

### Supported Languages
- **English** (en) - Default
- **Hindi** (hi) - India market
- **Arabic** (ar) - GCC market

### Language-Specific Features
- Product names and descriptions
- Error messages
- Search suggestions
- UI text content

## Multi-Currency Support

### Currency Headers
- `X-Currency: INR` (Indian Rupee)
- `X-Currency: AED` (UAE Dirham)
- `X-Currency: SAR` (Saudi Riyal)
- `X-Currency: USD` (US Dollar)

### Supported Currencies
- **INR** - India (default)
- **AED** - UAE
- **SAR** - Saudi Arabia
- **USD** - International

### Currency Features
- Real-time exchange rates
- Automatic price conversion
- Currency-specific pricing
- Tax calculation by region

## API Documentation

### Interactive Documentation
- **Swagger UI**: `/api-docs`
- **OpenAPI Spec**: `/api-docs.json`
- **Postman Collection**: Available on request

### Documentation Features
- Interactive API explorer
- Request/response examples
- Authentication testing
- Code generation for clients

## Testing

### Test Coverage
- **Unit Tests**: 90%+ coverage
- **Integration Tests**: All API endpoints
- **E2E Tests**: Critical user journeys
- **Load Tests**: Performance validation

### Test Types
- **Contract Tests**: API schema validation
- **Security Tests**: Authentication and authorization
- **Performance Tests**: Response time and throughput
- **Chaos Tests**: Failure scenario testing

## Deployment

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis
REDIS_URL=redis://host:port

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d

# Payment Providers
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
STRIPE_SECRET_KEY=your-secret-key

# Webhook Secrets
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# External Services
SENTRY_DSN=your-sentry-dsn
CLOUDWATCH_LOG_GROUP=your-log-group
```

## Performance Optimization

### Response Time Targets
- **Product List**: < 200ms
- **Product Detail**: < 100ms
- **Search**: < 500ms
- **Cart Operations**: < 150ms
- **Checkout**: < 2s

### Optimization Techniques
- **Database Indexing**: Optimized queries
- **Connection Pooling**: Efficient DB connections
- **Query Optimization**: Reduced N+1 queries
- **Caching**: Multi-layer caching strategy
- **CDN**: Global content delivery

## Security Best Practices

### Data Protection
- **Encryption**: Data encrypted at rest and in transit
- **PII Handling**: Secure personal information processing
- **PCI Compliance**: Secure payment data handling
- **GDPR Compliance**: Data privacy regulations

### API Security
- **HTTPS Only**: All API communication encrypted
- **Input Validation**: Comprehensive data validation
- **Output Encoding**: XSS prevention
- **Rate Limiting**: DDoS protection
- **Authentication**: Secure token-based auth

## Troubleshooting

### Common Issues
1. **Authentication Errors**: Check JWT token validity
2. **Rate Limit Exceeded**: Wait and retry with backoff
3. **Validation Errors**: Check request format and required fields
4. **Cache Issues**: Clear cache or wait for TTL expiration

### Debug Information
- **Trace ID**: Include in support requests
- **Request Headers**: Check authentication and content type
- **Response Codes**: Refer to error code documentation
- **Logs**: Check application logs for detailed errors

## Support

### API Support
- **Documentation**: `/api-docs`
- **Status Page**: `https://status.newhillspices.com`
- **Support Email**: `api-support@newhillspices.com`
- **Slack Channel**: `#api-support`

### Rate Limits
- **Free Tier**: 1000 requests/day
- **Pro Tier**: 10000 requests/day
- **Enterprise**: Custom limits

### SLA
- **Uptime**: 99.9%
- **Response Time**: < 200ms (95th percentile)
- **Support Response**: < 4 hours (business hours)

---

This comprehensive API documentation covers all aspects of the Newhill Spices Platform API implementation, providing developers with the information needed to integrate and use the API effectively.

