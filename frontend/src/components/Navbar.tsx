import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Search,
  ChevronDown,
  Package,
  Heart,
  Bell,
  MapPin,
  Shield,
  Truck,
  Gift,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { formatPrice } from '../utils/currency';

const Navbar: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const { itemCount, totalAmount } = useCart();
  const { wishlistCount } = useWishlist();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileMenu(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      setShowMobileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '📱' },
    { name: 'Fashion', slug: 'fashion', icon: '👕' },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
    { name: 'Sports', slug: 'sports', icon: '⚽' },
    { name: 'Beauty', slug: 'beauty', icon: '💄' },
    { name: 'Automotive', slug: 'automotive', icon: '🚗' },
    { name: 'Books', slug: 'books', icon: '📚' },
    { name: 'Gaming', slug: 'gaming', icon: '🎮' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-1">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Truck size={12} className="mr-1" />
                Free shipping
              </span>
              <span className="flex items-center">
                <Shield size={12} className="mr-1" />
                Buyer protection
              </span>
              <span className="flex items-center">
                <Gift size={12} className="mr-1" />
                Welcome bonus for new users
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Globe size={12} className="mr-1" />
                English
              </span>
              <span className="flex items-center">
                <MapPin size={12} className="mr-1" />
                Rwanda
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <img 
              src="/iwanyu-logo.svg" 
              alt="Iwanyu Store" 
              className="h-10 w-auto"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border-2 border-red-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 h-full px-4 text-white bg-red-500 hover:bg-red-600 rounded-r-lg transition-colors"
                  aria-label="Search"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
                className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors py-2"
              >
                <Package size={20} />
                <span>Categories</span>
                <ChevronDown size={16} />
              </button>
              
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border z-50"
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Shop by Category</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            to={`/products?category=${category.slug}`}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-red-50 transition-colors"
                            onClick={() => setShowCategories(false)}
                          >
                            <span className="text-lg">{category.icon}</span>
                            <span className="text-sm text-gray-700 hover:text-red-600">
                              {category.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors relative"
            >
              <div className="relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </div>
              <span className="hidden lg:block">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors relative"
            >
              <div className="relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-xs text-gray-500">Cart</span>
                <span className="text-sm font-semibold">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </Link>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              ) : user ? (
                <>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-red-600" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-xs text-gray-500">Hello</span>
                      <span className="text-sm font-semibold truncate max-w-20">
                        {user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                    <ChevronDown size={16} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border z-50"
                      >
                        <div className="p-4 border-b">
                          <div className="font-semibold text-gray-900">{user.email?.split('@')[0] || 'User'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                        <div className="py-2">
                          <Link
                            to="/account"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            My Account
                          </Link>
                          <Link
                            to="/orders"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <div className="flex items-center justify-between">
                              <span>Wishlist</span>
                              {wishlistCount > 0 && (
                                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                                  {wishlistCount}
                                </span>
                              )}
                            </div>
                          </Link>
                          <Link
                            to="/notifications"
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <span>Notifications</span>
                            <Bell size={16} />
                          </Link>
                        </div>
                        <div className="border-t py-2">
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-red-600 transition-colors text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-red-600 transition-colors text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-4">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.slice(0, 6).map((category) => (
                      <Link
                        key={category.slug}
                        to={`/products?category=${category.slug}`}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-red-50"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <span>{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 pt-4 border-t">
                  <Link
                    to="/cart"
                    className="flex items-center justify-between p-2 rounded hover:bg-red-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <ShoppingCart size={20} />
                      <span>Shopping Cart</span>
                    </div>
                    {itemCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {itemCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between p-2 rounded hover:bg-red-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Heart size={20} />
                      <span>Wishlist</span>
                    </div>
                    {wishlistCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>

                  {user ? (
                    <>
                      <Link
                        to="/account"
                        className="flex items-center space-x-2 p-2 rounded hover:bg-red-50"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <User size={20} />
                        <span>My Account</span>
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center space-x-2 p-2 rounded hover:bg-red-50"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <Package size={20} />
                        <span>My Orders</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 p-2 rounded hover:bg-red-50 w-full text-left"
                      >
                        <X size={20} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center space-x-2 p-2 rounded hover:bg-red-50"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <User size={20} />
                        <span>Sign In</span>
                      </Link>
                      <Link
                        to="/register"
                        className="flex items-center space-x-2 p-2 rounded hover:bg-red-50"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <User size={20} />
                        <span>Register</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar; 