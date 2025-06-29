import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';
import {
  ProductRecommendation,
  ProductRecommendationInput,
  ProductRecommendationQueryInput,
  ProductRecommendationUpdateInput,
  RecommendationOverviewStats as RecommendationStats
} from '../../types/recommendation.ts';

// 定义缺失的类型
interface RecommendationRule {
  id: string;
  name: string;
  type: string;
  status: string;
  created: string;
  updated: string;
}

// 扩展查询输入以包含status字段
interface ExtendedProductRecommendationQueryInput extends ProductRecommendationQueryInput {
  status?: string;
}

export const recommendationResolvers = {
  Query: {
    productRecommendations: async (
      parent: any,
      { input }: { input?: ExtendedProductRecommendationQueryInput }
    ): Promise<{ items: ProductRecommendation[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, type, status, position, sortBy = 'priority', sortOrder = 'asc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(`name ~ "${search}"`);
        }

        if (type) {
          filterParams.push(`type = "${type}"`);
        }

        if (status) {
          filterParams.push(`status = "${status}"`);
        }

        if (position) {
          filterParams.push(`position ~ "${position}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('recommendations').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
          expand: 'products'
        });

        return {
          items: result.items.map((item: any) => ({
            ...item,
            products: item.expand?.products || []
          })) as unknown as ProductRecommendation[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw new Error('Failed to fetch recommendations');
      }
    },

    productRecommendation: async (
      parent: any,
      { id }: { id: string }
    ): Promise<ProductRecommendation | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('recommendations').getOne(id, {
          expand: 'products'
        });

        return {
          ...result,
          products: result.expand?.products || []
        } as unknown as ProductRecommendation;
      } catch (error) {
        console.error('Error fetching recommendation:', error);
        return null;
      }
    },

    recommendationRules: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: RecommendationRule[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, type, status, sortBy = 'created', sortOrder = 'desc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(`name ~ "${search}"`);
        }

        if (type) {
          filterParams.push(`type = "${type}"`);
        }

        if (status) {
          filterParams.push(`status = "${status}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('recommendation_rules').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy
        });

        return {
          items: result.items as unknown as RecommendationRule[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching recommendation rules:', error);
        throw new Error('Failed to fetch recommendation rules');
      }
    },

    recommendationOverviewStats: async (): Promise<RecommendationStats> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const recommendations = await pb.collection('recommendations').getList(1, 1000);
        const totalClicks = recommendations.items.reduce((sum: number, rec: any) => sum + (rec.clicks || 0), 0);
        const totalViews = recommendations.items.reduce((sum: number, rec: any) => sum + (rec.views || 0), 0);

        return {
          totalRecommendations: recommendations.totalItems,
          activeRecommendations: recommendations.items.filter((rec: any) => rec.status === 'active').length,
          totalClicks,
          totalViews,
          totalConversions: 0,
          avgCtr: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
          avgConversionRate: 0,
          topPerforming: [],
          positionStats: {},
          typeStats: {}
        };
      } catch (error) {
        console.error('Error fetching recommendation stats:', error);
        throw new Error('Failed to fetch recommendation stats');
      }
    },

    recommendationRule: async (
      parent: any,
      { id }: { id: string }
    ): Promise<any | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('recommendation_rules').getOne(id);
        return result;
      } catch (error) {
        console.error('Error fetching recommendation template:', error);
        return null;
      }
    },

    recommendationStats: async (
      parent: any,
      { input }: { input: any }
    ): Promise<{ items: any[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, recommendation_id, start_date, end_date } = input || {};
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (recommendation_id) {
          filterParams.push(`recommendation_id = "${recommendation_id}"`);
        }

        if (start_date) {
          filterParams.push(`date >= "${start_date}"`);
        }

        if (end_date) {
          filterParams.push(`date <= "${end_date}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('recommendation_stats').getList(page, perPage, {
          filter,
          sort: '-date'
        });

        return {
          items: result.items,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching recommendation stats:', error);
        // 如果统计表不存在，返回空数据
        return {
          items: [],
          pagination: {
            page,
            perPage,
            totalItems: 0,
            totalPages: 0
          }
        };
      }
    },

    previewRecommendation: async (
      parent: any,
      { input }: { input: any }
    ): Promise<any[]> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const { type, position, product_ids, conditions, display_count = 10, sort_type = 'manual' } = input;

        let products: any[] = [];

        // 如果指定了商品ID，直接获取这些商品
        if (product_ids && product_ids.length > 0) {
          for (const productId of product_ids.slice(0, display_count)) {
            try {
              const product = await pb.collection('products').getOne(productId, {
                expand: 'category,brand'
              });
              products.push({
                ...product,
                category: product.expand?.category,
                brand: product.expand?.brand
              });
            } catch (error) {
              console.warn(`Product ${productId} not found`);
            }
          }
        } else {
          // 根据推荐类型和条件获取商品
          let filter = 'status = "active"';
          let sort = '';

          // 根据推荐类型设定过滤条件
          switch (type) {
            case 'hot_products':
              sort = '-sales_count';
              break;
            case 'new_products':
              sort = '-created';
              break;
            case 'recommended_products':
              filter += ' && is_featured = true';
              break;
            case 'category_based':
              if (conditions?.category_id) {
                filter += ` && category_id = "${conditions.category_id}"`;
              }
              break;
          }

          // 根据排序类型设定排序
          switch (sort_type) {
            case 'sales_desc':
              sort = '-sales_count';
              break;
            case 'price_asc':
              sort = 'price';
              break;
            case 'price_desc':
              sort = '-price';
              break;
            case 'created_desc':
              sort = '-created';
              break;
            case 'rating_desc':
              sort = '-rating';
              break;
            case 'random':
              // PocketBase不支持随机排序，使用created替代
              sort = '-created';
              break;
            default:
              sort = '-created';
          }

          const result = await pb.collection('products').getList(1, display_count, {
            filter,
            sort,
            expand: 'category,brand'
          });

          products = result.items.map((item: any) => ({
            ...item,
            category: item.expand?.category,
            brand: item.expand?.brand
          }));
        }

        return products;
      } catch (error) {
        console.error('Error previewing recommendation:', error);
        return [];
      }
    }
  },

  Mutation: {
    createProductRecommendation: async (
      parent: any,
      { input }: { input: ProductRecommendationInput }
    ): Promise<ProductRecommendation> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('recommendations').create(input);
        return result as unknown as ProductRecommendation;
      } catch (error) {
        console.error('Error creating recommendation:', error);
        throw new Error('Failed to create recommendation');
      }
    },

    updateProductRecommendation: async (
      parent: any,
      { id, input }: { id: string; input: ProductRecommendationUpdateInput }
    ): Promise<ProductRecommendation> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('recommendations').update(id, input);
        return result as unknown as ProductRecommendation;
      } catch (error) {
        console.error('Error updating recommendation:', error);
        throw new Error('Failed to update recommendation');
      }
    },

    deleteProductRecommendation: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('recommendations').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting recommendation:', error);
        return false;
      }
    },

    batchDeleteProductRecommendations: async (
      parent: any,
      { ids }: { ids: string[] }
    ): Promise<any> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];

        for (const id of ids) {
          try {
            await pb.collection('recommendations').delete(id);
            successCount++;
          } catch (error) {
            failureCount++;
            errors.push(`Failed to delete recommendation ${id}: ${error}`);
          }
        }

        return {
          success: failureCount === 0,
          message: `Deleted ${successCount} recommendations, ${failureCount} failed`,
          successCount,
          failureCount,
          errors
        };
      } catch (error) {
        console.error('Error batch deleting recommendations:', error);
        throw new Error('Failed to batch delete recommendations');
      }
    },

    createRecommendationRules: async (
      parent: any,
      { input }: { input: any }
    ): Promise<any> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('recommendation_templates').create(input);
        return result;
      } catch (error) {
        console.error('Error creating recommendation template:', error);
        throw new Error('Failed to create recommendation template');
      }
    },

    updateRecommendationRules: async (
      parent: any,
      { id, input }: { id: string; input: any }
    ): Promise<any> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('recommendation_templates').update(id, input);
        return result;
      } catch (error) {
        console.error('Error updating recommendation template:', error);
        throw new Error('Failed to update recommendation template');
      }
    },

    deleteRecommendationRules: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('recommendation_templates').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting recommendation template:', error);
        return false;
      }
    },

    duplicateRecommendation: async (
      parent: any,
      { id }: { id: string }
    ): Promise<any> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const original = await pb.collection('recommendations').getOne(id);
        const { id: originalId, ...duplicated } = original;
        duplicated.name = `${original.name} (副本)`;
        
        const result = await pb.collection('recommendations').create(duplicated);
        return result;
      } catch (error) {
        console.error('Error duplicating recommendation:', error);
        throw new Error('Failed to duplicate recommendation');
      }
    },

    reorderRecommendations: async (
      parent: any,
      { ids }: { ids: string[] }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        for (let i = 0; i < ids.length; i++) {
          await pb.collection('recommendations').update(ids[i], {
            sort_order: i + 1
          });
        }
        
        return true;
      } catch (error) {
        console.error('Error reordering recommendations:', error);
        return false;
      }
    }
  }
}; 