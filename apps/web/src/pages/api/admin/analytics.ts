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
      const { period = '30' } = req.query;
      const days = parseInt(period as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Mock analytics data - in production, this would come from analytics services
      const metrics = {
        totalPageviews: Math.floor(Math.random() * 100000) + 50000,
        uniqueVisitors: Math.floor(Math.random() * 50000) + 25000,
        bounceRate: Math.random() * 20 + 30, // 30-50%
        avgSessionDuration: Math.random() * 300 + 120, // 2-7 minutes
        conversionRate: Math.random() * 5 + 2, // 2-7%
        topPages: [
          {
            page: '/',
            views: Math.floor(Math.random() * 10000) + 5000,
            uniqueViews: Math.floor(Math.random() * 8000) + 4000,
            bounceRate: Math.random() * 20 + 30,
            avgTimeOnPage: Math.random() * 180 + 60
          },
          {
            page: '/products',
            views: Math.floor(Math.random() * 8000) + 4000,
            uniqueViews: Math.floor(Math.random() * 6000) + 3000,
            bounceRate: Math.random() * 15 + 25,
            avgTimeOnPage: Math.random() * 240 + 90
          },
          {
            page: '/products/premium-turmeric',
            views: Math.floor(Math.random() * 5000) + 2000,
            uniqueViews: Math.floor(Math.random() * 4000) + 1500,
            bounceRate: Math.random() * 10 + 20,
            avgTimeOnPage: Math.random() * 300 + 120
          },
          {
            page: '/about',
            views: Math.floor(Math.random() * 3000) + 1000,
            uniqueViews: Math.floor(Math.random() * 2500) + 800,
            bounceRate: Math.random() * 25 + 35,
            avgTimeOnPage: Math.random() * 120 + 60
          },
          {
            page: '/contact',
            views: Math.floor(Math.random() * 2000) + 500,
            uniqueViews: Math.floor(Math.random() * 1500) + 400,
            bounceRate: Math.random() * 30 + 40,
            avgTimeOnPage: Math.random() * 90 + 45
          }
        ],
        trafficSources: [
          {
            source: 'Direct',
            visitors: Math.floor(Math.random() * 15000) + 10000,
            percentage: 40,
            conversionRate: Math.random() * 3 + 4
          },
          {
            source: 'Google Search',
            visitors: Math.floor(Math.random() * 12000) + 8000,
            percentage: 32,
            conversionRate: Math.random() * 2 + 3
          },
          {
            source: 'Social Media',
            visitors: Math.floor(Math.random() * 8000) + 5000,
            percentage: 20,
            conversionRate: Math.random() * 2 + 2
          },
          {
            source: 'Email Marketing',
            visitors: Math.floor(Math.random() * 3000) + 2000,
            percentage: 5,
            conversionRate: Math.random() * 4 + 6
          },
          {
            source: 'Referrals',
            visitors: Math.floor(Math.random() * 2000) + 1000,
            percentage: 3,
            conversionRate: Math.random() * 2 + 3
          }
        ],
        deviceBreakdown: [
          {
            device: 'Desktop',
            visitors: Math.floor(Math.random() * 20000) + 15000,
            percentage: 60,
            conversionRate: Math.random() * 3 + 4
          },
          {
            device: 'Mobile',
            visitors: Math.floor(Math.random() * 15000) + 10000,
            percentage: 35,
            conversionRate: Math.random() * 2 + 2
          },
          {
            device: 'Tablet',
            visitors: Math.floor(Math.random() * 5000) + 2000,
            percentage: 5,
            conversionRate: Math.random() * 2 + 3
          }
        ],
        geographicData: [
          {
            country: 'India',
            visitors: Math.floor(Math.random() * 25000) + 20000,
            percentage: 65,
            revenue: Math.floor(Math.random() * 500000) + 300000
          },
          {
            country: 'United Arab Emirates',
            visitors: Math.floor(Math.random() * 8000) + 5000,
            percentage: 20,
            revenue: Math.floor(Math.random() * 150000) + 100000
          },
          {
            country: 'Saudi Arabia',
            visitors: Math.floor(Math.random() * 5000) + 3000,
            percentage: 10,
            revenue: Math.floor(Math.random() * 100000) + 50000
          },
          {
            country: 'Qatar',
            visitors: Math.floor(Math.random() * 2000) + 1000,
            percentage: 5,
            revenue: Math.floor(Math.random() * 50000) + 25000
          }
        ],
        conversionFunnel: [
          {
            step: 'Landing Page',
            visitors: Math.floor(Math.random() * 50000) + 40000,
            conversionRate: 100,
            dropOffRate: 0
          },
          {
            step: 'Product View',
            visitors: Math.floor(Math.random() * 30000) + 25000,
            conversionRate: 65,
            dropOffRate: 35
          },
          {
            step: 'Add to Cart',
            visitors: Math.floor(Math.random() * 15000) + 12000,
            conversionRate: 32,
            dropOffRate: 33
          },
          {
            step: 'Checkout',
            visitors: Math.floor(Math.random() * 8000) + 6000,
            conversionRate: 17,
            dropOffRate: 15
          },
          {
            step: 'Purchase',
            visitors: Math.floor(Math.random() * 5000) + 4000,
            conversionRate: 11,
            dropOffRate: 6
          }
        ],
        realTimeUsers: Math.floor(Math.random() * 50) + 10,
        systemHealth: {
          uptime: 99.9,
          responseTime: Math.floor(Math.random() * 100) + 50,
          errorRate: Math.random() * 0.5 + 0.1,
          databaseStatus: 'healthy' as const,
          queueStatus: 'healthy' as const
        }
      };

      res.status(200).json({ metrics });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  } finally {
    await prisma.$disconnect();
  }
}


