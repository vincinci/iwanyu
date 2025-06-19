import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Package, 
  ShoppingCart, 
  Plus,
  Star,
  Eye,
  Zap
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/currency';
import ProductSkeleton from './ProductSkeleton';
import type { Product, Category } from '../types/api';

interface CategorySectionProps {
  category: Category;
  products: Product[];
  isLoading: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  products,
  isLoading,
}) => {
  const { addToCart, isInCart, getItemQuantity } = useCart();

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <section className="py-8 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
            {category.description && (
              <p className="text-gray-600 text-sm hidden md:block">{category.description}</p>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <Zap size={12} className="text-gray-600 mr-1" />
              <span>Instant</span>
            </div>
          </div>
          <Link
            to={`/products?category=${category.slug}`}
            className="flex items-center text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Products Grid with Instant Loading */}
        {isLoading ? (
          <ProductSkeleton count={6} variant="compact" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.slice(0, 6).map((product: Product, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all duration-200 overflow-hidden group"
              >
                <div className="relative">
                  <Link to={`/products/${product.id}`}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                        loading={index < 3 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-100 flex items-center justify-center group-hover:bg-gray-150 transition-colors">
                        <Package className="text-gray-400" size={32} />
                      </div>
                    )}
                  </Link>
                  
                  {/* Enhanced Sale Badge */}
                  {product.salePrice && product.salePrice < product.price && (
                    <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                      -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                    </span>
                  )}

                  {/* Featured Badge */}
                  {product.featured && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-md">
                      <Zap size={8} className="inline mr-1" />
                      Featured
                    </span>
                  )}

                  {/* Stock Badge */}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Out of Stock
                    </span>
                  )}

                  {/* Enhanced Quick Add to Cart Button */}
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.stock === 0}
                    className="absolute bottom-2 right-2 bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110"
                    title={product.stock === 0 ? 'Out of stock' : 'Quick add to cart'}
                  >
                    {isInCart(product.id) ? (
                      <div className="flex items-center">
                        <ShoppingCart size={12} />
                        {getItemQuantity(product.id) > 1 && (
                          <span className="ml-1 text-xs font-bold">{getItemQuantity(product.id)}</span>
                        )}
                      </div>
                    ) : (
                      <Plus size={12} />
                    )}
                  </button>
                </div>
                
                <div className="p-4">
                  <Link to={`/products/${product.id}`} className="block">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-tight h-10 group-hover:text-gray-700 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Seller name */}
                    {product.seller && (
                      <p className="text-xs text-gray-500 mb-2">
                        by {product.seller.businessName || 
                            (product.seller.user?.firstName && product.seller.user?.lastName 
                              ? `${product.seller.user.firstName} ${product.seller.user.lastName}`
                              : (product.seller.user?.name || 'Seller'))}
                      </p>
                    )}
                    
                    {/* Enhanced Rating */}
                    {product.avgRating > 0 && (
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-600 ml-1">
                            {product.avgRating.toFixed(1)} ({product.totalReviews})
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Enhanced Price Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {product.salePrice && product.salePrice < product.price ? (
                          <>
                            <span className="text-sm font-bold text-red-600">
                              {formatPrice(product.salePrice)}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-800' 
                          : product.stock > 0 
                          ? 'bg-gray-100 text-gray-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 10 ? '✓' : product.stock > 0 ? product.stock : '✗'}
                      </span>
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Show more products indicator */}
        {products.length > 6 && (
          <div className="text-center mt-6">
            <Link
              to={`/products?category=${category.slug}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors"
            >
              <Plus size={14} className="mr-1" />
              View {products.length - 6} more products
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategorySection; 