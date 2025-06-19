import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { formatPrice } from '../utils/currency';
import { getProductImageUrl } from '../utils/imageUtils';
import type { Product } from '../types/api';

interface SimilarProductsProps {
  currentProduct: Product;
  limit?: number;
}

const SimilarProducts: React.FC<SimilarProductsProps> = ({ currentProduct, limit = 8 }) => {
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadSimilarProducts();
  }, [currentProduct.id]);

  const loadSimilarProducts = async () => {
    try {
      setLoading(true);
      
      // First try to get products from the same category
      let response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?category=${currentProduct.categoryId}&limit=${limit * 2}&exclude=${currentProduct.id}`
      );
      
      let data = await response.json();
      let products = data.success ? data.data.products : [];

      // If we don't have enough products from the same category, get more from similar price range
      if (products.length < limit) {
        const priceMin = Math.max(0, currentProduct.price * 0.5);
        const priceMax = currentProduct.price * 1.5;
        
        const priceResponse = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?priceMin=${priceMin}&priceMax=${priceMax}&limit=${limit}&exclude=${currentProduct.id}`
        );
        
        const priceData = await priceResponse.json();
        if (priceData.success) {
          // Merge and deduplicate
          const existingIds = products.map((p: Product) => p.id);
          const additionalProducts = priceData.data.products.filter((p: Product) => !existingIds.includes(p.id));
          products = [...products, ...additionalProducts];
        }
      }

      // If still not enough, get random popular products
      if (products.length < limit) {
        const popularResponse = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?sortBy=rating&limit=${limit}&exclude=${currentProduct.id}`
        );
        
        const popularData = await popularResponse.json();
        if (popularData.success) {
          const existingIds = products.map((p: Product) => p.id);
          const additionalProducts = popularData.data.products.filter((p: Product) => !existingIds.includes(p.id));
          products = [...products, ...additionalProducts];
        }
      }

      // Sort by relevance (same category first, then by rating)
      products.sort((a: Product, b: Product) => {
        if (a.categoryId === currentProduct.categoryId && b.categoryId !== currentProduct.categoryId) return -1;
        if (b.categoryId === currentProduct.categoryId && a.categoryId !== currentProduct.categoryId) return 1;
        return (b.avgRating || 0) - (a.avgRating || 0);
      });

      setSimilarProducts(products.slice(0, limit));
    } catch (error) {
      console.error('Error loading similar products:', error);
    } finally {
      setLoading(false);
    }
  };



  const itemsPerView = 4;
  const maxIndex = Math.max(0, similarProducts.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
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

  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
        
        {/* Navigation arrows for desktop */}
        {similarProducts.length > itemsPerView && (
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next products"
            >
              <ChevronRight size={20} />
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
          {similarProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-1/4">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile Grid View */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        {similarProducts.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>

      {/* View All Link */}
      {similarProducts.length >= limit && (
        <div className="text-center mt-6">
          <Link
            to={`/products?category=${currentProduct.categoryId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            View All in {currentProduct.category?.name}
            <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const imageUrl = getProductImageUrl(product);
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercentage = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;
  const finalPrice = product.salePrice || product.price;

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
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
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
      <Link to={`/products/${product.id}`} className="block">
        {/* Product Image */}
        <div className={`relative ${compact ? 'h-32' : 'h-48'} bg-gray-50 overflow-hidden`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="text-gray-300" size={compact ? 24 : 32} />
            </div>
          )}
          
          {/* Badges */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              -{discountPercentage}%
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium text-sm">Out of Stock</span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
              isInWishlist(product.id)
                ? 'bg-red-100 text-red-600'
                : 'bg-white/80 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart size={14} className={isInWishlist(product.id) ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-3">
          <h3 className={`font-medium text-gray-900 group-hover:text-gray-700 transition-colors ${
            compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-1'
          } mb-1`}>
            {product.name}
          </h3>

          {/* Rating */}
          {product.avgRating > 0 && (
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.floor(product.avgRating) ? "text-yellow-400 fill-current" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({product.totalReviews})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <span className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
                {formatPrice(finalPrice)}
              </span>
              {hasDiscount && (
                <span className={`text-gray-500 line-through ${compact ? 'text-xs' : 'text-sm'}`}>
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center"
            >
              <ShoppingCart size={14} className="mr-1" />
              Add to Cart
            </button>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default SimilarProducts; 