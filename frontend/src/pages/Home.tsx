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
import { getProductImageUrl } from '../utils/imageUtils';
import ProductSkeleton from '../components/ProductSkeleton';
import { advertisementApi } from '../services/advertisementApi';
import type { Category, Product } from '../types/api';
import type { PromotedProduct } from '../services/advertisementApi';
import { getProductRating, calculateDiscount } from '../utils/productHelpers';
import banner1 from '../assets/banners/banner-1.png';
import banner2 from '../assets/banners/banner-2.png';
import banner3 from '../assets/banners/banner-3.png';
import banner4 from '../assets/banners/banner-4.png';
import banner5 from '../assets/banners/banner-5.png';

const Home: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [promotedProducts, setPromotedProducts] = useState<PromotedProduct[]>([]);
  const [promotedLoading, setPromotedLoading] = useState(true);
  
  // Flash sale timer with localStorage persistence
  const getFlashSaleEndTime = () => {
    try {
      const stored = localStorage.getItem('flashSaleEndTime');
      if (stored) {
        const endTime = new Date(stored);
        if (endTime > new Date()) {
          return endTime;
        }
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
    }
    
    // Create new end time (24 hours from now)
    const newEndTime = new Date();
    newEndTime.setHours(newEndTime.getHours() + 24);
    
    try {
      localStorage.setItem('flashSaleEndTime', newEndTime.toISOString());
    } catch (error) {
      console.warn('localStorage write failed:', error);
    }
    
    return newEndTime;
  };

  const calculateTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) {
      // Sale ended, create new one
      const newEndTime = new Date();
      newEndTime.setHours(newEndTime.getHours() + 24);
      
      try {
        localStorage.setItem('flashSaleEndTime', newEndTime.toISOString());
      } catch (error) {
        console.warn('localStorage write failed:', error);
      }
      
      return { hours: 23, minutes: 59, seconds: 59 };
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  };

  const [flashSaleTime, setFlashSaleTime] = useState(() => {
    try {
      const endTime = getFlashSaleEndTime();
      return calculateTimeRemaining(endTime);
    } catch (error) {
      console.warn('Flash sale timer initialization failed:', error);
      return { hours: 23, minutes: 59, seconds: 59 };
    }
  });

  const { prefetchEverything } = useGlobalPrefetch();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  // Mobile detection with safety check
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Prefetch everything for instant navigation - disabled on mobile to prevent crashes
  useEffect(() => {
    if (!isMobile) {
      prefetchEverything();
    }
  }, [prefetchEverything, isMobile]);

  // Banner rotation effect - reduce frequency on mobile
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const interval = isMobile ? 6000 : 4000; // Slower on mobile
    
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % 5);
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  // Flash sale countdown with persistence - reduce frequency on mobile
  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const interval = isMobile ? 5000 : 1000; // Update every 5 seconds on mobile vs 1 second on desktop
    
    const timer = setInterval(() => {
      try {
        const endTime = getFlashSaleEndTime();
        const newTime = calculateTimeRemaining(endTime);
        setFlashSaleTime(newTime);
      } catch (error) {
        console.warn('Flash sale timer update failed:', error);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, []);

  // Fetch promoted products for home page - with error handling
  useEffect(() => {
    const fetchPromotedProducts = async () => {
      setPromotedLoading(true);
      try {
        const response = await advertisementApi.getHomePageAds('HOME_FEATURED', 6);
        if (response?.success && response?.data) {
          setPromotedProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching promoted products:', error);
        setPromotedProducts([]); // Set empty array on error
      } finally {
        setPromotedLoading(false);
      }
    };

    // Add delay for mobile to prevent overwhelming
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const delay = isMobile ? 1000 : 0;
    
    const timeoutId = setTimeout(fetchPromotedProducts, delay);
    return () => clearTimeout(timeoutId);
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

  // Flash sale products with instant loading - reduced limit for mobile
  const { 
    products: flashProducts, 
    isInstantLoading: flashLoading,
    hasInstantData: hasFlashData
  } = useInstantProducts({
    limit: isMobile ? 4 : 8,
    sortBy: 'totalSales',
    sortOrder: 'desc',
  });

  // Best sellers with instant loading - reduced limit for mobile
  const { 
    products: bestSellers, 
    isInstantLoading: bestLoading,
    hasInstantData: hasBestData
  } = useInstantProducts({
    limit: isMobile ? 6 : 12,
    sortBy: 'featured',
    sortOrder: 'desc',
  });

  // Latest products with instant loading - reduced limit for mobile
  const { 
    products: latestProducts, 
    isInstantLoading: latestLoading,
    hasInstantData: hasLatestData,
    prefetchCategory
  } = useInstantProducts({
    limit: isMobile ? 10 : 20,
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
      title: "New Arrivals",
      subtitle: "Latest fashion and lifestyle essentials",
      image: banner1,
      cta: "Shop Now"
    },
    {
      title: "Winter Collection",
      subtitle: "Stay warm with premium outerwear",
      image: banner2,
      cta: "Explore"
    },
    {
      title: "Essential Style",
      subtitle: "Premium quality everyday fashion",
      image: banner3,
      cta: "Discover"
    },
    {
      title: "Active Lifestyle",
      subtitle: "Performance gear for every adventure",
      image: banner4,
      cta: "Shop Collection"
    },
    {
      title: "Premium Audio",
      subtitle: "Experience superior sound quality",
      image: banner5,
      cta: "Listen Now"
    }
  ];

  const quickAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addToCart(product);
    } catch (error) {
      console.error('Add to cart failed:', error);
    }
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
      // Don't show alert on mobile to prevent crashes
      if (!isMobile) {
        alert('Failed to update wishlist. Please try again.');
      }
    }
  };

  // Helper function to get product rating safely - now uses actual product data
  const getProductRating = (product: any) => {
    try {
      // Use actual product rating if available
      if (product?.avgRating && product.avgRating > 0) {
        return parseFloat(product.avgRating.toFixed(1));
      }
      return 0;
    } catch (error) {
      console.warn('Rating calculation failed:', error);
      return 0; // Default to 0 if no rating
    }
  };

  // Helper function to calculate discount safely
  const calculateDiscount = (originalPrice: number, salePrice?: number) => {
    try {
      if (!salePrice || salePrice >= originalPrice) return 0;
      return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    } catch (error) {
      console.warn('Discount calculation failed:', error);
      return 0;
    }
  };

  // Loading state component for mobile
  const MobileLoadingFallback = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center p-4">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Iwanyu Store...</h2>
        <p className="text-sm text-gray-600">Please wait while we prepare your shopping experience</p>
      </div>
    </div>
  );

  // Error fallback component
  const ErrorFallback = ({ error }: { error: Error }) => (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-red-500 text-2xl">⚠️</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-600 mb-4">We're having trouble loading the store. Please try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
        >
          Reload Page
        </button>
      </div>
    </div>
  );

  // Add error boundary wrapper using React Error Boundaries pattern
  const [hasError, setHasError] = useState(false);

  // Catch any errors during rendering
  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Home page error:', error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <ErrorFallback error={new Error('Component rendering error')} />;
  }

  // Show loading fallback on mobile if critical data is still loading
  if (isMobile && (promotedLoading || (!categories.length && !flashProducts.length && !bestSellers.length))) {
    return <MobileLoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalistic Hero Section - Mobile First */}
      <section className="relative">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Mobile: Banner carousel */}
          <div className="block md:hidden">
            <div className="relative h-48 rounded-lg overflow-hidden mb-6">
              {banners.map((banner, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: currentBanner === index ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <div className="relative w-full h-full">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    {/* Mobile overlay with smaller text */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="text-center text-white p-3">
                        <h1 className="text-lg font-bold mb-1 drop-shadow-lg">{banner.title}</h1>
                        <p className="text-xs mb-3 drop-shadow-md">{banner.subtitle}</p>
                        <Link 
                          to="/products" 
                          className="inline-flex items-center bg-white text-gray-900 px-3 py-1.5 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 text-xs"
                        >
                          {banner.cta} <ArrowRight className="ml-1" size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Mobile Banner Indicators */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {banners.map((_, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBanner(index)}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      currentBanner === index ? 'bg-white shadow-lg' : 'bg-white/50'
                    }`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Original layout */}
          <div className="hidden md:grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                      onMouseEnter={isMobile ? undefined : () => prefetchCategory(category.slug)}
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
                    className="absolute inset-0"
                  >
                    <div className="relative w-full h-full">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                      {/* Optional overlay for better text readability */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="text-center text-white p-4">
                          <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-2 md:mb-4 drop-shadow-lg">{banner.title}</h1>
                          <p className="text-sm md:text-xl mb-4 md:mb-8 drop-shadow-md">{banner.subtitle}</p>
                          <Link 
                            to="/products" 
                            className="inline-flex items-center bg-white text-gray-900 px-4 md:px-8 py-2 md:py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-200 text-sm md:text-base"
                          >
                            {banner.cta} <ArrowRight className="ml-2" size={16} />
                          </Link>
                        </div>
                      </div>
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
                        currentBanner === index ? 'bg-white shadow-lg' : 'bg-white/50'
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

      {/* Sponsored Products Section - Show on all devices */}
      {promotedProducts.length > 0 && (
        <section className="py-4 md:py-8 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center">
                <Star className="mr-2 text-blue-500" size={20} />
                Sponsored Products
              </h2>
              <span className="text-xs md:text-sm text-gray-500 bg-blue-100 px-2 md:px-3 py-1 rounded-full">
                Promoted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-4">
              {promotedProducts.map((product: PromotedProduct, index: number) => (
                <motion.div
                  key={product.id}
                  initial={isMobile ? {} : { opacity: 0, y: 20 }}
                  whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
                  transition={isMobile ? {} : { duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden"
                >
                  <Link 
                    to={`/products/${product.id}`} 
                    className="block"
                    onClick={() => advertisementApi.trackClick(product.adId)}
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className={`w-full h-24 md:h-48 object-contain p-1 md:p-2 ${isMobile ? '' : 'group-hover:scale-105'} transition-transform duration-300`}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                        onLoad={() => {
                          // Image loaded successfully - no action needed
                        }}
                      />
                      
                      {/* Discount Badge - Show on all devices */}
                      {calculateDiscount(product.price, product.salePrice) > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{calculateDiscount(product.price, product.salePrice)}%
                        </div>
                      )}
                      
                      {/* Quick Action Buttons - Desktop only */}
                      <div className="hidden md:flex absolute top-2 right-2 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-orange-50 transition-colors">
                          <Heart size={16} className="text-gray-600 hover:text-orange-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-3 sm:p-4">
                      <h3 className="font-medium text-base sm:text-sm text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg sm:text-base font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Stars - Show only if product has ratings */}
                      {(product as any).avgRating > 0 && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={i < Math.floor((product as any).avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">(({(product as any).avgRating.toFixed(1)}) {(product as any).totalReviews} reviews</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Sale Section - Show on all devices */}
      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-lg p-4 md:p-6 text-white mb-4 md:mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 md:space-x-4">
                <Fire className="text-yellow-300" size={24} />
                <div>
                  <h2 className="text-lg md:text-2xl font-bold">Flash Sale</h2>
                  <p className="text-red-100 text-sm md:text-base">Limited time offers</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-2 md:px-3 py-1 md:py-2">
                    <div className="text-lg md:text-2xl font-bold">{String(flashSaleTime.hours).padStart(2, '0')}</div>
                    <div className="text-xs">Hours</div>
                  </div>
                </div>
                <div className="text-lg md:text-2xl">:</div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-2 md:px-3 py-1 md:py-2">
                    <div className="text-lg md:text-2xl font-bold">{String(flashSaleTime.minutes).padStart(2, '0')}</div>
                    <div className="text-xs">Min</div>
                  </div>
                </div>
                <div className="text-lg md:text-2xl">:</div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-lg px-2 md:px-3 py-1 md:py-2">
                    <div className="text-lg md:text-2xl font-bold">{String(flashSaleTime.seconds).padStart(2, '0')}</div>
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
                        className="w-full h-24 object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-20 sm:h-24 md:h-36 bg-gray-100 flex items-center justify-center ${product.images?.[0] ? 'hidden' : ''}`}>
                      <Package className="text-gray-400" size={16} />
                    </div>
                    
                    {/* Flash Sale Badge */}
                    {(product.salePrice && product.salePrice < product.price) ? (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px]">
                        -{calculateDiscount(product.price, product.salePrice)}%
                      </div>
                    ) : (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold text-[10px]">
                        FLASH
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-1.5 md:p-3">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      {/* Seller name - remove 'Unknown Seller' fallback */}
                      {product.seller && (
                        <p className="text-xs text-gray-500 mb-1 hidden sm:block">
                          by {product.seller.businessName || 
                              (product.seller.user?.firstName && product.seller.user?.lastName 
                                ? `${product.seller.user.firstName} ${product.seller.user.lastName}`
                                : (product.seller.user?.name || 'Seller'))}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm sm:text-lg font-bold text-red-600">
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
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 px-2 rounded-lg mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs font-medium"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={14} className="mr-1" />
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

      {/* Best Sellers Section - Simplified for Mobile */}
      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center">
              <Trophy className="mr-2 text-yellow-500 hidden md:block" size={24} />
              Best Sellers
            </h2>
            <Link to="/products" className="text-red-500 hover:text-red-600 font-medium text-sm md:text-base">
              View All <ArrowRight className="inline ml-1" size={16} />
            </Link>
          </div>

          {/* Best Sellers - Clean Mobile Grid */}
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {bestSellers.slice(0, 8).map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={isMobile ? {} : { opacity: 0, y: 20 }}
                  whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
                  transition={isMobile ? {} : { duration: 0.4, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-lg md:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0] || '/placeholder-product.jpg'}
                        alt={product.name}
                        className={`w-full h-24 md:h-48 object-contain p-1 md:p-2 ${isMobile ? '' : 'group-hover:scale-105'} transition-transform duration-300`}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                        onLoad={() => {
                          // Image loaded successfully - no action needed
                        }}
                      />
                      
                      {/* Discount Badge - Show on all devices */}
                      {calculateDiscount(product.price, product.salePrice) > 0 && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{calculateDiscount(product.price, product.salePrice)}%
                        </div>
                      )}
                      
                      {/* Quick Action Buttons - Desktop only */}
                      <div className="hidden md:flex absolute top-2 right-2 flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-orange-50 transition-colors">
                          <Heart size={16} className="text-gray-600 hover:text-orange-500" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-2 md:p-4">
                      <h3 className="font-medium text-sm md:text-base text-gray-900 mb-1 md:mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      {/* Price display */}
                      <div className="text-sm md:text-lg font-bold text-red-600">
                        {formatPrice(product.salePrice || product.price)}
                      </div>
                    </div>
                  </Link>
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

      {/* Latest Products Grid - Show on all devices */}
      <section className="py-4 md:py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center">
              <Sparkles className="mr-2 text-blue-500" size={20} />
              Just for You
            </h2>
          </div>

          {/* Latest Products - Always show if data exists */}
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-3">
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
                        className="w-full h-24 object-contain p-1 group-hover:scale-105 transition-transform duration-300"
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
                  
                  <div className="p-1.5 md:p-3">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      {/* Seller name - remove 'Unknown Seller' fallback */}
                      {product.seller && (
                        <p className="text-xs text-gray-500 mb-1 hidden sm:block">
                          by {product.seller.businessName || 
                              (product.seller.user?.firstName && product.seller.user?.lastName 
                                ? `${product.seller.user.firstName} ${product.seller.user.lastName}`
                                : (product.seller.user?.name || 'Seller'))}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm sm:text-lg font-bold text-red-600">
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
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 px-2 rounded-lg mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center text-xs font-medium"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={14} className="mr-1" />
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

      {/* Trust Indicators - Simplified for Mobile */}
      <section className="py-6 md:py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 md:gap-6 text-center">
            <div className="flex flex-col items-center">
              <Truck className="text-blue-500 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Fast Shipping</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Free shipping nationwide</p>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="text-green-500 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Secure Payment</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">100% secure transactions</p>
            </div>
            <div className="flex flex-col items-center">
              <Gift className="text-purple-500 mb-2" size={24} />
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Daily Deals</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">New offers every day</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 