import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Mock product data
const products = [
  {
    id: 1,
    name: 'Premium Cinnamon',
    description: 'High-quality cinnamon sticks from Sri Lanka',
    price: 12.99,
    category: 'Spices',
    inStock: true,
    imageUrl: '/images/cinnamon.jpg',
  },
  {
    id: 2,
    name: 'Organic Turmeric',
    description: 'Pure organic turmeric powder',
    price: 8.99,
    category: 'Spices',
    inStock: true,
    imageUrl: '/images/turmeric.jpg',
  },
  {
    id: 3,
    name: 'Black Pepper',
    description: 'Freshly ground black pepper',
    price: 6.99,
    category: 'Spices',
    inStock: true,
    imageUrl: '/images/black-pepper.jpg',
  },
];

router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    
    let filteredProducts = [...products];
    
    if (category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === (category as string).toLowerCase()
      );
    }
    
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProducts = filteredProducts.filter(
        product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    logger.info('Products fetched', { 
      count: paginatedProducts.length,
      category,
      search,
      page,
      limit 
    });
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredProducts.length,
          pages: Math.ceil(filteredProducts.length / Number(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching products', { error });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch products' },
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = products.find(p => p.id === Number(id));
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' },
      });
    }
    
    logger.info('Product fetched', { productId: id });
    
    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    logger.error('Error fetching product', { error, productId: req.params.id });
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch product' },
    });
  }
});

export default router;
