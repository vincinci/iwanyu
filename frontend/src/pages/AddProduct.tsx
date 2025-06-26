import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, ArrowLeft, AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sellerApi, type ProductData, type ProductVariantInput } from '../services/sellerApi';
import { categoriesApi } from '../services/api';
import type { Category, ProductVariant } from '../types/api';
import ShopifyVariants from '../components/ShopifyVariants';

const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    stock: 1,
    image: '',
    productImage: undefined,
    productImages: [],
    images: [],
    brand: '',
    sku: '',
    variants: [], // Will only be used for backend submission
  });

  // New: Separate state for ShopifyVariants
  const [shopifyVariants, setShopifyVariants] = useState<any[]>([]);

  // Add state for multiple images and previews
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (user.role !== 'SELLER') {
      navigate('/become-seller');
    }
  }, [user, navigate]);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const createProductMutation = useMutation({
    mutationFn: sellerApi.createProduct,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate('/seller/products');
      }, 2000);
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to create product');
    },
  });

  const categories = categoriesData?.data?.categories || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));

    if (error) setError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        productImage: file,
        image: '', // Clear URL if file is selected
      }));
      setError('');
    }
  };

  // Handle multiple image selection
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  // Remove image by index
  const handleRemoveImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setImageFiles(prev => [...prev, ...files]);
    setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    if (formData.stock < 0) {
      setError('Stock cannot be negative');
      return;
    }

    if (imageFiles.length === 0) {
      setError('Please add at least one product image');
      return;
    }

    // Build FormData for file upload
    const formDataData = new FormData();
    formDataData.append('name', formData.name);
    formDataData.append('description', formData.description);
    formDataData.append('price', String(formData.price));
    formDataData.append('categoryId', formData.categoryId);
    formDataData.append('stock', String(formData.stock));
    if (formData.brand) formDataData.append('brand', formData.brand);
    if (formData.sku) formDataData.append('sku', formData.sku);

    // Add main image
    if (imageFiles[0]) {
      formDataData.append('productImage', imageFiles[0]);
    }

    // Add additional images
    imageFiles.slice(1).forEach(file => {
      formDataData.append('productImages', file);
    });

    // Add variants if any
    if (shopifyVariants.length > 0) {
      formDataData.append('variants', JSON.stringify(shopifyVariants));
    }

    try {
      await createProductMutation.mutateAsync(formDataData);
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Added!</h2>
          <p className="text-gray-600 mb-6">
            Your product has been successfully added to your catalog.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to your products...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/seller/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Product</h1>
            <p className="text-gray-600">Fill in the basic details to add your product</p>
          </div>
        </motion.div>

        {/* Simple Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                id="product-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Enter product name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="product-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                placeholder="Describe your product..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="product-category"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select a category</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price and Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (RWF) *
                </label>
                <input
                  id="product-price"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  id="product-stock"
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

            {/* Product Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
              <div className="mb-2 grid grid-cols-3 gap-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img src={src} alt="Preview" className="object-cover w-full h-full" />
                    <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-red-600 hover:bg-white">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <label
                  className={`flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  aria-label="Add product image (drag and drop or click)"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') (e.target as HTMLLabelElement).click(); }}
                  style={{ outline: isDragging ? '2px solid #f97316' : undefined }}
                >
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <span className="text-xs text-gray-500">Add Image<br/>(drag & drop or click)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-xs text-gray-500">{imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''} selected</div>
            </div>

            {/* Product Variants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Variants (optional)
              </label>
              <ShopifyVariants
                value={shopifyVariants}
                onChange={setShopifyVariants}
                basePrice={formData.price}
              />
            </div>

            {/* Submit Buttons */}
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
                disabled={createProductMutation.isPending}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProduct; 