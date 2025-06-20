import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, TrendingUp, Clock, User, AlertCircle, ArrowLeft, Wallet, Megaphone, DollarSign, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sellerApi } from '../services/sellerApi';
import { formatPrice } from '../utils/currency';
import { walletApi } from '../services/walletApi';
import ProductImport from '../components/ProductImport';

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [showImportModal, setShowImportModal] = React.useState(false);

  React.useEffect(() => {
    // Check localStorage immediately for instant response
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // If no stored auth data, redirect immediately
    if (!storedToken || !storedUser) {
      navigate('/login');
      return;
    }
    
    // If we have stored data but user context isn't loaded yet, wait a bit
    if (!user) {
      return;
    }
    
    // Check user role once user is loaded
    if (user.role !== 'SELLER') {
      navigate('/become-seller');
    }
  }, [user, navigate]);

  const { data: dashboard, isLoading} = useQuery({
    queryKey: ['seller-dashboard'],
    queryFn: sellerApi.getDashboard,
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: profile, isLoading: profileLoading} = useQuery({
    queryKey: ['seller-profile'],
    queryFn: sellerApi.getProfile,
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: walletSummary } = useQuery({
    queryKey: ['wallet-summary'],
    queryFn: walletApi.getWalletSummary,
    enabled: !!user && user.role === 'SELLER',
  });

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle specific error cases
  if (error || profileError) {
    const errorMessage = (isError as any)?.message || (profileError as any)?.message || 'Unknown error';
    
    // If user is not a seller or doesn't have seller profile
    if (errorMessage.includes('Seller profile not found') || errorMessage.includes('not found')) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <User className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Profile Required</h2>
            <p className="text-gray-600 mb-4">
              You need to create a seller profile to access the seller dashboard.
            </p>
            <button 
              onClick={() => navigate('/become-seller')} 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors mr-2"
            >
              Become a Seller
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    // General error fallback
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">
            {errorMessage.includes('Failed to get') 
              ? 'Unable to load your seller dashboard. Please check your connection and try again.'
              : errorMessage
            }
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/become-seller')} 
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Check Seller Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {profile?.businessName || user?.firstName || 'Seller'}!
          </p>
          
          {profile?.status === 'PENDING' && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">Application Pending</span>
              </div>
              <p className="text-gray-700 text-sm mt-1">
                Your seller application is being reviewed. You'll be notified once approved.
              </p>
            </div>
          )}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.productCount || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalOrders || 0}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.totalSales || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold text-gray-900">{dashboard?.productCount || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </motion.div>

        {/* Wallet Balance Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(walletSummary?.availableBalance || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Ready to withdraw</p>
            </div>
            <Wallet className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Flash Sales Management Link */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/dashboard/flash-sales')}
            className="bg-yellow-400 hover:bg-gray-500 text-black font-bold py-2 px-4 rounded shadow-md transition-colors"
          >
            Manage Flash Sales
          </button>
          <button
            onClick={() => navigate('/seller/ad-campaigns')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded shadow-md transition-colors flex items-center gap-2"
          >
            <Megaphone className="w-4 h-4" />
            Ad Campaigns
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-md transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import Products
          </button>
        </div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          </div>

          {!dashboard?.recentOrders?.length ? (
            <div className="p-8 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-4">
                Once customers start ordering your products, they'll appear here.
              </p>
              <button
                onClick={() => navigate('/seller/products')}
                className="btn-primary"
              >
                Add Products
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {dashboard.recentOrders.map((orderItem) => {
                // Add comprehensive null safety checks
                if (!orderItem || !orderItem.product || !orderItem.order) {
                  return null;
                }

                const product = orderItem.product;
                const order = orderItem.order;
                const user = order.user;

                return (
                  <div key={orderItem.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {(product as any).image ? (
                          <img
                            src={(product as any).image}
                            alt={(product as any).name || 'Product'}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {(product as any).name || 'Unknown Product'}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>
                              {user?.firstName || user?.email || 'Guest User'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice((orderItem.price || 0) * (orderItem.quantity || 0))}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {orderItem.quantity || 0}
                        </p>
                        <p className="text-sm text-gray-500">
                          {orderItem.createdAt ? new Date(orderItem.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <button
            onClick={() => navigate('/seller/products')}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-400 transition-colors text-left"
          >
            <Package className="w-6 h-6 text-gray-600 mb-2" />
            <h3 className="font-medium text-gray-900">Manage Products</h3>
            <p className="text-sm text-gray-600">Add, edit, or remove your products</p>
          </button>

          <button
            onClick={() => navigate('/seller/profile')}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-400 transition-colors text-left"
          >
            <User className="w-6 h-6 text-gray-600 mb-2" />
            <h3 className="font-medium text-gray-900">Seller Profile</h3>
            <p className="text-sm text-gray-600">Update your business information</p>
          </button>

          <button
            onClick={() => navigate('/seller/wallet')}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-green-300 transition-colors text-left"
          >
            <Wallet className="w-6 h-6 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900">Wallet & Earnings</h3>
            <p className="text-sm text-gray-600">View earnings and withdraw funds</p>
          </button>

          <button
            onClick={() => navigate('/seller/ad-campaigns')}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-400 transition-colors text-left"
          >
            <Megaphone className="w-6 h-6 text-gray-600 mb-2" />
            <h3 className="font-medium text-gray-900">Ad Campaigns</h3>
            <p className="text-sm text-gray-600">Promote your products with ads</p>
          </button>
        </motion.div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ProductImport
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            setShowImportModal(false);
            // Optionally refresh dashboard data
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default SellerDashboard; 