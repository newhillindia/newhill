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
      const users = await prisma.user.findMany({
        where: {
          role: 'ADMIN'
        },
        include: {
          adminRole: {
            select: {
              id: true,
              name: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Mock login history and last login data
      const usersWithLoginData = users.map(user => ({
        ...user,
        lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: !user.softDeleted,
        loginHistory: [
          {
            id: '1',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            loginAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            success: true,
            location: 'New York, US'
          },
          {
            id: '2',
            ipAddress: '192.168.1.2',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            loginAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
            success: true,
            location: 'San Francisco, US'
          }
        ]
      }));

      res.status(200).json({ users: usersWithLoginData });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


