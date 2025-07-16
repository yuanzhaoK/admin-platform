import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';

export const advertisementResolvers = {
  Query: {
    advertisements: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: any[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, type, status, position, start_time, end_time, sortBy = 'created', sortOrder = 'desc' } = input || {};

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
          filterParams.push(`position = "${position}"`);
        }

        if (start_time && end_time) {
          filterParams.push(`start_time >= "${start_time}" && end_time <= "${end_time}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('advertisements').getList(page, perPage, {
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
        console.error('Error fetching advertisements:', error);
        throw new Error('Failed to fetch advertisements');
      }
    },

    advertisement: async (
      parent: any,
      { id }: { id: string }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('advertisements').getOne(id);
        return result;
      } catch (error) {
        console.error('Error fetching advertisement:', error);
        return null;
      }
    },

    adGroups: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: any[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, position, sortBy = 'created', sortOrder = 'desc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(`name ~ "${search}"`);
        }

        if (position) {
          filterParams.push(`position = "${position}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('ad_groups').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
          expand: 'ads'
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
        console.error('Error fetching ad groups:', error);
        throw new Error('Failed to fetch ad groups');
      }
    },

    adOverviewStats: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const ads = await pb.collection('advertisements').getFullList();
        
        const totalAds = ads.length;
        const activeAds = ads.filter((ad: any) => ad.status === 'active').length;
        const totalViews = ads.reduce((sum: number, ad: any) => sum + (ad.view_count || 0), 0);
        const totalClicks = ads.reduce((sum: number, ad: any) => sum + (ad.click_count || 0), 0);
        const totalCost = ads.reduce((sum: number, ad: any) => sum + (ad.cost || 0), 0);
        const avgCtr = totalViews > 0 ? (totalClicks / totalViews * 100) : 0;

        // 获取表现最好的广告
        const topPerforming = ads
          .sort((a: any, b: any) => (b.click_count || 0) - (a.click_count || 0))
          .slice(0, 5);

        // 按位置统计
        const positionStats = ads.reduce((acc: any, ad: any) => {
          const position = ad.position || 'unknown';
          if (!acc[position]) {
            acc[position] = { count: 0, clicks: 0, views: 0 };
          }
          acc[position].count++;
          acc[position].clicks += ad.click_count || 0;
          acc[position].views += ad.view_count || 0;
          return acc;
        }, {});

        // 按类型统计
        const typeStats = ads.reduce((acc: any, ad: any) => {
          const type = ad.type || 'unknown';
          if (!acc[type]) {
            acc[type] = { count: 0, clicks: 0, views: 0 };
          }
          acc[type].count++;
          acc[type].clicks += ad.click_count || 0;
          acc[type].views += ad.view_count || 0;
          return acc;
        }, {});

        // 生成近7天的模拟统计数据
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dailyStats.push({
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 10000) + 5000,
            clicks: Math.floor(Math.random() * 500) + 100,
            cost: Math.floor(Math.random() * 1000) + 200
          });
        }

        return {
          totalAds,
          activeAds,
          totalViews,
          totalClicks,
          totalCost,
          avgCtr: Number(avgCtr.toFixed(2)),
          topPerforming,
          positionStats,
          typeStats,
          dailyStats
        };
      } catch (error) {
        console.error('Error fetching ad overview stats:', error);
        throw new Error('Failed to fetch ad overview stats');
      }
    },

    previewAd: async (
      parent: any,
      { input }: { input: any }
    ) => {
      // 返回预览数据，不实际创建广告
      return {
        ...input,
        id: 'preview',
        click_count: 0,
        view_count: 0,
        cost: 0,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
    }
  },

  Mutation: {
    createAdvertisement: async (
      parent: any,
      { input }: { input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const adData = {
          ...input,
          click_count: 0,
          view_count: 0,
          cost: 0
        };

        const result = await pb.collection('advertisements').create(adData);
        return result;
      } catch (error) {
        console.error('Error creating advertisement:', error);
        throw new Error('Failed to create advertisement');
      }
    },

    updateAdvertisement: async (
      parent: any,
      { id, input }: { id: string; input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('advertisements').update(id, input);
        return result;
      } catch (error) {
        console.error('Error updating advertisement:', error);
        throw new Error('Failed to update advertisement');
      }
    },

    deleteAdvertisement: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('advertisements').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        return false;
      }
    },

    batchDeleteAdvertisements: async (
      parent: any,
      { ids }: { ids: string[] }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let success = 0;
        let failed = 0;

        for (const id of ids) {
          try {
            await pb.collection('advertisements').delete(id);
            success++;
          } catch {
            failed++;
          }
        }

        return {
          success,
          failed,
          total: ids.length,
          message: `成功删除 ${success} 个广告，失败 ${failed} 个`
        };
      } catch (error) {
        console.error('Error batch deleting advertisements:', error);
        throw new Error('Failed to batch delete advertisements');
      }
    },

    duplicateAdvertisement: async (
      parent: any,
      { id }: { id: string }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const original = await pb.collection('advertisements').getOne(id);
        
        const duplicateData: any = {
          ...original,
          name: `${original.name} (副本)`,
          status: 'inactive',
          click_count: 0,
          view_count: 0,
          cost: 0
        };

        // 移除ID和系统字段
        delete duplicateData.id;
        delete duplicateData.created;
        delete duplicateData.updated;
        delete duplicateData.collectionId;
        delete duplicateData.collectionName;

        const result = await pb.collection('advertisements').create(duplicateData);
        return result;
      } catch (error) {
        console.error('Error duplicating advertisement:', error);
        throw new Error('Failed to duplicate advertisement');
      }
    },

    pauseAdvertisement: async (
      parent: any,
      { id }: { id: string }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('advertisements').update(id, {
          status: 'paused'
        });
        return result;
      } catch (error) {
        console.error('Error pausing advertisement:', error);
        throw new Error('Failed to pause advertisement');
      }
    },

    resumeAdvertisement: async (
      parent: any,
      { id }: { id: string }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('advertisements').update(id, {
          status: 'active'
        });
        return result;
      } catch (error) {
        console.error('Error resuming advertisement:', error);
        throw new Error('Failed to resume advertisement');
      }
    }
  }
}; 