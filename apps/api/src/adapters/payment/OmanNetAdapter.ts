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

export class OmanNetAdapter implements PaymentAdapter {
  public readonly provider: PaymentProvider = 'oman_net';
  public readonly region: string;
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
    this.region = config.region;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(1100 + Math.random() * 1800);

    // Mock payment creation
    const paymentId = `oman_net_${crypto.randomUUID().replace(/-/g, '')}`;
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.06) { // 6% failure rate
      throw new PaymentProviderError(
        this.provider,
        'Payment gateway connection failed',
        { errorCode: 'CONNECTION_ERROR', retryAfter: 90 }
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
      expiresAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(), // 20 minutes
      metadata: {
        omanNetPaymentId: paymentId,
        orderId: request.orderId,
        customerId: request.customer.id,
        amount: request.amount,
        currency: request.currency,
        mode: this.config.mode,
        region: this.region,
        merchantId: this.config.credentials.keyId,
        sandboxMode: this.config.mode === 'sandbox',
      },
    };
  }

  async verifyPayment(paymentId: string, signature?: string): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(800 + Math.random() * 1000);

    // Mock payment verification with sandbox behavior
    const statuses: PaymentStatus[] = ['pending', 'pending', 'completed', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      paymentId,
      status: randomStatus,
      amount: 250, // Mock amount
      currency: 'OMR',
      provider: this.provider,
      metadata: {
        omanNetPaymentId: paymentId,
        status: randomStatus,
        verifiedAt: new Date().toISOString(),
        mode: this.config.mode,
        region: this.region,
        transactionId: `txn_${crypto.randomUUID().replace(/-/g, '')}`,
        sandboxMode: this.config.mode === 'sandbox',
        bankCode: 'OMAN_NET',
      },
    };
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    // Simulate API delay
    await this.delay(1300 + Math.random() * 2000);

    // Mock refund processing
    const refundId = `refund_${crypto.randomUUID().replace(/-/g, '')}`;

    return {
      paymentId,
      status: 'refunded' as PaymentStatus,
      amount: amount || 250,
      currency: 'OMR',
      provider: this.provider,
      metadata: {
        refundId,
        originalPaymentId: paymentId,
        amount: amount || 250,
        currency: 'OMR',
        reason: reason || 'Customer requested refund',
        processedAt: new Date().toISOString(),
        mode: this.config.mode,
        region: this.region,
        refundTransactionId: `refund_txn_${crypto.randomUUID().replace(/-/g, '')}`,
        sandboxMode: this.config.mode === 'sandbox',
        bankCode: 'OMAN_NET',
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
    await this.delay(250 + Math.random() * 500);

    const event = payload.event || 'payment.updated';
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
    return `${process.env.NEXT_PUBLIC_APP_URL}/checkout/oman-net?payment_id=${paymentId}`;
  }

  private getPaymentUrl(paymentId: string): string {
    return `https://sandbox.oman-net.com/payment/${paymentId}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

