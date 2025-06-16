import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'cancelled'>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');

        // If payment was cancelled, redirect to home immediately
        if (status === 'cancelled') {
          setStatus('cancelled');
          // Add a brief delay to show loading, then redirect to home
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
          return;
        }

        // If payment failed at Flutterwave level
        if (status === 'failed') {
          setStatus('failed');
          setError('Payment was cancelled or failed');
          return;
        }

        if (!transactionId) {
          setStatus('failed');
          setError('No transaction ID found');
          return;
        }

        // Verify payment with backend
        const token = localStorage.getItem('token');
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/payments/verify/${transactionId}`, {
          headers,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Payment verification failed');
        }

        const data = await response.json();
        
        if (data.success) {
          setStatus('success');
          setOrderDetails(data.data);
          // Clear the pending order ID
          localStorage.removeItem('pendingOrderId');
          // Clear cart since payment was successful
          localStorage.removeItem('cart');
        } else {
          setStatus('failed');
          setError('Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('failed');
        setError(error instanceof Error ? error.message : 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <Loader className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
        </motion.div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-4">
            Your payment was cancelled. Redirecting you to the home page...
          </p>
          <div className="flex justify-center">
            <Loader className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your order has been confirmed and payment processed successfully.
          </p>
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Order ID:</span> #{orderDetails.orderId}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> {orderDetails.amount} {orderDetails.currency}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Transaction ID:</span> {orderDetails.transactionId}
              </p>
            </div>
          )}
          <div className="space-y-3">
            {localStorage.getItem('token') ? (
              <Link
                to="/orders"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors"
              >
                View My Orders
              </Link>
            ) : (
              <Link
                to="/login"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Sign In to Track Order
              </Link>
            )}
            <Link
              to="/products"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-4">
          {error || 'Something went wrong with your payment. Please try again.'}
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/cart')}
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors"
          >
            Return to Cart
          </button>
          <Link
            to="/products"
            className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCallback; 