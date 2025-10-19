import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', rtl: false },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', rtl: false },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export interface TranslationData {
  key: string;
  language: SupportedLanguage;
  value: string;
}

export interface ProductTranslation {
  productId: string;
  language: SupportedLanguage;
  name: string;
  description?: string;
}

/**
 * Get translation for a specific key and language
 */
export async function getTranslation(
  key: string,
  language: SupportedLanguage = 'en'
): Promise<string> {
  try {
    const translation = await prisma.translationKey.findUnique({
      where: {
        key_language: {
          key,
          language,
        },
      },
    });

    if (translation) {
      return translation.value;
    }

    // Fallback to English if translation not found
    if (language !== 'en') {
      const englishTranslation = await prisma.translationKey.findUnique({
        where: {
          key_language: {
            key,
            language: 'en',
          },
        },
      });

      if (englishTranslation) {
        return englishTranslation.value;
      }
    }

    // Return key if no translation found
    return key;
  } catch (error) {
    console.error('Error getting translation:', error);
    return key;
  }
}

/**
 * Get multiple translations at once
 */
export async function getTranslations(
  keys: string[],
  language: SupportedLanguage = 'en'
): Promise<Record<string, string>> {
  try {
    const translations = await prisma.translationKey.findMany({
      where: {
        key: { in: keys },
        language,
      },
    });

    const result: Record<string, string> = {};
    
    for (const key of keys) {
      const translation = translations.find(t => t.key === key);
      if (translation) {
        result[key] = translation.value;
      } else {
        // Fallback to English
        const englishTranslation = await prisma.translationKey.findUnique({
          where: {
            key_language: {
              key,
              language: 'en',
            },
          },
        });
        result[key] = englishTranslation?.value || key;
      }
    }

    return result;
  } catch (error) {
    console.error('Error getting translations:', error);
    return keys.reduce((acc, key) => ({ ...acc, [key]: key }), {});
  }
}

/**
 * Get product translation
 */
export async function getProductTranslation(
  productId: string,
  language: SupportedLanguage = 'en'
): Promise<{ name: string; description?: string } | null> {
  try {
    const translation = await prisma.productTranslation.findUnique({
      where: {
        productId_language: {
          productId,
          language,
        },
      },
    });

    if (translation) {
      return {
        name: translation.name,
        description: translation.description || undefined,
      };
    }

    // Fallback to English
    if (language !== 'en') {
      const englishTranslation = await prisma.productTranslation.findUnique({
        where: {
          productId_language: {
            productId,
            language: 'en',
          },
        },
      });

      if (englishTranslation) {
        return {
          name: englishTranslation.name,
          description: englishTranslation.description || undefined,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting product translation:', error);
    return null;
  }
}

/**
 * Get product with translations
 */
export async function getProductWithTranslations(
  productId: string,
  language: SupportedLanguage = 'en'
): Promise<any> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            currencyPrices: true,
          },
        },
        translations: {
          where: { language },
        },
      },
    });

    if (!product) {
      return null;
    }

    // If no translation found, try English fallback
    let translation = product.translations[0];
    if (!translation && language !== 'en') {
      const englishTranslation = await prisma.productTranslation.findUnique({
        where: {
          productId_language: {
            productId,
            language: 'en',
          },
        },
      });
      translation = englishTranslation;
    }

    return {
      ...product,
      translatedName: translation?.name || product.name,
      translatedDescription: translation?.description || product.description,
    };
  } catch (error) {
    console.error('Error getting product with translations:', error);
    return null;
  }
}

/**
 * Get all products with translations
 */
export async function getProductsWithTranslations(
  language: SupportedLanguage = 'en',
  category?: string,
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        softDeleted: false,
        ...(category && { category }),
      },
      include: {
        variants: {
          where: { status: 'ACTIVE' },
          include: {
            currencyPrices: true,
          },
        },
        translations: {
          where: { language },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    // Process translations
    const productsWithTranslations = await Promise.all(
      products.map(async (product) => {
        let translation = product.translations[0];
        
        // Fallback to English if no translation found
        if (!translation && language !== 'en') {
          const englishTranslation = await prisma.productTranslation.findUnique({
            where: {
              productId_language: {
                productId: product.id,
                language: 'en',
              },
            },
          });
          translation = englishTranslation;
        }

        return {
          ...product,
          translatedName: translation?.name || product.name,
          translatedDescription: translation?.description || product.description,
        };
      })
    );

    return productsWithTranslations;
  } catch (error) {
    console.error('Error getting products with translations:', error);
    return [];
  }
}

/**
 * Create or update translation
 */
export async function setTranslation(
  key: string,
  language: SupportedLanguage,
  value: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.translationKey.upsert({
      where: {
        key_language: {
          key,
          language,
        },
      },
      update: { value },
      create: {
        key,
        language,
        value,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting translation:', error);
    return { success: false, message: 'Error setting translation' };
  }
}

/**
 * Create or update product translation
 */
export async function setProductTranslation(
  productId: string,
  language: SupportedLanguage,
  name: string,
  description?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    await prisma.productTranslation.upsert({
      where: {
        productId_language: {
          productId,
          language,
        },
      },
      update: {
        name,
        description,
      },
      create: {
        productId,
        language,
        name,
        description,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error setting product translation:', error);
    return { success: false, message: 'Error setting product translation' };
  }
}

/**
 * Get all translations for a language
 */
export async function getAllTranslations(
  language: SupportedLanguage = 'en'
): Promise<Record<string, string>> {
  try {
    const translations = await prisma.translationKey.findMany({
      where: { language },
    });

    return translations.reduce((acc, translation) => {
      acc[translation.key] = translation.value;
      return acc;
    }, {} as Record<string, string>);
  } catch (error) {
    console.error('Error getting all translations:', error);
    return {};
  }
}

/**
 * Bulk create translations
 */
export async function bulkCreateTranslations(
  translations: TranslationData[]
): Promise<{ success: boolean; message?: string; count?: number }> {
  try {
    const result = await prisma.translationKey.createMany({
      data: translations.map(t => ({
        key: t.key,
        language: t.language,
        value: t.value,
      })),
      skipDuplicates: true,
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error bulk creating translations:', error);
    return { success: false, message: 'Error creating translations' };
  }
}

/**
 * Get supported languages
 */
export function getSupportedLanguages(): Array<{
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  rtl: boolean;
}> {
  return Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code: code as SupportedLanguage,
    ...info,
  }));
}

/**
 * Check if language is RTL
 */
export function isRTLLanguage(language: SupportedLanguage): boolean {
  return SUPPORTED_LANGUAGES[language].rtl;
}

/**
 * Get language direction
 */
export function getLanguageDirection(language: SupportedLanguage): 'ltr' | 'rtl' {
  return isRTLLanguage(language) ? 'rtl' : 'ltr';
}
