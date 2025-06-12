import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { Product, ProductQuery, ProductStats } from '../../types/index.ts';

export const productResolvers = {
  Query: {
    // 产品查询
    products: async (_: any, { query }: { query?: ProductQuery }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const page = query?.page || 1;
        const perPage = query?.perPage || 20;
        
        // 构建过滤条件
        const filters: string[] = [];
        if (query?.status) filters.push(`status="${query.status}"`);
        if (query?.category) filters.push(`category="${query.category}"`);
        if (query?.search) {
          filters.push(`(name~"${query.search}" || description~"${query.search}" || sku~"${query.search}")`);
        }
        
        const options: any = {};
        if (filters.length > 0) {
          options.filter = filters.join(' && ');
        }
        
        // 排序
        if (query?.sortBy) {
          const sortOrder = query.sortOrder === 'asc' ? '' : '-';
          options.sort = `${sortOrder}${query.sortBy}`;
        }
        
        const result = await pb.collection('products').getList<Product>(page, perPage, options);
        
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
        console.error('Failed to fetch products:', error);
        throw new Error('Failed to fetch products');
      }
    },

    product: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('products').getOne<Product>(id);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
      }
    },

    productStats: async (): Promise<ProductStats> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const products = await pb.collection('products').getFullList<Product>();
        
        const stats: ProductStats = {
          total: products.length,
          active: 0,
          inactive: 0,
          draft: 0,
          categories: {},
          avgPrice: 0,
          totalStock: 0
        };

        let totalPrice = 0;
        let priceCount = 0;

        products.forEach(product => {
          // 统计状态
          stats[product.status]++;
          
          // 统计分类
          if (product.category) {
            stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
          }
          
          // 统计价格
          if (product.price) {
            totalPrice += product.price;
            priceCount++;
          }
          
          // 统计库存
          if (product.stock && stats.totalStock !== undefined) {
            stats.totalStock += product.stock;
          }
        });

        stats.avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;

        return stats;
      } catch (error) {
        console.error('Failed to fetch product stats:', error);
        throw new Error('Failed to fetch product stats');
      }
    },
  },

  Mutation: {
    // 产品变更
    createProduct: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('products').create<Product>(input);
      } catch (error) {
        console.error('Failed to create product:', error);
        throw new Error('Failed to create product');
      }
    },

    updateProduct: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('products').update<Product>(id, input);
      } catch (error) {
        console.error('Failed to update product:', error);
        throw new Error('Failed to update product');
      }
    },

    deleteProduct: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        await pb.collection('products').delete(id);
        return true;
      } catch (error) {
        console.error('Failed to delete product:', error);
        return false;
      }
    },
  }
}; 