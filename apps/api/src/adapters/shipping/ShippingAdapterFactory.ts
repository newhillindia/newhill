import {
  ShippingConnector,
  ShippingConfig,
  ShippingProvider,
  REGION_CONFIGS,
} from '@newhill/shared/types/shipping';
import { ShiprocketAdapter } from './ShiprocketAdapter';
import { GCCLogisticsAdapter } from './GCCLogisticsAdapter';

export class ShippingAdapterFactory {
  private static adapters: Map<string, ShippingConnector> = new Map();

  static createAdapter(region: string, config: ShippingConfig): ShippingConnector {
    const cacheKey = `${region}_${config.provider}_${config.mode}`;
    
    if (this.adapters.has(cacheKey)) {
      return this.adapters.get(cacheKey)!;
    }

    const regionConfig = REGION_CONFIGS[region];
    if (!regionConfig) {
      throw new Error(`Unsupported region: ${region}`);
    }

    let adapter: ShippingConnector;

    switch (config.provider) {
      case 'shiprocket':
        adapter = new ShiprocketAdapter(config);
        break;
      case 'gcc_logistics':
        adapter = new GCCLogisticsAdapter(config);
        break;
      default:
        throw new Error(`Unsupported shipping provider: ${config.provider}`);
    }

    this.adapters.set(cacheKey, adapter);
    return adapter;
  }

  static getAdapter(region: string, mode: 'sandbox' | 'live' = 'sandbox'): ShippingConnector {
    const regionConfig = REGION_CONFIGS[region];
    if (!regionConfig) {
      throw new Error(`Unsupported region: ${region}`);
    }

    const config: ShippingConfig = {
      provider: regionConfig.shippingProvider as ShippingProvider,
      region: regionConfig.code,
      mode,
      credentials: this.getCredentials(regionConfig.shippingProvider as ShippingProvider, mode),
      settings: {
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
        maxWeight: 50000, // 50kg in grams
        maxDimensions: {
          length: 120, // cm
          width: 80, // cm
          height: 60, // cm
        },
      },
    };

    return this.createAdapter(region, config);
  }

  static getSupportedRegions(): string[] {
    return Object.keys(REGION_CONFIGS).filter(region => REGION_CONFIGS[region].isActive);
  }

  static getSupportedProviders(): ShippingProvider[] {
    return Array.from(new Set(Object.values(REGION_CONFIGS).map(config => config.shippingProvider as ShippingProvider)));
  }

  private static getCredentials(provider: ShippingProvider, mode: 'sandbox' | 'live'): {
    apiKey: string;
    apiSecret: string;
    webhookSecret: string;
  } {
    const envPrefix = mode === 'live' ? '' : 'SANDBOX_';
    
    switch (provider) {
      case 'shiprocket':
        return {
          apiKey: process.env[`${envPrefix}SHIPROCKET_EMAIL`] || 'test@newhillspices.com',
          apiSecret: process.env[`${envPrefix}SHIPROCKET_PASSWORD`] || 'test_password',
          webhookSecret: process.env[`${envPrefix}SHIPROCKET_WEBHOOK_SECRET`] || 'shiprocket_test_webhook_secret',
        };
      case 'gcc_logistics':
        return {
          apiKey: process.env[`${envPrefix}GCC_LOGISTICS_API_KEY`] || 'gcc_test_api_key',
          apiSecret: process.env[`${envPrefix}GCC_LOGISTICS_API_SECRET`] || 'gcc_test_api_secret',
          webhookSecret: process.env[`${envPrefix}GCC_LOGISTICS_WEBHOOK_SECRET`] || 'gcc_test_webhook_secret',
        };
      default:
        throw new Error(`Unknown shipping provider: ${provider}`);
    }
  }

  static clearCache(): void {
    this.adapters.clear();
  }
}

