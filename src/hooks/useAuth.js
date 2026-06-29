'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '@/services/userService';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfileFields: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes on mount
  useEffect(() => {
    const unsubscribe = userService.onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await userService.signIn(email, password);
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const loggedUser = await userService.signInWithGoogle();
      setUser(loggedUser);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const register = async (email, password, fullName, role) => {
    setLoading(true);
    try {
      const newUser = await userService.signUp(email, password, fullName, role);
      setUser(newUser);
      return newUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await userService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileFields = async (fields) => {
    if (!user) return;
    try {
      const updated = await userService.updateProfile(user.uid, fields);
      setUser(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (error) {
      console.error('Failed to update profile fields:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    if (!user) return;
    const current = await userService.getCurrentUser();
    setUser(current);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateProfileFields, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
