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
  Briefcase,
  FileText,
  Download,
  Eye,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { adminApi, type AdminSeller } from '../services/adminApi';

const AdminSellers: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selectedSeller, setSelectedSeller] = useState<AdminSeller | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState<any>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: sellersData, isLoading} = useQuery({
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

  const handleViewDocument = async (sellerId: string) => {
    setLoadingDocument(true);
    setDocumentData(null);
    
    try {
      const result = await adminApi.getSellerDocument(sellerId);
      setDocumentData(result);
      setShowDocumentModal(true);
    } catch (error) {
      console.error('Failed to get seller document:', error);
      
      // Try to parse the error response for better error handling
      let errorMessage = 'Failed to load document';
      let isDocumentMissing = false;
      
      if (error instanceof Error) {
        try {
          // If the error message contains JSON, parse it
          if (error.message.includes('{')) {
            const errorData = JSON.parse(error.message);
            if (errorData.error && errorData.message) {
              errorMessage = `${errorData.error}: ${errorData.message}`;
              isDocumentMissing = errorData.error.includes('no longer available');
            } else {
              errorMessage = errorData.error || error.message;
            }
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      
      // Show a more user-friendly alert for missing documents
      if (isDocumentMissing) {
        alert(`Document Not Available\n\nThe verification document for this seller is no longer available on the server. This typically happens when files are uploaded locally but the server has been redeployed.\n\nTo resolve this:\n1. Contact the seller to re-submit their verification document\n2. Or ask them to upload it again through the seller application process\n\nNote: Cloud platforms like Render.com don't persist uploaded files across deployments.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoadingDocument(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
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
                          <p>{(seller as any)._count.products} products</p>
                          <p>Joined {new Date(seller.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        {seller.nationalId && (
                          <button
                            onClick={() => handleViewDocument(seller.id)}
                            disabled={loadingDocument}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
                          >
                            <FileText size={14} />
                            {loadingDocument ? 'Loading...' : 'Document'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => {
                            setSelectedSeller(seller);
                            setShowModal(true);
                          }}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-300 transition-colors"
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

                  {/* Verification Document */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Verification Document</h4>
                    {selectedSeller.nationalId ? (
                      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-blue-900">National ID Document</p>
                            <p className="text-sm text-blue-700">Verification document submitted</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleViewDocument(selectedSeller.id)}
                          disabled={loadingDocument}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Eye size={16} />
                          {loadingDocument ? 'Loading...' : 'View Document'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">No Document Submitted</p>
                            <p className="text-sm text-gray-700">This seller hasn't submitted verification documents</p>
                          </div>
                        </div>
                      </div>
                    )}
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
                    <div className="flex flex-wrap gap-3">
                      {selectedSeller.nationalId && (
                        <button
                          onClick={() => handleViewDocument(selectedSeller.id)}
                          disabled={loadingDocument}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          <Eye size={16} />
                          {loadingDocument ? 'Loading...' : 'View Document'}
                        </button>
                      )}
                      
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

        {/* Document Viewing Modal */}
        <AnimatePresence>
          {showDocumentModal && documentData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Verification Document
                      </h3>
                      <p className="text-sm text-gray-600">
                        {documentData.seller.businessName} - {documentData.seller.ownerName}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDocumentModal(false)}
                      className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* Document Info */}
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">File Name:</span>
                        <p className="text-gray-900">{documentData.document.fileName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">File Size:</span>
                        <p className="text-gray-900">{formatFileSize(documentData.document.fileSize)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">File Type:</span>
                        <p className="text-gray-900">{documentData.document.fileType}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Uploaded:</span>
                        <p className="text-gray-900">
                          {new Date(documentData.document.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Document Preview/Download */}
                  <div className="text-center">
                    {documentData.document.fileType.startsWith('image/') ? (
                      <div className="mb-4">
                        <img
                          src={documentData.document.viewUrl}
                          alt="National ID Document"
                          className="max-w-full max-h-96 mx-auto object-contain border rounded shadow"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'p-8 bg-red-50 border border-red-200 rounded text-red-700';
                            errorDiv.innerHTML = '<p>Failed to load image</p>';
                            target.parentNode?.appendChild(errorDiv);
                          }}
                        />
                      </div>
                    ) : documentData.document.fileType === 'application/pdf' ? (
                      <div className="mb-4">
                        <div className="p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">PDF Document</p>
                          <p className="text-sm text-gray-500">Click the download button below to view the PDF</p>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <div className="p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Document File</p>
                          <p className="text-sm text-gray-500">Click the download button below to view the document</p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center gap-4">
                      <a
                        href={documentData.document.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Download size={16} />
                        Download Document
                      </a>
                      
                      <a
                        href={documentData.document.viewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        <Eye size={16} />
                        Open in New Tab
                      </a>
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