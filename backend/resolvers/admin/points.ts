import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';
import {
    PointsExchange,
    PointsExchangeInput,
    PointsRecord,
    PointsRule,
    PointsRuleInput,
    PointsRuleUpdateInput,
    PointsStats
} from '../../types/points.ts';

export const pointsResolvers = {
  Query: {
    pointsRules: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: PointsRule[]; pagination: PaginationInfo }> => {
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

        const result = await pb.collection('points_rules').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy
        });

        return {
          items: result.items as unknown as PointsRule[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching points rules:', error);
        throw new Error('Failed to fetch points rules');
      }
    },

    pointsExchanges: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: PointsExchange[]; pagination: PaginationInfo }> => {
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

        const result = await pb.collection('points_exchanges').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy
        });

        return {
          items: result.items as unknown as PointsExchange[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching points exchanges:', error);
        throw new Error('Failed to fetch points exchanges');
      }
    },

    pointsRecords: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: PointsRecord[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, member_id, type, sortBy = 'created', sortOrder = 'desc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (member_id) {
          filterParams.push(`member_id = "${member_id}"`);
        }

        if (type) {
          filterParams.push(`type = "${type}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('points_records').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
          expand: 'member_id'
        });

        return {
          items: result.items.map((item: any) => ({
            ...item,
            member: item.expand?.member_id || null
          })) as PointsRecord[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching points records:', error);
        throw new Error('Failed to fetch points records');
      }
    },

    pointsStats: async (): Promise<PointsStats> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const records = await pb.collection('points_records').getList(1, 1000);
        const totalEarned = records.items
          .filter((record: any) => record.type === 'earn')
          .reduce((sum: number, record: any) => sum + (record.points || 0), 0);
        
        const totalSpent = records.items
          .filter((record: any) => record.type === 'spend')
          .reduce((sum: number, record: any) => sum + (record.points || 0), 0);

        const currentMembers = await pb.collection('members').getList(1, 1000, { fields: 'points' });
        const totalPoints = currentMembers.items.reduce((sum: number, member: any) => sum + (member.points || 0), 0);

        return {
          totalPoints,
          totalUsers: currentMembers.totalItems,
          totalEarned,
          totalSpent,
          totalExpired: 0, // 需要实现过期积分统计
          ruleStats: {},
          exchangeStats: {},
          monthlyTrend: {}
        };
      } catch (error) {
        console.error('Error fetching points stats:', error);
        throw new Error('Failed to fetch points stats');
      }
    }
  },

  Mutation: {
    createPointsRule: async (
      parent: any,
      { input }: { input: PointsRuleInput }
    ): Promise<PointsRule> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('points_rules').create(input);
        return result as unknown as PointsRule;
      } catch (error) {
        console.error('Error creating points rule:', error);
        throw new Error('Failed to create points rule');
      }
    },

    updatePointsRule: async (
      parent: any,
      { id, input }: { id: string; input: PointsRuleUpdateInput }
    ): Promise<PointsRule> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('points_rules').update(id, input);
        return result as unknown as PointsRule;
      } catch (error) {
        console.error('Error updating points rule:', error);
        throw new Error('Failed to update points rule');
      }
    },

    createPointsExchange: async (
      parent: any,
      { input }: { input: PointsExchangeInput }
    ): Promise<PointsExchange> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('points_exchanges').create(input);
        return result as unknown as PointsExchange;
      } catch (error) {
        console.error('Error creating points exchange:', error);
        throw new Error('Failed to create points exchange');
      }
    }
  }
}; 