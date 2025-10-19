import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, Permission, AuthenticationError, AuthorizationError } from '@newhill/shared/types/api';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      traceId?: string;
    }
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
}

export class AuthMiddleware {
  private static jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private static jwtExpiry = process.env.JWT_EXPIRY || '7d';

  /**
   * Generate JWT token for user
   */
  static generateToken(user: User): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiry,
      issuer: 'newhill-spices',
      audience: 'newhill-spices-api',
    });
  }

  /**
   * Verify JWT token and extract user information
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'newhill-spices',
        audience: 'newhill-spices-api',
      }) as JWTPayload;
    } catch (error) {
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Extract token from Authorization header or cookies
   */
  static extractToken(req: Request): string | null {
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check cookies
    const token = req.cookies?.token || req.cookies?.jwt;
    if (token) {
      return token;
    }

    return null;
  }

  /**
   * Authentication middleware - verifies JWT token
   */
  static authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        throw new AuthenticationError('No authentication token provided');
      }

      const payload = this.verifyToken(token);
      
      // In a real implementation, you would fetch user from database
      // For now, we'll create a mock user from the JWT payload
      const user: User = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        name: '', // Would be fetched from DB
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          language: 'en',
          currency: 'INR',
          region: 'IN',
        },
      };

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Optional authentication middleware - doesn't throw error if no token
   */
  static optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const payload = this.verifyToken(token);
        const user: User = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions,
          name: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          preferences: {
            language: 'en',
            currency: 'INR',
            region: 'IN',
          },
        };
        req.user = user;
      }
      
      next();
    } catch (error) {
      // Ignore auth errors for optional auth
      next();
    }
  };

  /**
   * Authorization middleware - checks if user has required role
   */
  static requireRole = (roles: UserRole | UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(`Access denied. Required role: ${allowedRoles.join(' or ')}`);
      }

      next();
    };
  };

  /**
   * Authorization middleware - checks if user has required permission
   */
  static requirePermission = (permissions: Permission | Permission[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
      
      const hasPermission = requiredPermissions.every(permission => 
        req.user!.permissions.includes(permission)
      );

      if (!hasPermission) {
        throw new AuthorizationError(`Access denied. Required permissions: ${requiredPermissions.join(' and ')}`);
      }

      next();
    };
  };

  /**
   * Resource ownership middleware - checks if user owns the resource
   */
  static requireOwnership = (resourceUserIdField: string = 'userId') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      // For admin users, allow access to all resources
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
      
      if (resourceUserId && resourceUserId !== req.user.id) {
        throw new AuthorizationError('Access denied. You can only access your own resources');
      }

      next();
    };
  };

  /**
   * B2B specific middleware - enforces B2B rules
   */
  static requireB2B = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.role !== 'b2b' && req.user.role !== 'admin') {
      throw new AuthorizationError('B2B access required');
    }

    next();
  };

  /**
   * Consumer specific middleware - enforces consumer rules
   */
  static requireConsumer = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.role !== 'consumer' && req.user.role !== 'admin') {
      throw new AuthorizationError('Consumer access required');
    }

    next();
  };

  /**
   * Admin specific middleware
   */
  static requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    next();
  };
}

