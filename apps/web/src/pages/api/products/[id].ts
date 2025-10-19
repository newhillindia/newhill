import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../lib/auth';
import { PrismaClient } from '@prisma/client';
import { getProductWithTranslations } from '../../lib/translations';
import { getBulkCurrencyPrices } from '../../lib/currency';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { language = 'en', currency = 'INR' } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const session = await getServerSession(req, res, authOptions);

    // Get product with translations
    const product = await getProductWithTranslations(
      id,
      language as 'en' | 'ar' | 'hi'
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get currency prices for all variants
    const variantIds = product.variants.map(v => v.id);
    const currencyPrices = await getBulkCurrencyPrices(
      variantIds,
      currency as 'INR' | 'QAR' | 'AED' | 'SAR' | 'OMR'
    );

    // Add currency prices to variants
    const productWithPrices = {
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        currencyPrice: currencyPrices[variant.id] || {
          currency,
          amount: Number(variant.basePriceINR),
          formatted: `${currency} ${Number(variant.basePriceINR).toFixed(2)}`,
          symbol: currency === 'INR' ? '₹' : currency === 'QAR' ? 'ر.ق' : currency === 'AED' ? 'د.إ' : currency === 'SAR' ? 'ر.س' : 'ر.ع.',
        },
      })),
    };

    // Log the API access
    if (session?.user) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: 'PRODUCT',
          entityId: id,
          action: 'PRODUCT_VIEWED',
          details: {
            productName: product.translatedName,
            language,
            currency,
          },
          ipAddress: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { product: productWithPrices },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
