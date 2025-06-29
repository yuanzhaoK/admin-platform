import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';

export const trendingResolvers = {
  Query: {
    trendingItems: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: any[]; pagination: PaginationInfo }> => {
      const { 
        page = 1, 
        perPage = 20, 
        search, 
        type, 
        category, 
        status, 
        score_min, 
        score_max, 
        rank_min, 
        rank_max, 
        sortBy = 'rank', 
        sortOrder = 'asc' 
      } = input || {};

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

        if (category) {
          filterParams.push(`category ~ "${category}"`);
        }

        if (status) {
          filterParams.push(`status = "${status}"`);
        }

        if (score_min !== undefined && score_min !== null) {
          filterParams.push(`score >= ${score_min}`);
        }

        if (score_max !== undefined && score_max !== null) {
          filterParams.push(`score <= ${score_max}`);
        }

        if (rank_min !== undefined && rank_min !== null) {
          filterParams.push(`rank >= ${rank_min}`);
        }

        if (rank_max !== undefined && rank_max !== null) {
          filterParams.push(`rank <= ${rank_max}`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('trending_items').getList(page, perPage, {
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
        
        // 获取所有热门项目
        const itemsResult = await pb.collection('trending_items').getList(1, 1000);
        const items = itemsResult.items;
        
        // 计算基础统计
        const totalItems = items.length;
        const activeItems = items.filter((item: any) => item.status === 'active').length;
        
        // 获取前10个热门项目
        const topTrending = items
          .filter((item: any) => item.status === 'active')
          .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
          .slice(0, 10);
        
        // 按分类统计
        const categoryStats: { [key: string]: { count: number; avgScore: number } } = {};
        items.forEach((item: any) => {
          const category = item.category || '未分类';
          if (!categoryStats[category]) {
            categoryStats[category] = { count: 0, avgScore: 0 };
          }
          categoryStats[category].count++;
          categoryStats[category].avgScore += item.score || 0;
        });
        
        // 计算分类平均分数
        Object.keys(categoryStats).forEach(category => {
          categoryStats[category].avgScore = categoryStats[category].avgScore / categoryStats[category].count;
        });
        
        // 按类型统计
        const typeStats: { [key: string]: { count: number; avgScore: number } } = {};
        items.forEach((item: any) => {
          const type = item.type || '未知';
          if (!typeStats[type]) {
            typeStats[type] = { count: 0, avgScore: 0 };
          }
          typeStats[type].count++;
          typeStats[type].avgScore += item.score || 0;
        });
        
        // 计算类型平均分数
        Object.keys(typeStats).forEach(type => {
          typeStats[type].avgScore = typeStats[type].avgScore / typeStats[type].count;
        });
        
        // 模拟时间趋势数据（应该从实际统计表获取）
        const today = new Date();
        const dailyTrends: { [key: string]: number } = {};
        const weeklyTrends: { [key: string]: number } = {};
        const monthlyTrends: { [key: string]: number } = {};
        
        // 生成过去30天的数据
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          dailyTrends[dateStr] = Math.floor(Math.random() * 1000) + 500;
        }
        
        // 生成过去12周的数据
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - (i * 7));
          const weekStr = `第${52 - i}周`;
          weeklyTrends[weekStr] = Math.floor(Math.random() * 5000) + 2000;
        }
        
        // 生成过去12个月的数据
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(date.getMonth() - i);
          const monthStr = date.toISOString().substring(0, 7);
          monthlyTrends[monthStr] = Math.floor(Math.random() * 20000) + 10000;
        }
        
        return {
          totalItems,
          activeItems,
          totalViews: items.reduce((sum: number, item: any) => sum + (item.view_count || 0), 0),
          totalClicks: items.reduce((sum: number, item: any) => sum + (item.click_count || 0), 0),
          topTrending,
          categoryStats,
          typeStats,
          dailyTrends,
          weeklyTrends,
          monthlyTrends
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