import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  Plus,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  cta: string;
  image: File | null;
  imageUrl?: string;
}

const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    cta: '',
    image: null,
    imageUrl: ''
  });
  const { showSuccess, showError } = useToast();
  const 
  const { user } = useAuth();

  // Admin protection
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'ADMIN') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Load banners from localStorage (in a real app, this would be an API call)
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = () => {
    try {
      const savedBanners = localStorage.getItem('iwanyu_banners');
      if (savedBanners) {
        setBanners(JSON.parse(savedBanners));
      } else {
        // Initialize with default banners
        const defaultBanners: Banner[] = [
          {
            id: '1',
            title: 'New Arrivals',
            subtitle: 'Latest fashion and lifestyle essentials',
            image: '/src/assets/banners/banner-1.png',
            cta: 'Shop Now',
            order: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2',
            title: 'Winter Collection',
            subtitle: 'Stay warm with premium outerwear',
            image: '/src/assets/banners/banner-2.png',
            cta: 'Explore',
            order: 2,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '3',
            title: 'Essential Style',
            subtitle: 'Premium quality everyday fashion',
            image: '/src/assets/banners/banner-3.png',
            cta: 'Discover',
            order: 3,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '4',
            title: 'Active Lifestyle',
            subtitle: 'Performance gear for every adventure',
            image: '/src/assets/banners/banner-4.png',
            cta: 'Shop Collection',
            order: 4,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '5',
            title: 'Premium Audio',
            subtitle: 'Experience superior sound quality',
            image: '/src/assets/banners/banner-5.png',
            cta: 'Listen Now',
            order: 5,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        setBanners(defaultBanners);
        saveBanners(defaultBanners);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
      showError('Error', 'Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  const saveBanners = (bannersToSave: Banner[]) => {
    try {
      localStorage.setItem('iwanyu_banners', JSON.stringify(bannersToSave));
      // Also update the Home component's banner data
      window.dispatchEvent(new CustomEvent('bannersUpdated', { detail: bannersToSave }));
    } catch (error) {
      console.error('Error saving banners:', error);
      showError('Error', 'Failed to save banners');
    }
  };

  const resetFormData = () => {
    setFormData({
      title: '',
      subtitle: '',
      cta: '',
      image: null,
      imageUrl: ''
    });
  };

  const handleAddBanner = () => {
    setShowAddForm(true);
    setEditingBanner(null);
    resetFormData();
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle,
      cta: banner.cta,
      image: null,
      imageUrl: banner.image
    });
    setShowAddForm(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Invalid File', 'Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File Too Large', 'Please select an image smaller than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, imageUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.subtitle.trim() || !formData.cta.trim()) {
      showError('Validation Error', 'Please fill in all required fields');
      return;
    }

    if (!formData.imageUrl && !editingBanner) {
      showError('Validation Error', 'Please select an image');
      return;
    }

    try {
      const now = new Date();
      
      if (editingBanner) {
        // Update existing banner
        const updatedBanners = banners.map(banner =>
          banner.id === editingBanner.id
            ? {
                ...banner,
                title: formData.title.trim(),
                subtitle: formData.subtitle.trim(),
                cta: formData.cta.trim(),
                image: formData.imageUrl || banner.image,
                updatedAt: now
              }
            : banner
        );
        setBanners(updatedBanners);
        saveBanners(updatedBanners);
        showSuccess('Success', 'Banner updated successfully');
      } else {
        // Add new banner
        const newBanner: Banner = {
          id: Date.now().toString(),
          title: formData.title.trim(),
          subtitle: formData.subtitle.trim(),
          cta: formData.cta.trim(),
          image: formData.imageUrl!,
          order: banners.length + 1,
          isActive: true,
          createdAt: now,
          updatedAt: now
        };
        const updatedBanners = [...banners, newBanner];
        setBanners(updatedBanners);
        saveBanners(updatedBanners);
        showSuccess('Success', 'Banner added successfully');
      }

      setShowAddForm(false);
      setEditingBanner(null);
      resetFormData();
    } catch (error) {
      console.error('Error saving banner:', error);
      showError('Error', 'Failed to save banner');
    }
  };

  const handleDeleteBanner = (bannerId: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        const updatedBanners = banners.filter(banner => banner.id !== bannerId);
        // Reorder remaining banners
        const reorderedBanners = updatedBanners.map((banner, index) => ({
          ...banner,
          order: index + 1
        }));
        setBanners(reorderedBanners);
        saveBanners(reorderedBanners);
        showSuccess('Success', 'Banner deleted successfully');
      } catch (error) {
        console.error('Error deleting banner:', error);
        showError('Error', 'Failed to delete banner');
      }
    }
  };

  const handleToggleActive = (bannerId: string) => {
    try {
      const updatedBanners = banners.map(banner =>
        banner.id === bannerId
          ? { ...banner, isActive: !banner.isActive, updatedAt: new Date() }
          : banner
      );
      setBanners(updatedBanners);
      saveBanners(updatedBanners);
      showSuccess('Success', 'Banner status updated');
    } catch (error) {
      console.error('Error updating banner status:', error);
      showError('Error', 'Failed to update banner status');
    }
  };

  const handleReorderBanner = (bannerId: string, direction: 'up' | 'down') => {
    try {
      const bannerIndex = banners.findIndex(b => b.id === bannerId);
      if (bannerIndex === -1) return;

      const newIndex = direction === 'up' ? bannerIndex - 1 : bannerIndex + 1;
      if (newIndex < 0 || newIndex >= banners.length) return;

      const updatedBanners = [...banners];
      [updatedBanners[bannerIndex], updatedBanners[newIndex]] = 
      [updatedBanners[newIndex], updatedBanners[bannerIndex]];

      // Update order numbers
      const reorderedBanners = updatedBanners.map((banner, index) => ({
        ...banner,
        order: index + 1,
        updatedAt: new Date()
      }));

      setBanners(reorderedBanners);
      saveBanners(reorderedBanners);
      showSuccess('Success', 'Banner order updated');
    } catch (error) {
      console.error('Error reordering banner:', error);
      showError('Error', 'Failed to reorder banner');
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all banners to defaults? This will delete all custom banners.')) {
      try {
        localStorage.removeItem('iwanyu_banners');
        loadBanners();
        showSuccess('Success', 'Banners reset to defaults');
      } catch (error) {
        console.error('Error resetting banners:', error);
        showError('Error', 'Failed to reset banners');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Banner Manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Admin Dashboard</span>
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Banner Manager</h1>
              <p className="text-gray-600 mt-1">Manage homepage banners and carousel content</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw size={16} />
                Reset to Defaults
              </button>
              <button
                onClick={handleAddBanner}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors"
              >
                <Plus size={16} />
                Add Banner
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Banners</p>
                <p className="text-2xl font-bold text-gray-900">{banners.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Banners</p>
                <p className="text-2xl font-bold text-gray-900">{banners.filter(b => b.isActive).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Upload className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {banners.length > 0 
                    ? new Date(Math.max(...banners.map(b => new Date(b.updatedAt).getTime()))).toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Banners</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your homepage banner carousel</p>
          </div>
          
          <div className="p-6">
            {banners.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No banners found</h3>
                <p className="text-gray-600 mb-4">Get started by adding your first banner</p>
                <button
                  onClick={handleAddBanner}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors"
                >
                  Add Your First Banner
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner, index) => (
                  <motion.div
                    key={banner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border rounded-lg p-4 transition-all ${
                      banner.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Banner Preview */}
                      <div className="lg:w-1/3">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-banner.jpg';
                            }}
                          />
                          {!banner.isActive && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                              <span className="text-white font-medium">Inactive</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Banner Details */}
                      <div className="lg:w-2/3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{banner.title}</h3>
                              <p className="text-gray-600">{banner.subtitle}</p>
                              <p className="text-sm text-yellow-600 font-medium mt-1">CTA: {banner.cta}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                banner.isActive 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {banner.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                Order: {banner.order}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-4">
                            Created: {new Date(banner.createdAt).toLocaleDateString()} | 
                            Updated: {new Date(banner.updatedAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setPreviewBanner(banner)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Eye size={14} />
                            Preview
                          </button>
                          <button
                            onClick={() => handleEditBanner(banner)}
                            className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleActive(banner.id)}
                            className={`flex items-center gap-1 px-3 py-1 rounded-md transition-colors text-sm ${
                              banner.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {banner.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleReorderBanner(banner.id, 'up')}
                            disabled={index === 0}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleReorderBanner(banner.id, 'down')}
                            disabled={index === banners.length - 1}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Banner Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingBanner(null);
                      resetFormData();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Image *
                    </label>
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      {formData.imageUrl ? (
                        <div className="space-y-4">
                          <img
                            src={formData.imageUrl}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: null, imageUrl: '' }))}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                          <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter banner title"
                      required
                    />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle *
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter banner subtitle"
                      required
                    />
                  </div>

                  {/* CTA Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Call-to-Action Text *
                    </label>
                    <input
                      type="text"
                      value={formData.cta}
                      onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="e.g., Shop Now, Learn More, Get Started"
                      required
                    />
                  </div>

                  {/* Form Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingBanner(null);
                        resetFormData();
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Save size={16} />
                      {editingBanner ? 'Update Banner' : 'Add Banner'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBanner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Banner Preview</h2>
                  <button
                    onClick={() => setPreviewBanner(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Banner Preview */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={previewBanner.image}
                    alt={previewBanner.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-semibold shadow-lg transition-colors">
                      {previewBanner.cta}
                    </button>
                  </div>
                </div>

                {/* Banner Details */}
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">{previewBanner.title}</h3>
                  <p className="text-gray-600">{previewBanner.subtitle}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Order: {previewBanner.order}</span>
                    <span>Status: {previewBanner.isActive ? 'Active' : 'Inactive'}</span>
                    <span>Created: {new Date(previewBanner.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BannerManager; 