import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Package, X, Eye, Power, Edit2 } from 'lucide-react';
import { sellerApi } from '../services/sellerApi';
import { formatPrice } from '../utils/currency';
import { toast } from 'react-hot-toast';

const SellerFlashSales: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [selectedFlashSale, setSelectedFlashSale] = React.useState<any>(null);
  const [selectedProducts, setSelectedProducts] = React.useState<string[]>([]);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });

  // Get flash sales
  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['seller-flash-sales'],
    queryFn: () => sellerApi.getFlashSales(),
  });

  // Get discounted products for selection
  const { data: discountedProducts } = useQuery({
    queryKey: ['seller-discounted-products'],
    queryFn: () => sellerApi.getDiscountedProducts(),
  });

  // Create flash sale
  const createFlashSaleMutation = useMutation({
    mutationFn: sellerApi.createFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-flash-sales'] });
      setShowAddModal(false);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
      });
      toast.success('Flash sale created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create flash sale');
    }
  });

  // Update flash sale
  const updateFlashSaleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      sellerApi.updateFlashSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-flash-sales'] });
      setSelectedFlashSale(null);
      toast.success('Flash sale updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update flash sale');
    }
  });

  // Toggle flash sale status
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      sellerApi.updateFlashSaleStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-flash-sales'] });
      toast.success('Flash sale status updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update status');
    }
  });

  // Add products to flash sale
  const addProductsMutation = useMutation({
    mutationFn: ({ flashSaleId, productIds }: { flashSaleId: string; productIds: string[] }) =>
      sellerApi.addProductsToFlashSale(flashSaleId, productIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['seller-flash-sales'] });
      setSelectedProducts([]);
      toast.success(`Added ${data.added} products to flash sale`);
      if (data.failed > 0) {
        toast.error(`Failed to add ${data.failed} products`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add products');
    }
  });

  // Get flash sale preview
  const { data: previewData, isLoading: isLoadingPreview } = useQuery({
    queryKey: ['flash-sale-preview', selectedFlashSale?.id],
    queryFn: () => sellerApi.getFlashSalePreview(selectedFlashSale?.id),
    enabled: !!selectedFlashSale && showPreviewModal,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flash sales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Flash Sales</h1>
              <p className="text-gray-600">Create and manage limited-time offers</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Flash Sale
            </button>
          </div>
        </motion.div>

        {/* Flash Sales Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales?.data?.map((sale: any) => (
            <motion.div
              key={sale.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{sale.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sale.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sale.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">{sale.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Start Time</p>
                    <p className="text-sm text-gray-900">{new Date(sale.startTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">End Time</p>
                    <p className="text-sm text-gray-900">{new Date(sale.endTime).toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Products ({sale.products.length})</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedFlashSale(sale);
                          setShowPreviewModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Preview flash sale"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFlashSale(sale);
                          setFormData({
                            title: sale.title,
                            description: sale.description || '',
                            startTime: new Date(sale.startTime).toISOString().slice(0, 16),
                            endTime: new Date(sale.endTime).toISOString().slice(0, 16)
                          });
                          setShowAddModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit flash sale"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatusMutation.mutate({
                          id: sale.id,
                          isActive: !sale.isActive
                        })}
                        className={`${
                          sale.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-900'
                        }`}
                        title={`${sale.isActive ? 'Deactivate' : 'Activate'} flash sale`}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {sale.products.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            {item.product.images[0] ? (
                              <img 
                                src={item.product.images[0]} 
                                alt={item.product.name}
                                className="w-full h-full object-contain rounded"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-600">Stock: {item.stock - item.sold}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatPrice(item.salePrice)}</p>
                          <p className="text-xs text-gray-500 line-through">{formatPrice(item.originalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {(!flashSales?.data || flashSales.data.length === 0) && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Flash Sales Yet</h3>
            <p className="text-gray-600 mb-6">Create your first flash sale to boost your sales.</p>
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
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
                className="bg-white rounded-lg w-full max-w-4xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedFlashSale ? 'Edit Flash Sale' : 'Create Flash Sale'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedFlashSale(null);
                      setFormData({
                        title: '',
                        description: '',
                        startTime: '',
                        endTime: ''
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (selectedFlashSale) {
                      await updateFlashSaleMutation.mutateAsync({
                        id: selectedFlashSale.id,
                        data: formData
                      });
                    } else {
                      const result = await createFlashSaleMutation.mutateAsync(formData);
                      if (selectedProducts.length > 0) {
                        await addProductsMutation.mutateAsync({
                          flashSaleId: result.data.id,
                          productIds: selectedProducts
                        });
                      }
                    }
                    setShowAddModal(false);
                  } catch (error) {
                    console.error('Failed to save flash sale:', error);
                  }
                }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time *
                          </label>
                          <input
                            type="datetime-local"
                            id="startTime"
                            value={formData.startTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                            End Time *
                          </label>
                          <input
                            type="datetime-local"
                            id="endTime"
                            value={formData.endTime}
                            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {!selectedFlashSale && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Products
                        </label>
                        <div className="border border-gray-300 rounded-md p-4 h-[400px] overflow-y-auto">
                          {discountedProducts?.data?.map((product: any) => (
                            <label
                              key={product.id}
                              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProducts(prev => [...prev, product.id]);
                                  } else {
                                    setSelectedProducts(prev => prev.filter(id => id !== product.id));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <div className="flex items-center gap-2 flex-1">
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                  {product.images[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="w-full h-full object-contain rounded"
                                    />
                                  ) : (
                                    <Package className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm text-blue-600">{formatPrice(product.salePrice!)}</p>
                                    <p className="text-sm text-gray-500 line-through">{formatPrice(product.price)}</p>
                                  </div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setSelectedFlashSale(null);
                        setFormData({
                          title: '',
                          description: '',
                          startTime: '',
                          endTime: ''
                        });
                      }}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createFlashSaleMutation.isPending || updateFlashSaleMutation.isPending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {selectedFlashSale ? (
                        updateFlashSaleMutation.isPending ? 'Saving...' : 'Save Changes'
                      ) : (
                        createFlashSaleMutation.isPending ? 'Creating...' : 'Create Flash Sale'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreviewModal && selectedFlashSale && (
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
                className="bg-white rounded-lg w-full max-w-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Flash Sale Preview</h2>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setSelectedFlashSale(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isLoadingPreview ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{previewData?.data?.stats?.totalProducts}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Total Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{previewData?.data?.stats?.totalStock}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Average Discount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {previewData?.data?.stats?.averageDiscount.toFixed(1)}%
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-600">Potential Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPrice(previewData?.data?.stats?.potentialRevenue)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Timeline</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600">Starts</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedFlashSale.startTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600">Ends</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(selectedFlashSale.endTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-600">Duration</p>
                          <p className="text-sm font-medium text-gray-900">
                            {Math.round((new Date(selectedFlashSale.endTime).getTime() - 
                              new Date(selectedFlashSale.startTime).getTime()) / 
                              (1000 * 60 * 60))} hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SellerFlashSales;