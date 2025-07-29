/**
 * 会员标签 Resolvers
 * @description 处理会员标签 CRUD、分组管理、分析等操作
 */

import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { 
  MemberTag,
  MemberTagRelation,
  TagGroup,
  MemberTagQueryInput,
  MemberTagCreateInput,
  MemberTagAssignInput,
  MemberTagsResponse,
  TagAnalysisResponse,
  MemberTagProfile
} from '../../types/member/index.ts';

// 标签服务工具函数
class TagService {
  /**
   * 根据 ID 查找标签
   */
  static async findById(id: string): Promise<MemberTag | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('member_tags').getOne(id);
      return TagService.formatTagRecord(record);
    } catch (error) {
      console.error('Failed to find tag by ID:', error);
      return null;
    }
  }

  /**
   * 根据名称查找标签
   */
  static async findByName(name: string): Promise<MemberTag | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('member_tags').getFirstListItem(
        `name = "${name}"`
      );
      
      return TagService.formatTagRecord(record);
    } catch (error) {
      console.error('Failed to find tag by name:', error);
      return null;
    }
  }

  /**
   * 查询标签列表
   */
  static async findMany(query: MemberTagQueryInput): Promise<MemberTagsResponse> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const filter = TagService.buildQueryFilter(query);
      const page = query.page || 1;
      const perPage = query.perPage || 20;
      const sort = TagService.buildSort(query);
      
      const result = await pb.collection('member_tags').getList(page, perPage, {
        filter,
        sort
      });
      
      const items = result.items.map(TagService.formatTagRecord);
      
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
      console.error('Failed to query tags:', error);
      throw new Error('查询标签列表失败');
    }
  }

  /**
   * 创建标签
   */
  static async create(input: MemberTagCreateInput): Promise<MemberTag> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const data = {
        name: input.name,
        displayName: input.displayName,
        description: input.description,
        type: input.type,
        category: input.category,
        subcategory: input.subcategory,
        color: input.color,
        icon: input.icon,
        isActive: input.isActive ?? true,
        isSystem: input.isSystem ?? false,
        isAutoAssigned: input.isAutoAssigned ?? false,
        priority: input.priority || 0,
        metadata: input.metadata || {}
      };
      
      const record = await pb.collection('member_tags').create(data);
      return TagService.formatTagRecord(record);
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw new Error('创建标签失败');
    }
  }

  /**
   * 为会员分配标签
   */
  static async assignTag(input: MemberTagAssignInput): Promise<MemberTagRelation> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 批量分配标签给多个会员
      const results: MemberTagRelation[] = [];
      
      for (const memberId of input.memberIds) {
        for (const tagId of input.tagIds) {
          // 检查是否已存在关联
          const existing = await pb.collection('member_tag_relations').getFullList({
            filter: `memberId = "${memberId}" && tagId = "${tagId}"`
          });
          
          if (existing.length === 0) {
            const data = {
              memberId,
              tagId,
              assignedBy: input.assignedBy || 'manual',
              assignedAt: new Date().toISOString(),
              assignedById: input.assignedById,
              confidence: input.confidence || 1.0,
              source: input.source || 'manual',
              reason: input.reason,
              expiresAt: input.expiresAt,
              isActive: true,
              metadata: input.metadata || {}
            };
            
            const record = await pb.collection('member_tag_relations').create(data);
            results.push(TagService.formatTagRelationRecord(record));
          }
        }
      }
      
      return results[0] || null; // 返回第一个创建的关联
    } catch (error) {
      console.error('Failed to assign tag:', error);
      throw new Error('分配标签失败');
    }
  }

  /**
   * 获取会员标签
   */
  static async getMemberTags(memberId: string): Promise<MemberTagRelation[]> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const records = await pb.collection('member_tag_relations').getFullList({
        filter: `memberId = "${memberId}" && isActive = true`,
        expand: 'tagId',
        sort: '-assignedAt'
      });
      
      return records.map(TagService.formatTagRelationRecord);
    } catch (error) {
      console.error('Failed to get member tags:', error);
      return [];
    }
  }

  /**
   * 构建查询过滤器
   */
  private static buildQueryFilter(query: MemberTagQueryInput): string {
    const conditions: string[] = [];
    
    if (query.search) {
      conditions.push(`(name ~ "${query.search}" || displayName ~ "${query.search}" || description ~ "${query.search}")`);
    }
    
    if (query.name) {
      conditions.push(`name = "${query.name}"`);
    }
    
    if (query.type) {
      if (Array.isArray(query.type)) {
        conditions.push(`type IN (${query.type.map(t => `"${t}"`).join(',')})`);
      } else {
        conditions.push(`type = "${query.type}"`);
      }
    }
    
    if (query.category) {
      conditions.push(`category = "${query.category}"`);
    }
    
    if (query.subcategory) {
      conditions.push(`subcategory = "${query.subcategory}"`);
    }
    
    if (query.isActive !== undefined) {
      conditions.push(`isActive = ${query.isActive}`);
    }
    
    if (query.isSystem !== undefined) {
      conditions.push(`isSystem = ${query.isSystem}`);
    }
    
    if (query.isAutoAssigned !== undefined) {
      conditions.push(`isAutoAssigned = ${query.isAutoAssigned}`);
    }
    
    // 移除 groupId 查询条件
    
    return conditions.length > 0 ? conditions.join(' && ') : '';
  }

  /**
   * 构建排序条件
   */
  private static buildSort(query: MemberTagQueryInput): string {
    const sortBy = query.sortBy || 'created';
    const sortOrder = query.sortOrder || 'desc';
    return `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
  }

  /**
   * 格式化标签记录
   */
  private static formatTagRecord(record: any): MemberTag {
    return {
      id: record.id,
      created: record.created,
      updated: record.updated,
      name: record.name,
      displayName: record.displayName,
      description: record.description,
      type: record.type,
      category: record.category,
      subcategory: record.subcategory,
      color: record.color,
      icon: record.icon,
      isActive: record.isActive,
      isSystem: record.isSystem,
      isAutoAssigned: record.isAutoAssigned,
      priority: record.priority,
      metadata: record.metadata || {},
      memberCount: record.memberCount || 0,
      usageCount: record.usageCount || 0,
    };
  }

  /**
   * 格式化标签关联记录
   */
  private static formatTagRelationRecord(record: any): MemberTagRelation {
    return {
      id: record.id,
      created: record.created,
      updated: record.updated,
      memberId: record.memberId,
      tagId: record.tagId,
      tag: record.expand?.tagId ? TagService.formatTagRecord(record.expand.tagId) : undefined,
      assignedBy: record.assignedBy,
      assignedAt: record.assignedAt,
      assignedById: record.assignedById,
      confidence: record.confidence,
      source: record.source,
      reason: record.reason,
      expiresAt: record.expiresAt,
      isActive: record.isActive,
      removedAt: record.removedAt,
      removedBy: record.removedBy,
      removedReason: record.removedReason,
      metadata: record.metadata || {}
    };
  }
}

// Query resolvers
const Query = {
  // 标签CRUD
  memberTags: async (_: any, { query }: { query: MemberTagQueryInput }) => {
    return await TagService.findMany(query);
  },

  memberTag: async (_: any, { id }: { id: string }) => {
    return await TagService.findById(id);
  },

  memberTagByName: async (_: any, { name }: { name: string }) => {
    return await TagService.findByName(name);
  },

  // 标签分组CRUD
  tagGroups: async (_: any, { query }: { query: any }) => {
    // TODO: 实现标签分组查询
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

  tagGroup: async (_: any, { id }: { id: string }) => {
    // TODO: 实现单个标签分组查询
    return null;
  },

  // 标签关联管理
  memberTagRelations: async (_: any, { query }: { query: any }) => {
    // TODO: 实现标签关联查询
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

  // 会员标签操作
  getMemberTags: async (_: any, { memberId }: { memberId: string }) => {
    return await TagService.getMemberTags(memberId);
  },

  getMemberTagsByCategory: async (_: any, { memberId, category }: { memberId: string; category: string }) => {
    const tags = await TagService.getMemberTags(memberId);
    return tags.filter(relation => relation.tag?.category === category);
  },

  // 分析和洞察
  tagAnalysis: async (_: any, { dateRange }: { dateRange?: any }): Promise<TagAnalysisResponse> => {
    // TODO: 实现标签分析
    return {
      overview: {
        totalTags: 0,
        activeTags: 0,
        totalAssignments: 0,
        uniqueMembers: 0,
        averageTagsPerMember: 0
      },
      tagPerformance: [],
      categoryDistribution: [],
      assignmentTrend: [],
      memberSegmentation: []
    };
  },

  memberTagProfile: async (_: any, { memberId }: { memberId: string }): Promise<MemberTagProfile> => {
    // TODO: 实现会员标签画像
    return {
      memberId,
      totalTags: 0,
      activeTags: 0,
      categories: [],
      assignmentHistory: [],
      behaviorProfile: {},
      recommendedTags: []
    };
  },

  tagPerformance: async (_: any, { tagId }: { tagId: string }) => {
    // TODO: 实现标签性能分析
    return {};
  },

  tagSegmentAnalysis: async () => {
    // TODO: 实现标签分群分析
    return {};
  },

  // 推荐和建议
  suggestTagsForMember: async (_: any, { memberId }: { memberId: string }) => {
    // TODO: 实现为会员推荐标签
    return [];
  },

  suggestMembersForTag: async (_: any, { tagId }: { tagId: string }) => {
    // TODO: 实现为标签推荐会员
    return [];
  },

  findSimilarMembers: async (_: any, { memberId, limit }: { memberId: string; limit?: number }) => {
    // TODO: 实现查找相似会员
    return [];
  },

  // 规则测试
  testTagRule: async (_: any, { rule, memberId }: { rule: any; memberId: string }) => {
    // TODO: 实现标签规则测试
    return {
      matched: false,
      confidence: 0,
      details: [],
      reasons: []
    };
  }
};

// Mutation resolvers
const Mutation = {
  // 标签CRUD
  createMemberTag: async (_: any, { input }: { input: MemberTagCreateInput }) => {
    return await TagService.create(input);
  },

  updateMemberTag: async (_: any, { id, input }: { id: string; input: any }) => {
    // TODO: 实现更新标签
    return null;
  },

  deleteMemberTag: async (_: any, { id }: { id: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      await pb.collection('member_tags').delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete tag:', error);
      return false;
    }
  },

  // 标签分组管理
  createTagGroup: async (_: any, { input }: { input: any }) => {
    // TODO: 实现创建标签分组
    return null;
  },

  updateTagGroup: async (_: any, { id, input }: { id: string; input: any }) => {
    // TODO: 实现更新标签分组
    return null;
  },

  deleteTagGroup: async (_: any, { id }: { id: string }) => {
    // TODO: 实现删除标签分组
    return false;
  },

  // 标签分配和移除
  assignMemberTag: async (_: any, { input }: { input: MemberTagAssignInput }) => {
    return await TagService.assignTag(input);
  },

  removeMemberTag: async (_: any, { memberId, tagId, reason }: { memberId: string; tagId: string; reason?: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const relations = await pb.collection('member_tag_relations').getFullList({
        filter: `memberId = "${memberId}" && tagId = "${tagId}" && isActive = true`
      });
      
      for (const relation of relations) {
        await pb.collection('member_tag_relations').update(relation.id, {
          isActive: false,
          removedAt: new Date().toISOString(),
          removedReason: reason
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to remove member tag:', error);
      return false;
    }
  },

  batchAssignTags: async (_: any, { memberIds, tagIds }: { memberIds: string[]; tagIds: string[] }) => {
    // TODO: 实现批量分配标签
    return {
      success: true,
      successCount: 0,
      failureCount: 0,
      totalCount: memberIds.length * tagIds.length,
      message: '批量标签分配完成',
      errors: []
    };
  },

  batchRemoveTags: async (_: any, { memberIds, tagIds }: { memberIds: string[]; tagIds: string[] }) => {
    // TODO: 实现批量移除标签
    return {
      success: true,
      successCount: 0,
      failureCount: 0,
      totalCount: memberIds.length * tagIds.length,
      message: '批量标签移除完成',
      errors: []
    };
  },

  // 自动标记
  processAutoTagging: async () => {
    // TODO: 实现自动标记处理
    return {
      success: true,
      processedMembers: 0,
      assignedTags: 0,
      removedTags: 0,
      message: '自动标记处理完成'
    };
  },

  // 标签清理
  cleanupExpiredTags: async () => {
    // TODO: 实现过期标签清理
    return {
      success: true,
      cleanedCount: 0,
      message: '过期标签清理完成'
    };
  }
};

// 类型解析器
const types = {
  MemberTag: {
    // 获取标签下的会员数量
    memberCount: async (parent: MemberTag) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('member_tag_relations').getList(1, 1, {
          filter: `tagId = "${parent.id}" && isActive = true`,
          fields: 'id'
        });
        
        return result.totalItems;
      } catch (error) {
        console.error('Failed to get member count for tag:', error);
        return 0;
      }
    },

    // 获取标签分组信息
    group: async (parent: MemberTag) => {
      if (!parent.groupId) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('tag_groups').getOne(parent.groupId);
      } catch (error) {
        console.error('Failed to resolve tag group:', error);
        return null;
      }
    }
  },

  MemberTagRelation: {
    // 解析关联的会员信息
    member: async (parent: MemberTagRelation) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('members').getOne(parent.memberId);
      } catch (error) {
        console.error('Failed to resolve tag relation member:', error);
        return null;
      }
    },

    // 解析关联的标签信息
    tag: async (parent: MemberTagRelation) => {
      if (parent.tag) return parent.tag;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const record = await pb.collection('member_tags').getOne(parent.tagId);
        return TagService.formatTagRecord(record);
      } catch (error) {
        console.error('Failed to resolve tag relation tag:', error);
        return null;
      }
    }
  }
};

export const memberTagResolvers = {
  Query,
  Mutation,
  types
}; 