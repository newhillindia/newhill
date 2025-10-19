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
      const { period = '30' } = req.query;
      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch orders for the period
      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        include: {
          payments: true
        }
      });

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      // Mock calculations for demo
      const estimatedCOGS = totalRevenue * 0.6; // 60% COGS
      const profitMargin = totalRevenue > 0 ? ((totalRevenue - estimatedCOGS) / totalRevenue * 100) : 0;
      const refunds = totalRevenue * 0.02; // 2% refund rate
      const taxes = totalRevenue * 0.18; // 18% GST
      const netRevenue = totalRevenue - refunds;

      // Generate revenue data for chart
      const revenueData = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayOrders = orders.filter(order => 
          order.createdAt >= dayStart && order.createdAt <= dayEnd
        );
        
        const dayRevenue = dayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
        const dayRefunds = dayRevenue * 0.02; // Mock refund rate
        
        revenueData.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
          orders: dayOrders.length,
          refunds: dayRefunds
        });
      }

      // Mock payment provider breakdown
      const paymentBreakdown = [
        {
          provider: 'Razorpay',
          orders: Math.floor(totalOrders * 0.6),
          revenue: totalRevenue * 0.6,
          percentage: 60,
          fees: totalRevenue * 0.6 * 0.02 // 2% fee
        },
        {
          provider: 'Stripe',
          orders: Math.floor(totalOrders * 0.25),
          revenue: totalRevenue * 0.25,
          percentage: 25,
          fees: totalRevenue * 0.25 * 0.029 // 2.9% fee
        },
        {
          provider: 'PayPal',
          orders: Math.floor(totalOrders * 0.1),
          revenue: totalRevenue * 0.1,
          percentage: 10,
          fees: totalRevenue * 0.1 * 0.034 // 3.4% fee
        },
        {
          provider: 'Bank Transfer',
          orders: Math.floor(totalOrders * 0.05),
          revenue: totalRevenue * 0.05,
          percentage: 5,
          fees: 0 // No fees for bank transfer
        }
      ];

      // Mock refunds data
      const refunds = [
        {
          id: 'ref_1',
          orderNumber: 'ORD-2024-001',
          amount: 1500,
          reason: 'Customer requested',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ref_2',
          orderNumber: 'ORD-2024-002',
          amount: 800,
          reason: 'Product damaged',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'ref_3',
          orderNumber: 'ORD-2024-003',
          amount: 2200,
          reason: 'Wrong item shipped',
          status: 'COMPLETED',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const metrics = {
        totalRevenue: Number(totalRevenue),
        totalOrders,
        averageOrderValue: Number(averageOrderValue),
        profitMargin: Number(profitMargin.toFixed(2)),
        refunds: Number(refunds.reduce((sum, r) => sum + r.amount, 0)),
        taxes: Number(taxes),
        netRevenue: Number(netRevenue),
        currency: 'INR'
      };

      res.status(200).json({
        metrics,
        revenueData,
        paymentBreakdown,
        refunds
      });
    } catch (error) {
      console.error('Error fetching finance data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


