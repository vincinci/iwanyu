import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getSellerFlashSales,
  createSellerFlashSale,
  getSellerDiscountedProducts,
  addProductToFlashSale,
  removeProductFromFlashSale
} from '../services/api';

const SellerFlashSales: React.FC = () => {
  const { user } = useAuth();
  const 
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<any[]>([]);
  const [selectedFlashSale, setSelectedFlashSale] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Authentication check
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

  // Fetch flash sales and discounted products
  const fetchData = async () => {
    setLoading(true);
    try {
      const [fsRes, dpRes] = await Promise.all([
        getSellerFlashSales(),
        getSellerDiscountedProducts()
      ]);
      setFlashSales(fsRes.data.data);
      setDiscountedProducts(dpRes.data.data);
    } catch (err: unknown) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create a new flash sale
  const handleCreateFlashSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createSellerFlashSale(form);
      setForm({ title: '', description: '', startTime: '', endTime: '' });
      await fetchData();
    } catch (err: unknown) {
      setError('Failed to create flash sale');
    } finally {
      setLoading(false);
    }
  };

  // Add product to selected flash sale
  const handleAddProduct = async (productId: string) => {
    if (!selectedFlashSale) return;
    setLoading(true);
    setError(null);
    try {
      await addProductToFlashSale(selectedFlashSale, productId);
      await fetchData();
    } catch (err: unknown) {
      setError('Failed to add product to flash sale');
    } finally {
      setLoading(false);
    }
  };

  // Remove product from flash sale
  const handleRemoveProduct = async (flashSaleId: string, productId: string) => {
    setLoading(true);
    setError(null);
    try {
      await removeProductFromFlashSale(flashSaleId, productId);
      await fetchData();
    } catch (err: unknown) {
      setError('Failed to remove product from flash sale');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/seller/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <h1 className="text-2xl font-bold mb-6">Flash Sales Management</h1>

      {/* Create Flash Sale Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Flash Sale</h2>
        <form onSubmit={handleCreateFlashSale} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="border rounded px-3 py-2"
          />
          <input
            type="datetime-local"
            placeholder="Start Time"
            value={form.startTime}
            onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
            className="border rounded px-3 py-2"
            required
          />
          <input
            type="datetime-local"
            placeholder="End Time"
            value={form.endTime}
            onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
            className="border rounded px-3 py-2"
            required
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-2 bg-yellow-400 hover:bg-gray-500 text-black font-bold py-2 rounded mt-2"
            disabled={loading}
          >
            Create Flash Sale
          </button>
        </form>
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </div>

      {/* Flash Sales List */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Flash Sales</h2>
        {flashSales.length === 0 ? (
          <div className="text-gray-500">No flash sales yet.</div>
        ) : (
          <ul className="space-y-4">
            {flashSales.map((fs: unknown) => (
              <li key={fs.id} className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-700">{fs.title}</div>
                    <div className="text-sm text-gray-500">{fs.description}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(fs.startTime).toLocaleString()} - {new Date(fs.endTime).toLocaleString()}
                    </div>
                  </div>
                  <button
                    className={`ml-4 px-3 py-1 rounded ${selectedFlashSale === fs.id ? 'bg-gray-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setSelectedFlashSale(fs.id)}
                  >
                    {selectedFlashSale === fs.id ? 'Selected' : 'Manage'}
                  </button>
                </div>
                {/* Products in this flash sale */}
                {fs.products && fs.products.length > 0 && (
                  <div className="mt-4">
                    <div className="font-semibold mb-2 text-sm">Products in this Flash Sale:</div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {fs.products.map((fsp: unknown) => (
                        <li key={fsp.productId} className="flex items-center justify-between border rounded px-2 py-1">
                          <span>{fsp.product?.name}</span>
                          <button
                            className="text-xs text-red-600 hover:underline"
                            onClick={() => handleRemoveProduct(fs.id, fsp.productId)}
                            disabled={loading}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Discounted Products List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Your Discounted Products</h2>
        {discountedProducts.length === 0 ? (
          <div className="text-gray-500">No discounted products found.</div>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {discountedProducts.map((product: unknown) => (
              <li key={product.id} className="flex items-center justify-between border rounded px-2 py-1">
                <span>{product.name}</span>
                <button
                  className="text-xs bg-yellow-400 hover:bg-gray-500 text-black font-bold px-3 py-1 rounded"
                  onClick={() => handleAddProduct(product.id)}
                  disabled={!selectedFlashSale || loading}
                >
                  Add to Flash Sale
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SellerFlashSales; 