import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import {
  ShippingRequest,
  ShippingResponse,
  ShippingUpdate,
  ShippingWebhook,
  ShippingConnector,
  ShippingError,
  ShippingProviderError,
  ShippingTimeoutError,
  ShipmentStatus,
  ShippingProvider,
  REGION_CONFIGS,
} from '@newhill/shared/types/shipping';
import { ShippingAdapterFactory } from '../adapters/shipping/ShippingAdapterFactory';
import { Logger } from '../utils/logger';
import { MetricsCollector } from '../utils/metrics';

export class ShippingService {
  private prisma: PrismaClient;
  private logger: Logger;
  private metrics: MetricsCollector;

  constructor(prisma: PrismaClient, logger: Logger, metrics: MetricsCollector) {
    this.prisma = prisma;
    this.logger = logger;
    this.metrics = metrics;
  }

  async createShipment(request: ShippingRequest): Promise<ShippingResponse> {
    const startTime = Date.now();
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Creating shipment', {
        traceId,
        orderId: request.orderId,
        weight: request.weight,
        method: request.method,
        region: this.detectRegion(request.destination.country),
      });

      // Validate request
      await this.validateShippingRequest(request);

      // Get shipping adapter based on region
      const region = this.detectRegion(request.destination.country);
      const adapter = this.getShippingAdapter(region);

      // Create shipment record in database
      const shipmentRecord = await this.createShipmentRecord(request, adapter.provider);

      // Create shipment with provider
      const shipmentResponse = await this.createShipmentWithProvider(adapter, request, traceId);

      // Update shipment record with provider response
      await this.updateShipmentRecord(shipmentRecord.id, shipmentResponse);

      // Update order status
      await this.updateOrderStatus(request.orderId, 'processing');

      // Log metrics
      this.metrics.increment('shipment.created', {
        provider: adapter.provider,
        region,
        method: request.method,
      });

      this.metrics.timing('shipment.creation.duration', Date.now() - startTime, {
        provider: adapter.provider,
        region,
      });

      this.logger.info('Shipment created successfully', {
        traceId,
        shipmentId: shipmentResponse.shipmentId,
        trackingNumber: shipmentResponse.trackingNumber,
        provider: adapter.provider,
        region,
      });

      return shipmentResponse;

    } catch (error) {
      this.logger.error('Shipment creation failed', {
        traceId,
        error: error instanceof Error ? error.message : 'Unknown error',
        orderId: request.orderId,
        weight: request.weight,
        method: request.method,
      });

      this.metrics.increment('shipment.creation.failed', {
        error: error instanceof Error ? error.constructor.name : 'UnknownError',
        region: this.detectRegion(request.destination.country),
      });

      throw error;
    }
  }

  async getShipmentStatus(shipmentId: string): Promise<ShippingResponse> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Getting shipment status', {
        traceId,
        shipmentId,
      });

      // Find shipment record
      const shipmentRecord = await this.prisma.shipment.findFirst({
        where: { id: shipmentId },
        include: { order: true },
      });

      if (!shipmentRecord) {
        throw new ShippingError('SHIPMENT_NOT_FOUND', 'Shipment not found');
      }

      // Get shipping adapter
      const region = this.detectRegion(shipmentRecord.order.shippingAddress.country);
      const adapter = this.getShippingAdapter(region);

      // Get status from provider
      const statusResponse = await this.getShipmentStatusFromProvider(adapter, shipmentId, traceId);

      // Update shipment record
      await this.updateShipmentRecord(shipmentRecord.id, statusResponse);

      this.logger.info('Shipment status retrieved successfully', {
        traceId,
        shipmentId,
        status: statusResponse.status,
      });

      return statusResponse;

    } catch (error) {
      this.logger.error('Shipment status retrieval failed', {
        traceId,
        shipmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async trackShipment(trackingNumber: string): Promise<ShippingUpdate[]> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Tracking shipment', {
        traceId,
        trackingNumber,
      });

      // Find shipment record
      const shipmentRecord = await this.prisma.shipment.findFirst({
        where: { trackingNumber },
        include: { order: true },
      });

      if (!shipmentRecord) {
        throw new ShippingError('SHIPMENT_NOT_FOUND', 'Shipment not found');
      }

      // Get shipping adapter
      const region = this.detectRegion(shipmentRecord.order.shippingAddress.country);
      const adapter = this.getShippingAdapter(region);

      // Track shipment with provider
      const trackingUpdates = await this.trackShipmentWithProvider(adapter, trackingNumber, traceId);

      // Store tracking updates
      await this.storeTrackingUpdates(shipmentRecord.id, trackingUpdates);

      this.logger.info('Shipment tracking completed', {
        traceId,
        trackingNumber,
        updateCount: trackingUpdates.length,
      });

      return trackingUpdates;

    } catch (error) {
      this.logger.error('Shipment tracking failed', {
        traceId,
        trackingNumber,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async cancelShipment(shipmentId: string, reason?: string): Promise<boolean> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Cancelling shipment', {
        traceId,
        shipmentId,
        reason,
      });

      // Find shipment record
      const shipmentRecord = await this.prisma.shipment.findFirst({
        where: { id: shipmentId },
        include: { order: true },
      });

      if (!shipmentRecord) {
        throw new ShippingError('SHIPMENT_NOT_FOUND', 'Shipment not found');
      }

      // Get shipping adapter
      const region = this.detectRegion(shipmentRecord.order.shippingAddress.country);
      const adapter = this.getShippingAdapter(region);

      // Cancel shipment with provider
      const cancelled = await this.cancelShipmentWithProvider(adapter, shipmentId, reason, traceId);

      if (cancelled) {
        // Update shipment status
        await this.updateShipmentStatus(shipmentId, 'cancelled');

        // Update order status
        await this.updateOrderStatus(shipmentRecord.orderId, 'cancelled');

        this.logger.info('Shipment cancelled successfully', {
          traceId,
          shipmentId,
        });
      }

      return cancelled;

    } catch (error) {
      this.logger.error('Shipment cancellation failed', {
        traceId,
        shipmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async getShippingRates(request: Partial<ShippingRequest>): Promise<any[]> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Getting shipping rates', {
        traceId,
        origin: request.origin?.country,
        destination: request.destination?.country,
        weight: request.weight,
      });

      // Get shipping adapter
      const region = this.detectRegion(request.destination?.country || 'IN');
      const adapter = this.getShippingAdapter(region);

      // Get rates from provider
      const rates = await this.getShippingRatesFromProvider(adapter, request, traceId);

      this.logger.info('Shipping rates retrieved successfully', {
        traceId,
        rateCount: rates.length,
      });

      return rates;

    } catch (error) {
      this.logger.error('Shipping rates retrieval failed', {
        traceId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  async processWebhook(provider: ShippingProvider, payload: any, signature: string): Promise<ShippingWebhook> {
    const traceId = crypto.randomUUID();

    try {
      this.logger.info('Processing shipping webhook', {
        traceId,
        provider,
        event: payload.event,
      });

      // Get shipping adapter
      const region = this.detectRegionFromProvider(provider);
      const adapter = this.getShippingAdapter(region);

      // Validate webhook signature
      if (!adapter.validateWebhook(payload, signature)) {
        throw new ShippingError('INVALID_WEBHOOK_SIGNATURE', 'Invalid webhook signature');
      }

      // Process webhook
      const webhook = await adapter.processWebhook(payload);

      // Store webhook in database
      await this.storeWebhook(webhook);

      // Process webhook event
      await this.processWebhookEvent(webhook, traceId);

      this.logger.info('Shipping webhook processed successfully', {
        traceId,
        webhookId: webhook.id,
        provider,
        event: webhook.event,
      });

      return webhook;

    } catch (error) {
      this.logger.error('Shipping webhook processing failed', {
        traceId,
        provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  private async validateShippingRequest(request: ShippingRequest): Promise<void> {
    // Validate weight
    if (request.weight <= 0) {
      throw new ShippingError('INVALID_WEIGHT', 'Weight must be greater than 0');
    }

    // Validate dimensions
    const { length, width, height } = request.dimensions;
    if (length <= 0 || width <= 0 || height <= 0) {
      throw new ShippingError('INVALID_DIMENSIONS', 'All dimensions must be greater than 0');
    }

    // Validate value
    if (request.value <= 0) {
      throw new ShippingError('INVALID_VALUE', 'Declared value must be greater than 0');
    }

    // Validate order exists
    const order = await this.prisma.order.findUnique({
      where: { id: request.orderId },
    });

    if (!order) {
      throw new ShippingError('ORDER_NOT_FOUND', 'Order not found');
    }

    // Check if shipment already exists for this order
    const existingShipment = await this.prisma.shipment.findFirst({
      where: { orderId: request.orderId },
    });

    if (existingShipment) {
      throw new ShippingError('SHIPMENT_EXISTS', 'Shipment already exists for this order');
    }
  }

  private getShippingAdapter(region: string): ShippingConnector {
    try {
      return ShippingAdapterFactory.getAdapter(region, process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');
    } catch (error) {
      throw new ShippingError('UNSUPPORTED_REGION', `Shipping not supported for region: ${region}`);
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

  private detectRegionFromProvider(provider: ShippingProvider): string {
    const providerRegionMap: Record<ShippingProvider, string> = {
      'shiprocket': 'IN',
      'gcc_logistics': 'QA', // Default to Qatar for GCC
      'aramex': 'AE',
      'dhl': 'AE',
      'blue_dart': 'IN',
    };

    return providerRegionMap[provider] || 'IN';
  }

  private async createShipmentRecord(request: ShippingRequest, provider: ShippingProvider) {
    return this.prisma.shipment.create({
      data: {
        orderId: request.orderId,
        trackingNumber: crypto.randomUUID(), // Temporary tracking number
        carrier: provider,
        status: 'PENDING',
        notes: request.instructions,
        metadata: {
          weight: request.weight,
          dimensions: request.dimensions,
          value: request.value,
          currency: request.currency,
          method: request.method,
          origin: request.origin,
          destination: request.destination,
          items: request.items,
          provider,
        },
      },
    });
  }

  private async createShipmentWithProvider(adapter: ShippingConnector, request: ShippingRequest, traceId: string): Promise<ShippingResponse> {
    try {
      return await adapter.createShipment(request);
    } catch (error) {
      if (error instanceof ShippingTimeoutError) {
        this.metrics.increment('shipment.provider.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof ShippingProviderError) {
        this.metrics.increment('shipment.provider.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async getShipmentStatusFromProvider(adapter: ShippingConnector, shipmentId: string, traceId: string): Promise<ShippingResponse> {
    try {
      return await adapter.getShipmentStatus(shipmentId);
    } catch (error) {
      if (error instanceof ShippingTimeoutError) {
        this.metrics.increment('shipment.status.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof ShippingProviderError) {
        this.metrics.increment('shipment.status.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async trackShipmentWithProvider(adapter: ShippingConnector, trackingNumber: string, traceId: string): Promise<ShippingUpdate[]> {
    try {
      return await adapter.trackShipment(trackingNumber);
    } catch (error) {
      if (error instanceof ShippingTimeoutError) {
        this.metrics.increment('shipment.tracking.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof ShippingProviderError) {
        this.metrics.increment('shipment.tracking.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async cancelShipmentWithProvider(adapter: ShippingConnector, shipmentId: string, reason?: string, traceId: string): Promise<boolean> {
    try {
      return await adapter.cancelShipment(shipmentId, reason);
    } catch (error) {
      if (error instanceof ShippingTimeoutError) {
        this.metrics.increment('shipment.cancellation.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof ShippingProviderError) {
        this.metrics.increment('shipment.cancellation.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async getShippingRatesFromProvider(adapter: ShippingConnector, request: Partial<ShippingRequest>, traceId: string): Promise<any[]> {
    try {
      return await adapter.getShippingRates(request);
    } catch (error) {
      if (error instanceof ShippingTimeoutError) {
        this.metrics.increment('shipment.rates.timeout', {
          provider: adapter.provider,
          region: adapter.region,
        });
      } else if (error instanceof ShippingProviderError) {
        this.metrics.increment('shipment.rates.error', {
          provider: adapter.provider,
          region: adapter.region,
          errorCode: error.code,
        });
      }

      throw error;
    }
  }

  private async updateShipmentRecord(shipmentId: string, response: ShippingResponse) {
    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        trackingNumber: response.trackingNumber,
        carrier: response.provider,
        status: response.status.toUpperCase() as any,
        metadata: {
          ...response.metadata,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }

  private async updateShipmentStatus(shipmentId: string, status: string) {
    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status: status.toUpperCase() as any,
        updatedAt: new Date(),
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

  private async storeTrackingUpdates(shipmentId: string, updates: ShippingUpdate[]) {
    // Store tracking updates in database
    // This could be a separate tracking_updates table
    for (const update of updates) {
      // Store each update
    }
  }

  private async storeWebhook(webhook: ShippingWebhook) {
    // Store webhook in database for audit trail
    // Implementation depends on your webhook storage strategy
  }

  private async processWebhookEvent(webhook: ShippingWebhook, traceId: string) {
    // Process webhook event based on event type
    // This could include updating shipment status, sending notifications, etc.
    this.logger.info('Processing shipping webhook event', {
      traceId,
      webhookId: webhook.id,
      event: webhook.event,
      provider: webhook.provider,
    });
  }
}

