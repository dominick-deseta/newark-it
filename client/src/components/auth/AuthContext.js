import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Configure axios to include the token
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          const response = await axios.get('http://localhost:3001/api/auth/validate');
          setUser(response.data.user);
          setIsAuthenticated(true);

          // For demonstration, we'll just use the stored user info
          // const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
          // if (storedUser) {
          //   setUser(storedUser);
          //   setIsAuthenticated(true);
          // }
        } catch (error) {
          // If token validation fails, clear localStorage
          console.error('Auth validation error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
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
      
      // For demonstration
      // const mockResponse = {
      //   data: {
      //     token: 'mock_jwt_token_would_be_here_in_real_app',
      //     customer: {
      //       id: 1,
      //       firstName: 'John',
      //       lastName: 'Doe',
      //       email: email,
      //       status: 'gold'
      //     }
      //   }
      // };
      
      // Store the token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.customer));
      
      // Update state
      setUser(response.data.customer);
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
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:3001/api/customers', userData);
      
      // For demonstration
      // const mockResponse = {
      //   data: {
      //     message: 'Registration successful',
      //     token: 'mock_jwt_token_for_new_user',
      //     customer: {
      //       id: 2,
      //       firstName: userData.firstName,
      //       lastName: userData.lastName,
      //       email: userData.email,
      //       status: 'regular'
      //     }
      //   }
      // };
      
      // Store the token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.customer));
      
      // Update state
      setUser(response.data.customer);
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