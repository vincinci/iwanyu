'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/ProductCard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Product, VendorDashboardStats } from '@/types';

// Mock data
const mockStats: VendorDashboardStats = {
  totalOrders: 142,
  totalRevenue: 2450000,
  totalProducts: 28,
  totalEarnings: 2205000, // After commission
  pendingOrders: 8,
  recentOrders: [],
  topProducts: [],
  salesData: [
    { date: '2025-07-25', sales: 145000, orders: 5 },
    { date: '2025-07-26', sales: 230000, orders: 8 },
    { date: '2025-07-27', sales: 180000, orders: 6 },
    { date: '2025-07-28', sales: 320000, orders: 12 },
    { date: '2025-07-29', sales: 275000, orders: 9 },
    { date: '2025-07-30', sales: 190000, orders: 7 },
    { date: '2025-07-31', sales: 410000, orders: 15 },
  ],
};

const mockProducts: Product[] = [
  {
    id: '1',
    vendorId: 'current-vendor',
    categoryId: 'cat1',
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
    id: '2',
    vendorId: 'current-vendor',
    categoryId: 'cat2',
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
];

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
      setProducts(mockProducts);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
            <p className="text-gray-600">Manage your products and track your sales</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/vendor/products/new">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Add Product</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats!.totalRevenue)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats!.totalOrders)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600 font-medium">+8.2%</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats!.totalProducts)}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-purple-600 font-medium">+3 new</span>
              <span className="text-sm text-gray-500 ml-1">this month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats!.totalEarnings)}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-yellow-600 font-medium">90%</span>
              <span className="text-sm text-gray-500 ml-1">commission rate</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/vendor/products/new">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <PlusIcon className="h-6 w-6" />
                <span className="text-sm">Add Product</span>
              </Button>
            </Link>
            
            <Link href="/vendor/orders">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <ShoppingBagIcon className="h-6 w-6" />
                <span className="text-sm">View Orders</span>
              </Button>
            </Link>
            
            <Link href="/vendor/analytics">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <ChartBarIcon className="h-6 w-6" />
                <span className="text-sm">Analytics</span>
              </Button>
            </Link>
            
            <Link href="/vendor/profile">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                <UserGroupIcon className="h-6 w-6" />
                <span className="text-sm">Shop Profile</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
            <Link href="/vendor/products">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} showVendor={false} />
                
                {/* Product Actions Overlay */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Link href={`/vendor/products/${product.id}`}>
                    <Button size="sm" variant="outline" className="p-2 bg-white/90 backdrop-blur-sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/vendor/products/${product.id}/edit`}>
                    <Button size="sm" variant="outline" className="p-2 bg-white/90 backdrop-blur-sm">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="p-2 bg-white/90 backdrop-blur-sm text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Stock Status */}
                {product.stock <= product.lowStockThreshold && (
                  <div className="absolute bottom-2 left-2">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      Low Stock ({product.stock})
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBagIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-6">Start selling by adding your first product</p>
              <Link href="/vendor/products/new">
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  Add Your First Product
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
