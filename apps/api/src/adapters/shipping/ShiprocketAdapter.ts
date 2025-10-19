import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';
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

export class ShiprocketAdapter implements ShippingConnector {
  public readonly provider: ShippingProvider = 'shiprocket';
  public readonly region: string;
  private client: AxiosInstance;
  private config: ShippingConfig;
  private accessToken?: string;

  constructor(config: ShippingConfig) {
    this.config = config;
    this.region = config.region;
    
    this.client = axios.create({
      baseURL: config.mode === 'live' 
        ? 'https://apiv2.shiprocket.in/v1/external' 
        : 'https://apiv2.shiprocket.in/v1/external',
      timeout: config.settings.timeout,
    });
  }

  async createShipment(request: ShippingRequest): Promise<ShippingResponse> {
    try {
      // Authenticate if needed
      if (!this.accessToken) {
        await this.authenticate();
      }

      const shipmentData = {
        order_id: request.orderId,
        channel_id: '1', // Default channel
        pickup_location: {
          name: 'Newhill Spices Warehouse',
          phone: '+91-9876543210',
          address: request.origin.address1,
          address_2: request.origin.address2 || '',
          city: request.origin.city,
          state: request.origin.state,
          country: request.origin.country,
          pin_code: request.origin.postalCode,
        },
        billing_customer_name: request.destination.name,
        billing_last_name: request.destination.name.split(' ').pop() || '',
        billing_address: request.destination.address1,
        billing_address_2: request.destination.address2 || '',
        billing_city: request.destination.city,
        billing_pincode: request.destination.postalCode,
        billing_state: request.destination.state,
        billing_country: request.destination.country,
        billing_phone: request.destination.phone,
        billing_email: request.destination.email || 'customer@example.com',
        shipping_is_billing: true,
        order_items: request.items.map(item => ({
          name: item.name,
          sku: item.sku || item.id,
          units: item.quantity,
          selling_price: item.value,
          discount: 0,
          tax: 0,
          hsn: '0909', // Spices HSN code
        })),
        payment_method: 'Prepaid',
        sub_total: request.value,
        length: request.dimensions.length,
        breadth: request.dimensions.width,
        height: request.dimensions.height,
        weight: request.weight / 1000, // Convert to kg
        pickup_date: new Date().toISOString().split('T')[0],
        delivery_date: this.calculateDeliveryDate(request.method),
        priority: this.mapPriority(request.method),
        comment: request.instructions || 'Handle with care - Spices',
      };

      const response = await this.client.post('/orders/create/adhoc', shipmentData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const order = response.data;

      return {
        shipmentId: order.order_id.toString(),
        trackingNumber: order.awb_code || `SR${order.order_id}`,
        status: 'pending' as ShipmentStatus,
        provider: this.provider,
        method: request.method,
        cost: order.shipping_charges || 0,
        currency: request.currency,
        estimatedDelivery: this.calculateDeliveryDate(request.method),
        trackingUrl: `https://shiprocket.co/tracking/${order.awb_code}`,
        metadata: {
          shiprocketOrderId: order.order_id,
          awbCode: order.awb_code,
          channelId: order.channel_id,
          status: order.status,
          shippingCharges: order.shipping_charges,
          courierName: order.courier_name,
          courierId: order.courier_id,
        },
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new ShippingTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new ShippingProviderError(
        this.provider,
        error.response?.data?.message || error.message,
        error.response?.data
      );
    }
  }

  async getShipmentStatus(shipmentId: string): Promise<ShippingResponse> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await this.client.get(`/orders/show/${shipmentId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const order = response.data;

      return {
        shipmentId: order.order_id.toString(),
        trackingNumber: order.awb_code || `SR${order.order_id}`,
        status: this.mapShiprocketStatus(order.status),
        provider: this.provider,
        method: 'standard', // Default method
        cost: order.shipping_charges || 0,
        currency: 'INR',
        estimatedDelivery: order.delivery_date,
        trackingUrl: `https://shiprocket.co/tracking/${order.awb_code}`,
        metadata: {
          shiprocketOrderId: order.order_id,
          awbCode: order.awb_code,
          status: order.status,
          courierName: order.courier_name,
          trackingData: order.tracking_data,
        },
      };
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new ShippingTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new ShippingProviderError(
        this.provider,
        error.response?.data?.message || error.message,
        error.response?.data
      );
    }
  }

  async trackShipment(trackingNumber: string): Promise<ShippingUpdate[]> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const response = await this.client.get(`/courier/track/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const trackingData = response.data;

      return trackingData.tracking_data?.map((update: any) => ({
        shipmentId: trackingData.order_id?.toString() || '',
        trackingNumber,
        status: this.mapShiprocketStatus(update.status),
        location: update.location || '',
        timestamp: update.time || new Date().toISOString(),
        description: update.status || 'Status update',
        metadata: {
          courierName: trackingData.courier_name,
          awbCode: trackingData.awb_code,
          trackingData: update,
        },
      })) || [];
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new ShippingTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new ShippingProviderError(
        this.provider,
        error.response?.data?.message || error.message,
        error.response?.data
      );
    }
  }

  async cancelShipment(shipmentId: string, reason?: string): Promise<boolean> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      await this.client.post(`/orders/cancel/shipment/${shipmentId}`, {
        reason: reason || 'Customer requested cancellation',
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return true;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new ShippingTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new ShippingProviderError(
        this.provider,
        error.response?.data?.message || error.message,
        error.response?.data
      );
    }
  }

  async getShippingRates(request: Partial<ShippingRequest>): Promise<ShippingRate[]> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }

      const rateRequest = {
        pickup_pincode: request.origin?.postalCode || '110001',
        delivery_pincode: request.destination?.postalCode || '400001',
        weight: (request.weight || 1000) / 1000, // Convert to kg
        cod: 0, // Prepaid
      };

      const response = await this.client.post('/courier/serviceability/rates', rateRequest, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const rates = response.data;

      return rates.map((rate: any) => ({
        method: this.mapCourierToMethod(rate.courier_name),
        cost: rate.rate,
        currency: 'INR',
        estimatedDays: rate.estimated_delivery_days || 5,
        description: `${rate.courier_name} - ${rate.estimated_delivery_days} days`,
        isAvailable: rate.available,
      }));
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') {
        throw new ShippingTimeoutError(this.provider, this.config.settings.timeout);
      }
      
      throw new ShippingProviderError(
        this.provider,
        error.response?.data?.message || error.message,
        error.response?.data
      );
    }
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

  async processWebhook(payload: any): Promise<ShippingWebhook> {
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

  private async authenticate(): Promise<void> {
    try {
      const response = await this.client.post('/auth/login', {
        email: this.config.credentials.apiKey,
        password: this.config.credentials.apiSecret,
      });

      this.accessToken = response.data.token;
    } catch (error: any) {
      throw new ShippingProviderError(
        this.provider,
        'Authentication failed',
        error.response?.data
      );
    }
  }

  private mapShiprocketStatus(status: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      'NEW': 'pending',
      'PROCESSING': 'packed',
      'READY_TO_SHIP': 'packed',
      'SHIPPED': 'in_transit',
      'DELIVERED': 'delivered',
      'CANCELLED': 'failed',
      'RTO': 'returned',
    };

    return statusMap[status] || 'pending';
  }

  private mapPriority(method: string): string {
    const priorityMap: Record<string, string> = {
      'standard': 'Normal',
      'express': 'High',
      'overnight': 'Urgent',
      'economy': 'Low',
      'priority': 'High',
    };

    return priorityMap[method] || 'Normal';
  }

  private mapCourierToMethod(courierName: string): string {
    const courierMap: Record<string, string> = {
      'Blue Dart': 'express',
      'DTDC': 'standard',
      'Delhivery': 'standard',
      'Ecom Express': 'standard',
      'FedEx': 'express',
      'DHL': 'express',
    };

    return courierMap[courierName] || 'standard';
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
}

