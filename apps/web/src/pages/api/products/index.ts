import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, Product, PaginatedResponse } from '@newhill/shared';

// Mock product data - in real app, this would come from database
const mockProducts: Product[] = [
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
  },
  {
    id: '3',
    slug: 'cinnamon-sticks',
    name: { en: 'Cinnamon Sticks', hi: 'दालचीनी', ar: 'عصي القرفة' },
    description: { en: 'Sweet and aromatic cinnamon sticks from Kerala', hi: 'केरल से मीठी और सुगंधित दालचीनी', ar: 'عصي قرفة حلوة وعطرة من كيرالا' },
    shortDescription: { en: 'Sweet cinnamon sticks', hi: 'मीठी दालचीनी', ar: 'عصي قرفة حلوة' },
    price: 280,
    currency: 'INR',
    category: 'Whole Spices',
    subcategory: 'Cinnamon',
    weight: 100,
    unit: 'g',
    inStock: true,
    stockQuantity: 40,
    images: ['/images/cinnamon.jpg'],
    variants: [],
    lots: [],
    certifications: ['Organic', 'FSSAI'],
    tags: ['premium', 'organic', 'whole'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    slug: 'turmeric-powder',
    name: { en: 'Turmeric Powder', hi: 'हल्दी पाउडर', ar: 'مسحوق الكركم' },
    description: { en: 'Pure turmeric powder with vibrant color and health benefits', hi: 'शुद्ध हल्दी पाउडर जीवंत रंग और स्वास्थ्य लाभ के साथ', ar: 'مسحوق كركم نقي بلون نابض بالحياة وفوائد صحية' },
    shortDescription: { en: 'Pure turmeric powder', hi: 'शुद्ध हल्दी पाउडर', ar: 'مسحوق كركم نقي' },
    price: 180,
    currency: 'INR',
    category: 'Ground Spices',
    subcategory: 'Turmeric',
    weight: 100,
    unit: 'g',
    inStock: true,
    stockQuantity: 60,
    images: ['/images/turmeric.jpg'],
    variants: [],
    lots: [],
    certifications: ['Organic', 'FSSAI'],
    tags: ['premium', 'organic', 'ground'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    slug: 'cumin-seeds',
    name: { en: 'Cumin Seeds', hi: 'जीरा', ar: 'بذور الكمون' },
    description: { en: 'Aromatic cumin seeds perfect for Indian cooking', hi: 'भारतीय खाना पकाने के लिए सुगंधित जीरा', ar: 'بذور كمون عطرة مثالية للطبخ الهندي' },
    shortDescription: { en: 'Aromatic cumin seeds', hi: 'सुगंधित जीरा', ar: 'بذور كمون عطرة' },
    price: 220,
    currency: 'INR',
    category: 'Whole Spices',
    subcategory: 'Cumin',
    weight: 100,
    unit: 'g',
    inStock: true,
    stockQuantity: 80,
    images: ['/images/cumin.jpg'],
    variants: [],
    lots: [],
    certifications: ['Organic', 'FSSAI'],
    tags: ['premium', 'organic', 'whole'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '6',
    slug: 'coriander-powder',
    name: { en: 'Coriander Powder', hi: 'धनिया पाउडर', ar: 'مسحوق الكزبرة' },
    description: { en: 'Freshly ground coriander powder with mild flavor', hi: 'हल्के स्वाद के साथ ताजा पिसा धनिया पाउडर', ar: 'مسحوق كزبرة مطحون طازج بنكهة خفيفة' },
    shortDescription: { en: 'Freshly ground coriander', hi: 'ताजा पिसा धनिया', ar: 'كزبرة مطحونة طازجة' },
    price: 150,
    currency: 'INR',
    category: 'Ground Spices',
    subcategory: 'Coriander',
    weight: 100,
    unit: 'g',
    inStock: true,
    stockQuantity: 45,
    images: ['/images/coriander.jpg'],
    variants: [],
    lots: [],
    certifications: ['Organic', 'FSSAI'],
    tags: ['premium', 'organic', 'ground'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaginatedResponse<Product>>>
) {
  if (req.method !== 'GET') {
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
    const {
      page = '1',
      limit = '20',
      category,
      subcategory,
      search,
      inStock,
      sortBy = 'createdAt',
      order = 'desc',
      ids
    } = req.query;

    let filteredProducts = [...mockProducts];

    // Filter by IDs if provided
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : ids.split(',');
      filteredProducts = filteredProducts.filter(product => idArray.includes(product.id));
    }

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    // Filter by subcategory
    if (subcategory) {
      filteredProducts = filteredProducts.filter(product => 
        product.subcategory?.toLowerCase() === (subcategory as string).toLowerCase()
      );
    }

    // Search filter
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.en.toLowerCase().includes(searchTerm) ||
        product.description.en.toLowerCase().includes(searchTerm) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by stock status
    if (inStock !== undefined) {
      const inStockFilter = inStock === 'true';
      filteredProducts = filteredProducts.filter(product => product.inStock === inStockFilter);
    }

    // Sort products
    filteredProducts.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.en;
          bValue = b.name.en;
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'popularity':
          // Mock popularity based on stock quantity
          aValue = a.stockQuantity;
          bValue = b.stockQuantity;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    const total = filteredProducts.length;
    const pages = Math.ceil(total / limitNum);

    const paginatedProducts = filteredProducts.slice(offset, offset + limitNum);

    const response: PaginatedResponse<Product> = {
      items: paginatedProducts,
      pagination: {
        total,
        limit: limitNum,
        offset,
        page: pageNum,
        pages,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1
      }
    };

    res.status(200).json({
      success: true,
      data: response,
      meta: {
        traceId: `products-${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    res.status(500).json({
      success: false,
      error: {
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch products'
      }
    });
  }
}