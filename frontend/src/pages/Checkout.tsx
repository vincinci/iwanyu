import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Shield, 
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../utils/currency';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  variantId?: string;
}

const Checkout: React.FC = () => {
  const 
  const location = useLocation();
  const { user } = useAuth();
  const { items,  itemCount, addToCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [checkoutAsGuest, setCheckoutAsGuest] = useState(!user);
  const [directPurchase, setDirectPurchase] = useState<{
    productId: string;
    quantity: number;
    productData: unknown | null;
    selectedVariants?: Array<{
      variantName: string;
      variantValue: string;
      variantId: string;
    }>;
  } | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Rwanda'
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [notes, setNotes] = useState('');

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: {
      items: OrderItem[];
      shippingAddress: ShippingAddress;
      couponCode?: string;
      notes?: string;
      isGuest?: boolean;
    }) => {
      const token = localStorage.getItem('token');
      const }/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && !checkoutAsGuest && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const 
        throw new Error(error.error || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Instead of showing success immediately, redirect to payment
      const orderId = data.data.id;
      initiatePayment(orderId);
    },
    onError: (error) => {
      console.error('Order creation failed:', error);
      setIsProcessing(false);
      alert(error.message || 'Failed to place order. Please try again.');
    },
  });

  // Parse URL parameters for direct purchase (legacy Buy Now functionality)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get('product');
    const quantity = parseInt(queryParams.get('quantity') || '1', 10);
    
    if (productId) {
      setIsLoadingProduct(true);
      
      // Parse variant information from URL
      const variantParams = queryParams.getAll('variants');
      const selectedVariants = variantParams.map(variant => {
        const [variantName, variantValue, variantId] = variant.split(':');
        return {
          variantName,
          variantValue,
          variantId
        };
      });
      
      // Fetch the product details
      fetch(`${API_BASE_URL}/products/${productId}`)
        .then(response => {
          if (!response.ok) throw new Error('Product not found');
          return response.json();
        })
        .then(data => {
          setDirectPurchase({
            productId,
            quantity,
            productData: data.data,
            selectedVariants: selectedVariants.length > 0 ? selectedVariants : undefined
          });
          setIsLoadingProduct(false);
        })
        .catch(error => {
          console.error('Failed to fetch product:', error);
          setIsLoadingProduct(false);
          navigate('/cart');
        });
    }
  }, [location.search, navigate]);
  
  // Calculate the correct total including any direct purchase
  const calculatedTotal = directPurchase 
    ? (() => {
        // Start with base product price
        let productPrice = directPurchase.productData?.price || 0;
        
        // Check if a variant with different pricing is selected
        if (directPurchase.selectedVariants && directPurchase.selectedVariants.length > 0) {
          const selectedVariant = directPurchase.productData?.variants?.find((v: unknown) => 
            v.id === directPurchase.selectedVariants![0].variantId
          );
          if (selectedVariant && selectedVariant.price && selectedVariant.price > 0) {
            productPrice = selectedVariant.price;
          }
        }
        
        // Apply sale price if available and lower than current price
        if (directPurchase.productData?.salePrice && directPurchase.productData.salePrice < productPrice) {
          productPrice = directPurchase.productData.salePrice;
        }
        
        return productPrice * directPurchase.quantity;
      })()
    : totalAmount;
  
  // Add delivery fee to total
  const deliveryFee = 1500;
  const finalTotal = calculatedTotal + deliveryFee;

  // Add direct purchase product to cart as a backup when data loads
  useEffect(() => {
    if (directPurchase?.productData && !isLoadingProduct) {
      // Only add to cart if it's not already there
      if (!items.some(item => item.id === directPurchase.productId)) {
        addToCart({
          id: directPurchase.productId,
          name: directPurchase.productData.name,
          price: directPurchase.productData.price,
          salePrice: directPurchase.productData.salePrice,
          images: directPurchase.productData.images,
          stock: directPurchase.productData.stock
        });
      }
    }
  }, [directPurchase, isLoadingProduct]);

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0 && !directPurchase) {
      alert('Your cart is empty');
      return;
    }

    // Validate required fields for guest checkout
    if (checkoutAsGuest || !user) {
      if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.email || 
          !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
        alert('Please fill in all required shipping information');
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingAddress.email)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    setIsProcessing(true);

    // Prepare order items based on cart or direct purchase
    let orderItems: OrderItem[];
    
    if (directPurchase) {
      // For legacy direct purchases (from removed Buy Now buttons)
      const orderItem: OrderItem = {
        productId: directPurchase.productId,
        quantity: directPurchase.quantity
      };
      
      // Add variant information if available
      if (directPurchase.selectedVariants && directPurchase.selectedVariants.length > 0) {
        // For now, use the first variant ID (you can modify this logic based on your needs)
        orderItem.variantId = directPurchase.selectedVariants[0].variantId;
      }
      
      orderItems = [orderItem];
    } else {
      // For regular cart checkouts
      orderItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
        // Note: Cart variants support can be added later
      }));
    }

    createOrderMutation.mutate({
      items: orderItems,
      shippingAddress,
      couponCode: couponCode || undefined,
      notes: notes || undefined,
      isGuest: checkoutAsGuest || !user,
    });
  };

  const initiatePayment = async (orderId: string) => {
    try {
      setIsRedirectingToPayment(true);
      
      // Add timeout for payment initialization
      const paymentTimeout = 15000; // 15 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Payment initialization timeout')), paymentTimeout);
      });

      const token = localStorage.getItem('token');
      
      // Create AbortController for request timeout
      const controller = new AbortController();
      const requestTimeout = setTimeout(() => {
        controller.abort();
      }, paymentTimeout - 1000);

      const paymentPromise = fetch(`${API_BASE_URL}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && !checkoutAsGuest && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          orderId: orderId,
          redirectUrl: `${window.location.origin}/payment/callback`,
          isGuest: checkoutAsGuest || !user,
        }),
        signal: controller.signal
      });

      const  timeoutPromise]) as Response;
      clearTimeout(requestTimeout);

      if (!response.ok) {
        const }));
        throw new Error(error.error || 'Failed to initialize payment');
      }

      const data = await response.json();
      console.log('Payment initialization response:', data);
      
      if (data.success && data.data.paymentUrl) {
        // Store order ID for callback handling
        localStorage.setItem('pendingOrderId', orderId);
        console.log('Redirecting to payment URL:', data.data.paymentUrl);
        // Redirect to Flutterwave payment page
        window.location.href = data.data.paymentUrl;
      } else {
        throw new Error('Payment initialization failed - no payment URL received');
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setIsRedirectingToPayment(false);
      setIsProcessing(false);
      
      let errorMessage = 'Failed to initiate payment. Please try again.';
      if (error instanceof Error) {
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
          errorMessage = 'Payment initialization is taking too long. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    }
  };

  if (items.length === 0 && !directPurchase && !isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="mb-4 text-gray-400">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
          <Link
            to="/"
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg transition-colors duration-200 inline-flex items-center"
          >
            <ArrowLeft className="mr-2" size={18} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (isRedirectingToPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Redirecting to Payment</h2>
          <p className="text-gray-600 mb-6">
            Please wait while we redirect you to the secure payment page...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header - Mobile optimized */}
        <div className="flex items-center mb-6 md:mb-8">
          <Link
            to="/cart"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-3 md:mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-gray-600 text-sm md:text-base">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Login or Guest Checkout Options */}
              {!user && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Account Options
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        id="guest-checkout"
                        type="radio"
                        name="checkout-type"
                        checked={checkoutAsGuest}
                        onChange={() => setCheckoutAsGuest(true)}
                        className="h-4 w-4 text-gray-600 focus:ring-orange-500 border-gray-300"
                      />
                      <label htmlFor="guest-checkout" className="flex-1">
                        <span className="font-medium text-gray-900">Continue as Guest</span>
                        <p className="text-sm text-gray-600">No account required, checkout quickly</p>
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        id="login-checkout"
                        type="radio"
                        name="checkout-type"
                        checked={!checkoutAsGuest}
                        onChange={() => setCheckoutAsGuest(false)}
                        className="h-4 w-4 text-gray-600 focus:ring-orange-500 border-gray-300"
                      />
                      <label htmlFor="login-checkout" className="flex-1">
                        <span className="font-medium text-gray-900">Sign In to Your Account</span>
                        <p className="text-sm text-gray-600">Access saved addresses and order history</p>
                      </label>
                    </div>
                    
                    {!checkoutAsGuest && (
                      <div className="ml-7 pt-2">
                        <Link
                          to="/login"
                          className="inline-flex items-center text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                          Sign In Now →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* User Account Info */}
              {user && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Account Information
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800">
                      <span className="font-medium">Signed in as:</span> {user.email}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      Your order will be saved to your account
                    </p>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Truck className="w-5 h-5 mr-2" />
                  Shipping Address
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={shippingAddress.firstName}
                      onChange={(e) => handleAddressChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={shippingAddress.lastName}
                      onChange={(e) => handleAddressChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      required
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={shippingAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      id="country"
                      required
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                      aria-label="Select country"
                    >
                      <option value="Rwanda">Rwanda</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Burundi">Burundi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Method
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                    <span>Credit/Debit Card</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <Phone className="w-5 h-5 mr-2 text-gray-600" />
                    <span>Mobile Money</span>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <Truck className="w-5 h-5 mr-2 text-gray-600" />
                    <span>Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon Code</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                  />
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Notes</h3>
                <textarea
                  placeholder="Special instructions for your order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-gray-400"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                
                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {isLoadingProduct ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                      <span className="ml-2 text-sm text-gray-500">Loading product...</span>
                    </div>
                  ) : directPurchase && directPurchase.productData ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                        {directPurchase.productData.image || directPurchase.productData.images?.[0] ? (
                          <img
                            src={directPurchase.productData.image || directPurchase.productData.images?.[0]}
                            alt={directPurchase.productData.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="text-gray-400" size={16} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {directPurchase.productData.name}
                        </h4>
                        {/* Show selected variants */}
                        {directPurchase.selectedVariants && directPurchase.selectedVariants.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {directPurchase.selectedVariants.map(v => `${v.variantName}: ${v.variantValue}`).join(', ')}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Qty: {directPurchase.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(calculatedTotal)}
                      </div>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="text-gray-400" size={16} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice((item.salePrice || item.price) * item.quantity)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatPrice(calculatedTotal)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      Shipping <span className="ml-1 text-xs text-gray-400" title="Flat rate shipping fee applies to all orders">(Flat Rate)</span>
                    </span>
                    <span className="text-gray-900">{formatPrice(deliveryFee)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="font-semibold text-gray-900 text-lg">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg mt-6 transition-colors duration-200 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2" size={18} />
                      Place Order
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-600">
                    🔒 Your payment information is secure and encrypted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout; 