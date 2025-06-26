// Utility functions for consistent product data display
// These functions ensure that discount percentages and ratings
// remain stable across renders and are based on product data

/**
 * Get rating from product data (use actual avgRating if available)
 */
export const getProductRating = (product: any): number => {
  // Use actual product rating if available, otherwise return 0
  if ((product as any)?.avgRating && (product as any).avgRating > 0) {
    return parseFloat((product as any).avgRating.toFixed(1));
  }
  return 0;
};

/**
 * Get review count from product data (use actual totalReviews if available)
 */
export const getReviewCount = (product: any): number => {
  return (product as any)?.totalReviews || 0;
}; 