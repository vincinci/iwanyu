import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Plus,
  Monitor,
  Headphones,
  Camera,
  Watch,
  Laptop,
  Tablet,
  Baby,
  PawPrint,
  Hammer,
  Palette,
  Music,
  Dumbbell,
  Apple,
  UtensilsCrossed,
  Flower,
  Briefcase,
  MapPin,
  Coffee,
  Footprints,
  Glasses,
  Gem,
  Bike,
  Plane,
  Mountain,
  Zap
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
import ModernBanner from '../components/ModernBanner';

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

  // Add loading timeout for mobile
  const [showContent, setShowContent] = useState(false);

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

  // Force show content after timeout to prevent infinite loading
  useEffect(() => {
    if (isMobile) {
      // Show content immediately if we have any data
      if (categories.length > 0 || flashProducts.length > 0 || bestSellers.length > 0) {
        setShowContent(true);
        return;
      }
      
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 1500); // Reduced to 1.5 seconds max
      
      return () => clearTimeout(timer);
    } else {
      setShowContent(true);
    }
  }, [isMobile, categories.length, flashProducts.length, bestSellers.length]);

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

  const getCategoryIcon = useCallback((categoryName: string) => {
    const name = categoryName.toLowerCase();
    
    // Electronics & Technology
    if (name.includes('electronics') || name.includes('electronic')) return Monitor;
    if (name.includes('mobile') || name.includes('phone') || name.includes('smartphone')) return Smartphone;
    if (name.includes('computer') || name.includes('pc') || name.includes('desktop')) return Monitor;
    if (name.includes('laptop') || name.includes('notebook')) return Laptop;
    if (name.includes('tablet') || name.includes('ipad')) return Tablet;
    if (name.includes('headphone') || name.includes('earphone') || name.includes('audio')) return Headphones;
    if (name.includes('camera') || name.includes('photo')) return Camera;
    if (name.includes('watch') || name.includes('smartwatch')) return Watch;
    if (name.includes('gaming') || name.includes('console') || name.includes('game')) return Gamepad2;
    
    // Fashion & Apparel
    if (name.includes('fashion') || name.includes('clothing') || name.includes('apparel')) return Shirt;
    if (name.includes('shirt') || name.includes('top') || name.includes('blouse')) return Shirt;
    if (name.includes('dress') || name.includes('gown')) return Shirt;
    if (name.includes('pants') || name.includes('jeans') || name.includes('trouser')) return Shirt;
    if (name.includes('shoes') || name.includes('sneakers') || name.includes('footwear')) return Footprints;
    if (name.includes('bag') || name.includes('handbag') || name.includes('purse')) return Briefcase;
    if (name.includes('jewelry') || name.includes('jewellery') || name.includes('accessory')) return Gem;
    if (name.includes('watch') && name.includes('fashion')) return Watch;
    if (name.includes('glasses') || name.includes('sunglasses')) return Glasses;
    
    // Home & Garden
    if (name.includes('home') || name.includes('house') || name.includes('furniture')) return HomeIcon;
    if (name.includes('garden') || name.includes('outdoor') || name.includes('plant')) return Flower;
    if (name.includes('kitchen') || name.includes('cooking') || name.includes('utensil')) return UtensilsCrossed;
    if (name.includes('tool') || name.includes('hardware') || name.includes('diy')) return Hammer;
    
    // Sports & Fitness
    if (name.includes('sports') || name.includes('sport') || name.includes('fitness')) return Trophy;
    if (name.includes('gym') || name.includes('workout') || name.includes('exercise')) return Dumbbell;
    if (name.includes('bike') || name.includes('bicycle') || name.includes('cycling')) return Bike;
    if (name.includes('outdoor') || name.includes('hiking') || name.includes('camping')) return Mountain;
    
    // Automotive
    if (name.includes('automotive') || name.includes('auto') || name.includes('car')) return Car;
    if (name.includes('motor') || name.includes('vehicle')) return Car;
    
    // Beauty & Health
    if (name.includes('beauty') || name.includes('cosmetic') || name.includes('makeup')) return Sparkles;
    if (name.includes('health') || name.includes('medical') || name.includes('wellness')) return Shield;
    
    // Books & Media
    if (name.includes('books') || name.includes('book') || name.includes('reading')) return BookOpen;
    if (name.includes('music') || name.includes('instrument') || name.includes('audio')) return Music;
    
    // Food & Beverage
    if (name.includes('food') || name.includes('grocery') || name.includes('snack')) return Apple;
    if (name.includes('drink') || name.includes('beverage') || name.includes('coffee')) return Coffee;
    
    // Baby & Kids
    if (name.includes('baby') || name.includes('infant') || name.includes('toddler')) return Baby;
    if (name.includes('kids') || name.includes('children') || name.includes('toy')) return Gamepad2;
    
    // Pets
    if (name.includes('pet') || name.includes('dog') || name.includes('cat') || name.includes('animal')) return PawPrint;
    
    // Art & Crafts
    if (name.includes('art') || name.includes('craft') || name.includes('paint') || name.includes('creative')) return Palette;
    
    // Business & Office
    if (name.includes('office') || name.includes('business') || name.includes('work')) return Briefcase;
    
    // Travel & Luggage
    if (name.includes('travel') || name.includes('luggage') || name.includes('suitcase')) return Plane;
    if (name.includes('map') || name.includes('location') || name.includes('gps')) return MapPin;
    
    // General categories
    if (name.includes('general') || name.includes('misc') || name.includes('other')) return Package;
    
    // Default fallback
    return Package;
  }, []);

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

  const quickBuyNow = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to checkout with this product
    window.open(`/checkout?product=${product.id}&quantity=1`, '_blank');
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
        <div className="w-16 h-16 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
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

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Hero Section with Modern Banner */}
      <section className="relative">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Mobile: Modern Banner */}
          <div className="block md:hidden">
            <ModernBanner banners={banners} isMobile={true} className="mb-6" />
          </div>

          {/* Desktop: Layout with Categories and Modern Banner */}
          <div className="hidden md:grid grid-cols-1 gap-6">
            {/* Main Modern Banner */}
            <div className="col-span-1">
              <ModernBanner banners={banners} isMobile={false} />
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

            {/* Sponsored Products - 3 rows of 6 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {promotedProducts.slice(0, 18).map((product: PromotedProduct, index: number) => (
                  <motion.div
                  key={product.id}
                  initial={isMobile ? {} : { opacity: 0, y: 20 }}
                  whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
                  transition={isMobile ? {} : { duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-300 overflow-hidden"
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
                        className="w-full h-20 md:h-24 object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                      
                      {/* Discount Badge */}
                      {calculateDiscount(product.price, product.salePrice) > 0 && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded text-[10px]">
                          -{calculateDiscount(product.price, product.salePrice)}%
                        </div>
                      )}
                    </div>
                    
                    <div className="p-2">
                      <h3 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="text-sm font-bold text-gray-900">
                        {formatPrice(product.price)}
                </div>
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

          {/* Flash Sale Products - 3 rows of 6 */}
          {flashProducts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {flashProducts.slice(0, 18).map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border hover:shadow-md transition-all duration-200 overflow-hidden group relative"
                >
                  <Link to={`/products/${product.id}`}>
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-20 md:h-24 object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-20 md:h-24 bg-gray-100 flex items-center justify-center ${product.images?.[0] ? 'hidden' : ''}`}>
                      <Package className="text-gray-400" size={16} />
                      </div>
                    
                    {/* Flash Sale Badge */}
                    {(product.salePrice && product.salePrice < product.price) ? (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded font-bold text-[10px]">
                        -{calculateDiscount(product.price, product.salePrice)}%
                      </div>
                    ) : (
                      <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded font-bold text-[10px]">
                        FLASH
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-2">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="text-sm font-bold text-red-600 mb-2 text-center">
                            {formatPrice(product.salePrice || product.price)}
                            </div>
                      <div className="space-y-1.5">
                        <button
                          onClick={(e) => quickAddToCart(product, e)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 w-full justify-center"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={12} />
                          <span>Cart</span>
                        </button>
                        <button
                          onClick={(e) => quickBuyNow(product, e)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 w-full justify-center"
                          aria-label="Buy now"
                        >
                          <Zap size={12} />
                          <span>Buy</span>
                        </button>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : flashLoading ? (
            <ProductSkeleton count={18} variant="compact" />
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
              <Trophy className="mr-2 text-gray-500 hidden md:block" size={24} />
              Best Sellers
            </h2>
            <Link to="/products" className="text-red-500 hover:text-red-600 font-medium text-sm md:text-base">
              View All <ArrowRight className="inline ml-1" size={16} />
            </Link>
          </div>

          {/* Best Sellers - 3 rows of 6 */}
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {bestSellers.slice(0, 18).map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={isMobile ? {} : { opacity: 0, y: 20 }}
                  whileInView={isMobile ? {} : { opacity: 1, y: 0 }}
                  transition={isMobile ? {} : { duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                        className="w-full h-20 md:h-24 object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-product.jpg';
                        }}
                      />
                      
                      {/* Discount Badge */}
                      {calculateDiscount(product.price, product.salePrice) > 0 && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1 py-0.5 rounded text-[10px]">
                          -{calculateDiscount(product.price, product.salePrice)}%
                      </div>
                    )}
                    </div>
                    
                    <div className="p-2">
                      <h3 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="text-sm font-bold text-red-600 mb-2 text-center">
                        {formatPrice(product.salePrice || product.price)}
                      </div>
                      <div className="space-y-1.5">
                        <button
                          onClick={(e) => quickAddToCart(product, e)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 w-full justify-center"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={12} />
                          <span>Cart</span>
                        </button>
                        <button
                          onClick={(e) => quickBuyNow(product, e)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 w-full justify-center"
                          aria-label="Buy now"
                        >
                          <Zap size={12} />
                          <span>Buy</span>
                        </button>
                      </div>
                      </div>
                    </Link>
                </motion.div>
              ))}
            </div>
          ) : bestLoading ? (
            <ProductSkeleton count={18} />
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

          {/* Latest Products - 3 rows of 6 */}
          {latestProducts.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
              {latestProducts.slice(0, 18).map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="bg-white rounded-lg border hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  <Link to={`/products/${product.id}`} className="block relative">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-20 md:h-24 object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-20 md:h-24 bg-gray-100 flex items-center justify-center">
                        <Package className="text-gray-400" size={16} />
                      </div>
                    )}
                    
                    {product.featured && (
                      <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded font-bold text-[10px]">
                        Featured
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-2">
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="text-sm font-bold text-red-600 mb-2 text-center">
                        {formatPrice(product.salePrice || product.price)}
                      </div>
                      <div className="space-y-1.5">
                        <button
                          onClick={(e) => quickAddToCart(product, e)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 w-full justify-center"
                          aria-label="Add to cart"
                        >
                          <ShoppingCart size={12} />
                          <span>Cart</span>
                        </button>
                        <button
                          onClick={(e) => quickBuyNow(product, e)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 w-full justify-center"
                          aria-label="Buy now"
                        >
                          <Zap size={12} />
                          <span>Buy</span>
                        </button>
                      </div>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : latestLoading ? (
            <ProductSkeleton count={18} />
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