import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SUPPORTED_CURRENCIES = {
  INR: { symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  QAR: { symbol: 'ر.ق', name: 'Qatari Riyal', decimals: 2 },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  SAR: { symbol: 'ر.س', name: 'Saudi Riyal', decimals: 2 },
  OMR: { symbol: 'ر.ع.', name: 'Omani Rial', decimals: 3 },
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

export interface CurrencyRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: Date;
}

export interface PriceInfo {
  currency: SupportedCurrency;
  amount: number;
  formatted: string;
  symbol: string;
}

/**
 * Get current exchange rate between two currencies
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return 1;

  try {
    const rate = await prisma.currencyRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency,
          toCurrency,
        },
      },
    });

    if (rate) {
      return Number(rate.rate);
    }

    // If direct rate not found, try reverse rate
    const reverseRate = await prisma.currencyRate.findUnique({
      where: {
        fromCurrency_toCurrency: {
          fromCurrency: toCurrency,
          toCurrency: fromCurrency,
        },
      },
    });

    if (reverseRate) {
      return 1 / Number(reverseRate.rate);
    }

    // Fallback to 1 if no rate found
    console.warn(`No exchange rate found for ${fromCurrency} to ${toCurrency}`);
    return 1;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1;
  }
}

/**
 * Convert price from one currency to another
 */
export async function convertPrice(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) return amount;

  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

/**
 * Get or create currency price for a product variant
 */
export async function getCurrencyPrice(
  variantId: string,
  currency: SupportedCurrency
): Promise<PriceInfo> {
  try {
    // First try to get cached price
    const cachedPrice = await prisma.currencyPrice.findUnique({
      where: {
        variantId_currency: {
          variantId,
          currency,
        },
      },
    });

    if (cachedPrice && isPriceFresh(cachedPrice.lastUpdated)) {
      return formatPrice(Number(cachedPrice.price), currency);
    }

    // Get variant with base price
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new Error('Variant not found');
    }

    // Convert from base INR price
    const convertedPrice = await convertPrice(
      Number(variant.basePriceINR),
      'INR',
      currency
    );

    // Cache the converted price
    await prisma.currencyPrice.upsert({
      where: {
        variantId_currency: {
          variantId,
          currency,
        },
      },
      update: {
        price: convertedPrice,
        lastUpdated: new Date(),
      },
      create: {
        variantId,
        currency,
        price: convertedPrice,
        lastUpdated: new Date(),
      },
    });

    return formatPrice(convertedPrice, currency);
  } catch (error) {
    console.error('Error getting currency price:', error);
    // Fallback to base price if conversion fails
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    return formatPrice(Number(variant?.basePriceINR || 0), currency);
  }
}

/**
 * Get prices for multiple variants in a specific currency
 */
export async function getBulkCurrencyPrices(
  variantIds: string[],
  currency: SupportedCurrency
): Promise<Record<string, PriceInfo>> {
  const prices: Record<string, PriceInfo> = {};

  // Get all cached prices
  const cachedPrices = await prisma.currencyPrice.findMany({
    where: {
      variantId: { in: variantIds },
      currency,
    },
  });

  const freshPrices = cachedPrices.filter(price => isPriceFresh(price.lastUpdated));
  const stalePrices = cachedPrices.filter(price => !isPriceFresh(price.lastUpdated));

  // Use fresh cached prices
  for (const price of freshPrices) {
    prices[price.variantId] = formatPrice(Number(price.price), currency);
  }

  // Convert stale prices
  const variantsToConvert = await prisma.productVariant.findMany({
    where: {
      id: { in: stalePrices.map(p => p.variantId) },
    },
  });

  for (const variant of variantsToConvert) {
    const convertedPrice = await convertPrice(
      Number(variant.basePriceINR),
      'INR',
      currency
    );

    // Update cache
    await prisma.currencyPrice.upsert({
      where: {
        variantId_currency: {
          variantId: variant.id,
          currency,
        },
      },
      update: {
        price: convertedPrice,
        lastUpdated: new Date(),
      },
      create: {
        variantId: variant.id,
        currency,
        price: convertedPrice,
        lastUpdated: new Date(),
      },
    });

    prices[variant.id] = formatPrice(convertedPrice, currency);
  }

  // Convert missing prices
  const missingVariantIds = variantIds.filter(id => !prices[id]);
  const missingVariants = await prisma.productVariant.findMany({
    where: {
      id: { in: missingVariantIds },
    },
  });

  for (const variant of missingVariants) {
    const convertedPrice = await convertPrice(
      Number(variant.basePriceINR),
      'INR',
      currency
    );

    // Cache the converted price
    await prisma.currencyPrice.upsert({
      where: {
        variantId_currency: {
          variantId: variant.id,
          currency,
        },
      },
      update: {
        price: convertedPrice,
        lastUpdated: new Date(),
      },
      create: {
        variantId: variant.id,
        currency,
        price: convertedPrice,
        lastUpdated: new Date(),
      },
    });

    prices[variant.id] = formatPrice(convertedPrice, currency);
  }

  return prices;
}

/**
 * Format price with currency symbol and proper decimals
 */
export function formatPrice(amount: number, currency: SupportedCurrency): PriceInfo {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyInfo.decimals,
    maximumFractionDigits: currencyInfo.decimals,
  }).format(amount);

  return {
    currency,
    amount,
    formatted,
    symbol: currencyInfo.symbol,
  };
}

/**
 * Check if cached price is still fresh (less than 1 hour old)
 */
function isPriceFresh(lastUpdated: Date): boolean {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  return lastUpdated > oneHourAgo;
}

/**
 * Update exchange rates from external API
 */
export async function updateExchangeRates(): Promise<void> {
  try {
    // In production, integrate with real exchange rate API
    // For now, using mock rates
    const mockRates = [
      { from: 'INR', to: 'QAR', rate: 0.045 },
      { from: 'INR', to: 'AED', rate: 0.044 },
      { from: 'INR', to: 'SAR', rate: 0.045 },
      { from: 'INR', to: 'OMR', rate: 0.0045 },
      { from: 'QAR', to: 'INR', rate: 22.22 },
      { from: 'AED', to: 'INR', rate: 22.73 },
      { from: 'SAR', to: 'INR', rate: 22.22 },
      { from: 'OMR', to: 'INR', rate: 222.22 },
    ];

    for (const rate of mockRates) {
      await prisma.currencyRate.upsert({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: rate.from,
            toCurrency: rate.to,
          },
        },
        update: {
          rate: rate.rate,
          lastUpdated: new Date(),
        },
        create: {
          fromCurrency: rate.from,
          toCurrency: rate.to,
          rate: rate.rate,
          lastUpdated: new Date(),
        },
      });
    }

    console.log('Exchange rates updated successfully');
  } catch (error) {
    console.error('Error updating exchange rates:', error);
    throw error;
  }
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): Array<{
  code: SupportedCurrency;
  name: string;
  symbol: string;
}> {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => ({
    code: code as SupportedCurrency,
    name: info.name,
    symbol: info.symbol,
  }));
}
