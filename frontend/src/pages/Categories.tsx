import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ArrowRight,
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
  const [error, setError] = useState<string | null>(null);
  const { data: categoriesData, isLoading} = useQuery({
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
      'from-gray-600 to-gray-700',
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
          <div className="space-y-8">
            {categories
              .filter((category: Category) => category.level === 0 && (category._count?.products || 0) > 0) // Show only main categories with products
              .map((category: Category, index: number) => {
                const subcategories = categories.filter((subcat: Category) => 
                  subcat.parentId === category.id && (subcat._count?.products || 0) > 0
                ); // Only show subcategories with products
                return (
                  <div key={category.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Main Category Header */}
                    <div className={`bg-gradient-to-br ${getCategoryColor(index)} p-6 text-white`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                          {renderCategoryIcon(category.name, 40)}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-xl font-bold mb-2">{category.name}</h2>
                          <p className="text-white/80 text-sm">
                            {category.description || 'Explore our collection in this category'}
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-white/90">
                            <span>{subcategories.length} subcategories</span>
                          </div>
                        </div>
              <Link
                to={`/products?category=${category.slug}`}
                          className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-lg font-medium"
                        >
                          View All
                        </Link>
                  </div>
                </div>

                    {/* Subcategories Grid */}
                    {subcategories.length > 0 && (
                      <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {subcategories
                            .sort((a: Category, b: Category) => a.sortOrder - b.sortOrder)
                            .map((subcategory: Category) => (
                              <Link
                                key={subcategory.id}
                                to={`/products?category=${subcategory.slug}`}
                                className="group p-4 border border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-100/50 transition-all duration-200"
                              >
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors">
                                    {renderCategoryIcon(subcategory.name, 20)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors truncate">
                                      {subcategory.name}
                                    </h3>
                                  </div>
                  </div>
                  
                                <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors mb-3">
                                  {subcategory.description || 'Browse products in this category'}
                  </div>
                  
                                <div className="flex items-center justify-end">
                                  <ArrowRight size={12} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </div>
                              </Link>
                            ))
                          }
                        </div>
                      </div>
                    )}

                    {/* Empty state for categories with no subcategories */}
                    {subcategories.length === 0 && (
                      <div className="p-6 text-center text-gray-500">
                        <Package size={24} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No subcategories yet</p>
                        <Link
                          to={`/products?category=${category.slug}`}
                          className="inline-flex items-center mt-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
                        >
                    Browse Products
                    <ArrowRight size={12} className="ml-1" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
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