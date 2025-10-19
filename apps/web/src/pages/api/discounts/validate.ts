import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { validateDiscountCode, validateCoupon } from '../../lib/discounts';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code, orderAmount, type = 'discount' } = req.body;

    if (!code || !orderAmount) {
      return res.status(400).json({ error: 'Code and orderAmount are required' });
    }

    // Get user role for B2B validation
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isB2B = user?.role === 'B2B';

    let validation;
    if (type === 'coupon') {
      validation = await validateCoupon(code, orderAmount, session.user.id, isB2B);
    } else {
      validation = await validateDiscountCode(code, orderAmount, session.user.id, isB2B);
    }

    // Log the validation request
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: 'DISCOUNT',
        entityId: code,
        action: 'DISCOUNT_VALIDATION',
        details: {
          code,
          orderAmount,
          type,
          valid: validation.valid,
          discountAmount: validation.discountAmount,
        },
        ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(200).json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('Error validating discount:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
