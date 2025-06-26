import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Package, 
  ShoppingCart, 
  Plus,
  Star,
  Zap,
  Grid
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
    <section className="py-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <Grid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              {category.description && (
                <p className="text-gray-600 text-sm hidden md:block">{category.description}</p>
              )}
            </div>
            <div className="flex items-center text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              <Zap size={12} className="text-blue-600 mr-1" />
              <span className="font-medium">{products.length} items</span>
            </div>
          </div>
          <Link
            to={`/products?category=${category.slug}`}
            className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Browse Category <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Category Card - No Products Displayed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Explore {category.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  Discover amazing products in this category. Click to browse all available items.
                </p>
                
                {/* Category Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center text-blue-600">
                    <Package className="w-4 h-4 mr-1" />
                    <span>{products.length} products</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <Star className="w-4 h-4 mr-1" />
                    <span>Top rated</span>
                  </div>
                  <div className="flex items-center text-purple-600">
                    <Zap className="w-4 h-4 mr-1" />
                    <span>Instant delivery</span>
                  </div>
                </div>
              </div>
              
              <div className="ml-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <Grid className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 flex items-center space-x-3">
              <Link
                to={`/products?category=${category.slug}`}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 font-medium text-center transition-all duration-200 shadow-md hover:shadow-lg"
              >
                View All Products
              </Link>
              <button className="p-3 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategorySection; 