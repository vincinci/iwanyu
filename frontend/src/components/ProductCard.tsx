import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, Heart } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { getProductImageUrl } from '../utils/imageUtils';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const {
    id,
    name,
    slug,
    price,
    salePrice,
    avgRating,
    totalReviews,
    stock
  } = product;

  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : null;
  const finalPrice = salePrice || price;
  const imageUrl = getProductImageUrl(product);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
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
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-200 ${
        compact ? 'max-w-[180px]' : 'max-w-[220px]'
      }`}
    >
      <Link to={`/products/${slug || id}`} className="block">
        <div className={`relative ${compact ? 'h-32' : 'h-40'} bg-gray-50`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-contain p-2"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-gray-300 text-4xl">📦</div>
            </div>
          )}
          {discount && (
            <div className="absolute top-1 left-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
              -{discount}%
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-1 right-1 p-1.5 rounded-full transition-colors ${
              isInWishlist(product.id)
                ? 'bg-red-100 text-red-600'
                : 'bg-white/80 text-gray-600 hover:bg-red-100 hover:text-red-600'
            }`}
          >
            <Heart size={14} className={isInWishlist(product.id) ? 'fill-current' : ''} />
          </button>
          
          {stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium text-sm">Out of Stock</span>
            </div>
          )}
        </div>
        <div className={`p-3 ${compact ? 'p-2' : 'p-3'}`}>
          <h3 className={`font-medium text-gray-900 line-clamp-2 mb-2 ${
            compact ? 'text-xs leading-tight' : 'text-sm'
          }`}>
            {name}
          </h3>
          {!compact && avgRating > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              <span className="text-yellow-400 text-sm">★</span>
              <span className="text-xs text-gray-600">
                {avgRating?.toFixed(1)}
              </span>
              {totalReviews > 0 && (
                <span className="text-xs text-gray-500">({totalReviews})</span>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2 mb-3">
            <span className={`font-bold text-black ${compact ? 'text-sm' : 'text-base'}`}>
              {formatPrice(finalPrice)}
            </span>
            {salePrice && (
              <span className={`text-gray-500 line-through ${compact ? 'text-xs' : 'text-sm'}`}>
                {formatPrice(price)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className={`px-3 pb-3 ${compact ? 'px-2 pb-2' : 'px-3 pb-3'}`}>
        {stock > 0 ? (
          <button
            onClick={handleAddToCart}
            className={`w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center font-medium ${
              compact ? 'py-1.5 text-xs' : 'py-2 text-sm'
            }`}
          >
            <ShoppingCart size={compact ? 12 : 14} className="mr-1" />
            {compact ? 'Add to Cart' : 'Add to Cart'}
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={stock === 0}
            className={`w-full bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              compact ? 'py-1.5 text-xs' : 'py-2 text-sm'
            }`}
          >
            <ShoppingCart size={compact ? 12 : 14} className="mr-1" />
            {compact ? 'Add' : 'Add to Cart'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard; 