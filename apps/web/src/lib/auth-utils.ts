import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { UserRole } from '@prisma/client';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}

export function hasRole(userRole: string, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole as UserRole);
}

export function isAdmin(userRole: string): boolean {
  return userRole === 'ADMIN';
}

export function isB2B(userRole: string): boolean {
  return userRole === 'B2B';
}

export function isB2C(userRole: string): boolean {
  return userRole === 'B2C';
}

export function canAccessB2BFeatures(userRole: string): boolean {
  return ['ADMIN', 'B2B'].includes(userRole);
}

export function canAccessAdminFeatures(userRole: string): boolean {
  return userRole === 'ADMIN';
}

export function getMaxOrderWeight(userRole: string): number {
  switch (userRole) {
    case 'B2C':
      return 5; // 5 kilos max for B2C
    case 'B2B':
    case 'ADMIN':
      return Infinity; // No limit for B2B and Admin
    default:
      return 5;
  }
}

export function shouldPromptB2BUpgrade(userRole: string, orderWeight: number): boolean {
  return userRole === 'B2C' && orderWeight > 5;
}
