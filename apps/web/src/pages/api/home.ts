import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@newhill/shared';

interface HomeData {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    showParticles: boolean;
  };
  usp: {
    title: string;
    subtitle: string;
    blocks: Array<{
      icon: string;
      title: string;
      description: string;
      features: string[];
    }>;
  };
  featuredProducts: string[];
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    company?: string;
    location?: string;
    content: string;
    rating: number;
    verified: boolean;
  }>;
  trustIndicators: {
    customers: number;
    experience: number;
    varieties: number;
    satisfaction: number;
  };
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<HomeData>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        status: 405,
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      }
    });
  }

  try {
    // In a real app, this data would come from a CMS or database
    const homeData: HomeData = {
      hero: {
        title: "Premium Spices from Farm to Table",
        subtitle: "Discover the finest spices directly from our farms in Munnar, Kerala. Since 1995, we've been bringing you authentic flavors that transform every meal.",
        backgroundImage: "/images/hero-bg.jpg",
        showParticles: true
      },
      usp: {
        title: "Why Choose Newhill Spices?",
        subtitle: "We're committed to bringing you the finest spices with uncompromising quality and authenticity.",
        blocks: [
          {
            icon: "Leaf",
            title: "Farm Fresh",
            description: "Our spices come directly from our own farms in Munnar, ensuring freshness and quality in every batch.",
            features: ["Direct from farm", "No middlemen", "Fresh harvest"]
          },
          {
            icon: "Award",
            title: "Premium Quality",
            description: "FSSAI certified organic spices that meet the highest standards of quality and purity.",
            features: ["FSSAI Certified", "Organic", "Premium grade"]
          },
          {
            icon: "Truck",
            title: "Fast Delivery",
            description: "Free shipping across India with fast, secure delivery to your doorstep.",
            features: ["Free shipping", "Fast delivery", "Secure packaging"]
          }
        ]
      },
      featuredProducts: [
        "premium-cardamom",
        "black-pepper",
        "cinnamon-sticks",
        "turmeric-powder",
        "cumin-seeds",
        "coriander-powder"
      ],
      testimonials: [
        {
          id: "1",
          name: "Priya Sharma",
          role: "Home Chef",
          location: "Mumbai",
          content: "The quality of spices from Newhill is exceptional. Every dish I make with their spices turns out amazing. The cardamom has such a beautiful aroma!",
          rating: 5,
          verified: true
        },
        {
          id: "2",
          name: "Rajesh Kumar",
          role: "Restaurant Owner",
          company: "Spice Garden Restaurant",
          location: "Delhi",
          content: "We've been using Newhill spices for over 3 years now. The consistency in quality and the authentic flavors have made our restaurant famous.",
          rating: 5,
          verified: true
        },
        {
          id: "3",
          name: "Sarah Ahmed",
          role: "Food Blogger",
          location: "Dubai",
          content: "As a food blogger, I've tried many spice brands, but Newhill stands out. Their organic certification and farm-to-table approach is exactly what I look for.",
          rating: 5,
          verified: true
        }
      ],
      trustIndicators: {
        customers: 10000,
        experience: 25,
        varieties: 50,
        satisfaction: 98
      },
      newsletter: {
        enabled: true,
        title: "Stay Updated with Our Latest Spices",
        subtitle: "Get exclusive offers, new product announcements, and cooking tips delivered to your inbox."
      }
    };

    res.status(200).json({
      success: true,
      data: homeData,
      meta: {
        traceId: `home-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Home API error:', error);
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch home data'
      }
    });
  }
}

