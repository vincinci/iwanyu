import axios from 'axios';
import type { 
  ProductsQueryParams 
} from '../types/api';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://iwanyu-api.onrender.com/api';

// Request throttling to prevent overwhelming the backend
class RequestThrottler {
  private queue: Array<() => Promise<any>> = [];
  private running = 0;
  private maxConcurrent = 3; // Limit concurrent requests for Render free tier
  private delay = 100; // Minimum delay between requests

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++;
          // Add small delay to prevent burst requests
          if (this.running > 1) {
            await new Promise(resolve => setTimeout(resolve, this.delay));
          }
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processQueue();
        }
      });
      this.processQueue();
    });
  }

  private processQueue() {
    if (this.running < this.maxConcurrent && this.queue.length > 0) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }
}

const throttler = new RequestThrottler();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for slower backends
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
  (error: any) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors and auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;
    
    // Log error details for debugging
    console.log('API Error:', {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method,
      errorCode: error.response?.data?.code,
      errorMessage: error.response?.data?.error,
      isNetworkError: !error.response && error.message.includes('Network Error')
    });

    // Network errors
    if (!error.response) {
      if (error.message.includes('Network Error')) {
        return Promise.reject(new Error('Unable to connect to server. Please check your connection and try again.'));
      }
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('The request timed out. Please try again.'));
      }
    }

    // Handle 502 Bad Gateway with retry
    if (error.response?.status === 502 && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(originalRequest);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      const errorCode = error.response.data?.code;
      
      // Don't auto-logout for login/register attempts
      if (!originalRequest.url.includes('/login') && !originalRequest.url.includes('/register')) {
        const shouldClearAuth = [
          'TOKEN_EXPIRED',
          'TOKEN_INVALID',
          'USER_NOT_FOUND',
          'ACCOUNT_INACTIVE'
        ].includes(errorCode);

        if (shouldClearAuth) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      
      // Provide user-friendly error messages
      switch (errorCode) {
        case 'TOKEN_EXPIRED':
          error.message = 'Your session has expired. Please sign in again.';
          break;
        case 'TOKEN_INVALID':
          error.message = 'Invalid authentication. Please sign in again.';
          break;
        case 'USER_NOT_FOUND':
          error.message = 'Account not found. Please sign in again.';
          break;
        case 'ACCOUNT_INACTIVE':
          error.message = 'Your account is inactive. Please contact support.';
          break;
        default:
          error.message = error.response.data?.error || 'Authentication failed';
      }
    }

    return Promise.reject(error);
  }
);

// Throttled request wrapper
const throttledRequest = async <T>(request: () => Promise<T>): Promise<T> => {
  return throttler.add(request);
};

// Products API with throttling
export const productsApi = {
  getAll: async (params: ProductsQueryParams = {}) => {
    return throttledRequest(async () => {
      const response = await api.get('/products', { params });
      return response.data;
    });
  },
  getById: async (id: string) => {
    return throttledRequest(async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    });
  },
};

// Categories API with throttling
export const categoriesApi = {
  getAll: async () => {
    return throttledRequest(async () => {
      const response = await api.get('/categories');
      return response.data;
    });
  },
  getById: async (id: string) => {
    return throttledRequest(async () => {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    });
  },
};

// Auth API with throttling
export const authApi = {
  login: async (email: string, password: string) => {
    return throttledRequest(async () => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    });
  },
  register: async (userData: any) => {
    return throttledRequest(async () => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    });
  },
  validateToken: async () => {
    return throttledRequest(async () => {
      const response = await api.get('/auth/validate');
      return response.data;
    });
  },
  logout: async () => {
    return throttledRequest(async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    });
  },
};

// Export the axios instance for direct use when needed
export default api;