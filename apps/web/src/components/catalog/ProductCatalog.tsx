import { useState, useEffect } from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';

interface Product {
  id: string;
  translatedName: string;
  translatedDescription?: string;
  category: string;
  organicCertified: boolean;
  images: string[];
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  weightInGrams: number;
  stockQty: number;
  currencyPrice: {
    currency: string;
    amount: number;
    formatted: string;
    symbol: string;
  };
}

interface ProductCatalogProps {
  category?: string;
  search?: string;
  organic?: boolean;
  inStock?: boolean;
}

export default function ProductCatalog({ 
  category, 
  search, 
  organic, 
  inStock 
}: ProductCatalogProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { currency, setCurrency, supportedCurrencies } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: category || '',
    search: search || '',
    organic: organic || false,
    inStock: inStock || false,
  });

  useEffect(() => {
    fetchProducts();
  }, [filters, currency]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
        language: 'en', // This would come from user preference
        currency: currency,
        ...filters,
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
      } else {
        setError(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = async (variantId: string, quantity: number = 1) => {
    if (!session) {
      alert('Please sign in to add items to cart');
      return;
    }

    try {
      // Validate stock availability
      const stockResponse = await fetch('/api/inventory/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ variantId, quantity }]
        }),
      });

      const stockData = await stockResponse.json();

      if (!stockData.data.valid) {
        alert(stockData.data.results[0]?.message || 'Insufficient stock');
        return;
      }

      // Add to cart (this would be implemented in Phase 4)
      console.log('Adding to cart:', { variantId, quantity });
      alert('Added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {t('product.catalog')}
        </h1>
        
        {/* Currency Selector */}
        <div className="flex items-center space-x-4 mb-6">
          <label className="text-sm font-medium text-gray-700">
            {t('product.currency')}:
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            {supportedCurrencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('product.category')}
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Categories</option>
              <option value="Spices">Spices</option>
              <option value="Seasonings">Seasonings</option>
              <option value="Herbs">Herbs</option>
              <option value="Blends">Blends</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search products..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.organic}
                onChange={(e) => handleFilterChange('organic', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {t('product.organic')}
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                {t('product.inStock')}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <img
                src={product.images[0] || '/placeholder-spice.jpg'}
                alt={product.translatedName}
                className="w-full h-48 object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {product.translatedName}
                </h3>
                {product.organicCertified && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {t('product.organic')}
                  </span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.translatedDescription}
              </p>

              <div className="text-sm text-gray-500 mb-3">
                {t('product.category')}: {product.category}
              </div>

              {/* Variants */}
              <div className="space-y-2">
                {product.variants.slice(0, 2).map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {variant.weightInGrams}g
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {variant.currencyPrice.formatted}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        variant.stockQty > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {variant.stockQty > 0 ? t('product.inStock') : t('product.outOfStock')}
                      </span>
                      
                      <button
                        onClick={() => handleAddToCart(variant.id)}
                        disabled={variant.stockQty === 0}
                        className={`px-3 py-1 text-xs rounded-md ${
                          variant.stockQty > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {t('product.addToCart')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {product.variants.length > 2 && (
                <button className="text-blue-600 text-sm hover:text-blue-800 mt-2">
                  View all {product.variants.length} variants
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
    </div>
  );
}
