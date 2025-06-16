// Utility functions for consistent product data display
// These functions ensure that discount percentages and ratings
// remain stable across renders and are based on product data

/**
 * Calculate discount percentage based on original and sale price
 */
export const calculateDiscount = (originalPrice: number, salePrice?: number): number => {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

/**
 * Get rating from product data (use actual avgRating if available)
 */
export const getProductRating = (product: any): number => {
  // Use actual product rating if available, otherwise return 0
  if (product?.avgRating && product.avgRating > 0) {
    return parseFloat(product.avgRating.toFixed(1));
  }
  return 0;
};

/**
 * Get review count from product data (use actual totalReviews if available)
 */
export const getReviewCount = (product: any): number => {
  return product?.totalReviews || 0;
};

/**
 * Check if a product has a valid discount
 */
export const hasValidDiscount = (originalPrice: number, salePrice?: number): boolean => {
  return !!(salePrice && salePrice < originalPrice);
};

/**
 * Format discount badge text
 */
export const getDiscountBadgeText = (originalPrice: number, salePrice?: number): string => {
  const discount = calculateDiscount(originalPrice, salePrice);
  return discount ? `-${discount}%` : 'SALE';
}; 