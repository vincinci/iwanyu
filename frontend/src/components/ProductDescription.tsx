import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Truck, 
  Shield, 
  RotateCcw, 
  Star, 
  Award, 
  Info,
  ChevronDown,
  ChevronUp,
  Ruler,
  Weight,
  Palette,
  Tag
} from 'lucide-react';
import type { Product } from '../types/api';

interface ProductDescriptionProps {
  product: Product;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping' | 'reviews'>('description');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const tabs = [
    { id: 'description', label: 'Description', icon: Info },
    { id: 'specifications', label: 'Specifications', icon: Package },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck },
  ];

  const getEnhancedDescription = () => {
    if (product.description && product.description.length > 50) {
      return product.description;
    }

    // Generate enhanced description based on product details
    const categoryName = product.category?.name?.toLowerCase() || '';
    const productName = product.name.toLowerCase();
    
    let enhancedDescription = '';

    if (categoryName.includes('shoes') || categoryName.includes('sneakers')) {
      enhancedDescription = `Experience premium comfort and style with the ${product.name}. These high-quality shoes feature durable construction, superior cushioning, and modern design that makes them perfect for both casual wear and active lifestyles. Crafted with attention to detail, they offer excellent support and breathability for all-day comfort.`;
    } else if (categoryName.includes('clothing') || categoryName.includes('shirts') || categoryName.includes('tops')) {
      enhancedDescription = `Elevate your wardrobe with the ${product.name}. This premium piece combines comfort and style, featuring high-quality materials and expert craftsmanship. Perfect for both casual and formal occasions, it offers a comfortable fit and timeless design that will keep you looking great.`;
    } else if (categoryName.includes('electronics')) {
      enhancedDescription = `Discover the latest in technology with the ${product.name}. This cutting-edge device delivers exceptional performance, reliability, and user experience. Built with premium components and innovative features, it's designed to meet your needs and exceed your expectations.`;
    } else if (categoryName.includes('home') || categoryName.includes('kitchen')) {
      enhancedDescription = `Transform your living space with the ${product.name}. This premium home essential combines functionality with elegant design, making it a perfect addition to any modern home. Crafted from high-quality materials, it's built to last and enhance your daily life.`;
    } else if (categoryName.includes('accessories') || categoryName.includes('bags')) {
      enhancedDescription = `Complete your look with the ${product.name}. This stylish accessory combines practicality with fashion-forward design. Made from premium materials with careful attention to detail, it's the perfect complement to your personal style.`;
    } else {
      enhancedDescription = `Discover the exceptional quality of the ${product.name}. This premium product is designed with your needs in mind, featuring superior materials, expert craftsmanship, and attention to detail. Whether for everyday use or special occasions, it delivers the perfect combination of style, functionality, and value.`;
    }

    // Add category-specific features
    if (product.brand) {
      enhancedDescription += ` From the trusted brand ${product.brand}, you can expect consistent quality and reliability.`;
    }

    if (product.totalSales > 0) {
      enhancedDescription += ` Join thousands of satisfied customers who have made this their go-to choice.`;
    }

    return enhancedDescription;
  };

  const getSpecifications = () => {
    const specs: { label: string; value: string; icon: React.ReactNode }[] = [];

    if (product.brand) {
      specs.push({ label: 'Brand', value: product.brand, icon: <Award size={16} /> });
    }

    if (product.sku) {
      specs.push({ label: 'SKU', value: product.sku, icon: <Tag size={16} /> });
    }

    // Add category-specific specifications
    const categoryName = product.category?.name?.toLowerCase() || '';
    
    if (categoryName.includes('shoes') || categoryName.includes('sneakers')) {
      specs.push(
        { label: 'Material', value: 'Premium synthetic and textile', icon: <Palette size={16} /> },
        { label: 'Sole Type', value: 'Rubber outsole', icon: <Package size={16} /> },
        { label: 'Closure', value: 'Lace-up', icon: <Package size={16} /> }
      );
    } else if (categoryName.includes('clothing')) {
      specs.push(
        { label: 'Material', value: 'High-quality cotton blend', icon: <Palette size={16} /> },
        { label: 'Care Instructions', value: 'Machine wash cold', icon: <Info size={16} /> },
        { label: 'Fit', value: 'Regular fit', icon: <Ruler size={16} /> }
      );
    } else if (categoryName.includes('electronics')) {
      specs.push(
        { label: 'Warranty', value: '1 Year Manufacturer Warranty', icon: <Shield size={16} /> },
        { label: 'Power', value: 'AC/DC Compatible', icon: <Package size={16} /> }
      );
    }

    // Add variants as specifications
    if (product.variants && product.variants.length > 0) {
      const variantTypes = [...new Set(product.variants.map(v => v.name))];
      variantTypes.forEach(type => {
        const values = product.variants!
          .filter(v => v.name === type)
          .map(v => v.value)
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
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'description' && (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {displayDescription}
                </p>
                
                {shouldTruncate && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
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
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                    <RotateCcw className="text-orange-600" size={20} />
                    <span className="text-orange-800 font-medium">Easy Returns</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'specifications' && (
            <motion.div
              key="specifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          )}

          {activeTab === 'shipping' && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductDescription; 