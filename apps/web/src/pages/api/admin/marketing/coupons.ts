import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 20 } = req.query;

      const coupons = await prisma.discountCode.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const totalCoupons = await prisma.discountCode.count();

      res.status(200).json({
        coupons,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCoupons,
          pages: Math.ceil(totalCoupons / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        code,
        name,
        description,
        type,
        value,
        minOrderValue,
        maxDiscountAmount,
        usageLimit,
        validFrom,
        validUntil,
        isB2BOnly
      } = req.body;

      // Check if coupon code already exists
      const existingCoupon = await prisma.discountCode.findUnique({
        where: { code }
      });

      if (existingCoupon) {
        return res.status(400).json({ message: 'Coupon code already exists' });
      }

      const coupon = await prisma.discountCode.create({
        data: {
          code,
          name,
          description,
          type,
          value: Number(value),
          minOrderValue: minOrderValue ? Number(minOrderValue) : null,
          maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
          usageLimit: usageLimit ? Number(usageLimit) : null,
          validFrom: new Date(validFrom),
          validUntil: validUntil ? new Date(validUntil) : null,
          isB2BOnly: isB2BOnly || false
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: 'DiscountCode',
          entityId: coupon.id,
          action: 'CREATE',
          metadata: { 
            code: coupon.code,
            name: coupon.name,
            type: coupon.type
          }
        }
      });

      res.status(201).json({ coupon });
    } catch (error) {
      console.error('Error creating coupon:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


