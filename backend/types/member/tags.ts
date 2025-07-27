/**
 * 会员标签类型定义
 * @description 包含会员标签、分组、行为标记等相关类型
 */

import { BaseEntity, PaginationInput, PaginatedResponse, TagType, DateRange } from './base.ts';

// ========================= 会员标签核心实体 =========================

/**
 * 标签规则接口
 */
export interface TagRule {
  id: string;
  type: 'behavior' | 'demographic' | 'transaction' | 'custom';
  condition: string; // 条件表达式
  params: Record<string, any>;
  description: string;
  isActive: boolean;
}

/**
 * 会员标签完整信息接口
 */
export interface MemberTag extends BaseEntity {
  // 基础信息
  name: string;
  displayName: string;
  description?: string;
  
  // 标签类型和分类
  type: TagType;
  category: string;
  subcategory?: string;
  
  // 视觉设计
  color: string;
  backgroundColor?: string;
  icon?: string;
  
  // 标签属性
  priority: number; // 优先级，用于排序显示
  isSystem: boolean; // 是否为系统标签
  isAutoAssigned: boolean; // 是否自动分配
  isVisible: boolean; // 是否在前端显示
  isActive: boolean;
  
  // 自动标记规则
  autoRules: TagRule[];
  
  // 统计信息
  memberCount: number;
  usageCount: number;
  
  // 业务价值
  businessValue?: number; // 业务价值评分
  conversionRate?: number; // 转化率
  averageOrderValue?: number; // 平均订单价值
  
  // 生命周期
  validityPeriod?: number; // 有效期天数
  lastUpdated: string;
  
  // 扩展字段
  metadata?: Record<string, any>;
  customProperties?: Record<string, any>;
}

/**
 * 会员标签关联接口
 */
export interface MemberTagRelation extends BaseEntity {
  memberId: string;
  tagId: string;
  tag: MemberTag;
  
  // 分配信息
  assignedBy: 'system' | 'admin' | 'api' | 'import';
  assignedByUserId?: string;
  assignedReason?: string;
  assignedSource?: string;
  
  // 时间信息
  assignedAt: string;
  expiresAt?: string;
  lastUpdated: string;
  
  // 标签值（用于参数化标签）
  value?: string | number;
  properties?: Record<string, any>;
  
  // 状态
  isActive: boolean;
  confidence?: number; // 置信度 0-1
}

/**
 * 标签分组接口
 */
export interface TagGroup extends BaseEntity {
  name: string;
  displayName: string;
  description?: string;
  color: string;
  icon?: string;
  
  // 分组属性
  priority: number;
  isSystem: boolean;
  isActive: boolean;
  
  // 标签列表
  tags: MemberTag[];
  tagCount: number;
  
  // 业务规则
  maxTagsPerMember?: number; // 每个会员在此分组中最多可有的标签数
  exclusiveMode?: boolean; // 是否互斥模式（同组内只能有一个标签）
  
  // 统计信息
  memberCount: number;
  
  // 扩展字段
  metadata?: Record<string, any>;
}

// ========================= 查询参数 =========================

/**
 * 会员标签查询参数接口
 */
export interface MemberTagQueryInput extends PaginationInput {
  search?: string;
  name?: string;
  type?: TagType | TagType[];
  category?: string | string[];
  subcategory?: string;
  isSystem?: boolean;
  isAutoAssigned?: boolean;
  isVisible?: boolean;
  isActive?: boolean;
  memberCountMin?: number;
  memberCountMax?: number;
  businessValueMin?: number;
  businessValueMax?: number;
  
  // 包含关联数据
  includeRules?: boolean;
  includeStats?: boolean;
  includeMemberCount?: boolean;
}

/**
 * 会员标签关联查询参数接口
 */
export interface MemberTagRelationQueryInput extends PaginationInput {
  memberId?: string;
  tagId?: string | string[];
  tagType?: TagType | TagType[];
  tagCategory?: string | string[];
  assignedBy?: 'system' | 'admin' | 'api' | 'import';
  assignedByUserId?: string;
  assignedDateRange?: DateRange;
  expiresDateRange?: DateRange;
  isActive?: boolean;
  confidenceMin?: number;
  confidenceMax?: number;
  hasValue?: boolean;
  
  // 包含关联数据
  includeTag?: boolean;
  includeMember?: boolean;
}

/**
 * 标签分组查询参数接口
 */
export interface TagGroupQueryInput extends PaginationInput {
  search?: string;
  name?: string;
  isSystem?: boolean;
  isActive?: boolean;
  memberCountMin?: number;
  memberCountMax?: number;
  
  // 包含关联数据
  includeTags?: boolean;
  includeStats?: boolean;
}

// ========================= 输入类型 =========================

/**
 * 会员标签创建输入接口
 */
export interface MemberTagCreateInput {
  name: string;
  displayName: string;
  description?: string;
  type: TagType;
  category: string;
  subcategory?: string;
  color: string;
  backgroundColor?: string;
  icon?: string;
  priority?: number;
  isSystem?: boolean;
  isAutoAssigned?: boolean;
  isVisible?: boolean;
  isActive?: boolean;
  autoRules?: Omit<TagRule, 'id'>[];
  businessValue?: number;
  validityPeriod?: number;
  metadata?: Record<string, any>;
  customProperties?: Record<string, any>;
}

/**
 * 会员标签更新输入接口
 */
export interface MemberTagUpdateInput {
  name?: string;
  displayName?: string;
  description?: string;
  type?: TagType;
  category?: string;
  subcategory?: string;
  color?: string;
  backgroundColor?: string;
  icon?: string;
  priority?: number;
  isAutoAssigned?: boolean;
  isVisible?: boolean;
  isActive?: boolean;
  autoRules?: Omit<TagRule, 'id'>[];
  businessValue?: number;
  validityPeriod?: number;
  metadata?: Record<string, any>;
  customProperties?: Record<string, any>;
}

/**
 * 会员标签分配输入接口
 */
export interface MemberTagAssignInput {
  memberIds: string[];
  tagIds: string[];
  assignedReason?: string;
  assignedSource?: string;
  value?: string | number;
  properties?: Record<string, any>;
  expiresAt?: string;
  confidence?: number;
}

/**
 * 标签分组创建输入接口
 */
export interface TagGroupCreateInput {
  name: string;
  displayName: string;
  description?: string;
  color: string;
  icon?: string;
  priority?: number;
  isSystem?: boolean;
  isActive?: boolean;
  maxTagsPerMember?: number;
  exclusiveMode?: boolean;
  metadata?: Record<string, any>;
}

/**
 * 标签分组更新输入接口
 */
export interface TagGroupUpdateInput {
  name?: string;
  displayName?: string;
  description?: string;
  color?: string;
  icon?: string;
  priority?: number;
  isActive?: boolean;
  maxTagsPerMember?: number;
  exclusiveMode?: boolean;
  metadata?: Record<string, any>;
}

// ========================= 输出类型 =========================

/**
 * 会员标签列表响应接口
 */
export interface MemberTagsResponse extends PaginatedResponse<MemberTag> {
  stats?: {
    totalTags: number;
    systemTags: number;
    customTags: number;
    autoAssignedTags: number;
    totalMembers: number;
    averageTagsPerMember: number;
  };
  categories?: Array<{
    category: string;
    count: number;
    subcategories?: Array<{
      subcategory: string;
      count: number;
    }>;
  }>;
}

/**
 * 会员标签关联列表响应接口
 */
export interface MemberTagRelationsResponse extends PaginatedResponse<MemberTagRelation> {
  stats?: {
    totalRelations: number;
    activeRelations: number;
    systemAssigned: number;
    manualAssigned: number;
    averageConfidence: number;
  };
}

/**
 * 标签分组列表响应接口
 */
export interface TagGroupsResponse extends PaginatedResponse<TagGroup> {
  stats?: {
    totalGroups: number;
    systemGroups: number;
    customGroups: number;
    totalTags: number;
    averageTagsPerGroup: number;
  };
}

/**
 * 标签分析响应接口
 */
export interface TagAnalysisResponse {
  overview: {
    totalTags: number;
    totalRelations: number;
    averageTagsPerMember: number;
    mostUsedTags: Array<{
      tagId: string;
      tagName: string;
      memberCount: number;
      usageRate: number;
    }>;
  };
  
  categoryDistribution: Array<{
    category: string;
    tagCount: number;
    memberCount: number;
    percentage: number;
  }>;
  
  tagPerformance: Array<{
    tagId: string;
    tagName: string;
    memberCount: number;
    conversionRate: number;
    averageOrderValue: number;
    businessValue: number;
    roi: number;
  }>;
  
  memberSegmentation: Array<{
    segment: string;
    description: string;
    memberCount: number;
    tags: string[];
    characteristics: Record<string, any>;
  }>;
  
  trendAnalysis: Array<{
    date: string;
    newTags: number;
    newRelations: number;
    expiredRelations: number;
    netGrowth: number;
  }>;
  
  recommendations: Array<{
    type: 'create_tag' | 'merge_tags' | 'remove_tag' | 'update_rules';
    description: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
    data: Record<string, any>;
  }>;
}

/**
 * 会员标签画像接口
 */
export interface MemberTagProfile {
  memberId: string;
  totalTags: number;
  activeTags: number;
  
  tagsByCategory: Array<{
    category: string;
    tags: Array<{
      tagId: string;
      tagName: string;
      value?: string | number;
      confidence: number;
      assignedAt: string;
      expiresAt?: string;
    }>;
  }>;
  
  behaviorTags: MemberTagRelation[];
  demographicTags: MemberTagRelation[];
  transactionTags: MemberTagRelation[];
  customTags: MemberTagRelation[];
  
  segmentInfo: {
    primarySegment: string;
    secondarySegments: string[];
    confidence: number;
  };
  
  recommendations: Array<{
    type: 'product' | 'offer' | 'content' | 'service';
    title: string;
    description: string;
    priority: number;
    basedOnTags: string[];
  }>;
  
  riskFactors: Array<{
    factor: string;
    level: 'low' | 'medium' | 'high';
    description: string;
    relatedTags: string[];
  }>;
}

// ========================= 事件类型 =========================

/**
 * 标签分配事件
 */
export interface TagAssignedEvent {
  memberId: string;
  tagId: string;
  tagName: string;
  assignedBy: string;
  assignedReason?: string;
  confidence?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 标签移除事件
 */
export interface TagRemovedEvent {
  memberId: string;
  tagId: string;
  tagName: string;
  removedBy: string;
  removedReason?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 标签规则触发事件
 */
export interface TagRuleTriggeredEvent {
  ruleId: string;
  tagId: string;
  tagName: string;
  memberId: string;
  conditions: Record<string, any>;
  confidence: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ========================= 服务接口 =========================

/**
 * 会员标签服务接口
 */
export interface IMemberTagService {
  // 标签CRUD
  createTag(input: MemberTagCreateInput): Promise<MemberTag>;
  findTagById(id: string): Promise<MemberTag | null>;
  findTagByName(name: string): Promise<MemberTag | null>;
  updateTag(id: string, input: MemberTagUpdateInput): Promise<MemberTag>;
  deleteTag(id: string): Promise<boolean>;
  findTags(query: MemberTagQueryInput): Promise<MemberTagsResponse>;
  
  // 标签分组CRUD
  createTagGroup(input: TagGroupCreateInput): Promise<TagGroup>;
  findTagGroupById(id: string): Promise<TagGroup | null>;
  updateTagGroup(id: string, input: TagGroupUpdateInput): Promise<TagGroup>;
  deleteTagGroup(id: string): Promise<boolean>;
  findTagGroups(query: TagGroupQueryInput): Promise<TagGroupsResponse>;
  
  // 标签关联管理
  assignTags(input: MemberTagAssignInput): Promise<MemberTagRelation[]>;
  removeTags(memberIds: string[], tagIds: string[]): Promise<boolean>;
  findTagRelations(query: MemberTagRelationQueryInput): Promise<MemberTagRelationsResponse>;
  
  // 会员标签操作
  getMemberTags(memberId: string): Promise<MemberTagRelation[]>;
  getMemberTagsByCategory(memberId: string, category: string): Promise<MemberTagRelation[]>;
  addTagToMember(memberId: string, tagId: string, options?: Partial<MemberTagRelation>): Promise<MemberTagRelation>;
  removeTagFromMember(memberId: string, tagId: string): Promise<boolean>;
  
  // 标签规则引擎
  evaluateTagRules(memberId: string): Promise<MemberTagRelation[]>;
  processAutoTagging(): Promise<{ processed: number; assigned: number; removed: number }>;
  testTagRule(rule: TagRule, memberId: string): Promise<{ matches: boolean; confidence: number; details: any }>;
  
  // 分析和洞察
  getTagAnalysis(dateRange?: DateRange): Promise<TagAnalysisResponse>;
  getMemberTagProfile(memberId: string): Promise<MemberTagProfile>;
  getTagPerformance(tagId: string): Promise<any>;
  getSegmentAnalysis(): Promise<any>;
  
  // 批量操作
  batchAssignTags(memberIds: string[], tagIds: string[], options?: any): Promise<any>;
  batchRemoveTags(memberIds: string[], tagIds: string[]): Promise<any>;
  batchUpdateTagRelations(relations: Array<{ id: string; updates: Partial<MemberTagRelation> }>): Promise<any>;
  
  // 导入导出
  exportTags(query: MemberTagQueryInput): Promise<any[]>;
  importTags(data: any[]): Promise<any>;
  exportTagRelations(query: MemberTagRelationQueryInput): Promise<any[]>;
  importTagRelations(data: any[]): Promise<any>;
  
  // 推荐和建议
  suggestTagsForMember(memberId: string): Promise<Array<{ tag: MemberTag; confidence: number; reason: string }>>;
  suggestMembersForTag(tagId: string): Promise<Array<{ memberId: string; confidence: number; reason: string }>>;
  findSimilarMembers(memberId: string, limit?: number): Promise<Array<{ memberId: string; similarity: number; commonTags: string[] }>>;
} 