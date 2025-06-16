// Simple Connection Manager for Persistent Frontend-Backend Connection
// Monitors connection health and provides automatic retry capabilities

let isConnectionHealthy = true;
let lastHealthCheck = new Date();
let healthCheckInterval: NodeJS.Timeout | null = null;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
const CONNECTION_TIMEOUT = 8000; // 8 seconds

// Show connection status notification
const showConnectionNotification = (message: string, type: 'success' | 'warning' | 'error') => {
  // Only show in browser environment
  if (typeof window === 'undefined') return;
  
  let notification = document.getElementById('connection-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'connection-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    document.body.appendChild(notification);
  }

  const colors = {
    success: { bg: '#10B981', text: '#FFFFFF' },
    warning: { bg: '#F59E0B', text: '#FFFFFF' },
    error: { bg: '#EF4444', text: '#FFFFFF' }
  };

  const color = colors[type];
  notification.style.backgroundColor = color.bg;
  notification.style.color = color.text;
  notification.textContent = message;

  // Auto-hide success messages
  if (type === 'success') {
    setTimeout(() => {
      if (notification && notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
};

// Perform health check
export const performHealthCheck = async (): Promise<boolean> => {
  try {
    console.log('🏥 Connection Manager: Performing health check...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/../health`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const healthy = response.ok;
    console.log(`🏥 Connection Manager: Health check ${healthy ? 'PASSED' : 'FAILED'} - Status: ${response.status}`);

    lastHealthCheck = new Date();

    // Handle status change
    if (healthy && !isConnectionHealthy) {
      isConnectionHealthy = true;
      showConnectionNotification('Connection restored', 'success');
      console.log('✅ Connection Manager: Connection restored');
    } else if (!healthy && isConnectionHealthy) {
      isConnectionHealthy = false;
      showConnectionNotification('Connection lost - retrying...', 'error');
      console.warn('⚠️ Connection Manager: Connection lost');
    }

    return healthy;
  } catch (error) {
    console.error('🏥 Connection Manager: Health check failed:', error);
    
    if (isConnectionHealthy) {
      isConnectionHealthy = false;
      showConnectionNotification('Connection lost - retrying...', 'error');
      console.warn('⚠️ Connection Manager: Connection lost due to error');
    }
    
    lastHealthCheck = new Date();
    return false;
  }
};

// Start connection monitoring
export const startConnectionMonitoring = () => {
  console.log('🔄 Connection Manager: Starting connection monitoring...');
  
  // Initial health check
  performHealthCheck();

  // Regular health checks
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  healthCheckInterval = setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);

  // Listen for visibility changes
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('👁️ Connection Manager: Page visible - checking connection');
      performHealthCheck();
    }
  };

  // Listen for window focus
  const handleFocus = () => {
    console.log('🎯 Connection Manager: Window focused - checking connection');
    performHealthCheck();
  };

  // Handle browser online/offline events
  const handleOnline = () => {
    console.log('🌐 Connection Manager: Browser online');
    showConnectionNotification('Internet connected - checking server...', 'warning');
    performHealthCheck();
  };

  const handleOffline = () => {
    console.log('🌐 Connection Manager: Browser offline');
    isConnectionHealthy = false;
    showConnectionNotification('No internet connection', 'error');
  };

  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleFocus);
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  console.log('✅ Connection Manager: Monitoring started successfully');
};

// Stop connection monitoring
export const stopConnectionMonitoring = () => {
  console.log('🔄 Connection Manager: Stopping connection monitoring...');
  
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }

  // Remove notification
  const notification = document.getElementById('connection-notification');
  if (notification) {
    notification.remove();
  }

  console.log('✅ Connection Manager: Monitoring stopped');
};

// Get connection status
export const getConnectionStatus = () => ({
  isHealthy: isConnectionHealthy,
  lastHealthCheck,
  apiUrl: API_BASE_URL
});

// Force health check
export const forceHealthCheck = async (): Promise<boolean> => {
  console.log('🔄 Connection Manager: Force health check requested');
  return await performHealthCheck();
}; 