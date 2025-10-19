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
      return res.status(400).json({ message: 'Application ID is required' });
    }

    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }

    const validActions = ['approve', 'reject'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    // Get the current application
    const currentApplication = await prisma.b2BApplication.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    if (!currentApplication) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (currentApplication.status !== 'PENDING') {
      return res.status(400).json({ message: 'Application has already been processed' });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    // Update the application status
    const updatedApplication = await prisma.b2BApplication.update({
      where: { id },
      data: { 
        status: newStatus,
        adminNotes,
        reviewedAt: new Date(),
        reviewedBy: session.user.id
      },
      include: {
        user: { select: { name: true, email: true } }
      }
    });

    // If approved, update user role to B2B
    if (action === 'approve') {
      await prisma.user.update({
        where: { id: currentApplication.userId },
        data: { role: 'B2B' }
      });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: 'B2BApplication',
        entityId: id,
        action: action.toUpperCase(),
        metadata: {
          businessName: currentApplication.businessName,
          contactPerson: currentApplication.contactPerson,
          adminNotes,
          previousStatus: currentApplication.status,
          newStatus: newStatus
        }
      }
    });

    // TODO: Send email notification to customer about application status

    res.status(200).json({ 
      message: `Application ${action}d successfully`,
      application: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}


