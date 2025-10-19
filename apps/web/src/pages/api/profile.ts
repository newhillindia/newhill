import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const profileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  preferredLanguage: z.string().min(2),
  defaultCurrency: z.string().min(3),
  dateOfBirth: z.string().optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        // Create default profile if it doesn't exist
        const newProfile = await prisma.userProfile.create({
          data: {
            userId: session.user.id,
            preferredLanguage: 'en',
            defaultCurrency: 'USD',
          },
        });
        return res.status(200).json(newProfile);
      }

      res.status(200).json(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PUT') {
    try {
      const validatedData = profileSchema.parse(req.body);

      const profile = await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        update: validatedData,
        create: {
          userId: session.user.id,
          ...validatedData,
        },
      });

      // Log profile update
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'PROFILE_UPDATED',
          details: {
            updatedFields: Object.keys(validatedData),
            timestamp: new Date().toISOString(),
          },
          ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      });

      res.status(200).json(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors 
        });
      }

      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
