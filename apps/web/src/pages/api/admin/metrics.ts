import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get metrics in parallel
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      pendingB2BApplications,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.b2BApplication.count({
        where: {
          status: 'PENDING',
        },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    // Log the metrics access
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ADMIN_METRICS_ACCESSED',
        details: {
          timestamp: new Date().toISOString(),
        },
        ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(200).json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      pendingB2BApplications,
      recentAuditLogs,
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
