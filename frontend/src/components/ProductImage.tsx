import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { getProductImageUrl } from '../utils/imageUtils';

interface ProductImageProps {
  product: {
    image?: string;
    images?: string[] | null;
    name: string;
  };
  className?: string;
  placeholderSize?: number;
  loading?: 'lazy' | 'eager';
}

const ProductImage: React.FC<ProductImageProps> = ({
  product,
  className = "w-full h-40 object-cover",
  placeholderSize = 32,
  loading = 'lazy'
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageUrl = getProductImageUrl(product);
  const showPlaceholder = !imageUrl || imageError;

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn('Image failed to load:', {
      src: e.currentTarget.src,
      product: (product as any).name,
      originalImage: (product as any).image,
      allImages: (product as any).images
    });
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    console.log('Image loaded successfully:', imageUrl);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Loading skeleton */}
      {!imageLoaded && !showPlaceholder && (
        <div className={`${className} bg-gray-200 animate-pulse`} />
      )}
      
      {/* Main image */}
      {imageUrl && !imageError && (
        <img
          src={imageUrl}
          alt={(product as any).name}
          className={`${className} transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={loading}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}
      
      {/* Placeholder */}
      {showPlaceholder && (
        <div className={`${className} bg-gray-100 flex items-center justify-center`}>
          <Package className="text-gray-400" size={placeholderSize} />
        </div>
      )}
    </div>
  );
};

export default ProductImage; 