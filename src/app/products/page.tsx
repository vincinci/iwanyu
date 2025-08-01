'use client';

import { useState, useEffect } from 'react';
import { FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    vendorId: 'vendor1',
    categoryId: 'cat1',
    name: 'iPhone 14 Pro Max',
    slug: 'iphone-14-pro-max',
    description: 'Latest iPhone with Pro camera system and A16 Bionic chip',
    shortDescription: 'Latest iPhone with advanced features',
    sku: 'IPH14PM001',
    price: 850000,
    salePrice: 800000,
    stock: 25,
    lowStockThreshold: 5,
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400&h=400&fit=crop'
    ],
    weight: 0.24,
    dimensions: { length: 16.1, width: 7.8, height: 0.8 },
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 156,
    tags: ['smartphone', 'apple', 'premium'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    vendorId: 'vendor2',
    categoryId: 'cat2',
    name: 'Traditional Rwandan Coffee Beans',
    slug: 'rwandan-coffee-beans',
    description: 'Premium quality coffee beans sourced from the hills of Rwanda',
    shortDescription: 'Premium Rwandan coffee beans',
    sku: 'COF001',
    price: 15000,
    stock: 100,
    lowStockThreshold: 10,
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop'
    ],
    weight: 0.5,
    isActive: true,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 89,
    tags: ['coffee', 'local', 'organic'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    vendorId: 'vendor3',
    categoryId: 'cat3',
    name: 'Handwoven Agaseke Basket',
    slug: 'agaseke-basket',
    description: 'Beautiful traditional Rwandan basket perfect for home decoration',
    shortDescription: 'Traditional Rwandan decorative basket',
    sku: 'BAS001',
    price: 35000,
    salePrice: 30000,
    stock: 15,
    lowStockThreshold: 3,
    images: [
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'
    ],
    weight: 0.3,
    isActive: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 45,
    tags: ['handmade', 'traditional', 'decor'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    vendorId: 'vendor1',
    categoryId: 'cat1',
    name: 'Samsung Galaxy S23 Ultra',
    slug: 'samsung-galaxy-s23-ultra',
    description: 'Flagship Samsung phone with S Pen and amazing camera',
    shortDescription: 'Samsung flagship with S Pen',
    sku: 'SAM23U001',
    price: 750000,
    salePrice: 700000,
    stock: 18,
    lowStockThreshold: 5,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=400&h=400&fit=crop'
    ],
    weight: 0.23,
    isActive: true,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 203,
    tags: ['smartphone', 'samsung', 'android'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    vendorId: 'vendor4',
    categoryId: 'cat4',
    name: 'Kitenge African Print Dress',
    slug: 'kitenge-african-dress',
    description: 'Beautiful African print dress made with authentic Kitenge fabric',
    shortDescription: 'Elegant African print dress',
    sku: 'KIT001',
    price: 45000,
    stock: 12,
    lowStockThreshold: 2,
    images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop'
    ],
    weight: 0.4,
    isActive: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 67,
    tags: ['fashion', 'african', 'traditional'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    vendorId: 'vendor5',
    categoryId: 'cat5',
    name: 'Fresh Avocados (1kg)',
    slug: 'fresh-avocados-1kg',
    description: 'Fresh, locally grown avocados from Rwandan farms',
    shortDescription: 'Fresh local avocados',
    sku: 'AVO001',
    price: 3500,
    stock: 200,
    lowStockThreshold: 20,
    images: [
      'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop'
    ],
    weight: 1.0,
    isActive: true,
    isFeatured: false,
    rating: 4.5,
    reviewCount: 124,
    tags: ['fresh', 'local', 'organic', 'fruit'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate API call
    const loadProducts = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProducts(mockProducts);
      setLoading(false);
    };

    loadProducts();
  }, []);

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return (a.salePrice || a.price) - (b.salePrice || b.price);
      case 'price_high':
        return (b.salePrice || b.price) - (a.salePrice || a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'popularity':
        return b.reviewCount - a.reviewCount;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
            <p className="text-gray-600">Discover amazing products from local Rwandan sellers</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <ListBulletIcon className="h-4 w-4" />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popularity">Most Popular</option>
            </select>

            {/* Filters Button */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">All Products</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Products Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedProducts.length} products
          </p>
        </div>

        {/* Products Grid/List */}
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        )}>
          {sortedProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              variant={viewMode === 'list' ? 'list' : 'card'}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-12">
          <Button 
            variant="outline" 
            className="px-8 py-3"
          >
            Load More Products
          </Button>
        </div>
      </div>
    </Layout>
  );
}
