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

export class MoyasarAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'moyasar';
  public readonly region: string;
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
    this.region = config.region;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(900 + Math.random() * 1200);

    // Mock payment creation
    const paymentId = `moyasar_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.04) { // 4% failure rate
      throw new PaymentProviderError(
        this.provider,
        'Payment gateway service unavailable',
        { errorCode: 'SERVICE_UNAVAILABLE', retryAfter: 45 }
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
      expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes
      metadata: {
        moyasarPaymentId: paymentId,
        orderId: request.orderId,
        customerId: request.customer.id,
        amount: request.amount,
        currency: request.currency,
        mode: this.config.mode,
        region: this.region,
        merchantId: this.config.credentials.keyId,
        apiVersion: '1.0',
      },
    };
  }

  async verifyPayment(paymentId: string, signature?: string): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(700 + Math.random() * 900);

    // Mock payment verification with event-based flow
    const statuses: PaymentStatus[] = ['processing', 'processing', 'completed', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      paymentId,
      status: randomStatus,
      amount: 750, // Mock amount
      currency: 'SAR',
      provider: this.provider,
      metadata: {
        moyasarPaymentId: paymentId,
        status: randomStatus,
        verifiedAt: new Date().toISOString(),
        mode: this.config.mode,
        region: this.region,
        transactionId: `txn_${crypto.randomUUID().replace(/-/g, '')}`,
        eventType: 'payment.updated',
      },
    };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(1000 + Math.random() * 1500);

    // Mock refund processing
    const refundId = `refund_${crypto.randomUUID().replace(/-/g, '')}`;

    return {
      paymentId,
      status: 'refunded' as PaymentStatus,
      amount: amount || 750,
      currency: 'SAR',
      provider: this.provider,
      metadata: {
        refundId,
        originalPaymentId: paymentId,
        amount: amount || 750,
        currency: 'SAR',
        reason: reason || 'Customer requested refund',
        processedAt: new Date().toISOString(),
        mode: this.config.mode,
        region: this.region,
        refundTransactionId: `refund_txn_${crypto.randomUUID().replace(/-/g, '')}`,
        eventType: 'refund.created',
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
    await this.delay(150 + Math.random() * 400);

    const event = payload.event || 'payment.status_changed';
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
    return `${process.env.NEXT_PUBLIC_APP_URL}/checkout/moyasar?payment_id=${paymentId}`;
  }

  private getPaymentUrl(paymentId: string): string {
    return `https://api.moyasar.com/v1/payments/${paymentId}/pay`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

