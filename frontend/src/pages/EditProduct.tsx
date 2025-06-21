import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, CheckCircle, Upload, X } from 'lucide-react';
import { categoriesApi } from '../services/api';
import { sellerApi } from '../services/sellerApi';
import ShopifyVariants from '../components/ShopifyVariants';

const MAX_IMAGES = 5;

const EditProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [shopifyVariants, setShopifyVariants] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Load categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });
  const categories = categoriesData?.data?.categories || [];

  // Load product data
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => sellerApi.getProductById(id!),
    enabled: !!id,
  });

  // Prefill form when product loads
  useEffect(() => {
    if (productData?.product) {
      setFormData({ ...productData.product });
      setShopifyVariants(productData.product.variants || []);
      // Set image previews from URLs
      setImagePreviews(productData.product.images || (productData.product.image ? [productData.product.image] : []));
    }
  }, [productData]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imagePreviews.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [
      ...prev,
      ...files.map(file => URL.createObjectURL(file))
    ]);
  };

  // Remove image (by index)
  const handleRemoveImage = (idx: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    // Note: This will only remove new uploads, not existing URLs. For real apps, track which are files vs URLs.
  };

  // Update form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
    if (error) setError('');
  };

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: any) => sellerApi.updateProduct(id!, data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate('/seller/products'), 2000);
    },
    onError: (err: any) => setError(err.message || 'Failed to update product'),
  });

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name?.trim()) return setError('Product name is required');
    if (!formData.description?.trim()) return setError('Product description is required');
    if (!formData.categoryId) return setError('Please select a category');
    if (formData.price <= 0) return setError('Price must be greater than 0');
    if (formData.stock < 0) return setError('Stock cannot be negative');
    if (imagePreviews.length === 0) return setError('Please add at least one product image');

    // Transform variants for backend
    let submitData = { ...formData };
    if (Array.isArray(shopifyVariants) && shopifyVariants.length > 0 && shopifyVariants[0].options) {
      // Get attribute names from the table header
      const attributes = document.querySelectorAll('th');
      const attrNames: string[] = [];
      attributes.forEach((th) => {
        const text = th.textContent?.trim();
        if (text && !['Price', 'Stock', 'SKU', 'Image'].includes(text)) {
          attrNames.push(text);
        }
      });
      const flatVariants = (shopifyVariants as any[]).map((comb: any) => ({
        name: attrNames.map((n, i) => `${n}: ${comb.options[i]}`).join(', '),
        value: comb.options.join(' / '),
        price: comb.price,
        stock: comb.stock,
        sku: comb.sku,
        image: comb.image,
      }));
      submitData = { ...formData, variants: flatVariants as any };
    }

    // Handle images: for demo, just send URLs; for real apps, upload files and get URLs
    submitData.images = imagePreviews.slice(0, MAX_IMAGES);
    submitData.image = imagePreviews[0];

    try {
      await updateProductMutation.mutateAsync(submitData);
    } catch (err) {
      setError('Failed to update product');
    }
  };

  if (isLoading || !formData) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Updated!</h2>
          <p className="text-gray-600 mb-6">Your product has been updated.</p>
          <p className="text-sm text-gray-500">Redirecting to your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/seller/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update your product details below</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter product name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder="Describe your product..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select a category</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (RWF) *</label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                required
                min="1"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
              <input
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="0"
              />
            </div>
          </div>
          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (up to 5)</label>
            <div className="flex flex-wrap gap-3 mb-2">
              {imagePreviews.map((src, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                  <img src={src} alt="Preview" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 hover:bg-white">
                    <X size={16} />
                  </button>
                </div>
              ))}
              {imagePreviews.length < MAX_IMAGES && (
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <span className="text-xs text-gray-500">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
          {/* Variants */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Variants (optional)</label>
            <ShopifyVariants
              value={shopifyVariants}
              onChange={setShopifyVariants}
              basePrice={formData.price}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isPending}
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {updateProductMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct; 