import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';
import {
  PointsExchange,
  PointsExchangeInput,
  PointsExchangeRecord,
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
          .filter((record: any) => record.type.startsWith('earned_'))
          .reduce((sum: number, record: any) => sum + (record.points || 0), 0);
        
        const totalSpent = records.items
          .filter((record: any) => record.type.startsWith('spent_'))
          .reduce((sum: number, record: any) => sum + Math.abs(record.points || 0), 0);

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
    },

    pointsRule: async (
      parent: any,
      { id }: { id: string }
    ): Promise<PointsRule | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('points_rules').getOne(id);
        return result as unknown as PointsRule;
      } catch (error) {
        console.error('Error fetching points rule:', error);
        return null;
      }
    },

    pointsExchange: async (
      parent: any,
      { id }: { id: string }
    ): Promise<PointsExchange | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('points_exchanges').getOne(id);
        return result as unknown as PointsExchange;
      } catch (error) {
        console.error('Error fetching points exchange:', error);
        return null;
      }
    },

    pointsExchangeRecords: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: PointsExchangeRecord[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, user_id, exchange_id, status, start_date, end_date, sortBy = 'created', sortOrder = 'desc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (user_id) {
          filterParams.push(`user_id = "${user_id}"`);
        }

        if (exchange_id) {
          filterParams.push(`exchange_id = "${exchange_id}"`);
        }

        if (status) {
          filterParams.push(`status = "${status}"`);
        }

        if (start_date) {
          filterParams.push(`created >= "${start_date}"`);
        }

        if (end_date) {
          filterParams.push(`created <= "${end_date}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('points_exchange_records').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
          expand: 'exchange_id,user_id'
        });

        return {
          items: result.items.map((item: any) => ({
            ...item,
            exchange: item.expand?.exchange_id || null,
            username: item.expand?.user_id?.username || item.expand?.user_id?.name || '未知用户'
          })) as PointsExchangeRecord[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching points exchange records:', error);
        throw new Error('Failed to fetch points exchange records');
      }
    },

    // 积分规则模板查询
    pointsRuleTemplates: async (parent: any, args: any, context: any) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const { input = {} } = args;
        const {
          page = 1,
          perPage = 20,
          search,
          category,
          is_public,
          created_by,
          sortBy = "created",
          sortOrder = "desc",
        } = input;

        let filter = "";
        const conditions: string[] = [];

        if (search) {
          conditions.push(`(name ~ "${search}" || description ~ "${search}")`);
        }

        if (category) {
          conditions.push(`category = "${category}"`);
        }

        if (is_public !== undefined) {
          conditions.push(`is_public = ${is_public}`);
        }

        if (created_by) {
          conditions.push(`created_by = "${created_by}"`);
        }

        if (conditions.length > 0) {
          filter = conditions.join(" && ");
        }

        const result = await pb.collection("points_rule_templates").getList(page, perPage, {
          filter,
          sort: `${sortOrder === "desc" ? "-" : ""}${sortBy}`,
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
        console.error('Error fetching points rule templates:', error);
        throw new Error('Failed to fetch points rule templates');
      }
    },

    // 单个积分规则模板查询
    pointsRuleTemplate: async (parent: any, { id }: { id: string }, context: any) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection("points_rule_templates").getOne(id);
        return result;
      } catch (error) {
        console.error('Error fetching points rule template:', error);
        throw new Error('Failed to fetch points rule template');
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
    },

    updatePointsExchange: async (
      parent: any,
      { id, input }: { id: string; input: PointsExchangeInput }
    ): Promise<PointsExchange> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('points_exchanges').update(id, input);
        return result as unknown as PointsExchange;
      } catch (error) {
        console.error('Error updating points exchange:', error);
        throw new Error('Failed to update points exchange');
      }
    },

    deletePointsRule: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('points_rules').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting points rule:', error);
        throw new Error('Failed to delete points rule');
      }
    },

    deletePointsExchange: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('points_exchanges').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting points exchange:', error);
        throw new Error('Failed to delete points exchange');
      }
    },

    adjustUserPointsRecord: async (
      parent: any,
      { user_id, points, reason }: { user_id: string; points: number; reason: string }
    ): Promise<PointsRecord> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取用户当前积分余额
        const member = await pb.collection('members').getOne(user_id);
        const currentBalance = member.points || 0;
        const newBalance = currentBalance + points;
        
        // 更新用户积分余额
        await pb.collection('members').update(user_id, { points: newBalance });
        
        // 创建积分记录
        const recordData = {
          member_id: user_id,
          type: 'admin_adjust',
          points,
          balance: newBalance,
          reason,
        };
        
        const result = await pb.collection('points_records').create(recordData);
        
        // 获取用户信息用于返回
        const memberData = await pb.collection('members').getOne(user_id);
        
        return {
          ...result,
          user_id,
          username: memberData.username || memberData.name || '未知用户',
        } as unknown as PointsRecord;
      } catch (error) {
        console.error('Error adjusting user points:', error);
        throw new Error('Failed to adjust user points');
      }
    },

    batchAdjustPoints: async (
      parent: any,
      { user_ids, points, reason }: { user_ids: string[]; points: number; reason: string }
    ): Promise<{ success: boolean; processedCount: number; errors: string[] }> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let processedCount = 0;
        const errors: string[] = [];
        
        for (const user_id of user_ids) {
          try {
            // 获取用户当前积分余额
            const member = await pb.collection('members').getOne(user_id);
            const currentBalance = member.points || 0;
            const newBalance = currentBalance + points;
            
            // 更新用户积分余额
            await pb.collection('members').update(user_id, { points: newBalance });
            
            // 创建积分记录
            const recordData = {
              member_id: user_id,
              type: 'admin_adjust',
              points,
              balance: newBalance,
              reason,
            };
            
            await pb.collection('points_records').create(recordData);
            processedCount++;
          } catch (error) {
            errors.push(`用户 ${user_id}: ${error}`);
          }
        }
        
        return {
          success: errors.length === 0,
          processedCount,
          errors,
        };
      } catch (error) {
        console.error('Error batch adjusting points:', error);
        throw new Error('Failed to batch adjust points');
      }
    },

    exportPointsRecords: async (
      parent: any,
      { input }: { input: any }
    ): Promise<{ headers: string[]; rows: any[][]; total: number; filename: string }> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const {
          username,
          user_id,
          type,
          points_min,
          points_max,
          date_from,
          date_to,
          sortBy = "created",
          sortOrder = "desc",
        } = input || {};

        let filter = "";
        const conditions: string[] = [];

        if (username) {
          conditions.push(`username ~ "${username}"`);
        }

        if (user_id) {
          conditions.push(`user_id = "${user_id}"`);
        }

        if (type) {
          conditions.push(`type = "${type}"`);
        }

        if (points_min !== undefined) {
          conditions.push(`points >= ${points_min}`);
        }

        if (points_max !== undefined) {
          conditions.push(`points <= ${points_max}`);
        }

        if (date_from) {
          conditions.push(`created >= "${date_from} 00:00:00"`);
        }

        if (date_to) {
          conditions.push(`created <= "${date_to} 23:59:59"`);
        }

        if (conditions.length > 0) {
          filter = conditions.join(" && ");
        }

        // 导出所有符合条件的记录，不分页
        const records = await pb.collection("points_records").getFullList({
          filter,
          sort: `${sortOrder === "desc" ? "-" : ""}${sortBy}`,
        });

        // 生成CSV格式数据
        const csvHeaders = ["用户ID", "用户名", "积分类型", "积分变动", "余额", "原因", "创建时间"];
        const csvRows = records.map((record: any) => [
          record.user_id || record.member_id,
          record.username || "未知用户",
          record.type,
          record.points,
          record.balance,
          record.reason,
          record.created,
        ]);

        return {
          headers: csvHeaders,
          rows: csvRows,
          total: records.length,
          filename: `积分记录_${new Date().toISOString().split('T')[0]}.csv`,
        };
      } catch (error) {
        console.error("导出积分记录失败:", error);
        throw new Error("导出积分记录失败");
      }
    },

    // 创建积分规则模板
    createPointsRuleTemplate: async (
      parent: any,
      { input }: { input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取当前用户ID (这里假设从context中获取，实际需要根据认证系统调整)
        const currentUserId = "admin"; // TODO: 从认证上下文获取真实用户ID
        
        const templateData = {
          ...input,
          created_by: currentUserId,
          usage_count: 0,
        };
        
        const result = await pb.collection('points_rule_templates').create(templateData);
        return result;
      } catch (error) {
        console.error('Error creating points rule template:', error);
        throw new Error('Failed to create points rule template');
      }
    },

    // 更新积分规则模板
    updatePointsRuleTemplate: async (
      parent: any,
      { id, input }: { id: string; input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('points_rule_templates').update(id, input);
        return result;
      } catch (error) {
        console.error('Error updating points rule template:', error);
        throw new Error('Failed to update points rule template');
      }
    },

    // 删除积分规则模板
    deletePointsRuleTemplate: async (
      parent: any,
      { id }: { id: string }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('points_rule_templates').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting points rule template:', error);
        throw new Error('Failed to delete points rule template');
      }
    },

    // 应用积分规则模板
    applyPointsRuleTemplate: async (
      parent: any,
      { template_id, rule_input }: { template_id: string; rule_input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取模板数据
        const template = await pb.collection('points_rule_templates').getOne(template_id);
        
        // 合并模板数据和用户输入
        const mergedData = {
          ...template.template_data,
          ...rule_input,
        };
        
        // 创建新的积分规则
        const result = await pb.collection('points_rules').create(mergedData);
        
        // 增加模板使用次数
        await pb.collection('points_rule_templates').update(template_id, {
          usage_count: template.usage_count + 1,
        });
        
        return result;
      } catch (error) {
        console.error('Error applying points rule template:', error);
        throw new Error('Failed to apply points rule template');
      }
    }
  }
}; 