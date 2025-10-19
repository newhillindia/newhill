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
      const { status, page = 1, limit = 20 } = req.query;
      
      const where: any = {};
      
      if (status) {
        where.status = status;
      }

      const applications = await prisma.b2BApplication.findMany({
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

      const totalApplications = await prisma.b2BApplication.count({ where });

      res.status(200).json({
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalApplications,
          pages: Math.ceil(totalApplications / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching B2B applications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


