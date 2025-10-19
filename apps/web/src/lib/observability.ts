import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from './security';

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Log entry interface
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  stack?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
}

// Centralized Logger
export class Logger {
  private static instance: Logger;
  private serviceName: string;

  constructor(serviceName: string = 'newhill-spices') {
    this.serviceName = serviceName;
  }

  static getInstance(serviceName?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(serviceName);
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      metadata,
      stack: error?.stack,
    };
  }

  private async sendLog(entry: LogEntry): Promise<void> {
    try {
      // Send to CloudWatch (AWS)
      if (process.env.AWS_REGION) {
        await this.sendToCloudWatch(entry);
      }

      // Send to Sentry (if configured)
      if (process.env.SENTRY_DSN) {
        await this.sendToSentry(entry);
      }

      // Send to Supabase for persistence
      await this.sendToSupabase(entry);

      // Console logging for development
      if (process.env.NODE_ENV === 'development') {
        console.log(JSON.stringify(entry, null, 2));
      }
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  }

  private async sendToCloudWatch(entry: LogEntry): Promise<void> {
    // In production, implement AWS CloudWatch Logs
    // For now, we'll simulate the structure
    const cloudWatchLog = {
      logGroup: `/aws/lambda/${this.serviceName}`,
      logStream: new Date().toISOString().split('T')[0],
      logEvents: [{
        timestamp: Date.now(),
        message: JSON.stringify(entry),
      }],
    };

    // TODO: Implement actual AWS CloudWatch Logs integration
    console.log('CloudWatch Log:', cloudWatchLog);
  }

  private async sendToSentry(entry: LogEntry): Promise<void> {
    // In production, implement Sentry integration
    // For now, we'll simulate the structure
    const sentryEvent = {
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      tags: {
        service: entry.service,
        userId: entry.userId,
        sessionId: entry.sessionId,
      },
      extra: entry.metadata,
      stacktrace: entry.stack,
    };

    // TODO: Implement actual Sentry integration
    console.log('Sentry Event:', sentryEvent);
  }

  private async sendToSupabase(entry: LogEntry): Promise<void> {
    try {
      const { supabase } = await import('./supabase');
      await supabase.from('application_logs').insert({
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        service: entry.service,
        user_id: entry.userId,
        session_id: entry.sessionId,
        request_id: entry.requestId,
        metadata: entry.metadata,
        stack_trace: entry.stack,
        url: entry.url,
        method: entry.method,
        status_code: entry.statusCode,
        duration: entry.duration,
      });
    } catch (error) {
      console.error('Failed to send log to Supabase:', error);
    }
  }

  async error(message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, error);
    await this.sendLog(entry);
  }

  async warn(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.WARN, message, metadata);
    await this.sendLog(entry);
  }

  async info(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.INFO, message, metadata);
    await this.sendLog(entry);
  }

  async debug(message: string, metadata?: Record<string, any>): Promise<void> {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
    await this.sendLog(entry);
  }
}

// API Error Handler
export class APIError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public metadata?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    metadata?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.metadata = metadata;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error Handler Middleware
export async function errorHandler(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const logger = Logger.getInstance();
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const response = await handler(request);
    const duration = Date.now() - startTime;

    // Log successful requests
    await logger.info('API Request Completed', {
      requestId,
      method: request.method,
      url: request.url,
      statusCode: response.status,
      duration,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    if (error instanceof APIError) {
      await logger.warn('API Error', {
        requestId,
        method: request.method,
        url: request.url,
        statusCode: error.statusCode,
        duration,
        error: error.message,
        metadata: error.metadata,
      });

      return NextResponse.json(
        { 
          error: error.message,
          requestId,
          ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        },
        { status: error.statusCode }
      );
    } else {
      await logger.error('Unexpected Error', error as Error, {
        requestId,
        method: request.method,
        url: request.url,
        duration,
      });

      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          requestId,
          ...(process.env.NODE_ENV === 'development' && { stack: (error as Error).stack }),
        },
        { status: 500 }
      );
    }
  }
}

// Retry mechanism for critical API calls
export class RetryManager {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    operationName: string = 'operation'
  ): Promise<T> {
    const logger = Logger.getInstance();
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        
        if (attempt > 1) {
          await logger.info(`${operationName} succeeded after ${attempt} attempts`, {
            attempt,
            maxRetries,
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        await logger.warn(`${operationName} failed (attempt ${attempt}/${maxRetries})`, {
          attempt,
          maxRetries,
          error: lastError.message,
        });

        if (attempt === maxRetries) {
          await logger.error(`${operationName} failed after ${maxRetries} attempts`, lastError);
          throw lastError;
        }

        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }
}

// Health Check System
export class HealthChecker {
  private static checks: Map<string, () => Promise<boolean>> = new Map();

  static registerCheck(name: string, check: () => Promise<boolean>): void {
    this.checks.set(name, check);
  }

  static async runAllChecks(): Promise<{
    status: 'healthy' | 'unhealthy';
    checks: Record<string, { status: 'pass' | 'fail'; message?: string }>;
  }> {
    const results: Record<string, { status: 'pass' | 'fail'; message?: string }> = {};
    let allHealthy = true;

    for (const [name, check] of this.checks) {
      try {
        const isHealthy = await check();
        results[name] = { status: isHealthy ? 'pass' : 'fail' };
        if (!isHealthy) allHealthy = false;
      } catch (error) {
        results[name] = { 
          status: 'fail', 
          message: error instanceof Error ? error.message : 'Unknown error' 
        };
        allHealthy = false;
      }
    }

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      checks: results,
    };
  }
}

// Performance Monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.shift();
    }
  }

  static getMetricStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const sum = sorted.reduce((a, b) => a + b, 0);
    const avg = sum / count;
    const p95Index = Math.floor(count * 0.95);
    const p99Index = Math.floor(count * 0.99);

    return {
      count,
      min,
      max,
      avg,
      p95: sorted[p95Index],
      p99: sorted[p99Index],
    };
  }

  static async reportMetrics(): Promise<void> {
    const logger = Logger.getInstance();
    
    for (const [name, values] of this.metrics) {
      const stats = this.getMetricStats(name);
      if (stats) {
        await logger.info(`Metric: ${name}`, stats);
      }
    }
  }
}

// Circuit Breaker Pattern
export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}

// Initialize health checks
export function initializeHealthChecks(): void {
  // Database health check
  HealthChecker.registerCheck('database', async () => {
    try {
      const { supabase } = await import('./supabase');
      const { error } = await supabase.from('users').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  });

  // External API health check
  HealthChecker.registerCheck('external-apis', async () => {
    try {
      // Check PostHog
      const posthogResponse = await fetch('https://us.i.posthog.com/api/health', {
        method: 'HEAD',
        timeout: 5000,
      });
      return posthogResponse.ok;
    } catch {
      return false;
    }
  });

  // Storage health check
  HealthChecker.registerCheck('storage', async () => {
    try {
      // Check Cloudinary
      const cloudinaryResponse = await fetch(
        `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/test`,
        { method: 'HEAD', timeout: 5000 }
      );
      return cloudinaryResponse.ok;
    } catch {
      return false;
    }
  });
}

// Initialize monitoring
initializeHealthChecks();

