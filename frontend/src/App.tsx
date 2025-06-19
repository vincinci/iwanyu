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
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

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
import AdminPayments from './pages/AdminPayments';
import { useGlobalPrefetch } from './hooks/useInstantProducts';
import SellerWallet from './pages/SellerWallet';
import AdCampaigns from './pages/seller/AdCampaigns';
import AuthDebugPage from './pages/AuthDebug';
import AdminTest from './pages/AdminTest';
import Deals from './pages/Deals';
import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';
import SellerFlashSales from './pages/SellerFlashSales';
import SellerProfile from './pages/seller/SellerProfile';

// Create global query client with mobile-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - reduced for mobile
      gcTime: 10 * 60 * 1000, // 10 minutes in cache - reduced for mobile
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1, // Quick failure for mobile
      retryDelay: 1000, // Fast retry
      networkMode: 'online',
    },
    mutations: {
      retry: 1, // Reduced for mobile
      retryDelay: 1000,
    },
  },
});

// App Content with Loading Guard
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  // Mobile-specific loading timeout
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const loadingTimeout = isMobile ? 5000 : 8000; // Shorter timeout on mobile

  if (isLoading) {
    return (
      <LoadingSpinner 
        message="Loading Iwanyu Store..."
        timeout={loadingTimeout}
        onTimeout={() => {
          console.warn('Auth loading timeout - forcing app to continue');
          window.location.reload();
        }}
        className="min-h-screen"
      />
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
            
            {/* New Pages */}
            <Route path="/deals" element={<Deals />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/account" element={<Account />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            
            {/* Seller Routes */}
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/wallet" element={<SellerWallet />} />
            <Route path="/seller/ad-campaigns" element={<AdCampaigns />} />
            <Route path="/dashboard/flash-sales" element={<SellerFlashSales />} />
            <Route path="/seller/profile" element={<SellerProfile />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/sellers" element={<AdminSellers />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            
            {/* Debug Routes */}
            <Route path="/auth-debug" element={<AuthDebugPage />} />
            <Route path="/admin-test" element={<AdminTest />} />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

function App() {
  useEffect(() => {
    // Mobile viewport optimization
    const optimizeForMobile = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no';
        document.head.appendChild(meta);
      }

      // Prevent zoom on input focus (mobile safari)
      const style = document.createElement('style');
      style.textContent = `
        @media screen and (-webkit-min-device-pixel-ratio:0) {
          select, textarea, input[type="text"], input[type="password"],
          input[type="datetime"], input[type="datetime-local"],
          input[type="date"], input[type="month"], input[type="time"],
          input[type="week"], input[type="number"], input[type="email"],
          input[type="url"], input[type="search"], input[type="tel"],
          input[type="color"] {
            font-size: 16px !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    optimizeForMobile();
  }, []);

  return (
    <MobileErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppContent />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MobileErrorBoundary>
  );
}

export default App;
