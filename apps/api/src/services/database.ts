import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Database Service - Singleton Prisma Client
 * 
 * Features:
 * - Connection pooling
 * - Error handling
 * - Logging
 * - Graceful shutdown
 */
class DatabaseService {
  private static instance: PrismaClient | null = null;
  private static isConnected: boolean = false;

  /**
   * Get Prisma Client instance
   */
  static getInstance(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        log: [
          {
            emit: 'event',
            level: 'query',
          },
          {
            emit: 'event',
            level: 'error',
          },
          {
            emit: 'event',
            level: 'warn',
          },
        ],
        errorFormat: 'pretty',
      });

      // Query logging in development
      if (process.env.NODE_ENV === 'development') {
        this.instance.$on('query', (e: any) => {
          logger.debug('Prisma Query:', {
            query: e.query,
            params: e.params,
            duration: `${e.duration}ms`,
          });
        });
      }

      // Error logging
      this.instance.$on('error', (e: any) => {
        logger.error('Prisma Error:', {
          message: e.message,
          target: e.target,
        });
      });

      // Warning logging
      this.instance.$on('warn', (e: any) => {
        logger.warn('Prisma Warning:', {
          message: e.message,
        });
      });

      logger.info('Prisma Client initialized');
    }

    return this.instance;
  }

  /**
   * Connect to database
   */
  static async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    try {
      const client = this.getInstance();
      await client.$connect();
      this.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Disconnect from database
   */
  static async disconnect(): Promise<void> {
    if (!this.instance || !this.isConnected) {
      return;
    }

    try {
      await this.instance.$disconnect();
      this.isConnected = false;
      this.instance = null;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
      throw error;
    }
  }

  /**
   * Check database health
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const client = this.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection status
   */
  static isConnectionActive(): boolean {
    return this.isConnected;
  }

  /**
   * Execute in transaction
   */
  static async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    const client = this.getInstance();
    return client.$transaction(async (tx) => {
      return fn(tx as PrismaClient);
    });
  }

  /**
   * Handle Prisma errors and return user-friendly messages
   */
  static handleError(error: any): Error {
    // Prisma error codes
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'field';
      return new Error(`A record with this ${field} already exists`);
    }

    if (error.code === 'P2025') {
      return new Error('Record not found');
    }

    if (error.code === 'P2003') {
      return new Error('Foreign key constraint failed');
    }

    if (error.code === 'P2014') {
      return new Error('Invalid relation');
    }

    if (error.code === 'P2021') {
      return new Error('Table does not exist');
    }

    if (error.code === 'P2022') {
      return new Error('Column does not exist');
    }

    // Generic database error
    logger.error('Database error:', {
      code: error.code,
      message: error.message,
      meta: error.meta,
    });

    return new Error('Database operation failed');
  }
}

// Export singleton instance
export const prisma = DatabaseService.getInstance();
export default DatabaseService;
