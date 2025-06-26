import React from 'react';
import { motion } from 'framer-motion';

interface ProductSkeletonProps {
  count?: number;
  className?: string;
  variant?: 'card' | 'list' | 'grid' | 'compact' | 'detail';
}

// Individual skeleton for a single product
const SingleProductSkeleton = ({ variant = 'card' }: { variant?: string }) => {
  if (variant === 'detail') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="animate-pulse"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-300 aspect-square rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-300 aspect-square rounded"></div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-300 h-8 rounded w-3/4"></div>
            <div className="bg-gray-300 h-6 rounded w-1/2"></div>
            <div className="bg-gray-300 h-16 rounded"></div>
            <div className="bg-gray-300 h-10 rounded w-1/3"></div>
            <div className="bg-gray-300 h-12 rounded w-full"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
      >
        <div className="flex p-4 space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
      >
        <div className="w-full h-20 md:h-24 bg-gray-200"></div>
        <div className="p-2 space-y-1">
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
    >
      <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>
    </motion.div>
  );
};

// Main component that renders multiple skeletons
const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ 
  count = 12, 
  className = '', 
  variant = 'card' 
}) => {
  if (variant === 'detail') {
    return (
      <div className={className}>
        <SingleProductSkeleton variant={variant} />
      </div>
    );
  }

  const getGridClass = () => {
    if (variant === 'list') return 'space-y-4';
    if (variant === 'compact') return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3';
    return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3';
  };

  return (
    <div className={`${getGridClass()} ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <SingleProductSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
};

export default ProductSkeleton; 