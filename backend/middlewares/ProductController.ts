// 产品控制器 - 处理HTTP请求
import { ProductService, ProductQuery } from "../services/ProductService.ts";
import { ProductRepository, DatabaseConfig } from "../services/ProductRepository.ts";

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

export class ProductController {
  private productService: ProductService;
  private productRepository: ProductRepository;

  constructor(dbConfig?: DatabaseConfig) {
    this.productService = ProductService.getInstance();
    
    // 如果没有提供配置，使用默认配置
    const defaultConfig = {
      host: '127.0.0.1',
      port: 8090,
      apiUrl: 'http://127.0.0.1:8090',
    };
    
    this.productRepository = ProductRepository.getInstance(dbConfig || defaultConfig);
  }

  /**
   * 获取产品列表
   */
  public async getProducts(request: Request): Promise<ApiResponse> {
    try {
      const url = new URL(request.url);
      const queryParams = {
        page: parseInt(url.searchParams.get('page') || '1'),
        perPage: parseInt(url.searchParams.get('perPage') || '20'),
        status: url.searchParams.get('status') || undefined,
        category: url.searchParams.get('category') || undefined,
        search: url.searchParams.get('search') || undefined,
        sortBy: url.searchParams.get('sortBy') || 'created',
        sortOrder: url.searchParams.get('sortOrder') || 'desc',
      };

      // 验证查询参数
      const validatedQuery = this.productService.validateQuery(queryParams);

      // 从数据库获取数据
      const dbResult = await this.productRepository.findByQuery(validatedQuery);
      
      if (!dbResult.success) {
        return {
          success: false,
          error: dbResult.error || '获取产品数据失败',
        };
      }
      
      const allProducts = dbResult.data || [];
      
      // 过滤和搜索
      const filteredProducts = this.productService.filterProducts(allProducts, validatedQuery);
      
      // 分页
      const paginatedResult = this.productService.paginateProducts(filteredProducts, validatedQuery);
      
      return {
        success: true,
        data: allProducts,
        pagination: dbResult.pagination,
      };
    } catch (error) {
      console.error('获取产品列表失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取产品列表失败',
      };
    }
  }

  /**
   * 获取单个产品
   */
  public async getProduct(productId: string): Promise<ApiResponse> {
    try {
      if (!productId) {
        return {
          success: false,
          error: '产品ID不能为空',
        };
      }

      // 从数据库获取单个产品
      const result = await this.productRepository.findById(productId);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || '产品不存在',
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('获取产品失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取产品失败',
      };
    }
  }

  /**
   * 创建产品
   */
  public async createProduct(request: Request): Promise<ApiResponse> {
    try {
      const body = await request.json();
      
      // 验证数据
      const validatedData = this.productService.validateCreateProduct(body);
      
      // 检查名称重复
      const nameCheck = await this.productRepository.checkNameExists(validatedData.name);
      if (nameCheck.exists) {
        return {
          success: false,
          error: '产品名称已存在',
        };
      }

      // 格式化数据
      const formattedData = this.productService.formatForCreate(validatedData);
      
      // 保存到数据库
      const result = await this.productRepository.create(formattedData);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || '创建产品失败',
        };
      }
      
      return {
        success: true,
        data: result.data,
        message: '产品创建成功',
      };
    } catch (error) {
      console.error('创建产品失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建产品失败',
      };
    }
  }

  /**
   * 更新产品
   */
  public async updateProduct(productId: string, request: Request): Promise<ApiResponse> {
    try {
      if (!productId) {
        return {
          success: false,
          error: '产品ID不能为空',
        };
      }

      const body = await request.json();
      
      // 验证数据
      const validatedData = this.productService.validateUpdateProduct(body);
      
      // 检查产品是否存在
      const existingResult = await this.productRepository.findById(productId);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: '产品不存在',
        };
      }

      // 如果更新了名称，检查重复
      if (validatedData.name && validatedData.name !== existingResult.data.name) {
        const nameCheck = await this.productRepository.checkNameExists(validatedData.name, productId);
        if (nameCheck.exists) {
          return {
            success: false,
            error: '产品名称已存在',
          };
        }
      }

      // 格式化数据
      const formattedData = this.productService.formatForUpdate(validatedData);
      
      // 更新到数据库
      const result = await this.productRepository.update(productId, formattedData);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || '更新产品失败',
        };
      }
      
      return {
        success: true,
        data: result.data,
        message: '产品更新成功',
      };
    } catch (error) {
      console.error('更新产品失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新产品失败',
      };
    }
  }

  /**
   * 删除产品
   */
  public async deleteProduct(productId: string): Promise<ApiResponse> {
    try {
      if (!productId) {
        return {
          success: false,
          error: '产品ID不能为空',
        };
      }

      // 检查产品是否存在
      const existingResult = await this.productRepository.findById(productId);
      if (!existingResult.success || !existingResult.data) {
        return {
          success: false,
          error: '产品不存在',
        };
      }

      // 从数据库删除
      const result = await this.productRepository.delete(productId);
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || '删除产品失败',
        };
      }
      
      return {
        success: true,
        message: '产品删除成功',
      };
    } catch (error) {
      console.error('删除产品失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '删除产品失败',
      };
    }
  }

  /**
   * 获取产品统计信息
   */
  public async getProductStats(): Promise<ApiResponse> {
    try {
      const result = await this.productRepository.getStats();
      
      if (!result.success) {
        return {
          success: false,
          error: result.error || '获取统计信息失败',
        };
      }
      
      return {
        success: true,
        data: result.data,
      };
    } catch (error) {
      console.error('获取产品统计失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取产品统计失败',
      };
    }
  }

  /**
   * 导出产品数据
   */
  public async exportProducts(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const format = url.searchParams.get('format') as 'json' | 'csv' || 'json';
      
      const result = await this.productRepository.findAll();
      
      if (!result.success || !result.data) {
        return new Response(
          JSON.stringify({
            success: false,
            error: result.error || '获取产品数据失败',
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      
      const exportData = this.productService.exportProducts(result.data, format);
      
      const headers = new Headers();
      if (format === 'csv') {
        headers.set('Content-Type', 'text/csv');
        headers.set('Content-Disposition', 'attachment; filename="products.csv"');
      } else {
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', 'attachment; filename="products.json"');
      }
      
      return new Response(exportData, { headers });
    } catch (error) {
      console.error('导出产品数据失败:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : '导出产品数据失败',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  /**
   * 批量更新产品状态
   */
  public async batchUpdateStatus(request: Request): Promise<ApiResponse> {
    try {
      const body = await request.json();
      const { productIds, status } = body;
      
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return {
          success: false,
          error: '产品ID列表不能为空',
        };
      }

      if (!['active', 'inactive', 'draft'].includes(status)) {
        return {
          success: false,
          error: '无效的状态值',
        };
      }

      const result = await this.productRepository.batchUpdateStatus(productIds, status);
      
      if (!result.success) {
        return {
          success: false,
          error: `批量更新失败: ${result.errors?.join(', ')}`,
        };
      }
      
      return {
        success: true,
        message: `成功更新 ${result.updated} 个产品的状态`,
      };
    } catch (error) {
      console.error('批量更新产品状态失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量更新产品状态失败',
      };
    }
  }

  /**
   * 批量删除产品
   */
  public async batchDelete(request: Request): Promise<ApiResponse> {
    try {
      const body = await request.json();
      const { productIds } = body;
      
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return {
          success: false,
          error: '产品ID列表不能为空',
        };
      }

      const result = await this.productRepository.batchDelete(productIds);
      
      if (!result.success) {
        return {
          success: false,
          error: `批量删除失败: ${result.errors?.join(', ')}`,
        };
      }
      
      return {
        success: true,
        message: `成功删除 ${result.deleted} 个产品`,
      };
    } catch (error) {
      console.error('批量删除产品失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '批量删除产品失败',
      };
    }
  }
} 