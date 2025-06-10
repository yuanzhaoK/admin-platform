import PocketBase from 'pocketbase';

// PocketBase client instance with configuration - use Next.js API proxy
export const pb = new PocketBase('/api/pb');

// Export a function to get PocketBase instance
export function getPocketBase(): PocketBase {
  return pb;
}

// Configure auto cancellation
pb.autoCancellation(false);

// Enable debug logging for auth store
if (typeof window !== 'undefined') {
  pb.authStore.onChange((token, model) => {
    console.log('PocketBase authStore changed:', { 
      hasToken: !!token, 
      hasModel: !!model, 
      isValid: pb.authStore.isValid 
    });
  });
  
  // Debug: 暂时禁用全局fetch拦截，可能会干扰PocketBase客户端
  // const originalFetch = globalThis.fetch;
  // globalThis.fetch = function(...args) {
  //   console.log('🌐 Fetch request:', args[0]);
  //   return originalFetch.apply(this, args);
  // };
}

// Types for our collections
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'admin' | 'user';
  created: string;
  updated: string;
  // PocketBase admin fields
  collectionId?: string;
  collectionName?: string;
  emailVisibility?: boolean;
  verified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  config?: Record<string, any>;
  sku?: string;
  stock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images?: string[];
  meta_data?: Record<string, any>;
  created: string;
  updated: string;
}

export interface ProductQuery {
  page?: number;
  perPage?: number;
  status?: 'active' | 'inactive' | 'draft';
  category?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  categories: Record<string, number>;
  avgPrice?: number;
  totalStock?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created: string;
}

// Auth helpers
export const authHelpers = {
  // Login user
  async login(email: string, password: string) {
    try {
      console.log('PocketBase: 尝试认证:', email);
      
      // 首先直接测试API调用
      console.log('🧪 直接测试 API 调用...');
      const directResponse = await fetch('/api/pb/api/collections/_superusers/auth-with-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identity: email, password })
      });
      
      console.log('🧪 直接API响应状态:', directResponse.status);
      const directData = await directResponse.text();
      console.log('🧪 直接API响应内容:', directData);
      
      // 然后使用PocketBase客户端
      const authData = await pb.admins.authWithPassword(email, password);
      console.log('PocketBase: 认证响应:', {
        hasRecord: !!authData.record,
        hasToken: !!authData.token,
        tokenValue: authData.token,
        tokenLength: authData.token?.length || 0,
        authStoreValid: pb.authStore.isValid,
        authStoreToken: !!pb.authStore.token,
        authStoreModel: !!pb.authStore.model
      });
      
      // 检查是否有完整的认证数据
      console.log('PocketBase: 检查认证数据 - token:', authData.token, 'record:', !!authData.record);
      if (authData.record) {
        // 手动确保authStore正确设置
        console.log('PocketBase: 准备保存到authStore - token存在:', !!authData.token, 'token长度:', authData.token?.length);
        
        // 尝试保存认证数据
        if (authData.token) {
          pb.authStore.save(authData.token, authData.record);
        } else {
          // 如果没有token，至少保存用户记录
          pb.authStore.save('', authData.record);
        }
        
        console.log('PocketBase: 手动设置authStore后:', {
          isValid: pb.authStore.isValid,
          hasToken: !!pb.authStore.token,
          hasModel: !!pb.authStore.model,
          tokenLength: pb.authStore.token?.length || 0
        });
        
        // 将管理员记录转换为User格式
        const user: User = {
          id: authData.record.id,
          email: authData.record.email || '',
          name: authData.record.name || (authData.record.email ? authData.record.email.split('@')[0] : 'admin'), // 安全的从邮箱提取名称
          role: 'admin',
          created: authData.record.created,
          updated: authData.record.updated,
          collectionId: authData.record.collectionId,
          collectionName: authData.record.collectionName,
          emailVisibility: authData.record.emailVisibility,
          verified: authData.record.verified,
        };
        
        console.log('PocketBase: 转换后的用户对象:', user);
        
        // 即使token无效，只要有用户记录就认为登录成功
        return {
          success: true,
          user: user,
          token: authData.token || ''
        };
      } else {
        console.warn('PocketBase: 登录响应数据不完整 - 没有用户记录');
        return {
          success: false,
          error: '登录响应数据不完整'
        };
      }
    } catch (error: unknown) {
      console.error('PocketBase: 认证失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  },

  // Logout user
  logout() {
    pb.authStore.clear();
  },

  // Get current user
  getCurrentUser(): User | null {
    const record = pb.authStore.model;
    if (!record) return null;
    
    // 安全地转换PocketBase管理员记录为User格式
    return {
      id: record.id || '',
      email: record.email || '',
      name: record.name || (record.email ? record.email.split('@')[0] : 'admin'),
      role: 'admin',
      created: record.created || '',
      updated: record.updated || '',
      collectionId: record.collectionId,
      collectionName: record.collectionName,
      emailVisibility: record.emailVisibility,
      verified: record.verified,
    } as User;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return pb.authStore.isValid;
  },

  // Refresh authentication
  async refresh() {
    try {
      if (pb.authStore.isValid) {
        await pb.admins.authRefresh(); // 使用管理员刷新而不是用户刷新
        return true;
      }
      return false;
    } catch (error) {
      console.error('Auth refresh failed:', error);
      return false;
    }
  }
};

// 构建查询参数
function buildQueryParams(query: ProductQuery): string {
  const params = new URLSearchParams();
  
  if (query.page) params.set('page', query.page.toString());
  if (query.perPage) params.set('perPage', query.perPage.toString());
  if (query.status) params.set('status', query.status);
  if (query.category) params.set('category', query.category);
  if (query.search) params.set('search', query.search);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortOrder) params.set('sortOrder', query.sortOrder);
  
  return params.toString();
}

// API helpers
export const apiHelpers = {
  // 产品管理 - 使用新的API端点
  async getProducts(query: ProductQuery = {}): Promise<ApiResponse<Product[]>> {
    try {
      const queryString = buildQueryParams(query);
      const url = `/api/products${queryString ? `?${queryString}` : ''}`;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // 添加认证头 - 优先使用localStorage中的token
      let token = pb.authStore.token;
      if (!token) {
        try {
          const storedAuth = localStorage.getItem('pocketbase_auth');
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            token = authData.token;
          }
        } catch (error) {
          console.warn('Failed to read token from localStorage:', error);
        }
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });
      
      return await response.json();
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : '获取产品列表失败' };
    }
  },

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message || '获取产品详情失败' };
    }
  },

  async createProduct(data: Omit<Product, 'id' | 'created' | 'updated'>): Promise<ApiResponse<Product>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // 添加认证头 - 优先使用localStorage中的token
      let token = pb.authStore.token;
      if (!token) {
        try {
          const storedAuth = localStorage.getItem('pocketbase_auth');
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            token = authData.token;
          }
        } catch (error) {
          console.warn('Failed to read token from localStorage:', error);
        }
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message || '创建产品失败' };
    }
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // 添加认证头 - 优先使用localStorage中的token
      let token = pb.authStore.token;
      if (!token) {
        try {
          const storedAuth = localStorage.getItem('pocketbase_auth');
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            token = authData.token;
          }
        } catch (error) {
          console.warn('Failed to read token from localStorage:', error);
        }
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });
      
      return await response.json();
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : '更新产品失败' };
    }
  },

  async deleteProduct(id: string): Promise<ApiResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // 添加认证头 - 优先使用localStorage中的token
      let token = pb.authStore.token;
      if (!token) {
        try {
          const storedAuth = localStorage.getItem('pocketbase_auth');
          if (storedAuth) {
            const authData = JSON.parse(storedAuth);
            token = authData.token;
          }
        } catch (error) {
          console.warn('Failed to read token from localStorage:', error);
        }
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers,
      });
      
      return await response.json();
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : '删除产品失败' };
    }
  },

  async getProductStats(): Promise<ApiResponse<ProductStats>> {
    try {
      const response = await fetch('/api/products/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message || '获取产品统计失败' };
    }
  },

  async exportProducts(format: 'json' | 'csv' = 'json'): Promise<Blob | null> {
    try {
      const response = await fetch(`/api/products/export?format=${format}`, {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('导出失败');
      }
      
      return await response.blob();
    } catch (error: any) {
      console.error('导出产品失败:', error);
      return null;
    }
  },

  async batchUpdateProductStatus(productIds: string[], status: Product['status']): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/products/batch/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds, status }),
      });
      
      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message || '批量更新状态失败' };
    }
  },

  async batchDeleteProducts(productIds: string[]): Promise<ApiResponse> {
    try {
      const response = await fetch('/api/products/batch', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productIds }),
      });
      
      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message || '批量删除失败' };
    }
  },

  // Users management
  async getUsers() {
    try {
      const records = await pb.collection('users').getFullList<User>();
      return { success: true, data: records };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async updateUser(id: string, data: Partial<User>) {
    try {
      const record = await pb.collection('users').update<User>(id, data);
      return { success: true, data: record };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
};

export default pb; 