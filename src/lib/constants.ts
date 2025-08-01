/**
 * Application constants
 */

// Currency Configuration for Rwanda
export const CURRENCY = {
  CODE: 'RWF',
  SYMBOL: 'RWF',
  NAME: 'Rwandan Franc',
  LOCALE: 'en-RW',
  DECIMALS: 0, // RWF typically doesn't use decimals
} as const;

// Payment Methods (for future Flutterwave integration)
export const PAYMENT_METHODS = {
  MOBILE_MONEY: 'mobile_money',
  BANK_TRANSFER: 'bank_transfer',
  CARD: 'card',
} as const;

// Rwandan Mobile Money Providers
export const MOBILE_MONEY_PROVIDERS = {
  MTN_MOMO: 'mtn_momo',
  AIRTEL_MONEY: 'airtel_money',
} as const;

// Application Info
export const APP_INFO = {
  NAME: 'iwanyu',
  DESCRIPTION: 'Rwanda\'s Premier Marketplace',
  COUNTRY: 'Rwanda',
  COUNTRY_CODE: 'RW',
  LANGUAGE: 'en',
} as const;

// Business Constants
export const BUSINESS = {
  MIN_PRODUCT_PRICE: 100, // Minimum price in RWF
  MAX_PRODUCT_PRICE: 10000000, // Maximum price in RWF (10M RWF)
  DEFAULT_SHIPPING_FEE: 1000, // Default shipping in RWF
  FREE_SHIPPING_THRESHOLD: 50000, // Free shipping threshold in RWF
  DEFAULT_COMMISSION_RATE: 0.05, // 5% commission
} as const;
