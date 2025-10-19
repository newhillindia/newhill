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
    const { action, adminNotes } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'Quote ID is required' });
    }

    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }

    const validActions = ['approve', 'reject', 'review'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Get the current quote
    const currentQuote = await prisma.b2BQuote.findUnique({
      where: { id },
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

    if (!currentQuote) {
      return res.status(404).json({ message: 'Quote not found' });
    }

    let newStatus;
    switch (action) {
      case 'approve':
        newStatus = 'APPROVED';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        break;
      case 'review':
        newStatus = 'REVIEWED';
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    // Update the quote status
    const updatedQuote = await prisma.b2BQuote.update({
      where: { id },
      data: { 
        status: newStatus,
        adminNotes,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      },
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
        entity: 'B2BQuote',
        entityId: id,
        action: action.toUpperCase(),
        metadata: {
          quoteNumber: currentQuote.quoteNumber,
          customerName: currentQuote.user.name,
          customerEmail: currentQuote.user.email,
          totalAmount: currentQuote.totalAmount,
          adminNotes,
          previousStatus: currentQuote.status,
          newStatus: newStatus
        }
      }
    });

    // TODO: Send email notification to customer about quote status
    // TODO: If approved, create order from quote

    res.status(200).json({ 
      message: `Quote ${action}d successfully`,
      quote: updatedQuote
    });
  } catch (error) {
    console.error('Error updating quote:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}


