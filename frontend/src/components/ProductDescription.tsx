import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Package, 
  Truck, 
  RotateCcw, 
  Shield, 
  Star
} from 'lucide-react';
import type { Product } from '../types/api';

interface ProductDescriptionProps {
  product: Product;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const getEnhancedDescription = () => {
    if (product.description && product.description.trim().length > 50) {
      return product.description;
    }

    // Generate enhanced description based on category
    const category = product.category?.name.toLowerCase() || '';
    
    if (category.includes('shoe') || category.includes('footwear')) {
      return `Experience premium comfort and style with these exceptional ${(product as any).name}. Crafted with high-quality materials and innovative design, these shoes offer superior comfort for all-day wear. Features include breathable construction, durable outsole, and contemporary styling that complements any outfit. Perfect for both casual and semi-formal occasions.`;
    }
    
    if (category.includes('clothing') || category.includes('apparel') || category.includes('shirt') || category.includes('t-shirt')) {
      return `Discover the perfect blend of comfort and style with this premium ${(product as any).name}. Made from high-quality materials that ensure durability and comfort throughout the day. Features modern cut and design that flatters all body types. Easy care fabric that maintains its shape and color wash after wash. A versatile piece that's perfect for any wardrobe.`;
    }
    
    if (category.includes('electronics') || category.includes('tech')) {
      return `Experience cutting-edge technology with the ${(product as any).name}. This premium device combines innovative features with user-friendly design to deliver exceptional performance. Built with high-quality components for reliability and longevity. Features advanced functionality that enhances your daily activities while maintaining ease of use.`;
    }
    
    if (category.includes('home') || category.includes('kitchen')) {
      return `Transform your space with the premium ${(product as any).name}. Expertly designed to combine functionality with aesthetic appeal. Made from high-quality materials that ensure durability and long-lasting performance. Features thoughtful design elements that enhance both form and function in your home.`;
    }
    
    if (category.includes('sports') || category.includes('fitness')) {
      return `Elevate your performance with the ${(product as any).name}. Engineered for athletes and fitness enthusiasts who demand the best. Features advanced materials and design that enhance performance while providing comfort and durability. Perfect for training, competition, or recreational activities.`;
    }
    
    return `Discover the exceptional quality and craftsmanship of the ${(product as any).name}. This premium product combines innovative design with superior materials to deliver outstanding performance and value. Features thoughtful details and construction that ensure long-lasting satisfaction and reliability.`;
  };

  const getSpecifications = () => {
    const specs = [
      { label: 'Brand', value: product.brand || 'Premium Brand', icon: <Star size={16} /> },
      { label: 'SKU', value: product.sku || 'N/A', icon: <Package size={16} /> },
      { label: 'Stock', value: `${(product as any).stock} available`, icon: <Package size={16} /> }
    ];

    // Add category-specific specs
    const category = product.category?.name.toLowerCase() || '';
    
    if (category.includes('shoe') || category.includes('footwear')) {
      specs.push(
        { label: 'Material', value: 'Premium Leather & Synthetic', icon: <Package size={16} /> },
        { label: 'Sole Type', value: 'Rubber Outsole', icon: <Package size={16} /> },
        { label: 'Closure', value: 'Lace-up', icon: <Package size={16} /> },
        { label: 'Care Instructions', value: 'Wipe clean with damp cloth', icon: <Package size={16} /> }
      );
    } else if (category.includes('clothing')) {
      specs.push(
        { label: 'Material', value: '100% Premium Cotton', icon: <Package size={16} /> },
        { label: 'Fit', value: 'Regular Fit', icon: <Package size={16} /> },
        { label: 'Care Instructions', value: 'Machine wash cold', icon: <Package size={16} /> },
        { label: 'Origin', value: 'Imported', icon: <Package size={16} /> }
      );
    } else if (category.includes('electronics')) {
      specs.push(
        { label: 'Warranty', value: '1 Year Manufacturer Warranty', icon: <Shield size={16} /> },
        { label: 'Power', value: 'AC/DC Compatible', icon: <Package size={16} /> }
      );
    }

    // Add variants as specifications
    if ((product as any).variants && (product as any).variants.length > 0) {
      const variantTypes = [...new Set((product as any).variants.map((v: any) => v.name))];
      variantTypes.forEach(type => {
        const values = (product as any).variants!
          .filter((v: any) => v.name === type)
          .map((v: any) => v.value)
          .join(', ');
        specs.push({ 
          label: `Available ${type}s`, 
          value: values, 
          icon: <Package size={16} /> 
        });
      });
    }

    return specs;
  };

  const description = getEnhancedDescription();
  const shouldTruncate = description.length > 300;
  const displayDescription = shouldTruncate && !showFullDescription 
    ? description.substring(0, 300) + '...' 
    : description;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Product Description */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
        <div className="prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed mb-4">
            {displayDescription}
          </p>
          
          {shouldTruncate && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              {showFullDescription ? (
                <>
                  <span>Show Less</span>
                  <ChevronUp size={16} className="ml-1" />
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <ChevronDown size={16} className="ml-1" />
                </>
              )}
            </button>
          )}
        </div>

        {/* Key Features */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Key Features</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Shield className="text-green-600" size={20} />
              <span className="text-green-800 font-medium">Quality Guaranteed</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Truck className="text-blue-600" size={20} />
              <span className="text-blue-800 font-medium">Fast Shipping</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Star className="text-purple-600" size={20} />
              <span className="text-purple-800 font-medium">Top Rated</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <RotateCcw className="text-gray-600" size={20} />
              <span className="text-gray-800 font-medium">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
        <div className="space-y-4">
          {getSpecifications().map((spec, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                {spec.icon}
                <span className="font-medium text-gray-900">{spec.label}</span>
              </div>
              <span className="text-gray-600">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Returns */}
      <div className="border-t border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping & Returns</h3>
        <div className="space-y-6">
          {/* Shipping Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Truck className="mr-2 text-blue-600" size={18} />
              Shipping Information
            </h4>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p className="text-blue-800"><strong>Free Shipping:</strong> On orders over 50,000 RWF</p>
              <p className="text-blue-800"><strong>Standard Delivery:</strong> 2-5 business days</p>
              <p className="text-blue-800"><strong>Express Delivery:</strong> 1-2 business days (additional charges apply)</p>
              <p className="text-blue-800"><strong>Same Day Delivery:</strong> Available in Kigali (order before 2 PM)</p>
            </div>
          </div>

          {/* Returns Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <RotateCcw className="mr-2 text-green-600" size={18} />
              Return Policy
            </h4>
            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <p className="text-green-800"><strong>30-Day Returns:</strong> Easy returns within 30 days</p>
              <p className="text-green-800"><strong>Free Returns:</strong> We cover return shipping costs</p>
              <p className="text-green-800"><strong>Condition:</strong> Items must be unused and in original packaging</p>
              <p className="text-green-800"><strong>Refund:</strong> Full refund processed within 5-7 business days</p>
            </div>
          </div>

          {/* Warranty Info */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Shield className="mr-2 text-purple-600" size={18} />
              Warranty & Support
            </h4>
            <div className="bg-purple-50 p-4 rounded-lg space-y-2">
              <p className="text-purple-800"><strong>Manufacturer Warranty:</strong> 1 year standard warranty</p>
              <p className="text-purple-800"><strong>Customer Support:</strong> 24/7 support available</p>
              <p className="text-purple-800"><strong>Quality Guarantee:</strong> 100% satisfaction guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDescription; 