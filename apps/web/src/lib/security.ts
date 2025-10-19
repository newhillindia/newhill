import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { supabase } from './supabase';

// CSRF Token Management
export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  static generateToken(): string {
    return crypto.randomBytes(this.TOKEN_LENGTH).toString('hex');
  }

  static verifyToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) return false;
    
    try {
      // In production, store tokens in Redis with expiry
      // For now, we'll use a simple verification
      return token === sessionToken;
    } catch (error) {
      console.error('CSRF token verification failed:', error);
      return false;
    }
  }

  static getTokenFromRequest(request: NextRequest): string | null {
    // Check header first
    const headerToken = request.headers.get('x-csrf-token');
    if (headerToken) return headerToken;

    // Check form data
    const formData = request.formData();
    if (formData) {
      const token = formData.get('csrf_token') as string;
      if (token) return token;
    }

    return null;
  }
}

// Rate Limiting
export class RateLimiter {
  private static readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private static readonly MAX_REQUESTS = 100;
  private static readonly MAX_REQUESTS_AUTH = 10;
  
  private static requests = new Map<string, { count: number; resetTime: number }>();

  static async checkLimit(
    identifier: string, 
    isAuthEndpoint: boolean = false
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const maxRequests = isAuthEndpoint ? this.MAX_REQUESTS_AUTH : this.MAX_REQUESTS;
    
    const current = this.requests.get(identifier);
    
    if (!current || now > current.resetTime) {
      // Reset or create new entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
      });
      
      return {
        allowed: true,
        remaining: maxRequests - 1,
        resetTime: now + this.WINDOW_MS,
      };
    }
    
    if (current.count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }
    
    current.count++;
    return {
      allowed: true,
      remaining: maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }

  static getIdentifier(request: NextRequest): string {
    // Use IP address or user ID
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    return ip;
  }
}

// Input Validation & Sanitization
export class InputValidator {
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, 1000); // Limit length
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static validateProductData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.length < 2) {
      errors.push('Product name is required and must be at least 2 characters');
    }
    
    if (!data.price || typeof data.price !== 'number' || data.price <= 0) {
      errors.push('Valid price is required');
    }
    
    if (!data.category || typeof data.category !== 'string') {
      errors.push('Category is required');
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Audit Logging
export class AuditLogger {
  static async log(
    userId: string | null,
    action: string,
    resource: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const auditEntry = {
        user_id: userId,
        action,
        resource,
        details: JSON.stringify(details),
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString(),
      };

      // Log to Supabase
      const { error } = await supabase
        .from('audit_logs')
        .insert(auditEntry);

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  static async logSecurityEvent(
    event: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'RATE_LIMIT_EXCEEDED' | 'CSRF_VIOLATION' | 'XSS_ATTEMPT',
    details: any,
    ipAddress?: string
  ): Promise<void> {
    await this.log(
      null,
      event,
      'security',
      details,
      ipAddress
    );
  }
}

// Security Headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.newhillspices.com https://*.supabase.co https://us.i.posthog.com",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  };
}

// Security Middleware
export async function securityMiddleware(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const ipAddress = RateLimiter.getIdentifier(request);
  const userAgent = request.headers.get('user-agent') || '';

  try {
    // Rate limiting
    const rateLimit = await RateLimiter.checkLimit(ipAddress);
    if (!rateLimit.allowed) {
      await AuditLogger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ip: ipAddress,
        userAgent,
        endpoint: request.url,
      }, ipAddress);

      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
            ...getSecurityHeaders(),
          },
        }
      );
    }

    // CSRF protection for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = CSRFProtection.getTokenFromRequest(request);
      const sessionToken = request.headers.get('x-session-token');
      
      if (!CSRFProtection.verifyToken(csrfToken || '', sessionToken || '')) {
        await AuditLogger.logSecurityEvent('CSRF_VIOLATION', {
          ip: ipAddress,
          userAgent,
          endpoint: request.url,
          method: request.method,
        }, ipAddress);

        return NextResponse.json(
          { error: 'CSRF token verification failed' },
          { 
            status: 403,
            headers: getSecurityHeaders(),
          }
        );
      }
    }

    // Input validation for POST requests
    if (request.method === 'POST') {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          const body = await request.json();
          // Basic XSS protection
          const bodyString = JSON.stringify(body);
          if (bodyString.includes('<script') || bodyString.includes('javascript:')) {
            await AuditLogger.logSecurityEvent('XSS_ATTEMPT', {
              ip: ipAddress,
              userAgent,
              endpoint: request.url,
              payload: bodyString.substring(0, 500),
            }, ipAddress);

            return NextResponse.json(
              { error: 'Invalid input detected' },
              { 
                status: 400,
                headers: getSecurityHeaders(),
              }
            );
          }
        } catch (error) {
          return NextResponse.json(
            { error: 'Invalid JSON' },
            { 
              status: 400,
              headers: getSecurityHeaders(),
            }
          );
        }
      }
    }

    // Execute the actual handler
    const response = await handler(request);

    // Add security headers to response
    Object.entries(getSecurityHeaders()).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());

    // Log successful request
    const duration = Date.now() - startTime;
    await AuditLogger.log(
      null,
      'API_REQUEST',
      'api',
      {
        method: request.method,
        url: request.url,
        status: response.status,
        duration,
        ip: ipAddress,
      },
      ipAddress,
      userAgent
    );

    return response;

  } catch (error) {
    console.error('Security middleware error:', error);
    
    await AuditLogger.logSecurityEvent('SECURITY_ERROR', {
      ip: ipAddress,
      userAgent,
      endpoint: request.url,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, ipAddress);

    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
        headers: getSecurityHeaders(),
      }
    );
  }
}

// Password hashing utilities
export class PasswordSecurity {
  static async hash(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verify(password: string, hash: string): Promise<boolean> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Session security
export class SessionSecurity {
  static generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  static isSessionValid(sessionData: any): boolean {
    if (!sessionData || !sessionData.expires) return false;
    return Date.now() < sessionData.expires;
  }

  static createSecureSession(userId: string, expiresIn: number = 24 * 60 * 60 * 1000) {
    return {
      userId,
      sessionId: this.generateSessionId(),
      createdAt: Date.now(),
      expires: Date.now() + expiresIn,
      lastActivity: Date.now(),
    };
  }
}

