import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Filter,
  Download,
  Plus,
  Search,
  Calendar,
  Smartphone,
  Building2,
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { adminApi } from '../services/adminApi';
import { useAuth } from '../contexts/AuthContext';

interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  currency: string;
  payoutMethod: 'BANK_TRANSFER' | 'MOBILE_MONEY';
  accountDetails: unknown;
  reference: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  narration?: string;
  failureReason?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    businessName?: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
  };
}

interface PayoutFilters {
  status: string;
  payoutMethod: string;
  sellerId: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const AdminPayments: React.FC = () => {
  const { user } = useAuth();
  const 
  const queryClient = useQueryClient();

  // State management
  const [currentTab, setCurrentTab] = useState<'overview' | 'payouts' | 'wallets' | 'analytics'>('overview');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [adminNotes, setAdminNotes] = useState('');

  const [filters, setFilters] = useState<PayoutFilters>({
    status: '',
    payoutMethod: '',
    sellerId: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Check admin permission
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Data queries
  const { data: payoutsData, isLoading: payoutsLoading, refetch: refetchPayouts } = useQuery({
    queryKey: ['admin-payouts', page, limit, filters],
    queryFn: () => adminApi.getPayouts({
      page,
      limit,
      ...filters
    }),
    enabled: !!user && user.role === 'ADMIN',
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-payout-analytics'],
    queryFn: () => adminApi.getPayoutAnalytics('30d'),
    enabled: !!user && user.role === 'ADMIN',
  });

  const { data: walletsData, isLoading: walletsLoading } = useQuery({
    queryKey: ['admin-seller-wallets'],
    queryFn: () => adminApi.getSellerWallets(1, 10),
    enabled: !!user && user.role === 'ADMIN' && currentTab === 'wallets',
  });

  // Mutations
  const updatePayoutStatusMutation = useMutation({
    mutationFn: ({ payoutId, status, adminNotes }: { payoutId: string; status: 'APPROVED' | 'REJECTED'; adminNotes?: string }) =>
      adminApi.updatePayoutStatus(payoutId, status, adminNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payout-analytics'] });
      setShowApprovalModal(false);
      setSelectedPayout(null);
      setAdminNotes('');
    },
  });

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'PROCESSING':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
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

  const handleApprovalAction = (payout: Payout, action: 'APPROVED' | 'REJECTED') => {
    setSelectedPayout(payout);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleApprovalSubmit = () => {
    if (!selectedPayout) return;

    updatePayoutStatusMutation.mutate({
      payoutId: selectedPayout.id,
      status: approvalAction,
      adminNotes
    });
  };

  const handleFilterChange = (key: keyof PayoutFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      payoutMethod: '',
      sellerId: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setPage(1);
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
              <p className="text-gray-600">
                Manage seller withdrawals, wallet funds, and payment analytics
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => refetchPayouts()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'payouts', label: 'Withdrawal Requests', icon: CreditCard },
                { id: 'wallets', label: 'Seller Wallets', icon: Wallet },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    currentTab === tab.id
                      ? 'border-gray-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Overview Tab */}
        {currentTab === 'overview' && analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Payouts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(analyticsData.data.summary.totalAmount)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {analyticsData.data.summary.totalCount} transactions
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {analyticsData.data.byStatus.find((s: unknown) => s.status === 'PENDING')?._count._all || 0}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Today</p>
                    <p className="text-2xl font-bold text-green-600">
                      {analyticsData.data.byStatus.find((s: unknown) => s.status === 'COMPLETED')?._count._all || 0}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(analyticsData.data.summary.averageAmount)}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Payout Activity</h3>
              </div>
              <div className="p-6">
                {payoutsData?.data?.payouts?.slice(0, 5).map((payout: Payout) => (
                  <div key={payout.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {payout.payoutMethod === 'BANK_TRANSFER' ? (
                          <Building2 className="w-5 h-5 text-gray-600" />
                        ) : (
                          <Smartphone className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {payout.seller.businessName || `${payout.seller.user.firstName} ${payout.seller.user.lastName}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatPrice(payout.amount)}</p>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payout.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payout.status)}`}>
                          {payout.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Payouts Tab */}
        {currentTab === 'payouts' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </button>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <select
                      value={filters.payoutMethod}
                      onChange={(e) => handleFilterChange('payoutMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      <option value="">All Methods</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Payouts List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Withdrawal Requests</h3>
                  <span className="text-sm text-gray-500">
                    {payoutsData?.data?.pagination?.total || 0} total requests
                  </span>
                </div>
              </div>

              {payoutsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payouts...</p>
                </div>
              ) : payoutsData?.data?.payouts?.length ? (
                <div className="divide-y divide-gray-200">
                  {payoutsData.data.payouts.map((payout: Payout) => (
                    <div key={payout.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            {payout.payoutMethod === 'BANK_TRANSFER' ? (
                              <Building2 className="w-6 h-6 text-gray-600" />
                            ) : (
                              <Smartphone className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {payout.seller.businessName || 
                               `${payout.seller.user.firstName} ${payout.seller.user.lastName}`}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {payout.payoutMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Mobile Money'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(payout.createdAt).toLocaleDateString()} • Ref: {payout.reference}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(payout.amount)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 justify-end">
                            {getStatusIcon(payout.status)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </span>
                          </div>
                          
                          {payout.status === 'PENDING' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleApprovalAction(payout, 'APPROVED')}
                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApprovalAction(payout, 'REJECTED')}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Withdrawal Requests</h3>
                  <p className="text-gray-600">No withdrawal requests found matching your criteria.</p>
                </div>
              )}

              {/* Pagination */}
              {payoutsData?.data?.pagination?.pages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">
                      Showing page {payoutsData.data.pagination.page} of {payoutsData.data.pagination.pages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(Math.min(payoutsData.data.pagination.pages, page + 1))}
                        disabled={page === payoutsData.data.pagination.pages}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Seller Wallets Tab */}
        {currentTab === 'wallets' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Seller Wallets Overview</h3>
              </div>

              {walletsLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading wallets...</p>
                </div>
              ) : walletsData?.data?.sellers?.length ? (
                <div className="divide-y divide-gray-200">
                  {walletsData.data.sellers.map((seller: unknown) => (
                    <div key={seller.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {seller.businessName || `${seller.user.firstName} ${seller.user.lastName}`}
                          </h4>
                          <p className="text-sm text-gray-600">{seller.user.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-6 text-center">
                            <div>
                              <p className="text-sm text-gray-600">Available</p>
                              <p className="text-lg font-bold text-green-600">
                                {formatPrice(seller.wallet.availableBalance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Revenue</p>
                              <p className="text-lg font-bold text-gray-900">
                                {formatPrice(seller.wallet.totalRevenue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Paid Out</p>
                              <p className="text-lg font-bold text-blue-600">
                                {formatPrice(seller.wallet.totalPaidOut)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Seller Wallets</h3>
                  <p className="text-gray-600">No approved sellers found.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {currentTab === 'analytics' && analyticsData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payouts by Status */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payouts by Status</h3>
                <div className="space-y-3">
                  {analyticsData.data.byStatus.map((status: unknown) => (
                    <div key={status.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        <span className="font-medium">{status.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(status._sum.amount || 0)}</p>
                        <p className="text-sm text-gray-500">{status._count._all} requests</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payouts by Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payouts by Method</h3>
                <div className="space-y-3">
                  {analyticsData.data.byMethod.map((method: unknown) => (
                    <div key={method.payoutMethod} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {method.payoutMethod === 'BANK_TRANSFER' ? (
                          <Building2 className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="font-medium">
                          {method.payoutMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Mobile Money'}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(method._sum.amount || 0)}</p>
                        <p className="text-sm text-gray-500">{method._count._all} requests</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Sellers */}
            {analyticsData.data.topSellers?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Top Sellers by Payouts</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {analyticsData.data.topSellers.slice(0, 10).map((seller: unknown, index: number) => (
                    <div key={seller.sellerId} className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {seller.seller?.businessName || 
                             `${seller.seller?.user?.firstName} ${seller.seller?.user?.lastName}`}
                          </p>
                          <p className="text-sm text-gray-600">{seller.seller?.user?.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(seller._sum.amount || 0)}
                        </p>
                        <p className="text-sm text-gray-500">{seller._count._all} payouts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Approval Modal */}
        <AnimatePresence>
          {showApprovalModal && selectedPayout && (
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
                className="bg-white rounded-lg p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {approvalAction === 'APPROVED' ? 'Approve' : 'Reject'} Payout
                  </h3>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Payout Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium">Seller:</span> {selectedPayout.seller.businessName || `${selectedPayout.seller.user.firstName} ${selectedPayout.seller.user.lastName}`}</p>
                      <p><span className="font-medium">Amount:</span> {formatPrice(selectedPayout.amount)}</p>
                      <p><span className="font-medium">Method:</span> {selectedPayout.payoutMethod === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Mobile Money'}</p>
                      <p><span className="font-medium">Reference:</span> {selectedPayout.reference}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Notes {approvalAction === 'REJECTED' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder={
                        approvalAction === 'APPROVED' 
                          ? 'Optional notes for approval...'
                          : 'Please provide reason for rejection...'
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                      rows={3}
                      required={approvalAction === 'REJECTED'}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowApprovalModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApprovalSubmit}
                      disabled={updatePayoutStatusMutation.isPending || (approvalAction === 'REJECTED' && !adminNotes.trim())}
                      className={`flex-1 px-4 py-2 rounded text-white transition-colors disabled:opacity-50 ${
                        approvalAction === 'APPROVED' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {updatePayoutStatusMutation.isPending ? 'Processing...' : 
                       approvalAction === 'APPROVED' ? 'Approve Payout' : 'Reject Payout'}
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

export default AdminPayments; 