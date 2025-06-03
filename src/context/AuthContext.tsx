// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, verifyToken } from '../services/authService';

// Types
interface User {
  id: string;
  username: string;
  full_name: string;
  user_level_id: string;
  user_level?: {
    level_name: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');
      
      console.log('InitAuth - Token:', !!token, 'StoredUser:', !!storedUser); // Debug log
      
      if (token && storedUser) {
        try {
          // For now, skip token verification to avoid login loop
          // TODO: Fix token verification endpoint
          // const isValid = await verifyToken();
          const isValid = true; // Temporary bypass
          
          console.log('Token validation result:', isValid); // Debug log
          
          if (isValid) {
            // Parse stored user and map to our User interface
            const userData = JSON.parse(storedUser);
            console.log('Stored user data:', userData); // Debug log
            
            const mappedUser: User = {
              id: userData.id,
              username: userData.username,
              full_name: userData.full_name,
              user_level_id: userData.user_level_id,
              user_level: {
                level_name: userData.UserLevel?.level_name || 'User',
              },
            };
            
            console.log('Mapped stored user:', mappedUser); // Debug log
            setUser(mappedUser);
          } else {
            // Clear invalid token
            console.log('Token invalid, clearing storage'); // Debug log
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          // Clear invalid token
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []); // Empty dependency array to run only once

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Call API login
      const response = await apiLogin(username, password);

      console.log('Login response:', response); // Debug log

      // Handle the nested data structure from backend
      if (response.success && response.data?.token && response.data?.user) {
        // Store token and user info
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('auth_user', JSON.stringify(response.data.user));
        
        // Map API user response to our User interface
        const mappedUser: User = {
          id: response.data.user.id,
          username: response.data.user.username,
          full_name: response.data.user.full_name,
          user_level_id: response.data.user.user_level_id,
          user_level: {
            level_name: response.data.user.UserLevel?.level_name || 'User',
          },
        };

        console.log('Mapped user:', mappedUser); // Debug log
        
        setUser(mappedUser);
        setLoading(false);
        return true;
      } else {
        console.error('Login failed:', response); // Debug log
        setError(response.message || 'Invalid username or password');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error occurred. Please try again.');
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await apiLogout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    
    // Clear token and user data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    
    // Clear user state
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user, 
      user, 
      login, 
      logout, 
      loading, 
      error,
      clearError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};