import { Request, Response } from 'express';
import { logger } from './logger';

/**
 * Metrics collection utility
 */
export class MetricsCollector {
  private static metrics: Map<string, any> = new Map();
  private static counters: Map<string, number> = new Map();
  private static timers: Map<string, number[]> = new Map();

  /**
   * Increment a counter metric
   */
  static incrementCounter(name: string, value: number = 1, labels: Record<string, string> = {}): void {
    const key = this.buildKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    logger.info('Metric incremented', {
      metric: name,
      value,
      labels,
      total: current + value,
    });
  }

  /**
   * Record a timing metric
   */
  static recordTiming(name: string, duration: number, labels: Record<string, string> = {}): void {
    const key = this.buildKey(name, labels);
    const timings = this.timers.get(key) || [];
    timings.push(duration);
    
    // Keep only last 1000 measurements
    if (timings.length > 1000) {
      timings.splice(0, timings.length - 1000);
    }
    
    this.timers.set(key, timings);
    
    logger.info('Timing recorded', {
      metric: name,
      duration,
      labels,
      count: timings.length,
    });
  }

  /**
   * Set a gauge metric
   */
  static setGauge(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.buildKey(name, labels);
    this.metrics.set(key, value);
    
    logger.info('Gauge set', {
      metric: name,
      value,
      labels,
    });
  }

  /**
   * Get counter value
   */
  static getCounter(name: string, labels: Record<string, string> = {}): number {
    const key = this.buildKey(name, labels);
    return this.counters.get(key) || 0;
  }

  /**
   * Get timing statistics
   */
  static getTimingStats(name: string, labels: Record<string, string> = {}): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } {
    const key = this.buildKey(name, labels);
    const timings = this.timers.get(key) || [];
    
    if (timings.length === 0) {
      return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
    }
    
    const sorted = [...timings].sort((a, b) => a - b);
    const count = sorted.length;
    const min = sorted[0];
    const max = sorted[count - 1];
    const avg = sorted.reduce((sum, val) => sum + val, 0) / count;
    const p50 = sorted[Math.floor(count * 0.5)];
    const p95 = sorted[Math.floor(count * 0.95)];
    const p99 = sorted[Math.floor(count * 0.99)];
    
    return { count, min, max, avg, p50, p95, p99 };
  }

  /**
   * Get gauge value
   */
  static getGauge(name: string, labels: Record<string, string> = {}): number {
    const key = this.buildKey(name, labels);
    return this.metrics.get(key) || 0;
  }

  /**
   * Get all metrics
   */
  static getAllMetrics(): {
    counters: Record<string, number>;
    gauges: Record<string, number>;
    timings: Record<string, any>;
  } {
    const counters: Record<string, number> = {};
    const gauges: Record<string, number> = {};
    const timings: Record<string, any> = {};
    
    for (const [key, value] of this.counters.entries()) {
      counters[key] = value;
    }
    
    for (const [key, value] of this.metrics.entries()) {
      gauges[key] = value;
    }
    
    for (const [key] of this.timers.entries()) {
      timings[key] = this.getTimingStats(key);
    }
    
    return { counters, gauges, timings };
  }

  /**
   * Reset all metrics
   */
  static reset(): void {
    this.counters.clear();
    this.metrics.clear();
    this.timers.clear();
    
    logger.info('All metrics reset');
  }

  /**
   * Build metric key with labels
   */
  private static buildKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    
    return labelStr ? `${name}{${labelStr}}` : name;
  }
}

/**
 * Request metrics middleware
 */
export class RequestMetrics {
  /**
   * Middleware to collect request metrics
   */
  static collect = (req: Request, res: Response, next: Function): void => {
    const startTime = Date.now();
    const traceId = req.traceId || 'unknown';
    
    // Increment request counter
    MetricsCollector.incrementCounter('http_requests_total', 1, {
      method: req.method,
      route: req.route?.path || req.path,
    });
    
    // Override res.end to capture response metrics
    const originalEnd = res.end.bind(res);
    res.end = (chunk?: any, encoding?: any) => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      // Record response time
      MetricsCollector.recordTiming('http_request_duration_ms', duration, {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: statusCode.toString(),
      });
      
      // Increment response counter
      MetricsCollector.incrementCounter('http_responses_total', 1, {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: statusCode.toString(),
      });
      
      // Record error metrics
      if (statusCode >= 400) {
        MetricsCollector.incrementCounter('http_errors_total', 1, {
          method: req.method,
          route: req.route?.path || req.path,
          status_code: statusCode.toString(),
        });
      }
      
      // Log request completion
      logger.info('Request completed', {
        traceId,
        method: req.method,
        url: req.originalUrl,
        statusCode,
        duration,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      });
      
      originalEnd(chunk, encoding);
    };
    
    next();
  };
}

/**
 * Business metrics collector
 */
export class BusinessMetrics {
  /**
   * Record order metrics
   */
  static recordOrder(order: any): void {
    MetricsCollector.incrementCounter('orders_total', 1, {
      status: order.status,
      payment_status: order.paymentStatus,
      currency: order.currency,
    });
    
    MetricsCollector.incrementCounter('revenue_total', order.total, {
      currency: order.currency,
    });
    
    MetricsCollector.setGauge('average_order_value', order.total, {
      currency: order.currency,
    });
    
    logger.info('Order metrics recorded', {
      orderId: order.id,
      total: order.total,
      currency: order.currency,
      status: order.status,
    });
  }

  /**
   * Record product view metrics
   */
  static recordProductView(productId: string, userId?: string): void {
    MetricsCollector.incrementCounter('product_views_total', 1, {
      product_id: productId,
      user_type: userId ? 'authenticated' : 'anonymous',
    });
    
    logger.info('Product view recorded', {
      productId,
      userId,
    });
  }

  /**
   * Record search metrics
   */
  static recordSearch(query: string, resultCount: number, userId?: string): void {
    MetricsCollector.incrementCounter('searches_total', 1, {
      user_type: userId ? 'authenticated' : 'anonymous',
    });
    
    MetricsCollector.recordTiming('search_duration_ms', 0, {
      query_length: query.length.toString(),
    });
    
    MetricsCollector.setGauge('search_results_count', resultCount);
    
    logger.info('Search metrics recorded', {
      query,
      resultCount,
      userId,
    });
  }

  /**
   * Record cart metrics
   */
  static recordCartAction(action: string, userId: string, itemCount: number): void {
    MetricsCollector.incrementCounter('cart_actions_total', 1, {
      action,
      user_id: userId,
    });
    
    MetricsCollector.setGauge('cart_items_count', itemCount, {
      user_id: userId,
    });
    
    logger.info('Cart action recorded', {
      action,
      userId,
      itemCount,
    });
  }

  /**
   * Record payment metrics
   */
  static recordPayment(paymentId: string, amount: number, currency: string, status: string, provider: string): void {
    MetricsCollector.incrementCounter('payments_total', 1, {
      status,
      provider,
      currency,
    });
    
    MetricsCollector.incrementCounter('payment_amount_total', amount, {
      currency,
      provider,
    });
    
    logger.info('Payment metrics recorded', {
      paymentId,
      amount,
      currency,
      status,
      provider,
    });
  }
}

/**
 * System metrics collector
 */
export class SystemMetrics {
  /**
   * Record memory usage
   */
  static recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    
    MetricsCollector.setGauge('memory_usage_bytes', usage.heapUsed, {
      type: 'heap_used',
    });
    
    MetricsCollector.setGauge('memory_usage_bytes', usage.heapTotal, {
      type: 'heap_total',
    });
    
    MetricsCollector.setGauge('memory_usage_bytes', usage.rss, {
      type: 'rss',
    });
    
    MetricsCollector.setGauge('memory_usage_bytes', usage.external, {
      type: 'external',
    });
  }

  /**
   * Record CPU usage
   */
  static recordCPUUsage(): void {
    const usage = process.cpuUsage();
    const totalUsage = usage.user + usage.system;
    
    MetricsCollector.setGauge('cpu_usage_microseconds', totalUsage);
    
    logger.debug('CPU usage recorded', {
      user: usage.user,
      system: usage.system,
      total: totalUsage,
    });
  }

  /**
   * Record database metrics
   */
  static recordDatabaseMetrics(operation: string, duration: number, success: boolean): void {
    MetricsCollector.incrementCounter('database_operations_total', 1, {
      operation,
      success: success.toString(),
    });
    
    MetricsCollector.recordTiming('database_operation_duration_ms', duration, {
      operation,
    });
    
    if (!success) {
      MetricsCollector.incrementCounter('database_errors_total', 1, {
        operation,
      });
    }
    
    logger.info('Database metrics recorded', {
      operation,
      duration,
      success,
    });
  }

  /**
   * Record cache metrics
   */
  static recordCacheMetrics(operation: string, hit: boolean, duration: number): void {
    MetricsCollector.incrementCounter('cache_operations_total', 1, {
      operation,
      hit: hit.toString(),
    });
    
    MetricsCollector.recordTiming('cache_operation_duration_ms', duration, {
      operation,
    });
    
    if (hit) {
      MetricsCollector.incrementCounter('cache_hits_total', 1, {
        operation,
      });
    } else {
      MetricsCollector.incrementCounter('cache_misses_total', 1, {
        operation,
      });
    }
    
    logger.debug('Cache metrics recorded', {
      operation,
      hit,
      duration,
    });
  }
}

/**
 * Metrics endpoint handler
 */
export class MetricsEndpoint {
  /**
   * Get metrics in Prometheus format
   */
  static getPrometheusMetrics(): string {
    const { counters, gauges, timings } = MetricsCollector.getAllMetrics();
    let output = '';
    
    // Counters
    for (const [key, value] of Object.entries(counters)) {
      output += `# TYPE ${key} counter\n`;
      output += `${key} ${value}\n`;
    }
    
    // Gauges
    for (const [key, value] of Object.entries(gauges)) {
      output += `# TYPE ${key} gauge\n`;
      output += `${key} ${value}\n`;
    }
    
    // Timings (as histograms)
    for (const [key, stats] of Object.entries(timings)) {
      if (stats.count > 0) {
        output += `# TYPE ${key} histogram\n`;
        output += `${key}_count ${stats.count}\n`;
        output += `${key}_sum ${stats.avg * stats.count}\n`;
        output += `${key}_min ${stats.min}\n`;
        output += `${key}_max ${stats.max}\n`;
        output += `${key}_avg ${stats.avg}\n`;
        output += `${key}_p50 ${stats.p50}\n`;
        output += `${key}_p95 ${stats.p95}\n`;
        output += `${key}_p99 ${stats.p99}\n`;
      }
    }
    
    return output;
  }

  /**
   * Get metrics in JSON format
   */
  static getJSONMetrics(): any {
    return {
      timestamp: new Date().toISOString(),
      metrics: MetricsCollector.getAllMetrics(),
    };
  }
}

