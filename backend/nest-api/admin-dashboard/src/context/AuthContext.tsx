import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { AuthResponse } from '../types/types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
  login: (email: string | null, phoneNumber: string | null, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Kiểm tra nếu có thông tin người dùng và token trong localStorage
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string | null, phoneNumber: string | null, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const loginData: any = { password };
      if (email) loginData.email = email;
      if (phoneNumber) loginData.phoneNumber = phoneNumber;

      const response = await authAPI.login(loginData);
      const authData = response.data as AuthResponse;

      // Lưu token và thông tin người dùng vào localStorage
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));

      setIsAuthenticated(true);
      setUser(authData.user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Đăng nhập thất bại');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      // Gọi API logout
      await authAPI.logout();
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      // Xóa thông tin xác thực khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  return context;
};