import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Upload,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sellerApi, type SellerProduct } from '../services/sellerApi';
import { formatPrice } from '../utils/currency';
import { getImageUrl, getProductImageUrl } from '../utils/imageUtils';
import ProductImport from '../components/ProductImport';
import ShopifyVariants from '../components/ShopifyVariants';

const SellerProducts: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading } = useAuth();

  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState<{product: SellerProduct, variants: any[]} | null>(null);
  const [variantSaveLoading, setVariantSaveLoading] = useState(false);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
  const [bulkDeleteSuccess, setBulkDeleteSuccess] = useState<string | null>(null);

  React.useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'SELLER') {
      navigate('/become-seller');
    }
  }, [user, authLoading, navigate]);

  const { data: products, isLoading} = useQuery({
    queryKey: ['seller-products'],
    queryFn: sellerApi.getProducts,
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: profile } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: sellerApi.getProfile,
    enabled: !!user && user.role === 'SELLER',
  });

  const deleteProductMutation = useMutation({
    mutationFn: sellerApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
      setShowDeleteConfirm(null);
    },
  });

  const toggleProductStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      sellerApi.updateProduct(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    },
  });

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductMutation.mutateAsync(id);
    } catch (error) {
      console.error('Failed to delete product:', 'Error occurred');
    }
  };

  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['seller-products'] });
    queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
    setShowImportModal(false);
  };

  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    setBulkDeleteError(null);
    setBulkDeleteSuccess(null);
    try {
      const result = await sellerApi.bulkDeleteProducts(selectedProducts);
      setBulkDeleteSuccess(`${result.deleted} products deleted, ${result.failed} failed.`);
      setSelectedProducts([]);
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['seller-dashboard'] });
    } catch (err: any) {
      setBulkDeleteError(err.message || 'Failed to delete selected products');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">Unable to load your products.</p>
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

  // Check if seller is approved
  const isApproved = profile?.status === 'APPROVED';

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
              <p className="text-gray-600">
                Manage your product catalog ({products?.length || 0}/10 products)
              </p>
            </div>
          
            {isApproved ? (
              <div className="flex flex-col gap-2">
                {(products?.length || 0) >= 10 ? (
                  <div className="bg-gray-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Product Limit Reached</span>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">
                      You've reached the maximum limit of 10 products. Delete a product to add a new one.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/seller/products/add')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Product ({10 - (products?.length || 0)} slots remaining)
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Upload size={20} />
                      Import CSV
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-800">Account Pending Approval</span>
                </div>
                <p className="text-gray-700 text-sm mt-1">
                  You can add products once your seller account is approved.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <input
                type="checkbox"
                checked={selectedProducts.length > 0 && products && selectedProducts.length === products.length}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedProducts((products || []).map((p: any) => p.id));
                  } else {
                    setSelectedProducts([]);
                  }
                }}
                className="mr-2"
                aria-label="Select all products"
              />
              <span className="text-sm text-gray-700">Select All</span>
            </div>
            <button
              onClick={handleBulkDelete}
              disabled={selectedProducts.length === 0 || bulkDeleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Trash2 size={18} />
              {bulkDeleteLoading ? 'Deleting...' : `Delete Selected (${selectedProducts.length})`}
            </button>
          </div>
          {bulkDeleteError && <div className="text-red-600 mb-2">{bulkDeleteError}</div>}
          {bulkDeleteSuccess && <div className="text-green-600 mb-2">{bulkDeleteSuccess}</div>}
        </motion.div>

        {/* Debugging: Show raw products data */}
        {!products?.length && (
          <pre className="bg-yellow-50 text-xs text-yellow-900 p-2 rounded mb-4 overflow-x-auto">
            {JSON.stringify(products, null, 2)}
          </pre>
        )}

        {/* Products Grid */}
        {!products?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Yet</h3>
            <p className="text-gray-600 mb-6">
              {isApproved 
                ? "Start by adding your first product to your store."
                : "Once your account is approved, you can start adding products."
              }
            </p>
            {isApproved && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/seller/products/add')}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Your First Product
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload size={20} />
                  Import from CSV
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {(products || []).map((product: any) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={e => {
                    if (e.target.checked) {
                      setSelectedProducts(prev => [...prev, product.id]);
                    } else {
                      setSelectedProducts(prev => prev.filter(id => id !== product.id));
                    }
                  }}
                  className="absolute top-2 right-2 z-10"
                  aria-label="Select product"
                />
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {getProductImageUrl(product) ? (
                    <img
                      src={getProductImageUrl(product)!}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 flex items-center gap-2">
                    {(product as any).name}
                    {product.featured && (
                      <span className="flex items-center ml-2">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        <span className="text-xs text-gray-600">Featured</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category.name}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {formatPrice((product as any).salePrice || (product as any).price)}
                      </p>
                      {(product as any).salePrice && (
                        <p className="text-sm text-gray-500 line-through">
                          {formatPrice((product as any).price)}
                        </p>
                      )}
                    </div>
                    <span className={`text-sm ${
                      (product as any).stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(product as any).stock > 0 ? `${(product as any).stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleProductStatus.mutate({
                        id: (product as any).id,
                        isActive: !product.isActive
                      })}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                      {product.isActive ? 'Hide' : 'Show'}
                    </button>
                    
                    <button
                      onClick={() => setShowVariantModal({ product, variants: product.variants || [] })}
                      className="flex items-center justify-center p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      aria-label="Edit variants"
                    >
                      Variants
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm((product as any).id)}
                      className="flex items-center justify-center p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                      aria-label="Delete product"
                    >
                      <Trash2 size={16} />
                    </button>

                    <button
                      onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                      className="flex items-center justify-center p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      aria-label="Edit product"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Remove Product</h3>
                    <p className="text-sm text-gray-600">This will deactivate the product from your store.</p>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Your sales data is safe!</p>
                      <p>This product will be removed from your store, but all historical sales data, orders, and statistics will be preserved for your records.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(showDeleteConfirm)}
                    disabled={deleteProductMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleteProductMutation.isPending ? 'Removing...' : 'Remove Product'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CSV Import Modal */}
        <AnimatePresence>
          {showImportModal && (
            <ProductImport
              onClose={() => setShowImportModal(false)}
              onSuccess={handleImportSuccess}
            />
          )}
        </AnimatePresence>

        {/* Variant Edit Modal */}
        <AnimatePresence>
          {showVariantModal && (
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
                className="bg-white rounded-lg p-6 max-w-2xl w-full"
              >
                <h3 className="text-xl font-bold mb-4">
                  Edit Variants for {showVariantModal.product ? showVariantModal.product.name : 'Product'}
                </h3>
                {variantError && <div className="mb-2 text-red-600">{variantError}</div>}
                <ShopifyVariants
                  value={showVariantModal.variants}
                  onChange={variants => setShowVariantModal(v => v ? { ...v, variants } : null)}
                  basePrice={showVariantModal.product.price}
                  initialAttributes={undefined} // Optionally parse from variants if needed
                />
                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => setShowVariantModal(null)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setVariantSaveLoading(true);
                      setVariantError(null);
                      try {
                        await sellerApi.updateProduct(showVariantModal.product.id, { variants: showVariantModal.variants });
                        queryClient.invalidateQueries({ queryKey: ['seller-products'] });
                        setShowVariantModal(null);
                      } catch (err: any) {
                        setVariantError(err.message || 'Failed to save variants');
                      } finally {
                        setVariantSaveLoading(false);
                      }
                    }}
                    disabled={variantSaveLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {variantSaveLoading ? 'Saving...' : 'Save Variants'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SellerProducts; 