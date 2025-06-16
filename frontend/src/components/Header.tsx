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
  Bell,
  Star,
  TrendingUp,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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

  // Aggressive caching for categories
  const { data: categoriesData, isLoading, isFetched } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 60 * 60 * 1000, // Cache for 1 hour (very aggressive)
    gcTime: 2 * 60 * 60 * 1000, // Keep in cache for 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => 
    categoriesData?.data?.categories || [], 
    [categoriesData?.data?.categories]
  );

  // Memoized category icon mapping for performance
  const getCategoryIcon = useCallback((categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('electronics') || name.includes('mobile') || name.includes('phone') || name.includes('computer') || name.includes('laptop')) return Smartphone;
    if (name.includes('fashion') || name.includes('clothing') || name.includes('shoes') || name.includes('sneakers')) return Shirt;
    if (name.includes('automotive')) return Car;
    if (name.includes('beauty')) return Sparkles;
    if (name.includes('home') || name.includes('garden')) return Home;
    if (name.includes('sports') || name.includes('jersey') || name.includes('athletic')) return Trophy;
    if (name.includes('books')) return BookOpen;
    if (name.includes('gaming') || name.includes('console') || name.includes('toys')) return Gamepad2;
    if (name.includes('watch') || name.includes('jewelry')) return Star;
    if (name.includes('audio') || name.includes('headphone')) return Sparkles;
    return Package;
  }, []);

  const renderCategoryIcon = useCallback((categoryName: string, size: number = 16) => {
    const IconComponent = getCategoryIcon(categoryName);
    return <IconComponent size={size} className="text-gray-500 group-hover:text-orange-500 transition-colors duration-200" />;
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
    };

    if (showCategoriesDropdown || isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showCategoriesDropdown, isUserMenuOpen]);

  return (
    <>
      {/* Enhanced Top Banner with Performance Info */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center py-2 text-sm">
        <div className="container mx-auto px-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center space-x-2"
          >
            <span>Free shipping in Kigali and Rwanda! 🇷🇼</span>
            <TrendingUp size={14} className="text-yellow-200" />
          </motion.p>
        </div>
      </div>

      <header className={`bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-lg shadow-gray-200/20' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Logo with Fallback */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                              <img
                src="/iwanyu-logo.png"
                alt="Iwanyu Store Logo" 
                  className="h-12 w-auto group-hover:scale-105 transition-transform duration-200"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    // Fallback if logo doesn't load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Fallback Text Logo */}
                <div 
                  className="h-12 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-xl rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                  style={{ display: 'none' }}
                >
                  IWANYU
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
              </div>
            </Link>

            {/* Clean & Professional Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {/* Main Categories Dropdown Only */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowCategoriesDropdown(true)}
                  onMouseLeave={() => setShowCategoriesDropdown(false)}
                  onClick={(e) => e.stopPropagation()}
                  className="group flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 rounded-lg transition-all duration-200 border border-transparent hover:border-orange-200 font-medium"
                >
                  <Grid size={16} className="group-hover:text-orange-500 transition-colors duration-200" />
                  <span className="whitespace-nowrap">Categories</span>
                  <ChevronDown size={14} className="group-hover:text-orange-500 transition-colors duration-200" />
                  {isFetched && (
                    <span className="ml-1 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">
                      {categories.length}
                    </span>
                  )}
                </button>

                {/* Enhanced Categories Dropdown Menu */}
                <AnimatePresence>
                  {showCategoriesDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={() => setShowCategoriesDropdown(true)}
                      onMouseLeave={() => setShowCategoriesDropdown(false)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-full mt-2 left-0 bg-white/95 backdrop-blur-md rounded-xl border border-gray-200/50 shadow-xl py-3 min-w-[320px] z-50"
                    >
                      <div className="px-4 py-2 border-b border-gray-100 mb-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-700">Shop by Category</h3>
                        </div>
                      </div>
                      
                      {isLoading ? (
                        <CategorySkeleton />
                      ) : (
                        <div className="px-3 space-y-1">
                          {categories.map((category: Category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${category.slug}`}
                              className="group flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-orange-200"
                              onClick={() => setShowCategoriesDropdown(false)}
                            >
                              <div className="flex items-center space-x-3">
                                {renderCategoryIcon(category.name, 18)}
                                <span className="text-sm text-gray-700 group-hover:text-orange-600 font-medium">{category.name}</span>
                              </div>
                              <span className="text-xs text-gray-400 group-hover:text-orange-500 font-medium">
                                {category._count?.products || 0} items
                              </span>
                            </Link>
                          ))}
                          
                          {categories.length === 0 && !isLoading && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No categories available
                            </div>
                          )}
                          
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <Link
                              to="/products"
                              className="group flex items-center justify-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-transparent hover:border-blue-200"
                              onClick={() => setShowCategoriesDropdown(false)}
                            >
                              <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">View All Products</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Contact Link */}
              <Link
                to="/contact"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 rounded-lg transition-all duration-200 border border-transparent hover:border-orange-200 font-medium"
              >
                <Phone size={16} className="text-gray-500 group-hover:text-orange-500 transition-colors duration-200" />
                <span>Contact</span>
              </Link>

              {/* Clean Navigation Links */}
              <Link
                to="/products"
                className="text-sm text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                All Products
              </Link>
              
              <Link
                to="/deals"
                className="text-sm text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                Deals
              </Link>
              
              <Link
                to="/about"
                className="text-sm text-gray-700 hover:text-orange-600 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-orange-50"
              >
                About
              </Link>
            </nav>

            {/* Enhanced Search Bar with Performance Indicators */}
            <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" size={18} />
                <input
                  type="text"
                  placeholder="Search for products, brands, and more..."
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  className="w-full pl-12 pr-20 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  0
                </span>
              </Link>

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-orange-500 transition-all duration-200 rounded-lg hover:bg-orange-50 group"
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
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-orange-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-md">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{user.firstName || 'User'}</span>
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
                        {user.role === 'ADMIN' && (
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
                        
                        {user.role === 'SELLER' ? (
                          <Link
                            to="/seller/dashboard"
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-600 transition-all duration-200"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Store size={16} />
                            <span className="font-medium">Seller Dashboard</span>
                          </Link>
                        ) : user.role !== 'ADMIN' && (
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
                          to="/orders"
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 hover:text-orange-600 transition-all duration-200"
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
                    className="text-sm text-gray-600 hover:text-orange-500 transition-colors duration-200 font-medium px-3 py-2 rounded-lg hover:bg-orange-50"
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden p-2 text-gray-600 hover:text-orange-500 transition-colors duration-200 rounded-lg hover:bg-orange-50"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Enhanced Mobile Search Bar */}
          <div className="md:hidden py-3 border-t border-gray-100">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-300"></div>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchInputChange}
                className="w-full pl-11 pr-16 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-white/80 backdrop-blur-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-xs text-green-600">
                <Search size={10} />
              </div>
            </form>
          </div>

          {/* Enhanced Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                {/* Mobile Menu Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                  onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Mobile Menu Content */}
                <motion.div
                  initial={{ opacity: 0, x: '100%' }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 md:hidden overflow-y-auto"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <img src="/iwanyu-logo.png" alt="Iwanyu" className="h-8 w-auto" />
                      </div>
                      <button
                        onClick={() => setIsMenuOpen(false)}
                        aria-label="Close mobile menu"
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {user ? (
                      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-4 mb-6 border border-orange-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.firstName || 'User'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {user.role === 'ADMIN' && (
                            <Link
                              to="/admin/dashboard"
                              className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Settings size={16} />
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>
                          )}
                          
                          {user.role === 'SELLER' ? (
                            <Link
                              to="/seller/dashboard"
                              className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Store size={16} />
                              <span className="font-medium">Seller Dashboard</span>
                            </Link>
                          ) : user.role !== 'ADMIN' && (
                            <Link
                              to="/become-seller"
                              className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors duration-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <Store size={16} />
                              <span className="font-medium">Become a Seller</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-3 mb-4 border border-orange-200">
                        <p className="text-xs text-gray-600 mb-2">Join Iwanyu Store!</p>
                        <div className="flex space-x-2">
                          <Link
                            to="/login"
                            className="flex-1 text-center py-1.5 px-3 border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors duration-200 text-xs font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/register"
                            className="flex-1 text-center py-1.5 px-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all duration-200 text-xs font-medium shadow-md"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Mobile Categories */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Grid size={18} className="mr-2 text-orange-500" />
                        Categories
                        <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                          {categories.length}
                        </span>
                      </h3>
                      
                      {isLoading ? (
                        <div className="space-y-3">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {categories.map((category: Category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${category.slug}`}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-orange-200 group"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="flex items-center space-x-3">
                                {renderCategoryIcon(category.name, 18)}
                                <span className="text-gray-700 group-hover:text-orange-600 font-medium">{category.name}</span>
                              </div>
                              <span className="text-xs text-gray-400 group-hover:text-orange-500 font-medium">
                                {category._count?.products || 0}
                              </span>
                            </Link>
                          ))}
                          
                          <Link
                            to="/products"
                            className="flex items-center justify-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 text-blue-600 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 group"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Package size={16} className="mr-2" />
                            <span className="font-medium">View All Products</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Mobile Actions */}
                    <div className="space-y-3">
                      {user && (
                        <Link
                          to="/orders"
                          className="flex items-center justify-between p-4 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <Package size={18} className="text-blue-600" />
                            <span className="font-medium text-blue-700">My Orders</span>
                          </div>
                        </Link>
                      )}

                      <Link
                        to="/cart"
                        className="flex items-center justify-between p-4 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <ShoppingCart size={18} className="text-orange-600" />
                          <span className="font-medium text-orange-700">Shopping Cart</span>
                        </div>
                        {itemCount > 0 && (
                          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                            {itemCount}
                          </span>
                        )}
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <Heart size={18} className="text-red-600" />
                          <span className="font-medium text-red-700">Wishlist</span>
                        </div>
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          0
                        </span>
                      </Link>
                    </div>

                    {user && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
};

export default Header; 