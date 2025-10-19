import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import crypto from 'crypto';

/**
 * Cache configuration
 */
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  keyPrefix: string;
  skipCache?: (req: Request) => boolean;
  keyGenerator?: (req: Request) => string;
  varyBy?: string[]; // Headers to vary cache by
}

/**
 * Cache middleware class
 */
export class CacheMiddleware {
  private static redisClient: Redis;
  private static defaultTTL = 300; // 5 minutes
  private static defaultKeyPrefix = 'api:cache:';

  /**
   * Initialize Redis client
   */
  static initialize(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  /**
   * Generate cache key
   */
  private static generateCacheKey(req: Request, config: CacheConfig): string {
    if (config.keyGenerator) {
      return `${config.keyPrefix}${config.keyGenerator(req)}`;
    }

    const baseKey = `${req.method}:${req.originalUrl}`;
    const varyHeaders = config.varyBy || [];
    
    // Add varying headers to key
    const varyValues = varyHeaders
      .map(header => req.headers[header.toLowerCase()] || '')
      .join(':');

    // Add query parameters to key
    const queryString = Object.keys(req.query)
      .sort()
      .map(key => `${key}=${req.query[key]}`)
      .join('&');

    const fullKey = `${baseKey}:${varyValues}:${queryString}`;
    return `${config.keyPrefix}${crypto.createHash('md5').update(fullKey).digest('hex')}`;
  }

  /**
   * Get cache entry
   */
  private static async getCache(key: string): Promise<any> {
    try {
      const cached = await this.redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cache entry
   */
  private static async setCache(key: string, data: any, ttl: number): Promise<void> {
    try {
      await this.redisClient.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  /**
   * Delete cache entry
   */
  private static async deleteCache(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  /**
   * Cache middleware factory
   */
  static cache = (config: CacheConfig) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // Skip cache if configured
      if (config.skipCache && config.skipCache(req)) {
        return next();
      }

      const cacheKey = this.generateCacheKey(req, config);
      
      try {
        // Try to get from cache
        const cached = await this.getCache(cacheKey);
        
        if (cached) {
          // Set cache headers
          res.set({
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey,
            'Cache-Control': `public, max-age=${config.ttl}`,
            'ETag': cached.etag,
          });
          
          return res.json(cached.data);
        }

        // Cache miss - continue to handler
        res.locals.cacheKey = cacheKey;
        res.locals.cacheConfig = config;
        
        // Override res.json to cache response
        const originalJson = res.json.bind(res);
        res.json = (data: any) => {
          // Generate ETag
          const etag = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
          
          // Cache the response
          this.setCache(cacheKey, { data, etag }, config.ttl);
          
          // Set cache headers
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey,
            'Cache-Control': `public, max-age=${config.ttl}`,
            'ETag': etag,
          });
          
          return originalJson(data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  };

  /**
   * Invalidate cache by pattern
   */
  static invalidatePattern = async (pattern: string): Promise<void> => {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  };

  /**
   * Invalidate cache by key
   */
  static invalidateKey = async (key: string): Promise<void> => {
    try {
      await this.deleteCache(key);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  };

  /**
   * Clear all cache
   */
  static clearAll = async (): Promise<void> => {
    try {
      await this.redisClient.flushdb();
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  };
}

/**
 * Predefined cache configurations
 */
export const CacheConfigs = {
  // Product listing cache (5 minutes)
  productList: {
    ttl: 300,
    keyPrefix: 'products:list:',
    varyBy: ['accept-language', 'x-currency', 'x-region'],
    skipCache: (req: Request) => req.query.search !== undefined,
  },

  // Product detail cache (1 hour)
  productDetail: {
    ttl: 3600,
    keyPrefix: 'products:detail:',
    varyBy: ['accept-language', 'x-currency', 'x-region'],
  },

  // Search results cache (2 minutes)
  searchResults: {
    ttl: 120,
    keyPrefix: 'search:results:',
    varyBy: ['accept-language', 'x-currency', 'x-region'],
  },

  // Category cache (30 minutes)
  categories: {
    ttl: 1800,
    keyPrefix: 'categories:',
    varyBy: ['accept-language'],
  },

  // Static content cache (1 day)
  staticContent: {
    ttl: 86400,
    keyPrefix: 'static:',
    varyBy: ['accept-language'],
  },

  // Admin data cache (5 minutes)
  adminData: {
    ttl: 300,
    keyPrefix: 'admin:',
    skipCache: (req: Request) => req.user?.role !== 'admin',
  },

  // User-specific cache (no caching for authenticated users)
  userSpecific: {
    ttl: 0,
    keyPrefix: 'user:',
    skipCache: (req: Request) => !!req.user,
  },
};

/**
 * Cache invalidation helpers
 */
export class CacheInvalidation {
  /**
   * Invalidate product cache
   */
  static invalidateProduct = async (productId: string): Promise<void> => {
    await CacheMiddleware.invalidatePattern(`products:detail:${productId}*`);
    await CacheMiddleware.invalidatePattern('products:list:*');
    await CacheMiddleware.invalidatePattern('search:results:*');
  };

  /**
   * Invalidate category cache
   */
  static invalidateCategory = async (categoryId: string): Promise<void> => {
    await CacheMiddleware.invalidatePattern(`categories:${categoryId}*`);
    await CacheMiddleware.invalidatePattern('products:list:*');
  };

  /**
   * Invalidate user cache
   */
  static invalidateUser = async (userId: string): Promise<void> => {
    await CacheMiddleware.invalidatePattern(`user:${userId}*`);
  };

  /**
   * Invalidate admin cache
   */
  static invalidateAdmin = async (): Promise<void> => {
    await CacheMiddleware.invalidatePattern('admin:*');
  };

  /**
   * Invalidate all product caches
   */
  static invalidateAllProducts = async (): Promise<void> => {
    await CacheMiddleware.invalidatePattern('products:*');
    await CacheMiddleware.invalidatePattern('search:results:*');
  };

  /**
   * Invalidate all caches
   */
  static invalidateAll = async (): Promise<void> => {
    await CacheMiddleware.clearAll();
  };
}

/**
 * ETag middleware for conditional requests
 */
export class ETagMiddleware {
  /**
   * Generate ETag for response
   */
  static generateETag = (data: any): string => {
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  };

  /**
   * Check if request has matching ETag
   */
  static checkETag = (req: Request, etag: string): boolean => {
    const ifNoneMatch = req.headers['if-none-match'];
    return ifNoneMatch === etag || ifNoneMatch === `"${etag}"`;
  };

  /**
   * ETag middleware
   */
  static handle = (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);
    
    res.json = (data: any) => {
      const etag = this.generateETag(data);
      
      // Check if client has matching ETag
      if (this.checkETag(req, etag)) {
        res.status(304).end();
        return;
      }
      
      // Set ETag header
      res.set('ETag', `"${etag}"`);
      
      return originalJson(data);
    };
    
    next();
  };
}

/**
 * Cache warming utilities
 */
export class CacheWarming {
  /**
   * Warm product cache
   */
  static warmProductCache = async (productId: string, languages: string[] = ['en']): Promise<void> => {
    // Implementation would depend on your specific needs
    // This is a placeholder for cache warming logic
    console.log(`Warming cache for product ${productId} in languages: ${languages.join(', ')}`);
  };

  /**
   * Warm category cache
   */
  static warmCategoryCache = async (categoryId: string, languages: string[] = ['en']): Promise<void> => {
    console.log(`Warming cache for category ${categoryId} in languages: ${languages.join(', ')}`);
  };

  /**
   * Warm search cache
   */
  static warmSearchCache = async (queries: string[], languages: string[] = ['en']): Promise<void> => {
    console.log(`Warming search cache for queries: ${queries.join(', ')} in languages: ${languages.join(', ')}`);
  };
}

