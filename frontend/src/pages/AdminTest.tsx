import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AdminTest: React.FC = () => {
  const { user, token } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAdminAPI = async () => {
    setLoading(true);
    setError('');
    setDashboardData(null);

    try {
      console.log('Testing admin API...');
      console.log('User:', user);
      console.log('Token:', token);

      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Dashboard data:', data);
      setDashboardData(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('AdminTest mounted');
    console.log('User:', user);
    console.log('Token exists:', !!token);
  }, [user, token]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin API Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'Not logged in'}</p>
            <p><strong>Token:</strong> {token ? `${token.substring(0, 20)}...` : 'No token'}</p>
            <p><strong>Is Admin:</strong> {user?.role === 'ADMIN' ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <button
            onClick={testAdminAPI}
            disabled={loading || !token || user?.role !== 'ADMIN'}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Admin Dashboard API'}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {dashboardData && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              <strong>Success!</strong>
              <pre className="mt-2 text-sm">
                {JSON.stringify(dashboardData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>API Base URL:</strong> http://localhost:3001/api</p>
            <p><strong>Frontend URL:</strong> {window.location.origin}</p>
            <p><strong>LocalStorage Token:</strong> {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <p><strong>LocalStorage User:</strong> {localStorage.getItem('user') ? 'Present' : 'Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTest; 