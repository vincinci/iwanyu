import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Package, 
  ArrowLeft,
  Star,
  Users
} from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/currency';
import type { WishlistItem } from '../services/wishlistApi';

const Wishlist: React.FC = () => {
  const { user } = useAuth();
  const { items, isLoading, removeFromWishlist, moveToCart, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Helper function to get product rating from actual data
  const getProductRating = (product: any) => {
    // Use actual product rating if available
    if (product?.avgRating && product.avgRating > 0) {
      return parseFloat(product.avgRating.toFixed(1));
    }
    return 0;
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    try {
      await moveToCart(item.productId, 1);
      // Also add to cart context for immediate UI update
      addToCart(item.product);
    } catch (error) {
      console.error('Failed to move to cart:', error);
    }
  };

  const handleClearWishlist = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await clearWishlist();
      } catch (error) {
        console.error('Failed to clear wishlist:', error);
      }
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-600 mb-6">Save items you love and access them anywhere</p>
          <Link
            to="/login"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg border">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save items you love and easily find them later</p>
          <Link
            to="/products"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 flex items-center">
              <Heart className="mr-2 text-red-500" size={20} />
              My Wishlist
            </h1>
            <p className="text-gray-600 text-sm md:text-base">{items.length} {items.length === 1 ? 'item' : 'items'} saved</p>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <Link
              to="/products"
              className="flex items-center text-red-500 hover:text-red-600 transition-colors duration-200 text-sm md:text-base"
            >
              <ArrowLeft className="mr-1" size={16} />
              Continue Shopping
            </Link>
            {items.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors duration-200"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Wishlist Items - Mobile responsive grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <Link to={`/products/${item.product.id}`} className="block relative">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-20 md:h-24 object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-20 md:h-24 bg-gray-100 flex items-center justify-center">
                      <Package className="text-gray-400" size={16} />
                    </div>
                  )}
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFromWishlist(item.productId);
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </Link>
                
                <div className="p-2">
                  <Link to={`/products/${item.product.id}`}>
                    <h3 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {item.product.name}
                    </h3>
                    
                    {/* Price and Add to Cart */}
                    <div className="text-center mb-2">
                      <div className="text-sm font-bold text-red-600">
                        {formatPrice(item.product.salePrice || item.product.price)}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMoveToCart(item);
                        }}
                        className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 w-full justify-center"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart size={12} />
                        <span>Add</span>
                      </button>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link
            to="/products"
            className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 