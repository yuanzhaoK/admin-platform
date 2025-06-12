import { apolloClient } from './client';
import { LOGIN_MUTATION, LOGOUT_MUTATION } from './queries';
import type { User } from '../pocketbase';

interface LoginInput {
  identity: string;
  password: string;
}

interface LoginResponse {
  login: {
    token: string;
    record: User;
  };
}

interface LogoutResponse {
  logout: boolean;
}

export const graphqlAuthHelpers = {
  async login(email: string, password: string) {
    try {
      console.log('GraphQL: 尝试登录:', email);
      
      const { data } = await apolloClient.mutate<LoginResponse>({
        mutation: LOGIN_MUTATION,
        variables: {
          input: { identity: email, password } as LoginInput
        }
      });

      if (data?.login) {
        console.log('GraphQL: 登录成功:', data.login.record.email);
        
        // 保存 token 到 localStorage
        if (data.login.token) {
          localStorage.setItem('graphql-auth-token', data.login.token);
        }
        
        return {
          success: true,
          user: data.login.record,
          token: data.login.token
        };
      } else {
        console.error('GraphQL: 登录响应数据不完整');
        return {
          success: false,
          error: '登录响应数据不完整'
        };
      }
    } catch (error: unknown) {
      console.error('GraphQL: 登录失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '登录失败'
      };
    }
  },

  async logout() {
    try {
      console.log('GraphQL: 尝试登出');
      
      const { data } = await apolloClient.mutate<LogoutResponse>({
        mutation: LOGOUT_MUTATION
      });

      // 清除本地存储的 token
      localStorage.removeItem('graphql-auth-token');
      
      // 重置 Apollo Client 缓存
      await apolloClient.resetStore();
      
      console.log('GraphQL: 登出成功');
      return data?.logout || true;
    } catch (error: unknown) {
      console.error('GraphQL: 登出失败:', error);
      // 即使服务器端登出失败，也清除本地数据
      localStorage.removeItem('graphql-auth-token');
      await apolloClient.resetStore();
      return false;
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('graphql-auth-token');
    }
    return null;
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}; 