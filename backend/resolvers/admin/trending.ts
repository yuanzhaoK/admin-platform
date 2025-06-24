import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';

export const trendingResolvers = {
  Query: {
    trendingItems: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: any[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, type, source, sortBy = 'rank', sortOrder = 'asc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(`product_name ~ "${search}"`);
        }

        if (type) {
          filterParams.push(`type = "${type}"`);
        }

        if (source) {
          filterParams.push(`source = "${source}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('trending_items').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
          expand: 'product_id'
        });

        return {
          items: result.items.map((item: any) => ({
            ...item,
            product: item.expand?.product_id || null
          })),
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching trending items:', error);
        throw new Error('Failed to fetch trending items');
      }
    },

    trendingRules: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: any[]; pagination: PaginationInfo }> => {
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

        const result = await pb.collection('trending_rules').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy
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
        console.error('Error fetching trending rules:', error);
        throw new Error('Failed to fetch trending rules');
      }
    },

    trendingItem: async (
      parent: any,
      { id }: { id: string }
    ): Promise<any | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('trending_items').getOne(id, {
          expand: 'product_id'
        });

        return {
          ...result,
          product: result.expand?.product_id || null
        };
      } catch (error) {
        console.error('Error fetching trending item:', error);
        return null;
      }
    },

    trendingRule: async (
      parent: any,
      { id }: { id: string }
    ): Promise<any | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('trending_rules').getOne(id);
        return result;
      } catch (error) {
        console.error('Error fetching trending rule:', error);
        return null;
      }
    },

    trendingStats: async (
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
        console.error('Error fetching trending stats:', error);
        throw new Error('Failed to fetch trending stats');
      }
    },

    trendingOverviewStats: async (): Promise<any> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const items = await pb.collection('trending_items').getList(1, 1000);
        
        return {
          totalItems: items.totalItems,
          activeItems: items.items.filter((item: any) => item.status === 'active').length,
          totalViews: 0,
          totalClicks: 0,
          topTrending: items.items.slice(0, 10),
          categoryStats: {},
          typeStats: {},
          dailyTrends: {},
          weeklyTrends: {},
          monthlyTrends: {}
        };
      } catch (error) {
        console.error('Error fetching trending overview stats:', error);
        throw new Error('Failed to fetch trending overview stats');
      }
    },

    calculateTrendingScore: async (
      parent: any,
      { item_id, type }: { item_id: string; type: string }
    ): Promise<number> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 这里应该实现实际的趋势分数计算逻辑
        // 暂时返回随机分数
        return Math.random() * 100;
      } catch (error) {
        console.error('Error calculating trending score:', error);
        return 0;
      }
    }
  },

  Mutation: {
    createTrendingItem: async (
      parent: any,
      { input }: { input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('trending_items').create(input);
        return result;
      } catch (error) {
        console.error('Error creating trending item:', error);
        throw new Error('Failed to create trending item');
      }
    },

    updateTrendingItem: async (
      parent: any,
      { id, input }: { id: string; input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('trending_items').update(id, input);
        return result;
      } catch (error) {
        console.error('Error updating trending item:', error);
        throw new Error('Failed to update trending item');
      }
    },

    deleteTrendingItem: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('trending_items').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting trending item:', error);
        return false;
      }
    },

    batchDeleteTrendingItems: async (
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
            await pb.collection('trending_items').delete(id);
            successCount++;
          } catch (error) {
            failureCount++;
            errors.push(`Failed to delete trending item ${id}: ${error}`);
          }
        }

        return {
          success: failureCount === 0,
          message: `Deleted ${successCount} trending items, ${failureCount} failed`,
          successCount,
          failureCount,
          errors
        };
      } catch (error) {
        console.error('Error batch deleting trending items:', error);
        throw new Error('Failed to batch delete trending items');
      }
    },

    createTrendingRules: async (
      parent: any,
      { input }: { input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('trending_rules').create(input);
        return result;
      } catch (error) {
        console.error('Error creating trending rules:', error);
        throw new Error('Failed to create trending rules');
      }
    },

    updateTrendingRules: async (
      parent: any,
      { id, input }: { id: string; input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('trending_rules').update(id, input);
        return result;
      } catch (error) {
        console.error('Error updating trending rules:', error);
        throw new Error('Failed to update trending rules');
      }
    },

    deleteTrendingRules: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('trending_rules').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting trending rules:', error);
        return false;
      }
    },

    refreshTrendingScores: async (
      parent: any,
      { category_id }: { category_id?: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 这里应该实现刷新趋势分数的逻辑
        // 暂时返回true
        return true;
      } catch (error) {
        console.error('Error refreshing trending scores:', error);
        return false;
      }
    },

    updateTrendingRanks: async (
      parent: any,
      { category_id }: { category_id?: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 这里应该实现更新趋势排名的逻辑
        // 暂时返回true
        return true;
      } catch (error) {
        console.error('Error updating trending ranks:', error);
        return false;
      }
    },

    addToTrending: async (
      parent: any,
      { item_id, type, category }: { item_id: string; type: string; category: string }
    ): Promise<any> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const input = {
          item_id,
          type,
          category,
          status: 'active',
          score: Math.random() * 100,
          rank: 0
        };
        
        const result = await pb.collection('trending_items').create(input);
        return result;
      } catch (error) {
        console.error('Error adding to trending:', error);
        throw new Error('Failed to add to trending');
      }
    },

    removeFromTrending: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('trending_items').delete(id);
        return true;
      } catch (error) {
        console.error('Error removing from trending:', error);
        return false;
      }
    }
  }
}; 