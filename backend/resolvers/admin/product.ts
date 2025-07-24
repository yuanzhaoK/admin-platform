import { z } from 'zod';
import { CacheStrategy, redisCache } from '../../cache/redis-cache.ts';
import { pocketbaseClient } from '../../config/pocketbase.ts';
import { Product, ProductQuery } from '../../types/product.ts';


// 产品查询参数验证
const productQuerySchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(['name', 'price', 'created', 'updated', 'stock']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// 产品创建参数验证
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().min(0),
  categoryId: z.string(),
  brandId: z.string(),
  images: z.array(z.string()).optional(),
  specifications: z.record(z.string()).optional(),
  isActive: z.boolean().default(true),
});
// 产品更新参数验证
const updateProductSchema = createProductSchema.partial();
// 产品管理解析器
export const productResolvers = {
  Query: {
    products: async (_: any, { query }:  { query: ProductQuery }) => {
      try {
        // 验证查询参数
        const validatedQuery = productQuerySchema.parse(query);
         // 生成缓存键
        const cacheKey = `products:${JSON.stringify(validatedQuery)}`;

        const pb = await pocketbaseClient.getClient();
           // 使用缓存策略获取数据
        const result = await redisCache.getWithStrategy(
          'PRODUCT',
          cacheKey,
          async () => {
            const pb = await pocketbaseClient.getClient();
            
            // 构建过滤条件
            const filter: string[] = [];
            
            if (validatedQuery.search) {
              filter.push(`(name~"${validatedQuery.search}" || description~"${validatedQuery.search}")`);
            }
            
            if (validatedQuery.categoryId) {
              filter.push(`categoryId="${validatedQuery.categoryId}"`);
            }
            
            if (validatedQuery.brandId) {
              filter.push(`brandId="${validatedQuery.brandId}"`);
            }
            
            if (validatedQuery.minPrice !== undefined) {
              filter.push(`price>=${validatedQuery.minPrice}`);
            }
            
            if (validatedQuery.maxPrice !== undefined) {
              filter.push(`price<=${validatedQuery.maxPrice}`);
            }
            
            if (validatedQuery.inStock !== undefined) {
              filter.push(validatedQuery.inStock ? 'stock>0' : 'stock=0');
            }
            
            // 构建排序
            const sort = validatedQuery.sortBy 
              ? ` ${validatedQuery.sortOrder==='asc' ? '' : '-'}${validatedQuery.sortBy}`
              : '-created';
            
            // 获取产品列表
            const response = await pb.collection('products').getList(
              validatedQuery.page,
              validatedQuery.perPage,
              {
                filter: filter.length > 0 ? filter.join(' && ') : undefined,
                sort,
                expand: 'categoryId,brandId',
              }
            );
            
            return {
              items: response.items as unknown as Product[],
              pagination: {
                page: response.page,
                perPage: response.perPage,
                totalItems: response.totalItems,
                totalPages: response.totalPages,
              },
            };
          },
          CacheStrategy.CACHE_FIRST,
          300 // 5分钟缓存
        );
        
        return result.data;
      } catch (error) {
        console.error('获取产品列表失败:', error);
        throw new Error('获取产品列表失败');
      }
    },

    product: async (_: any, { id }: { id: string }): Promise<Product | null> => {
      try {
        const result = await redisCache.getWithStrategy(
          'PRODUCT',
          `product:${id}`,
          async () => {
            const pb = await pocketbaseClient.getClient();
            const product = await pb.collection('products').getOne(id, {
              expand: 'categoryId,brandId',
            });
            return product as unknown as Product;
          },
          CacheStrategy.CACHE_FIRST,
          1800 // 30分钟缓存
        );
        
        return result.data;
      } catch (error) {
        console.error('获取产品详情失败:', error);
        throw new Error('获取产品详情失败');
        return null;
      }
    },

    // 获取产品统计（带缓存）
    productStats: async (): Promise<{
      totalProducts: number;
      activeProducts: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      totalValue: number;
    }> => {
      try {
        const result = await redisCache.getWithStrategy(
          'STATS',
          'product-stats',
          async () => {
            const pb = await pocketbaseClient.getClient();
            
            // 获取所有产品
            const products = await pb.collection('products').getFullList();
            
            const stats = {
              totalProducts: products.length,
              activeProducts: products.filter((p: any) => p.isActive).length,
              lowStockProducts: products.filter((p: any) => p.stock < 10 && p.stock > 0).length,
              outOfStockProducts: products.filter((p: any) => p.stock === 0).length,
              totalValue: products.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0),
            };
            
            return stats;
          },
          CacheStrategy.CACHE_FIRST,
          300 // 5分钟缓存
        );
        
        return result.data;
        
      } catch (error) {
        console.error('获取产品统计失败:', error);
        return {
          totalProducts: 0,
          activeProducts: 0,
          lowStockProducts: 0,
          outOfStockProducts: 0,
          totalValue: 0,
        };
      }
    },
     // 获取热门产品（带缓存）
    trendingProducts: async (_: any, { limit = 10 }: { limit?: number }): Promise<Product[]> => {
      try {
        const result = await redisCache.getWithStrategy(
          'PRODUCT',
          `trending:${limit}`,
          async () => {
            const pb = await pocketbaseClient.getClient();
            
            // 获取销量最高的产品
            const products = await pb.collection('products').getFullList({
              sort: '-sold',
              filter: 'isActive=true && stock>0',
              limit,
              expand: 'categoryId,brandId',
            });
            
            return products as unknown as Product[];
          },
          CacheStrategy.CACHE_FIRST,
          600 // 10分钟缓存
        );
        
        return result.data;
        
      } catch (error) {
        console.error('获取热门产品失败:', error);
        return [];
      }
    },
  },

  Mutation: {
    // 创建产品（清除相关缓存）
    createProduct: async (_: any, { input }: { input: any }): Promise<Product> => {
      try {
        // 验证输入
        const validatedInput = createProductSchema.parse(input);
        const pb = await pocketbaseClient.getClient();

        const product = await pb.collection('products').create(validatedInput);
        
        // 清除产品列表缓存
        await redisCache.delPattern('product:products:*');
        await redisCache.del('STATS', 'product-stats');
        
        return product as unknown as Product;
      } catch (error) {
        console.error('创建产品失败:', error);
        throw new Error('创建产品失败');
      }
    },

    // 更新产品（清除相关缓存）
    updateProduct: async (_: any, { id, input }: { id: string; input: any }): Promise<Product> => {
      try {
        // 验证输入
        const validatedInput = updateProductSchema.parse(input);
        
        const pb = await pocketbaseClient.getClient();
        const product = await pb.collection('products').update(id, validatedInput);
        
        // 清除缓存
        await redisCache.del('PRODUCT', `product:${id}`);
        await redisCache.delPattern('product:products:*');
        await redisCache.del('STATS', 'product-stats');
        await redisCache.delPattern('product:trending:*');
        
        return product as unknown as Product;
        
      } catch (error) {
        console.error('更新产品失败:', error);
        throw new Error(`更新产品失败: ${error}`);
      }
    },

    // 删除产品（清除相关缓存）
    deleteProduct: async (_: any, { id }: { id: string }): Promise<boolean> => {
      try {
        const pb = await pocketbaseClient.getClient();
        await pb.collection('products').delete(id);
        
        // 清除缓存
        await redisCache.del('PRODUCT', `product:${id}`);
        await redisCache.delPattern('product:products:*');
        await redisCache.del('STATS', 'product-stats');
        await redisCache.delPattern('product:trending:*');
        
        return true;
        
      } catch (error) {
        console.error('删除产品失败:', error);
        return false;
      }
    },
// 批量更新库存
    updateProductStock: async (
      _: any,
      { updates }: { updates: Array<{ id: string; stock: number }> }
    ): Promise<boolean> => {
      try {
        const pb = await pocketbaseClient.getClient();
        
        // 使用事务批量更新
        for (const update of updates) {
          await pb.collection('products').update(update.id, { stock: update.stock });
          
          // 清除单个产品缓存
          await redisCache.del('PRODUCT', `product:${update.id}`);
        }
        
        // 清除列表和统计缓存
        await redisCache.delPattern('product:products:*');
        await redisCache.del('STATS', 'product-stats');
        
        return true;
        
      } catch (error) {
        console.error('批量更新库存失败:', error);
        return false;
      }
    },
  },
};
