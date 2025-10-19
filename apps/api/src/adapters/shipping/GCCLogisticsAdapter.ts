import crypto from 'crypto';
import {
  ShippingConnector,
  ShippingRequest,
  ShippingResponse,
  ShippingUpdate,
  ShippingWebhook,
  ShippingConfig,
  ShippingError,
  ShippingProviderError,
  ShippingTimeoutError,
  ShipmentStatus,
  ShippingProvider,
  ShippingRate,
} from '@newhill/shared/types/shipping';

export class GCCLogisticsAdapter implements ShippingConnector {
  public readonly provider: ShippingProvider = 'gcc_logistics';
  public readonly region: string;
  private config: ShippingConfig;

  constructor(config: ShippingConfig) {
    this.config = config;
    this.region = config.region;
  }

  async createShipment(request: ShippingRequest): Promise<ShippingResponse> {
    // Simulate API delay
    await this.delay(1500 + Math.random() * 2000);

    // Mock shipment creation
    const shipmentId = `gcc_${crypto.randomUUID().replace(/-/g, '')}`;
    const trackingNumber = `GCC${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.08) { // 8% failure rate
      throw new ShippingProviderError(
        this.provider,
        'Shipping service temporarily unavailable',
        { errorCode: 'SERVICE_UNAVAILABLE', retryAfter: 60 }
      );
    }

    return {
      shipmentId,
      trackingNumber,
      status: 'pending' as ShipmentStatus,
      provider: this.provider,
      method: request.method,
      cost: this.calculateShippingCost(request),
      currency: request.currency,
      estimatedDelivery: this.calculateDeliveryDate(request.method),
      trackingUrl: this.getTrackingUrl(trackingNumber),
      labelUrl: this.getLabelUrl(shipmentId),
      metadata: {
        gccShipmentId: shipmentId,
        orderId: request.orderId,
        trackingNumber,
        weight: request.weight,
        dimensions: request.dimensions,
        value: request.value,
        currency: request.currency,
        mode: this.config.mode,
        region: this.region,
        courierPartner: this.getCourierPartner(),
        serviceType: request.method,
      },
    };
  }

  async getShipmentStatus(shipmentId: string): Promise<ShippingResponse> {
    // Simulate API delay
    await this.delay(800 + Math.random() * 1200);

    // Mock shipment status
    const statuses: ShipmentStatus[] = ['pending', 'packed', 'in_transit', 'out_for_delivery', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      shipmentId,
      trackingNumber: `GCC${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      status: randomStatus,
      provider: this.provider,
      method: 'standard',
      cost: 50,
      currency: this.getRegionCurrency(),
      estimatedDelivery: this.calculateDeliveryDate('standard'),
      trackingUrl: this.getTrackingUrl(`GCC${crypto.randomBytes(8).toString('hex').toUpperCase()}`),
      metadata: {
        gccShipmentId: shipmentId,
        status: randomStatus,
        lastUpdated: new Date().toISOString(),
        mode: this.config.mode,
        region: this.region,
        courierPartner: this.getCourierPartner(),
      },
    };
  }

  async trackShipment(trackingNumber: string): Promise<ShippingUpdate[]> {
    // Simulate API delay
    await this.delay(600 + Math.random() * 1000);

    // Mock tracking updates
    const updates: ShippingUpdate[] = [
      {
        shipmentId: `gcc_${crypto.randomUUID().replace(/-/g, '')}`,
        trackingNumber,
        status: 'packed',
        location: 'Dubai Warehouse',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        description: 'Package packed and ready for dispatch',
        metadata: {
          courierPartner: this.getCourierPartner(),
          facility: 'Dubai Warehouse',
        },
      },
      {
        shipmentId: `gcc_${crypto.randomUUID().replace(/-/g, '')}`,
        trackingNumber,
        status: 'in_transit',
        location: 'In Transit',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        description: 'Package in transit to destination',
        metadata: {
          courierPartner: this.getCourierPartner(),
          route: 'Dubai → Destination',
        },
      },
    ];

    return updates;
  }

  async cancelShipment(shipmentId: string, reason?: string): Promise<boolean> {
    // Simulate API delay
    await this.delay(1000 + Math.random() * 1500);

    // Mock cancellation
    return true;
  }

  async getShippingRates(request: Partial<ShippingRequest>): Promise<ShippingRate[]> {
    // Simulate API delay
    await this.delay(500 + Math.random() * 800);

    // Mock shipping rates
    const rates: ShippingRate[] = [
      {
        method: 'standard',
        cost: 25,
        currency: this.getRegionCurrency(),
        estimatedDays: 5,
        description: 'Standard delivery within GCC',
        isAvailable: true,
      },
      {
        method: 'express',
        cost: 45,
        currency: this.getRegionCurrency(),
        estimatedDays: 2,
        description: 'Express delivery within GCC',
        isAvailable: true,
      },
      {
        method: 'overnight',
        cost: 75,
        currency: this.getRegionCurrency(),
        estimatedDays: 1,
        description: 'Overnight delivery within GCC',
        isAvailable: true,
      },
      {
        method: 'economy',
        cost: 15,
        currency: this.getRegionCurrency(),
        estimatedDays: 7,
        description: 'Economy delivery within GCC',
        isAvailable: true,
      },
    ];

    return rates;
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

  async processWebhook(payload: any): Promise<ShippingWebhook> {
    // Simulate webhook processing
    await this.delay(200 + Math.random() * 400);

    const event = payload.event || 'shipment.updated';
    const shipment = payload.data?.shipment;

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

  private calculateShippingCost(request: ShippingRequest): number {
    const baseCost = 20;
    const weightCost = (request.weight / 1000) * 2; // 2 per kg
    const distanceCost = this.getDistanceCost(request.origin.country, request.destination.country);
    const methodMultiplier = this.getMethodMultiplier(request.method);
    
    return Math.round((baseCost + weightCost + distanceCost) * methodMultiplier);
  }

  private getDistanceCost(origin: string, destination: string): number {
    // Mock distance-based pricing
    const distanceMap: Record<string, number> = {
      'QA-QA': 0,
      'AE-AE': 0,
      'SA-SA': 0,
      'OM-OM': 0,
      'QA-AE': 5,
      'QA-SA': 8,
      'QA-OM': 6,
      'AE-QA': 5,
      'AE-SA': 7,
      'AE-OM': 5,
      'SA-QA': 8,
      'SA-AE': 7,
      'SA-OM': 4,
      'OM-QA': 6,
      'OM-AE': 5,
      'OM-SA': 4,
    };

    const key = `${origin}-${destination}`;
    return distanceMap[key] || 10;
  }

  private getMethodMultiplier(method: string): number {
    const multipliers: Record<string, number> = {
      'standard': 1.0,
      'express': 1.8,
      'overnight': 3.0,
      'economy': 0.7,
      'priority': 2.2,
    };

    return multipliers[method] || 1.0;
  }

  private getCourierPartner(): string {
    const partners = ['Aramex', 'DHL', 'FedEx', 'UPS', 'TNT'];
    return partners[Math.floor(Math.random() * partners.length)];
  }

  private getRegionCurrency(): string {
    const currencyMap: Record<string, string> = {
      'QA': 'QAR',
      'AE': 'AED',
      'SA': 'SAR',
      'OM': 'OMR',
    };

    return currencyMap[this.region] || 'USD';
  }

  private calculateDeliveryDate(method: string): string {
    const days = {
      'standard': 5,
      'express': 2,
      'overnight': 1,
      'economy': 7,
      'priority': 3,
    };

    const deliveryDays = days[method as keyof typeof days] || 5;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
    
    return deliveryDate.toISOString().split('T')[0];
  }

  private getTrackingUrl(trackingNumber: string): string {
    return `https://tracking.gcc-logistics.com/track/${trackingNumber}`;
  }

  private getLabelUrl(shipmentId: string): string {
    return `https://labels.gcc-logistics.com/download/${shipmentId}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

