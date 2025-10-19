import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';
import {
  PaymentAdapter,
  PaymentRequest,
  PaymentResponse,
  PaymentWebhook,
  PaymentConfig,
  PaymentError,
  PaymentProviderError,
  PaymentTimeoutError,
  PaymentStatus,
  PaymentProvider,
} from '@newhill/shared/types/payment';

export class RazorpayAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'razorpay';
  public readonly region: string;
  private client: AxiosInstance;
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
    this.region = config.region;
    
    this.client = axios.create({
      baseURL: config.mode === 'live' 
        ? 'https://api.razorpay.com/v1' 
        : 'https://api.razorpay.com/v1',
      auth: {
        username: config.credentials.keyId,
        password: config.credentials.keySecret,
      },
      timeout: config.settings.timeout,
    });
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const razorpayOrder = {
        amount: Math.round(request.amount * 100), // Convert to paise
        currency: request.currency,
        receipt: request.orderId,
        notes: {
          order_id: request.orderId,
          customer_id: request.customer.id,
          customer_email: request.customer.email,
          customer_phone: request.customer.phone,
          billing_address: JSON.stringify(request.billingAddress),
          shipping_address: JSON.stringify(request.shippingAddress),
          items: JSON.stringify(request.items),
          idempotency_key: request.idempotencyKey,
          ...request.metadata,
        },
      };

      const response = await this.client.post('/orders', razorpayOrder);
      const order = response.data;

      return {
        paymentId: order.id,
        status: 'pending' as PaymentStatus,
        amount: request.amount,
        currency: request.currency,
        provider: this.provider,
        redirectUrl: this.getRedirectUrl(order.id),
        paymentUrl: this.getPaymentUrl(order.id),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        metadata: {
          razorpayOrderId: order.id,
          receipt: order.receipt,
          amount: order.amount,
          currency: order.currency,
          status: order.status,
        },
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new PaymentTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new PaymentProviderError(
        this.provider,
        error.response?.data?.error?.description || error.message,
        error.response?.data
      );
    }
  }

  async verifyPayment(paymentId: string, signature?: string): Promise<PaymentResponse> {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      const payment = response.data;

      // Verify signature if provided
      if (signature) {
        const isValid = this.verifySignature(paymentId, signature);
        if (!isValid) {
          throw new PaymentError('INVALID_SIGNATURE', 'Payment signature verification failed');
        }
      }

      return {
        paymentId: payment.id,
        status: this.mapRazorpayStatus(payment.status),
        amount: payment.amount / 100, // Convert from paise
        currency: payment.currency,
        provider: this.provider,
        metadata: {
          razorpayPaymentId: payment.id,
          orderId: payment.order_id,
          method: payment.method,
          bank: payment.bank,
          wallet: payment.wallet,
          vpa: payment.vpa,
          email: payment.email,
          contact: payment.contact,
          fee: payment.fee,
          tax: payment.tax,
          errorCode: payment.error_code,
          errorDescription: payment.error_description,
        },
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new PaymentTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new PaymentProviderError(
        this.provider,
        error.response?.data?.error?.description || error.message,
        error.response?.data
      );
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    try {
      const refundData: any = {
        payment_id: paymentId,
        notes: {
          reason: reason || 'Customer requested refund',
        },
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Convert to paise
      }

      const response = await this.client.post('/refunds', refundData);
      const refund = response.data;

      return {
        paymentId: refund.payment_id,
        status: 'refunded' as PaymentStatus,
        amount: refund.amount / 100, // Convert from paise
        currency: refund.currency,
        provider: this.provider,
        metadata: {
          refundId: refund.id,
          paymentId: refund.payment_id,
          amount: refund.amount,
          currency: refund.currency,
          status: refund.status,
          speed: refund.speed,
          notes: refund.notes,
        },
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new PaymentTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new PaymentProviderError(
        this.provider,
        error.response?.data?.error?.description || error.message,
        error.response?.data
      );
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    return this.verifyPayment(paymentId);
  }

  validateWebhook(payload: any, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.credentials.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch (error) {
      return false;
    }
  }

  async processWebhook(payload: any): Promise<PaymentWebhook> {
    const event = payload.event;
    const payment = payload.payload.payment?.entity;

    return {
      id: payload.event_id || crypto.randomUUID(),
      provider: this.provider,
      event,
      data: payload.payload,
      signature: payload.signature || '',
      timestamp: new Date().toISOString(),
      processed: false,
      retryCount: 0,
    };
  }

  private verifySignature(paymentId: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.config.credentials.webhookSecret)
        .update(paymentId)
        .digest('hex');

      return crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      );
    } catch (error) {
      return false;
    }
  }

  private mapRazorpayStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'created': 'pending',
      'authorized': 'processing',
      'captured': 'completed',
      'refunded': 'refunded',
      'failed': 'failed',
      'cancelled': 'cancelled',
    };

    return statusMap[status] || 'pending';
  }

  private getRedirectUrl(orderId: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/checkout/razorpay?order_id=${orderId}`;
  }

  private getPaymentUrl(orderId: string): string {
    return `https://checkout.razorpay.com/v1/checkout.js?order_id=${orderId}`;
  }
}

