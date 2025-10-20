import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import DatabaseService from '../services/database';
import Redis from 'ioredis';

const router = Router();

// Basic health check interface
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    memory: MemoryHealth;
  };
}

interface ServiceHealth {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

interface MemoryHealth {
  status: 'normal' | 'high' | 'critical';
  used: number;
  total: number;
  percentage: number;
}

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *       503:
 *         description: Service is unhealthy
 */
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const dbStartTime = Date.now();
    const isDatabaseHealthy = await DatabaseService.healthCheck();
    const dbResponseTime = Date.now() - dbStartTime;

    // Check Redis connection
    const redisStartTime = Date.now();
    let isRedisHealthy = false;
    let redisError: string | undefined;
    
    try {
      const redisClient = req.app.locals.redis as Redis;
      if (redisClient) {
        const pingResult = await redisClient.ping();
        isRedisHealthy = pingResult === 'PONG';
      }
    } catch (error) {
      redisError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    const redisResponseTime = Date.now() - redisStartTime;

    // Check memory usage
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;
    
    let memoryStatus: 'normal' | 'high' | 'critical' = 'normal';
    if (memoryPercentage > 90) {
      memoryStatus = 'critical';
    } else if (memoryPercentage > 75) {
      memoryStatus = 'high';
    }

    // Determine overall health status
    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    
    if (!isDatabaseHealthy) {
      overallStatus = 'unhealthy';
    } else if (!isRedisHealthy || memoryStatus === 'critical') {
      overallStatus = 'degraded';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: isDatabaseHealthy ? 'up' : 'down',
          responseTime: dbResponseTime,
        },
        redis: {
          status: isRedisHealthy ? 'up' : 'down',
          responseTime: redisResponseTime,
          error: redisError,
        },
        memory: {
          status: memoryStatus,
          used: Math.round(usedMemory / 1024 / 1024), // MB
          total: Math.round(totalMemory / 1024 / 1024), // MB
          percentage: Math.round(memoryPercentage * 100) / 100,
        },
      },
    };

    // Log health check if unhealthy
    if (overallStatus !== 'healthy') {
      logger.warn('Health check returned non-healthy status:', healthStatus);
    }

    const statusCode = overallStatus === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness check endpoint
 *     description: Returns 200 if all critical services are ready
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is ready to accept traffic
 *       503:
 *         description: Service is not ready
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const isDatabaseHealthy = await DatabaseService.healthCheck();
    
    if (isDatabaseHealthy) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: 'Database connection failed',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness check endpoint
 *     description: Returns 200 if the service process is alive
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is alive
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
