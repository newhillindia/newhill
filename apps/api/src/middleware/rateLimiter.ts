import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';
import { RateLimitError } from '@newhill/shared/types/api';

// Rate limiting configurations for different endpoints
export const rateLimitConfigs = {
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many requests from this IP, please try again later.');
    },
  }),

  // Strict rate limiting for search endpoints
  search: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 20, // limit each IP to 20 search requests per minute
    message: {
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many search requests, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many search requests, please try again later.');
    },
  }),

  // Authentication endpoints rate limiting
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many authentication attempts, please try again later.');
    },
  }),

  // Checkout endpoints rate limiting
  checkout: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // limit each IP to 3 checkout attempts per 5 minutes
    message: {
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many checkout attempts, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many checkout attempts, please try again later.');
    },
  }),

  // Admin endpoints rate limiting
  admin: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 admin requests per windowMs
    message: {
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many admin requests, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many admin requests, please try again later.');
    },
  }),

  // Webhook endpoints rate limiting
  webhook: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 webhook requests per minute
    message: {
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many webhook requests, please try again later.',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      throw new RateLimitError('Too many webhook requests, please try again later.');
    },
  }),
};

// Slow down configurations for different endpoints
export const slowDownConfigs = {
  // General slow down
  general: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: 500, // add 500ms delay per request above delayAfter
    maxDelayMs: 20000, // max delay of 20 seconds
  }),

  // Search slow down
  search: slowDown({
    windowMs: 1 * 60 * 1000, // 1 minute
    delayAfter: 10, // allow 10 requests per minute, then...
    delayMs: 1000, // add 1 second delay per request above delayAfter
    maxDelayMs: 10000, // max delay of 10 seconds
  }),

  // Auth slow down
  auth: slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 2, // allow 2 requests per 15 minutes, then...
    delayMs: 2000, // add 2 second delay per request above delayAfter
    maxDelayMs: 30000, // max delay of 30 seconds
  }),
};

// Custom rate limiter for specific use cases
export class CustomRateLimiter {
  private static redisClient: any; // Redis client instance
  private static defaultWindowMs = 15 * 60 * 1000; // 15 minutes
  private static defaultMaxRequests = 100;

  /**
   * Initialize Redis client for distributed rate limiting
   */
  static initialize(redisClient: any) {
    this.redisClient = redisClient;
  }

  /**
   * Check rate limit for a specific key
   */
  static async checkRateLimit(
    key: string,
    windowMs: number = this.defaultWindowMs,
    maxRequests: number = this.defaultMaxRequests
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    if (!this.redisClient) {
      throw new Error('Redis client not initialized');
    }

    const now = Date.now();
    const windowStart = now - windowMs;
    const resetTime = now + windowMs;

    // Use Redis sorted set for sliding window rate limiting
    const pipeline = this.redisClient.pipeline();
    
    // Remove expired entries
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    const currentRequests = results[1][1] as number;

    return {
      allowed: currentRequests < maxRequests,
      remaining: Math.max(0, maxRequests - currentRequests - 1),
      resetTime,
    };
  }

  /**
   * Rate limiter middleware factory
   */
  static createRateLimiter(
    keyGenerator: (req: Request) => string,
    windowMs: number = this.defaultWindowMs,
    maxRequests: number = this.defaultMaxRequests
  ) {
    return async (req: Request, res: Response, next: Function) => {
      try {
        const key = `rate_limit:${keyGenerator(req)}`;
        const result = await this.checkRateLimit(key, windowMs, maxRequests);

        if (!result.allowed) {
          res.set({
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
          });
          throw new RateLimitError('Rate limit exceeded');
        }

        res.set({
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        });

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

// IP-based rate limiter
export const ipRateLimiter = CustomRateLimiter.createRateLimiter(
  (req: Request) => req.ip || req.connection.remoteAddress || 'unknown',
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests per 15 minutes
);

// User-based rate limiter (requires authentication)
export const userRateLimiter = CustomRateLimiter.createRateLimiter(
  (req: Request) => `user:${req.user?.id || 'anonymous'}`,
  15 * 60 * 1000, // 15 minutes
  200 // 200 requests per 15 minutes
);

// API key-based rate limiter
export const apiKeyRateLimiter = CustomRateLimiter.createRateLimiter(
  (req: Request) => `apikey:${req.headers['x-api-key'] || 'none'}`,
  15 * 60 * 1000, // 15 minutes
  1000 // 1000 requests per 15 minutes
);

// Export default rate limiter
export const defaultRateLimiter = rateLimitConfigs.general;