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
      const { page = 1, perPage = 20 } = input || {};
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 这里应该从统计表获取数据，暂时返回空数据
        return {
          items: [],
          pagination: {
            page,
            perPage,
            totalItems: 0,
            totalPages: 0
          }
        };
      } catch (error) {
        console.error('Error fetching recommendation stats:', error);
        throw new Error('Failed to fetch recommendation stats');
      }
    },

    previewRecommendation: async (
      parent: any,
      { input }: { input: any }
    ): Promise<any[]> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 这里应该根据推荐规则预览商品，暂时返回空数组
        return [];
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