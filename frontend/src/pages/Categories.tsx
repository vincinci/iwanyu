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