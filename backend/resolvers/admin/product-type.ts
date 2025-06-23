import { pocketbaseClient } from '../../config/pocketbase.ts';

export const productTypeResolvers = {
  Query: {
    // 商品类型查询
    productTypes: async (_: any, { query }: { query?: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 使用请求队列来避免并发冲突
        const result = await pocketbaseClient.queueRequest(async () => {
          const page = Math.max(1, query?.page || 1);
          const perPage = Math.max(1, Math.min(100, query?.perPage || 20));
          
          // 构建过滤条件
          const filters: string[] = [];
          if (query?.is_active !== undefined) {
            const status = query.is_active ? 'active' : 'inactive';
            filters.push(`status="${status}"`);
          }
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
          
          return await pb.collection('product_types').getList(page, perPage, options);
        });
        
        // 处理attributes字段和字段映射
        const processedItems = result.items.map(item => ({
          ...item,
          // 字段映射：数据库字段 -> GraphQL字段
          is_active: item.status === 'active',
          slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '-'),
          attributes: typeof item.attributes === 'string' ? JSON.parse(item.attributes || '[]') : (item.attributes || []),
          created: item.created || new Date().toISOString(),
          updated: item.updated || new Date().toISOString()
        }));
        
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
        console.error('Failed to fetch product types:', error);
        throw new Error('Failed to fetch product types');
      }
    },

    productType: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pocketbaseClient.queueRequest(async () => {
          return await pb.collection('product_types').getOne(id);
        });
        
        // 处理attributes字段和字段映射
        return {
          ...result,
          // 字段映射：数据库字段 -> GraphQL字段
          is_active: result.status === 'active',
          slug: result.slug || result.name.toLowerCase().replace(/\s+/g, '-'),
          attributes: typeof result.attributes === 'string' ? JSON.parse(result.attributes || '[]') : (result.attributes || [])
        };
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
        
        // 字段映射和序列化attributes字段
        const processedInput = {
          ...input,
          // 字段映射：GraphQL字段 -> 数据库字段
          status: input.is_active ? 'active' : 'inactive',
          attributes: input.attributes ? JSON.stringify(input.attributes) : null
        };
        
        // 移除GraphQL专用字段
        delete processedInput.is_active;
        
        const result = await pocketbaseClient.queueRequest(async () => {
          return await pb.collection('product_types').create(processedInput);
        });
        
        // 处理返回的attributes字段和字段映射
        return {
          ...result,
          // 字段映射：数据库字段 -> GraphQL字段
          is_active: result.status === 'active',
          slug: result.slug || result.name.toLowerCase().replace(/\s+/g, '-'),
          attributes: typeof result.attributes === 'string' ? JSON.parse(result.attributes || '[]') : (result.attributes || [])
        };
      } catch (error) {
        console.error('Failed to create product type:', error);
        throw new Error('Failed to create product type');
      }
    },

    updateProductType: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 字段映射和序列化attributes字段
        const processedInput = {
          ...input,
          // 字段映射：GraphQL字段 -> 数据库字段
          status: input.is_active !== undefined ? (input.is_active ? 'active' : 'inactive') : undefined,
          attributes: input.attributes ? JSON.stringify(input.attributes) : null
        };
        
        // 移除GraphQL专用字段
        delete processedInput.is_active;
        
        const result = await pocketbaseClient.queueRequest(async () => {
          return await pb.collection('product_types').update(id, processedInput);
        });
        
        // 处理返回的attributes字段和字段映射
        return {
          ...result,
          // 字段映射：数据库字段 -> GraphQL字段
          is_active: result.status === 'active',
          slug: result.slug || result.name.toLowerCase().replace(/\s+/g, '-'),
          attributes: typeof result.attributes === 'string' ? JSON.parse(result.attributes || '[]') : (result.attributes || [])
        };
      } catch (error) {
        console.error('Failed to update product type:', error);
        throw new Error('Failed to update product type');
      }
    },

    deleteProductType: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pocketbaseClient.queueRequest(async () => {
          // 检查是否有关联的产品
          const products = await pb.collection('products').getFullList({
            filter: `product_type_id="${id}"`
          });
          
          if (products.length > 0) {
            throw new Error('Cannot delete product type with associated products');
          }
          
          await pb.collection('product_types').delete(id);
        });
        
        return {
          success: true,
          message: 'Product type deleted successfully'
        };
      } catch (error) {
        console.error('Failed to delete product type:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to delete product type');
      }
    },
  },
}; 