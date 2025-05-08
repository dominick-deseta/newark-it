import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Apply token to axios headers whenever it changes
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Configure axios to include the token
          setAuthToken(token);

          const response = await axios.get('http://localhost:3001/api/auth/validate');
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          // If token validation fails, clear localStorage and auth state
          console.error('Auth validation error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Ensure auth state is reset if no token exists
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);
  
  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/api/customers/login', {
        email,
        password
      });
      
      const { token, customer } = response.data;
      
      // Store the token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(customer));
      
      // Set auth token in axios headers
      setAuthToken(token);
      
      // Update state
      setUser(customer);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.'
      };
    }
  };
  
  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Remove auth token from axios headers
    setAuthToken(null);
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:3001/api/customers', userData);
      
      const { token, customer } = response.data;
      
      // Store the token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(customer));
      
      // Set auth token in axios headers
      setAuthToken(token);
      
      // Update state
      setUser(customer);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    }
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        login, 
        logout, 
        register 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;