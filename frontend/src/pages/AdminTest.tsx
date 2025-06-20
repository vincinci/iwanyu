import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminTest: React.FC = () => {
  const { user, token } = useAuth();
  const error = await response.json();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const testAdminAPI = async () => {
    setLoading(true);
    setError('');
    setDashboardData(null);

    try {
      console.log('Testing admin API...');
      console.log('User:', user);
      console.log('Token:', token);
      console.log('API Base URL:', API_BASE_URL);

      const response = await fetch(`${API_BASE_URL}/admin/dashboard`); {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard data:', data);
      setDashboardData(data);
    } catch (err: unknown) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loginAsAdmin = () => {
    navigate('/login', { 
      state: { 
        message: 'Please log in with admin credentials: admin@iwanyu.com or admin@iwanyu.store' 
      } 
    });
  };

  useEffect(() => {
    console.log('AdminTest mounted');
    console.log('User:', user);
    console.log('Token exists:', !!token);
    console.log('API URL:', API_BASE_URL);
  }, [user, token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Access Test</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Home
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? `${user.email} (${user.role})` : 'Not logged in'}</p>
            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}</p>
            <p><strong>Is Admin:</strong> {user?.role === 'ADMIN' ? '✅ Yes' : '❌ No'}</p>
            <p><strong>API URL:</strong> {API_BASE_URL}</p>
          </div>
          
          {(!user || user.role !== 'ADMIN') && (
            <div className="mt-4 p-4 bg-gray-100 border border-yellow-400 rounded">
              <p className="text-gray-700 mb-2">
                <strong>Admin access required!</strong>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Available admin accounts:
                <br />• admin@iwanyu.com
                <br />• admin@iwanyu.store
              </p>
              <button
                onClick={loginAsAdmin}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <div className="space-y-4">
            <button
              onClick={testAdminAPI}
              disabled={loading || !token}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Admin Dashboard API'}
            </button>
            
            {user?.role === 'ADMIN' && (
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded ml-4"
              >
                Go to Admin Dashboard
              </button>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
              {error.includes('502') && (
                <div className="mt-2 text-sm">
                  <p><strong>This is a 502 Bad Gateway error.</strong></p>
                  <p>The production backend may be sleeping. Try again in a minute.</p>
                </div>
              )}
            </div>
          )}
          
          {dashboardData && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <strong>✅ Success! Admin API is working.</strong>
              <div className="mt-2">
                <p>Users: {dashboardData.overview?.userCount || 0}</p>
                <p>Sellers: {dashboardData.overview?.sellerCount || 0}</p>
                <p>Products: {dashboardData.overview?.productCount || 0}</p>
                <p>Orders: {dashboardData.overview?.orderCount || 0}</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="p-4 bg-red-50 border border-red-200 rounded hover:bg-red-100 text-left"
            >
              <h3 className="font-medium text-red-700">Clear All Data & Re-login</h3>
              <p className="text-sm text-red-600">Reset authentication and try again</p>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="p-4 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 text-left"
            >
              <h3 className="font-medium text-blue-700">Refresh Page</h3>
              <p className="text-sm text-blue-600">Reload the current page</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTest; 