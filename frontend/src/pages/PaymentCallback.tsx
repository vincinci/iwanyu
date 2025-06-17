import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Clock, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type PaymentStatus = 'loading' | 'success' | 'failed' | 'cancelled' | 'timeout';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>('loading');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const hasStarted = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const verifyPayment = async () => {
      try {
        const transactionId = searchParams.get('transaction_id');
        const urlStatus = searchParams.get('status');
        const txRef = searchParams.get('tx_ref');

        console.log('Payment callback received:', { 
          transactionId, 
          status: urlStatus,
          txRef,
          allParams: Object.fromEntries(searchParams) 
        });

        // Progress indicator
        const progressInterval = setInterval(() => {
          if (isMounted.current) {
            setProgress(prev => Math.min(prev + 1, 95));
          }
        }, 200);

        // Overall timeout protection
        const overallTimeout = setTimeout(() => {
          if (isMounted.current) {
            clearInterval(progressInterval);
            setStatus('timeout');
            setError('Payment verification is taking too long. Please check your orders or contact support.');
          }
        }, 25000); // 25 second total timeout

        try {
          // Handle cancelled payments immediately
          if (urlStatus === 'cancelled') {
            clearTimeout(overallTimeout);
            clearInterval(progressInterval);
            if (isMounted.current) {
              setStatus('cancelled');
              setTimeout(() => {
                if (isMounted.current) {
                  navigate('/', { replace: true });
                }
              }, 3000);
            }
            return;
          }

          // Handle failed payments immediately
          if (urlStatus === 'failed') {
            clearTimeout(overallTimeout);
            clearInterval(progressInterval);
            if (isMounted.current) {
              setStatus('failed');
              setError('Payment was rejected or failed at the payment gateway');
            }
            return;
          }

          // Check for transaction ID
          if (!transactionId && !txRef) {
            clearTimeout(overallTimeout);
            clearInterval(progressInterval);
            if (isMounted.current) {
              setStatus('failed');
              setError('No transaction ID found in payment response');
            }
            return;
          }

          const useTransactionId = transactionId || txRef;

          // Add delay to show progress
          await new Promise(resolve => setTimeout(resolve, 1000));

          if (!isMounted.current) return;

          // Prepare request
          const token = localStorage.getItem('token');
          const headers: HeadersInit = {
            'Content-Type': 'application/json'
          };
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          console.log('Verifying payment with transaction ID:', useTransactionId);

          // Make verification request with timeout
          const controller = new AbortController();
          const requestTimeout = setTimeout(() => {
            controller.abort();
          }, 15000);

          const response = await fetch(`${API_BASE_URL}/payments/verify/${useTransactionId}`, {
            method: 'GET',
            headers,
            signal: controller.signal
          });

          clearTimeout(requestTimeout);
          clearTimeout(overallTimeout);
          clearInterval(progressInterval);

          if (!isMounted.current) return;

          setProgress(100);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            throw new Error(errorData.error || `Verification failed with status ${response.status}`);
          }

          const data = await response.json();
          console.log('Payment verification successful:', data);
          
          if (data.success) {
            setStatus('success');
            setOrderDetails(data.data);
            
            // Clear stored data
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('cart');
            
            // Notify other components about cart update
            window.dispatchEvent(new Event('cartUpdated'));
          } else {
            setStatus('failed');
            setError(data.error || 'Payment verification returned unsuccessful result');
          }

        } catch (fetchError) {
          clearTimeout(overallTimeout);
          clearInterval(progressInterval);
          
          if (!isMounted.current) return;

          console.error('Payment verification error:', fetchError);
          
          if (fetchError instanceof Error) {
            if (fetchError.name === 'AbortError') {
              setStatus('timeout');
              setError('Payment verification request timed out. Please check your order status manually.');
            } else {
              setStatus('failed');
              setError(fetchError.message);
            }
          } else {
            setStatus('failed');
            setError('Payment verification failed due to network or server error');
          }
        }

      } catch (error) {
        if (!isMounted.current) return;
        
        console.error('Payment callback error:', error);
        setStatus('failed');
        setError(error instanceof Error ? error.message : 'Unexpected error during payment verification');
      }
    };

    // Start verification after component mounts
    const startTimer = setTimeout(() => {
      if (isMounted.current) {
        verifyPayment();
      }
    }, 100);

    return () => {
      clearTimeout(startTimer);
    };
  }, [searchParams, navigate]);

  // Loading state with progress indicator
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <Loader className="w-16 h-16 text-orange-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600 mb-6">
            Please wait while we confirm your payment...
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <p className="text-sm text-gray-500">
            This usually takes a few seconds
          </p>
        </motion.div>
      </div>
    );
  }

  // Timeout state
  if (status === 'timeout') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Timeout</h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-left">
                <p className="text-yellow-800 font-medium">What to do next:</p>
                <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                  <li>• Check your email for payment confirmation</li>
                  <li>• Check your orders if you have an account</li>
                  <li>• Contact support if payment was deducted</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {localStorage.getItem('token') ? (
              <Link
                to="/orders"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Check My Orders
              </Link>
            ) : (
              <Link
                to="/login"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors"
              >
                Sign In to Check Order
              </Link>
            )}
            <button
              onClick={() => navigate('/cart')}
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Return to Cart
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Cancelled state
  if (status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <XCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-4">
            Your payment was cancelled. You will be redirected to the home page shortly...
          </p>
          <div className="flex justify-center items-center">
            <Loader className="w-6 h-6 text-orange-500 animate-spin mr-2" />
            <span className="text-sm text-gray-500">Redirecting...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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

  // Failed state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
      >
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">
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