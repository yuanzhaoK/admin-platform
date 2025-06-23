import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { ProductCategory } from '../../types/index.ts';

// 辅助函数：计算分类层级
async function calculateCategoryLevel(categoryId: string, pb: any): Promise<number> {
  let level = 0;
  let currentId = categoryId;
  
  while (currentId) {
    try {
      const category = await pb.collection('product_categories').getOne(currentId);
      if (!category.parent_id) break;
      currentId = category.parent_id;
      level++;
    } catch {
      break;
    }
  }
  
  return level;
}

// 辅助函数：构建分类路径
async function buildCategoryPath(categoryId: string, pb: any): Promise<string> {
  const pathParts: string[] = [];
  let currentId = categoryId;
  
  while (currentId) {
    try {
      const category = await pb.collection('product_categories').getOne(currentId);
      pathParts.unshift(category.name);
      currentId = category.parent_id;
    } catch {
      break;
    }
  }
  
  return pathParts.join(' > ');
}

export const categoryResolvers = {
  Query: {
    // 分类查询
    categories: async (_: any, { query }: { query?: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 使用请求队列来避免并发冲突
        const result = await pocketbaseClient.queueRequest(async () => {
          // 确保page和perPage有默认值，不能为null
          const page = Math.max(1, query?.page || 1);
          const perPage = Math.max(1, Math.min(100, query?.perPage || 20));
          
          // 构建过滤条件
          const filters: string[] = [];
          if (query?.status) filters.push(`status="${query.status}"`);
          if (query?.parent_id) filters.push(`parent_id="${query.parent_id}"`);
          if (query?.search) {
            filters.push(`(name~"${query.search}" || description~"${query.search}")`);
          }
          
          const options: any = {};
          if (filters.length > 0) {
            options.filter = filters.join(' && ');
          }
          
          // 排序
          if (query?.sortBy) {
            const sortOrder = query.sortOrder === 'asc' ? '' : '-';
            options.sort = `${sortOrder}${query.sortBy}`;
          } else {
            options.sort = 'sort_order,name';
          }
          
          return await pb.collection('product_categories').getList<ProductCategory>(page, perPage, options);
        });
        
        // 确保所有分类都有必需的字段
        const processedItems = result.items.map(item => ({
          ...item,
          created: item.created || new Date().toISOString(),
          updated: item.updated || new Date().toISOString()
        }));
        
        // 确保分页信息不为null
        return {
          items: processedItems,
          pagination: {
            page: result.page || (query?.page || 1),
            perPage: result.perPage || (query?.perPage || 20),
            total: result.totalItems || 0,
            totalItems: result.totalItems || 0,
            totalPages: result.totalPages || 1,
            hasNext: (result.page || 1) < (result.totalPages || 1),
            hasPrev: (result.page || 1) > 1
          }
        };
      } catch (error) {
        console.error('Failed to fetch product categories:', error);
        throw new Error('Failed to fetch product categories');
      }
    },

    category: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const category = await pb.collection('product_categories').getOne<ProductCategory>(id);
        
        // 确保分类有必需的字段
        return {
          ...category,
          created: category.created || new Date().toISOString(),
          updated: category.updated || new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to fetch product category:', error);
        return null;
      }
    },

    // 分类树结构
    categoryTree: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 使用请求队列来避免并发冲突  
        const categories = await pocketbaseClient.queueRequest(async () => {
          return await pb.collection('product_categories').getFullList<ProductCategory>({
            sort: 'sort_order,name'
          });
        });
        
        // 确保所有分类都有必需的字段
        const processedCategories = categories.map(item => ({
          ...item,
          created: item.created || new Date().toISOString(),
          updated: item.updated || new Date().toISOString()
        }));
        
        // 构建树结构
        const categoryMap = new Map<string, ProductCategory>();
        const rootCategories: ProductCategory[] = [];
        
        // 第一次遍历：创建映射
        processedCategories.forEach(category => {
          categoryMap.set(category.id, { ...category, children: [] });
        });
        
        // 第二次遍历：构建树结构
        processedCategories.forEach(category => {
          const categoryWithChildren = categoryMap.get(category.id)!;
          if (category.parent_id) {
            const parent = categoryMap.get(category.parent_id);
            if (parent) {
              parent.children = parent.children || [];
              parent.children.push(categoryWithChildren);
            }
          } else {
            rootCategories.push(categoryWithChildren);
          }
        });
        
        return rootCategories;
      } catch (error) {
        console.error('Failed to fetch category tree:', error);
        throw new Error('Failed to fetch category tree');
      }
    },

    // 获取根分类
    rootCategories: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const categories = await pb.collection('product_categories').getFullList<ProductCategory>({
          filter: 'parent_id=""',
          sort: 'sort_order,name'
        });
        
        return categories.map(item => ({
          ...item,
          created: item.created || new Date().toISOString(),
          updated: item.updated || new Date().toISOString()
        }));
      } catch (error) {
        console.error('Failed to fetch root categories:', error);
        throw new Error('Failed to fetch root categories');
      }
    },

    // 获取分类路径
    categoryPath: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const path: ProductCategory[] = [];
        let currentId = id;
        
        while (currentId) {
          const category = await pb.collection('product_categories').getOne<ProductCategory>(currentId);
          path.unshift({
            ...category,
            created: category.created || new Date().toISOString(),
            updated: category.updated || new Date().toISOString()
          });
          currentId = category.parent_id || '';
        }
        
        return path;
      } catch (error) {
        console.error('Failed to fetch category path:', error);
        return [];
      }
    },

    // 分类统计
    categoryStats: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const categories = await pb.collection('product_categories').getFullList<ProductCategory>();
        const products = await pb.collection('products').getFullList();
        
        const active = categories.filter(c => c.status === 'active').length;
        const inactive = categories.filter(c => c.status === 'inactive').length;
        
        const categoriesWithProducts = new Set();
        products.forEach(p => {
          if (p.category_id) categoriesWithProducts.add(p.category_id);
        });
        
        const maxDepth = Math.max(...categories.map(c => (c as any).level || 0), 0);
        
        return {
          total: categories.length,
          active,
          inactive,
          with_products: categoriesWithProducts.size,
          without_products: categories.length - categoriesWithProducts.size,
          max_depth: maxDepth
        };
      } catch (error) {
        console.error('Failed to fetch category stats:', error);
        throw new Error('Failed to fetch category stats');
      }
    },

    // 搜索分类
    searchCategories: async (_: any, { keyword, limit = 10 }: { keyword: string; limit?: number }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const categories = await pb.collection('product_categories').getList<ProductCategory>(1, limit, {
          filter: `name~"${keyword}" || description~"${keyword}"`,
          sort: 'name'
        });
        
        return categories.items.map(item => ({
          ...item,
          created: item.created || new Date().toISOString(),
          updated: item.updated || new Date().toISOString()
        }));
      } catch (error) {
        console.error('Failed to search categories:', error);
        return [];
      }
    },
  },

  Mutation: {
    createCategory: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const category = await pb.collection('product_categories').create<ProductCategory>(input);
        
        // 确保有必需的字段
        return {
          ...category,
          created: category.created || new Date().toISOString(),
          updated: category.updated || new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to create product category:', error);
        throw new Error('Failed to create product category');
      }
    },

    updateCategory: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const category = await pb.collection('product_categories').update<ProductCategory>(id, input);
        
        // 确保有必需的字段
        return {
          ...category,
          created: category.created || new Date().toISOString(),
          updated: category.updated || new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to update product category:', error);
        throw new Error('Failed to update product category');
      }
    },

    deleteCategory: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 检查是否有子分类
        const children = await pb.collection('product_categories').getFullList({
          filter: `parent_id="${id}"`
        });
        
        if (children.length > 0) {
          throw new Error('Cannot delete category with subcategories');
        }
        
        // 检查是否有关联的产品
        const products = await pb.collection('products').getFullList({
          filter: `category_id="${id}"`
        });
        
        if (products.length > 0) {
          throw new Error('Cannot delete category with associated products');
        }
        
        await pb.collection('product_categories').delete(id);
        return true;
      } catch (error) {
        console.error('Failed to delete product category:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete product category');
      }
    },

    // 移动分类
    moveCategory: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const { category_id, new_parent_id, new_sort_order } = input;
        
        const updateData: any = {};
        if (new_parent_id !== undefined) updateData.parent_id = new_parent_id;
        if (new_sort_order !== undefined) updateData.sort_order = new_sort_order;
        
        const category = await pb.collection('product_categories').update<ProductCategory>(category_id, updateData);
        
        return {
          ...category,
          created: category.created || new Date().toISOString(),
          updated: category.updated || new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to move category:', error);
        throw new Error('Failed to move category');
      }
    },

    // 批量删除分类
    batchDeleteCategories: async (_: any, { ids }: { ids: string[] }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let successCount = 0;
        const errors: string[] = [];
        
        for (const id of ids) {
          try {
            // 检查是否有子分类或关联产品
            const children = await pb.collection('product_categories').getFullList({
              filter: `parent_id="${id}"`
            });
            
            const products = await pb.collection('products').getFullList({
              filter: `category_id="${id}"`
            });
            
            if (children.length > 0 || products.length > 0) {
              errors.push(`Category ${id} has subcategories or products`);
              continue;
            }
            
            await pb.collection('product_categories').delete(id);
            successCount++;
          } catch (error) {
            errors.push(`Failed to delete category ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        return {
          success: successCount > 0,
          total: ids.length,
          success_count: successCount,
          error_count: errors.length,
          errors
        };
      } catch (error) {
        console.error('Failed to batch delete categories:', error);
        throw new Error('Failed to batch delete categories');
      }
    },

    // 重建分类层级
    rebuildCategoryHierarchy: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取所有分类
        const categories = await pb.collection('product_categories').getFullList<ProductCategory>();
        
        // 重新计算层级和路径
        const updatePromises = categories.map(async (category) => {
          const level = await calculateCategoryLevel(category.id, pb);
          const path = await buildCategoryPath(category.id, pb);
          
          return pb.collection('product_categories').update(category.id, {
            level,
            path
          });
        });
        
        await Promise.all(updatePromises);
        
        return {
          success: true,
          message: 'Category hierarchy rebuilt successfully'
        };
      } catch (error) {
        console.error('Failed to rebuild category hierarchy:', error);
        throw new Error('Failed to rebuild category hierarchy');
      }
    },
  },

  // 类型解析器
  ProductCategory: {
    parent: async (parent: ProductCategory) => {
      if (!parent.parent_id) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const category = await pb.collection('product_categories').getOne<ProductCategory>(parent.parent_id);
        
        // 确保有必需的字段
        return {
          ...category,
          created: category.created || new Date().toISOString(),
          updated: category.updated || new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to fetch parent category:', error);
        return null;
      }
    },
    
    children: async (parent: ProductCategory) => {
      // 如果父分类已经包含children数据，直接返回
      if (parent.children && Array.isArray(parent.children)) {
        return parent.children;
      }
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 使用更简单的查询，减少并发压力
        const categories = await pb.collection('product_categories').getList<ProductCategory>(1, 50, {
          filter: `parent_id="${parent.id}"`,
          sort: 'sort_order,name'
        });
        
        // 确保所有子分类都有必需的字段
        return categories.items.map(item => ({
          ...item,
          created: item.created || new Date().toISOString(),
          updated: item.updated || new Date().toISOString()
        }));
      } catch (error) {
        console.error('Failed to fetch child categories:', error);
        // 返回空数组而不是抛出错误，避免整个查询失败
        return [];
      }
    },
  },
}; 