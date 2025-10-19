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
      const { search, status, date, page = 1, limit = 20 } = req.query;
      
      const where: any = {};
      
      if (search) {
        where.OR = [
          { orderNumber: { contains: search as string, mode: 'insensitive' } },
          { user: { name: { contains: search as string, mode: 'insensitive' } } },
          { user: { email: { contains: search as string, mode: 'insensitive' } } }
        ];
      }
      
      if (status) {
        where.status = status;
      }
      
      if (date) {
        const startDate = new Date(date as string);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date as string);
        endDate.setHours(23, 59, 59, 999);
        
        where.createdAt = {
          gte: startDate,
          lte: endDate
        };
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          items: {
            include: {
              variant: {
                include: {
                  product: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          shippingAddress: true,
          billingAddress: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const totalOrders = await prisma.order.count({ where });

      res.status(200).json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalOrders,
          pages: Math.ceil(totalOrders / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


