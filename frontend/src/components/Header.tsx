import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search, 
  Grid, 
  ChevronDown,
  Smartphone,
  Shirt,
  Car,
  Sparkles,
  Home,
  Trophy,
  BookOpen,
  Gamepad2,
  Package,
  Store,
  Settings,
  Heart,
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
  Mountain,
  Zap,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { categoriesApi } from '../services/api';
import type { Category } from '../types/api';

// Memoized loading skeleton for instant feedback
const CategorySkeleton = React.memo(() => (
  <div className="px-3 space-y-2">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
    ))}
  </div>
));

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simplified categories query for mobile performance
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1, // Reduce retries for faster mobile experience
  });

  // Memoize categories - show ALL categories, not limited to 8
  const categories = useMemo(() => 
    categoriesData?.data?.categories || [], 
    [categoriesData?.data?.categories]
  );

  // Enhanced category icon mapping with comprehensive coverage
  const getCategoryIcon = useCallback((categoryName: string) => {
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
  }, []);

  const renderCategoryIcon = useCallback((categoryName: string, size: number = 16) => {
    const IconComponent = getCategoryIcon(categoryName);
    return <IconComponent size={size} className="text-gray-500 group-hover:text-gray-600 transition-colors duration-200" />;
  }, [getCategoryIcon]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  }, [searchTerm, navigate]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowCategoriesDropdown(false);
      setIsUserMenuOpen(false);
      setExpandedCategory(null);
    };

    // Always add the event listener to ensure mobile compatibility
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Close categories dropdown when mobile menu opens
  useEffect(() => {
    if (isMenuOpen) {
      setShowCategoriesDropdown(false);
      setExpandedCategory(null);
    }
  }, [isMenuOpen]);

  return (
    <>
      <style>
        {`
          .mobile-menu-portal {
            z-index: 2147483647 !important;
            position: fixed !important;
          }
        `}
      </style>

      <header className={`sticky top-0 bg-white shadow-sm border-b border-gray-200 transition-all duration-300 z-40 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-12 sm:h-14 md:h-16">
            {/* Logo and Categories - Mobile Optimized Layout */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group mr-1 sm:mr-2 flex-shrink-0">
                  <img 
                  src="/iwanyu-logo.png"
                    alt="Iwanyu Store Logo" 
                  className="h-6 w-auto sm:h-8 md:h-9 lg:h-10 group-hover:scale-105 transition-transform duration-200 max-w-[100px] sm:max-w-[120px] md:max-w-[140px] lg:max-w-[160px]"
                    loading="eager"
                    decoding="async"
                />
              </Link>
            </div>

            {/* Clean & Professional Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {/* Other navigation items if needed */}
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" size={20} />
                <input
                  id="desktop-search"
                  name="search"
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full pl-12 pr-20 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded border">⌘K</kbd>
                </div>
              </form>
            </div>

            {/* Enhanced Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 hover:text-red-500 transition-all duration-200 rounded-lg hover:bg-red-50"
              >
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-gray-600 transition-all duration-200 rounded-lg hover:bg-gray-100 group"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-md"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(!isUserMenuOpen);
                    }}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 to-gray-100 transition-all duration-200 border border-transparent hover:border-gray-300"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden shadow-md">
                      {user?.avatar ? (
                        <img
                          src={`http://localhost:3001/${user.avatar}?t=${Date.now()}`}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                                                      <span className="text-sm text-gray-700 font-medium">{user?.firstName || 'User'}</span>
                    <ChevronDown size={12} className="text-gray-500" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 py-2 z-50"
                      >
                        {user?.role === 'ADMIN' && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 transition-all duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Settings size={16} />
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                          </>
                        )}
                        
                        {user?.role === 'SELLER' ? (
                          <Link
                            to="/seller/dashboard"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store size={16} />
                            <span className="font-medium">Seller Dashboard</span>
                          </Link>
                        ) : user?.role !== 'ADMIN' && (
                          <Link
                            to="/become-seller"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-600 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store size={16} />
                            <span className="font-medium">Become a Seller</span>
                          </Link>
                        )}
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:text-gray-700 transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} />
                          <span className="font-medium">My Profile</span>
                        </Link>
                        
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 to-gray-100 hover:text-gray-700 transition-all duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Package size={16} />
                          <span className="font-medium">My Orders</span>
                        </Link>
                        
                        <div className="border-t border-gray-100 my-1"></div>
                        
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                        >
                          <span className="font-medium">Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-sm text-gray-600 hover:text-gray-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-sm px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Right Section: Cart, Wishlist, Menu */}
            <div className="md:hidden flex items-center space-x-1 sm:space-x-2">
              {/* Mobile Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-red-500 transition-all duration-200 rounded-lg hover:bg-red-50"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full h-3.5 w-3.5 flex items-center justify-center font-medium text-[10px]">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Mobile Cart Button */}
              <Link
                to="/cart"
                className="relative p-1.5 sm:p-2 text-gray-600 hover:text-gray-600 transition-all duration-200 rounded-lg hover:bg-gray-100"
              >
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium shadow-md text-[10px]"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </motion.span>
                )}
              </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 ${
                  isMenuOpen 
                    ? 'text-gray-600 bg-gray-50' 
                    : 'text-gray-600 hover:text-gray-600 hover:bg-gray-100'
                }`}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            </div>
          </div>

          {/* Enhanced Mobile Search Bar */}
          <div className="md:hidden py-3 border-t border-gray-100">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" size={18} />
              <input
                id="mobile-search"
                name="search"
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="w-full pl-11 pr-16 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
            </form>
          </div>

          {/* Simplified Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '100%' }}
                transition={{ duration: 0.2 }}
                className="md:hidden fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 overflow-y-auto"
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg text-gray-900">Menu</h2>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                  </div>
                    </div>

                <div className="p-4 space-y-4">
                  {/* User Section */}
                    {user ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-md">
                          {user?.avatar ? (
                            <img
                              src={`http://localhost:3001/${user.avatar}?t=${Date.now()}`}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                          <div>
                          <p className="font-semibold text-gray-900">{user?.firstName || 'User'}</p>
                            <p className="text-sm text-gray-600">{user?.email}</p>
                          </div>
                        </div>
                        
                      {/* Quick Links */}
                        <div className="space-y-2">
                          {user?.role === 'ADMIN' && (
                            <Link
                              to="/admin/dashboard"
                            className="flex items-center space-x-2 p-3 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Settings size={16} />
                            <span>Admin Dashboard</span>
                            </Link>
                          )}
                          
                          {user?.role === 'SELLER' ? (
                            <Link
                              to="/seller/dashboard"
                            className="flex items-center space-x-2 p-3 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Store size={16} />
                            <span>Seller Dashboard</span>
                            </Link>
                        ) : user?.role !== 'ADMIN' && (
                            <Link
                              to="/become-seller"
                            className="flex items-center space-x-2 p-3 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Store size={16} />
                            <span>Become Seller</span>
                            </Link>
                          )}
                        
                        <Link
                          to="/profile"
                          className="flex items-center space-x-2 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User size={16} />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          to="/orders"
                          className="flex items-center space-x-2 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Package size={16} />
                          <span>My Orders</span>
                        </Link>

                        <Link
                          to="/wishlist"
                          className="flex items-center space-x-2 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Heart size={16} />
                          <span>Wishlist</span>
                          {wishlistCount > 0 && (
                            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </div>
                      </div>
                    ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <User size={32} className="mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-600 mb-3">Sign in to access your account</p>
                      <div className="space-y-2">
                          <Link
                            to="/login"
                          className="block w-full py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/register"
                          className="block w-full py-3 px-4 border border-gray-400 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </div>
                      </div>
                    )}

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Browse</h3>
                    
                    <Link
                      to="/products"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Package size={18} />
                      <span className="font-medium">All Products</span>
                    </Link>

                    <Link
                      to="/categories"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Grid size={18} />
                      <span className="font-medium">Categories</span>
                    </Link>

                    <Link
                      to="/deals"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Zap size={18} />
                      <span className="font-medium">Flash Deals</span>
                    </Link>

                    <Link
                      to="/cart"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ShoppingCart size={18} />
                      <span className="font-medium">Shopping Cart</span>
                      {itemCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Help & Support */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Support</h3>
                    
                    <Link
                      to="/contact"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle size={18} />
                      <span>Contact Us</span>
                    </Link>

                    <Link
                      to="/about"
                      className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Shield size={18} />
                      <span>About Us</span>
                    </Link>
                  </div>

                  {/* Logout */}
                    {user && (
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                      className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors font-medium"
                        >
                      <X size={16} />
                      <span>Sign Out</span>
                        </button>
                    )}
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Backdrop */}
          {isMenuOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      </header>
    </>
  );
};

export default Header; 