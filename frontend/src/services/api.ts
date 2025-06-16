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

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout to prevent hanging
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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

// Handle response errors and auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error intercepted:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : '/',
      isNetworkError: !error.response && error.message.includes('Network Error')
    });

    // Handle network errors gracefully (backend not running, no internet, etc.)
    if (!error.response && error.code === 'ECONNABORTED') {
      console.warn('Request timeout - backend might be slow or unavailable');
      return Promise.reject(new Error('Request timeout. Please check your connection.'));
    }

    if (!error.response && error.message.includes('Network Error')) {
      console.warn('Network error - backend might not be running');
      return Promise.reject(new Error('Unable to connect to server. Please try again later.'));
    }

    if (error.response?.status === 401) {
      // Don't redirect if we're already on auth pages or if this is an auth validation call
      const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password'].includes(
        typeof window !== 'undefined' ? window.location.pathname : '/'
      );
      const isAuthValidation = error.config?.url?.includes('/auth/validate');
      
      console.log('401 Error details:', {
        isAuthPage,
        isAuthValidation,
        url: error.config?.url,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '/'
      });

      // Only clear storage and redirect if it's not an auth validation call
      if (!isAuthValidation) {
        console.log('Clearing auth storage due to 401 error');
        try {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } catch (storageError) {
          console.warn('Failed to clear localStorage:', storageError);
        }
        
        // Only redirect if we're not already on an auth page and window is available
        if (!isAuthPage && typeof window !== 'undefined') {
          console.log('Redirecting to login due to 401 error');
          window.location.href = '/login';
        }
      } else {
        console.log('Ignoring 401 from auth validation endpoint');
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