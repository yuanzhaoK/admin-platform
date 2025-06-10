'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authHelpers, User, pb } from '@/lib/pocketbase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuth = async () => {
      try {
        console.log('AuthContext: 检查认证状态');
        console.log('AuthContext: PocketBase authStore isValid =', authHelpers.isAuthenticated());
        console.log('AuthContext: PocketBase authStore model =', authHelpers.getCurrentUser());
        
        // 首先检查 localStorage 中是否有用户信息
        let currentUser = null;
        try {
          const storedUser = localStorage.getItem('admin-platform-user');
          if (storedUser) {
            currentUser = JSON.parse(storedUser);
            console.log('AuthContext: 从 localStorage 恢复用户:', currentUser);
          }
        } catch (error) {
          console.warn('AuthContext: 读取 localStorage 失败:', error);
        }
        
        // 如果 localStorage 没有，再尝试从 PocketBase authStore 获取
        if (!currentUser) {
          currentUser = authHelpers.getCurrentUser();
          console.log('AuthContext: 从 PocketBase authStore 获取用户:', currentUser);
        }
        
        if (currentUser) {
          console.log('AuthContext: 找到用户记录，设置为已认证');
          setUser(currentUser);
          
          // 尝试重建 PocketBase authStore（如果它被清空了）
          if (!authHelpers.isAuthenticated() && currentUser.id) {
            console.log('AuthContext: PocketBase authStore 无效，尝试重建...');
            try {
                             // 使用保存的用户信息重建 authStore，即使没有有效的token
               if (pb && pb.authStore) {
                 pb.authStore.save('', currentUser);
                 console.log('AuthContext: 已重建 PocketBase authStore');
               }
            } catch (error) {
              console.warn('AuthContext: 重建 PocketBase authStore 失败:', error);
            }
          }
          
          // 如果 authStore 有效，尝试刷新token
          if (authHelpers.isAuthenticated()) {
            try {
              const refreshResult = await authHelpers.refresh();
              console.log('AuthContext: Token refresh result:', refreshResult);
            } catch (error) {
              console.warn('AuthContext: Token refresh failed, but keeping user authenticated:', error);
            }
          }
        } else {
          console.log('AuthContext: 没有找到用户记录');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        authHelpers.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', email);
      const result = await authHelpers.login(email, password);
      console.log('Login result:', result);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log('Login successful, user set:', result.user);
        console.log('AuthContext: 登录后PocketBase状态:', authHelpers.isAuthenticated());
        
        // 将用户信息保存到 localStorage
        try {
          localStorage.setItem('admin-platform-user', JSON.stringify(result.user));
          console.log('AuthContext: 用户信息已保存到 localStorage');
        } catch (error) {
          console.warn('AuthContext: 保存用户信息到 localStorage 失败:', error);
        }
        
        // 确保状态已更新，等待一个微任务周期
        await new Promise(resolve => setTimeout(resolve, 0));
        
        return { success: true };
      } else {
        console.log('Login failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authHelpers.logout();
    setUser(null);
    
    // 清除 localStorage 中的用户信息
    try {
      localStorage.removeItem('admin-platform-user');
      console.log('AuthContext: 已清除 localStorage 中的用户信息');
    } catch (error) {
      console.warn('AuthContext: 清除 localStorage 失败:', error);
    }
  };

  // 认证状态计算 - 主要基于user状态，允许PocketBase状态无效的情况
  const isAuthenticated = !!user;
  console.log('AuthContext: 计算认证状态 - user =', !!user, 'authHelpers.isAuthenticated =', authHelpers.isAuthenticated(), 'final =', isAuthenticated);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 