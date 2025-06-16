import React, { useEffect } from 'react';
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

function App() {
  useEffect(() => {
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

      // Remove font preload since fonts don't exist - this was causing warnings
      // Only add performance hints that actually exist - with safety check
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      
      if (!isMobile) {
        // Only add resource hints on desktop to prevent mobile performance issues
        // Remove the non-existent font preload that was causing warnings
      }
    };

    optimizePerformance();
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
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/orders" element={<Orders />} />
                      
                      {/* Seller Routes */}
                      <Route path="/seller/dashboard" element={<SellerDashboard />} />
                      <Route path="/seller/products" element={<SellerProducts />} />
                      <Route path="/seller/wallet" element={<SellerWallet />} />
                      <Route path="/seller/ad-campaigns" element={<AdCampaigns />} />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/admin/products" element={<AdminProducts />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/categories" element={<AdminCategories />} />
                      <Route path="/admin/sellers" element={<AdminSellers />} />
                      
                      {/* Debug Route */}
                      <Route path="/auth-debug" element={<AuthDebugPage />} />
                      
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
