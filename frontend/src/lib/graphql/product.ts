import { apolloClient } from './client';
import { FetchPolicy } from '@apollo/client';
import {
  // 查询
  GET_PRODUCTS,
  GET_PRODUCT,
  GET_PRODUCT_STATS,
  GET_PRODUCT_CATEGORIES,
  GET_PRODUCTS_BY_CATEGORY,
  GET_LOW_STOCK_PRODUCTS,
  GET_OUT_OF_STOCK_PRODUCTS,
  GET_PRODUCT_SEARCH_SUGGESTIONS,
  GET_RELATED_PRODUCTS,
  // 变更
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  DUPLICATE_PRODUCT,
  BATCH_UPDATE_PRODUCT_STATUS,
  BATCH_DELETE_PRODUCTS,
  BATCH_UPDATE_PRODUCT_PRICES,
  UPDATE_PRODUCT_STOCK,
  BATCH_UPDATE_STOCK,
  CREATE_PRODUCT_CATEGORY,
  UPDATE_PRODUCT_CATEGORY,
  DELETE_PRODUCT_CATEGORY,
  EXPORT_PRODUCTS,
  UPLOAD_PRODUCT_IMAGE,
  DELETE_PRODUCT_IMAGE,
  REORDER_PRODUCT_IMAGES,
} from './queries';
import { gql } from '@apollo/client';

// 类型定义
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  config?: Record<string, unknown>;
  sku?: string;
  stock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images?: string[];
  meta_data?: Record<string, unknown>;
  created: string;
  updated: string;
}

export interface ProductQuery {
  page?: number;
  perPage?: number;
  status?: 'active' | 'inactive' | 'draft';
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  tags?: string[];
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

export interface ProductCategory {
  name: string;
  count: number;
  description?: string;
}

export interface BatchOperationResult {
  success: boolean;
  message?: string;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

export interface StockOperationResult {
  success: boolean;
  message?: string;
  product?: Product;
  previousStock?: number;
  newStock?: number;
}

export interface ExportResult {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  filename?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price?: number;
  category?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  sku?: string;
  stock?: number;
  weight?: number;
  images?: string[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  meta_data?: Record<string, unknown>;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  status?: 'active' | 'inactive' | 'draft';
  tags?: string[];
  sku?: string;
  stock?: number;
  weight?: number;
  images?: string[];
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  meta_data?: Record<string, unknown>;
}

// GraphQL 产品服务类
export class GraphQLProductService {
  // ==================== 测试方法 ====================
  
  /**
   * 测试GraphQL连接
   */
  async testConnection() {
    try {
      console.log('Testing GraphQL connection...');
      const result = await apolloClient.query({
        query: gql`query { health }`,
        fetchPolicy: 'no-cache'
      });
      console.log('Health check result:', result);
      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      console.error('GraphQL connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  // ==================== 查询操作 ====================
  
  /**
   * 获取产品列表
   */
  async getProducts(query?: ProductQuery) {
    try {
      console.log('GraphQL Product Service: Starting query with:', query);
      
      // 简化查询，不使用复杂的选项
      const result = await apolloClient.query({
        query: GET_PRODUCTS,
        variables: { query: query || {} },
        fetchPolicy: 'no-cache' // 使用no-cache避免缓存问题
      });
      
      console.log('GraphQL Query Result:', result);
      
      if (result.data && result.data.products) {
        return {
          success: true,
          data: result.data.products.items,
          pagination: result.data.products.pagination
        };
      } else {
        return {
          success: false,
          error: 'No data returned from GraphQL query'
        };
      }
    } catch (error) {
      console.error('GraphQL Query Error:', error);
      
      // 检查是否是网络错误
      if (error && typeof error === 'object' && 'networkError' in error) {
        console.error('Network Error Details:', (error as { networkError: unknown }).networkError);
      }
      
      // 检查是否是GraphQL错误
      if (error && typeof error === 'object' && 'graphQLErrors' in error) {
        console.error('GraphQL Errors:', (error as { graphQLErrors: unknown }).graphQLErrors);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products'
      };
    }
  }

  /**
   * 获取单个产品
   */
  async getProduct(id: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_PRODUCT,
        variables: { id },
        fetchPolicy: 'cache-first' as FetchPolicy
      });
      return {
        success: true,
        data: data.product
      };
    } catch (error) {
      console.error('Failed to fetch product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product'
      };
    }
  }

  /**
   * 获取产品统计
   */
  async getProductStats(): Promise<{ success: boolean; data?: ProductStats; error?: string }> {
    try {
      const { data } = await apolloClient.query({
        query: GET_PRODUCT_STATS,
        fetchPolicy: 'cache-and-network' as FetchPolicy
      });
      return {
        success: true,
        data: data.productStats
      };
    } catch (error) {
      console.error('Failed to fetch product stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product stats'
      };
    }
  }

  /**
   * 获取产品分类
   */
  async getProductCategories() {
    try {
      const { data } = await apolloClient.query({
        query: GET_PRODUCT_CATEGORIES,
        fetchPolicy: 'cache-and-network' as FetchPolicy
      });
      return {
        success: true,
        data: data.productCategories
      };
    } catch (error) {
      console.error('Failed to fetch product categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch product categories'
      };
    }
  }

  /**
   * 根据分类获取产品
   */
  async getProductsByCategory(category: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_PRODUCTS_BY_CATEGORY,
        variables: { category },
        fetchPolicy: 'cache-and-network' as FetchPolicy
      });
      return {
        success: true,
        data: data.productsByCategory
      };
    } catch (error) {
      console.error('Failed to fetch products by category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products by category'
      };
    }
  }

  /**
   * 获取低库存产品
   */
  async getLowStockProducts(threshold?: number) {
    try {
      const { data } = await apolloClient.query({
        query: GET_LOW_STOCK_PRODUCTS,
        variables: { threshold },
        fetchPolicy: 'cache-and-network' as FetchPolicy
      });
      return {
        success: true,
        data: data.lowStockProducts
      };
    } catch (error) {
      console.error('Failed to fetch low stock products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch low stock products'
      };
    }
  }

  /**
   * 获取缺货产品
   */
  async getOutOfStockProducts() {
    try {
      const { data } = await apolloClient.query({
        query: GET_OUT_OF_STOCK_PRODUCTS,
        fetchPolicy: 'cache-and-network' as FetchPolicy
      });
      return {
        success: true,
        data: data.outOfStockProducts
      };
    } catch (error) {
      console.error('Failed to fetch out of stock products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch out of stock products'
      };
    }
  }

  /**
   * 获取搜索建议
   */
  async getProductSearchSuggestions(query: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_PRODUCT_SEARCH_SUGGESTIONS,
        variables: { query },
        fetchPolicy: 'cache-first' as FetchPolicy
      });
      return {
        success: true,
        data: data.productSearchSuggestions
      };
    } catch (error) {
      console.error('Failed to fetch search suggestions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch search suggestions'
      };
    }
  }

  /**
   * 获取相关产品
   */
  async getRelatedProducts(productId: string, limit?: number) {
    try {
      const { data } = await apolloClient.query({
        query: GET_RELATED_PRODUCTS,
        variables: { productId, limit },
        fetchPolicy: 'cache-first' as FetchPolicy
      });
      return {
        success: true,
        data: data.relatedProducts
      };
    } catch (error) {
      console.error('Failed to fetch related products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch related products'
      };
    }
  }

  // ==================== 变更操作 ====================

  /**
   * 创建产品
   */
  async createProduct(input: ProductInput) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PRODUCT,
        variables: { input },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.createProduct
      };
    } catch (error) {
      console.error('Failed to create product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product'
      };
    }
  }

  /**
   * 更新产品
   */
  async updateProduct(id: string, input: ProductUpdateInput) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PRODUCT,
        variables: { id, input },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.updateProduct
      };
    } catch (error) {
      console.error('Failed to update product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product'
      };
    }
  }

  /**
   * 删除产品
   */
  async deleteProduct(id: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_PRODUCT,
        variables: { id },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: data.deleteProduct,
        message: data.deleteProduct ? '产品删除成功' : '产品删除失败'
      };
    } catch (error) {
      console.error('Failed to delete product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product'
      };
    }
  }

  /**
   * 复制产品
   */
  async duplicateProduct(id: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DUPLICATE_PRODUCT,
        variables: { id },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.duplicateProduct
      };
    } catch (error) {
      console.error('Failed to duplicate product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to duplicate product'
      };
    }
  }

  // ==================== 批量操作 ====================

  /**
   * 批量更新产品状态
   */
  async batchUpdateProductStatus(productIds: string[], status: string): Promise<{ success: boolean; data?: BatchOperationResult; error?: string }> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: BATCH_UPDATE_PRODUCT_STATUS,
        variables: { input: { productIds, status } },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.batchUpdateProductStatus
      };
    } catch (error) {
      console.error('Failed to batch update product status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch update product status'
      };
    }
  }

  /**
   * 批量删除产品
   */
  async batchDeleteProducts(productIds: string[]): Promise<{ success: boolean; data?: BatchOperationResult; error?: string }> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: BATCH_DELETE_PRODUCTS,
        variables: { input: { productIds } },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.batchDeleteProducts
      };
    } catch (error) {
      console.error('Failed to batch delete products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch delete products'
      };
    }
  }

  /**
   * 批量更新产品价格
   */
  async batchUpdateProductPrices(productIds: string[], price: number, updateType: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: BATCH_UPDATE_PRODUCT_PRICES,
        variables: { input: { productIds, price, updateType } },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.batchUpdateProductPrices
      };
    } catch (error) {
      console.error('Failed to batch update product prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch update product prices'
      };
    }
  }

  // ==================== 库存管理 ====================

  /**
   * 更新产品库存
   */
  async updateProductStock(productId: string, quantity: number, operation: string, reason?: string): Promise<{ success: boolean; data?: StockOperationResult; error?: string }> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PRODUCT_STOCK,
        variables: { input: { productId, quantity, operation, reason } },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.updateProductStock
      };
    } catch (error) {
      console.error('Failed to update product stock:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product stock'
      };
    }
  }

  /**
   * 批量更新库存
   */
  async batchUpdateStock(inputs: Array<{ productId: string; quantity: number; operation: string; reason?: string }>) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: BATCH_UPDATE_STOCK,
        variables: { inputs },
        refetchQueries: [{ query: GET_PRODUCTS }, { query: GET_PRODUCT_STATS }]
      });
      return {
        success: true,
        data: data.batchUpdateStock
      };
    } catch (error) {
      console.error('Failed to batch update stock:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to batch update stock'
      };
    }
  }

  // ==================== 分类管理 ====================

  /**
   * 创建产品分类
   */
  async createProductCategory(name: string, description?: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_PRODUCT_CATEGORY,
        variables: { input: { name, description } },
        refetchQueries: [{ query: GET_PRODUCT_CATEGORIES }]
      });
      return {
        success: true,
        data: data.createProductCategory
      };
    } catch (error) {
      console.error('Failed to create product category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create product category'
      };
    }
  }

  /**
   * 更新产品分类
   */
  async updateProductCategory(oldName: string, newName: string, description?: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_PRODUCT_CATEGORY,
        variables: { name: oldName, input: { name: newName, description } },
        refetchQueries: [{ query: GET_PRODUCT_CATEGORIES }, { query: GET_PRODUCTS }]
      });
      return {
        success: true,
        data: data.updateProductCategory
      };
    } catch (error) {
      console.error('Failed to update product category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update product category'
      };
    }
  }

  /**
   * 删除产品分类
   */
  async deleteProductCategory(name: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_PRODUCT_CATEGORY,
        variables: { name },
        refetchQueries: [{ query: GET_PRODUCT_CATEGORIES }, { query: GET_PRODUCTS }]
      });
      return {
        success: data.deleteProductCategory,
        message: data.deleteProductCategory ? '分类删除成功' : '分类删除失败'
      };
    } catch (error) {
      console.error('Failed to delete product category:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product category'
      };
    }
  }

  // ==================== 导出功能 ====================

  /**
   * 导出产品
   */
  async exportProducts(format: string, productIds?: string[], includeImages?: boolean, filters?: ProductQuery): Promise<{ success: boolean; data?: ExportResult; error?: string }> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: EXPORT_PRODUCTS,
        variables: { input: { format, productIds, includeImages, filters } }
      });
      return {
        success: true,
        data: data.exportProducts
      };
    } catch (error) {
      console.error('Failed to export products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export products'
      };
    }
  }

  // ==================== 图片管理 ====================

  /**
   * 上传产品图片
   */
  async uploadProductImage(productId: string, imageData: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPLOAD_PRODUCT_IMAGE,
        variables: { productId, imageData },
        refetchQueries: [{ query: GET_PRODUCT, variables: { id: productId } }]
      });
      return {
        success: true,
        data: data.uploadProductImage
      };
    } catch (error) {
      console.error('Failed to upload product image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload product image'
      };
    }
  }

  /**
   * 删除产品图片
   */
  async deleteProductImage(productId: string, imageUrl: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_PRODUCT_IMAGE,
        variables: { productId, imageUrl },
        refetchQueries: [{ query: GET_PRODUCT, variables: { id: productId } }]
      });
      return {
        success: data.deleteProductImage,
        message: data.deleteProductImage ? '图片删除成功' : '图片删除失败'
      };
    } catch (error) {
      console.error('Failed to delete product image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete product image'
      };
    }
  }

  /**
   * 重新排序产品图片
   */
  async reorderProductImages(productId: string, imageUrls: string[]) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: REORDER_PRODUCT_IMAGES,
        variables: { productId, imageUrls },
        refetchQueries: [{ query: GET_PRODUCT, variables: { id: productId } }]
      });
      return {
        success: true,
        data: data.reorderProductImages
      };
    } catch (error) {
      console.error('Failed to reorder product images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reorder product images'
      };
    }
  }
}

// 导出单例实例
export const graphqlProductService = new GraphQLProductService(); 