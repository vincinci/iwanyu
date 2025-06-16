import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, token, isLoading, refreshUser } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const testAuthEndpoint = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const storedToken = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text()
      };

      setTestResult(result);
    } catch (error) {
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Auth State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
              <div><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</div>
              <div><strong>Token (Context):</strong> {token ? 'Present' : 'None'}</div>
              <div><strong>Current Path:</strong> {window.location.pathname}</div>
            </div>
          </div>

          {/* LocalStorage State */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">LocalStorage State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Stored Token:</strong> {localStorage.getItem('token') ? 'Present' : 'None'}</div>
              <div><strong>Stored User:</strong> {localStorage.getItem('user') ? 'Present' : 'None'}</div>
              {localStorage.getItem('user') && (
                <div className="mt-2">
                  <strong>User Data:</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                    {localStorage.getItem('user')}
                  </pre>
                </div>
              )}
              {localStorage.getItem('token') && (
                <div className="mt-2">
                  <strong>Token (first 50 chars):</strong>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                    {localStorage.getItem('token')?.substring(0, 50)}...
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Test Auth Endpoint */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Auth Endpoint</h2>
            <button
              onClick={testAuthEndpoint}
              disabled={testing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50 mb-4"
            >
              {testing ? 'Testing...' : 'Test /auth/validate'}
            </button>
            
            {testResult && (
              <div className="mt-4">
                <strong>Result:</strong>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-1 overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={refreshUser}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded w-full"
              >
                Refresh User Data
              </button>
              <button
                onClick={clearAuth}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
              >
                Clear Auth & Reload
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded w-full"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>

        {/* Console Logs */}
        <div className="bg-white p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="text-sm space-y-2">
            <p>1. Open browser developer tools (F12)</p>
            <p>2. Go to Console tab to see AuthContext debug messages</p>
            <p>3. Look for any API error messages or 401 responses</p>
            <p>4. Check Network tab to see what API calls are being made</p>
            <p>5. If you see login redirects, check what triggered them</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebug; 