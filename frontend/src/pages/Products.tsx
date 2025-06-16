import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Grid3x3, 
  List, 
  Star, 
  Package, 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal,
  Heart,
  Eye,
  Zap,
  Users,
  X,
  ArrowUpDown,
  Truck,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../services/api';
import { useInstantProducts } from '../hooks/useInstantProducts';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/currency';
import { getProductImageUrl } from '../utils/imageUtils';
import ProductSkeleton from '../components/ProductSkeleton';
import ErrorMessage from '../components/ErrorMessage';
import type { Category, Product } from '../types/api';


const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [page, setPage] = useState(1);
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
    error,
    ref,
    hasInstantData,
    isInstantFetching,
    prefetchNextPage,
    prefetchPreviousPage
  } = useInstantProducts({
    page,
    limit,
    search: searchQuery || undefined,
    category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
    sortBy,
    sortOrder,
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

  const handleSort = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
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
      alert('Please sign in to add items to your wishlist');
      return;
    }

    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    setSearchQuery('');
    setSearchParams(new URLSearchParams());
  };

  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'price', label: 'Price' },
    { value: 'totalSales', label: 'Best Selling' },
    { value: 'createdAt', label: 'Newest' },
    { value: 'avgRating', label: 'Rating' },
  ];

  // Helper function to calculate discount percentage
  const calculateDiscount = (originalPrice: number, salePrice?: number) => {
    if (!salePrice || salePrice >= originalPrice) return null;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  // Helper function to get consistent sold count based on product ID
  const getSoldCount = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash) % 1900 + 100;
  };

  // Helper function to get consistent rating based on product ID
  const getProductRating = (productId: string) => {
    const hash = productId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const rating = 3.5 + (Math.abs(hash) % 15) / 10;
    return Math.round(rating * 10) / 10;
  };

  if (isError) {
    return <ErrorMessage message={error?.message || 'Failed to load products'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AliExpress-style Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mr-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            
            {/* View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 size={16} />
                </button>
              <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                  aria-label="List view"
                >
                  <List size={16} />
              </button>
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4 flex-wrap">
              {selectedCategories.length > 0 || priceRange.min || priceRange.max || searchQuery ? (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-500">Filters:</span>
                  {selectedCategories.map(categorySlug => {
                    const category = categories.find((c: Category) => c.slug === categorySlug);
                    return category ? (
                      <span key={categorySlug} className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        {category.name}
                        <button onClick={() => handleCategoryFilter(categorySlug)} className="ml-1" aria-label={`Remove ${category.name} filter`}>
                    <X size={12} />
                  </button>
                </span>
                    ) : null;
                  })}
                  {(priceRange.min || priceRange.max) && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      Price: {priceRange.min || '0'} - {priceRange.max || '∞'}
                      <button onClick={() => setPriceRange({ min: '', max: '' })} className="ml-1" aria-label="Remove price filter">
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                    onClick={clearAllFilters}
                    className="text-red-500 hover:text-red-600 text-xs font-medium"
              >
                Clear all
              </button>
            </div>
              ) : null}
            </div>

            <div className="flex items-center space-x-4">
              {hasInstantData && (
                <div className="flex items-center text-sm text-green-600">
                  <Zap size={14} className="mr-1" />
                  <span>Instant Results</span>
                </div>
              )}
              <span className="text-sm text-gray-500">
                {products.length} products found
              </span>
            </div>
          </div>
        </div>
        </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="w-80 bg-white rounded-lg shadow-sm border p-6 h-fit sticky top-24"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close filters"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Categories */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.map((category: Category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.slug)}
                          onChange={() => handleCategoryFilter(category.slug)}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {category.name} ({category._count?.products || 0})
                        </span>
                        </label>
                      ))}
                    </div>
                  </div>

                {/* Price Range */}
                <div className="mb-6">
                  <button
                    onClick={() => setShowPriceRange(!showPriceRange)}
                    className="flex items-center justify-between w-full font-medium text-gray-900 mb-3"
                    aria-label="Toggle price range filter"
                  >
                    Price Range
                    {showPriceRange ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {showPriceRange && (
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        aria-label="Minimum price"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        aria-label="Maximum price"
                      />
                    </div>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Filters</h4>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm flex items-center" aria-label="Filter by shipping">
                      <Truck size={14} className="mr-2 text-blue-500" />
                                              Free Shipping
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm flex items-center" aria-label="Filter by buyer protection">
                      <Shield size={14} className="mr-2 text-green-500" />
                      Buyer Protection
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-sm flex items-center" aria-label="Filter by 4+ star rating">
                      <Star size={14} className="mr-2 text-yellow-500" />
                      4+ Stars
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-lg border p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <div className="flex items-center space-x-2">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSort(option.value)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          sortBy === option.value
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                        {sortBy === option.value && (
                          <ArrowUpDown className="inline ml-1" size={12} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading && !hasInstantData ? (
              <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                  <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                  Clear Filters
                  </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" 
                  : "space-y-4"
                }>
                  {products.map((product: Product, index: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={viewMode === 'grid' 
                        ? "bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group"
                        : "bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group flex"
                      }
                    >
                      {viewMode === 'grid' ? (
                        // Grid View
                        <>
                          <Link to={`/products/${product.id}`} className="block relative">
                            {getProductImageUrl(product) ? (
                              <img
                                src={getProductImageUrl(product)!}
                                alt={product.name}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                                <Package className="text-gray-400" size={32} />
                              </div>
                            )}
                            
                            {product.featured && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                Featured
              </div>
            )}
                            
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button 
                                onClick={(e) => quickAddToWishlist(product, e)}
                                className="bg-white/80 hover:bg-white p-2 rounded-full mb-2 block" 
                                aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                              >
                                <Heart 
                                  size={14} 
                                  className={isInWishlist(product.id) 
                                    ? "text-red-500 fill-current" 
                                    : "text-gray-600 hover:text-red-500"
                                  } 
                                />
                              </button>
                              <button className="bg-white/80 hover:bg-white p-2 rounded-full block" aria-label="Quick view">
                                <Eye size={14} className="text-gray-600" />
                              </button>
                            </div>
                          </Link>
                          
                          <div className="p-3">
                            <Link to={`/products/${product.id}`}>
                              <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                {product.name}
                              </h3>
                              {/* Seller name */}
                              {product.seller && (
                                <p className="text-xs text-gray-500 mb-2">
                                  by {product.seller.businessName || 
                                      (product.seller.user?.firstName && product.seller.user?.lastName 
                                        ? `${product.seller.user.firstName} ${product.seller.user.lastName}`
                                        : product.seller.user?.name || 'Unknown Seller')}
                                </p>
                              )}
                              <div className="flex items-center mb-2">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} className={i < Math.floor(getProductRating(product.id)) ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 ml-2">({getProductRating(product.id)})</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-lg font-bold text-red-600">
                                    {formatPrice(product.salePrice || product.price)}
                                  </span>
                                  {product.salePrice && (
                                    <div className="text-xs text-gray-500 line-through">
                                      {formatPrice(product.price)}
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={(e) => quickAddToCart(product, e)}
                                  disabled={product.stock === 0}
                                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                                  aria-label="Add to cart"
                                >
                                  <ShoppingCart size={16} className="mr-2" />
                                  Add to Cart
                                </button>
                              </div>
                              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <Users size={10} className="mr-1" />
                                  {getSoldCount(product.id)} sold
                                </span>
                                <span className="flex items-center">
                                  <Truck size={10} className="mr-1" />
                                  Free shipping
                                </span>
                              </div>
                            </Link>
                          </div>
                        </>
                      ) : (
                        // List View
                        <>
                          <Link to={`/products/${product.id}`} className="w-48 flex-shrink-0 relative">
                            {getProductImageUrl(product) ? (
                              <img
                                src={getProductImageUrl(product)!}
                                alt={product.name}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                <Package className="text-gray-400" size={32} />
                              </div>
                            )}
                          </Link>
                          
                          <div className="flex-1 p-6">
                            <Link to={`/products/${product.id}`}>
                              <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                                {product.name}
                              </h3>
                              {/* Seller name */}
                              {product.seller && (
                                <p className="text-sm text-gray-500 mb-2">
                                  by {product.seller.businessName || 
                                      (product.seller.user?.firstName && product.seller.user?.lastName 
                                        ? `${product.seller.user.firstName} ${product.seller.user.lastName}`
                                        : product.seller.user?.name || 'Unknown Seller')}
                                </p>
                              )}
                              <div className="flex items-center mb-3">
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} className={i < Math.floor(getProductRating(product.id)) ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500 ml-2">({getProductRating(product.id)}) • {getSoldCount(product.id)} sold</span>
                              </div>
                              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                {product.description || "High quality product with excellent features and amazing value."}
                              </p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="text-2xl font-bold text-red-600">
                                    {formatPrice(product.salePrice || product.price)}
                                  </span>
                                  {product.salePrice && (
                                    <span className="text-sm text-gray-500 line-through ml-2">
                                      {formatPrice(product.price)}
                                    </span>
                                  )}
                                  <div className="flex items-center mt-1 text-xs text-gray-500">
                                    <Truck size={12} className="mr-1" />
                                    Free shipping • Buyer protection
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => quickAddToCart(product, e)}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  aria-label="Add to cart"
                                >
                                  <ShoppingCart size={16} className="mr-2" />
                                  Add to Cart
                                </button>
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
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      const page = Math.max(1, currentPage - 2) + i;
                      if (page > totalPages) return null;
                      
                      return (
                    <button
                      key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 border rounded-lg ${
                        currentPage === page
                              ? 'bg-red-500 text-white border-red-500'
                              : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
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