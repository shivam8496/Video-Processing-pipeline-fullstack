// src/context/AuthContext.jsx
import React, { createContext, useState, useContext } from 'react';
import authService from '../services/authServices';

// 1. Create the context
const AuthContext = createContext();

// 2. Create the provider component
export const AuthProvider = ({ children }) => {
  // 3. Get user from local storage (if it exists)
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // Login function
  const login = async (email, password) => {
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      return userData;
    } catch (error) {
      // --- START FIX ---
      // Check if it's an axios error with a response from the server
      if (error.response && error.response.data) {
        console.error('Login error (from server):', error.response.data);
        throw error.response.data; // Throw the server's error message (e.g., "Invalid credentials")
      } else {
        // Handle network errors, CORS, or other issues
        console.error('Login error (network/CORS):', error.message);
        throw new Error('Login failed. Server may be down or unreachable.');
      }
      // --- END FIX ---
    }
  };

  // Register function
  const register = async (name, email, password, role) => {
    try {
      const userData = await authService.register({ name, email, password, role });
      setUser(userData);
      return userData;
    } catch (error) {
      // --- START FIX ---
      if (error.response && error.response.data) {
        console.error('Register error (from server):', error.response.data);
        throw error.response.data;
      } else {
        // Handle network errors, CORS, or other issues
        console.error('Register error (network/CORS):', error.message);
        throw new Error('Registration failed. Server may be down or unreachable.');
      }
      // --- END FIX ---
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // 4. Value to be passed to consumers
  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user, // True if user is not null
    userRole: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Custom hook to easily use the context
export const useAuth = () => {
  return useContext(AuthContext);
};