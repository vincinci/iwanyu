import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  Package, 
  ShoppingCart, 
  Smartphone,
  Shirt,
  Car,
  Sparkles,
  Home as HomeIcon,
  Trophy,
  BookOpen,
  Gamepad2,
  Flame as Fire,
  Gift,
  Truck,
  Shield,
  Users,
  Eye,
  Heart,
  Plus
} from 'lucide-react';
import { categoriesApi } from '../services/api';
import { useInstantProducts, useGlobalPrefetch } from '../hooks/useInstantProducts';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/currency';
import ProductSkeleton from '../components/ProductSkeleton';
import { advertisementApi } from '../services/advertisementApi';
import type { Category, Product } from '../types/api';
import type { PromotedProduct } from '../services/advertisementApi';
import { getSoldCount, getProductRating, calculateDiscount } from '../utils/productHelpers';

const Home: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [promotedProducts, setPromotedProducts] = useState<PromotedProduct[]>([]);
  const [promotedLoading, setPromotedLoading] = useState(false);
  
  // Flash sale timer with localStorage persistence
  const getFlashSaleEndTime = () => {
    const stored = localStorage.getItem('flashSaleEndTime');
    if (stored) {
      const endTime = new Date(stored);
      if (endTime > new Date()) {
        return endTime;
      }
    }
    // Create new end time (24 hours from now)
    const newEndTime = new Date();
    newEndTime.setHours(newEndTime.getHours() + 24);
    localStorage.setItem('flashSaleEndTime', newEndTime.toISOString());
    return newEndTime;
  };

  const calculateTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      // Sale ended, create new one
      const newEndTime = new Date();
      newEndTime.setHours(newEndTime.getHours() + 24);
      localStorage.setItem('flashSaleEndTime', newEndTime.toISOString());
      return { hours: 23, minutes: 59, seconds: 59 };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const [flashSaleTime, setFlashSaleTime] = useState(() => {
    const endTime = getFlashSaleEndTime();
    return calculateTimeRemaining(endTime);
  });

  const { prefetchEverything } = useGlobalPrefetch();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  // Prefetch everything for instant navigation
  useEffect(() => {
    prefetchEverything();
  }, [prefetchEverything]);

  // Banner rotation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Flash sale countdown with persistence
  useEffect(() => {
    const timer = setInterval(() => {
      const endTime = getFlashSaleEndTime();
      const newTime = calculateTimeRemaining(endTime);
      setFlashSaleTime(newTime);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch promoted products for home page
  useEffect(() => {
    const fetchPromotedProducts = async () => {
      setPromotedLoading(true);
      try {
        const response = await advertisementApi.getHomePageAds('HOME_FEATURED', 6);
        if (response.success) {
          setPromotedProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching promoted products:', error);
      } finally {
        setPromotedLoading(false);
      }
    };

    fetchPromotedProducts();
  }, []);

  // Categories with instant loading
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const categories = categoriesData?.data?.categories || [];

  // Flash sale products with instant loading
  const { 
    products: flashProducts, 
    isInstantLoading: flashLoading,
    hasInstantData: hasFlashData
  } = useInstantProducts({
    limit: 8,
    sortBy: 'totalSales',
    sortOrder: 'desc',
  });

  // Best sellers with instant loading
  const { 
    products: bestSellers, 
    isInstantLoading: bestLoading,
    hasInstantData: hasBestData
  } = useInstantProducts({
    limit: 12,
    sortBy: 'featured',
    sortOrder: 'desc',
  });

  // Latest products with instant loading
  const { 
    products: latestProducts, 
    isInstantLoading: latestLoading,
    hasInstantData: hasLatestData,
    prefetchCategory
  } = useInstantProducts({
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electronics') || name.includes('mobile') || name.includes('phone') || name.includes('computer') || name.includes('laptop')) return Smartphone;
    if (name.includes('fashion') || name.includes('clothing') || name.includes('shoes') || name.includes('sneakers')) return Shirt;
    if (name.includes('automotive')) return Car;
    if (name.includes('beauty')) return Sparkles;
    if (name.includes('home') || name.includes('garden')) return HomeIcon;
    if (name.includes('sports') || name.includes('jersey') || name.includes('athletic')) return Trophy;
    if (name.includes('books')) return BookOpen;
    if (name.includes('gaming') || name.includes('console') || name.includes('toys')) return Gamepad2;
    if (name.includes('watch') || name.includes('jewelry')) return Star;
    if (name.includes('audio') || name.includes('headphone')) return Sparkles;
    return Package;
  };

  const banners = [
    {
      title: "Super Sale Week",
      subtitle: "Up to 70% OFF on Electronics",
      bg: "from-red-500 to-pink-500",
      cta: "Shop Now"
    },
    {
      title: "New Arrivals",
      subtitle: "Latest Fashion & Trends",
      bg: "from-purple-500 to-indigo-500",
      cta: "Explore"
    },
    {
      title: "Fast Shipping",
              subtitle: "Free shipping nationwide",
      bg: "from-green-500 to-teal-500",
      cta: "Order Now"
    },
    {
      title: "Flash Deals",
      subtitle: "Limited time offers",
      bg: "from-orange-500 to-yellow-500",
      cta: "Grab Now"
    }
  ];

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AliExpress-style Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
                              <span className="flex items-center"><Truck size={14} className="mr-1" /> Free shipping</span>
              <span className="flex items-center"><Shield size={14} className="mr-1" /> Buyer protection</span>
              <span className="flex items-center"><Gift size={14} className="mr-1" /> New user bonus</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section with Rotating Banners */}
      <section className="relative">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Package size={18} className="mr-2 text-red-500" />
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.slice(0, 8).map((category: Category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.slug}`}
                      className="group flex items-center justify-between p-2 rounded hover:bg-red-50 transition-colors duration-200"
                      onMouseEnter={() => prefetchCategory(category.slug)}
                    >
                      <div className="flex items-center space-x-3">
                        {React.createElement(getCategoryIcon(category.name), { 
                          size: 16, 
                          className: "text-gray-500 group-hover:text-red-500" 
                        })}
                        <span className="text-sm text-gray-700 group-hover:text-red-600">
                          {category.name}
                        </span>
                      </div>
                      <ArrowRight size={12} className="text-gray-400 group-hover:text-red-500" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Banner */}
            <div className="lg:col-span-3">
              <div className="relative h-80 rounded-lg overflow-hidden">
                {banners.map((banner, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: currentBanner === index ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-r ${banner.bg} flex items-center justify-center text-white`}
                  >
                    <div className="text-center">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">{banner.title}</h1>
                      <p className="text-xl mb-8">{banner.subtitle}</p>
          <Link 
            to="/products" 
                        className="inline-flex items-center bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
                        {banner.cta} <ArrowRight className="ml-2" size={20} />
          </Link>
                    </div>
                  </motion.div>
                ))}
                
                {/* Banner Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {banners.map((_, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBanner(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        currentBanner === index ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promoted Products Section */}
      {promotedProducts.length > 0 && (
        <section className="py-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Star className="mr-2 text-blue-500" size={24} />
                Sponsored Products
              </h2>
              <span className="text-sm text-gray-500 bg-blue-100 px-3 py-1 rounded-full">
                Promoted
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {promotedProducts.map((product: PromotedProduct, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden group relative"
                >
                  <Link 
                    to={`/products/${product.id}`} 
                    className="block relative"
                    onClick={() => advertisementApi.trackClick(product.adId)}
                  >
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-32 sm:h-36 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-32 sm:h-36 md:h-40 bg-gray-100 flex items-center justify-center ${product.images?.[0] ? 'hidden' : ''}`}>
                      <Package className="text-gray-400" size={24} />
                    </div>
                    
                    {/* Sponsored Badge */}
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      Sponsored
                    </div>
                  </Link>
                  
                  <div className="p-3">
                    <Link 
                      to={`/products/${product.id}`}
                      onClick={() => advertisementApi.trackClick(product.adId)}
                    >
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
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
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-lg font-bold text-blue-600">
                            {formatPrice(product.salePrice || product.price)}
                          </span>
                          {product.salePrice && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 flex items-center">
                          <Users size={10} className="mr-1" />
                          {getSoldCount(product.id)} sold
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          advertisementApi.trackClick(product.adId);
                          quickAddToCart(product as any, e);
                        }}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-medium"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Fire className="text-yellow-300" size={32} />
                <div>
                  <h2 className="text-2xl font-bold">Flash Sale</h2>
                  <p className="text-red-100">Limited time offers</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <div className="text-2xl font-bold">{String(flashSaleTime.hours).padStart(2, '0')}</div>
                    <div className="text-xs">Hours</div>
                  </div>
                </div>
                <div className="text-2xl">:</div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <div className="text-2xl font-bold">{String(flashSaleTime.minutes).padStart(2, '0')}</div>
                    <div className="text-xs">Min</div>
                  </div>
                </div>
                <div className="text-2xl">:</div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-3 py-2">
                    <div className="text-2xl font-bold">{String(flashSaleTime.seconds).padStart(2, '0')}</div>
                    <div className="text-xs">Sec</div>
                  </div>
                </div>
          </div>
            </div>
          </div>

          {/* Flash Sale Products - Always show if data exists */}
          {flashProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {flashProducts.slice(0, 8).map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group relative"
                >
                  <Link to={`/products/${product.id}`}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-28 sm:h-32 md:h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-28 sm:h-32 md:h-36 bg-gray-100 flex items-center justify-center ${product.images?.[0] ? 'hidden' : ''}`}>
                      <Package className="text-gray-400" size={20} />
                    </div>
                    
                    {/* Flash Sale Badge */}
                    {(product.salePrice && product.salePrice < product.price) ? (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        -{calculateDiscount(product.price, product.salePrice)}%
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        FLASH
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-3">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      {/* Seller name */}
                      {product.seller && (
                        <p className="text-xs text-gray-500 mb-1">
                          by {product.seller.businessName || 
                              (product.seller.user?.firstName && product.seller.user?.lastName 
                                ? `${product.seller.user.firstName} ${product.seller.user.lastName}`
                                : product.seller.user?.name || 'Unknown Seller')}
                        </p>
                      )}
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
                      </div>
                      <button
                        onClick={(e) => quickAddToCart(product, e)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-medium"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : flashLoading ? (
            <ProductSkeleton count={8} variant="compact" />
          ) : (
            <div className="text-center text-gray-500 py-8">No flash sale products available</div>
          )}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Trophy className="mr-2 text-yellow-500" size={24} />
              Best Sellers
            </h2>
            <Link to="/products" className="text-red-500 hover:text-red-600 font-medium">
              View All <ArrowRight className="inline ml-1" size={16} />
            </Link>
          </div>

          {/* Best Sellers - Always show if data exists */}
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
              {bestSellers.slice(0, 12).map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group"
                >
                  <Link to={`/products/${product.id}`} className="block relative">
                    {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                        className="w-full h-32 sm:h-36 md:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                        />
                      ) : null}
                      <div className={`w-full h-32 sm:h-36 md:h-40 bg-gray-100 flex items-center justify-center ${product.images?.[0] ? 'hidden' : ''}`}>
                        <Package className="text-gray-400" size={24} />
                      </div>
                    
                    {/* Bestseller Badge */}
                    <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full font-bold">
                      #1 Choice
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button className="bg-white/80 hover:bg-white p-2 rounded-full mb-2 block" aria-label="Add to wishlist">
                        <Heart size={14} className="text-gray-600 hover:text-red-500" />
                      </button>
                      <button className="bg-white/80 hover:bg-white p-2 rounded-full block" aria-label="Quick view">
                        <Eye size={14} className="text-gray-600" />
                      </button>
                        </div>
                  </Link>
                  
                  <div className="p-4">
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
                      <div className="flex items-center justify-between mb-2">
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
                        <span className="text-xs text-gray-500 flex items-center">
                          <Users size={10} className="mr-1" />
                          {getSoldCount(product.id)} sold
                        </span>
                      </div>
                      <button
                        onClick={(e) => quickAddToCart(product, e)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-sm font-medium"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        Add to Cart
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : bestLoading ? (
            <ProductSkeleton count={12} />
          ) : (
            <div className="text-center text-gray-500 py-8">No best seller products available</div>
          )}
        </div>
      </section>

      {/* Latest Products Grid */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="mr-2 text-blue-500" size={24} />
              Just for You
            </h2>
          </div>

          {/* Latest Products - Always show if data exists */}
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3">
              {latestProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group"
                >
                  <Link to={`/products/${product.id}`} className="block relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                        <Package className="text-gray-400" size={20} />
                      </div>
                    )}
                    
                    {product.featured && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full font-bold text-[10px]">
                        Featured
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-2">
                    <Link to={`/products/${product.id}`}>
                      <div className="mb-1">
                        <h3 className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-tight">
                        {product.name}
                      </h3>
                      </div>
                      
                      {/* Seller name - hidden on small cards */}
                      {product.seller && (
                        <div className="mb-1 hidden sm:block">
                          <p className="text-[10px] text-gray-500 truncate">
                            by {product.seller.businessName || 
                                (product.seller.user?.firstName && product.seller.user?.lastName 
                                  ? `${product.seller.user.firstName} ${product.seller.user.lastName}`
                                  : product.seller.user?.name || 'Unknown Seller')}
                          </p>
                        </div>
                      )}
                      
                      <div className="mb-1">
                        <div className="flex-1">
                          <span className="text-sm font-bold text-red-600">
                            {formatPrice(product.salePrice || product.price)}
                              </span>
                          {product.salePrice && product.salePrice < product.price && (
                            <div className="text-[10px] text-gray-500 line-through">
                                {formatPrice(product.price)}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => quickAddToCart(product, e)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs font-medium"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={12} className="mr-1" />
                        Add to Cart
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : latestLoading ? (
            <ProductSkeleton count={20} />
          ) : (
            <div className="text-center text-gray-500 py-8">No products available</div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Truck className="text-blue-500 mb-2" size={32} />
              <h3 className="font-semibold text-gray-900">Fast Shipping</h3>
                              <p className="text-sm text-gray-600">Free shipping nationwide</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="text-green-500 mb-2" size={32} />
              <h3 className="font-semibold text-gray-900">Secure Payment</h3>
              <p className="text-sm text-gray-600">100% secure transactions</p>
            </div>
            <div className="flex flex-col items-center">
              <Gift className="text-purple-500 mb-2" size={32} />
              <h3 className="font-semibold text-gray-900">Daily Deals</h3>
              <p className="text-sm text-gray-600">New offers every day</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 