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
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  // Get current filters from URL
  const currentPage = parseInt(searchParams.get('page') || '1');
  const categoryFilter = searchParams.get('category') || '';
  
  // Sync local page state with URL
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);
  
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
    page,
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
    if (page < totalPages) {
      prefetchNextPage();
    }
  }, [page, totalPages, prefetchNextPage]);

  // Prefetch previous page when going back
  useEffect(() => {
    if (page > 1) {
      prefetchPreviousPage();
    }
  }, [page, prefetchPreviousPage]);

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
    setPage(1); // Reset to first page when sort changes
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    setPage(newPage); // Also update local state
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
      showInfo('Sign In Required', 'Please sign in to add items to your wishlist');
      return;
    }

    try {
      if (isInWishlist((product as any).id)) {
        await removeFromWishlist((product as any).id);
      } else {
        await addToWishlist((product as any).id);
      }
    } catch (error) {
      console.error('Wishlist error:', 'Error occurred');
    }
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    setPriceRange(prev => ({ ...prev, [type]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const handleQuickFilter = (filterType: 'freeShipping' | 'buyerProtection' | 'highRating') => {
    setQuickFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
    setPage(1); // Reset to first page when filter changes
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setQuickFilters({
      freeShipping: false,
      buyerProtection: false,
      highRating: false,
    });
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
    setPage(1);
  };

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'price', label: 'Price: High to Low' },
    { value: 'avgRating', label: 'Highest Rated' },
    { value: 'name', label: 'Name: A to Z' },
  ];



  if (isError) {
    return <ErrorMessage message={(isError as any)?.message || 'Failed to load products'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for products, brands, and more..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={18} className="mr-1" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={18} className="mr-1" />
                List
              </button>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                showFilters
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal size={18} className="mr-2" />
              Filters
            </button>
          </div>

          {/* Active Filters and Product Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-0">
              {selectedCategories.map((categorySlug) => {
                const category = categories.find((c: Category) => c.slug === categorySlug);
                return category ? (
                  <span
                    key={categorySlug}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {category.name}
                    <button
                      onClick={() => handleCategoryFilter(categorySlug)}
                      className="ml-2 hover:text-blue-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ) : null;
              })}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                  {priceRange.min && priceRange.max
                    ? `${formatPrice(parseFloat(priceRange.min))} - ${formatPrice(parseFloat(priceRange.max))}`
                    : priceRange.min
                    ? `From ${formatPrice(parseFloat(priceRange.min))}`
                    : `Up to ${formatPrice(parseFloat(priceRange.max))}`
                  }
                  <button
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="ml-2 hover:text-green-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {Object.entries(quickFilters).some(([, active]) => active) && (
                Object.entries(quickFilters).map(([filterType, active]) => 
                  active ? (
                    <span
                      key={filterType}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-700 border border-purple-200"
                    >
                      {filterType === 'freeShipping' ? 'Free Shipping' : 
                       filterType === 'buyerProtection' ? 'Buyer Protection' : '4+ Stars'}
                      <button
                        onClick={() => handleQuickFilter(filterType as 'freeShipping' | 'buyerProtection' | 'highRating')}
                        className="ml-2 hover:text-purple-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ) : null
                )
              )}
            </div>
            <div className="text-sm text-gray-500">
              {data?.data?.pagination?.total || 0} products found
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-fit sticky top-24"
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
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Sort by:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {sortOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => handleSort(option.label)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          (sortBy === option.value && (
                            (option.label === 'Price: Low to High' && sortOrder === 'asc') ||
                            (option.label === 'Price: High to Low' && sortOrder === 'desc') ||
                            (option.label !== 'Price: Low to High' && option.label !== 'Price: High to Low')
                          ))
                            ? 'bg-gray-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                        {(sortBy === option.value && (
                          (option.label === 'Price: Low to High' && sortOrder === 'asc') ||
                          (option.label === 'Price: High to Low' && sortOrder === 'desc') ||
                          (option.label !== 'Price: Low to High' && option.label !== 'Price: High to Low')
                        )) && (
                          <ArrowUpDown className="inline ml-2" size={14} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {hasInstantData && (
                    <div className="flex items-center text-green-600 font-medium">
                      <Zap size={16} className="mr-1" />
                      <span>Instant Results</span>
                    </div>
                  )}
                  <span className="font-medium">
                    Page {page} of {totalPages} • {products.length} products
                  </span>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading && !hasInstantData ? (
              <div className="flex flex-col justify-center items-center min-h-[500px]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-400 border-t-transparent mb-4"></div>
                <p className="text-gray-600 font-medium">Loading products...</p>
                <p className="text-gray-500 text-sm mt-1">Finding the best deals for you</p>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <Package className="text-gray-400" size={48} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find any products matching your criteria. Try adjusting your search terms or filters.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Reset Search
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3" 
                  : "space-y-4"
                }>
                  {products.map((product: Product, index: number) => (
                    <motion.div
                      key={(product as any).id}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={viewMode === 'grid' 
                        ? "bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100"
                        : "bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex border border-gray-100"
                      }
                    >
                      {viewMode === 'grid' ? (
                        // Grid View - Small uniform cards
                        <Link to={`/products/${(product as any).id}`} className="block">
                          <div className="relative">
                            <div className="h-20 md:h-24 bg-gray-50 relative overflow-hidden">
                              {getProductImageUrl(product) ? (
                                <img
                                  src={getProductImageUrl(product)!}
                                  alt={(product as any).name}
                                  className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`absolute inset-0 flex items-center justify-center ${getProductImageUrl(product) ? 'hidden' : ''}`}>
                                <Package className="text-gray-300" size={16} />
                              </div>
                            </div>
                            
                            {/* Badges */}
                            {product.featured && (
                              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded font-bold text-[10px]">
                                Featured
                              </div>
                            )}
                            
                            {/* Discount Badge */}
                            {(product as any).salePrice && (product as any).salePrice < (product as any).price && (
                              <div className="absolute top-1 right-1 bg-gray-600 text-white text-xs px-1 py-0.5 rounded font-bold text-[10px]">
                                -{Math.round((((product as any).price - (product as any).salePrice) / (product as any).price) * 100)}%
                              </div>
                            )}
                          </div>
                          
                          <div className="p-2">
                            <h3 className="font-medium text-xs text-gray-900 line-clamp-2 mb-1">
                              {(product as any).name}
                            </h3>
                            
                            {/* Price Display */}
                            <div className="text-center mb-2">
                              {(product as any).salePrice ? (
                                <div className="text-sm font-bold text-black">
                                  {formatPrice((product as any).salePrice)}
                                </div>
                              ) : (
                                <div className="text-sm font-bold text-black">
                                  {formatPrice((product as any).price)}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-0.5 justify-center">
                              <button
                                onClick={(e) => quickAddToCart(product, e)}
                                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium w-8 h-6 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                aria-label="Add to cart"
                              >
                                <ShoppingCart size={12} />
                              </button>
                              <button
                                onClick={(e) => quickAddToWishlist(product, e)}
                                className="border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white text-xs font-medium w-8 h-6 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                aria-label="Add to wishlist"
                              >
                                <Heart size={12} />
                              </button>
                            </div>
                          </div>
                        </Link>
                      ) : (
                        // List View
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
                                <div className="flex gap-0.5 justify-center">
                                  <button
                                    onClick={(e) => quickAddToCart(product, e)}
                                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium w-8 h-6 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                    aria-label="Add to cart"
                                  >
                                    <ShoppingCart size={12} />
                                  </button>
                                  <button
                                    onClick={(e) => quickAddToWishlist(product, e)}
                                    className="border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white text-xs font-medium w-8 h-6 rounded shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                                    aria-label="Add to wishlist"
                                  >
                                    <Heart size={12} />
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl p-6 mt-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Showing page {currentPage} of {totalPages} ({products.length} products)
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, currentPage - 2) + i;
                        if (pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
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
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                      Next
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