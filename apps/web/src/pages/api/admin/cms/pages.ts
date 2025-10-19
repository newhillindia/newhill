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
      const { search, status, page = 1, limit = 20 } = req.query;
      
      const where: any = {};
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { slug: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      if (status) {
        if (status === 'published') {
          where.isPublished = true;
        } else if (status === 'draft') {
          where.isPublished = false;
        }
      }

      const pages = await prisma.cMSPage.findMany({
        where,
        include: {
          translations: {
            select: {
              id: true,
              language: true,
              title: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const totalPages = await prisma.cMSPage.count({ where });

      res.status(200).json({
        pages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalPages,
          pages: Math.ceil(totalPages / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching pages:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        isPublished = false
      } = req.body;

      if (!title || !slug) {
        return res.status(400).json({ message: 'Title and slug are required' });
      }

      // Check if slug already exists
      const existingPage = await prisma.cMSPage.findUnique({
        where: { slug }
      });

      if (existingPage) {
        return res.status(400).json({ message: 'Slug already exists' });
      }

      const page = await prisma.cMSPage.create({
        data: {
          title,
          slug,
          content: content || { type: 'page', blocks: [] },
          metaTitle,
          metaDescription,
          isPublished,
          publishedAt: isPublished ? new Date() : null
        },
        include: {
          translations: true
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: 'CMSPage',
          entityId: page.id,
          action: 'CREATE',
          metadata: { 
            title: page.title,
            slug: page.slug,
            isPublished: page.isPublished
          }
        }
      });

      res.status(201).json({ page });
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


