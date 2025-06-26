// Application constants
export const SHIPPING_COST = 1500; // Shipping cost in RWF

export const API_CONFIG = {
  TIMEOUT: 15000,
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
};

export const PAYMENT_CONFIG = {
  TIMEOUT: 15000,
  REDIRECT_TIMEOUT: 30000,
};

export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
};

export default {
  SHIPPING_COST,
  API_CONFIG,
  PAYMENT_CONFIG,
  IMAGE_CONFIG,
  PAGINATION,
}; 