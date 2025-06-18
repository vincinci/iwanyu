import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sellerApi } from '../services/sellerApi';

const SellerProfile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessDescription: '',
    businessType: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch seller profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const data = await sellerApi.getProfile();
        setProfile(data);
        setFormData({
          businessName: data.businessName || '',
          businessEmail: data.businessEmail || '',
          businessPhone: data.businessPhone || '',
          businessAddress: data.businessAddress || '',
          businessDescription: data.businessDescription || '',
          businessType: data.businessType || ''
        });
        setError(null);
      } catch (err) {
        setError((err as Error).message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    if (user && user.role === 'SELLER') {
      fetchProfile();
    }
  }, [user]);

  // Update profile handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await sellerApi.updateProfile(formData);
      setIsEditing(false);
      // Refresh profile data
      const updatedProfile = await sellerApi.getProfile();
      setProfile(updatedProfile);
    } catch (err) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          <h2 className="font-bold">Error Loading Profile</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/seller/dashboard')} 
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/seller/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Seller Profile</h1>

      {/* Profile Status */}
      {profile?.status && (
        <div className={`mb-6 p-4 rounded-lg ${
          profile.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
          profile.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          <div className="font-semibold">Account Status: {profile.status}</div>
        </div>
      )}

      {/* Profile Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-lg font-semibold">Business Information</h2>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-700 hover:text-gray-900"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Email</label>
            <input
              type="email"
              name="businessEmail"
              value={formData.businessEmail}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
            <input
              type="tel"
              name="businessPhone"
              value={formData.businessPhone}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
            <input
              type="text"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
            <textarea
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleInputChange}
              rows={4}
              disabled={!isEditing}
              className={`w-full px-3 py-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
            ></textarea>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button 
                type="submit"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SellerProfile; 