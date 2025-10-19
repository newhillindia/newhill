import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { productIds, action } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs are required' });
    }

    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }

    let result;
    let auditAction;

    switch (action) {
      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'ACTIVE' }
        });
        auditAction = 'BULK_ACTIVATE';
        break;

      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'INACTIVE' }
        });
        auditAction = 'BULK_DEACTIVATE';
        break;

      case 'delete':
        // Soft delete
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { softDeleted: true, status: 'DISCONTINUED' }
        });
        auditAction = 'BULK_DELETE';
        break;

      case 'discontinue':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'DISCONTINUED' }
        });
        auditAction = 'BULK_DISCONTINUE';
        break;

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: 'Product',
        entityId: 'bulk',
        action: auditAction,
        metadata: { 
          productIds,
          count: productIds.length,
          action: action
        }
      }
    });

    res.status(200).json({ 
      message: `Successfully ${action}d ${result.count} products`,
      count: result.count
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}


