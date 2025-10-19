import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
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

    const { id } = req.query;
    const { message, isInternal = false } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Ticket ID is required' });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
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

    // Create the reply
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        message: message.trim(),
        isInternal
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    if (currentTicket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id },
        data: { status: 'IN_PROGRESS' }
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: 'TicketReply',
        entityId: reply.id,
        action: 'CREATE',
        metadata: {
          ticketNumber: currentTicket.ticketNumber,
          customerName: currentTicket.customerName,
          isInternal,
          messageLength: message.length
        }
      }
    });

    // TODO: Send email notification to customer (if not internal)

    res.status(201).json({ 
      message: 'Reply sent successfully',
      reply
    });
  } catch (error) {
    console.error('Error creating reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}


