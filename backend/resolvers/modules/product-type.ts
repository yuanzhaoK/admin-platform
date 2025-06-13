import { pocketbaseClient } from '../../config/pocketbase.ts';

export const productTypeResolvers = {
  Query: {
    // 商品类型查询
    productTypes: async (_: any, { query }: { query?: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const page = query?.page || 1;
        const perPage = query?.perPage || 20;
        
        // 构建过滤条件
        const filters: string[] = [];
        if (query?.status) filters.push(`status="${query.status}"`);
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
          options.sort = 'name';
        }
        
        const result = await pb.collection('product_types').getList(page, perPage, options);
        
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
        console.error('Failed to fetch product types:', error);
        throw new Error('Failed to fetch product types');
      }
    },

    productType: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_types').getOne(id);
      } catch (error) {
        console.error('Failed to fetch product type:', error);
        return null;
      }
    },
  },

  Mutation: {
    createProductType: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_types').create(input);
      } catch (error) {
        console.error('Failed to create product type:', error);
        throw new Error('Failed to create product type');
      }
    },

    updateProductType: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_types').update(id, input);
      } catch (error) {
        console.error('Failed to update product type:', error);
        throw new Error('Failed to update product type');
      }
    },

    deleteProductType: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 检查是否有关联的产品
        const products = await pb.collection('products').getFullList({
          filter: `product_type_id="${id}"`
        });
        
        if (products.length > 0) {
          throw new Error('Cannot delete product type with associated products');
        }
        
        await pb.collection('product_types').delete(id);
        return true;
      } catch (error) {
        console.error('Failed to delete product type:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete product type');
      }
    },
  },
}; 