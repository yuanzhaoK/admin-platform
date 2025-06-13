import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { ProductCategory } from '../../types/index.ts';

export const categoryResolvers = {
  Query: {
    // 分类查询
    productCategories: async (_: any, { query }: { query?: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const page = query?.page || 1;
        const perPage = query?.perPage || 20;
        
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
        
        // 展开关联数据
        options.expand = 'parent';
        
        const result = await pb.collection('product_categories').getList<ProductCategory>(page, perPage, options);
        
        return {
          items: result.items,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems
          }
        };
      } catch (error) {
        console.error('Failed to fetch product categories:', error);
        throw new Error('Failed to fetch product categories');
      }
    },

    productCategory: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_categories').getOne<ProductCategory>(id, {
          expand: 'parent'
        });
      } catch (error) {
        console.error('Failed to fetch product category:', error);
        return null;
      }
    },

    // 分类树结构
    productCategoryTree: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取所有分类
        const categories = await pb.collection('product_categories').getFullList<ProductCategory>({
          sort: 'sort_order,name'
        });
        
        // 构建树结构
        const categoryMap = new Map<string, ProductCategory>();
        const rootCategories: ProductCategory[] = [];
        
        // 第一次遍历：创建映射
        categories.forEach(category => {
          categoryMap.set(category.id, { ...category, children: [] });
        });
        
        // 第二次遍历：构建树结构
        categories.forEach(category => {
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
  },

  Mutation: {
    createProductCategory: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_categories').create<ProductCategory>(input);
      } catch (error) {
        console.error('Failed to create product category:', error);
        throw new Error('Failed to create product category');
      }
    },

    updateProductCategory: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_categories').update<ProductCategory>(id, input);
      } catch (error) {
        console.error('Failed to update product category:', error);
        throw new Error('Failed to update product category');
      }
    },

    deleteProductCategory: async (_: any, { id }: { id: string }) => {
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
  },

  // 类型解析器
  ProductCategory: {
    parent: async (parent: ProductCategory) => {
      if (!parent.parent_id) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_categories').getOne<ProductCategory>(parent.parent_id);
      } catch (error) {
        console.error('Failed to fetch parent category:', error);
        return null;
      }
    },
    
    children: async (parent: ProductCategory) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_categories').getFullList<ProductCategory>({
          filter: `parent_id="${parent.id}"`,
          sort: 'sort_order,name'
        });
      } catch (error) {
        console.error('Failed to fetch child categories:', error);
        return [];
      }
    },
  },
}; 