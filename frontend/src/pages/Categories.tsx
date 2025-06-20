import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Grid,
  Search,
  Filter,
  TrendingUp,
  ShoppingBag
} from 'lucide-react';
import { categoriesApi } from '../services/api';
import CategoryCard from '../components/CategoryCard';
import type { Category } from '../types/api';

const Categories: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const { data: categoriesData, isLoading} = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const categories = categoriesData?.data?.categories || [];

  // Filter categories based on search term
  const filteredCategories = categories.filter((category: Category) => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Categories</h2>
          <p className="text-gray-600 mb-4">We couldn't load the categories. Please try again.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Shop by Category
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover amazing products across all our categories
            </p>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500 text-white shadow-lg' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {filteredCategories.filter((cat: Category) => cat.level === 0).length}
              </div>
              <div className="text-sm text-gray-600">Main Categories</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-bold text-emerald-600 mb-1">
                {filteredCategories.filter((cat: Category) => cat.level === 1).length}
              </div>
              <div className="text-sm text-gray-600">Subcategories</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {filteredCategories.reduce((sum: number, cat: Category) => sum + (cat._count?.products || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
              <div className="text-2xl font-bold text-rose-600 mb-1">
                {filteredCategories.filter((cat: Category) => (cat._count?.products || 0) > 10).length}
              </div>
              <div className="text-sm text-gray-600">Popular</div>
            </div>
          </div>
        </motion.div>

        {/* Categories Display */}
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-12 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}
            >
              {filteredCategories
                .filter((category: Category) => category.level === 0 && (category._count?.products || 0) > 0)
                .map((category: Category, index: number) => {
                  const subcategories = filteredCategories.filter((subcat: Category) => 
                    subcat.parentId === category.id && (subcat._count?.products || 0) > 0
                  );
                  
                  return (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      subcategories={subcategories}
                      index={index}
                      viewMode={viewMode}
                      isExpanded={expandedCategory === category.id}
                      onToggleExpanded={setExpandedCategory}
                    />
                  );
                })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* No categories found */}
        {!isLoading && filteredCategories.filter((cat: Category) => cat.level === 0).length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No categories found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `No categories match "${searchTerm}". Try adjusting your search.`
                : 'Categories will appear here once they are added.'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Categories; 