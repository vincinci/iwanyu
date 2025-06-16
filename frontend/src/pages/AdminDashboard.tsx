import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Store, 
  Package, 
  ShoppingCart, 
  Layers, 
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminApi } from '../services/adminApi';
import { formatPrice } from '../utils/currency';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdminDashboard Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
            <p className="text-gray-600 mb-4">
              Something went wrong while loading the dashboard.
            </p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="btn-primary"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      console.log('AdminDashboard: Starting query function');
      console.log('AdminDashboard: User:', user);
      console.log('AdminDashboard: Token exists:', !!localStorage.getItem('token'));
      
      try {
        const result = await adminApi.getDashboard();
        console.log('AdminDashboard: Query successful:', result);
        return result;
      } catch (err) {
        console.error('AdminDashboard: Query failed:', err);
        throw err;
      }
    },
    enabled: !!user && user.role === 'ADMIN',
    retry: 1,
    retryDelay: 1000,
  });

  // Move useMemo before conditional returns to fix hooks order
  const sellerStatusMap = React.useMemo(() => {
    if (!dashboard?.sellerStatusCounts) return {};
    
    return dashboard.sellerStatusCounts.reduce((acc: any, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});
  }, [dashboard?.sellerStatusCounts]);

  // Log errors and data for debugging
  React.useEffect(() => {
    if (error) {
      console.error('Dashboard query error:', error);
    }
    if (dashboard) {
      console.log('Dashboard data loaded:', dashboard);
    }
  }, [error, dashboard]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">Unable to load admin dashboard.</p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary w-full"
            >
              Try Again
            </button>
            <button 
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear Data & Re-login
            </button>
          </div>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify({
                error: error?.message || 'Unknown error',
                hasToken: !!localStorage.getItem('token'),
                user: user ? { id: user.id, role: user.role, email: user.email } : null,
                timestamp: new Date().toISOString()
              }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: Users,
      path: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Seller Management',
      description: 'Approve and manage sellers',
      icon: Store,
      path: '/admin/sellers',
      color: 'bg-green-500'
    },
    {
      title: 'Product Management',
      description: 'Manage all products',
      icon: Package,
      path: '/admin/products',
      color: 'bg-purple-500'
    },
    {
      title: 'Order Management',
      description: 'View and manage orders',
      icon: ShoppingCart,
      path: '/admin/orders',
      color: 'bg-orange-500'
    },
    {
      title: 'Category Management',
      description: 'Manage product categories',
      icon: Layers,
      path: '/admin/categories',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <ErrorBoundary>
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

            <div className="flex items-center gap-4 mb-6">
              <img 
                src="/iwanyu logo.png" 
                alt="Iwanyu Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {user?.firstName || user?.email || ''}! Here's what's happening with your store.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard?.overview.userCount || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard?.overview.sellerCount || 0}</p>
                </div>
                <Store className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard?.overview.productCount || 0}</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard?.overview.orderCount || 0}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categories</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboard?.overview.categoryCount || 0}</p>
                </div>
                <Layers className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </motion.div>

          {/* Seller Status Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Sellers</p>
                  <p className="text-2xl font-bold text-yellow-600">{sellerStatusMap.PENDING || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Sellers</p>
                  <p className="text-2xl font-bold text-green-600">{sellerStatusMap.APPROVED || 0}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected Sellers</p>
                  <p className="text-2xl font-bold text-red-600">{sellerStatusMap.REJECTED || 0}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended Sellers</p>
                  <p className="text-2xl font-bold text-gray-600">{sellerStatusMap.SUSPENDED || 0}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-gray-500" />
              </div>
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm mb-8"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                <button
                  onClick={() => navigate('/admin/orders')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  View All
                </button>
              </div>
            </div>

            {!dashboard?.recentOrders?.length ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Orders</h3>
                <p className="text-gray-600">Orders will appear here as they come in.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {dashboard.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Order #{order.orderNumber || order.id.slice(-8)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {(order.user?.firstName || order.user?.email || 'Unknown User')} • {order.orderItems?.length || 0} items
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatPrice(order.total || 0)}
                        </p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'PROCESSING' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                          order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {order.status || 'UNKNOWN'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.path}
                    onClick={() => navigate(action.path)}
                    className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:border-orange-300 transition-colors text-left group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard; 