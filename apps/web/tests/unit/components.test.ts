import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useLocalization } from '@/lib/localization';
import { useFeatureFlags } from '@/lib/featureFlags';
import RegionSelector from '@/components/ui/RegionSelector';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { formatCurrency, convertCurrency } from '@/lib/localization';

// Mock Next.js modules
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    pathname: '/',
    query: {},
  }),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
}));

describe('Localization', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(100, 'INR')).toBe('₹ 100.00');
    expect(formatCurrency(100, 'AED')).toBe('د.إ 100.00');
    expect(formatCurrency(100, 'SAR')).toBe('ر.س 100.00');
  });

  it('should convert currency correctly', () => {
    expect(convertCurrency(100, 'INR', 'AED')).toBeCloseTo(4.4, 1);
    expect(convertCurrency(100, 'AED', 'INR')).toBeCloseTo(2270, 0);
  });

  it('should detect region from IP', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ country_code: 'AE' }),
      })
    ) as any;

    const { detectRegion } = useLocalization();
    const region = await detectRegion();
    expect(region).toBe('AE');
  });
});

describe('RegionSelector', () => {
  it('should render region selector', () => {
    render(<RegionSelector />);
    expect(screen.getByText('Region & Currency')).toBeInTheDocument();
  });

  it('should change region when selected', async () => {
    render(<RegionSelector />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('United Arab Emirates')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('United Arab Emirates'));
    
    await waitFor(() => {
      expect(screen.getByText('United Arab Emirates')).toBeInTheDocument();
    });
  });
});

describe('OptimizedImage', () => {
  it('should render image with proper alt text', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );
    
    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('should show loading skeleton initially', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={300}
        height={200}
      />
    );
    
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('should handle image load error', async () => {
    render(
      <OptimizedImage
        src="/invalid-image.jpg"
        alt="Test image"
        width={300}
        height={200}
        fallbackSrc="/fallback.jpg"
      />
    );
    
    const image = screen.getByAltText('Test image');
    fireEvent.error(image);
    
    await waitFor(() => {
      expect(screen.getByText('Image unavailable')).toBeInTheDocument();
    });
  });
});

describe('Feature Flags', () => {
  it('should check if feature is enabled', () => {
    const { isEnabled } = useFeatureFlags();
    
    // Mock feature flags
    vi.mocked(useFeatureFlags).mockReturnValue({
      flags: {
        'new-feature': {
          id: '1',
          name: 'new-feature',
          description: 'A new feature',
          enabled: true,
          type: 'boolean',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      isLoading: false,
      isEnabled: vi.fn((flag) => flag === 'new-feature'),
      getValue: vi.fn(),
      refreshFlags: vi.fn(),
    });
    
    expect(isEnabled('new-feature')).toBe(true);
    expect(isEnabled('disabled-feature')).toBe(false);
  });

  it('should get feature flag value', () => {
    const { getValue } = useFeatureFlags();
    
    vi.mocked(useFeatureFlags).mockReturnValue({
      flags: {
        'feature-with-value': {
          id: '2',
          name: 'feature-with-value',
          description: 'A feature with value',
          enabled: true,
          type: 'boolean',
          value: 'test-value',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      },
      isLoading: false,
      isEnabled: vi.fn(() => true),
      getValue: vi.fn((flag) => flag === 'feature-with-value' ? 'test-value' : null),
      refreshFlags: vi.fn(),
    });
    
    expect(getValue('feature-with-value')).toBe('test-value');
    expect(getValue('non-existent-feature')).toBe(null);
  });
});

describe('Security', () => {
  it('should validate email format', () => {
    const { InputValidator } = require('@/lib/security');
    
    expect(InputValidator.validateEmail('test@example.com')).toBe(true);
    expect(InputValidator.validateEmail('invalid-email')).toBe(false);
    expect(InputValidator.validateEmail('')).toBe(false);
  });

  it('should validate phone format', () => {
    const { InputValidator } = require('@/lib/security');
    
    expect(InputValidator.validatePhone('+1234567890')).toBe(true);
    expect(InputValidator.validatePhone('1234567890')).toBe(true);
    expect(InputValidator.validatePhone('invalid-phone')).toBe(false);
  });

  it('should validate password strength', () => {
    const { InputValidator } = require('@/lib/security');
    
    const strongPassword = 'Password123!';
    const weakPassword = 'password';
    
    expect(InputValidator.validatePassword(strongPassword).valid).toBe(true);
    expect(InputValidator.validatePassword(weakPassword).valid).toBe(false);
  });

  it('should sanitize input strings', () => {
    const { InputValidator } = require('@/lib/security');
    
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = InputValidator.sanitizeString(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('alert');
  });
});

describe('SEO', () => {
  it('should generate proper metadata', () => {
    const { generateMetadata } = require('@/lib/seo');
    
    const metadata = generateMetadata({
      title: 'Test Page',
      description: 'Test description',
      url: '/test',
    });
    
    expect(metadata.title).toBe('Test Page | Newhill Spices');
    expect(metadata.description).toBe('Test description');
    expect(metadata.openGraph?.title).toBe('Test Page | Newhill Spices');
  });

  it('should generate organization schema', () => {
    const { generateOrganizationSchema } = require('@/lib/seo');
    
    const schema = generateOrganizationSchema();
    
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('Newhill Spices');
    expect(schema.url).toBe('https://newhillspices.com');
  });

  it('should generate product schema', () => {
    const { generateProductSchema } = require('@/lib/seo');
    
    const product = {
      name: { en: 'Cardamom' },
      description: { en: 'Premium cardamom' },
      price: 100,
      currency: 'INR',
      images: ['/cardamom.jpg'],
      category: 'Spices',
      sku: 'CARD001',
      stock: 10,
    };
    
    const schema = generateProductSchema(product);
    
    expect(schema['@type']).toBe('Product');
    expect(schema.name).toBe('Cardamom');
    expect(schema.offers.price).toBe(100);
    expect(schema.offers.priceCurrency).toBe('INR');
  });
});

describe('Performance', () => {
  it('should record performance metrics', () => {
    const { PerformanceMonitor } = require('@/lib/observability');
    
    PerformanceMonitor.recordMetric('page-load', 1000);
    PerformanceMonitor.recordMetric('page-load', 1500);
    PerformanceMonitor.recordMetric('page-load', 800);
    
    const stats = PerformanceMonitor.getMetricStats('page-load');
    
    expect(stats?.count).toBe(3);
    expect(stats?.min).toBe(800);
    expect(stats?.max).toBe(1500);
    expect(stats?.avg).toBe(1100);
  });

  it('should handle retry mechanism', async () => {
    const { RetryManager } = require('@/lib/observability');
    
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    };
    
    const result = await RetryManager.executeWithRetry(operation, 3, 100);
    
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });
});

describe('Error Handling', () => {
  it('should handle API errors gracefully', () => {
    const { APIError } = require('@/lib/observability');
    
    const error = new APIError('Not found', 404);
    
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
    expect(error.message).toBe('Not found');
  });

  it('should log errors properly', async () => {
    const { Logger } = require('@/lib/observability');
    
    const logger = Logger.getInstance();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    await logger.error('Test error', new Error('Test error message'));
    
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});

