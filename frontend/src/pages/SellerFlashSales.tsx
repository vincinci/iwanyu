import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatPrice } from '../utils/currency';

// Import sellerApi from your API services
import api from '../services/api';
const sellerApi = api.seller;

interface FlashSale {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  products: FlashSaleProduct[];
}

interface FlashSaleProduct {
  id: string;
  productId: string;
  salePrice: number;
  originalPrice: number;
  stock: number;
  sold: number;
  product: {
    name: string;
    image: string;
  };
}

const SellerFlashSales: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSale, setNewSale] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch flash sales
  const { data: flashSales, isLoading } = useQuery({
    queryKey: ['seller-flash-sales'],
    queryFn: () => sellerApi.getFlashSales(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Create flash sale mutation
  const createSaleMutation = useMutation({
    mutationFn: (saleData: typeof newSale) => sellerApi.createFlashSale(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-flash-sales'] });
      setShowCreateModal(false);
      setNewSale({ title: '', description: '', startTime: '', endTime: '' });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create flash sale');
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/seller/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flash Sales</h1>
            <p className="text-gray-600">Manage your time-limited promotional sales</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          aria-label="Create new flash sale"
        >
          <Plus size={20} />
          New Flash Sale
        </button>
      </div>

      {/* Flash Sales List */}
      <div className="grid gap-6">
        {flashSales?.data?.map((sale: FlashSale) => (
          <motion.div
            key={sale.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{sale.title}</h3>
                <p className="text-gray-600">{sale.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {new Date(sale.endTime) > new Date() ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    Ended
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{new Date(sale.startTime).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{new Date(sale.startTime).toLocaleTimeString()} - {new Date(sale.endTime).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sale.products.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {product.product.image && (
                      <img
                        src={product.product.image}
                        alt={product.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.product.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-red-600 font-semibold">
                        {formatPrice(product.salePrice)}
                      </span>
                      <span className="text-gray-400 text-sm line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      Sold: {product.sold}/{product.stock}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Flash Sale Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Flash Sale</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertCircle size={20} />
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createSaleMutation.mutate(newSale);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={newSale.title}
                  onChange={(e) => setNewSale({ ...newSale, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter flash sale title"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newSale.description}
                  onChange={(e) => setNewSale({ ...newSale, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter flash sale description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={newSale.startTime}
                    onChange={(e) => setNewSale({ ...newSale, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={newSale.endTime}
                    onChange={(e) => setNewSale({ ...newSale, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSaleMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {createSaleMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create Sale
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SellerFlashSales;