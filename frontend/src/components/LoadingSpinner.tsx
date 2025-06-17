import React, { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  message?: string;
  timeout?: number; // Auto-hide after timeout (in ms)
  onTimeout?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading...", 
  timeout = 10000, // Default 10 second timeout
  onTimeout,
  size = 'md',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        console.warn('Loading spinner timeout reached');
        setIsVisible(false);
        onTimeout?.();
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, onTimeout]);

  if (!isVisible) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Timeout</h3>
          <p className="text-gray-600 mb-4">The page is taking longer than expected to load.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Simplified spinner for better mobile performance */}
      <div className={`${sizeClasses[size]} animate-spin mb-4`}>
        <svg 
          className="w-full h-full text-orange-500" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      
      {/* Loading message */}
      <div className="text-center">
        <p className="text-gray-600 text-sm">{message}</p>
        {timeout > 0 && (
          <p className="text-gray-400 text-xs mt-1">
            Please wait...
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 