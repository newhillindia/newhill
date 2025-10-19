import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch dashboard metrics
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      lowStockVariants,
      pendingB2BApplications,
      recentOrders,
      recentAuditLogs
    ] = await Promise.all([
      // Total orders
      prisma.order.count({
        where: {
          status: { not: 'CANCELLED' }
        }
      }),
      
      // Total revenue
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Total customers
      prisma.user.count({
        where: {
          role: { in: ['B2C', 'B2B'] }
        }
      }),
      
      // Low stock variants
      prisma.productVariant.count({
        where: {
          stockQty: { lt: 10 } // Assuming 10 is low stock threshold
        }
      }),
      
      // Pending B2B applications
      prisma.b2BApplication.count({
        where: {
          status: 'PENDING'
        }
      }),
      
      // Recent orders for activity feed
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      }),
      
      // Recent audit logs
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true }
          }
        }
      })
    ]);

    // Calculate profit margin (mock calculation)
    const revenue = Number(totalRevenue._sum.totalAmount || 0);
    const estimatedCOGS = revenue * 0.6; // Assuming 60% COGS
    const profitMargin = revenue > 0 ? ((revenue - estimatedCOGS) / revenue * 100).toFixed(1) : 0;

    // Generate sales trend data (last 30 days)
    const salesTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          },
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] }
        }
      });
      
      const daySales = dayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      
      salesTrend.push({
        date: date.toISOString().split('T')[0],
        sales: daySales,
        orders: dayOrders.length
      });
    }

    // Generate top SKUs data
    const topSKUs = await prisma.productVariant.findMany({
      take: 5,
      orderBy: { stockQty: 'desc' },
      include: {
        product: {
          select: { name: true }
        }
      }
    });

    const topSKUsData = topSKUs.map((variant, index) => ({
      id: variant.id,
      name: variant.product.name,
      sales: Math.floor(Math.random() * 1000) + 100, // Mock sales data
      revenue: Math.floor(Math.random() * 50000) + 10000, // Mock revenue data
      growth: (Math.random() * 20 - 10).toFixed(1) // Mock growth data
    }));

    // Generate channel breakdown data
    const channelBreakdown = [
      { channel: 'Direct Website', orders: Math.floor(totalOrders * 0.6), revenue: Math.floor(revenue * 0.6), percentage: 60 },
      { channel: 'B2B Portal', orders: Math.floor(totalOrders * 0.25), revenue: Math.floor(revenue * 0.25), percentage: 25 },
      { channel: 'Mobile App', orders: Math.floor(totalOrders * 0.1), revenue: Math.floor(revenue * 0.1), percentage: 10 },
      { channel: 'Social Media', orders: Math.floor(totalOrders * 0.05), revenue: Math.floor(revenue * 0.05), percentage: 5 }
    ];

    // Generate recent activity feed
    const recentActivity = [
      ...recentOrders.slice(0, 3).map(order => ({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: 'New Order Received',
        description: `Order #${order.orderNumber} from ${order.user.name || order.user.email}`,
        timestamp: order.createdAt.toISOString(),
        priority: 'medium' as const
      })),
      ...(lowStockVariants > 0 ? [{
        id: 'low-stock-alert',
        type: 'low_stock' as const,
        title: 'Low Stock Alert',
        description: `${lowStockVariants} products are running low on stock`,
        timestamp: new Date().toISOString(),
        priority: 'high' as const
      }] : []),
      ...(pendingB2BApplications > 0 ? [{
        id: 'b2b-pending',
        type: 'b2b_approval' as const,
        title: 'B2B Applications Pending',
        description: `${pendingB2BApplications} business applications need review`,
        timestamp: new Date().toISOString(),
        priority: 'medium' as const
      }] : [])
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const dashboardData = {
      metrics: {
        totalSales: totalOrders,
        revenue: Number(revenue),
        profitMargin: Number(profitMargin),
        lowStockCount: lowStockVariants,
        pendingPayments: 0, // Mock data
        totalOrders,
        totalCustomers,
        pendingB2BApprovals: pendingB2BApplications
      },
      salesTrend,
      topSKUs: topSKUsData,
      channelBreakdown,
      recentActivity
    };

    res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
