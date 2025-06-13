import { pocketbaseClient } from '../../config/pocketbase.ts';

export const brandResolvers = {
  Query: {
    // 品牌查询
    brands: async (_: any, { query }: { query?: any }) => {
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
          options.sort = 'sort_order,name';
        }
        
        const result = await pb.collection('brands').getList(page, perPage, options);
        
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
        console.error('Failed to fetch brands:', error);
        throw new Error('Failed to fetch brands');
      }
    },

    brand: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('brands').getOne(id);
      } catch (error) {
        console.error('Failed to fetch brand:', error);
        return null;
      }
    },
  },

  Mutation: {
    createBrand: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('brands').create(input);
      } catch (error) {
        console.error('Failed to create brand:', error);
        throw new Error('Failed to create brand');
      }
    },

    updateBrand: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('brands').update(id, input);
      } catch (error) {
        console.error('Failed to update brand:', error);
        throw new Error('Failed to update brand');
      }
    },

    deleteBrand: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 检查是否有关联的产品
        const products = await pb.collection('products').getFullList({
          filter: `brand_id="${id}"`
        });
        
        if (products.length > 0) {
          throw new Error('Cannot delete brand with associated products');
        }
        
        await pb.collection('brands').delete(id);
        return true;
      } catch (error) {
        console.error('Failed to delete brand:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete brand');
      }
    },
  },
}; 