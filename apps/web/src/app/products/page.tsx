'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, Filter, Search, SortAsc, SortDesc, X } from 'lucide-react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductFilters from '@/components/catalog/ProductFilters';
import ProductSort from '@/components/catalog/ProductSort';
import SearchBar from '@/components/catalog/SearchBar';
import { Product } from '@newhill/shared';
import { useCurrency } from '@/hooks/useCurrency';

interface ProductFilters {
  category: string;
  subcategory: string;
  priceMin: number | null;
  priceMax: number | null;
  weight: string;
  certification: string[];
  inStock: boolean;
  organic: boolean;
  giftPack: boolean;
}

interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
}

const sortOptions: SortOption[] = [
  { value: 'popularity', label: 'Popularity', direction: 'desc' },
  { value: 'price', label: 'Price: Low to High', direction: 'asc' },
  { value: 'price', label: 'Price: High to Low', direction: 'desc' },
  { value: 'newest', label: 'Newest Arrivals', direction: 'desc' },
  { value: 'name', label: 'Name: A to Z', direction: 'asc' },
  { value: 'name', label: 'Name: Z to A', direction: 'desc' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency, formatPrice } = useCurrency();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [filters, setFilters] = useState<ProductFilters>({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    priceMin: searchParams.get('priceMin') ? Number(searchParams.get('priceMin')) : null,
    priceMax: searchParams.get('priceMax') ? Number(searchParams.get('priceMax')) : null,
    weight: searchParams.get('weight') || '',
    certification: searchParams.get('certification')?.split(',') || [],
    inStock: searchParams.get('inStock') === 'true',
    organic: searchParams.get('organic') === 'true',
    giftPack: searchParams.get('giftPack') === 'true',
  });
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, searchQuery, currentPage, currency]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        language: 'en',
        currency: currency,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => 
            value !== '' && value !== null && value !== false && 
            !(Array.isArray(value) && value.length === 0)
          )
        ),
        sort: sortBy,
        q: searchQuery,
      });

      const response = await fetch(`/api/v1/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.items || []);
        setTotalPages(data.data.pagination?.pages || 1);
        setTotalProducts(data.data.pagination?.total || 0);
      } else {
        setError(data.error?.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError('An error occurred while fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    updateURL();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    updateURL();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL();
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
    if (filters.weight) params.set('weight', filters.weight);
    if (filters.certification.length > 0) params.set('certification', filters.certification.join(','));
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.organic) params.set('organic', 'true');
    if (filters.giftPack) params.set('giftPack', 'true');
    if (sortBy !== 'popularity') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());

    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      priceMin: null,
      priceMax: null,
      weight: '',
      certification: [],
      inStock: false,
      organic: false,
      giftPack: false,
    });
    setSearchQuery('');
    setSortBy('popularity');
    setCurrentPage(1);
    router.push('/products');
  };

  const handleAddToCart = async (productId: string, variantId?: string) => {
    try {
      const response = await fetch('/api/v1/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          productId,
          variantId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        // Show success message or update cart UI
        console.log('Added to cart successfully');
      } else {
        console.error('Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleAddToWishlist = async (productId: string) => {
    try {
      const response = await fetch('/api/v1/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        console.log('Added to wishlist successfully');
      } else {
        console.error('Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== '' && value !== null && value !== false && 
    !(Array.isArray(value) && value.length === 0)
  ).length;

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-lg text-neutral-600">
            {totalProducts} products found
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search spices, herbs, and seasonings..."
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="flex items-center border border-neutral-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-neutral-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-neutral-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center justify-between">
            <ProductSort
              value={sortBy}
              onChange={handleSortChange}
              options={sortOptions}
            />
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <ProductFilters
                filters={filters}
                onChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </div>
          )}

          {/* Products Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="card-hover p-6">
                    <div className="skeleton h-64 mb-4 rounded-lg" />
                    <div className="skeleton h-6 mb-2" />
                    <div className="skeleton h-4 mb-4" />
                    <div className="skeleton h-10" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-neutral-500 text-lg mb-2">No products found</p>
                <p className="text-neutral-400 text-sm mb-6">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-primary"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                      >
                        <SortAsc className="w-4 h-4" />
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isCurrentPage = page === currentPage;
                        const showPage = page === 1 || page === totalPages || 
                          (page >= currentPage - 2 && page <= currentPage + 2);
                        
                        if (!showPage) {
                          if (page === currentPage - 3 || page === currentPage + 3) {
                            return <span key={page} className="px-2">...</span>;
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg ${
                              isCurrentPage
                                ? 'bg-emerald-600 text-white'
                                : 'border border-neutral-300 hover:bg-neutral-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
                      >
                        <SortDesc className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

