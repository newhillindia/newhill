'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, SortAsc, SortDesc, X, AlertCircle, Lightbulb } from 'lucide-react';
import ProductCard from '@/components/catalog/ProductCard';
import ProductFilters from '@/components/catalog/ProductFilters';
import ProductSort from '@/components/catalog/ProductSort';
import SearchBar from '@/components/catalog/SearchBar';
import { Product } from '@newhill/shared';
import { useCurrency } from '@/hooks/useCurrency';

interface SearchFilters {
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

interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'suggestion';
  count?: number;
}

interface SearchResult {
  products: Product[];
  suggestions: SearchSuggestion[];
  didYouMean: string[];
  totalResults: number;
  searchTime: number;
  filters: {
    categories: string[];
    priceRange: { min: number; max: number };
    weights: string[];
    certifications: string[];
  };
}

interface SortOption {
  value: string;
  label: string;
  direction: 'asc' | 'desc';
}

const sortOptions: SortOption[] = [
  { value: 'relevance', label: 'Most Relevant', direction: 'desc' },
  { value: 'popularity', label: 'Most Popular', direction: 'desc' },
  { value: 'price', label: 'Price: Low to High', direction: 'asc' },
  { value: 'price', label: 'Price: High to Low', direction: 'desc' },
  { value: 'newest', label: 'Newest First', direction: 'desc' },
  { value: 'name', label: 'Name: A to Z', direction: 'asc' },
  { value: 'name', label: 'Name: Z to A', direction: 'desc' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency, formatPrice } = useCurrency();
  
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
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
  
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'relevance');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, filters: SearchFilters, sort: string, page: number) => {
      if (!query.trim()) {
        setSearchResult(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: '20',
          language: 'en',
          currency: currency,
          sort: sort,
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => 
              value !== '' && value !== null && value !== false && 
              !(Array.isArray(value) && value.length === 0)
            )
          ),
        });

        const response = await fetch(`/api/v1/search?${params}`);
        const data = await response.json();

        if (data.success) {
          setSearchResult(data.data);
          setTotalPages(Math.ceil(data.data.totalResults / 20));
        } else {
          setError(data.error?.message || 'Search failed');
        }
      } catch (err) {
        setError('An error occurred while searching');
      } finally {
        setLoading(false);
      }
    }, 300),
    [currency]
  );

  // Fetch search suggestions
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/v1/search/suggestions?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.success) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    }, 200),
    []
  );

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    if (query) {
      debouncedSearch(query, filters, sortBy, currentPage);
    }
  }, [searchParams, filters, sortBy, currentPage, debouncedSearch]);

  useEffect(() => {
    if (searchQuery) {
      fetchSuggestions(searchQuery);
    }
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateURL(query, filters, sortBy, 1);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(searchQuery, newFilters, sortBy, 1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
    updateURL(searchQuery, filters, value, 1);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    setCurrentPage(1);
    updateURL(suggestion.text, filters, sortBy, 1);
  };

  const updateURL = (query: string, filters: SearchFilters, sort: string, page: number) => {
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (filters.category) params.set('category', filters.category);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.priceMin) params.set('priceMin', filters.priceMin.toString());
    if (filters.priceMax) params.set('priceMax', filters.priceMax.toString());
    if (filters.weight) params.set('weight', filters.weight);
    if (filters.certification.length > 0) params.set('certification', filters.certification.join(','));
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.organic) params.set('organic', 'true');
    if (filters.giftPack) params.set('giftPack', 'true');
    if (sort !== 'relevance') params.set('sort', sort);
    if (page > 1) params.set('page', page.toString());

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      priceMin: null,
      priceMax: null,
      weight: '',
      certification: [],
      inStock: false,
      organic: false,
      giftPack: false,
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
    updateURL(searchQuery, clearedFilters, sortBy, 1);
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

  if (!searchQuery) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container-max py-8">
          <div className="text-center">
            <Search className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h1 className="font-heading text-3xl font-bold text-neutral-900 mb-4">
              Search Products
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Find the perfect spices and seasonings for your kitchen
            </p>
            
            <div className="max-w-2xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for spices, herbs, seasonings..."
                suggestions={suggestions}
                onSuggestionSelect={handleSuggestionClick}
              />
            </div>

            {/* Popular Searches */}
            <div className="mt-12">
              <h2 className="font-heading text-xl font-bold text-neutral-900 mb-6">Popular Searches</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {['turmeric', 'cardamom', 'cinnamon', 'black pepper', 'cumin', 'garam masala', 'gift packs'].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="px-4 py-2 bg-white border border-neutral-300 rounded-full text-sm hover:border-emerald-600 hover:text-emerald-600 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container-max py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Search Results for "{searchQuery}"
          </h1>
          {searchResult && (
            <p className="text-lg text-neutral-600">
              {searchResult.totalResults} results found in {searchResult.searchTime}ms
            </p>
          )}
        </div>

        {/* Search and Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search for spices, herbs, seasonings..."
                suggestions={suggestions}
                onSuggestionSelect={handleSuggestionClick}
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
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-neutral-600'}`}
                >
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="bg-current rounded-sm h-1"></div>
                    <div className="bg-current rounded-sm h-1"></div>
                    <div className="bg-current rounded-sm h-1"></div>
                  </div>
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

        {/* Did You Mean Suggestions */}
        {searchResult?.didYouMean && searchResult.didYouMean.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Did you mean?</h3>
                <div className="flex flex-wrap gap-2">
                  {searchResult.didYouMean.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="text-blue-700 hover:text-blue-900 underline text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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

          {/* Search Results */}
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
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => debouncedSearch(searchQuery, filters, sortBy, currentPage)}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            ) : !searchResult || searchResult.products.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">No Results Found</h2>
                <p className="text-neutral-600 mb-6">
                  We couldn't find any products matching "{searchQuery}". Try adjusting your search terms or filters.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={clearFilters}
                    className="btn-primary mr-4"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="btn-secondary"
                  >
                    Start New Search
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {searchResult.products.map((product) => (
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

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
