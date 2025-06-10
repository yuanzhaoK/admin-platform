// 产品数据访问层 - 与 PocketBase 交互
import { Product, ProductQuery } from "./ProductService.ts";

export interface DatabaseConfig {
  host: string;
  port: number;
  apiUrl: string;
}

export class ProductRepository {
  private static instance: ProductRepository;
  private config: DatabaseConfig;

  private constructor(config: DatabaseConfig) {
    this.config = config;
  }

  public static getInstance(config?: DatabaseConfig): ProductRepository {
    if (!ProductRepository.instance) {
      if (!config) {
        throw new Error('Database config is required for first initialization');
      }
      ProductRepository.instance = new ProductRepository(config);
    }
    return ProductRepository.instance;
  }

  /**
   * 获取 PocketBase API 完整 URL
   */
  private getApiUrl(endpoint: string): string {
    return `${this.config.apiUrl}${endpoint}`;
  }

  /**
   * 通用 API 请求方法
   */
  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const url = this.getApiUrl(endpoint);
      console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败',
      };
    }
  }

  /**
   * 获取所有产品
   */
  public async findAll(): Promise<{ success: boolean; data?: Product[]; error?: string }> {
    const result = await this.apiRequest<{ items: Product[] }>('/api/collections/products/records');
    
    if (result.success && result.data) {
      return { success: true, data: result.data.items };
    }
    
    return { success: result.success, error: result.error };
  }

  /**
   * 根据查询条件获取产品
   */
  public async findByQuery(query: ProductQuery): Promise<{ 
    success: boolean; 
    data?: Product[]; 
    pagination?: any; 
    error?: string 
  }> {
    const params = new URLSearchParams();
    
    // 分页参数
    params.set('page', query.page.toString());
    params.set('perPage', query.perPage.toString());
    
    // 排序参数
    const sortDirection = query.sortOrder === 'desc' ? '-' : '';
    params.set('sort', `${sortDirection}${query.sortBy}`);
    
    // 过滤条件
    const filters: string[] = [];
    
    if (query.status) {
      filters.push(`status="${query.status}"`);
    }
    
    if (query.category) {
      filters.push(`category="${query.category}"`);
    }
    
    if (query.search) {
      const searchTerm = query.search.toLowerCase();
      filters.push(
        `(name~"${searchTerm}" || description~"${searchTerm}" || sku~"${searchTerm}")`
      );
    }
    
    if (filters.length > 0) {
      params.set('filter', filters.join(' && '));
    }
    
    const endpoint = `/api/collections/products/records?${params.toString()}`;
    const result = await this.apiRequest<{ 
      items: Product[]; 
      page: number; 
      perPage: number; 
      totalItems: number; 
      totalPages: number; 
    }>(endpoint);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.items,
        pagination: {
          page: result.data.page,
          perPage: result.data.perPage,
          totalItems: result.data.totalItems,
          totalPages: result.data.totalPages,
        },
      };
    }
    
    return { success: result.success, error: result.error };
  }

  /**
   * 根据ID获取单个产品
   */
  public async findById(id: string): Promise<{ success: boolean; data?: Product; error?: string }> {
    if (!id) {
      return { success: false, error: '产品ID不能为空' };
    }
    
    return await this.apiRequest<Product>(`/api/collections/products/records/${id}`);
  }

  /**
   * 创建产品
   */
  public async create(data: Omit<Product, 'id'>): Promise<{ success: boolean; data?: Product; error?: string }> {
    return await this.apiRequest<Product>('/api/collections/products/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * 更新产品
   */
  public async update(id: string, data: Partial<Product>): Promise<{ success: boolean; data?: Product; error?: string }> {
    if (!id) {
      return { success: false, error: '产品ID不能为空' };
    }
    
    return await this.apiRequest<Product>(`/api/collections/products/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * 删除产品
   */
  public async delete(id: string): Promise<{ success: boolean; error?: string }> {
    if (!id) {
      return { success: false, error: '产品ID不能为空' };
    }
    
    const result = await this.apiRequest(`/api/collections/products/records/${id}`, {
      method: 'DELETE',
    });
    
    return { success: result.success, error: result.error };
  }

  /**
   * 批量创建产品
   */
  public async batchCreate(products: Omit<Product, 'id'>[]): Promise<{
    success: boolean;
    data?: Product[];
    errors?: string[];
  }> {
    const results: Product[] = [];
    const errors: string[] = [];
    
    for (const product of products) {
      const result = await this.create(product);
      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(result.error || '创建失败');
      }
    }
    
    return {
      success: errors.length === 0,
      data: results,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 批量更新产品状态
   */
  public async batchUpdateStatus(ids: string[], status: Product['status']): Promise<{
    success: boolean;
    updated?: number;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let updated = 0;
    
    for (const id of ids) {
      const result = await this.update(id, { status });
      if (result.success) {
        updated++;
      } else {
        errors.push(`ID ${id}: ${result.error}`);
      }
    }
    
    return {
      success: errors.length === 0,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 批量删除产品
   */
  public async batchDelete(ids: string[]): Promise<{
    success: boolean;
    deleted?: number;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let deleted = 0;
    
    for (const id of ids) {
      const result = await this.delete(id);
      if (result.success) {
        deleted++;
      } else {
        errors.push(`ID ${id}: ${result.error}`);
      }
    }
    
    return {
      success: errors.length === 0,
      deleted,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * 检查产品名称是否重复
   */
  public async checkNameExists(name: string, excludeId?: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const filter = excludeId 
        ? `name="${name}" && id!="${excludeId}"`
        : `name="${name}"`;
      
      const params = new URLSearchParams({
        filter,
        perPage: '1',
      });
      
      const result = await this.apiRequest<{ items: Product[]; totalItems: number }>(
        `/api/collections/products/records?${params.toString()}`
      );
      
      if (!result.success) {
        return { exists: false, error: result.error };
      }
      
      return { exists: (result.data?.totalItems || 0) > 0 };
    } catch (error) {
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : '检查名称失败' 
      };
    }
  }

  /**
   * 检查SKU是否重复
   */
  public async checkSKUExists(sku: string, excludeId?: string): Promise<{ exists: boolean; error?: string }> {
    try {
      const filter = excludeId 
        ? `sku="${sku}" && id!="${excludeId}"`
        : `sku="${sku}"`;
      
      const params = new URLSearchParams({
        filter,
        perPage: '1',
      });
      
      const result = await this.apiRequest<{ items: Product[]; totalItems: number }>(
        `/api/collections/products/records?${params.toString()}`
      );
      
      if (!result.success) {
        return { exists: false, error: result.error };
      }
      
      return { exists: (result.data?.totalItems || 0) > 0 };
    } catch (error) {
      return { 
        exists: false, 
        error: error instanceof Error ? error.message : '检查SKU失败' 
      };
    }
  }

  /**
   * 获取产品统计信息
   */
  public async getStats(): Promise<{
    success: boolean;
    data?: {
      total: number;
      active: number;
      inactive: number;
      draft: number;
      categories: Record<string, number>;
    };
    error?: string;
  }> {
    try {
      // 获取所有产品进行统计
      const result = await this.findAll();
      
      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }
      
      const products = result.data;
      const stats = {
        total: products.length,
        active: 0,
        inactive: 0,
        draft: 0,
        categories: {} as Record<string, number>,
      };
      
      for (const product of products) {
        // 统计状态
        stats[product.status]++;
        
        // 统计分类
        if (product.category) {
          stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
        }
      }
      
      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取统计信息失败',
      };
    }
  }

  /**
   * 健康检查
   */
  public async healthCheck(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(this.getApiUrl('/api/health'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      
      return { success: response.ok };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '健康检查失败',
      };
    }
  }
} 