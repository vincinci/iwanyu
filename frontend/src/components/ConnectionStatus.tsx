import React, { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  apiBaseUrl?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      console.log('🔗 ConnectionStatus: Checking backend connection...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${apiBaseUrl}/../health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setIsOnline(true);
        setRetryCount(0);
        console.log('✅ ConnectionStatus: Backend connection healthy');
      } else {
        setIsOnline(false);
        console.warn(`⚠️ ConnectionStatus: Backend unhealthy - Status: ${response.status}`);
      }
    } catch (error) {
      setIsOnline(false);
      setRetryCount(prev => prev + 1);
      console.error('❌ ConnectionStatus: Backend connection failed:', error);
    } finally {
      setIsChecking(false);
      setLastCheck(new Date());
    }
  };

  const handleRetry = () => {
    checkConnection();
  };

  useEffect(() => {
    // Initial check
    checkConnection();

    // Regular health checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    // Check on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ ConnectionStatus: Page visible - checking connection');
        checkConnection();
      }
    };

    // Check on window focus
    const handleFocus = () => {
      console.log('🎯 ConnectionStatus: Window focused - checking connection');
      checkConnection();
    };

    // Handle browser online/offline events
    const handleOnline = () => {
      console.log('🌐 ConnectionStatus: Browser online');
      checkConnection();
    };

    const handleOffline = () => {
      console.log('🌐 ConnectionStatus: Browser offline');
      setIsOnline(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [apiBaseUrl]);

  const getStatusColor = () => {
    if (isChecking) return 'bg-yellow-500';
    return isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isOnline ? 'Connected' : 'Disconnected';
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getTimeSince = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[180px]">
        {/* Status Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${isChecking ? 'animate-pulse' : ''}`} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </span>
          {retryCount > 0 && !isOnline && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({retryCount} attempts)
            </span>
          )}
        </div>

        {/* Connection Details */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <div>
            Last check: {getTimeSince(lastCheck)}
          </div>
          <div>
            Time: {formatTime(lastCheck)}
          </div>
        </div>

        {/* Retry Button */}
        {!isOnline && (
          <button
            onClick={handleRetry}
            disabled={isChecking}
            className="mt-2 w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Retry Connection'}
          </button>
        )}

        {/* Status Message */}
        {!isOnline && !isChecking && (
          <div className="mt-2 text-xs text-red-600 dark:text-red-400">
            {retryCount > 3 ? 'Server may be down' : 'Connection lost'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus; 