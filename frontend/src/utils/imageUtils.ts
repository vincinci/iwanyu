// Utility functions for handling product images

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', ''); // Remove /api to get base backend URL

/**
 * Converts a product image path to a full URL
 * @param imagePath - The image path from the database (could be local path or external URL)
 * @returns Full URL for the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) {
    return null;
  }

  // If it's already a full URL (starts with http:// or https://), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local path (starts with uploads/), prepend backend URL
  if (imagePath.startsWith('uploads/')) {
    return `${BACKEND_BASE_URL}/${imagePath}`;
  }

  // If it's a relative path without uploads/, assume it's in uploads/products/
  if (!imagePath.startsWith('/')) {
    return `${BACKEND_BASE_URL}/uploads/products/${imagePath}`;
  }

  // For absolute paths, prepend backend URL
  return `${BACKEND_BASE_URL}${imagePath}`;
};

/**
 * Gets the primary image URL for a product
 * @param product - Product object with image and images properties
 * @returns Primary image URL or null
 */
export const getProductImageUrl = (product: { image?: string; images?: string[] | null }): string | null => {
  // Try to get from images array first (check for null and empty array)
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }

  // Fall back to single image field
  if (product.image) {
    return getImageUrl(product.image);
  }

  return null;
};

/**
 * Gets all image URLs for a product
 * @param product - Product object with image and images properties
 * @returns Array of image URLs
 */
export const getProductImageUrls = (product: { image?: string; images?: string[] | null }): string[] => {
  const urls: string[] = [];

  // Add images from images array (check for null and empty array)
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    product.images.forEach(imagePath => {
      const url = getImageUrl(imagePath);
      if (url) {
        urls.push(url);
      }
    });
  }

  // If no images in array, try single image field
  if (urls.length === 0 && product.image) {
    const url = getImageUrl(product.image);
    if (url) {
      urls.push(url);
    }
  }

  return urls;
};

/**
 * Checks if an image URL is valid and accessible
 * @param imageUrl - The image URL to check
 * @returns Promise that resolves to true if image is accessible
 */
export const isImageAccessible = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Gets a fallback image URL for products without images
 * @returns Fallback image URL
 */
export const getFallbackImageUrl = (): string => {
  return `${BACKEND_BASE_URL}/images/product-placeholder.png`;
};
