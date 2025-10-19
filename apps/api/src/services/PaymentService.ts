import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import {
  PaymentRequest,
  PaymentResponse,
  PaymentWebhook,
  PaymentAdapter,
  PaymentError,
  PaymentProviderError,
  PaymentTimeoutError,
  PaymentStatus,
  PaymentProvider,
  REGION_CONFIGS,
} from '@newhill/shared/types/payment';
import { PaymentAdapterFactory } from '../adapters/payment/PaymentAdapterFactory';
import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';

export class PaymentService {
  private prisma: PrismaClient;
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor(prisma: PrismaClient, logger: Logger, metrics: MetricsCollector) {
    this.prisma = prisma;
    this.logger = logger;
    this.metrics = metrics;
  }

  async initiatePayment(request: PaymentRequest): Promise<PaymentResponse> {
    const startTime = Date.now();
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Initiating payment', {
        traceId,
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
        region: this.detectRegion(request.billingAddress.country),
      });

      // Validate request
      await this.validatePaymentRequest(request);

      // Get payment adapter based on region
      const region = this.detectRegion(request.billingAddress.country);
      const adapter = this.getPaymentAdapter(region);

      // Check for duplicate payment (idempotency)
      const existingPayment = await this.findExistingPayment(request.idempotencyKey);
      if (existingPayment) {
        this.logger.info('Duplicate payment request detected', {
          traceId,
          idempotencyKey: request.idempotencyKey,
          existingPaymentId: existingPayment.id,
        });

        return {
          paymentId: existingPayment.providerId,
          status: existingPayment.status as PaymentStatus,
          amount: Number(existingPayment.amount),
          currency: existingPayment.currency,
          provider: adapter.provider,
          metadata: existingPayment.metadata as any,
        };
      }

      // Create payment record in database
      const paymentRecord = await this.createPaymentRecord(request, adapter.provider);

      // Create payment with provider
      const paymentResponse = await this.createPaymentWithProvider(adapter, request, traceId);

      // Update payment record with provider response
      await this.updatePaymentRecord(paymentRecord.id, paymentResponse);

      // Log metrics
      this.metrics.increment('payment.initiated', {
        provider: adapter.provider,
        region,
        currency: request.currency,
      });

      this.metrics.timing('payment.initiation.duration', Date.now() - startTime, {
        provider: adapter.provider,
        region,
      });

      this.logger.info('Payment initiated successfully', {
        traceId,
        paymentId: paymentResponse.paymentId,
        provider: adapter.provider,
        region,
      });

      return paymentResponse;

    } catch (error) {
      this.logger.error('Payment initiation failed', {
        traceId,
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: request.orderId,
        amount: request.amount,
        currency: request.currency,
      });

      this.metrics.increment('payment.initiation.failed', {
        error: error instanceof Error ? error.constructor.name : 'UnknownError',
        region: this.detectRegion(request.billingAddress.country),
      });

      throw error;
    }
  }

  async verifyPayment(paymentId: string, signature?: string): Promise<PaymentResponse> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Verifying payment', {
        traceId,
        paymentId,
      });

      // Find payment record
      const paymentRecord = await this.prisma.payment.findFirst({
        where: { providerId: paymentId },
        include: { order: true },
      });

      if (!paymentRecord) {
        throw new PaymentError('PAYMENT_NOT_FOUND', 'Payment not found');
      }

      // Get payment adapter
      const region = this.detectRegion(paymentRecord.order.shippingAddress.country);
      const adapter = this.getPaymentAdapter(region);

      // Verify payment with provider
      const paymentResponse = await this.verifyPaymentWithProvider(adapter, paymentId, signature, traceId);

      // Update payment record
      await this.updatePaymentRecord(paymentRecord.id, paymentResponse);

      // Update order status if payment completed
      if (paymentResponse.status === 'completed') {
        await this.updateOrderStatus(paymentRecord.orderId, 'confirmed');
      }

      this.logger.info('Payment verified successfully', {
        traceId,
        paymentId,
        status: paymentResponse.status,
      });

      return paymentResponse;

    } catch (error) {
      this.logger.error('Payment verification failed', {
        traceId,
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async processWebhook(provider: PaymentProvider, payload: any, signature: string): Promise<PaymentWebhook> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Processing payment webhook', {
        traceId,
        provider,
        event: payload.event,
      });

      // Get payment adapter
      const region = this.detectRegionFromProvider(provider);
      const adapter = this.getPaymentAdapter(region);

      // Validate webhook signature
      if (!adapter.validateWebhook(payload, signature)) {
        throw new PaymentError('INVALID_WEBHOOK_SIGNATURE', 'Invalid webhook signature');
      }

      // Process webhook
      const webhook = await adapter.processWebhook(payload);

      // Store webhook in database
      await this.storeWebhook(webhook);

      // Process webhook event
      await this.processWebhookEvent(webhook, traceId);

      this.logger.info('Payment webhook processed successfully', {
        traceId,
        webhookId: webhook.id,
        provider,
        event: webhook.event,
      });

      return webhook;

    } catch (error) {
      this.logger.error('Payment webhook processing failed', {
        traceId,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number, reason?: string): Promise<PaymentResponse> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Processing payment refund', {
        traceId,
        paymentId,
        amount,
        reason,
      });

      // Find payment record
      const paymentRecord = await this.prisma.payment.findFirst({
        where: { providerId: paymentId },
        include: { order: true },
      });

      if (!paymentRecord) {
        throw new PaymentError('PAYMENT_NOT_FOUND', 'Payment not found');
      }

      // Get payment adapter
      const region = this.detectRegion(paymentRecord.order.shippingAddress.country);
      const adapter = this.getPaymentAdapter(region);

      // Process refund with provider
      const refundResponse = await this.refundPaymentWithProvider(adapter, paymentId, amount, reason, traceId);

      // Update payment record
      await this.updatePaymentRecord(paymentRecord.id, refundResponse);

      // Update order status
      await this.updateOrderStatus(paymentRecord.orderId, 'refunded');

      this.logger.info('Payment refund processed successfully', {
        traceId,
        paymentId,
        refundAmount: refundResponse.amount,
      });

      return refundResponse;

    } catch (error) {
      this.logger.error('Payment refund failed', {
        traceId,
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private async validatePaymentRequest(request: PaymentRequest): Promise<void> {
    // Validate amount
    if (request.amount <= 0) {
      throw new PaymentError('INVALID_AMOUNT', 'Payment amount must be greater than 0');
    }

    // Validate currency
    const region = this.detectRegion(request.billingAddress.country);
    const regionConfig = REGION_CONFIGS[region];
    if (regionConfig && request.currency !== regionConfig.currency) {
      throw new PaymentError('INVALID_CURRENCY', `Currency ${request.currency} not supported for region ${region}`);
    }

    // Validate order exists
    const order = await this.prisma.order.findUnique({
      where: { id: request.orderId },
    });

    if (!order) {
      throw new PaymentError('ORDER_NOT_FOUND', 'Order not found');
    }

    // Validate order amount matches payment amount
    if (Math.abs(Number(order.totalAmount) - request.amount) > 0.01) {
      throw new PaymentError('AMOUNT_MISMATCH', 'Payment amount does not match order total');
    }
  }

  private getPaymentAdapter(region: string): PaymentAdapter {
    try {
      return PaymentAdapterFactory.getAdapter(region, process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');
    } catch (error) {
      throw new PaymentError('UNSUPPORTED_REGION', `Payment not supported for region: ${region}`);
    }
  }

  private detectRegion(countryCode: string): string {
    const regionMap: Record<string, string> = {
      'IN': 'IN',
      'QA': 'QA',
      'AE': 'AE',
      'SA': 'SA',
      'OM': 'OM',
    };

    return regionMap[countryCode] || 'IN';
  }

  private detectRegionFromProvider(provider: PaymentProvider): string {
    const providerRegionMap: Record<PaymentProvider, string> = {
      'razorpay': 'IN',
      'dibsy': 'QA',
      'telr': 'AE',
      'moyasar': 'SA',
      'oman_net': 'OM',
    };

    return providerRegionMap[provider] || 'IN';
  }

  private async findExistingPayment(idempotencyKey: string) {
    return this.prisma.payment.findFirst({
      where: {
        metadata: {
          path: ['idempotencyKey'],
          equals: idempotencyKey,
        },
      },
    });
  }

  private async createPaymentRecord(request: PaymentRequest, provider: PaymentProvider) {
    return this.prisma.payment.create({
      data: {
        orderId: request.orderId,
        providerId: crypto.randomUUID(), // Temporary ID, will be updated
        amount: request.amount,
        currency: request.currency,
        status: 'PENDING',
        metadata: {
          idempotencyKey: request.idempotencyKey,
          customer: request.customer,
          billingAddress: request.billingAddress,
          shippingAddress: request.shippingAddress,
          items: request.items,
          provider,
        },
      },
    });
  }

  private async createPaymentWithProvider(adapter: PaymentAdapter, request: PaymentRequest, traceId: string): Promise<PaymentResponse> {
    try {
      return await adapter.createPayment(request);
    } catch (error) {
      if (error instanceof PaymentTimeoutError) {
        this.metrics.increment('payment.provider.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof PaymentProviderError) {
        this.metrics.increment('payment.provider.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async verifyPaymentWithProvider(adapter: PaymentAdapter, paymentId: string, signature?: string, traceId: string): Promise<PaymentResponse> {
    try {
      return await adapter.verifyPayment(paymentId, signature);
    } catch (error) {
      if (error instanceof PaymentTimeoutError) {
        this.metrics.increment('payment.verification.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof PaymentProviderError) {
        this.metrics.increment('payment.verification.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async refundPaymentWithProvider(adapter: PaymentAdapter, paymentId: string, amount?: number, reason?: string, traceId: string): Promise<PaymentResponse> {
    try {
      return await adapter.refundPayment(paymentId, amount, reason);
    } catch (error) {
      if (error instanceof PaymentTimeoutError) {
        this.metrics.increment('payment.refund.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof PaymentProviderError) {
        this.metrics.increment('payment.refund.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async updatePaymentRecord(paymentId: string, response: PaymentResponse) {
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        providerId: response.paymentId,
        status: response.status.toUpperCase() as any,
        signature: response.metadata?.signature,
        metadata: {
          ...response.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }

  private async updateOrderStatus(orderId: string, status: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: status.toUpperCase() as any,
        updatedAt: new Date(),
      },
    });
  }

  private async storeWebhook(webhook: PaymentWebhook) {
    // Store webhook in database for audit trail
    // Implementation depends on your webhook storage strategy
  }

  private async processWebhookEvent(webhook: PaymentWebhook, traceId: string) {
    // Process webhook event based on event type
    // This could include updating order status, sending notifications, etc.
    this.logger.info('Processing webhook event', {
      traceId,
      webhookId: webhook.id,
      event: webhook.event,
      provider: webhook.provider,
    });
  }
}

