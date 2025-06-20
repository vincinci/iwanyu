import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  CreditCard,
  Smartphone,
  Eye,
  EyeOff,
  Plus,
  History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { walletApi, type WalletSummary, type Payout } from '../services/walletApi';
import { formatPrice } from '../utils/currency';
import WithdrawForm from '../components/WithdrawForm';

const SellerWallet: React.FC = () => {
  const { user } = useAuth();
  const 
  const queryClient = useQueryClient();
  
  const [showBalance, setShowBalance] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  React.useEffect(() => {
    // Check localStorage immediately for instant response
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    // If no stored auth data, redirect immediately
    if (!storedToken || !storedUser) {
      navigate('/login');
      return;
    }
    
    // If we have stored data but user context isn't loaded yet, wait a bit
    if (!user) {
      return;
    }
    
    // Check user role once user is loaded
    if (user.role !== 'SELLER') {
      navigate('/become-seller');
    }
  }, [user, navigate]);

  const { data: walletSummary, isLoading} = useQuery({
    queryKey: ['wallet-summary'],
    queryFn: walletApi.getWalletSummary,
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: payoutHistory } = useQuery({
    queryKey: ['payout-history'],
    queryFn: () => walletApi.getPayoutHistory(1, 10),
    enabled: !!user && user.role === 'SELLER',
  });



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'FAILED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Wallet</h2>
          <p className="text-gray-600 mb-4">Unable to load wallet data.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Wallet</h1>
              <p className="text-gray-600">
                Manage your earnings and withdraw funds
              </p>
            </div>
            
            <button
              onClick={() => setShowPayoutModal(true)}
              disabled={!walletSummary?.availableBalance || walletSummary.availableBalance <= 0}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-5 h-5" />
              Withdraw Funds
            </button>
          </div>
        </motion.div>

        {/* Wallet Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Available Balance */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-600">Available Balance</span>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {showBalance 
                ? formatPrice(walletSummary?.availableBalance || 0)
                : '••••••'
              }
            </p>
            <p className="text-sm text-green-600 mt-1">Ready to withdraw</p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(walletSummary?.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Platform Commission */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Platform Fee</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  FREE
                </p>
                <p className="text-sm text-green-600 mt-1">No commission charged</p>
              </div>
            </div>
          </div>

          {/* Total Paid Out */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600">Total Withdrawn</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(walletSummary?.totalPaidOut || 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Payouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Payouts
              </h2>
              <button
                onClick={() => navigate('/seller/payouts')}
                className="text-gray-600 hover:text-gray-800 font-medium text-sm"
              >
                View All
              </button>
            </div>
          </div>

          {!payoutHistory?.payouts?.length ? (
            <div className="p-8 text-center">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payouts Yet</h3>
              <p className="text-gray-600 mb-4">
                Your payout history will appear here once you make withdrawals.
              </p>
              <button
                onClick={() => setShowPayoutModal(true)}
                disabled={!walletSummary?.availableBalance || walletSummary.availableBalance <= 0}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Make First Withdrawal
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {payoutHistory.payouts.slice(0, 5).map((payout: Payout) => (
                <div key={payout.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {payout.payoutMethod === 'BANK_TRANSFER' ? (
                          <CreditCard className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {payout.payoutMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Mobile Money'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {payout.narration || `Ref: ${payout.reference}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(payout.amount)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(payout.status)}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Withdraw Modal */}
        <AnimatePresence>
          {showPayoutModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                <WithdrawForm
                  availableBalance={walletSummary?.availableBalance || 0}
                  onSuccess={() => {
                    setShowPayoutModal(false);
                    queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
                    queryClient.invalidateQueries({ queryKey: ['payout-history'] });
                  }}
                  onCancel={() => setShowPayoutModal(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SellerWallet; 