import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save, Mail, Phone, MapPin, Building, Clipboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sellerApi } from '../../services/sellerApi';
import type { SellerProfile as SellerProfileType } from '../../services/sellerApi';

interface FormData {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  businessAddress: string;
  businessDescription: string;
  businessType: string;
}

const SellerProfile: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessDescription: '',
    businessType: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
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

  // Fetch seller profile
  const { data: profile, isLoading,  refetch } = useQuery({
    queryKey: ['seller-profile'],
    queryFn: sellerApi.getProfile
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || '',
        businessEmail: profile.businessEmail || '',
        businessPhone: profile.businessPhone || '',
        businessAddress: profile.businessAddress || '',
        businessDescription: profile.businessDescription || '',
        businessType: profile.businessType || ''
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: FormData) => sellerApi.updateProfile(data),
    onSuccess: () => {
      setIsEditing(false);
      refetch(); // Refresh profile data
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Handle specific error cases
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <User className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Error</h2>
          <p className="text-gray-600 mb-4">
            {(error as any).message || 'Unable to load your profile. Please try again.'}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => refetch()} 
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/seller/dashboard')} 
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Seller Profile</h1>
          <p className="text-gray-600">
            Manage your business information and settings
          </p>
        </motion.div>

        {/* Profile Status */}
        {profile && (
          <div className={`mb-6 p-4 rounded-lg ${
            profile.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
            profile.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
            profile.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            <div className="font-semibold">Account Status: {profile.status}</div>
            {profile.status === 'PENDING' && (
              <p className="text-sm mt-1">Your application is being reviewed. You'll be notified once it's approved.</p>
            )}
            {profile.status === 'REJECTED' && (
              <p className="text-sm mt-1">Your application was rejected. Please contact support for more information.</p>
            )}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-700 hover:text-gray-900"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <div className="relative">
                  <Clipboard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg`}
                  >
                    <option value="">Select Business Type</option>
                    <option value="INDIVIDUAL">Individual/Sole Proprietor</option>
                    <option value="COMPANY">Registered Company</option>
                    <option value="PARTNERSHIP">Partnership</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  rows={4}
                  disabled={!isEditing}
                  className={`w-full px-3 py-2 border ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'} rounded-lg`}
                ></textarea>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button 
                  type="submit"
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerProfile; 