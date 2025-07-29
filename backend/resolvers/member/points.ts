/**
 * 积分系统 Resolvers
 * @description 处理积分记录、规则、兑换等操作
 */

import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { 
  PointsRecord,
  PointsRule,
  PointsExchange,
  PointsExchangeRecord,
  UserPointsOverview,
  PointsRecordQueryInput,
  PointsRuleQueryInput,
  PointsExchangeQueryInput,
  PointsExchangeRecordQueryInput,
  PointsRecordsResponse,
  PointsRulesResponse,
  PointsExchangesResponse,
  PointsExchangeRecordsResponse,
  PointsStatsResponse,
  PointsAdjustmentInput,
  PointsRuleCreateInput,
  PointsRuleUpdateInput,
  PointsExchangeCreateInput,
  PointsExchangeUpdateInput
} from '../../types/member/index.ts';

// 积分服务工具函数
class PointsService {
  /**
   * 根据 ID 查找积分记录
   */
  static async findRecordById(id: string): Promise<PointsRecord | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('points_records').getOne(id);
      return PointsService.formatPointsRecord(record);
    } catch (error) {
      console.error('Failed to find points record by ID:', error);
      return null;
    }
  }

  /**
   * 查询积分记录列表
   */
  static async findRecords(query: PointsRecordQueryInput): Promise<PointsRecordsResponse> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const filter = PointsService.buildRecordQueryFilter(query);
      const page = query.page || 1;
      const perPage = query.perPage || 20;
      const sort = PointsService.buildSort(query, 'created');
      
      const result = await pb.collection('points_records').getList(page, perPage, {
        filter,
        sort
      });
      
      const items = result.items.map(PointsService.formatPointsRecord);
      
      return {
        items,
        pagination: {
          page: result.page,
          perPage: result.perPage,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        }
      };
    } catch (error) {
      console.error('Failed to query points records:', error);
      throw new Error('查询积分记录失败');
    }
  }

  /**
   * 获取用户积分概览
   */
  static async getUserPointsOverview(userId: string): Promise<UserPointsOverview> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 获取用户信息
      const user = await pb.collection('members').getOne(userId);
      
      // 计算各类统计数据
      const earnedRecords = await pb.collection('points_records').getFullList({
        filter: `userId = "${userId}" && points > 0`,
        sort: '-created'
      });
      
      const spentRecords = await pb.collection('points_records').getFullList({
        filter: `userId = "${userId}" && points < 0`,
        sort: '-created'
      });
      
      const totalEarned = earnedRecords.reduce((sum, record) => sum + (record.points || 0), 0);
      const totalSpent = Math.abs(spentRecords.reduce((sum, record) => sum + (record.points || 0), 0));
      
      return {
        userId,
        username: user.username || '',
        currentBalance: user.points || 0,
        totalEarned,
        totalSpent,
        totalExpired: 0, // TODO: 计算过期积分
        recentRecords: earnedRecords.slice(0, 10).map(PointsService.formatPointsRecord),
        upcomingExpiry: [], // TODO: 实现即将过期的积分
        availableExchanges: [], // TODO: 获取可用兑换商品
        recommendedExchanges: [], // TODO: 获取推荐兑换商品
        statistics: {
          thisMonthEarned: 0, // TODO: 计算本月获得积分
          thisMonthSpent: 0, // TODO: 计算本月消费积分
          averageMonthlyEarned: 0, // TODO: 计算月均获得积分
          totalOrders: 0, // TODO: 获取订单总数
          averagePointsPerOrder: 0, // TODO: 计算每单平均积分
          membershipDuration: 0 // TODO: 计算会员天数
        }
      };
    } catch (error) {
      console.error('Failed to get user points overview:', error);
      throw new Error('获取用户积分概览失败');
    }
  }

  /**
   * 调整积分
   */
  static async adjustPoints(input: PointsAdjustmentInput): Promise<PointsRecord> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 获取用户当前积分
      const user = await pb.collection('members').getOne(input.userId);
      const currentPoints = user.points || 0;
      const newBalance = currentPoints + input.points;
      
      if (newBalance < 0) {
        throw new Error('积分余额不足');
      }
      
      // 创建积分记录
      const recordData = {
        userId: input.userId,
        username: user.username || '',
        type: input.type,
        points: input.points,
        balance: newBalance,
        reason: input.reason,
        description: input.description,
        orderId: input.orderId,
        relatedId: input.relatedId,
        earnedAt: input.points > 0 ? new Date().toISOString() : undefined,
        spentAt: input.points < 0 ? new Date().toISOString() : undefined,
        expiredAt: input.expiredAt,
        status: 'completed',
        isReversible: false,
        source: 'manual',
        operatorId: undefined,
        operatorName: undefined,
        metadata: input.metadata || {},
        tags: []
      };
      
      // 更新用户积分
      await pb.collection('members').update(input.userId, {
        points: newBalance,
        totalEarnedPoints: input.points > 0 ? (user.totalEarnedPoints || 0) + input.points : user.totalEarnedPoints,
        totalSpentPoints: input.points < 0 ? (user.totalSpentPoints || 0) + Math.abs(input.points) : user.totalSpentPoints
      });
      
      // 创建记录
      const record = await pb.collection('points_records').create(recordData);
      return PointsService.formatPointsRecord(record);
    } catch (error) {
      console.error('Failed to adjust points:', error);
      throw new Error('积分调整失败');
    }
  }

  /**
   * 构建积分记录查询过滤器
   */
  private static buildRecordQueryFilter(query: PointsRecordQueryInput): string {
    const conditions: string[] = [];
    
    if (query.userId) {
      conditions.push(`userId = "${query.userId}"`);
    }
    
    if (query.username) {
      conditions.push(`username = "${query.username}"`);
    }
    
    if (query.type) {
      if (Array.isArray(query.type)) {
        conditions.push(`type IN (${query.type.map(t => `"${t}"`).join(',')})`);
      } else {
        conditions.push(`type = "${query.type}"`);
      }
    }
    
    if (query.pointsMin !== undefined) {
      conditions.push(`points >= ${query.pointsMin}`);
    }
    
    if (query.pointsMax !== undefined) {
      conditions.push(`points <= ${query.pointsMax}`);
    }
    
    if (query.dateRange) {
      conditions.push(`created >= "${query.dateRange.startDate}" && created <= "${query.dateRange.endDate}"`);
    }
    
    if (query.status) {
      conditions.push(`status = "${query.status}"`);
    }
    
    if (query.source) {
      conditions.push(`source = "${query.source}"`);
    }
    
    if (query.orderId) {
      conditions.push(`orderId = "${query.orderId}"`);
    }
    
    if (query.ruleId) {
      conditions.push(`ruleId = "${query.ruleId}"`);
    }
    
    return conditions.length > 0 ? conditions.join(' && ') : '';
  }

  /**
   * 构建排序条件
   */
  private static buildSort(query: any, defaultField: string = 'created'): string {
    const sortBy = query.sortBy || defaultField;
    const sortOrder = query.sortOrder || 'desc';
    return `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
  }

  /**
   * 格式化积分记录
   */
  private static formatPointsRecord(record: any): PointsRecord {
    return {
      id: record.id,
      created: record.created,
      updated: record.updated,
      userId: record.userId,
      username: record.username,
      type: record.type,
      points: record.points,
      balance: record.balance,
      reason: record.reason,
      description: record.description,
      orderId: record.orderId,
      productId: record.productId,
      ruleId: record.ruleId,
      exchangeId: record.exchangeId,
      relatedId: record.relatedId,
      earnedAt: record.earnedAt,
      spentAt: record.spentAt,
      expiredAt: record.expiredAt,
      status: record.status,
      isReversible: record.isReversible,
      source: record.source,
      operatorId: record.operatorId,
      operatorName: record.operatorName,
      metadata: record.metadata || {},
      tags: record.tags || []
    };
  }
}

// Query resolvers
const Query = {
  // 积分记录查询
  pointsRecords: async (_: any, { query }: { query: PointsRecordQueryInput }) => {
    return await PointsService.findRecords(query);
  },

  pointsRecord: async (_: any, { id }: { id: string }) => {
    return await PointsService.findRecordById(id);
  },

  userPointsOverview: async (_: any, { userId }: { userId: string }) => {
    return await PointsService.getUserPointsOverview(userId);
  },

  // 积分规则查询
  pointsRules: async (_: any, { query }: { query: PointsRuleQueryInput }) => {
    // TODO: 实现积分规则查询
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  pointsRule: async (_: any, { id }: { id: string }) => {
    // TODO: 实现单个积分规则查询
    return null;
  },

  // 积分兑换商品查询
  pointsExchanges: async (_: any, { query }: { query: PointsExchangeQueryInput }) => {
    // TODO: 实现积分兑换商品查询
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  pointsExchange: async (_: any, { id }: { id: string }) => {
    // TODO: 实现单个兑换商品查询
    return null;
  },

  // 积分兑换记录查询
  pointsExchangeRecords: async (_: any, { query }: { query: PointsExchangeRecordQueryInput }) => {
    // TODO: 实现兑换记录查询
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  userExchangeRecords: async (_: any, { userId }: { userId: string }) => {
    // TODO: 实现用户兑换记录查询
    return [];
  },

  // 统计分析
  pointsStats: async (_: any, { dateRange }: { dateRange?: any }): Promise<PointsStatsResponse> => {
    // TODO: 实现积分统计
          return {
        overview: {
          totalUsers: 0,
          totalPoints: 0,
          totalEarned: 0,
          totalSpent: 0,
          totalExpired: 0,
          totalFrozen: 0,
          averageBalance: 0
        },
        typeDistribution: [],
        rulePerformance: [],
        exchangeStats: [],
        trendAnalysis: [],
        userSegmentation: []
      };
  },

  rulePerformance: async (_: any, { ruleId, dateRange }: { ruleId: string; dateRange?: any }) => {
    // TODO: 实现规则性能分析
    return {};
  },

  exchangePerformance: async (_: any, { exchangeId, dateRange }: { exchangeId: string; dateRange?: any }) => {
    // TODO: 实现兑换性能分析
    return {};
  },

  expiringPoints: async (_: any, { userId, days }: { userId: string; days?: number }) => {
    // TODO: 实现即将过期积分查询
    return [];
  }
};

// Mutation resolvers
const Mutation = {
  // 积分操作
  adjustPoints: async (_: any, { input }: { input: PointsAdjustmentInput }) => {
    return await PointsService.adjustPoints(input);
  },

  batchAdjustPoints: async (_: any, { inputs }: { inputs: PointsAdjustmentInput[] }) => {
    // TODO: 实现批量积分调整
    return {
      success: true,
      successCount: 0,
      failureCount: 0,
      totalCount: inputs.length,
      message: '批量积分调整完成',
      errors: []
    };
  },

  // 积分规则管理
  createPointsRule: async (_: any, { input }: { input: PointsRuleCreateInput }) => {
    // TODO: 实现创建积分规则
    return null;
  },

  updatePointsRule: async (_: any, { id, input }: { id: string; input: PointsRuleUpdateInput }) => {
    // TODO: 实现更新积分规则
    return null;
  },

  deletePointsRule: async (_: any, { id }: { id: string }) => {
    // TODO: 实现删除积分规则
    return false;
  },

  activatePointsRule: async (_: any, { id }: { id: string }) => {
    // TODO: 实现激活积分规则
    return false;
  },

  deactivatePointsRule: async (_: any, { id }: { id: string }) => {
    // TODO: 实现停用积分规则
    return false;
  },

  // 积分兑换商品管理
  createPointsExchange: async (_: any, { input }: { input: PointsExchangeCreateInput }) => {
    // TODO: 实现创建兑换商品
    return null;
  },

  updatePointsExchange: async (_: any, { id, input }: { id: string; input: PointsExchangeUpdateInput }) => {
    // TODO: 实现更新兑换商品
    return null;
  },

  deletePointsExchange: async (_: any, { id }: { id: string }) => {
    // TODO: 实现删除兑换商品
    return false;
  },

  // 积分兑换操作
  exchangePoints: async (_: any, { userId, exchangeId, quantity }: { userId: string; exchangeId: string; quantity?: number }) => {
    // TODO: 实现积分兑换
    return null;
  },

  cancelExchange: async (_: any, { exchangeRecordId }: { exchangeRecordId: string }) => {
    // TODO: 实现取消兑换
    return false;
  },

  // 积分过期处理
  processExpiredPoints: async () => {
    // TODO: 实现积分过期处理
    return {
      success: true,
      processedUsers: 0,
      expiredPoints: 0,
      message: '积分过期处理完成'
    };
  },

  // 积分冻结/解冻
  freezePoints: async (_: any, { userId, points, reason }: { userId: string; points: number; reason: string }) => {
    // TODO: 实现积分冻结
    return false;
  },

  unfreezePoints: async (_: any, { userId, points, reason }: { userId: string; points: number; reason: string }) => {
    // TODO: 实现积分解冻
    return false;
  }
};

// 类型解析器
const types = {
  PointsRecord: {
    // 解析关联的用户信息
    user: async (parent: PointsRecord) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('members').getOne(parent.userId);
      } catch (error) {
        console.error('Failed to resolve points record user:', error);
        return null;
      }
    },

    // 解析关联的订单信息
    order: async (parent: PointsRecord) => {
      if (!parent.orderId) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('orders').getOne(parent.orderId);
      } catch (error) {
        console.error('Failed to resolve points record order:', error);
        return null;
      }
    },

    // 解析关联的规则信息
    rule: async (parent: PointsRecord) => {
      if (!parent.ruleId) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('points_rules').getOne(parent.ruleId);
      } catch (error) {
        console.error('Failed to resolve points record rule:', error);
        return null;
      }
    }
  }
};

export const pointsResolvers = {
  Query,
  Mutation,
  types
}; 