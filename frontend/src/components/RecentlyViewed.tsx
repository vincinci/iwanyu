import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Package, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/currency';
import { getProductImageUrl } from '../utils/imageUtils';
import type { Product } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RecentlyViewedProps {
  currentProductId?: string;
  limit?: number;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ currentProductId, limit = 6 }) => {
  const { user } = useAuth();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadRecentlyViewed();
  }, [user, currentProductId]);

  const loadRecentlyViewed = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // For logged-in users, get from database
        const response = await fetch(`${API_BASE_URL}/users/recently-viewed?limit=${limit}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Filter out current product if provided
            const filteredProducts = currentProductId 
              ? data.data.products.filter((p: Product) => p.id !== currentProductId)
              : data.data.products;
            setRecentProducts(filteredProducts);
          }
        }
      } else {
        // For guests, get from localStorage
        const recentlyViewedIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        
        if (recentlyViewedIds.length > 0) {
          // Filter out current product
          const filteredIds = currentProductId 
            ? recentlyViewedIds.filter((id: string) => id !== currentProductId)
            : recentlyViewedIds;
            
          if (filteredIds.length > 0) {
            // Fetch product details
            const productPromises = filteredIds.slice(0, limit).map(async (id: string) => {
              try {
                const response = await fetch(`${API_BASE_URL}/products/${id}`);
                if (response.ok) {
                  const data = await response.json();
                  return data.success ? data.data.product : null;
                }
              } catch (error) {
                console.error('Error fetching product:', error);
                return null;
              }
            });
            
            const products = await Promise.all(productPromises);
            setRecentProducts(products.filter(Boolean));
          }
        }
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };



  const itemsPerView = 3;
  const maxIndex = Math.max(0, recentProducts.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Clock className="text-gray-500 mr-2" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Clock className="text-gray-500 mr-2" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
        </div>
        
        {/* Navigation arrows for desktop */}
        {recentProducts.length > itemsPerView && (
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next products"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Desktop Slider View */}
      <div className="hidden md:block relative overflow-hidden">
        <motion.div
          className="flex space-x-4"
          animate={{ x: -currentIndex * (100 / itemsPerView) + '%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {recentProducts.map((product) => (
            <div key={(product as any).id} className="flex-shrink-0 w-1/3">
              <RecentProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile Grid View */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {recentProducts.slice(0, 4).map((product) => (
          <RecentProductCard key={(product as any).id} product={product} compact />
        ))}
      </div>
    </div>
  );
};

// Recent Product Card Component
interface RecentProductCardProps {
  product: Product;
  compact?: boolean;
}

const RecentProductCard: React.FC<RecentProductCardProps> = ({ product, compact = false }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const imageUrl = getProductImageUrl(product);
  const hasDiscount = (product as any).salePrice && (product as any).salePrice < (product as any).price;
  const discountPercentage = hasDiscount ? Math.round((((product as any).price - (product as any).salePrice!) / (product as any).price) * 100) : 0;
  const finalPrice = (product as any).salePrice || (product as any).price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isInWishlist((product as any).id)) {
        await removeFromWishlist((product as any).id);
      } else {
        await addToWishlist((product as any).id);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <Link to={`/products/${(product as any).id}`} className="block">
        {/* Product Image */}
        <div className={`relative ${compact ? 'h-24' : 'h-32'} bg-gray-50 overflow-hidden`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={(product as any).name}
              className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="text-gray-300" size={compact ? 16 : 20} />
            </div>
          )}
          
          {/* Badges */}
          {hasDiscount && (
            <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-1 right-1 p-1 rounded-full transition-colors ${
              isInWishlist((product as any).id)
                ? 'bg-red-100 text-red-600'
                : 'bg-white/80 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart size={12} className={isInWishlist((product as any).id) ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-2">
          <h3 className={`font-medium text-gray-900 group-hover:text-gray-700 transition-colors ${
            compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-1'
          } mb-1`}>
            {(product as any).name}
          </h3>

          {/* Rating */}
          {(product as any).avgRating > 0 && (
            <div className="flex items-center mb-1">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={10}
                    className={i < Math.floor((product as any).avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({(product as any).totalReviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <span className={`font-bold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span className={`text-gray-500 line-through ${compact ? 'text-xs' : 'text-xs'}`}>
                  {formatPrice((product as any).price)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(product as any).stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1.5 px-2 rounded text-xs font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <ShoppingCart size={12} />
            </button>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default RecentlyViewed; 