import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  ArrowLeft,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/currency';
import { SHIPPING_COST } from '../config/constants';

const Cart: React.FC = () => {
  const { totalAmount } = useCart();
  const { items, removeFromCart, updateQuantity, clearCart,  itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="mx-auto text-gray-400 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started</p>
          <Link
            to="/products"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
          >
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Shopping Cart</h1>
            <p className="text-gray-600 text-sm md:text-base">{itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart</p>
          </div>
          <Link
            to="/products"
            className="flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-200 text-sm md:text-base"
          >
            <ArrowLeft className="mr-1" size={16} />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Items</h3>
                <button
                  onClick={clearCart}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors duration-200"
                >
                  Clear All
                </button>
              </div>
              
              <AnimatePresence>
                {items.map((item: any) => {
                  const currentPrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-2 sm:p-3 md:p-4 border-b border-gray-100 last:border-b-0"
                    >
                      {/* Mobile-first responsive layout */}
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        {/* Top row on mobile: Image + Details + Remove */}
                        <div className="flex items-start space-x-2 sm:space-x-3 flex-1">
                          {/* Product Image - Smaller on mobile */}
                          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-gray-400" size={12} />
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-xs sm:text-sm md:text-base line-clamp-2">{item.name}</h4>
                            <div className="flex items-center space-x-2 mt-0.5 sm:mt-1">
                              {item.salePrice && item.salePrice < item.price ? (
                                <>
                                  <span className="text-red-500 font-medium text-xs sm:text-sm md:text-base">
                                    {formatPrice(item.salePrice)}
                                  </span>
                                  <span className="text-gray-500 line-through text-xs">
                                    {formatPrice(item.price)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-gray-900 font-medium text-xs sm:text-sm md:text-base">
                                  {formatPrice(item.price)}
                                </span>
                              )}
                            </div>
                            {item.stock <= 5 && (
                              <p className="text-gray-600 text-xs mt-0.5">
                                Only {item.stock} left in stock
                              </p>
                            )}
                          </div>

                          {/* Remove Button - Smaller on mobile */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 sm:p-1.5 text-gray-500 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                            aria-label="Remove item from cart"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Bottom row on mobile: Quantity + Total */}
                        <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                          {/* Quantity Controls - Smaller on mobile */}
                          <div className="flex items-center space-x-1 sm:space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 sm:p-1.5 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 sm:p-1.5 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
                              disabled={item.quantity >= item.stock}
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-xs sm:text-sm md:text-base">
                              {formatPrice(currentPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="text-gray-900">{formatPrice(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">{formatPrice(SHIPPING_COST)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900 text-lg">
                      {formatPrice(totalAmount + SHIPPING_COST)}
                    </span>
                  </div>
                </div>
              </div>

              <Link 
                to="/checkout"
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg mt-6 transition-colors duration-200 flex items-center justify-center"
              >
                <CreditCard className="mr-2" size={18} />
                Proceed to Checkout
              </Link>

              <div className="mt-4 text-center">
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-gray-700 flex items-center justify-center"
                >
                  <ArrowLeft className="mr-1" size={14} />
                  Continue Shopping
                </Link>
              </div>

              {/* Security Info */}
              <div className="mt-6 p-3 bg-gray-50 rounded text-center">
                <p className="text-xs text-gray-600">
                  🔒 Secure checkout with SSL encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart; 