export const formatPrice = (price: number): string => {
  // Format as number and add RWF suffix to ensure consistent display
  const formattedNumber = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  
  return `RWF ${formattedNumber}`;
};

export const formatPriceNumber = (price: number): string => {
  return new Intl.NumberFormat('en-RW', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}; 