import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight,
  Grid,
  ShoppingBag,
  TrendingUp,
  Package,
  Smartphone,
  Shirt,
  Car,
  Sparkles,
  Home,
  Trophy,
  BookOpen,
  Gamepad2,
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
  Shield,
  Coffee,
  Footprints,
  Glasses,
  Gem,
  Bike,
  Plane,
  Mountain
} from 'lucide-react';
import type { Category } from '../types/api';

interface CategoryCardProps {
  category: Category;
  subcategories: Category[];
  index: number;
  viewMode: 'grid' | 'list';
  isExpanded: boolean;
  onToggleExpanded: (categoryId: string | null) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  subcategories,
  index,
  viewMode,
  isExpanded,
  onToggleExpanded,
}) => {
  const getCategoryIcon = (categoryName: string) => {
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
    if (name.includes('home') || name.includes('house') || name.includes('furniture')) return Home;
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
  };

  const renderCategoryIcon = (categoryName: string, size: number = 32) => {
    const IconComponent = getCategoryIcon(categoryName);
    return <IconComponent size={size} />;
  };

  const getCategoryGradient = (index: number) => {
    const gradients = [
      'from-blue-500 via-blue-600 to-blue-700',
      'from-emerald-500 via-emerald-600 to-emerald-700',
      'from-purple-500 via-purple-600 to-purple-700',
      'from-rose-500 via-rose-600 to-rose-700',
      'from-amber-500 via-amber-600 to-amber-700',
      'from-pink-500 via-pink-600 to-pink-700',
      'from-indigo-500 via-indigo-600 to-indigo-700',
      'from-teal-500 via-teal-600 to-teal-700',
      'from-orange-500 via-orange-600 to-orange-700',
      'from-cyan-500 via-cyan-600 to-cyan-700',
    ];
    return gradients[index % gradients.length];
  };

  const productCount = category._count?.products || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 ${
        viewMode === 'list' ? 'flex' : ''
      }`}
    >
      {/* Main Category Section */}
      <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
        <div className={`bg-gradient-to-br ${getCategoryGradient(index)} p-6 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className={`relative z-10 ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}>
            <div className={`${viewMode === 'list' ? 'w-16 h-16' : 'w-20 h-20 mb-4'} bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center`}>
              {renderCategoryIcon(category.name, viewMode === 'list' ? 32 : 40)}
            </div>
            
            <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
              <h2 className={`${viewMode === 'list' ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>
                {category.name}
              </h2>
              <p className="text-white/90 text-sm mb-3 line-clamp-2">
                {category.description || 'Discover amazing products in this category'}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-white/80">
                <div className="flex items-center space-x-1">
                  <ShoppingBag className="w-4 h-4" />
                  <span>{productCount} products</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Grid className="w-4 h-4" />
                  <span>{subcategories.length} subcategories</span>
                </div>
                {productCount > 50 && (
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>Popular</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className={`${viewMode === 'list' ? 'flex items-center space-x-2' : 'flex justify-between items-center mt-4'}`}>
              <Link
                to={`/products?category=${category.slug}`}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {subcategories.length > 0 && (
                <button
                  onClick={() => onToggleExpanded(isExpanded ? null : category.id)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-lg transition-all duration-200"
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ArrowRight className="w-4 h-4 transform rotate-90" />
                  </motion.div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <AnimatePresence>
          {subcategories.length > 0 && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Grid className="w-5 h-5 mr-2 text-gray-600" />
                  Subcategories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subcategories
                    .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)
                    .map((subcategory: Category, subIndex: number) => (
                      <motion.div
                        key={subcategory.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: subIndex * 0.1 }}
                      >
                        <Link
                          to={`/products?category=${subcategory.slug}`}
                          className="group flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-blue-50 group-hover:to-blue-100 transition-all duration-200">
                            {renderCategoryIcon(subcategory.name, 20)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                              {subcategory.name}
                            </h4>
                            <p className="text-sm text-gray-500 truncate">
                              {subcategory._count?.products || 0} products
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </Link>
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state for categories with no subcategories */}
        {subcategories.length === 0 && (
          <div className="p-6 text-center bg-gray-50">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-3">No subcategories available</p>
            <Link
              to={`/products?category=${category.slug}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Browse Products
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CategoryCard; 