import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { checkStockAvailability } from '../../lib/inventory';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    const validationResults = [];

    for (const item of items) {
      const { variantId, quantity, lotId } = item;

      if (!variantId || !quantity) {
        validationResults.push({
          variantId,
          valid: false,
          message: 'Missing required fields: variantId and quantity',
        });
        continue;
      }

      const stockCheck = await checkStockAvailability(
        variantId,
        quantity,
        lotId
      );

      validationResults.push({
        variantId,
        lotId,
        quantity,
        valid: stockCheck.available,
        availableQty: stockCheck.availableQty,
        message: stockCheck.message,
      });
    }

    // Log the validation request
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        entity: 'INVENTORY',
        entityId: 'validation',
        action: 'STOCK_VALIDATION',
        details: {
          itemsCount: items.length,
          results: validationResults,
        },
        ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
      },
    });

    const allValid = validationResults.every(result => result.valid);

    res.status(200).json({
      success: true,
      data: {
        valid: allValid,
        results: validationResults,
      },
    });
  } catch (error) {
    console.error('Error validating inventory:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
