import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  Phone,
  ChevronRight
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
      <style>
        {`
          .mobile-menu-portal {
            z-index: 2147483647 !important;
            position: fixed !important;
          }
        `}
      </style>
      {/* Enhanced Top Banner with Performance Info - Desktop Only */}
      <div className="hidden md:block bg-gradient-to-r from-orange-500 to-pink-500 text-white text-center py-2 text-sm">
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

      <header className={`sticky top-0 bg-white shadow-sm border-b border-gray-200 transition-all duration-300 z-40 ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Enhanced Logo with Fallback */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img
                  src="/iwanyu-logo.svg"
                  alt="Iwanyu Store Logo" 
                  className="h-10 w-auto group-hover:scale-105 transition-transform duration-200"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    // Simple fallback if logo doesn't load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                {/* Simplified Fallback */}
                <div 
                  className="h-10 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
                  style={{ display: 'none' }}
                >
                  IWANYU.store
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
                          {categories.map((category: Category, index: number) => (
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
              onClick={() => {
                console.log('Mobile menu button clicked, current state:', isMenuOpen);
                setIsMenuOpen(!isMenuOpen);
                console.log('Mobile menu button clicked, new state:', !isMenuOpen);
              }}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className={`md:hidden p-3 rounded-lg transition-all duration-200 z-[2147483647] ${
                isMenuOpen 
                  ? 'text-orange-500 bg-orange-50' 
                  : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
              }`}
              style={{ zIndex: 2147483647, position: 'relative' }}
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

          {/* Debug Menu State - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed top-20 left-4 bg-red-500 text-white p-2 rounded z-[10000] text-xs">
              Menu: {isMenuOpen ? 'OPEN' : 'CLOSED'}
            </div>
          )}

          {/* Enhanced Mobile Menu */}
          {isMenuOpen && createPortal(
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mobile-menu-portal fixed inset-0 bg-black/60 backdrop-blur-sm z-[2147483647] lg:hidden"
                onClick={() => {
                  console.log('Backdrop clicked, closing menu');
                  setIsMenuOpen(false);
                }}
                style={{ zIndex: 2147483647 }}
              />
              
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ 
                  type: 'spring',
                  damping: 25,
                  stiffness: 300,
                  duration: 0.3
                }}
                className="mobile-menu-portal fixed top-0 right-0 h-full w-[340px] max-w-[85vw] sm:max-w-[400px] bg-white/95 backdrop-blur-xl shadow-2xl z-[2147483647] lg:hidden overflow-hidden"
                style={{ 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  zIndex: 2147483647,
                  position: 'fixed !important' as any
                }}
              >
                <div className="h-full overflow-y-auto">
                  {/* Header */}
                  <div className="sticky top-0 bg-white text-gray-900 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <img src="/iwanyu-logo.svg" alt="Iwanyu" className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">Iwanyu Store</h2>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log('Close button clicked');
                          setIsMenuOpen(false);
                        }}
                        aria-label="Close mobile menu"
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* User Profile Section */}
                    {user ? (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {user.firstName || 'User'}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          {user.role === 'ADMIN' && (
                            <Link
                              to="/admin/dashboard"
                              className="flex items-center space-x-3 p-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all duration-200 group border border-blue-100"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                <Settings size={16} />
                              </div>
                              <span className="font-medium">Admin Dashboard</span>
                            </Link>
                          )}
                          
                          {user.role === 'SELLER' ? (
                            <Link
                              to="/seller/dashboard"
                              className="flex items-center space-x-3 p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all duration-200 group border border-green-100"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <Store size={16} />
                              </div>
                              <span className="font-medium">Seller Dashboard</span>
                            </Link>
                          ) : user.role !== 'ADMIN' && (
                            <Link
                              to="/become-seller"
                              className="flex items-center space-x-3 p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all duration-200 group border border-purple-100"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <Store size={16} />
                              </div>
                              <span className="font-medium">Become a Seller</span>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 rounded-2xl p-5 border border-orange-100/50 shadow-sm"
                      >
                        <div className="text-center mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                            <User size={24} className="text-white" />
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">Join Iwanyu Store!</h3>
                          <p className="text-sm text-gray-600">Sign up to access exclusive features</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Link
                            to="/login"
                            className="text-center py-3 px-4 border-2 border-orange-200 text-orange-700 rounded-xl hover:bg-orange-50 hover:border-orange-300 transition-all duration-200 font-medium active:scale-95"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/register"
                            className="text-center py-3 px-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg active:scale-95"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </div>
                      </motion.div>
                    )}

                    {/* Categories Section - Simplified */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
                      
                      {isLoading ? (
                        <div className="space-y-2">
                          {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1 max-h-64 overflow-y-auto">
                          {categories.map((category: Category) => (
                            <Link
                              key={category.id}
                              to={`/products?category=${category.slug}`}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {renderCategoryIcon(category.name, 16)}
                                </div>
                                <span className="text-gray-700 font-medium">
                                  {category.name}
                                </span>
                              </div>

                            </Link>
                          ))}
                          
                          <Link
                            to="/products"
                            className="flex items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors mt-2"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Package size={16} className="mr-2" />
                            <span className="font-medium">View All Products</span>
                          </Link>
                        </div>
                      )}
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-3"
                    >
                      <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-3">
                          <Star size={16} className="text-white" />
                        </div>
                        Quick Actions
                      </h3>

                      {user && (
                        <Link
                          to="/orders"
                          className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all duration-200 group active:scale-[0.98]"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <Package size={18} className="text-blue-600" />
                            </div>
                            <span className="font-semibold text-blue-700">My Orders</span>
                          </div>
                          <ChevronRight size={16} className="text-blue-500" />
                        </Link>
                      )}

                      <Link
                        to="/cart"
                        className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 hover:border-orange-200 transition-all duration-200 group active:scale-[0.98]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors relative">
                            <ShoppingCart size={18} className="text-orange-600" />
                            {itemCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                {itemCount > 9 ? '9+' : itemCount}
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-orange-700">Shopping Cart</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {itemCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              {itemCount}
                            </span>
                          )}
                          <ChevronRight size={16} className="text-orange-500" />
                        </div>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all duration-200 group active:scale-[0.98]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <Heart size={18} className="text-red-600" />
                          </div>
                          <span className="font-semibold text-red-700">Wishlist</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            0
                          </span>
                          <ChevronRight size={16} className="text-red-500" />
                        </div>
                      </Link>
                    </motion.div>

                    {/* Logout Section */}
                    {user && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="pt-6 border-t border-gray-200"
                      >
                        <button
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center justify-center space-x-3 p-4 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 border border-red-100 hover:border-red-200 active:scale-[0.98] group"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                            <X size={16} />
                          </div>
                          <span className="font-semibold">Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
        </div>
      </header>
    </>
  );
};

export default Header; 