import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
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
      return res.status(400).json({ message: 'Ticket ID is required' });
    }

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER', 'RESOLVED', 'CLOSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Get the current ticket
    const currentTicket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { name: true, email: true } }
      }
    });

    if (!currentTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const updateData: any = { status };
    
    // Set resolvedAt if status is RESOLVED or CLOSED
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    // Update the ticket status
    const updatedTicket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: {
          select: {
            name: true,
            email: true
          }
        },
        replies: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: 'SupportTicket',
        entityId: id,
        action: 'STATUS_UPDATE',
        metadata: {
          ticketNumber: currentTicket.ticketNumber,
          customerName: currentTicket.customerName,
          previousStatus: currentTicket.status,
          newStatus: status
        }
      }
    });

    // TODO: Send email notification to customer about status change

    res.status(200).json({ 
      message: 'Ticket status updated successfully',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}


