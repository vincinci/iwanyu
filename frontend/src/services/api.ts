import axios from 'axios';
import type { 
  Product, 
  Category, 
  User, 
  ProductsQueryParams 
} from '../types/api';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('API Base URL:', API_BASE_URL); // Debug log to check URL
console.log('🔗 Initializing persistent connection API service...');

// Enhanced API instance with persistent connection and retry capabilities
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for better connection persistence
  headers: {
    'Content-Type': 'application/json',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  },
  // Enable persistent connections
  withCredentials: true,
});

// Connection health check functionality
let isConnected = true;
let lastHealthCheck = new Date();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

// Health check function
const performHealthCheck = async (): Promise<boolean> => {
  try {
    console.log('🏥 API Health Check: Testing connection...');
    const response = await axios.get(`${API_BASE_URL}/../health`, {
      timeout: 5000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const healthy = response.status === 200;
    console.log(`🏥 API Health Check: ${healthy ? 'PASS' : 'FAIL'} - Status: ${response.status}`);
    
    lastHealthCheck = new Date();
    
    if (healthy) {
      isConnected = true;
      reconnectAttempts = 0;
      showConnectionStatus('Connected to server', 'success');
    } else {
      isConnected = false;
    }
    
    return healthy;
  } catch (error) {
    console.error('🏥 API Health Check: FAILED -', error);
    isConnected = false;
    return false;
  }
};

// Show connection status to user
const showConnectionStatus = (message: string, type: 'success' | 'warning' | 'error') => {
  // Only show in browser environment
  if (typeof window === 'undefined') return;
  
  let notification = document.getElementById('api-connection-status');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'api-connection-status';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 10000;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      font-weight: 500;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      max-width: 250px;
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

  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 2000);
  }
};

// Enhanced retry mechanism with exponential backoff
const retryRequest = async (error: any, retryCount = 0): Promise<any> => {
  const maxRetries = 3;
  const baseDelay = 1000;
  
  if (retryCount >= maxRetries) {
    console.error(`🔄 API Retry: Max retries (${maxRetries}) exceeded`);
    throw error;
  }

  // Don't retry certain errors
  if (error.response && [401, 403, 404].includes(error.response.status)) {
    console.log(`🔄 API Retry: Not retrying ${error.response.status} error`);
    throw error;
  }

  const delay = baseDelay * Math.pow(2, retryCount);
  console.log(`🔄 API Retry: Attempt ${retryCount + 1}/${maxRetries} in ${delay}ms`);
  
  showConnectionStatus(`Retrying connection... (${retryCount + 1}/${maxRetries})`, 'warning');
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Perform health check before retry
  const isHealthy = await performHealthCheck();
  if (!isHealthy) {
    console.warn('🔄 API Retry: Health check failed, but attempting retry anyway');
  }
  
  try {
    // Retry the original request
    const response = await api.request(error.config);
    showConnectionStatus('Connection restored', 'success');
    return response;
  } catch (retryError) {
    return retryRequest(retryError, retryCount + 1);
  }
};

// Start health checks when API is initialized
if (typeof window !== 'undefined') {
  // Initial health check
  performHealthCheck();
  
  // Regular health checks every 30 seconds
  setInterval(performHealthCheck, 30000);
  
  // Health check on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('👁️ Page visible - checking API connection');
      performHealthCheck();
    }
  });
  
  // Health check on window focus
  window.addEventListener('focus', () => {
    console.log('🎯 Window focused - checking API connection');
    performHealthCheck();
  });
  
  // Handle online/offline events
  window.addEventListener('online', () => {
    console.log('🌐 Browser online - checking API connection');
    showConnectionStatus('Internet connected - checking server...', 'warning');
    performHealthCheck();
  });
  
  window.addEventListener('offline', () => {
    console.log('🌐 Browser offline');
    showConnectionStatus('No internet connection', 'error');
    isConnected = false;
  });
}

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Add connection persistence headers
      config.headers['Connection'] = 'keep-alive';
      config.headers['Keep-Alive'] = 'timeout=30, max=100';
      
      console.log(`🔗 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
      // Continue without token
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with automatic retry
api.interceptors.response.use(
  (response) => {
    // Connection successful
    if (!isConnected) {
      console.log('✅ API Response: Connection restored');
      isConnected = true;
      reconnectAttempts = 0;
    }
    
    console.log(`✅ API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    console.error('❌ API Error intercepted:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
      isNetworkError: !error.response && error.message.includes('Network Error'),
      isTimeoutError: error.code === 'ECONNABORTED'
    });

    // Handle connection errors with automatic retry
    if (!error.response || error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
      console.warn('🔗 API Connection Error - attempting automatic retry');
      isConnected = false;
      showConnectionStatus('Connection lost - retrying...', 'error');
      
      try {
        return await retryRequest(error);
      } catch (retryError) {
        showConnectionStatus('Unable to connect to server', 'error');
        console.error('🔗 API Retry failed:', retryError);
        return Promise.reject(retryError);
      }
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      console.warn('⏰ Request timeout - backend might be slow or unavailable');
      showConnectionStatus('Request timeout - server may be slow', 'warning');
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    // Handle 401 errors (authentication)
    if (error.response?.status === 401) {
      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(
        typeof window !== 'undefined' ? window.location.pathname : '/'
      );
      const isAuthValidation = error.config?.url?.includes('/auth/validate');
      
      console.log('🔐 401 Error details:', {
        isAuthPage,
        isAuthValidation,
        url: error.config?.url,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '/'
      });

      if (!isAuthValidation) {
        console.log('🔐 Clearing auth storage due to 401 error');
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (storageError) {
          console.warn('Failed to clear localStorage:', storageError);
        }
        
        if (!isAuthPage && typeof window !== 'undefined') {
          console.log('🔐 Redirecting to login due to 401 error');
          showConnectionStatus('Session expired - redirecting to login', 'warning');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      } else {
        console.log('🔐 Ignoring 401 from auth validation endpoint');
      }
    }
    
    return Promise.reject(error);
  }
);

// Products API
export const productsApi = {
  getAll: async (params: ProductsQueryParams = {}) => {
    const response = await api.get('/products', { params });
    // Backend returns { success: true, data: { products: [...], pagination: {...} } }
    // Frontend expects { data: { products: [...], pagination: {...} } }
    return response.data; // Use the response data directly since it already has the correct structure
  },
  getById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data; // Use response data directly
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data; // Use response data directly since backend returns { success: true, data: { categories: [...] } }
  },
};

// Auth API
export const authApi = {
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return { data: response.data };
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return { data: response.data };
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return { data: response.data };
  },
  resetPassword: async (token: string, password: string) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return { data: response.data };
  },
  verifyResetToken: async (token: string) => {
    const response = await api.get(`/auth/verify-reset-token/${token}`);
    return { data: response.data };
  },
};

// --- Seller Flash Sales ---
export const getSellerFlashSales = async () => {
  return api.get('/seller/flash-sales');
};

export const createSellerFlashSale = async (data: {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}) => {
  return api.post('/seller/flash-sales', data);
};

export const getSellerDiscountedProducts = async () => {
  return api.get('/seller/discounted-products');
};

export const addProductToFlashSale = async (flashSaleId: string, productId: string) => {
  return api.post(`/seller/flash-sales/${flashSaleId}/add-product`, { productId });
};

export const removeProductFromFlashSale = async (flashSaleId: string, productId: string) => {
  return api.delete(`/seller/flash-sales/${flashSaleId}/remove-product/${productId}`);
};

export default api; 