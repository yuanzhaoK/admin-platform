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
        
        // 确保所有品牌都有必需的字段，并映射字段名
        const processedItems = result.items.map(item => ({
          ...item,
          is_active: item.status === 'active',
          slug: item.name?.toLowerCase().replace(/\s+/g, '-') || '',
          meta_title: item.seo_title || item.name,
          meta_description: item.seo_description || item.description,
          products_count: 0, // 默认值，可后续计算
          created: item.created || new Date().toISOString(),
          updated: item.updated || new Date().toISOString()
        }));
        
        return {
          items: processedItems,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            total: result.totalItems,
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            hasNext: result.page < result.totalPages,
            hasPrev: result.page > 1
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
        const brand = await pb.collection('brands').getOne(id);
        
        // 确保品牌有必需的字段，并映射字段名
        return {
          ...brand,
          is_active: brand.status === 'active',
          slug: brand.name?.toLowerCase().replace(/\s+/g, '-') || '',
          meta_title: brand.seo_title || brand.name,
          meta_description: brand.seo_description || brand.description,
          products_count: 0,
          created: brand.created || new Date().toISOString(),
          updated: brand.updated || new Date().toISOString()
        };
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
        
        // 将GraphQL输入映射到数据库字段
        const dbInput = {
          ...input,
          status: input.is_active ? 'active' : 'inactive',
          seo_title: input.meta_title,
          seo_description: input.meta_description
        };
        delete dbInput.is_active;
        delete dbInput.meta_title;
        delete dbInput.meta_description;
        
        const brand = await pb.collection('brands').create(dbInput);
        
        // 确保有必需的字段，并映射字段名
        return {
          ...brand,
          is_active: brand.status === 'active',
          slug: brand.name?.toLowerCase().replace(/\s+/g, '-') || '',
          meta_title: brand.seo_title || brand.name,
          meta_description: brand.seo_description || brand.description,
          products_count: 0,
          created: brand.created || new Date().toISOString(),
          updated: brand.updated || new Date().toISOString()
        };
      } catch (error) {
        console.error('Failed to create brand:', error);
        throw new Error('Failed to create brand');
      }
    },

    updateBrand: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 将GraphQL输入映射到数据库字段
        const dbInput = {
          ...input,
          status: input.is_active !== undefined ? (input.is_active ? 'active' : 'inactive') : undefined,
          seo_title: input.meta_title,
          seo_description: input.meta_description
        };
        delete dbInput.is_active;
        delete dbInput.meta_title;
        delete dbInput.meta_description;
        
        const brand = await pb.collection('brands').update(id, dbInput);
        
        // 确保有必需的字段，并映射字段名
        return {
          ...brand,
          is_active: brand.status === 'active',
          slug: brand.name?.toLowerCase().replace(/\s+/g, '-') || '',
          meta_title: brand.seo_title || brand.name,
          meta_description: brand.seo_description || brand.description,
          products_count: 0,
          created: brand.created || new Date().toISOString(),
          updated: brand.updated || new Date().toISOString()
        };
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
        return {
          success: true,
          message: 'Brand deleted successfully'
        };
      } catch (error) {
        console.error('Failed to delete brand:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete brand');
      }
    },
  },
}; 