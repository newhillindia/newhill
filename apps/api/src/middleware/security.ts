import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ValidationError } from '@newhill/shared/types/api';

/**
 * CSRF Protection Middleware
 */
export class CSRFMiddleware {
  private static secret = process.env.CSRF_SECRET || 'csrf-secret-key';

  /**
   * Generate CSRF token
   */
  static generateToken(req: Request): string {
    const sessionId = req.sessionID || req.ip || 'anonymous';
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;
    
    const token = crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
    
    return `${token}:${timestamp}`;
  }

  /**
   * Verify CSRF token
   */
  static verifyToken(req: Request, token: string): boolean {
    try {
      const [receivedToken, timestamp] = token.split(':');
      const sessionId = req.sessionID || req.ip || 'anonymous';
      const data = `${sessionId}:${timestamp}`;
      
      const expectedToken = crypto
        .createHmac('sha256', this.secret)
        .update(data)
        .digest('hex');
      
      // Check if token is not older than 1 hour
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 60 * 60 * 1000) {
        return false;
      }
      
      return crypto.timingSafeEqual(
        Buffer.from(receivedToken, 'hex'),
        Buffer.from(expectedToken, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * CSRF protection middleware
   */
  static protect = (req: Request, res: Response, next: NextFunction): void => {
    // Skip CSRF for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Skip CSRF for API requests with proper headers
    if (req.headers['content-type']?.includes('application/json') && 
        req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return next();
    }

    const token = req.headers['x-csrf-token'] as string || req.body._csrf;
    
    if (!token || !this.verifyToken(req, token)) {
      throw new ValidationError('Invalid CSRF token');
    }

    next();
  };

  /**
   * Middleware to add CSRF token to response
   */
  static addToken = (req: Request, res: Response, next: NextFunction): void => {
    const token = this.generateToken(req);
    res.locals.csrfToken = token;
    res.cookie('csrf-token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    next();
  };
}

/**
 * XSS Protection Middleware
 */
export class XSSMiddleware {
  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeHtml(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * XSS protection middleware
   */
  static protect = (req: Request, res: Response, next: NextFunction): void => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  };
}

/**
 * Content Security Policy Middleware
 */
export class CSPMiddleware {
  /**
   * Generate CSP header
   */
  static generateCSP(): string {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://api.razorpay.com",
      "frame-src 'self' https://js.stripe.com https://checkout.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ];

    if (!isProduction) {
      directives.push("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    }

    return directives.join('; ');
  }

  /**
   * CSP middleware
   */
  static protect = (req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Content-Security-Policy', this.generateCSP());
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  };
}

/**
 * Request ID Middleware
 */
export class RequestIdMiddleware {
  /**
   * Generate unique request ID
   */
  static generateRequestId(): string {
    return crypto.randomUUID();
  }

  /**
   * Request ID middleware
   */
  static addRequestId = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = this.generateRequestId();
    req.traceId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  };
}

/**
 * Security Headers Middleware
 */
export class SecurityHeadersMiddleware {
  /**
   * Add security headers
   */
  static addHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // Remove X-Powered-By header
    res.removeHeader('X-Powered-By');
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // HSTS header for HTTPS
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    next();
  };
}

/**
 * Input Validation Middleware
 */
export class InputValidationMiddleware {
  /**
   * Validate request size
   */
  static validateSize = (maxSize: number = 10 * 1024 * 1024) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = parseInt(req.headers['content-length'] || '0');
      
      if (contentLength > maxSize) {
        throw new ValidationError(`Request too large. Maximum size allowed: ${maxSize} bytes`);
      }
      
      next();
    };
  };

  /**
   * Validate content type
   */
  static validateContentType = (allowedTypes: string[] = ['application/json']) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const contentType = req.headers['content-type'];
      
      if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
        throw new ValidationError(`Invalid content type. Allowed types: ${allowedTypes.join(', ')}`);
      }
      
      next();
    };
  };
}

/**
 * IP Whitelist Middleware
 */
export class IPWhitelistMiddleware {
  private static whitelist: string[] = [];

  /**
   * Set IP whitelist
   */
  static setWhitelist(ips: string[]) {
    this.whitelist = ips;
  }

  /**
   * Check if IP is whitelisted
   */
  static isWhitelisted(ip: string): boolean {
    if (this.whitelist.length === 0) {
      return true; // No whitelist means all IPs are allowed
    }
    
    return this.whitelist.some(whitelistedIp => {
      if (whitelistedIp.includes('/')) {
        // CIDR notation
        return this.isIPInCIDR(ip, whitelistedIp);
      }
      return ip === whitelistedIp;
    });
  }

  /**
   * Check if IP is in CIDR range
   */
  private static isIPInCIDR(ip: string, cidr: string): boolean {
    // Simple CIDR check implementation
    // In production, use a proper CIDR library
    const [network, prefixLength] = cidr.split('/');
    const ipNum = this.ipToNumber(ip);
    const networkNum = this.ipToNumber(network);
    const mask = (0xffffffff << (32 - parseInt(prefixLength))) >>> 0;
    
    return (ipNum & mask) === (networkNum & mask);
  }

  /**
   * Convert IP to number
   */
  private static ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  /**
   * IP whitelist middleware
   */
  static checkWhitelist = (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!this.isWhitelisted(clientIP)) {
      throw new ValidationError('Access denied from this IP address');
    }
    
    next();
  };
}

