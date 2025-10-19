import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.query;
    const { status } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get the current order
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (!currentOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            variant: {
              include: {
                product: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: 'Order',
        entityId: id,
        action: 'STATUS_UPDATE',
        metadata: {
          orderNumber: currentOrder.orderNumber,
          oldStatus: currentOrder.status,
          newStatus: status,
          customerName: currentOrder.user.name,
          customerEmail: currentOrder.user.email
        }
      }
    });

    // TODO: Send email notification to customer about status change
    // TODO: If status is SHIPPED, create shipment record
    // TODO: If status is REFUNDED, process refund through payment provider

    res.status(200).json({ 
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}


