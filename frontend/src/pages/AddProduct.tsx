import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Package, ArrowLeft, AlertCircle, CheckCircle, Upload, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sellerApi, type ProductData } from '../services/sellerApi';
import { categoriesApi } from '../services/api';
import type { Category } from '../types/api';
import ProductVariants from '../components/ProductVariants';

const AddProduct: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [useImageUpload, setUseImageUpload] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    price: 0,
    salePrice: undefined,
    categoryId: '',
    stock: 0,
    image: '',
    productImage: undefined,
    productImages: [],
    images: [],
    brand: '',
    sku: '',
    variants: [],
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

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: profile } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: sellerApi.getProfile,
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: products } = useQuery({
    queryKey: ['seller-products'],
    queryFn: sellerApi.getProducts,
    enabled: !!user && user.role === 'SELLER',
  });

  const createProductMutation = useMutation({
    mutationFn: sellerApi.createProduct,
    onSuccess: (data) => {
      console.log('Product created successfully:', data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/seller/products');
      }, 2000);
    },
    onError: (error: Error) => {
      console.error('Product creation failed:', error);
      setError(error.message);
    },
  });

  const categories = categoriesData?.data?.categories || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));

    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleImageUpload = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentImages = formData.productImages || [];
    
    // Check if adding these files would exceed the limit
    if (currentImages.length + fileArray.length > 5) {
      setError(`Maximum 5 images allowed. You can add ${5 - currentImages.length} more images.`);
      return;
    }

    const newImages: File[] = [];
    const newPreviews: string[] = [];

    fileArray.forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select only valid image files (JPG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image file must be less than 5MB');
        return;
      }

      newImages.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newPreviews.push(result);
        
        // Update previews when all files are processed
        if (newPreviews.length === fileArray.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      reader.readAsDataURL(file);
    });

    // Update form data
    setFormData(prev => ({
      ...prev,
      productImages: [...currentImages, ...newImages],
      images: [], // Clear URLs when files are selected
    }));
    setError('');
  };

  const handleImageUrlChange = (url: string) => {
    const currentUrls = formData.images || [];
    
    if (currentUrls.length >= 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    if (url.trim()) {
      // Basic URL validation
      try {
        new URL(url);
        setFormData(prev => ({
          ...prev,
          images: [...currentUrls, url],
          productImages: [], // Clear files when URL is provided
        }));
        setImagePreviews(prev => [...prev, url]);
        setError('');
      } catch {
        setError('Please enter a valid image URL');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      productImages: prev.productImages?.filter((_, i) => i !== index) || [],
      images: prev.images?.filter((_, i) => i !== index) || [],
    }));
  };

  const removeAllImages = () => {
    setImagePreviews([]);
    setFormData(prev => ({
      ...prev,
      productImages: [],
      images: [],
    }));
  };

  const handleVariantsChange = (variants: ProductData['variants']) => {
    setFormData(prev => ({
      ...prev,
      variants: variants || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('=== PRODUCT CREATION DEBUG ===');
    console.log('Form data:', {
      ...formData,
      productImage: formData.productImage ? `File: ${formData.productImage.name} (${formData.productImage.size} bytes)` : undefined
    });
    console.log('User:', user);
    console.log('Profile:', profile);
    console.log('Categories available:', categories.length);
    
    // Enhanced validation with specific error messages
    const validationErrors = [];
    
    if (!formData.name.trim()) {
      validationErrors.push('Product name is required');
    }
    
    if (!formData.description.trim()) {
      validationErrors.push('Product description is required');
    }
    
    if (formData.price <= 0) {
      validationErrors.push('Price must be greater than 0');
    }
    
    if (!formData.categoryId) {
      validationErrors.push('Please select a category');
    } else {
      // Verify category exists
      const categoryExists = categories.some((cat: Category) => cat.id === formData.categoryId);
      if (!categoryExists) {
        validationErrors.push('Selected category is invalid');
      }
    }

    if (formData.stock < 0) {
      validationErrors.push('Stock cannot be negative');
    }

    // Check if either image file or URL is provided
    if (!formData.productImage && !formData.image?.trim()) {
      validationErrors.push('Please upload an image or provide an image URL');
    }

    // Authentication checks
    if (!user) {
      validationErrors.push('You must be logged in to create products');
    }

    if (user && user.role !== 'SELLER') {
      validationErrors.push('You must be a seller to create products');
    }

    if (profile && profile.status !== 'APPROVED') {
      validationErrors.push(`Your seller account must be approved. Current status: ${profile.status}`);
    }

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      setError(validationErrors[0]); // Show first error
      return;
    }

    try {
      console.log('All validations passed. Calling createProduct API...');
      setLoading(true);
      await createProductMutation.mutateAsync(formData);
    } catch (err) {
      console.error('Failed to create product:', err);
      // The error is already handled by onError callback above
    } finally {
      setLoading(false);
    }
  };

  // Show a detailed status screen if user is not ready to add products
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to add products to your store.</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn-primary"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'SELLER') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Account Required</h2>
          <p className="text-gray-600 mb-4">You need to create a seller account to add products.</p>
          <button 
            onClick={() => navigate('/become-seller')} 
            className="btn-primary"
          >
            Become a Seller
          </button>
        </div>
      </div>
    );
  }

  if (profile?.status !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Not Approved</h2>
          <p className="text-gray-600 mb-4">Your seller account must be approved before you can add products.</p>
          <div className="text-sm text-gray-500 mb-4">
            Current status: <span className="font-medium">{profile?.status || 'Unknown'}</span>
          </div>
          <button 
            onClick={() => navigate('/seller/dashboard')} 
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check product limit (10 products max)
  if ((products?.length || 0) >= 10) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Limit Reached</h2>
          <p className="text-gray-600 mb-4">
            You've reached the maximum limit of 10 products. Please delete a product to add a new one.
          </p>
          <div className="text-sm text-gray-500 mb-4">
            Current products: {products?.length || 0}/10
          </div>
          <button 
            onClick={() => navigate('/seller/products')} 
            className="btn-primary"
          >
            Manage Products
          </button>
        </div>
      </div>
    );
  }

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
            Your product has been successfully added to your catalog and is now visible to customers.
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
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate('/seller/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Back to products"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
            <p className="text-gray-600">
              Add a new product to your catalog
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">
                      {categoriesLoading 
                        ? 'Loading categories...' 
                        : categoriesError 
                        ? 'Error loading categories' 
                        : categories.length === 0 
                        ? 'No categories available' 
                        : 'Select a category'
                      }
                    </option>
                    {categories.map((category: Category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Describe your product..."
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regular Price (RWF) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sale Price (RWF)
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice || ''}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="input-field"
                    placeholder="Optional sale price"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Inventory</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1"
                    className="input-field"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Optional SKU"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Product brand"
                  />
                </div>
              </div>
            </div>

            {/* Product Variants */}
            <ProductVariants
              variants={formData.variants || []}
              onChange={handleVariantsChange}
              basePrice={formData.price}
            />

            {/* Product Images */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Images * 
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({imagePreviews.length}/5)
                  </span>
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setUseImageUpload(true)}
                    className={`flex items-center space-x-1 px-3 py-1 text-sm rounded ${
                      useImageUpload 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <Upload size={14} />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseImageUpload(false)}
                    className={`flex items-center space-x-1 px-3 py-1 text-sm rounded ${
                      !useImageUpload 
                        ? 'bg-gray-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <LinkIcon size={14} />
                    <span>URL</span>
                  </button>
                  {imagePreviews.length > 0 && (
                    <button
                      type="button"
                      onClick={removeAllImages}
                      className="flex items-center space-x-1 px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <X size={14} />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>
              </div>

              {useImageUpload ? (
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      dragActive 
                        ? 'border-gray-400 bg-gray-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    } ${imagePreviews.length >= 5 ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload product images"
                      title="Upload product images"
                      disabled={imagePreviews.length >= 5}
                    />
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium text-gray-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF up to 5MB each • Maximum 5 images
                        </p>
                        {imagePreviews.length >= 5 && (
                          <p className="text-xs text-red-500 mt-1">
                            Maximum limit reached
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Enter image URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const url = (e.target as HTMLInputElement).value;
                          if (url.trim()) {
                            handleImageUrlChange(url);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }
                      }}
                      disabled={imagePreviews.length >= 5}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                        if (input?.value.trim()) {
                          handleImageUrlChange(input.value);
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                      disabled={imagePreviews.length >= 5}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Preview ({imagePreviews.length} image{imagePreviews.length !== 1 ? 's' : ''})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Product preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label={`Remove image ${index + 1}`}
                          title={`Remove image ${index + 1}`}
                        >
                          <X size={12} />
                        </button>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
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
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {createProductMutation.isPending ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProduct; 