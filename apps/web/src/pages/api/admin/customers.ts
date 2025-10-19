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
      const { search, role, ltv, page = 1, limit = 20 } = req.query;
      
      const where: any = {
        role: { in: ['B2C', 'B2B'] }
      };
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      if (role) {
        where.role = role;
      }

      const customers = await prisma.user.findMany({
        where,
        include: {
          profile: {
            select: {
              phone: true,
              city: true,
              state: true,
              country: true
            }
          },
          b2bApplication: {
            select: {
              businessName: true,
              status: true
            }
          },
          orders: {
            select: {
              totalAmount: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      // Calculate LTV and other metrics for each customer
      const customersWithMetrics = customers.map(customer => {
        const totalSpent = customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const ordersCount = customer.orders.length;
        const lastOrderDate = customer.orders.length > 0 
          ? customer.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
          : null;
        
        // Mock LTV calculation: avgOrderValue × purchaseFrequency × customerLifespanEstimate
        const avgOrderValue = ordersCount > 0 ? totalSpent / ordersCount : 0;
        const purchaseFrequency = ordersCount > 0 ? ordersCount / 12 : 0; // orders per month
        const customerLifespanEstimate = 24; // months
        const ltv = avgOrderValue * purchaseFrequency * customerLifespanEstimate;

        // Generate tags based on customer behavior
        const tags = [];
        if (ltv > 10000) tags.push('VIP');
        if (ordersCount > 10) tags.push('Frequent Buyer');
        if (customer.role === 'B2B') tags.push('B2B');
        if (customer.b2bApplication?.status === 'APPROVED') tags.push('Approved B2B');

        return {
          ...customer,
          totalSpent,
          ordersCount,
          lastOrderDate,
          ltv: Math.round(ltv),
          tags
        };
      });

      // Filter by LTV if specified
      let filteredCustomers = customersWithMetrics;
      if (ltv) {
        filteredCustomers = customersWithMetrics.filter(customer => {
          switch (ltv) {
            case 'high': return customer.ltv > 10000;
            case 'medium': return customer.ltv > 1000 && customer.ltv <= 10000;
            case 'low': return customer.ltv <= 1000;
            default: return true;
          }
        });
      }

      const totalCustomers = await prisma.user.count({ where });

      res.status(200).json({
        customers: filteredCustomers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCustomers,
          pages: Math.ceil(totalCustomers / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching customers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


