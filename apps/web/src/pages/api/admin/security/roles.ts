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
      const roles = await prisma.adminRole.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ roles });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, description, permissions } = req.body;

      if (!name || !permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Name and permissions are required' });
      }

      // Check if role name already exists
      const existingRole = await prisma.adminRole.findUnique({
        where: { name }
      });

      if (existingRole) {
        return res.status(400).json({ message: 'Role name already exists' });
      }

      const role = await prisma.adminRole.create({
        data: {
          name,
          description,
          permissions: permissions
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: 'AdminRole',
          entityId: role.id,
          action: 'CREATE',
          metadata: { 
            roleName: role.name,
            permissionsCount: permissions.length
          }
        }
      });

      res.status(201).json({ role });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


