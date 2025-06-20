import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  ShoppingCart, 
  Heart, 
  ChevronDown, 
  ChevronUp,
  Package,
  Zap,
  Truck,
  Shield,
  ArrowUpDown,
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/api';
import { useInstantProducts } from '../hooks/useInstantProducts';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatPrice } from '../utils/currency';
import { getProductImageUrl } from '../utils/imageUtils';
import ErrorMessage from '../components/ErrorMessage';
import type { Category, Product } from '../types/api';
import Header from '../components/Header';


const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { showInfo } = useToast();

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    freeShipping: false,
    buyerProtection: false,
    highRating: false,
  });
  const [limit] = useState(12);

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const categoryFilter = searchParams.get('category') || '';
  
  useEffect(() => {
    if (categoryFilter && !selectedCategories.includes(categoryFilter)) {
      setSelectedCategories([categoryFilter]);
    }
  }, [categoryFilter, selectedCategories]);

  // Categories with instant loading
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });

  const categories = categoriesData?.data?.categories || [];

  // Products with instant loading and advanced filtering
  const { 
    data,
    isLoading,
    isError,
    
    ref,
    hasInstantData,
    prefetchNextPage,
    prefetchPreviousPage
  } = useInstantProducts({
    page: currentPage,
    limit,
    search: searchQuery || undefined,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    sortBy,
    sortOrder,
    priceMin: priceRange.min ? parseFloat(priceRange.min) : undefined,
    priceMax: priceRange.max ? parseFloat(priceRange.max) : undefined,
  });

  const products = data?.data?.products || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;

  // Prefetch next page when approaching the end
  useEffect(() => {
    if (currentPage < totalPages) {
      prefetchNextPage();
    }
  }, [currentPage, totalPages, prefetchNextPage]);

  // Prefetch previous page when going back
  useEffect(() => {
    if (currentPage > 1) {
      prefetchPreviousPage();
    }
  }, [currentPage, prefetchPreviousPage]);

  // Debounced search with simple timeout instead of lodash
  const debouncedSearch = useCallback((query: string) => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (query) {
        newParams.set('search', query);
      } else {
        newParams.delete('search');
      }
      newParams.delete('page');
      setSearchParams(newParams);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const cleanup = debouncedSearch(searchQuery);
    return cleanup;
  }, [searchQuery, debouncedSearch]);

  const handleCategoryFilter = (categorySlug: string) => {
    if (selectedCategories.includes(categorySlug)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categorySlug));
    } else {
      setSelectedCategories([categorySlug]);
    }
    
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategories.includes(categorySlug)) {
      newParams.delete('category');
    } else {
      newParams.set('category', categorySlug);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSort = (option: string) => {
    let newSortBy: string;
    let newSortOrder: 'asc' | 'desc';
    
    switch (option) {
      case 'Price: Low to High':
        newSortBy = 'price';
        newSortOrder = 'asc';
        break;
      case 'Price: High to Low':
        newSortBy = 'price';
        newSortOrder = 'desc';
        break;
      case 'Newest First':
        newSortBy = 'createdAt';
        newSortOrder = 'desc';
        break;
      case 'Highest Rated':
        newSortBy = 'avgRating';
        newSortOrder = 'desc';
        break;
      case 'Name: A to Z':
        newSortBy = 'name';
        newSortOrder = 'asc';
        break;
      default:
        newSortBy = 'createdAt';
        newSortOrder = 'desc';
    }
    
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    // Reset to first page when sort changes
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const quickAddToWishlist = async (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      showInfo('Please login to add items to wishlist');
      return;
    }

    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [type]: value }));
    // Apply filter immediately when user stops typing
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('page');
      setSearchParams(newParams);
    }, 500);
    return () => clearTimeout(timer);
  };

  const handleQuickFilter = (filterType: 'freeShipping' | 'buyerProtection' | 'highRating') => {
    setQuickFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setQuickFilters({
      freeShipping: false,
      buyerProtection: false,
      highRating: false,
    });
    
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Newest First', value: 'createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: 'price' },
    { label: 'Highest Rated', value: 'avgRating' },
    { label: 'Name: A to Z', value: 'name' },
  ];

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message="Failed to load products. Please try again." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile-First Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Mobile Search Bar */}
          <div className="relative mb-4 sm:hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="relative mb-4 hidden sm:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for products, brands, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Mobile Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            {/* View Mode Toggle - Hidden on mobile */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
                <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {selectedCategories.length + (priceRange.min ? 1 : 0) + (priceRange.max ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Dropdown - Simplified for mobile */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder as 'asc' | 'desc');
                }}
                className="appearance-none bg-gray-100 border-0 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-orange-500"
              >
                <option value="featured-desc">Featured</option>
                <option value="createdAt-desc">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="avgRating-desc">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedCategories.length > 0 || priceRange.min || priceRange.max || 
            quickFilters.freeShipping || quickFilters.buyerProtection || quickFilters.highRating) && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-700 mr-2">Active filters:</span>
              
                             {selectedCategories.map(categorySlug => {
                 const category = categories.find((c: Category) => c.slug === categorySlug);
                return (
                  <button
                    key={categorySlug}
                    onClick={() => handleCategoryFilter(categorySlug)}
                    className="inline-flex items-center space-x-1 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
                  >
                    <span>{category?.name || categorySlug}</span>
                    <X size={12} />
                  </button>
                );
              })}
              
              {priceRange.min && (
                <button
                  onClick={() => setPriceRange(prev => ({ ...prev, min: '' }))}
                  className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  <span>Min: {formatPrice(parseFloat(priceRange.min))}</span>
                  <X size={12} />
                </button>
              )}
              
              {priceRange.max && (
                <button
                  onClick={() => setPriceRange(prev => ({ ...prev, max: '' }))}
                  className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
                >
                  <span>Max: {formatPrice(parseFloat(priceRange.max))}</span>
                  <X size={12} />
                </button>
              )}

              {Object.entries(quickFilters).map(([key, value]) => {
                if (!value) return null;
                const labels = {
                  freeShipping: 'Free Shipping',
                  buyerProtection: 'Buyer Protection',
                  highRating: '4+ Stars'
                };
                return (
                  <button
                    key={key}
                    onClick={() => handleQuickFilter(key as keyof typeof quickFilters)}
                    className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
                  >
                    <span>{labels[key as keyof typeof labels]}</span>
                    <X size={12} />
                  </button>
                );
              })}
              
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              {hasInstantData && (
                <div className="flex items-center text-green-600 font-medium">
                  <Zap size={14} className="mr-1" />
                  <span className="hidden sm:inline">Instant Results</span>
                  <span className="sm:hidden">Live</span>
                </div>
              )}
              <span>
                <span className="font-medium text-gray-900">{products.length}</span> products found
              </span>
            </div>
            <span className="text-xs sm:text-sm">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Mobile-Optimized Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Mobile Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={() => setShowFilters(false)}
                />
                
                {/* Filter Sidebar */}
                <motion.div
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="fixed lg:relative top-0 left-0 h-full lg:h-fit w-80 lg:w-80 bg-white rounded-none lg:rounded-xl shadow-xl lg:shadow-lg border-0 lg:border border-gray-200 p-6 z-50 lg:z-auto overflow-y-auto lg:sticky lg:top-24"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Close filters"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Categories</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {categories.map((category: Category) => (
                        <label key={category.id} className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.slug)}
                            onChange={() => handleCategoryFilter(category.slug)}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-orange-500 focus:ring-2"
                          />
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-8">
                    <button
                      onClick={() => setShowPriceRange(!showPriceRange)}
                      className="flex items-center justify-between w-full font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide hover:text-black transition-colors"
                      aria-label="Toggle price range filter"
                    >
                      Price Range
                      {showPriceRange ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {showPriceRange && (
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Min Price</label>
                          <input
                            type="number"
                            placeholder="0"
                            value={priceRange.min}
                            onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            aria-label="Minimum price"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Max Price</label>
                          <input
                            type="number"
                            placeholder="∞"
                            value={priceRange.max}
                            onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            aria-label="Maximum price"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Filters */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Filters</h4>
                    <div className="space-y-2">
                      <button 
                        onClick={() => handleQuickFilter('freeShipping')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-colors border ${
                          quickFilters.freeShipping 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`} 
                        aria-label="Filter by shipping"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          quickFilters.freeShipping ? 'bg-blue-200' : 'bg-blue-100'
                        }`}>
                          <Truck size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium">Free Shipping</span>
                      </button>
                      <button 
                        onClick={() => handleQuickFilter('buyerProtection')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-colors border ${
                          quickFilters.buyerProtection 
                            ? 'bg-green-50 border-green-200' 
                            : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`} 
                        aria-label="Filter by buyer protection"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          quickFilters.buyerProtection ? 'bg-green-200' : 'bg-green-100'
                        }`}>
                          <Shield size={16} className="text-green-600" />
                        </div>
                        <span className="font-medium">Buyer Protection</span>
                      </button>
                      <button 
                        onClick={() => handleQuickFilter('highRating')}
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm flex items-center transition-colors border ${
                          quickFilters.highRating 
                            ? 'bg-yellow-50 border-yellow-200' 
                            : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                        }`} 
                        aria-label="Filter by 4+ star rating"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          quickFilters.highRating ? 'bg-yellow-200' : 'bg-gray-100'
                        }`}>
                          <Star size={16} className={quickFilters.highRating ? 'text-yellow-600' : 'text-gray-600'} />
                        </div>
                        <span className="font-medium">4+ Stars</span>
                      </button>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {(selectedCategories.length > 0 || priceRange.min || priceRange.max || 
                    quickFilters.freeShipping || quickFilters.buyerProtection || quickFilters.highRating) && (
                    <button
                      onClick={clearAllFilters}
                      className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Products Grid/List */}
            {isLoading && !hasInstantData ? (
              <div className="flex flex-col justify-center items-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                <p className="text-gray-600">Loading amazing products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col justify-center items-center min-h-[500px] bg-white rounded-xl p-8">
                <Package size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 text-center mb-6">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1 sm:gap-2 md:gap-3"
                    : "space-y-4"
                }>
                  {products.map((product: Product, index: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`group ${
                        viewMode === 'grid' 
                          ? 'bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden' 
                          : 'bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex overflow-hidden'
                      }`}
                    >
                      {viewMode === 'grid' ? (
                        // Grid View - Mobile Optimized (Smaller)
                        <Link to={`/products/${(product as any).id}`} className="block">
                          <div className="relative">
                            {getProductImageUrl(product) ? (
                              <img
                                src={getProductImageUrl(product)!}
                                alt={(product as any).name}
                                className="w-full h-16 sm:h-24 md:h-32 lg:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-16 sm:h-24 md:h-32 lg:h-40 bg-gray-100 flex items-center justify-center">
                                <Package className="text-gray-400" size={16} />
                              </div>
                            )}
                            
                            {/* Wishlist Button - Smaller on mobile */}
                            <button
                              onClick={(e) => quickAddToWishlist(product, e)}
                              className={`absolute top-0.5 right-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
                                isInWishlist(product.id)
                                  ? 'bg-red-500 text-white shadow-md'
                                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-red-500 hover:text-white shadow-sm'
                              }`}
                              aria-label="Add to wishlist"
                            >
                              <Heart size={10} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                            </button>
                            
                            {/* Badges - Smaller */}
                            {product.featured && (
                              <div className="absolute top-0.5 left-0.5 bg-red-500 text-white text-xs px-1 py-0.5 rounded font-bold text-[8px] sm:text-[10px]">
                                Featured
                              </div>
                            )}
                            
                            {/* Discount Badge - Smaller */}
                            {(product as any).salePrice && (product as any).salePrice < (product as any).price && (
                              <div className="absolute top-0.5 right-0.5 bg-gray-600 text-white text-xs px-1 py-0.5 rounded font-bold text-[8px] sm:text-[10px]">
                                -{Math.round((((product as any).price - (product as any).salePrice) / (product as any).price) * 100)}%
                              </div>
                            )}
                          </div>
                          
                          <div className="p-1.5 sm:p-2 md:p-3">
                            <h3 className="font-medium text-xs sm:text-sm text-gray-900 line-clamp-2 mb-1">
                              {(product as any).name}
                            </h3>
                            
                            {/* Seller name - Hidden on mobile, visible on tablet+ */}
                            {product.seller && (
                              <p className="text-xs text-gray-500 mb-1 line-clamp-1 hidden md:block">
                                by {product.seller.businessName || 
                                    (product.seller.user?.firstName && product.seller.user?.lastName 
                                      ? `${product.seller.user?.firstName} ${product.seller.user?.lastName}`
                                      : (product.seller.user?.name || 'Seller'))}
                              </p>
                            )}
                            
                            {/* Rating - Only show on desktop */}
                            {(product as any).avgRating > 0 && (
                              <div className="hidden lg:flex items-center mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} className={i < Math.floor((product as any).avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 ml-1">({(product as any).avgRating.toFixed(1)})</span>
                              </div>
                            )}
                            
                            {/* Price Display - Smaller text on mobile */}
                            <div className="mb-1 sm:mb-2">
                              {(product as any).salePrice ? (
                                <div>
                                  <div className="text-xs sm:text-sm md:text-base font-bold text-black">
                                    {formatPrice((product as any).salePrice)}
                                  </div>
                                  <div className="text-xs text-gray-500 line-through">
                                    {formatPrice((product as any).price)}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs sm:text-sm md:text-base font-bold text-black">
                                  {formatPrice((product as any).price)}
                                </div>
                              )}
                            </div>
                            
                            {/* Action Button - Smaller on mobile */}
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => quickAddToCart(product, e)}
                                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium py-1 sm:py-1.5 md:py-2 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                aria-label="Add to cart"
                              >
                                <ShoppingCart size={10} className="mr-1" />
                                <span className="hidden sm:inline">Cart</span>
                              </button>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        // List View - Desktop Only
                        <>
                          <Link to={`/products/${(product as any).id}`} className="w-48 flex-shrink-0 relative">
                            {getProductImageUrl(product) ? (
                              <img
                                src={getProductImageUrl(product)!}
                                alt={(product as any).name}
                                className="w-full h-28 sm:h-32 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                <Package className="text-gray-400" size={32} />
                              </div>
                            )}
                          </Link>
                          
                          <div className="flex-1 p-6">
                            <Link to={`/products/${(product as any).id}`}>
                              <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-black transition-colors">
                                {(product as any).name}
                              </h3>
                              {/* Seller name */}
                              {product.seller && (
                                <p className="text-sm text-gray-500 mb-2">
                                  by {product.seller.businessName || 
                                      (product.seller.user?.firstName && product.seller.user?.lastName 
                                        ? `${product.seller.user?.firstName} ${product.seller.user?.lastName}`
                                        : (product.seller.user?.name || 'Seller'))}
                                </p>
                              )}
                              {/* Rating - Only show if product has rating */}
                              {(product as any).avgRating > 0 && (
                                <div className="flex items-center mb-3">
                                  <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={16} className={i < Math.floor((product as any).avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500 ml-2">({(product as any).avgRating.toFixed(1)}) {(product as any).totalReviews} reviews</span>
                                </div>
                              )}
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {product.description || "High quality product with excellent features and amazing value."}
                              </p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-2xl font-bold text-black">
                                    {formatPrice((product as any).salePrice || (product as any).price)}
                                  </span>
                                  {(product as any).salePrice && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      {formatPrice((product as any).price)}
                                    </span>
                                  )}
                                  <div className="flex items-center mt-1 text-xs text-gray-500">
                                    <Truck size={12} className="mr-1" />
                                    Free shipping • Buyer protection
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => quickAddToCart(product, e)}
                                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center"
                                    aria-label="Add to cart"
                                  >
                                    <ShoppingCart size={16} className="mr-2" />
                                    Add to Cart
                                  </button>
                                  <button
                                    onClick={(e) => quickAddToWishlist(product, e)}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                      isInWishlist(product.id)
                                        ? 'bg-red-500 text-white'
                                        : 'border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300'
                                    }`}
                                    aria-label="Add to wishlist"
                                  >
                                    <Heart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                                  </button>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Mobile-Optimized Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-xl p-4 sm:p-6 mt-6 sm:mt-8 border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="text-sm text-gray-600 order-2 sm:order-1">
                        Showing page {currentPage} of {totalPages} ({products.length} products)
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
                        <button
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                          <span className="hidden sm:inline">Previous</span>
                          <span className="sm:hidden">Prev</span>
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(Math.min(5, totalPages))].map((_, i) => {
                            const pageNum = Math.max(1, currentPage - 2) + i;
                            if (pageNum > totalPages) return null;
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium text-sm transition-all ${
                                  currentPage === pageNum
                                    ? 'bg-gray-600 text-white shadow-sm'
                                    : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <span className="sm:hidden">Next</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Intersection observer target for prefetching */}
      <div ref={ref} className="h-4" />
    </div>
  );
};

export default Products; 