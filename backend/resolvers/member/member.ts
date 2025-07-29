/**
 * 会员核心 Resolvers
 * @description 处理会员基础 CRUD、查询、统计等操作
 */

import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { 
  Member,
  MemberQueryInput,
  MemberCreateInput,
  MemberUpdateInput,
  ProfileUpdateInput,
  PasswordChangeInput,
  PhoneBindingInput,
  EmailBindingInput,
  MembersResponse,
  MemberDetailResponse,
  MemberStatsResponse
} from '../../types/member/index.ts';

// 会员服务工具函数
class MemberService {
  /**
   * 根据 ID 查找会员
   */
  static async findById(id: string): Promise<Member | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('members').getOne(id, {
        expand: 'level,tags'
      });
      
      return MemberService.formatMemberRecord(record);
    } catch (error) {
      console.error('Failed to find member by ID:', error);
      return null;
    }
  }

  /**
   * 根据用户名查找会员
   */
  static async findByUsername(username: string): Promise<Member | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('members').getFirstListItem(
        `username="${username}"`,
        { expand: 'level,tags' }
      );
      
      return MemberService.formatMemberRecord(record);
    } catch (error) {
      console.error('Failed to find member by username:', error);
      return null;
    }
  }

  /**
   * 根据邮箱查找会员
   */
  static async findByEmail(email: string): Promise<Member | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('members').getFirstListItem(
        `email="${email}"`,
        { expand: 'level,tags' }
      );
      
      return MemberService.formatMemberRecord(record);
    } catch (error) {
      console.error('Failed to find member by email:', error);
      return null;
    }
  }

  /**
   * 根据手机号查找会员
   */
  static async findByPhone(phone: string): Promise<Member | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('members').getFirstListItem(
        `phone="${phone}"`,
        { expand: 'level,tags' }
      );
      
      return MemberService.formatMemberRecord(record);
    } catch (error) {
      console.error('Failed to find member by phone:', error);
      return null;
    }
  }

  /**
   * 查询会员列表
   */
  static async findMany(query: MemberQueryInput): Promise<MembersResponse> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 构建查询条件
      const filter = MemberService.buildQueryFilter(query);
      const page = query.page || 1;
      const perPage = query.perPage || 20;
      const sort = MemberService.buildSort(query);
      
      const result = await pb.collection('members').getList(page, perPage, {
        filter,
        sort,
        expand: 'level,tags'
      });
      
      const items = result.items.map(MemberService.formatMemberRecord);
      
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
      console.error('Failed to query members:', error);
      throw new Error('查询会员列表失败');
    }
  }

  /**
   * 创建会员
   */
  static async create(input: MemberCreateInput): Promise<Member> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 准备创建数据
      const data = {
        username: input.username,
        email: input.email,
        phone: input.phone,
        password: input.password || '123456', // 默认密码
        passwordConfirm: input.password || '123456',
        profile: {
          realName: input.realName,
          nickname: input.nickname,
          gender: input.gender || 'unknown',
          birthday: input.birthday,
          avatar: input.avatar
        },
        levelId: input.levelId,
        points: input.initialPoints || 0,
        balance: input.initialBalance || 0,
        status: input.status || 'active',
        registerTime: new Date().toISOString(),
        customFields: input.customFields || {},
        stats: {
          totalOrders: 0,
          totalAmount: 0,
          totalSavings: 0,
          averageOrderValue: 0,
          favoriteCategories: [],
          loyaltyScore: 0,
          engagementScore: 0,
          membershipDuration: 0
        },
        verification: {
          status: 'unverified',
          type: 'none'
        },
        thirdPartyBindings: [],
        tags: [],
        groups: [],
        riskLevel: 'low',
        trustScore: 100,
        frozenPoints: 0,
        frozenBalance: 0,
        totalEarnedPoints: input.initialPoints || 0,
        totalSpentPoints: 0,
        isVerified: false
      };
      
      const record = await pb.collection('members').create(data, {
        expand: 'level,tags'
      });
      
      return MemberService.formatMemberRecord(record);
    } catch (error) {
      console.error('Failed to create member:', error);
      throw new Error('创建会员失败');
    }
  }

  /**
   * 更新会员
   */
  static async update(id: string, input: MemberUpdateInput): Promise<Member> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 获取现有记录
      const existing = await pb.collection('members').getOne(id);
      
      // 准备更新数据
      const data: any = {};
      
      if (input.username !== undefined) data.username = input.username;
      if (input.email !== undefined) data.email = input.email;
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.levelId !== undefined) data.levelId = input.levelId;
      if (input.status !== undefined) data.status = input.status;
      if (input.customFields !== undefined) data.customFields = input.customFields;
      
      // 更新 profile
      if (input.realName !== undefined || 
          input.nickname !== undefined || 
          input.gender !== undefined ||
          input.birthday !== undefined ||
          input.avatar !== undefined ||
          input.bio !== undefined) {
        
        data.profile = {
          ...existing.profile,
          ...(input.realName !== undefined && { realName: input.realName }),
          ...(input.nickname !== undefined && { nickname: input.nickname }),
          ...(input.gender !== undefined && { gender: input.gender }),
          ...(input.birthday !== undefined && { birthday: input.birthday }),
          ...(input.avatar !== undefined && { avatar: input.avatar }),
          ...(input.bio !== undefined && { bio: input.bio })
        };
      }
      
      // 更新偏好设置
      if (input.preferences) {
        data.profile = {
          ...data.profile,
          preferences: {
            ...existing.profile?.preferences,
            ...input.preferences
          }
        };
      }
      
      const record = await pb.collection('members').update(id, data, {
        expand: 'level,tags'
      });
      
      return MemberService.formatMemberRecord(record);
    } catch (error) {
      console.error('Failed to update member:', error);
      throw new Error('更新会员失败');
    }
  }

  /**
   * 构建查询过滤器
   */
  private static buildQueryFilter(query: MemberQueryInput): string {
    const conditions: string[] = [];
    
    if (query.search) {
      conditions.push(`(username ~ "${query.search}" || email ~ "${query.search}" || profile.realName ~ "${query.search}")`);
    }
    
    if (query.username) {
      conditions.push(`username = "${query.username}"`);
    }
    
    if (query.email) {
      conditions.push(`email = "${query.email}"`);
    }
    
    if (query.phone) {
      conditions.push(`phone = "${query.phone}"`);
    }
    
    if (query.status) {
      if (Array.isArray(query.status)) {
        conditions.push(`status IN (${query.status.map(s => `"${s}"`).join(',')})`);
      } else {
        conditions.push(`status = "${query.status}"`);
      }
    }
    
    if (query.isVerified !== undefined) {
      conditions.push(`isVerified = ${query.isVerified}`);
    }
    
    if (query.riskLevel) {
      conditions.push(`riskLevel = "${query.riskLevel}"`);
    }
    
    if (query.levelId) {
      if (Array.isArray(query.levelId)) {
        conditions.push(`levelId IN (${query.levelId.map(id => `"${id}"`).join(',')})`);
      } else {
        conditions.push(`levelId = "${query.levelId}"`);
      }
    }
    
    if (query.pointsMin !== undefined) {
      conditions.push(`points >= ${query.pointsMin}`);
    }
    
    if (query.pointsMax !== undefined) {
      conditions.push(`points <= ${query.pointsMax}`);
    }
    
    if (query.registerDateRange) {
      conditions.push(`registerTime >= "${query.registerDateRange.startDate}" && registerTime <= "${query.registerDateRange.endDate}"`);
    }
    
    if (query.province) {
      conditions.push(`profile.location.province = "${query.province}"`);
    }
    
    if (query.city) {
      conditions.push(`profile.location.city = "${query.city}"`);
    }
    
    return conditions.length > 0 ? conditions.join(' && ') : '';
  }

  /**
   * 构建排序条件
   */
  private static buildSort(query: MemberQueryInput): string {
    const sortBy = query.sortBy || 'created';
    const sortOrder = query.sortOrder || 'desc';
    return `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
  }

  /**
   * 格式化会员记录
   */
  private static formatMemberRecord(record: any): Member {
    return {
      id: record.id,
      created: record.created,
      updated: record.updated,
      profile: record.profile || {},
      level: record.expand?.level || {},
      levelId: record.levelId || '',
      points: record.points || 0,
      frozenPoints: record.frozenPoints || 0,
      totalEarnedPoints: record.totalEarnedPoints || 0,
      totalSpentPoints: record.totalSpentPoints || 0,
      balance: record.balance || 0,
      frozenBalance: record.frozenBalance || 0,
      status: record.status || 'active',
      isVerified: record.isVerified || false,
      verification: record.verification || { status: 'unverified', type: 'none' },
      stats: record.stats || {},
      registerTime: record.registerTime || record.created,
      lastLoginTime: record.lastLoginTime,
      lastActiveTime: record.lastActiveTime,
      levelUpgradeTime: record.levelUpgradeTime,
      wechatOpenid: record.wechatOpenid,
      wechatUnionid: record.wechatUnionid,
      thirdPartyBindings: record.thirdPartyBindings || [],
      tags: record.expand?.tags || [],
      groups: record.groups || [],
      segment: record.segment,
      riskLevel: record.riskLevel || 'low',
      trustScore: record.trustScore || 100,
      blacklistReason: record.blacklistReason,
      customFields: record.customFields || {},
      metadata: record.metadata || {}
    };
  }
}

// Query resolvers
const Query = {
  // 基础查询
  members: async (_: any, { query }: { query: MemberQueryInput }) => {
    return await MemberService.findMany(query);
  },

  member: async (_: any, { id }: { id: string }) => {
    return await MemberService.findById(id);
  },

  memberByUsername: async (_: any, { username }: { username: string }) => {
    return await MemberService.findByUsername(username);
  },

  memberByEmail: async (_: any, { email }: { email: string }) => {
    return await MemberService.findByEmail(email);
  },

  memberByPhone: async (_: any, { phone }: { phone: string }) => {
    return await MemberService.findByPhone(phone);
  },

  memberDetail: async (_: any, { id }: { id: string }): Promise<MemberDetailResponse> => {
    const member = await MemberService.findById(id);
    if (!member) throw new Error('会员不存在');
    
    // TODO: 获取关联数据（订单、积分记录等）
    return {
      member,
      recentOrders: [],
      recentPoints: [],
      loginHistory: [],
      behaviorData: [],
      recommendations: []
    };
  },

  // 搜索
  searchMembers: async (_: any, { keyword }: { keyword: string }) => {
    const query: MemberQueryInput = { search: keyword, perPage: 50 };
    const result = await MemberService.findMany(query);
    return result.items;
  },

  // 统计
  memberStats: async (_: any, { dateRange }: { dateRange?: any }): Promise<MemberStatsResponse> => {
    // TODO: 实现统计逻辑
    return {
      overview: {
        total: 0,
        active: 0,
        inactive: 0,
        banned: 0,
        newThisMonth: 0,
        retentionRate: 0
      },
      levelDistribution: [],
      genderDistribution: [],
      ageDistribution: [],
      locationDistribution: [],
      registrationTrend: [],
      activityTrend: [],
      segmentAnalysis: []
    };
  },

  memberSegmentAnalysis: async () => {
    // TODO: 实现会员分析逻辑
    return {};
  }
};

// Mutation resolvers
const Mutation = {
  // 基础CRUD
  createMember: async (_: any, { input }: { input: MemberCreateInput }) => {
    return await MemberService.create(input);
  },

  updateMember: async (_: any, { id, input }: { id: string; input: MemberUpdateInput }) => {
    return await MemberService.update(id, input);
  },

  deleteMember: async (_: any, { id }: { id: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      await pb.collection('members').delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete member:', error);
      return false;
    }
  },

  // 资料管理
  updateProfile: async (_: any, { id, input }: { id: string; input: ProfileUpdateInput }) => {
    const updateInput: MemberUpdateInput = {
      nickname: input.nickname,
      avatar: input.avatar,
      bio: input.bio,
      gender: input.gender,
      birthday: input.birthday,
      preferences: input.preferences
    };
    
    return await MemberService.update(id, updateInput);
  },

  changeMemberPassword: async (_: any, { id, input }: { id: string; input: PasswordChangeInput }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // TODO: 验证当前密码
      await pb.collection('members').update(id, {
        password: input.newPassword,
        passwordConfirm: input.confirmPassword
      });
      
      return true;
    } catch (error) {
      console.error('Failed to change password:', error);
      return false;
    }
  },

  // 绑定操作
  bindPhone: async (_: any, { id, input }: { id: string; input: PhoneBindingInput }) => {
    try {
      // TODO: 验证验证码
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      await pb.collection('members').update(id, {
        phone: input.phone
      });
      
      return true;
    } catch (error) {
      console.error('Failed to bind phone:', error);
      return false;
    }
  },

  bindEmail: async (_: any, { id, input }: { id: string; input: EmailBindingInput }) => {
    try {
      // TODO: 验证验证码
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      await pb.collection('members').update(id, {
        email: input.email
      });
      
      return true;
    } catch (error) {
      console.error('Failed to bind email:', error);
      return false;
    }
  },

  // 状态管理
  activateMember: async (_: any, { id }: { id: string }) => {
    const member = await MemberService.update(id, { status: 'active' });
    return !!member;
  },

  deactivateMember: async (_: any, { id }: { id: string }) => {
    const member = await MemberService.update(id, { status: 'inactive' });
    return !!member;
  },

  banMember: async (_: any, { id, reason }: { id: string; reason: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      await pb.collection('members').update(id, {
        status: 'banned',
        blacklistReason: reason
      });
      
      return true;
    } catch (error) {
      console.error('Failed to ban member:', error);
      return false;
    }
  },

  unbanMember: async (_: any, { id }: { id: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      await pb.collection('members').update(id, {
        status: 'active',
        blacklistReason: null
      });
      
      return true;
    } catch (error) {
      console.error('Failed to unban member:', error);
      return false;
    }
  }
};

// 类型解析器
const types = {
  Member: {
    // 解析关联的等级信息
    level: async (parent: Member) => {
      if (!parent.levelId) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('member_levels').getOne(parent.levelId);
      } catch (error) {
        console.error('Failed to resolve member level:', error);
        return null;
      }
    },

    // 解析关联的标签信息
    tags: async (parent: Member) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const relations = await pb.collection('member_tag_relations').getFullList({
          filter: `memberId = "${parent.id}"`,
          expand: 'tagId'
        });
        
        return relations.map((relation: any) => relation.expand?.tagId).filter(Boolean);
      } catch (error) {
        console.error('Failed to resolve member tags:', error);
        return [];
      }
    }
  }
};

export const memberResolvers = {
  Query,
  Mutation,
  types
}; 