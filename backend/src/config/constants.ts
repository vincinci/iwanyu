// Backend configuration constants
export const SHIPPING_COST = 1500; // Fixed delivery fee in RWF

export const ORDER_CONFIG = {
  MAX_ITEMS_PER_ORDER: 50,
  DEFAULT_TAX_RATE: 0,
  DEFAULT_SHIPPING_COST: SHIPPING_COST,
};

export const PAYMENT_CONFIG = {
  TIMEOUT: 15000,
  SUPPORTED_CURRENCIES: ['RWF'],
  DEFAULT_CURRENCY: 'RWF',
};

export const PRODUCT_CONFIG = {
  MAX_IMAGES: 10,
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
};

export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
};

export default {
  SHIPPING_COST,
  ORDER_CONFIG,
  PAYMENT_CONFIG,
  PRODUCT_CONFIG,
  API_CONFIG,
}; 