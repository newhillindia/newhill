import crypto from 'crypto';
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

export class TelrAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'telr';
  public readonly region: string;
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
    this.region = config.region;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(800 + Math.random() * 1500);

    // Mock payment creation
    const paymentId = `telr_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.03) { // 3% failure rate
      throw new PaymentProviderError(
        this.provider,
        'Payment gateway timeout',
        { errorCode: 'TIMEOUT_ERROR', retryAfter: 60 }
      );
    }

    return {
      paymentId,
      status: 'pending' as PaymentStatus,
      amount: request.amount,
      currency: request.currency,
      provider: this.provider,
      redirectUrl: this.getRedirectUrl(paymentId),
      paymentUrl: this.getPaymentUrl(paymentId),
      expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // 45 minutes
      metadata: {
        telrPaymentId: paymentId,
        orderId: request.orderId,
        customerId: request.customer.id,
        amount: request.amount,
        currency: request.currency,
        mode: this.config.mode,
        region: this.region,
        merchantId: this.config.credentials.keyId,
      },
    };
  }

  async verifyPayment(paymentId: string, signature?: string): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(600 + Math.random() * 800);

    // Mock payment verification with higher success rate
    const statuses: PaymentStatus[] = ['completed', 'completed', 'completed', 'pending', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      paymentId,
      status: randomStatus,
      amount: 500, // Mock amount
      currency: 'AED',
      provider: this.provider,
      metadata: {
        telrPaymentId: paymentId,
        status: randomStatus,
        verifiedAt: new Date().toISOString(),
        mode: this.config.mode,
        region: this.region,
        transactionId: `txn_${crypto.randomUUID().replace(/-/g, '')}`,
      },
    };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(1200 + Math.random() * 1800);

    // Mock refund processing
    const refundId = `refund_${crypto.randomUUID().replace(/-/g, '')}`;

    return {
      paymentId,
      status: 'refunded' as PaymentStatus,
      amount: amount || 500,
      currency: 'AED',
      provider: this.provider,
      metadata: {
        refundId,
        originalPaymentId: paymentId,
        amount: amount || 500,
        currency: 'AED',
        reason: reason || 'Customer requested refund',
        processedAt: new Date().toISOString(),
        mode: this.config.mode,
        region: this.region,
        refundTransactionId: `refund_txn_${crypto.randomUUID().replace(/-/g, '')}`,
      },
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    return this.verifyPayment(paymentId);
  }

  validateWebhook(payload: any, signature: string): boolean {
    // Mock webhook validation
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
    // Simulate webhook processing
    await this.delay(200 + Math.random() * 300);

    const event = payload.event || 'payment.completed';
    const payment = payload.data?.payment;

    return {
      id: payload.id || crypto.randomUUID(),
      provider: this.provider,
      event,
      data: payload.data || payload,
      signature: payload.signature || '',
      timestamp: new Date().toISOString(),
      processed: false,
      retryCount: 0,
    };
  }

  private getRedirectUrl(paymentId: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/checkout/telr?payment_id=${paymentId}`;
  }

  private getPaymentUrl(paymentId: string): string {
    return `https://secure.telr.com/pay/${paymentId}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

