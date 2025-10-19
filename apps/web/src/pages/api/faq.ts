import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@newhill/shared';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'b2c' | 'b2b' | 'shipping' | 'returns' | 'general';
  tags: string[];
}

const faqData: FAQItem[] = [
  // B2C FAQs
  {
    id: '1',
    question: 'How long does shipping take?',
    answer: 'We offer free shipping across India with delivery times of 3-5 business days for most locations. Express delivery options are available for urgent orders with 1-2 day delivery.',
    category: 'b2c',
    tags: ['shipping', 'delivery', 'timeline']
  },
  {
    id: '2',
    question: 'What are your shipping charges?',
    answer: 'We provide free shipping on all orders above ₹500. For orders below ₹500, a nominal shipping charge of ₹50 applies. Express delivery charges are ₹100.',
    category: 'b2c',
    tags: ['shipping', 'charges', 'free']
  },
  {
    id: '3',
    question: 'Are your spices organic?',
    answer: 'Yes, all our spices are certified organic and grown using sustainable farming practices. We maintain strict quality standards and are FSSAI certified for food safety.',
    category: 'b2c',
    tags: ['organic', 'certification', 'quality']
  },
  {
    id: '4',
    question: 'How should I store the spices?',
    answer: 'Store spices in a cool, dry place away from direct sunlight. Use airtight containers to maintain freshness. Ground spices stay fresh for 6 months, while whole spices can last up to 2 years.',
    category: 'b2c',
    tags: ['storage', 'freshness', 'shelf-life']
  },
  {
    id: '5',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unopened products. If you\'re not satisfied with your purchase, we\'ll provide a full refund or replacement. Contact our customer service to initiate a return.',
    category: 'b2c',
    tags: ['returns', 'refund', 'policy']
  },
  {
    id: '6',
    question: 'Do you offer bulk discounts?',
    answer: 'Yes, we offer discounts on bulk orders. For orders above ₹5000, you get 5% off. For orders above ₹10000, you get 10% off. Contact us for custom pricing on very large orders.',
    category: 'b2c',
    tags: ['bulk', 'discount', 'pricing']
  },
  
  // B2B FAQs
  {
    id: '7',
    question: 'Do you offer B2B pricing?',
    answer: 'Yes, we offer special pricing for restaurants, food businesses, and bulk orders. Our B2B pricing starts at 15% off retail prices with additional discounts for larger volumes.',
    category: 'b2b',
    tags: ['b2b', 'pricing', 'restaurant']
  },
  {
    id: '8',
    question: 'What are your minimum order quantities for B2B?',
    answer: 'Our minimum order quantity for B2B customers is ₹10,000. We can accommodate custom requirements for larger establishments and provide flexible payment terms.',
    category: 'b2b',
    tags: ['b2b', 'minimum', 'quantity']
  },
  {
    id: '9',
    question: 'Do you provide B2B customers with invoices?',
    answer: 'Yes, we provide proper GST invoices for all B2B orders. Our invoices include all necessary details for tax compliance and accounting purposes.',
    category: 'b2b',
    tags: ['b2b', 'invoice', 'gst']
  },
  {
    id: '10',
    question: 'Can you supply custom spice blends?',
    answer: 'Yes, we can create custom spice blends according to your specifications. Our team works with you to develop unique blends that meet your culinary requirements.',
    category: 'b2b',
    tags: ['b2b', 'custom', 'blends']
  },
  
  // Shipping FAQs
  {
    id: '11',
    question: 'Which areas do you deliver to?',
    answer: 'We deliver to all major cities and towns across India. We also deliver to remote areas, though delivery times may be longer. Contact us to confirm delivery to your specific location.',
    category: 'shipping',
    tags: ['delivery', 'areas', 'coverage']
  },
  {
    id: '12',
    question: 'Can I track my order?',
    answer: 'Yes, once your order is shipped, you\'ll receive a tracking number via SMS and email. You can track your order status on our website or through the courier company\'s website.',
    category: 'shipping',
    tags: ['tracking', 'order', 'status']
  },
  {
    id: '13',
    question: 'What if I\'m not available during delivery?',
    answer: 'Our delivery partners will attempt delivery twice. If you\'re not available, they\'ll leave a calling card with contact details. You can reschedule delivery or collect from their nearest facility.',
    category: 'shipping',
    tags: ['delivery', 'unavailable', 'reschedule']
  },
  
  // Returns FAQs
  {
    id: '14',
    question: 'How do I return a product?',
    answer: 'To return a product, contact our customer service team with your order number. We\'ll provide you with a return authorization and guide you through the process. Returns must be in original packaging.',
    category: 'returns',
    tags: ['return', 'process', 'packaging']
  },
  {
    id: '15',
    question: 'What if my product arrives damaged?',
    answer: 'If your product arrives damaged, please contact us immediately with photos of the damage. We\'ll arrange for a replacement or refund at no additional cost to you.',
    category: 'returns',
    tags: ['damaged', 'replacement', 'refund']
  },
  {
    id: '16',
    question: 'How long does it take to process a refund?',
    answer: 'Once we receive your returned product, we process refunds within 3-5 business days. The refund will be credited to your original payment method within 7-10 business days.',
    category: 'returns',
    tags: ['refund', 'processing', 'timeline']
  },
  
  // General FAQs
  {
    id: '17',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery. All payments are processed securely through our payment partners.',
    category: 'general',
    tags: ['payment', 'methods', 'security']
  },
  {
    id: '18',
    question: 'Is my personal information secure?',
    answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent.',
    category: 'general',
    tags: ['privacy', 'security', 'data']
  },
  {
    id: '19',
    question: 'Do you have a mobile app?',
    answer: 'Currently, we don\'t have a mobile app, but our website is fully optimized for mobile devices. We\'re working on a mobile app that will be available soon.',
    category: 'general',
    tags: ['mobile', 'app', 'website']
  },
  {
    id: '20',
    question: 'How can I contact customer support?',
    answer: 'You can contact our customer support team via phone (+91 98765 43210), email (support@newhillspices.com), or through our contact form. We\'re available Monday to Friday, 9 AM to 6 PM.',
    category: 'general',
    tags: ['support', 'contact', 'hours']
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FAQItem[]>>
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
    const { category, search } = req.query;

    let filteredFAQs = faqData;

    // Filter by category
    if (category && category !== 'all') {
      filteredFAQs = filteredFAQs.filter(faq => faq.category === category);
    }

    // Search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredFAQs = filteredFAQs.filter(faq => 
        faq.question.toLowerCase().includes(searchTerm) ||
        faq.answer.toLowerCase().includes(searchTerm) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    res.status(200).json({
      success: true,
      data: filteredFAQs,
      meta: {
        traceId: `faq-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('FAQ API error:', error);
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch FAQ data'
      }
    });
  }
}

