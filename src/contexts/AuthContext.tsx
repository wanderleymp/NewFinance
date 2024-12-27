import React, { createContext, useCallback, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthService } from '../services/AuthService';
import { messages } from '../constants/messages';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  checkAuth: async () => {},
  login: async () => {},
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      AuthService.logout();
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (AuthService.isAuthenticated()) {
      await loadUserData();
    } else {
      setUser(null);
      setIsAuthenticated(false);
      AuthService.logout();
    }
  }, [loadUserData]);

  const login = async (identifier: string, password: string) => {
    try {
      await AuthService.login({ identifier, password });
      await loadUserData();
      if (user) {
        toast.success(messages.auth.welcome(user.username));
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(messages.auth.invalidCredentials);
      throw error;
    }
  };

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
    toast.success(messages.auth.logoutSuccess);
  }, [navigate]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, checkAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};