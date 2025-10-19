import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export class EmailService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'info@newhillspices.com';
  }

  async sendEmail(template: EmailTemplate) {
    try {
      const { data, error } = await resend.emails.send({
        from: template.from || this.fromEmail,
        to: Array.isArray(template.to) ? template.to : [template.to],
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (error) {
        console.error('Email sending error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Email service error:', error);
      throw error;
    }
  }

  // Welcome email for new users
  async sendWelcomeEmail(userEmail: string, userName: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #046E5B 0%, #0A8B73 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Newhill Spices!</h1>
          <p style="color: #E6C659; margin: 10px 0 0 0; font-size: 16px;">Premium Farm-to-Table Spices Since 1995</p>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #046E5B; margin-top: 0;">Hello ${userName}!</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining Newhill Spices! We're excited to have you as part of our community of spice enthusiasts.
          </p>
          
          <div style="background: white; padding: 30px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #D4AF37;">
            <h3 style="color: #046E5B; margin-top: 0;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Explore our premium spice collection</li>
              <li>Discover authentic flavors from Munnar, Kerala</li>
              <li>Get exclusive offers and cooking tips</li>
              <li>Join our community of food lovers</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" 
               style="background: #046E5B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Start Shopping
            </a>
          </div>
        </div>
        
        <div style="background: #046E5B; padding: 20px; text-align: center; color: white;">
          <p style="margin: 0; font-size: 14px;">
            © 2024 Newhill Spices. All rights reserved.<br>
            Munnar, Kerala 685612, India
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Welcome to Newhill Spices! 🌶️',
      html,
    });
  }

  // Order confirmation email
  async sendOrderConfirmation(userEmail: string, orderData: any) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #046E5B 0%, #0A8B73 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
          <p style="color: #E6C659; margin: 10px 0 0 0; font-size: 16px;">Order #${orderData.orderNumber}</p>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #046E5B; margin-top: 0;">Thank you for your order!</h2>
          <p style="color: #666; line-height: 1.6;">
            We've received your order and will start preparing it for shipment.
          </p>
          
          <div style="background: white; padding: 30px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #046E5B; margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            <p><strong>Total Amount:</strong> ₹${orderData.total}</p>
            <p><strong>Status:</strong> ${orderData.status}</p>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      html,
    });
  }

  // Password reset email
  async sendPasswordResetEmail(userEmail: string, resetToken: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #046E5B 0%, #0A8B73 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
        </div>
        
        <div style="padding: 40px; background: #f9f9f9;">
          <h2 style="color: #046E5B; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6;">
            Click the button below to reset your password. This link will expire in 1 hour.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #046E5B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject: 'Reset Your Password - Newhill Spices',
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();