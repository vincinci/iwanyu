'use client';

import Link from 'next/link';
import Image from 'next/image';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Product } from '@/types';
import { formatCurrency, calculateDiscountPercentage, cn } from '@/lib/utils';
import { useCartStore } from '@/store';
import { useFavorites } from '@/hooks';
import { Button } from './ui/Button';

interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: 'card' | 'list';
  showVendor?: boolean;
}

export function ProductCard({ product, className, variant = 'card', showVendor = true }: ProductCardProps) {
  const { addItem } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const discountPercentage = isOnSale 
    ? calculateDiscountPercentage(product.price, product.salePrice!)
    : 0;
  const displayPrice = isOnSale ? product.salePrice! : product.price;
  const isFav = isFavorite(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
  };

  return (
    <div className={cn(
      'group relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200',
      className
    )}>
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Sale badge */}
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Low stock badge */}
          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Low Stock
            </div>
          )}
          
          {/* Out of stock badge */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
          
          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow opacity-0 group-hover:opacity-100"
          >
            {isFav ? (
              <HeartIconSolid className="h-4 w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Vendor name */}
          {showVendor && (
            <p className="text-xs text-gray-500 mb-1 truncate">
              by {product.vendorId} {/* Would be vendor name in real app */}
            </p>
          )}
          
          {/* Product name */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Rating */}
          <div className="flex items-center mb-2">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xs">
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500 ml-1">
              ({product.reviewCount})
            </span>
          </div>
          
          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(displayPrice)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Add to cart button */}
      <div className="px-4 pb-4">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={cn(
            'w-full text-sm',
            product.stock === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-400 hover:bg-yellow-500 text-black'
          )}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
  className?: string;
  showVendor?: boolean;
}

export function ProductGrid({ products, className, showVendor = true }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🔍</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6',
      className
    )}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          showVendor={showVendor}
        />
      ))}
    </div>
  );
}
