'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { graphqlAuthHelpers } from '@/lib/graphql/auth';
import { User } from '@/lib/pocketbase';

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
        
        // 检查 GraphQL token 是否存在
        const hasToken = graphqlAuthHelpers.isAuthenticated();
        console.log('AuthContext: GraphQL token 存在:', hasToken);
        
        // 检查 localStorage 中是否有用户信息
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
        
        // 如果有 token 和用户信息，认为已认证
        if (hasToken && currentUser) {
          console.log('AuthContext: 找到有效的认证信息，设置为已认证');
          setUser(currentUser);
        } else {
          console.log('AuthContext: 没有找到有效的认证信息');
          // 清理可能不一致的数据
          localStorage.removeItem('admin-platform-user');
          localStorage.removeItem('graphql-auth-token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        // 清理认证数据
        localStorage.removeItem('admin-platform-user');
        localStorage.removeItem('graphql-auth-token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('AuthContext: 尝试 GraphQL 登录:', email);
      const result = await graphqlAuthHelpers.login(email, password);
      console.log('AuthContext: GraphQL 登录结果:', result);
      
      if (result.success && result.user) {
        setUser(result.user);
        console.log('AuthContext: 登录成功，用户设置:', result.user);
        
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
        console.log('AuthContext: 登录失败:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error: unknown) {
      console.error('AuthContext: 登录错误:', error);
      return { success: false, error: error instanceof Error ? error.message : '登录失败' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: 尝试登出');
      await graphqlAuthHelpers.logout();
    } catch (error) {
      console.warn('AuthContext: GraphQL 登出失败:', error);
    }
    
    setUser(null);
    
    // 清除 localStorage 中的用户信息
    try {
      localStorage.removeItem('admin-platform-user');
      localStorage.removeItem('graphql-auth-token');
      console.log('AuthContext: 已清除 localStorage 中的认证信息');
    } catch (error) {
      console.warn('AuthContext: 清除 localStorage 失败:', error);
    }
  };

  // 认证状态计算 - 基于用户状态和 GraphQL token
  const isAuthenticated = !!user && graphqlAuthHelpers.isAuthenticated();
  console.log('AuthContext: 计算认证状态 - user =', !!user, 'hasToken =', graphqlAuthHelpers.isAuthenticated(), 'final =', isAuthenticated);

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