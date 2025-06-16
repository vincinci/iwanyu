import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, AlertCircle, Building2, Upload, File, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sellerApi, type BecomeSellerData } from '../services/sellerApi';

const BecomeSeller: React.FC = () => {
  const [formData, setFormData] = useState<BecomeSellerData>({
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    businessAddress: '',
    businessDescription: '',
    businessType: '',
  });
  const [nationalIdFile, setNationalIdFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNationalIdFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Debug logging
      console.log('Form submission started');
      console.log('API Base URL:', import.meta.env.VITE_API_URL);
      console.log('Form data:', formData);
      console.log('National ID file:', nationalIdFile);
      console.log('User token exists:', !!localStorage.getItem('token'));

      const submitData: BecomeSellerData = {
        ...formData,
        ...(nationalIdFile && { nationalId: nationalIdFile }),
      };
      
      const result = await sellerApi.becomeSeller(submitData);
      console.log('API response:', result);
      setSuccess(true);
    } catch (err) {
      console.error('Seller application error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your seller application has been submitted successfully. We'll review your application and get back to you within 2-3 business days.
          </p>
          <button
            onClick={() => navigate('/profile')}
            className="btn-primary w-full"
          >
            View Profile
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-8"
        >
          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <Store className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Seller</h1>
            <p className="text-gray-600">
              Join our marketplace and start selling your products to thousands of customers.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4 mb-8 p-4 bg-orange-50 rounded-lg">
            <div className="text-center">
              <Building2 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Easy Setup</h3>
              <p className="text-gray-600 text-xs">Quick application process</p>
            </div>
            <div className="text-center">
              <Store className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Large Audience</h3>
              <p className="text-gray-600 text-xs">Reach thousands of customers</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h3 className="font-semibold text-sm">Secure Payments</h3>
              <p className="text-gray-600 text-xs">Safe and reliable transactions</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Debug Panel - Only show in development */}
            {import.meta.env.DEV && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <h4 className="font-medium text-blue-900 mb-2">Debug Info:</h4>
                <ul className="text-blue-700 space-y-1">
                  <li>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}</li>
                  <li>User logged in: {user ? 'Yes' : 'No'}</li>
                  <li>Token exists: {!!localStorage.getItem('token') ? 'Yes' : 'No'}</li>
                  <li>Form valid: {!!(formData.businessName && nationalIdFile) ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email *
                </label>
                <input
                  type="email"
                  id="businessEmail"
                  name="businessEmail"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Your business email address"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Phone *
                </label>
                <input
                  type="tel"
                  id="businessPhone"
                  name="businessPhone"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Business phone number"
                  required
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Type
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="input-field"
                  aria-label="Select your business type"
                >
                  <option value="">Select business type</option>
                  <option value="Individual">Individual</option>
                  <option value="Small Business">Small Business</option>
                  <option value="Corporation">Corporation</option>
                  <option value="Partnership">Partnership</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Address
              </label>
              <input
                type="text"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                className="input-field"
                placeholder="Your business address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows={4}
                className="input-field resize-none"
                placeholder="Tell us about your business and the products you plan to sell..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID Document *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-orange-400 transition-colors">
                <div className="space-y-1 text-center">
                  {nationalIdFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <File className="w-8 h-8 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{nationalIdFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(nationalIdFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="nationalId"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                    >
                      <span>{nationalIdFile ? 'Change file' : 'Upload National ID'}</span>
                      <input
                        id="nationalId"
                        name="nationalId"
                        type="file"
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        required
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 5MB
                  </p>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Please upload a clear photo or scan of your national ID for verification purposes.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your application will be reviewed by our team. You'll receive an email confirmation once approved. This usually takes 2-3 business days.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.businessName || !nationalIdFile}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BecomeSeller; 