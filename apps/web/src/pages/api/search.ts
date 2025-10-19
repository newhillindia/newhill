import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, SearchResult } from '@newhill/shared';

// Mock search data - in real app, this would come from a search service
const searchSuggestions = [
  'cardamom',
  'black pepper',
  'cinnamon',
  'turmeric',
  'cumin',
  'coriander',
  'cloves',
  'nutmeg',
  'star anise',
  'fennel seeds',
  'mustard seeds',
  'fenugreek',
  'garam masala',
  'chili powder',
  'ginger powder'
];

const categories = [
  { name: 'Whole Spices', count: 25 },
  { name: 'Ground Spices', count: 18 },
  { name: 'Spice Blends', count: 12 },
  { name: 'Organic Spices', count: 30 },
  { name: 'Premium Spices', count: 15 }
];

const certifications = [
  { name: 'FSSAI Certified', count: 45 },
  { name: 'Organic', count: 30 },
  { name: 'ISO Certified', count: 20 }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<SearchResult>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        status: 405,
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed'
      }
    });
  }

  try {
    const { query, filters, language = 'en', region = 'IN', currency = 'INR' } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          status: 400,
          code: 'VALIDATION_ERROR',
          message: 'Search query is required'
        }
      });
    }

    const searchTerm = query.toLowerCase().trim();
    
    // Mock search results - in real app, this would query a search index
    const mockProducts = [
      {
        id: '1',
        slug: 'premium-cardamom',
        name: { en: 'Premium Cardamom', hi: 'प्रीमियम इलायची', ar: 'هيل مميز' },
        description: { en: 'Aromatic green cardamom pods from the hills of Munnar', hi: 'मुन्नार की पहाड़ियों से सुगंधित हरी इलायची', ar: 'حبات هيل خضراء عطرة من تلال مونار' },
        shortDescription: { en: 'Fresh, aromatic cardamom pods', hi: 'ताजी, सुगंधित इलायची', ar: 'حبات هيل طازجة وعطرة' },
        price: 450,
        currency: 'INR',
        category: 'Whole Spices',
        subcategory: 'Cardamom',
        weight: 100,
        unit: 'g',
        inStock: true,
        stockQuantity: 50,
        images: ['/images/cardamom.jpg'],
        variants: [],
        lots: [],
        certifications: ['Organic', 'FSSAI'],
        tags: ['premium', 'organic', 'whole'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        slug: 'black-pepper',
        name: { en: 'Black Pepper', hi: 'काली मिर्च', ar: 'فلفل أسود' },
        description: { en: 'Premium black pepper corns with intense flavor', hi: 'तीव्र स्वाद के साथ प्रीमियम काली मिर्च', ar: 'حبات فلفل أسود مميزة بنكهة قوية' },
        shortDescription: { en: 'Intense black pepper corns', hi: 'तीव्र काली मिर्च', ar: 'حبات فلفل أسود قوية' },
        price: 320,
        currency: 'INR',
        category: 'Whole Spices',
        subcategory: 'Pepper',
        weight: 100,
        unit: 'g',
        inStock: true,
        stockQuantity: 75,
        images: ['/images/black-pepper.jpg'],
        variants: [],
        lots: [],
        certifications: ['Organic', 'FSSAI'],
        tags: ['premium', 'organic', 'whole'],
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }
    ];

    // Filter products based on search term
    const filteredProducts = mockProducts.filter(product => 
      product.name.en.toLowerCase().includes(searchTerm) ||
      product.description.en.toLowerCase().includes(searchTerm) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.subcategory?.toLowerCase().includes(searchTerm)
    );

    // Generate suggestions based on search term
    const suggestions = searchSuggestions
      .filter(suggestion => suggestion.toLowerCase().includes(searchTerm))
      .slice(0, 5);

    // Generate "did you mean" suggestions for typos
    const didYouMean = searchSuggestions
      .filter(suggestion => {
        const similarity = calculateSimilarity(searchTerm, suggestion.toLowerCase());
        return similarity > 0.6 && similarity < 1;
      })
      .slice(0, 3);

    // Apply filters if provided
    let finalProducts = filteredProducts;
    if (filters) {
      if (filters.category) {
        finalProducts = finalProducts.filter(product => 
          product.category.toLowerCase() === filters.category.toLowerCase()
        );
      }
      if (filters.inStock !== undefined) {
        finalProducts = finalProducts.filter(product => product.inStock === filters.inStock);
      }
      if (filters.priceMin !== undefined) {
        finalProducts = finalProducts.filter(product => product.price >= filters.priceMin);
      }
      if (filters.priceMax !== undefined) {
        finalProducts = finalProducts.filter(product => product.price <= filters.priceMax);
      }
    }

    const searchResult: SearchResult = {
      products: finalProducts,
      suggestions,
      didYouMean: didYouMean.length > 0 ? didYouMean : undefined,
      filters: {
        categories,
        priceRange: { min: 100, max: 1000 },
        certifications
      }
    };

    res.status(200).json({
      success: true,
      data: searchResult,
      meta: {
        traceId: `search-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to perform search'
      }
    });
  }
}

// Simple similarity calculation for "did you mean" suggestions
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

