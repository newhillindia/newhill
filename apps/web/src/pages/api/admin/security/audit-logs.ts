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
      const { page = 1, limit = 50, entity, action, userId } = req.query;
      
      const where: any = {};
      
      if (entity) {
        where.entity = entity;
      }
      
      if (action) {
        where.action = action;
      }
      
      if (userId) {
        where.userId = userId;
      }

      const auditLogs = await prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const totalLogs = await prisma.auditLog.count({ where });

      res.status(200).json({
        auditLogs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalLogs,
          pages: Math.ceil(totalLogs / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


