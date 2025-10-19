import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@newhill/shared';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  category: 'general' | 'order' | 'b2b' | 'complaint' | 'feedback';
  message: string;
}

interface ContactResponse {
  success: boolean;
  message: string;
  ticketId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<ContactResponse>>
) {
  if (req.method !== 'POST') {
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
    const { name, email, phone, category, message }: ContactFormData = req.body;

    // Validate required fields
    if (!name || !email || !category || !message) {
      return res.status(400).json({
        success: false,
        error: {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: name, email, category, and message are required'
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format'
        }
      });
    }

    // Validate category
    const validCategories = ['general', 'order', 'b2b', 'complaint', 'feedback'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Invalid category. Must be one of: general, order, b2b, complaint, feedback'
        }
      });
    }

    // Generate a ticket ID
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // In a real app, this would:
    // 1. Save to database
    // 2. Send email notification to support team
    // 3. Send confirmation email to customer
    // 4. Create ticket in support system
    // 5. Send SMS notification if phone provided

    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Log the contact form submission (in real app, this would go to a logging service)
    console.log('Contact form submission:', {
      ticketId,
      name,
      email,
      phone,
      category,
      message: message.substring(0, 100) + '...',
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    // Determine response message based on category
    let responseMessage = 'Thank you for contacting us! We have received your message and will get back to you within 24 hours.';
    
    switch (category) {
      case 'order':
        responseMessage = 'Thank you for your order inquiry! Our team will review your request and contact you within 24 hours with order details and pricing.';
        break;
      case 'b2b':
        responseMessage = 'Thank you for your B2B inquiry! Our business development team will contact you within 24 hours to discuss your requirements and provide custom pricing.';
        break;
      case 'complaint':
        responseMessage = 'We apologize for any inconvenience. Your complaint has been logged and our customer service team will investigate and resolve this issue within 48 hours.';
        break;
      case 'feedback':
        responseMessage = 'Thank you for your valuable feedback! We appreciate your input and will use it to improve our services.';
        break;
    }

    const response: ContactResponse = {
      success: true,
      message: responseMessage,
      ticketId
    };

    res.status(200).json({
      success: true,
      data: response,
      meta: {
        traceId: `contact-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Contact API error:', error);
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to process contact form submission'
      }
    });
  }
}

