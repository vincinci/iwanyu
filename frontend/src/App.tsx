import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Error Boundary for Mobile Crash Prevention
class MobileErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: React.ErrorInfo }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Mobile App Crash Detected:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mb-4 text-red-500">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">App Loading Error</h1>
            <p className="text-gray-600 mb-4">Something went wrong while loading the app.</p>
            <div className="space-y-2">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              >
                Reload App
              </button>
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Clear Data & Reload
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto text-left">
                  {this.state.error?.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Page Components
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeSeller from './pages/BecomeSeller';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import AdminSellers from './pages/AdminSellers';
import { useGlobalPrefetch } from './hooks/useInstantProducts';
import SellerWallet from './pages/SellerWallet';
import AdCampaigns from './pages/seller/AdCampaigns';
import AuthDebugPage from './pages/AuthDebug';
import AdminTest from './pages/AdminTest';

// Create global query client with ultra-aggressive caching for instant loading
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000, // 30 minutes - very aggressive caching
      gcTime: 60 * 60 * 1000, // 1 hour in cache
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch if data exists
      refetchOnReconnect: false,
      retry: 1, // Quick failure for instant UX
      retryDelay: 500, // Fast retry
      networkMode: 'online', // Only fetch when online
    },
    mutations: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

// Global instant loading initializer
const InstantLoadingInitializer: React.FC = () => {
  const { prefetchEverything } = useGlobalPrefetch();

  useEffect(() => {
    // Check if mobile to reduce prefetching load - with safety check
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Prefetch critical data immediately when app starts - reduced for mobile
    const timer = setTimeout(() => {
      // Only prefetch everything on desktop to prevent mobile crashes
      if (!isMobile) {
        try {
          prefetchEverything();
        } catch (error) {
          console.warn('Prefetching failed, continuing without prefetch:', error);
          // Don't crash the app, just log the warning
        }
      }
    }, isMobile ? 2000 : 100); // Longer delay on mobile

    return () => clearTimeout(timer);
  }, [prefetchEverything]);

  return null;
};

// Performance monitoring
const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Check if mobile to reduce preloading - with safety check
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    // Preload critical resources - reduced for mobile
    const preloadCriticalResources = () => {
      // Only preconnect on desktop to avoid mobile overhead
      if (!isMobile) {
        const preconnectDomains = [
          'https://fonts.googleapis.com',
          'https://fonts.gstatic.com'
        ];

        preconnectDomains.forEach(domain => {
          const link = document.createElement('link');
          link.rel = 'preconnect';
          link.href = domain;
          document.head.appendChild(link);
        });

        // Prefetch DNS for external resources - desktop only
        const dnsPrefetchDomains = [
          'https://cdn.jsdelivr.net',
          'https://unpkg.com'
        ];

        dnsPrefetchDomains.forEach(domain => {
          const link = document.createElement('link');
          link.rel = 'dns-prefetch';
          link.href = domain;
          document.head.appendChild(link);
        });
      }
    };

    preloadCriticalResources();
  }, []);

  return null;
};

// Connection Status Component
const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      console.log('🔗 Checking backend connection...');
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${apiUrl}/../health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsOnline(true);
        console.log('✅ Backend connection healthy');
      } else {
        setIsOnline(false);
        console.warn(`⚠️ Backend unhealthy - Status: ${response.status}`);
      }
    } catch (error) {
      setIsOnline(false);
      console.error('❌ Backend connection failed:', error);
    } finally {
      setIsChecking(false);
      setLastCheck(new Date());
    }
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Regular health checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    // Check on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Page visible - checking connection');
        checkConnection();
      }
    };

    // Check on window focus
    const handleFocus = () => {
      console.log('🎯 Window focused - checking connection');
      checkConnection();
    };

    // Handle browser online/offline events
    const handleOnline = () => {
      console.log('🌐 Browser online');
      checkConnection();
    };

    const handleOffline = () => {
      console.log('🌐 Browser offline');
      setIsOnline(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = () => {
    if (isChecking) return 'bg-yellow-500';
    return isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isOnline ? 'Connected' : 'Disconnected';
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[160px]">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isChecking ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last: {formatTime(lastCheck)}
        </div>
        {!isOnline && (
          <button
            onClick={checkConnection}
            disabled={isChecking}
            className="mt-2 w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize persistent connection monitoring
    const initializeConnectionMonitoring = () => {
      console.log('🔗 Initializing all-time frontend-backend connection...');
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      let isConnectionHealthy = true;
      
      const showConnectionNotification = (message: string, type: 'success' | 'warning' | 'error') => {
        let notification = document.getElementById('connection-notification');
        
        if (!notification) {
          notification = document.createElement('div');
          notification.id = 'connection-notification';
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 16px;
            border-radius: 8px;
            font-family: system-ui, sans-serif;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
          `;
          document.body.appendChild(notification);
        }

        const colors = {
          success: { bg: '#10B981', text: '#FFFFFF' },
          warning: { bg: '#F59E0B', text: '#FFFFFF' },
          error: { bg: '#EF4444', text: '#FFFFFF' }
        };

        const color = colors[type];
        notification.style.backgroundColor = color.bg;
        notification.style.color = color.text;
        notification.textContent = message;

        if (type === 'success') {
          setTimeout(() => {
            if (notification && notification.parentNode) {
              notification.remove();
            }
          }, 3000);
        }
      };

      const performHealthCheck = async (): Promise<boolean> => {
        try {
          console.log('🏥 Checking backend connection...');
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(`${API_BASE_URL}/../health`, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          const healthy = response.ok;
          console.log(`🏥 Health check ${healthy ? 'PASSED' : 'FAILED'} - Status: ${response.status}`);

          if (healthy && !isConnectionHealthy) {
            isConnectionHealthy = true;
            showConnectionNotification('✅ Connection restored', 'success');
            console.log('✅ Backend connection restored');
          } else if (!healthy && isConnectionHealthy) {
            isConnectionHealthy = false;
            showConnectionNotification('❌ Connection lost - retrying...', 'error');
            console.warn('⚠️ Backend connection lost');
          }

          return healthy;
        } catch (error) {
          console.error('🏥 Health check failed:', error);
          
          if (isConnectionHealthy) {
            isConnectionHealthy = false;
            showConnectionNotification('❌ Connection lost - retrying...', 'error');
            console.warn('⚠️ Backend connection lost due to error');
          }
          
          return false;
        }
      };

      // Initial health check
      performHealthCheck();

      // Regular health checks every 30 seconds
      const healthCheckInterval = setInterval(performHealthCheck, 30000);

      // Check connection on page visibility change
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log('👁️ Page visible - checking backend connection');
          performHealthCheck();
        }
      };

      // Check connection on window focus
      const handleFocus = () => {
        console.log('🎯 Window focused - checking backend connection');
        performHealthCheck();
      };

      // Handle browser online/offline events
      const handleOnline = () => {
        console.log('🌐 Browser online - checking backend connection');
        showConnectionNotification('🌐 Internet connected - checking server...', 'warning');
        performHealthCheck();
      };

      const handleOffline = () => {
        console.log('🌐 Browser offline');
        isConnectionHealthy = false;
        showConnectionNotification('🌐 No internet connection', 'error');
      };

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      console.log('✅ Persistent connection monitoring initialized');
      console.log(`🔗 Monitoring API: ${API_BASE_URL}`);
      console.log(`🔗 Health checks every 30 seconds`);

      // Cleanup function
      return () => {
        clearInterval(healthCheckInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        
        const notification = document.getElementById('connection-notification');
        if (notification) {
          notification.remove();
        }
      };
    };

    // Start connection monitoring
    const cleanupConnection = initializeConnectionMonitoring();

    // Optimize loading performance
    const optimizePerformance = () => {
      // Add viewport meta tag for mobile optimization
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
        document.head.appendChild(meta);
      }

      // Only add performance hints that actually exist - with safety check
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      
      if (!isMobile) {
        // Only add resource hints on desktop to prevent mobile performance issues
        // Remove the non-existent font preload that was causing warnings
      }
    };

    optimizePerformance();
    
    // Log connection info
    console.log('🔗 Initializing all-time frontend-backend connection...');
    console.log('🔗 API URL:', import.meta.env.VITE_API_URL);
    console.log('🔗 Environment:', import.meta.env.MODE);
  }, []);

  return (
    <MobileErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <div className="min-h-screen bg-gray-50 flex flex-col">
                  {/* Only initialize on desktop to prevent mobile crashes */}
                  {typeof window !== 'undefined' && window.innerWidth >= 768 && <InstantLoadingInitializer />}
                  <PerformanceMonitor />
                  
                  {/* Connection Status Monitor */}
                  <ConnectionStatus />
                  
                  <Header />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/become-seller" element={<BecomeSeller />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      
                      {/* Seller Routes */}
                      <Route path="/seller/dashboard" element={<SellerDashboard />} />
                      <Route path="/seller/products" element={<SellerProducts />} />
                      <Route path="/seller/wallet" element={<SellerWallet />} />
                      <Route path="/seller/ad-campaigns" element={<AdCampaigns />} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/categories" element={<AdminCategories />} />
                      <Route path="/admin/sellers" element={<AdminSellers />} />
                      
                      {/* Debug Routes */}
                      <Route path="/auth-debug" element={<AuthDebugPage />} />
                      <Route path="/admin-test" element={<AdminTest />} />
                      
                      {/* Catch all route */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MobileErrorBoundary>
  );
}

export default App;
