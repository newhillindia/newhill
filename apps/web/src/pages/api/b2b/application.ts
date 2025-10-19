import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const b2bApplicationSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  gstVatNumber: z.string().optional(),
  taxId: z.string().optional(),
  businessAddress: z.string().min(10),
  businessCity: z.string().min(2),
  businessState: z.string().min(2),
  businessCountry: z.string().min(2),
  businessPostalCode: z.string().min(3),
  contactPerson: z.string().min(2),
  contactPhone: z.string().min(10),
  website: z.string().url().optional().or(z.literal('')),
  expectedMonthlyVolume: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validatedData = b2bApplicationSchema.parse(req.body);

    // Check if user already has a B2B application
    const existingApplication = await prisma.b2BApplication.findUnique({
      where: { userId: session.user.id },
    });

    if (existingApplication) {
      return res.status(400).json({ 
        error: 'B2B application already exists',
        status: existingApplication.status 
      });
    }

    // Create B2B application
    const application = await prisma.b2BApplication.create({
      data: {
        userId: session.user.id,
        ...validatedData,
      },
    });

    // Log the application creation
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'B2B_APPLICATION_CREATED',
        details: {
          applicationId: application.id,
          businessName: application.businessName,
          businessType: application.businessType,
          timestamp: new Date().toISOString(),
        },
        ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    res.status(201).json({ 
      message: 'B2B application submitted successfully',
      applicationId: application.id 
    });
  } catch (error) {
    console.error('Error creating B2B application:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation error',
        details: error.errors 
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}
