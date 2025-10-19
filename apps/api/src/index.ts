import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import 'express-async-errors';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { defaultRateLimiter } from './middleware/rateLimiter';
import { 
  RequestIdMiddleware, 
  SecurityHeadersMiddleware, 
  CSPMiddleware, 
  XSSMiddleware 
} from './middleware/security';
import { CacheMiddleware } from './middleware/caching';
import { RequestMetrics } from './utils/metrics';
import Redis from 'ioredis';

// Import route handlers
import healthRoutes from './routes/health';
import productRoutes from './routes/products';
import userRoutes from './routes/users';
import metricsRoutes from './routes/metrics';

// Import v1 API routes
import productV1Routes from './routes/v1/products';
import searchV1Routes from './routes/v1/search';
import cartV1Routes from './routes/v1/cart';
import orderV1Routes from './routes/v1/orders';
import wishlistV1Routes from './routes/v1/wishlist';
import adminV1Routes from './routes/v1/admin';
import webhookV1Routes from './routes/v1/webhooks';
import checkoutV1Routes from './routes/v1/checkout';
import userV1Routes from './routes/v1/users';
import addressV1Routes from './routes/v1/addresses';
import paymentV1Routes from './routes/v1/payments';
import b2bV1Routes from './routes/v1/b2b';
import { setupSwagger } from './docs/swagger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Redis client for caching
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
CacheMiddleware.initialize(redisClient);

// Security middleware
app.use(SecurityHeadersMiddleware.addHeaders);
app.use(CSPMiddleware.protect);
app.use(XSSMiddleware.protect);

// Request ID middleware
app.use(RequestIdMiddleware.addRequestId);

// Basic middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.stripe.com", "https://api.razorpay.com"],
      frameSrc: ["'self'", "https://js.stripe.com", "https://checkout.razorpay.com"],
    },
  },
}));

app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token', 'X-Currency', 'X-Region', 'Accept-Language'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(defaultRateLimiter);

// Request metrics middleware
app.use(RequestMetrics.collect);

// Health check route (no rate limiting)
app.use('/health', healthRoutes);

// Metrics route (no rate limiting)
app.use('/metrics', metricsRoutes);

// API versioning
app.use('/api/v1', (req, res, next) => {
  // Add API version to response headers
  res.set('X-API-Version', 'v1');
  next();
});

// V1 API routes
app.use('/api/v1/products', productV1Routes);
app.use('/api/v1/search', searchV1Routes);
app.use('/api/v1/cart', cartV1Routes);
app.use('/api/v1/orders', orderV1Routes);
app.use('/api/v1/wishlist', wishlistV1Routes);
app.use('/api/v1/admin', adminV1Routes);
app.use('/api/v1/webhooks', webhookV1Routes);
app.use('/api/v1/checkout', checkoutV1Routes);
app.use('/api/v1/users', userV1Routes);
app.use('/api/v1/addresses', addressV1Routes);
app.use('/api/v1/payments', paymentV1Routes);
app.use('/api/v1/b2b', b2bV1Routes);

// Legacy API routes (for backward compatibility)
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// API Documentation
setupSwagger(app);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  redisClient.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  redisClient.disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`API Version: v1`);
  logger.info(`Redis connected: ${redisClient.status}`);
});

export default app;
