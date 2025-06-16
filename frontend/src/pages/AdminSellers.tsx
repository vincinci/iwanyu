import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminApi, type AdminSeller } from '../services/adminApi';

const AdminSellers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<AdminSeller | null>(null);
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: sellersData, isLoading, error } = useQuery({
    queryKey: ['admin-sellers', page, status],
    queryFn: () => adminApi.getSellers({ page, limit: 20, status }),
    enabled: !!user && user.role === 'ADMIN',
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.updateSellerStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setShowModal(false);
      setSelectedSeller(null);
    },
  });

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
      console.error('Failed to update seller status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'SUSPENDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4" />;
      case 'SUSPENDED':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Sellers</h2>
          <p className="text-gray-600 mb-4">Unable to load seller data.</p>
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

  const sellers = sellersData?.sellers || [];
  const pagination = sellersData?.pagination;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Management</h1>
            <p className="text-gray-600">
              Manage seller applications and approvals
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Sellers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Sellers ({pagination?.total || 0})
            </h2>
          </div>

          {!sellers.length ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sellers Found</h3>
              <p className="text-gray-600">
                {status ? 'No sellers match the selected filters.' : 'No sellers have applied yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {sellers.map((seller) => (
                  <div key={seller.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {seller.businessName || 'No Business Name'}
                            </h3>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(seller.status)}`}>
                              {getStatusIcon(seller.status)}
                              {seller.status}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>{seller.user.firstName} {seller.user.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{seller.businessEmail}</span>
                            </div>
                            {seller.businessPhone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{seller.businessPhone}</span>
                              </div>
                            )}
                            {seller.businessType && (
                              <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4" />
                                <span>{seller.businessType}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-600 mr-4">
                          <p>{seller._count.products} products</p>
                          <p>Joined {new Date(seller.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setShowModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} sellers
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page <= 1}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page >= pagination.pages}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Seller Detail Modal */}
        <AnimatePresence>
          {showModal && selectedSeller && (
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
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Seller Details
                    </h3>
                    <button
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Business Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Business Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Name</label>
                        <p className="text-gray-900">{selectedSeller.businessName || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Type</label>
                        <p className="text-gray-900">{selectedSeller.businessType || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Email</label>
                        <p className="text-gray-900">{selectedSeller.businessEmail}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Business Phone</label>
                        <p className="text-gray-900">{selectedSeller.businessPhone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {selectedSeller.businessAddress && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Business Address</label>
                        <p className="text-gray-900">{selectedSeller.businessAddress}</p>
                      </div>
                    )}
                    
                    {selectedSeller.businessDescription && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Business Description</label>
                        <p className="text-gray-900">{selectedSeller.businessDescription}</p>
                      </div>
                    )}
                  </div>

                  {/* Owner Info */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Owner Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-gray-900">
                          {selectedSeller.user.firstName} {selectedSeller.user.lastName}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{selectedSeller.user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Products</label>
                        <p className="text-gray-900">{selectedSeller._count.products} products</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Member Since</label>
                        <p className="text-gray-900">
                          {new Date(selectedSeller.user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Status</h4>
                    <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedSeller.status)}`}>
                      {getStatusIcon(selectedSeller.status)}
                      {selectedSeller.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Actions</h4>
                    <div className="flex gap-3">
                      {selectedSeller.status !== 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedSeller.id, 'APPROVED')}
                          disabled={updateStatusMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                      )}
                      
                      {selectedSeller.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedSeller.id, 'REJECTED')}
                          disabled={updateStatusMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      )}
                      
                      {selectedSeller.status === 'APPROVED' && (
                        <button
                          onClick={() => handleStatusUpdate(selectedSeller.id, 'SUSPENDED')}
                          disabled={updateStatusMutation.isPending}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          <AlertCircle size={16} />
                          Suspend
                        </button>
                      )}
                    </div>
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

export default AdminSellers; 