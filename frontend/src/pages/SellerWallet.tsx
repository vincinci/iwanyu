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
import { walletApi, type WalletSummary, type Payout, type BankDetails, type MobileMoneyDetails } from '../services/walletApi';
import { formatPrice } from '../utils/currency';

const SellerWallet: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showBalance, setShowBalance] = useState(true);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'BANK_TRANSFER' | 'MOBILE_MONEY'>('BANK_TRANSFER');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    account_bank: '',
    account_number: '',
    account_name: '',
    country: 'RW'
  });
  const [mobileDetails, setMobileDetails] = useState<MobileMoneyDetails>({
    network: '',
    phone_number: '',
    country: 'RW'
  });

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

  const { data: walletSummary, isLoading, error } = useQuery({
    queryKey: ['wallet-summary'],
    queryFn: walletApi.getWalletSummary,
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: payoutHistory } = useQuery({
    queryKey: ['payout-history'],
    queryFn: () => walletApi.getPayoutHistory(1, 10),
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: banks } = useQuery({
    queryKey: ['banks', 'RW'],
    queryFn: () => walletApi.getBanks('RW'),
    enabled: payoutMethod === 'BANK_TRANSFER',
  });

  const { data: mobileNetworks } = useQuery({
    queryKey: ['mobile-networks', 'RW'],
    queryFn: () => walletApi.getMobileMoneyNetworks('RW'),
    enabled: payoutMethod === 'MOBILE_MONEY',
  });

  const bankPayoutMutation = useMutation({
    mutationFn: walletApi.requestBankPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payout-history'] });
      setShowPayoutModal(false);
      setPayoutAmount('');
      setBankDetails({ account_bank: '', account_number: '', account_name: '', country: 'RW' });
    },
  });

  const mobilePayoutMutation = useMutation({
    mutationFn: walletApi.requestMobileMoneyPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-summary'] });
      queryClient.invalidateQueries({ queryKey: ['payout-history'] });
      setShowPayoutModal(false);
      setPayoutAmount('');
      setMobileDetails({ network: '', phone_number: '', country: 'RW' });
    },
  });

  const handlePayout = async () => {
    const amount = parseFloat(payoutAmount);
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!walletSummary || amount > walletSummary.availableBalance) {
      alert('Insufficient balance');
      return;
    }

    try {
      if (payoutMethod === 'BANK_TRANSFER') {
        if (!bankDetails.account_bank || !bankDetails.account_number || !bankDetails.account_name) {
          alert('Please fill in all bank details');
          return;
        }
        await bankPayoutMutation.mutateAsync({
          amount,
          accountDetails: bankDetails,
          narration: `Payout to ${bankDetails.account_name}`
        });
      } else {
        if (!mobileDetails.network || !mobileDetails.phone_number) {
          alert('Please fill in all mobile money details');
          return;
        }
        await mobilePayoutMutation.mutateAsync({
          amount,
          accountDetails: mobileDetails,
          narration: `Mobile money payout to ${mobileDetails.phone_number}`
        });
      }
    } catch (error) {
      console.error('Payout error:', error);
      alert('Failed to process payout. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
      case 'PROCESSING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
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
        return 'bg-yellow-100 text-yellow-800';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
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
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="text-orange-600 hover:text-orange-700 font-medium text-sm"
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

        {/* Payout Modal */}
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
                className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Available Balance */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      Available Balance: <span className="font-semibold">{formatPrice(walletSummary?.availableBalance || 0)}</span>
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount to Withdraw
                    </label>
                    <input
                      type="number"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      max={walletSummary?.availableBalance || 0}
                      min="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum withdrawal: RWF 1,000</p>
                  </div>

                  {/* Payout Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Withdrawal Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setPayoutMethod('BANK_TRANSFER')}
                        className={`p-3 border rounded-lg flex items-center gap-2 ${
                          payoutMethod === 'BANK_TRANSFER'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm">Bank</span>
                      </button>
                      <button
                        onClick={() => setPayoutMethod('MOBILE_MONEY')}
                        className={`p-3 border rounded-lg flex items-center gap-2 ${
                          payoutMethod === 'MOBILE_MONEY'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        <Smartphone className="w-4 h-4" />
                        <span className="text-sm">Mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Bank Transfer Details */}
                  {payoutMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank
                        </label>
                        <select
                          value={bankDetails.account_bank}
                          onChange={(e) => setBankDetails({...bankDetails, account_bank: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select Bank</option>
                          {banks?.data?.map((bank: any) => (
                            <option key={bank.code} value={bank.code}>
                              {bank.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number
                        </label>
                        <input
                          type="text"
                          value={bankDetails.account_number}
                          onChange={(e) => setBankDetails({...bankDetails, account_number: e.target.value})}
                          placeholder="Enter account number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Name
                        </label>
                        <input
                          type="text"
                          value={bankDetails.account_name}
                          onChange={(e) => setBankDetails({...bankDetails, account_name: e.target.value})}
                          placeholder="Enter account holder name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Mobile Money Details */}
                  {payoutMethod === 'MOBILE_MONEY' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Network
                        </label>
                        <select
                          value={mobileDetails.network}
                          onChange={(e) => setMobileDetails({...mobileDetails, network: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select Network</option>
                          {mobileNetworks?.data?.RW?.map((network: string) => (
                            <option key={network} value={network}>
                              {network}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={mobileDetails.phone_number}
                          onChange={(e) => setMobileDetails({...mobileDetails, phone_number: e.target.value})}
                          placeholder="Enter phone number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowPayoutModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePayout}
                      disabled={bankPayoutMutation.isPending || mobilePayoutMutation.isPending}
                      className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {(bankPayoutMutation.isPending || mobilePayoutMutation.isPending) ? 'Processing...' : 'Withdraw'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SellerWallet; 