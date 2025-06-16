import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('AuthContext: Initializing auth', {
        hasStoredToken: !!storedToken,
        hasStoredUser: !!storedUser,
        currentPath: window.location.pathname
      });
      
      if (storedToken && storedUser) {
        try {
          console.log('AuthContext: Validating stored token');
          // Validate token by making a test request
          const response = await fetch(`${API_BASE_URL}/auth/validate`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('AuthContext: Token validation response', {
            ok: response.ok,
            status: response.status
          });

          if (response.ok) {
            // Token is valid, restore user session
            const validationData = await response.json();
            console.log('AuthContext: Token validation successful', validationData);
            
            // Use new token if provided (with extended expiration)
            const tokenToUse = validationData.token || storedToken;
            setToken(tokenToUse);
            localStorage.setItem('token', tokenToUse);
            
            // Use fresh user data from validation if available, otherwise use stored data
            if (validationData.user) {
              setUser(validationData.user);
              localStorage.setItem('user', JSON.stringify(validationData.user));
            } else {
              setUser(JSON.parse(storedUser));
            }
          } else {
            // Token is invalid or expired, clear storage
            console.log('AuthContext: Token validation failed, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Network error or token validation failed
          console.warn('AuthContext: Token validation failed with error:', error);
          // Don't clear storage on network errors, just log the warning
          // The user might be offline or the server might be down temporarily
          
          // Only clear storage if it's clearly an auth error
          if (error instanceof Error && error.message.includes('401')) {
            console.log('AuthContext: Clearing storage due to 401 error');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } else {
            // For network errors, try to use stored data
            console.log('AuthContext: Using stored user data due to network error');
            try {
              setUser(JSON.parse(storedUser));
              setToken(storedToken);
            } catch (parseError) {
              console.error('AuthContext: Failed to parse stored user data:', parseError);
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          }
        }
      } else {
        console.log('AuthContext: No stored token or user found');
      }
      
      setIsLoading(false);
      console.log('AuthContext: Auth initialization complete');
    };

    initializeAuth();
  }, []);

  // Periodic token refresh to keep session alive
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Refresh user data every 30 minutes to keep session active
    const refreshInterval = setInterval(() => {
      refreshUser();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(refreshInterval);
  }, [user, token]);

  // Refresh token on user activity
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const handleUserActivity = () => {
      // Refresh user data on activity (but throttle to avoid too many requests)
      const lastRefresh = localStorage.getItem('lastTokenRefresh');
      const now = Date.now();
      
      // Only refresh if it's been more than 5 minutes since last refresh
      if (!lastRefresh || now - parseInt(lastRefresh) > 5 * 60 * 1000) {
        refreshUser();
        localStorage.setItem('lastTokenRefresh', now.toString());
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Throttle activity detection
    let activityTimeout: NodeJS.Timeout;
    const throttledActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(handleUserActivity, 1000); // Wait 1 second after activity stops
    };

    events.forEach(event => {
      document.addEventListener(event, throttledActivity, true);
    });

    return () => {
      clearTimeout(activityTimeout);
      events.forEach(event => {
        document.removeEventListener(event, throttledActivity, true);
      });
    };
  }, [user, token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    const currentToken = token || localStorage.getItem('token');
    
    if (!currentToken) {
      console.log('AuthContext: No token available for refresh');
      return;
    }

    try {
      console.log('AuthContext: Refreshing user data');
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('AuthContext: Refresh response', {
        ok: response.ok,
        status: response.status
      });

      if (response.ok) {
        const validationData = await response.json();
        console.log('AuthContext: User refresh successful');
        
        // Update token if a new one is provided
        if (validationData.token) {
          setToken(validationData.token);
          localStorage.setItem('token', validationData.token);
        }
        
        // Update user data
        if (validationData.user) {
          setUser(validationData.user);
          localStorage.setItem('user', JSON.stringify(validationData.user));
        }
      } else {
        // Token is invalid, logout only if it's a clear auth error
        if (response.status === 401) {
          console.log('AuthContext: Token invalid during refresh, logging out');
          logout();
        } else {
          console.warn('AuthContext: Refresh failed with status:', response.status);
        }
      }
    } catch (error) {
      console.warn('AuthContext: Failed to refresh user data:', error);
      // Don't logout on network errors, just log the warning
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 