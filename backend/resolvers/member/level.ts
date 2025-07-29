/**
 * 会员等级 Resolvers
 * @description 处理会员等级管理、升级检查、保级逻辑等操作
 */

import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { 
  MemberLevel,
  LevelBenefit,
  LevelUpgradeCondition,
  LevelMaintenanceRule,
  LevelUpgradeCheckResult,
  LevelUpgradeHistory,
  LevelMaintenanceCheckResult,
  MemberLevelQueryInput,
  MemberLevelCreateInput,
  MemberLevelUpdateInput,
  MemberLevelsResponse,
  MemberLevelStatsResponse
} from '../../types/member/index.ts';

// 会员等级服务工具函数
class MemberLevelService {
  /**
   * 根据 ID 查找等级
   */
  static async findById(id: string): Promise<MemberLevel | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('member_levels').getOne(id);
      return MemberLevelService.formatLevelRecord(record);
    } catch (error) {
      console.error('Failed to find level by ID:', error);
      return null;
    }
  }

  /**
   * 根据名称查找等级
   */
  static async findByName(name: string): Promise<MemberLevel | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('member_levels').getFirstListItem(
        `name="${name}"`
      );
      
      return MemberLevelService.formatLevelRecord(record);
    } catch (error) {
      console.error('Failed to find level by name:', error);
      return null;
    }
  }

  /**
   * 根据等级数值查找等级
   */
  static async findByLevel(level: number): Promise<MemberLevel | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('member_levels').getFirstListItem(
        `level=${level}`
      );
      
      return MemberLevelService.formatLevelRecord(record);
    } catch (error) {
      console.error('Failed to find level by level number:', error);
      return null;
    }
  }

  /**
   * 查询等级列表
   */
  static async findMany(query: MemberLevelQueryInput): Promise<MemberLevelsResponse> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const filter = MemberLevelService.buildQueryFilter(query);
      const page = query.page || 1;
      const perPage = query.perPage || 20;
      const sort = MemberLevelService.buildSort(query);
      
      const result = await pb.collection('member_levels').getList(page, perPage, {
        filter,
        sort
      });
      
      const items = result.items.map(MemberLevelService.formatLevelRecord);
      
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
      console.error('Failed to query member levels:', error);
      throw new Error('查询会员等级失败');
    }
  }

  /**
   * 获取所有等级
   */
  static async findAll(): Promise<MemberLevel[]> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const records = await pb.collection('member_levels').getFullList({
        sort: 'level'
      });
      
      return records.map(MemberLevelService.formatLevelRecord);
    } catch (error) {
      console.error('Failed to get all levels:', error);
      return [];
    }
  }

  /**
   * 获取激活的等级
   */
  static async findActive(): Promise<MemberLevel[]> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const records = await pb.collection('member_levels').getFullList({
        filter: 'isActive = true',
        sort: 'level'
      });
      
      return records.map(MemberLevelService.formatLevelRecord);
    } catch (error) {
      console.error('Failed to get active levels:', error);
      return [];
    }
  }

  /**
   * 获取默认等级
   */
  static async findDefault(): Promise<MemberLevel | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('member_levels').getFirstListItem(
        'isDefault = true'
      );
      
      return MemberLevelService.formatLevelRecord(record);
    } catch (error) {
      console.error('Failed to get default level:', error);
      return null;
    }
  }

  /**
   * 创建等级
   */
  static async create(input: MemberLevelCreateInput): Promise<MemberLevel> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const data = {
        name: input.name,
        displayName: input.displayName,
        description: input.description,
        level: input.level,
        pointsRequired: input.pointsRequired,
        discountRate: input.discountRate,
        color: input.color,
        icon: input.icon,
        badgeImage: input.badgeImage,
        benefits: input.benefits || [],
        upgradeConditions: input.upgradeConditions || [],
        maintenanceRule: input.maintenanceRule || {},
        isActive: input.isActive ?? true,
        isDefault: input.isDefault ?? false,
        maxValidityDays: input.maxValidityDays,
        customBenefits: input.customBenefits || {},
        businessRules: input.businessRules || {}
      };
      
      const record = await pb.collection('member_levels').create(data);
      return MemberLevelService.formatLevelRecord(record);
    } catch (error) {
      console.error('Failed to create member level:', error);
      throw new Error('创建会员等级失败');
    }
  }

  /**
   * 更新等级
   */
  static async update(id: string, input: MemberLevelUpdateInput): Promise<MemberLevel> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const data: any = {};
      
      if (input.name !== undefined) data.name = input.name;
      if (input.displayName !== undefined) data.displayName = input.displayName;
      if (input.description !== undefined) data.description = input.description;
      if (input.level !== undefined) data.level = input.level;
      if (input.pointsRequired !== undefined) data.pointsRequired = input.pointsRequired;
      if (input.discountRate !== undefined) data.discountRate = input.discountRate;
      if (input.color !== undefined) data.color = input.color;
      if (input.icon !== undefined) data.icon = input.icon;
      if (input.badgeImage !== undefined) data.badgeImage = input.badgeImage;
      if (input.benefits !== undefined) data.benefits = input.benefits;
      if (input.upgradeConditions !== undefined) data.upgradeConditions = input.upgradeConditions;
      if (input.maintenanceRule !== undefined) data.maintenanceRule = input.maintenanceRule;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (input.isDefault !== undefined) data.isDefault = input.isDefault;
      if (input.maxValidityDays !== undefined) data.maxValidityDays = input.maxValidityDays;
      if (input.customBenefits !== undefined) data.customBenefits = input.customBenefits;
      if (input.businessRules !== undefined) data.businessRules = input.businessRules;
      
      const record = await pb.collection('member_levels').update(id, data);
      return MemberLevelService.formatLevelRecord(record);
    } catch (error) {
      console.error('Failed to update member level:', error);
      throw new Error('更新会员等级失败');
    }
  }

  /**
   * 检查升级资格
   */
  static async checkUpgradeEligibility(memberId: string): Promise<LevelUpgradeCheckResult> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 获取会员信息
      const member = await pb.collection('members').getOne(memberId, {
        expand: 'level'
      });
      
      // 获取下一个等级
      const nextLevels = await pb.collection('member_levels').getFullList({
        filter: `level > ${member.expand?.level?.level || 0} && isActive = true`,
        sort: 'level'
      });
      
      if (nextLevels.length === 0) {
        return {
          canUpgrade: false,
          currentConditions: [],
          nextMilestone: undefined
        };
      }
      
      const nextLevel = nextLevels[0];
      const currentPoints = member.points || 0;
      const requiredPoints = nextLevel.pointsRequired || 0;
      const canUpgrade = currentPoints >= requiredPoints;
      
      return {
        canUpgrade,
        targetLevelId: nextLevel.id,
        targetLevel: MemberLevelService.formatLevelRecord(nextLevel),
        currentConditions: [
          {
            condition: {
              type: 'points',
              operator: 'gte',
              value: requiredPoints,
              description: '积分要求'
            },
            currentValue: currentPoints,
            requiredValue: requiredPoints,
            satisfied: canUpgrade,
            progress: Math.min(currentPoints / requiredPoints, 1)
          }
        ]
      };
    } catch (error) {
      console.error('Failed to check upgrade eligibility:', error);
      throw new Error('检查升级资格失败');
    }
  }

  /**
   * 构建查询过滤器
   */
  private static buildQueryFilter(query: MemberLevelQueryInput): string {
    const conditions: string[] = [];
    
    if (query.search) {
      conditions.push(`(name ~ "${query.search}" || displayName ~ "${query.search}")`);
    }
    
    if (query.name) {
      conditions.push(`name = "${query.name}"`);
    }
    
    if (query.isActive !== undefined) {
      conditions.push(`isActive = ${query.isActive}`);
    }
    
    if (query.isDefault !== undefined) {
      conditions.push(`isDefault = ${query.isDefault}`);
    }
    
    if (query.levelMin !== undefined) {
      conditions.push(`level >= ${query.levelMin}`);
    }
    
    if (query.levelMax !== undefined) {
      conditions.push(`level <= ${query.levelMax}`);
    }
    
    if (query.pointsRequiredMin !== undefined) {
      conditions.push(`pointsRequired >= ${query.pointsRequiredMin}`);
    }
    
    if (query.pointsRequiredMax !== undefined) {
      conditions.push(`pointsRequired <= ${query.pointsRequiredMax}`);
    }
    
    return conditions.length > 0 ? conditions.join(' && ') : '';
  }

  /**
   * 构建排序条件
   */
  private static buildSort(query: MemberLevelQueryInput): string {
    const sortBy = query.sortBy || 'level';
    const sortOrder = query.sortOrder || 'asc';
    return `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
  }

  /**
   * 格式化等级记录
   */
  static formatLevelRecord(record: any): MemberLevel {
    return {
      id: record.id,
      created: record.created,
      updated: record.updated,
      name: record.name,
      displayName: record.displayName,
      description: record.description,
      slogan: record.slogan,
      icon: record.icon,
      color: record.color,
      backgroundColor: record.backgroundColor,
      badgeImage: record.badgeImage,
      level: record.level,
      sortOrder: record.sortOrder || record.level,
      isActive: record.isActive ?? true,
      isDefault: record.isDefault ?? false,
      upgradeConditions: record.upgradeConditions || [],
      pointsRequired: record.pointsRequired,
      benefits: record.benefits || [],
      discountRate: record.discountRate,
      pointsRate: record.pointsRate || 1,
      freeShippingThreshold: record.freeShippingThreshold || 0,
      maintenanceRule: record.maintenanceRule || {
        enabled: false,
        period: 'monthly',
        conditions: []
      },
      memberCount: record.memberCount || 0,
      averageOrderValue: record.averageOrderValue || 0,
      totalRevenue: record.totalRevenue || 0,
      maxValidityDays: record.maxValidityDays,
      allowDowngrade: record.allowDowngrade ?? false,
      autoUpgrade: record.autoUpgrade ?? true,
      customBenefits: record.customBenefits || {},
      businessRules: record.businessRules || {},
      metadata: record.metadata || {}
    };
  }
}

// Query resolvers
const Query = {
  // 会员等级查询
  memberLevels: async (_: any, { query }: { query: MemberLevelQueryInput }) => {
    return await MemberLevelService.findMany(query);
  },

  memberLevel: async (_: any, { id }: { id: string }) => {
    return await MemberLevelService.findById(id);
  },

  memberLevelByName: async (_: any, { name }: { name: string }) => {
    return await MemberLevelService.findByName(name);
  },

  memberLevelByLevel: async (_: any, { level }: { level: number }) => {
    return await MemberLevelService.findByLevel(level);
  },

  allMemberLevels: async () => {
    return await MemberLevelService.findAll();
  },

  activeMemberLevels: async () => {
    return await MemberLevelService.findActive();
  },

  defaultMemberLevel: async () => {
    return await MemberLevelService.findDefault();
  },

  // 升级逻辑
  checkUpgradeEligibility: async (_: any, { memberId }: { memberId: string }) => {
    return await MemberLevelService.checkUpgradeEligibility(memberId);
  },

  batchUpgradeCheck: async () => {
    // TODO: 实现批量升级检查
    return [];
  },

  // 保级逻辑
  checkMaintenance: async (_: any, { memberId }: { memberId: string }): Promise<LevelMaintenanceCheckResult> => {
    // TODO: 实现保级检查逻辑
    // 先获取会员当前等级
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const member = await pb.collection('members').getOne(memberId, {
        expand: 'levelId'
      });
      
      const currentLevel = member.expand?.levelId 
        ? MemberLevelService.formatLevelRecord(member.expand.levelId)
        : await MemberLevelService.findDefault();
      
      if (!currentLevel) {
        throw new Error('无法获取会员等级信息');
      }
      
      return {
        needsAttention: false,
        currentLevel,
        maintenanceStatus: 'safe',
        nextCheckDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        conditions: [],
        recommendations: []
      };
    } catch (error) {
      console.error('Failed to check maintenance:', error);
      throw new Error('保级检查失败');
    }
  },

  processMaintenance: async () => {
    // TODO: 实现保级处理逻辑
    return [];
  },

  // 升级历史
  levelUpgradeHistories: async (_: any, { query }: { query: any }) => {
    // TODO: 实现升级历史查询
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

  memberUpgradeHistory: async (_: any, { memberId }: { memberId: string }) => {
    // TODO: 实现会员升级历史查询
    return [];
  },

  // 统计分析
  memberLevelStats: async (_: any, { dateRange }: { dateRange?: any }): Promise<MemberLevelStatsResponse> => {
    // TODO: 实现等级统计
    return {
      overview: {
        totalLevels: 0,
        activeLevels: 0,
        totalMembers: 0,
        averageUpgradeTime: 0
      },
      distribution: [],
      upgradeTrend: [],
      benefitUsage: [],
      revenueImpact: []
    };
  },

  levelPerformance: async (_: any, { levelId }: { levelId: string }) => {
    // TODO: 实现等级性能分析
    return {};
  },

  // 权益管理
  levelBenefits: async (_: any, { levelId }: { levelId: string }) => {
    const level = await MemberLevelService.findById(levelId);
    return level?.benefits || [];
  }
};

// Mutation resolvers
const Mutation = {
  // 基础CRUD
  createMemberLevel: async (_: any, { input }: { input: MemberLevelCreateInput }) => {
    return await MemberLevelService.create(input);
  },

  updateMemberLevel: async (_: any, { id, input }: { id: string; input: MemberLevelUpdateInput }) => {
    return await MemberLevelService.update(id, input);
  },

  deleteMemberLevel: async (_: any, { id }: { id: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      await pb.collection('member_levels').delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete member level:', error);
      return false;
    }
  },

  // 状态管理
  activateMemberLevel: async (_: any, { id }: { id: string }) => {
    const level = await MemberLevelService.update(id, { isActive: true });
    return !!level;
  },

  deactivateMemberLevel: async (_: any, { id }: { id: string }) => {
    const level = await MemberLevelService.update(id, { isActive: false });
    return !!level;
  },

  setDefaultLevel: async (_: any, { id }: { id: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 先取消所有等级的默认状态
      await pb.collection('member_levels').getFullList().then(levels => {
        return Promise.all(levels.map(level => 
          pb.collection('member_levels').update(level.id, { isDefault: false })
        ));
      });
      
      // 设置新的默认等级
      const level = await MemberLevelService.update(id, { isDefault: true });
      return !!level;
    } catch (error) {
      console.error('Failed to set default level:', error);
      return false;
    }
  },

  // 升级操作
  upgradeMembers: async (_: any, { memberIds }: { memberIds: string[] }) => {
    // TODO: 实现批量升级
    return {
      success: true,
      successCount: 0,
      failureCount: 0,
      totalCount: memberIds.length,
      message: '升级操作完成',
      errors: []
    };
  },

  processAutoUpgrade: async () => {
    // TODO: 实现自动升级处理
    return {
      success: true,
      processedCount: 0,
      upgradedCount: 0,
      message: '自动升级处理完成'
    };
  },

  // 权益管理
  addLevelBenefit: async (_: any, { levelId, benefit }: { levelId: string; benefit: LevelBenefit }) => {
    try {
      const level = await MemberLevelService.findById(levelId);
      if (!level) throw new Error('等级不存在');
      
      const updatedBenefits = [...(level.benefits || []), benefit];
      const updatedLevel = await MemberLevelService.update(levelId, { 
        benefits: updatedBenefits 
      });
      
      return !!updatedLevel;
    } catch (error) {
      console.error('Failed to add level benefit:', error);
      return false;
    }
  },

  removeLevelBenefit: async (_: any, { levelId, benefitId }: { levelId: string; benefitId: string }) => {
    try {
      const level = await MemberLevelService.findById(levelId);
      if (!level) throw new Error('等级不存在');
      
      const updatedBenefits = (level.benefits || []).filter(
        (benefit: any) => benefit.id !== benefitId
      );
      
      const updatedLevel = await MemberLevelService.update(levelId, { 
        benefits: updatedBenefits 
      });
      
      return !!updatedLevel;
    } catch (error) {
      console.error('Failed to remove level benefit:', error);
      return false;
    }
  }
};

// 类型解析器
const types = {
  MemberLevel: {
    // 获取等级下的会员数量
    memberCount: async (parent: MemberLevel) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('members').getList(1, 1, {
          filter: `levelId = "${parent.id}"`,
          fields: 'id'
        });
        
        return result.totalItems;
      } catch (error) {
        console.error('Failed to get member count for level:', error);
        return 0;
      }
    }
  }
};

export const memberLevelResolvers = {
  Query,
  Mutation,
  types
}; 