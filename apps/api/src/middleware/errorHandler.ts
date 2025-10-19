import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { 
  ApiError, 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError, 
  ConflictError, 
  RateLimitError, 
  InternalServerError 
} from '@newhill/shared/types/api';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const traceId = req.traceId || 'unknown';
  const userId = req.user?.id || 'anonymous';
  
  // Log error with structured data
  logger.error('API Error occurred', {
    traceId,
    userId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      headers: req.headers,
    },
    timestamp: new Date().toISOString(),
  });

  // Handle different error types
  if (error instanceof ApiError) {
    return res.status(error.status).json({
      success: false,
      error: {
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        status: 400,
        code: 'VALIDATION_ERROR',
        message: error.message,
      },
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        status: 401,
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      },
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  }

  // Handle token expiry
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        status: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
      },
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  }

  // Handle database errors
  if (error.name === 'DatabaseError') {
    return res.status(500).json({
      success: false,
      error: {
        status: 500,
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
      },
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  }

  // Handle rate limit errors
  if (error.name === 'RateLimitError') {
    return res.status(429).json({
      success: false,
      error: {
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        message: error.message,
      },
      meta: {
        traceId,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    });
  }

  // Handle generic errors
  const statusCode = (error as any).statusCode || 500;
  const errorCode = (error as any).code || 'INTERNAL_SERVER_ERROR';
  
  return res.status(statusCode).json({
    success: false,
    error: {
      status: statusCode,
      code: errorCode,
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : error.message,
    },
    meta: {
      traceId,
      timestamp: new Date().toISOString(),
      version: 'v1',
    },
  });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req: Request, res: Response) => {
  const traceId = req.traceId || 'unknown';
  
  logger.warn('Route not found', {
    traceId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: {
      status: 404,
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    meta: {
      traceId,
      timestamp: new Date().toISOString(),
      version: 'v1',
    },
  });
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
