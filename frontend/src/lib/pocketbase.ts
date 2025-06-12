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

// Order related types
export interface Order {
  id: string;
  collectionId: string;
  collectionName: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  payment_method: string;
  order_source: string;
  order_type: string;
  status: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  logistics_info?: LogisticsInfo;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  // Expanded relations
  expand?: {
    user_id?: User;
  };
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image?: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postal_code?: string;
}

export interface LogisticsInfo {
  company?: string;
  tracking_number?: string;
  status?: string;
  updates?: LogisticsUpdate[];
}

export interface LogisticsUpdate {
  time: string;
  status: string;
  description: string;
  location?: string;
}

export interface OrderSetting {
  id: string;
  setting_key: string;
  setting_name: string;
  setting_value: string;
  setting_type: 'number' | 'boolean' | 'text' | 'json';
  description?: string;
  category: 'payment' | 'shipping' | 'timeout' | 'auto_operations' | 'notifications';
  created: string;
  updated: string;
}

export interface RefundRequest {
  id: string;
  service_number: string;
  order_id: string;
  user_id: string;
  refund_type: 'refund_only' | 'return_and_refund' | 'exchange';
  refund_amount: number;
  reason: 'quality_issue' | 'wrong_item' | 'damaged_in_transit' | 'not_as_described' | 'size_issue' | 'change_of_mind' | 'other';
  description: string;
  evidence_images?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  admin_notes?: string;
  processed_at?: string;
  processed_by?: string;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    order_id?: Order;
    user_id?: User;
    processed_by?: User;
  };
}

export interface OrderQuery {
  page?: number;
  perPage?: number;
  status?: Order['status'];
  payment_method?: Order['payment_method'];
  order_source?: Order['order_source'];
  order_type?: Order['order_type'];
  user_id?: string;
  search?: string; // Search by order_number or user info
  date_from?: string;
  date_to?: string;
  sortBy?: 'id' | 'total_amount' | 'order_number';
  sortOrder?: 'asc' | 'desc';
}

export interface RefundQuery {
  page?: number;
  perPage?: number;
  status?: RefundRequest['status'];
  refund_type?: RefundRequest['refund_type'];
  reason?: RefundRequest['reason'];
  user_id?: string;
  order_id?: string;
  search?: string; // Search by service_number or order_number
  date_from?: string;
  date_to?: string;
  sortBy?: 'created' | 'updated' | 'refund_amount' | 'processed_at';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderStats {
  total: number;
  pending_payment: number;
  paid: number;
  processing: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
  refunding: number;
  refunded: number;
  total_amount: number;
  avg_amount: number;
  payment_methods: Record<string, number>;
  order_sources: Record<string, number>;
  order_types: Record<string, number>;
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
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Update user failed' };
    }
  }
};

// Order management helpers
export const orderHelpers = {
  // Build query string for orders
  buildOrderQuery(query: OrderQuery): { filter: string; sort: string } {
    const filters: string[] = [];
    
    if (query.status) filters.push(`status="${query.status}"`);
    if (query.payment_method) filters.push(`payment_method="${query.payment_method}"`);
    if (query.order_source) filters.push(`order_source="${query.order_source}"`);
    if (query.order_type) filters.push(`order_type="${query.order_type}"`);
    if (query.user_id) filters.push(`user_id="${query.user_id}"`);
    if (query.search) {
      filters.push(`(order_number~"${query.search}" || user_id.email~"${query.search}" || user_id.name~"${query.search}")`);
    }
    if (query.date_from) filters.push(`created>="${query.date_from}"`);
    if (query.date_to) filters.push(`created<="${query.date_to}"`);
    
    const filter = filters.length > 0 ? filters.join(' && ') : '';
    
    // 修复排序字段 - 使用id而不是created，因为orders collection没有created字段
    let sort = '-id'; // 默认按id降序排列
    if (query.sortBy) {
      sort = query.sortOrder === 'desc' ? `-${query.sortBy}` : query.sortBy;
    }
    
    return { filter, sort };
  },

  // Get orders list
  async getOrders(query: OrderQuery = {}): Promise<ApiResponse<Order[]>> {
    try {
      const { filter, sort } = this.buildOrderQuery(query);
      const options: any = {
        sort,
        expand: 'user_id'
      };
      
      // Only add filter if it's not empty
      if (filter) {
        options.filter = filter;
      }
      
      const result = await pb.collection('orders').getList<Order>(
        query.page || 1,
        query.perPage || 20,
        options
      );
      
      return {
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          perPage: result.perPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems
        }
      };
    } catch (error: unknown) {
      console.error('Failed to fetch orders:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      };
    }
  },

  // Get single order
  async getOrder(id: string): Promise<ApiResponse<Order>> {
    try {
      const record = await pb.collection('orders').getOne<Order>(id, {
        expand: 'user_id'
      });
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch order' 
      };
    }
  },

  // Create order
  async createOrder(data: Omit<Order, 'id' | 'created' | 'updated' | 'order_number'>): Promise<ApiResponse<Order>> {
    try {
      const record = await pb.collection('orders').create<Order>(data);
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      };
    }
  },

  // Update order
  async updateOrder(id: string, data: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const record = await pb.collection('orders').update<Order>(id, data);
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order' 
      };
    }
  },

  // Delete order
  async deleteOrder(id: string): Promise<ApiResponse> {
    try {
      await pb.collection('orders').delete(id);
      return { success: true };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete order' 
      };
    }
  },

  // Update order status
  async updateOrderStatus(id: string, status: Order['status'], notes?: string): Promise<ApiResponse<Order>> {
    try {
      const updateData: Partial<Order> = { status };
      if (notes) updateData.notes = notes;
      
      // Set timestamps based on status
      if (status === 'shipped') {
        updateData.shipped_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }
      
      const record = await pb.collection('orders').update<Order>(id, updateData);
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order status' 
      };
    }
  },

  // Update logistics info
  async updateLogistics(id: string, logistics: LogisticsInfo): Promise<ApiResponse<Order>> {
    try {
      const record = await pb.collection('orders').update<Order>(id, {
        logistics_info: logistics
      });
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update logistics' 
      };
    }
  },

  // Get order statistics
  async getOrderStats(): Promise<ApiResponse<OrderStats>> {
    try {
      const orders = await pb.collection('orders').getFullList<Order>();
      
      const stats: OrderStats = {
        total: orders.length,
        pending_payment: 0,
        paid: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        completed: 0,
        cancelled: 0,
        refunding: 0,
        refunded: 0,
        total_amount: 0,
        avg_amount: 0,
        payment_methods: {},
        order_sources: {},
        order_types: {}
      };

      orders.forEach(order => {
        // Count by status
        stats[order.status as keyof OrderStats] = (stats[order.status as keyof OrderStats] as number) + 1;
        
        // Sum total amount
        stats.total_amount += order.total_amount;
        
        // Count payment methods
        stats.payment_methods[order.payment_method] = (stats.payment_methods[order.payment_method] || 0) + 1;
        
        // Count order sources
        stats.order_sources[order.order_source] = (stats.order_sources[order.order_source] || 0) + 1;
        
        // Count order types
        stats.order_types[order.order_type] = (stats.order_types[order.order_type] || 0) + 1;
      });

      stats.avg_amount = stats.total > 0 ? stats.total_amount / stats.total : 0;

      return { success: true, data: stats };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch order statistics' 
      };
    }
  }
};

// Order settings helpers
export const orderSettingsHelpers = {
  // Get all settings
  async getSettings(): Promise<ApiResponse<OrderSetting[]>> {
    try {
      const records = await pb.collection('order_settings').getFullList<OrderSetting>({
        sort: 'category,setting_key'
      });
      return { success: true, data: records };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch settings' 
      };
    }
  },

  // Get setting by key
  async getSetting(key: string): Promise<ApiResponse<OrderSetting>> {
    try {
      const record = await pb.collection('order_settings').getFirstListItem<OrderSetting>(`setting_key="${key}"`);
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch setting' 
      };
    }
  },

  // Update setting
  async updateSetting(id: string, value: string): Promise<ApiResponse<OrderSetting>> {
    try {
      const record = await pb.collection('order_settings').update<OrderSetting>(id, {
        setting_value: value
      });
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update setting' 
      };
    }
  }
};

// Refund request helpers
export const refundHelpers = {
  // Build query string for refunds
  buildRefundQuery(query: RefundQuery): string {
    const params = new URLSearchParams();
    
    if (query.page) params.append('page', query.page.toString());
    if (query.perPage) params.append('perPage', query.perPage.toString());
    if (query.status) params.append('filter', `status="${query.status}"`);
    if (query.refund_type) params.append('filter', `refund_type="${query.refund_type}"`);
    if (query.reason) params.append('filter', `reason="${query.reason}"`);
    if (query.user_id) params.append('filter', `user_id="${query.user_id}"`);
    if (query.order_id) params.append('filter', `order_id="${query.order_id}"`);
    if (query.search) {
      params.append('filter', `service_number~"${query.search}" || order_id.order_number~"${query.search}"`);
    }
    if (query.date_from) params.append('filter', `created>="${query.date_from}"`);
    if (query.date_to) params.append('filter', `created<="${query.date_to}"`);
    if (query.sortBy) {
      const sort = query.sortOrder === 'desc' ? `-${query.sortBy}` : query.sortBy;
      params.append('sort', sort);
    }
    
    // Always expand relations
    params.append('expand', 'order_id,user_id,processed_by');
    
    return params.toString();
  },

  // Get refund requests list
  async getRefunds(query: RefundQuery = {}): Promise<ApiResponse<RefundRequest[]>> {
    try {
      const queryString = this.buildRefundQuery(query);
      const result = await pb.collection('refund_requests').getList<RefundRequest>(
        query.page || 1,
        query.perPage || 20,
        {
          filter: queryString.includes('filter=') ? new URLSearchParams(queryString).get('filter') || '' : '',
          sort: queryString.includes('sort=') ? new URLSearchParams(queryString).get('sort') || '' : '-created',
          expand: 'order_id,user_id,processed_by'
        }
      );
      
      return {
        success: true,
        data: result.items,
        pagination: {
          page: result.page,
          perPage: result.perPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems
        }
      };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch refunds' 
      };
    }
  },

  // Get single refund request
  async getRefund(id: string): Promise<ApiResponse<RefundRequest>> {
    try {
      const record = await pb.collection('refund_requests').getOne<RefundRequest>(id, {
        expand: 'order_id,user_id,processed_by'
      });
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch refund' 
      };
    }
  },

  // Create refund request
  async createRefund(data: Omit<RefundRequest, 'id' | 'created' | 'updated' | 'service_number'>): Promise<ApiResponse<RefundRequest>> {
    try {
      const record = await pb.collection('refund_requests').create<RefundRequest>(data);
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create refund request' 
      };
    }
  },

  // Update refund request
  async updateRefund(id: string, data: Partial<RefundRequest>): Promise<ApiResponse<RefundRequest>> {
    try {
      const record = await pb.collection('refund_requests').update<RefundRequest>(id, data);
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update refund request' 
      };
    }
  },

  // Process refund request
  async processRefund(id: string, status: RefundRequest['status'], adminNotes?: string, processedBy?: string): Promise<ApiResponse<RefundRequest>> {
    try {
      const updateData: Partial<RefundRequest> = { 
        status,
        processed_at: new Date().toISOString()
      };
      
      if (adminNotes) updateData.admin_notes = adminNotes;
      if (processedBy) updateData.processed_by = processedBy;
      
      const record = await pb.collection('refund_requests').update<RefundRequest>(id, updateData);
      return { success: true, data: record };
    } catch (error: unknown) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process refund request' 
      };
    }
  }
};

export default pb; 