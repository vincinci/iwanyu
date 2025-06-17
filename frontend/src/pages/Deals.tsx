import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Star, 
  ShoppingCart, 
  Heart,
  Flame,
  Gift,
  Percent,
  Zap,
  Tag,
  TrendingUp
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { formatPrice } from '../utils/currency';

// Deal product interfaces
interface BaseDealProduct {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  images: string[];
  rating: number;
  reviews: number;
}

interface FlashDealProduct extends BaseDealProduct {
  timeLeft: string;
  soldCount: number;
  totalStock: number;
}

interface DailyDealProduct extends BaseDealProduct {}

interface WeeklyDealProduct extends BaseDealProduct {}

type DealProduct = FlashDealProduct | DailyDealProduct | WeeklyDealProduct;

const Deals: React.FC = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState('flash');

  // Mock deals data - in real app, this would come from API
  const flashDeals: FlashDealProduct[] = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      originalPrice: 45000,
      salePrice: 29000,
      discount: 36,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'],
      rating: 4.5,
      reviews: 128,
      timeLeft: '02:45:30',
      soldCount: 45,
      totalStock: 100
    },
    {
      id: '2',
      name: 'Smart Fitness Tracker',
      originalPrice: 35000,
      salePrice: 24500,
      discount: 30,
      images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&q=80'],
      rating: 4.7,
      reviews: 89,
      timeLeft: '01:12:45',
      soldCount: 32,
      totalStock: 75
    },
    {
      id: '3',
      name: 'Luxury Watch Collection',
      originalPrice: 125000,
      salePrice: 87500,
      discount: 30,
      images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80'],
      rating: 4.8,
      reviews: 203,
      timeLeft: '03:20:15',
      soldCount: 18,
      totalStock: 50
    }
  ];

  const dailyDeals: DailyDealProduct[] = [
    {
      id: '4',
      name: 'Coffee Maker Pro',
      originalPrice: 55000,
      salePrice: 42000,
      discount: 24,
      images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80'],
      rating: 4.6,
      reviews: 156
    },
    {
      id: '5',
      name: 'Gaming Mechanical Keyboard',
      originalPrice: 38000,
      salePrice: 28500,
      discount: 25,
      images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80'],
      rating: 4.4,
      reviews: 94
    },
    {
      id: '6',
      name: 'Wireless Phone Charger',
      originalPrice: 18000,
      salePrice: 12600,
      discount: 30,
      images: ['https://images.unsplash.com/photo-1609592043945-64e3d8e4ffd4?w=400&q=80'],
      rating: 4.3,
      reviews: 67
    }
  ];

  const weeklyDeals: WeeklyDealProduct[] = [
    {
      id: '7',
      name: 'Professional Camera Lens',
      originalPrice: 180000,
      salePrice: 144000,
      discount: 20,
      images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&q=80'],
      rating: 4.9,
      reviews: 45
    },
    {
      id: '8',
      name: 'Home Security Camera',
      originalPrice: 65000,
      salePrice: 45500,
      discount: 30,
      images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80'],
      rating: 4.5,
      reviews: 123
    }
  ];

  const tabs = [
    { id: 'flash', label: 'Flash Sale', icon: Zap, data: flashDeals },
    { id: 'daily', label: 'Daily Deals', icon: Gift, data: dailyDeals },
    { id: 'weekly', label: 'Weekly Deals', icon: TrendingUp, data: weeklyDeals }
  ];

  const activeDeals = tabs.find(tab => tab.id === activeTab)?.data || [];

  const handleAddToCart = (product: DealProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.originalPrice,
      salePrice: product.salePrice,
      images: product.images,
      stock: 50
    });
  };

  const handleToggleWishlist = async (product: DealProduct) => {
    try {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <Flame className="w-8 h-8 mr-2" />
              <h1 className="text-4xl md:text-6xl font-bold">Hot Deals</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Unbeatable prices on premium products
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold">50%</div>
                <div className="text-sm opacity-75">Up to Off</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">24h</div>
                <div className="text-sm opacity-75">Flash Sales</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">100+</div>
                <div className="text-sm opacity-75">Products</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-red-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
          {activeDeals.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="relative h-20 md:h-24 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold text-[10px]">
                  -{product.discount}%
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={() => handleToggleWishlist(product)}
                  className={`absolute top-1 right-1 p-1 rounded-full transition-all duration-200 ${
                    isInWishlist(product.id)
                      ? 'bg-red-500 text-white'
                      : 'bg-white/80 text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart size={12} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-2">
                <Link to={`/products/${product.id}`}>
                  <h3 className="font-medium text-xs text-gray-900 mb-1 hover:text-red-500 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                </Link>

                {/* Price and Add to Cart */}
                <div className="text-center mb-2">
                  <div className="text-sm font-bold text-red-500">
                    {formatPrice(product.salePrice)}
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 bg-white rounded-xl p-8 shadow-md"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Don't Miss Out on These Amazing Deals!
          </h2>
          <p className="text-gray-600 mb-6">
            New deals added daily. Sign up for notifications to never miss a great offer.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Tag size={18} />
            <span>View All Products</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Deals; 