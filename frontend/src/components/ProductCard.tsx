import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../types/api';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    id,
    name,
    slug,
    image,
    price,
    salePrice,
    avgRating,
    totalReviews,
    totalSales,
    stock
  } = product;

  const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : null;
  const finalPrice = salePrice || price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <Link to={`/products/${slug}`} className="block">
        <div className="relative aspect-square">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {discount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
              -{discount}%
            </div>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{name}</h3>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-sm text-gray-600">
                {avgRating?.toFixed(1) || 'New'}
              </span>
              {totalReviews > 0 && (
                <span className="text-sm text-gray-500">({totalReviews})</span>
              )}
            </div>
            {totalSales > 0 && (
              <span className="text-sm text-gray-500">{totalSales} sold</span>
            )}
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl font-bold">${finalPrice.toFixed(2)}</span>
            {salePrice && (
              <span className="text-sm text-gray-500 line-through">
                ${price.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart size={16} className="mr-2" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard; 