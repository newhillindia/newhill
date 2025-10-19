import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id, action } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Page ID is required' });
  }

  if (!action || typeof action !== 'string') {
    return res.status(400).json({ message: 'Action is required' });
  }

  if (req.method === 'PUT' && action === 'update') {
    try {
      const {
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
        isPublished
      } = req.body;

      // Get the current page
      const currentPage = await prisma.cMSPage.findUnique({
        where: { id }
      });

      if (!currentPage) {
        return res.status(404).json({ message: 'Page not found' });
      }

      // Check if slug already exists (excluding current page)
      if (slug && slug !== currentPage.slug) {
        const existingPage = await prisma.cMSPage.findUnique({
          where: { slug }
        });

        if (existingPage) {
          return res.status(400).json({ message: 'Slug already exists' });
        }
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (slug) updateData.slug = slug;
      if (content) updateData.content = content;
      if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
      if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
      if (isPublished !== undefined) {
        updateData.isPublished = isPublished;
        if (isPublished && !currentPage.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const updatedPage = await prisma.cMSPage.update({
        where: { id },
        data: updateData,
        include: {
          translations: true
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: 'CMSPage',
          entityId: id,
          action: 'UPDATE',
          metadata: {
            title: updatedPage.title,
            slug: updatedPage.slug,
            isPublished: updatedPage.isPublished
          }
        }
      });

      res.status(200).json({ page: updatedPage });
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const currentPage = await prisma.cMSPage.findUnique({
        where: { id }
      });

      if (!currentPage) {
        return res.status(404).json({ message: 'Page not found' });
      }

      let updateData: any = {};

      switch (action) {
        case 'publish':
          updateData = {
            isPublished: true,
            publishedAt: new Date()
          };
          break;
        case 'unpublish':
          updateData = {
            isPublished: false
          };
          break;
        case 'delete':
          await prisma.cMSPage.delete({
            where: { id }
          });

          // Create audit log
          await prisma.auditLog.create({
            data: {
              userId: session.user.id,
              entity: 'CMSPage',
              entityId: id,
              action: 'DELETE',
              metadata: {
                title: currentPage.title,
                slug: currentPage.slug
              }
            }
          });

          return res.status(200).json({ message: 'Page deleted successfully' });
        default:
          return res.status(400).json({ message: 'Invalid action' });
      }

      const updatedPage = await prisma.cMSPage.update({
        where: { id },
        data: updateData,
        include: {
          translations: true
        }
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          entity: 'CMSPage',
          entityId: id,
          action: action.toUpperCase(),
          metadata: {
            title: currentPage.title,
            slug: currentPage.slug,
            previousStatus: currentPage.isPublished,
            newStatus: updatedPage.isPublished
          }
        }
      });

      res.status(200).json({ 
        message: `Page ${action}ed successfully`,
        page: updatedPage
      });
    } catch (error) {
      console.error('Error updating page:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


