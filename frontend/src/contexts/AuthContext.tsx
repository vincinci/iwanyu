import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'SELLER';
  createdAt?: string;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const timeoutId = setTimeout(() => {
          console.log('AuthContext: Auth initialization timeout, proceeding without validation');
          setIsLoading(false);
        }, 5000);

        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedApiUrl = localStorage.getItem('lastApiUrl');
        
        console.log('AuthContext: Initializing auth', {
          hasStoredToken: !!storedToken,
          hasStoredUser: !!storedUser,
          currentApiUrl: API_BASE_URL,
          storedApiUrl: storedApiUrl
        });
        
        // Clear auth data if API URL has changed (switching between dev/prod)
        if (storedApiUrl && storedApiUrl !== API_BASE_URL) {
          console.log('AuthContext: API URL changed, clearing stored auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.setItem('lastApiUrl', API_BASE_URL);
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        }
        
        // Store current API URL for future comparisons
        localStorage.setItem('lastApiUrl', API_BASE_URL);
        
        if (storedToken && storedUser) {
          try {
            // Simplified validation - just trust stored data for faster mobile loading
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            
            if (isMobile) {
              // On mobile, just use stored data without validation for speed
              console.log('AuthContext: Mobile detected - using stored auth data');
              setUser(JSON.parse(storedUser));
              setToken(storedToken);
              clearTimeout(timeoutId);
              setIsLoading(false);
              return;
            }
            
            // Desktop validation with shorter timeout
            console.log('AuthContext: Validating stored token');
            const controller = new AbortController();
            const validationTimeout = setTimeout(() => controller.abort(), 3000);
            
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
              signal: controller.signal
            });

            clearTimeout(validationTimeout);
            console.log('AuthContext: Token validation response', {
              ok: response.ok,
              status: response.status
            });

            if (response.ok) {
              const validationData = await response.json();
              console.log('AuthContext: Token validation successful', validationData);
              
              const tokenToUse = validationData.token || storedToken;
              setToken(tokenToUse);
              localStorage.setItem('token', tokenToUse);
              
              if (validationData.user) {
                setUser(validationData.user);
                localStorage.setItem('user', JSON.stringify(validationData.user));
              } else {
                setUser(JSON.parse(storedUser));
              }
            } else {
              console.log('AuthContext: Token validation failed, clearing storage');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
          } catch (error) {
            console.warn('AuthContext: Token validation failed, clearing invalid token:', error);
            // On validation error, clear the token instead of using stored data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          }
        } else {
          console.log('AuthContext: No stored auth data found');
        }
        
        clearTimeout(timeoutId);
        setIsLoading(false);
        console.log('AuthContext: Auth initialization complete');
      } catch (error) {
        console.error('AuthContext: Critical auth initialization error:', 'Error occurred');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

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
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Login error:', 'Error occurred');
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
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Registration error:', 'Error occurred');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('lastTokenRefresh');
  };

  const refreshUser = async () => {
    if (!token) return;

    try {
      // Shorter timeout for mobile
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (data.token) {
          setToken(data.token);
          localStorage.setItem('token', data.token);
        }
      }
    } catch (error) {
      console.warn('Failed to refresh user data:', error);
      // Don't logout on refresh failure - might be temporary network issue
    }
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    refreshUser,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};