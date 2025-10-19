import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

// Mock toggles data - in production, this would come from a database
const mockToggles = [
  {
    id: 'multiLang',
    name: 'Multi-Language Support',
    description: 'Enable support for multiple languages (English, Arabic, Hindi)',
    enabled: true,
    category: 'general',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'multiCurrency',
    name: 'Multi-Currency Support',
    description: 'Enable support for multiple currencies (INR, QAR, AED, SAR, OMR)',
    enabled: true,
    category: 'general',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'allowGuestCheckout',
    name: 'Guest Checkout',
    description: 'Allow customers to checkout without creating an account',
    enabled: true,
    category: 'features',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'enableB2B',
    name: 'B2B Portal',
    description: 'Enable business-to-business portal and features',
    enabled: true,
    category: 'features',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Enable newsletter subscription functionality',
    enabled: true,
    category: 'marketing',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'subscriptions',
    name: 'Product Subscriptions',
    description: 'Enable recurring product subscriptions',
    enabled: false,
    category: 'features',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'enableGCCShipping',
    name: 'GCC Shipping',
    description: 'Enable shipping to GCC countries',
    enabled: true,
    category: 'shipping',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'enableRazorpay',
    name: 'Razorpay Payments',
    description: 'Enable Razorpay payment gateway',
    enabled: true,
    category: 'payments',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'enableStripe',
    name: 'Stripe Payments',
    description: 'Enable Stripe payment gateway',
    enabled: false,
    category: 'payments',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'enableWishlist',
    name: 'Wishlist Feature',
    description: 'Enable product wishlist functionality',
    enabled: true,
    category: 'features',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'enableReviews',
    name: 'Product Reviews',
    description: 'Enable customer product reviews and ratings',
    enabled: true,
    category: 'features',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  },
  {
    id: 'enableInventoryTracking',
    name: 'Inventory Tracking',
    description: 'Enable real-time inventory tracking and low-stock alerts',
    enabled: true,
    category: 'features',
    lastUpdated: '2024-01-15T10:30:00Z',
    updatedBy: 'admin'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      res.status(200).json({ toggles: mockToggles });
    } catch (error) {
      console.error('Error fetching toggles:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
