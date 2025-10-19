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
      const { search, status, priority, category, page = 1, limit = 20 } = req.query;
      
      const where: any = {};
      
      if (search) {
        where.OR = [
          { ticketNumber: { contains: search as string, mode: 'insensitive' } },
          { customerName: { contains: search as string, mode: 'insensitive' } },
          { customerEmail: { contains: search as string, mode: 'insensitive' } },
          { subject: { contains: search as string, mode: 'insensitive' } }
        ];
      }
      
      if (status) {
        where.status = status;
      }
      
      if (priority) {
        where.priority = priority;
      }
      
      if (category) {
        where.category = category;
      }

      const tickets = await prisma.supportTicket.findMany({
        where,
        include: {
          assignedUser: {
            select: {
              name: true,
              email: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const totalTickets = await prisma.supportTicket.count({ where });

      res.status(200).json({
        tickets,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalTickets,
          pages: Math.ceil(totalTickets / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        customerName,
        customerEmail,
        subject,
        description,
        category,
        priority = 'MEDIUM'
      } = req.body;

      // Generate ticket number
      const ticketCount = await prisma.supportTicket.count();
      const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

      const ticket = await prisma.supportTicket.create({
        data: {
          ticketNumber,
          customerName,
          customerEmail,
          subject,
          description,
          category,
          priority
        },
        include: {
          assignedUser: {
            select: {
              name: true,
              email: true
            }
          },
          replies: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
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
          entity: 'SupportTicket',
          entityId: ticket.id,
          action: 'CREATE',
          metadata: { 
            ticketNumber: ticket.ticketNumber,
            customerName: ticket.customerName,
            category: ticket.category
          }
        }
      });

      res.status(201).json({ ticket });
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


