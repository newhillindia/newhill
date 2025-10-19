import {
  PaymentAdapter,
  PaymentConfig,
  PaymentProvider,
  REGION_CONFIGS,
} from '@newhill/shared/types/payment';
import { RazorpayAdapter } from './RazorpayAdapter';
import { DibsyAdapter } from './DibsyAdapter';
import { TelrAdapter } from './TelrAdapter';
import { MoyasarAdapter } from './MoyasarAdapter';
import { OmanNetAdapter } from './OmanNetAdapter';

export class PaymentAdapterFactory {
  private static adapters: Map<string, PaymentAdapter> = new Map();

  static createAdapter(region: string, config: PaymentConfig): PaymentAdapter {
    const cacheKey = `${region}_${config.provider}_${config.mode}`;
    
    if (this.adapters.has(cacheKey)) {
      return this.adapters.get(cacheKey)!;
    }

    const regionConfig = REGION_CONFIGS[region];
    if (!regionConfig) {
      throw new Error(`Unsupported region: ${region}`);
    }

    let adapter: PaymentAdapter;

    switch (config.provider) {
      case 'razorpay':
        adapter = new RazorpayAdapter(config);
        break;
      case 'dibsy':
        adapter = new DibsyAdapter(config);
        break;
      case 'telr':
        adapter = new TelrAdapter(config);
        break;
      case 'moyasar':
        adapter = new MoyasarAdapter(config);
        break;
      case 'oman_net':
        adapter = new OmanNetAdapter(config);
        break;
      default:
        throw new Error(`Unsupported payment provider: ${config.provider}`);
    }

    this.adapters.set(cacheKey, adapter);
    return adapter;
  }

  static getAdapter(region: string, mode: 'sandbox' | 'live' = 'sandbox'): PaymentAdapter {
    const regionConfig = REGION_CONFIGS[region];
    if (!regionConfig) {
      throw new Error(`Unsupported region: ${region}`);
    }

    const config: PaymentConfig = {
      provider: regionConfig.paymentProvider,
      region: regionConfig.code,
      mode,
      credentials: this.getCredentials(regionConfig.paymentProvider, mode),
      settings: {
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
      },
    };

    return this.createAdapter(region, config);
  }

  static getSupportedRegions(): string[] {
    return Object.keys(REGION_CONFIGS).filter(region => REGION_CONFIGS[region].isActive);
  }

  static getSupportedProviders(): PaymentProvider[] {
    return Array.from(new Set(Object.values(REGION_CONFIGS).map(config => config.paymentProvider)));
  }

  private static getCredentials(provider: PaymentProvider, mode: 'sandbox' | 'live'): {
    keyId: string;
    keySecret: string;
    webhookSecret: string;
  } {
    const envPrefix = mode === 'live' ? '' : 'SANDBOX_';
    
    switch (provider) {
      case 'razorpay':
        return {
          keyId: process.env[`${envPrefix}RAZORPAY_KEY_ID`] || 'rzp_test_key',
          keySecret: process.env[`${envPrefix}RAZORPAY_KEY_SECRET`] || 'rzp_test_secret',
          webhookSecret: process.env[`${envPrefix}RAZORPAY_WEBHOOK_SECRET`] || 'rzp_test_webhook_secret',
        };
      case 'dibsy':
        return {
          keyId: process.env[`${envPrefix}DIBSY_KEY_ID`] || 'dibsy_test_key',
          keySecret: process.env[`${envPrefix}DIBSY_KEY_SECRET`] || 'dibsy_test_secret',
          webhookSecret: process.env[`${envPrefix}DIBSY_WEBHOOK_SECRET`] || 'dibsy_test_webhook_secret',
        };
      case 'telr':
        return {
          keyId: process.env[`${envPrefix}TELR_KEY_ID`] || 'telr_test_key',
          keySecret: process.env[`${envPrefix}TELR_KEY_SECRET`] || 'telr_test_secret',
          webhookSecret: process.env[`${envPrefix}TELR_WEBHOOK_SECRET`] || 'telr_test_webhook_secret',
        };
      case 'moyasar':
        return {
          keyId: process.env[`${envPrefix}MOYASAR_KEY_ID`] || 'moyasar_test_key',
          keySecret: process.env[`${envPrefix}MOYASAR_KEY_SECRET`] || 'moyasar_test_secret',
          webhookSecret: process.env[`${envPrefix}MOYASAR_WEBHOOK_SECRET`] || 'moyasar_test_webhook_secret',
        };
      case 'oman_net':
        return {
          keyId: process.env[`${envPrefix}OMAN_NET_KEY_ID`] || 'oman_net_test_key',
          keySecret: process.env[`${envPrefix}OMAN_NET_KEY_SECRET`] || 'oman_net_test_secret',
          webhookSecret: process.env[`${envPrefix}OMAN_NET_WEBHOOK_SECRET`] || 'oman_net_test_webhook_secret',
        };
      default:
        throw new Error(`Unknown payment provider: ${provider}`);
    }
  }

  static clearCache(): void {
    this.adapters.clear();
  }
}

