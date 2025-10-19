import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Store OTPs in memory for development (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(email: string, otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  // Store in memory for development
  otpStore.set(email, { otp, expiresAt });
  
  // In production, store in Redis or database
  if (process.env.NODE_ENV === 'production') {
    await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });
  }
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  // Check memory store for development
  if (process.env.NODE_ENV !== 'production') {
    const stored = otpStore.get(email);
    if (!stored) return false;
    
    if (stored.expiresAt < new Date()) {
      otpStore.delete(email);
      return false;
    }
    
    if (stored.otp === otp) {
      otpStore.delete(email);
      return true;
    }
    
    return false;
  }
  
  // Production: check database
  const storedOTP = await prisma.otp.findFirst({
    where: {
      email,
      code: otp,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
  
  if (storedOTP) {
    // Delete used OTP
    await prisma.otp.delete({
      where: { id: storedOTP.id },
    });
    return true;
  }
  
  return false;
}

export async function cleanupExpiredOTPs(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    await prisma.otp.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  } else {
    // Clean up memory store
    const now = new Date();
    for (const [email, data] of otpStore.entries()) {
      if (data.expiresAt < now) {
        otpStore.delete(email);
      }
    }
  }
}
