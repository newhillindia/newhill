import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const { search, category, status, page = 1, limit = 20 } = req.query;
      
      const where: any = {};
      
      if (search) {
        where.name = {
          contains: search as string,
          mode: 'insensitive'
        };
      }
      
      if (category) {
        where.category = category;
      }
      
      if (status) {
        where.status = status;
      }

      const products = await prisma.product.findMany({
        where,
        include: {
          variants: {
            select: {
              id: true,
              weightInGrams: true,
              basePriceINR: true,
              stockQty: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      // Calculate total stock for each product
      const productsWithStock = products.map(product => ({
        ...product,
        totalStock: product.variants.reduce((sum, variant) => sum + variant.stockQty, 0)
      }));

      const totalProducts = await prisma.product.count({ where });

      res.status(200).json({
        products: productsWithStock,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalProducts,
          pages: Math.ceil(totalProducts / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        category,
        images,
        organicCertified,
        variants
      } = req.body;

      // Create product
      const product = await prisma.product.create({
        data: {
          name,
          description,
          category,
          images: images || [],
          organicCertified: organicCertified || false,
          variants: {
            create: variants.map((variant: any) => ({
              weightInGrams: variant.weightInGrams,
              basePriceINR: variant.basePriceINR,
              stockQty: variant.stockQty || 0,
              minOrderQty: variant.minOrderQty || 1,
              maxOrderQty: variant.maxOrderQty
            }))
          }
        },
        include: {
          variants: true
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: 'Product',
          entityId: product.id,
          action: 'CREATE',
          metadata: { productName: product.name }
        }
      });

      res.status(201).json({ product });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


