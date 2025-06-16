import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ArrowRight, 
  Grid, 
  Tag,
  Smartphone,
  Shirt,
  Car,
  Sparkles,
  Home,
  Trophy,
  BookOpen,
  Gamepad2
} from 'lucide-react';
import { categoriesApi } from '../services/api';
import type { Category } from '../types/api';

const Categories: React.FC = () => {
  const { data: categoriesData, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const categories = categoriesData?.data?.categories || [];

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electronics')) return Smartphone;
    if (name.includes('fashion')) return Shirt;
    if (name.includes('automotive')) return Car;
    if (name.includes('beauty')) return Sparkles;
    if (name.includes('home')) return Home;
    if (name.includes('sports')) return Trophy;
    if (name.includes('books')) return BookOpen;
    if (name.includes('toys')) return Gamepad2;
    return Package;
  };

  const renderCategoryIcon = (categoryName: string, size: number = 24) => {
    const IconComponent = getCategoryIcon(categoryName);
    return <IconComponent size={size} className="text-white" />;
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-teal-500 to-teal-600',
    ];
    return colors[index % colors.length];
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error Loading Categories</h2>
          <p className="text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            All Categories
          </h1>
          <p className="text-sm text-gray-600">
            Browse products by category
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse border border-gray-200">
                <div className="bg-gray-300 h-12 w-12 rounded mb-3 mx-auto"></div>
                <div className="bg-gray-300 h-4 rounded mb-2"></div>
                <div className="bg-gray-300 h-3 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category: Category, index: number) => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug}`}
                className="block bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 overflow-hidden"
              >
                {/* Category Header */}
                <div className={`bg-gradient-to-br ${getCategoryColor(index)} p-4 text-white text-center`}>
                  <div className="mb-2">
                    {renderCategoryIcon(category.name)}
                  </div>
                  <h3 className="text-sm font-semibold">{category.name}</h3>
                </div>

                {/* Category Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <span className="flex items-center">
                      <Package size={12} className="mr-1" />
                      Browse Products
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3 line-clamp-2">
                    {category.description || 'Explore our collection in this category'}
                  </div>
                  
                  <div className="flex items-center justify-center text-orange-500 text-xs font-medium">
                    Browse Products
                    <ArrowRight size={12} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No categories found */}
        {!isLoading && categories.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600">Categories will appear here once they are added.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 