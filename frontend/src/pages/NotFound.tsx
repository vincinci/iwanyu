import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, ShoppingBag } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-gray-300">
              404
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-gray-600 mb-4">
              Page Not Found
            </div>
          </div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <p className="text-gray-600 text-lg mb-4">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="text-gray-500">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <Home size={18} />
                <span>Go Home</span>
              </Link>

              <Link
                to="/products"
                className="inline-flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                <ShoppingBag size={18} />
                <span>Shop Now</span>
              </Link>
            </div>

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors duration-200"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </motion.div>

          {/* Search Suggestion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 p-6 bg-white rounded-xl shadow-md"
          >
            <div className="flex items-center justify-center mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Looking for something specific?
            </h3>
            <p className="text-gray-600 mb-4">
              Try searching for products or browse our categories
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/products?category=electronics"
                className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-full text-sm transition-colors duration-200"
              >
                Electronics
              </Link>
              <Link
                to="/products?category=fashion"
                className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-full text-sm transition-colors duration-200"
              >
                Fashion
              </Link>
              <Link
                to="/products?category=home"
                className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-full text-sm transition-colors duration-200"
              >
                Home & Garden
              </Link>
              <Link
                to="/deals"
                className="px-3 py-1 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 rounded-full text-sm transition-colors duration-200"
              >
                Deals
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 