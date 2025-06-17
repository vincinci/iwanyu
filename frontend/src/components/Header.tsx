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

  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => 
    categoriesData?.data?.categories?.slice(0, 8) || [], // Limit to 8 categories for mobile performance
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
                                  src="/iwanyu-logo.png"
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
                  <ChevronDown size={12} className="group-hover:text-orange-500 transition-colors duration-200" />
                </button>

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
                      className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 py-4 z-50"
                    >
                      <div className="px-4 pb-3 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-sm">Shop by Category</h3>
                      </div>
                      
                      {isLoading ? (
                        <CategorySkeleton />
                      ) : (
                        <div className="px-3 py-3 max-h-80 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-1">
                            {categories.map((category: Category) => (
                              <Link
                                key={category.id}
                                to={`/products?category=${category.slug}`}
                                className="group flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 transition-all duration-200 border border-transparent hover:border-orange-200"
                                onClick={() => setShowCategoriesDropdown(false)}
                              >
                                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                                  {renderCategoryIcon(category.name, 16)}
                                </div>
                                <span className="text-sm text-gray-700 group-hover:text-orange-600 font-medium">
                                  {category.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <Link
                              to="/products"
                              className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                              onClick={() => setShowCategoriesDropdown(false)}
                            >
                              <Package size={16} />
                              <span>View All Products</span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-400 rounded-xl opacity-0 group-focus-within:opacity-10 transition-opacity duration-300"></div>
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors duration-200" size={20} />
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

            {/* Mobile Right Section: Cart, Wishlist, Menu */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-2 text-gray-600 hover:text-red-500 transition-all duration-200 rounded-lg hover:bg-red-50"
              >
                <Heart size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  0
                </span>
              </Link>

              {/* Mobile Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-orange-500 transition-all duration-200 rounded-lg hover:bg-orange-50"
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isMenuOpen 
                    ? 'text-orange-500 bg-orange-50' 
                    : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
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
                className="md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 overflow-y-auto"
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
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {user.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.firstName || 'User'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      
                      {/* Quick Links */}
                      <div className="space-y-2">
                        {user.role === 'ADMIN' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center space-x-2 p-2 rounded-lg bg-blue-100 text-blue-700"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Settings size={16} />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        
                        {user.role === 'SELLER' ? (
                          <Link
                            to="/seller/dashboard"
                            className="flex items-center space-x-2 p-2 rounded-lg bg-green-100 text-green-700"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Store size={16} />
                            <span>Seller Dashboard</span>
                          </Link>
                        ) : (
                          <Link
                            to="/become-seller"
                            className="flex items-center space-x-2 p-2 rounded-lg bg-purple-100 text-purple-700"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <Store size={16} />
                            <span>Become Seller</span>
                          </Link>
                        )}
                        
                        <Link
                          to="/orders"
                          className="flex items-center space-x-2 p-2 rounded-lg bg-orange-100 text-orange-700"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Package size={16} />
                          <span>My Orders</span>
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
                          className="block w-full py-2 px-4 bg-orange-500 text-white rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          className="block w-full py-2 px-4 border border-orange-500 text-orange-500 rounded-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-1">
                      {isLoading ? (
                        <div className="space-y-2">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                          ))}
                        </div>
                      ) : (
                        categories.map((category: Category) => (
                          <Link
                            key={category.id}
                            to={`/products?category=${category.slug}`}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <div className="w-6 h-6 flex items-center justify-center">
                              {renderCategoryIcon(category.name, 16)}
                            </div>
                            <span className="text-gray-700">{category.name}</span>
                          </Link>
                        ))
                      )}
                      
                      <Link
                        to="/products"
                        className="flex items-center justify-center space-x-2 p-3 rounded-lg bg-orange-500 text-white mt-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Package size={16} />
                        <span>All Products</span>
                      </Link>
                    </div>
                  </div>

                  {/* Logout */}
                  {user && (
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 p-3 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
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