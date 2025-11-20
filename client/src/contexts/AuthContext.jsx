import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Only remove token if it's an authentication error
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
      }
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      setUser(data.user);
      toast.success('Login successful! Welcome back!');
      
      return { success: true, user: data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      setUser(data.user);
      toast.success('Registration successful! Welcome to Rupandehi Samadhan!');
      
      return { success: true, user: data.user };
    } catch (error) {
      let message = 'Registration failed. Please try again.';
      
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const firstError = error.response.data.errors[0];
        message = firstError.msg || message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (googleData) => {
    try {
      setLoading(true);
      const response = await authAPI.googleAuth(googleData);
      const { token, data } = response.data;
      
      localStorage.setItem('token', token);
      setUser(data.user);
      toast.success('Google login successful!');
      
      return { success: true, user: data.user };
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed. Please try again.';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.data.user);
      return { success: true, user: response.data.data.user };
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    authChecked,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDepartment: user?.role === 'department',
    isVerified: user?.verificationStatus === 'verified',
    isPendingVerification: user?.verificationStatus === 'pending'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};