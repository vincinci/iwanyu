import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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
    // Prefetch critical data immediately when app starts
    const timer = setTimeout(() => {
      prefetchEverything();
    }, 100); // Small delay to not block initial render

    return () => clearTimeout(timer);
  }, [prefetchEverything]);

  return null;
};

// Performance monitoring
const PerformanceMonitor: React.FC = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preconnect to external domains for faster loading
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

      // Prefetch DNS for external resources
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

      // Add performance hints
      const resourceHints = [
        { rel: 'preload', href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
      ];

      resourceHints.forEach(hint => {
        const link = document.createElement('link');
        Object.entries(hint).forEach(([key, value]) => {
          if (key === 'crossOrigin') {
            link.crossOrigin = value as string;
          } else {
            link.setAttribute(key, value as string);
          }
        });
        document.head.appendChild(link);
      });
    };

    optimizePerformance();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                <InstantLoadingInitializer />
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
                    <Route path="/seller" element={<SellerDashboard />} />
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
  );
}

export default App;
