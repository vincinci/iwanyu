interface Product {
  price: number;
  salePrice?: number | null;
  variants?: Array<{
    id: string;
    price?: number | null;
  }>;
}

interface PriceCalculationOptions {
  variantId?: string;
  quantity?: number;
}

/**
 * Calculate the final price for a product considering variants and sale prices
 * This ensures consistent pricing logic across the entire application
 */
export function calculateProductPrice(
  product: Product, 
  options: PriceCalculationOptions = {}
): number {
  const { variantId, quantity = 1 } = options;
  
  // Start with base product price
  let finalPrice = product.price;
  
  // Check if variant is specified and get variant-specific price
  if (variantId && product.variants) {
    const variant = product.variants.find(v => v.id === variantId);
    if (variant && variant.price && variant.price > 0) {
      finalPrice = variant.price;
    }
  }
  
  // Apply sale price if available and lower than current price
  if (product.salePrice && product.salePrice < finalPrice) {
    finalPrice = product.salePrice;
  }
  
  return finalPrice * quantity;
}

/**
 * Calculate order subtotal from order items
 */
export function calculateOrderSubtotal(
  items: Array<{
    product: Product;
    quantity: number;
    variantId?: string;
  }>
): number {
  return items.reduce((total, item) => {
    return total + calculateProductPrice(item.product, {
      variantId: item.variantId,
      quantity: item.quantity
    });
  }, 0);
}

/**
 * Calculate final order total including shipping and taxes
 */
export function calculateOrderTotal(
  subtotal: number,
  options: {
    shipping?: number;
    tax?: number;
    discount?: number;
  } = {}
): number {
  const { shipping = 1500, tax = 0, discount = 0 } = options;
  return subtotal - discount + shipping + tax;
}

export default {
  calculateProductPrice,
  calculateOrderSubtotal,
  calculateOrderTotal
}; 