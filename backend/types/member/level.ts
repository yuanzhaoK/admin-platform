/**
 * 会员等级类型定义
 * @description 包含会员等级、权益、升级规则等相关类型
 */

import { BaseEntity, PaginationInput, PaginatedResponse, DateRange } from './base.ts';

// ========================= 会员等级核心实体 =========================

/**
 * 会员等级权益接口
 */
export interface LevelBenefit {
  id: string;
  type: 'discount' | 'freeShipping' | 'privilege' | 'service' | 'points' | 'custom';
  name: string;
  description: string;
  value?: number; // 数值型权益的值
  condition?: string; // 权益条件描述
  icon?: string;
  isActive: boolean;
}

/**
 * 会员等级升级条件接口
 */
export interface LevelUpgradeCondition {
  type: 'points' | 'amount' | 'orders' | 'duration' | 'custom';
  operator: 'gte' | 'gt' | 'eq' | 'between';
  value: number;
  valueMax?: number; // 用于between操作
  description: string;
  weight?: number; // 权重，用于多条件综合评分
}

/**
 * 会员等级保级规则接口
 */
export interface LevelMaintenanceRule {
  enabled: boolean;
  period: 'monthly' | 'quarterly' | 'yearly';
  conditions: LevelUpgradeCondition[];
  downgradeToLevelId?: string;
  gracePeriod?: number; // 宽限期天数
  notificationDays?: number[]; // 提前通知天数
}

/**
 * 会员等级完整信息接口
 */
export interface MemberLevel extends BaseEntity {
  // 基础信息
  name: string;
  displayName: string;
  description?: string;
  slogan?: string;
  
  // 视觉设计
  icon?: string;
  color: string;
  backgroundColor?: string;
  badgeImage?: string;
  
  // 等级设置
  level: number; // 等级序号，用于排序
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean; // 是否为默认等级
  
  // 升级条件
  upgradeConditions: LevelUpgradeCondition[];
  pointsRequired: number; // 主要升级条件：所需积分
  
  // 等级权益
  benefits: LevelBenefit[];
  discountRate: number; // 折扣率 (0.8 = 8折)
  pointsRate: number; // 积分倍率 (1.5 = 1.5倍积分)
  freeShippingThreshold: number; // 免邮门槛
  
  // 保级规则
  maintenanceRule: LevelMaintenanceRule;
  
  // 统计信息
  memberCount: number;
  averageOrderValue: number;
  totalRevenue: number;
  
  // 业务规则
  maxValidityDays?: number; // 最大有效期天数
  allowDowngrade: boolean; // 是否允许降级
  autoUpgrade: boolean; // 是否自动升级
  
  // 扩展字段
  customBenefits?: Record<string, any>;
  businessRules?: Record<string, any>;
  metadata?: Record<string, any>;
}

// ========================= 查询参数 =========================

/**
 * 会员等级查询参数接口
 */
export interface MemberLevelQueryInput extends PaginationInput {
  search?: string;
  name?: string;
  level?: number;
  levelMin?: number;
  levelMax?: number;
  isActive?: boolean;
  isDefault?: boolean;
  pointsRequiredMin?: number;
  pointsRequiredMax?: number;
  discountRateMin?: number;
  discountRateMax?: number;
  memberCountMin?: number;
  memberCountMax?: number;
  
  // 包含关联数据
  includeBenefits?: boolean;
  includeStats?: boolean;
  includeMemberCount?: boolean;
}

// ========================= 输入类型 =========================

/**
 * 会员等级创建输入接口
 */
export interface MemberLevelCreateInput {
  name: string;
  displayName: string;
  description?: string;
  slogan?: string;
  icon?: string;
  color: string;
  backgroundColor?: string;
  badgeImage?: string;
  level: number;
  sortOrder: number;
  isActive?: boolean;
  isDefault?: boolean;
  upgradeConditions: Omit<LevelUpgradeCondition, 'id'>[];
  pointsRequired: number;
  benefits?: Omit<LevelBenefit, 'id'>[];
  discountRate: number;
  pointsRate?: number;
  freeShippingThreshold?: number;
  maintenanceRule?: Partial<LevelMaintenanceRule>;
  maxValidityDays?: number;
  allowDowngrade?: boolean;
  autoUpgrade?: boolean;
  customBenefits?: Record<string, any>;
  businessRules?: Record<string, any>;
}

/**
 * 会员等级更新输入接口
 */
export interface MemberLevelUpdateInput {
  name?: string;
  displayName?: string;
  description?: string;
  slogan?: string;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  badgeImage?: string;
  level?: number;
  sortOrder?: number;
  isActive?: boolean;
  isDefault?: boolean;
  upgradeConditions?: Omit<LevelUpgradeCondition, 'id'>[];
  pointsRequired?: number;
  benefits?: Omit<LevelBenefit, 'id'>[];
  discountRate?: number;
  pointsRate?: number;
  freeShippingThreshold?: number;
  maintenanceRule?: Partial<LevelMaintenanceRule>;
  maxValidityDays?: number;
  allowDowngrade?: boolean;
  autoUpgrade?: boolean;
  customBenefits?: Record<string, any>;
  businessRules?: Record<string, any>;
}

// ========================= 输出类型 =========================

/**
 * 会员等级列表响应接口
 */
export interface MemberLevelsResponse extends PaginatedResponse<MemberLevel> {
  stats?: {
    totalLevels: number;
    activeLevels: number;
    totalMembers: number;
    averageLevel: number;
  };
}

/**
 * 会员等级统计响应接口
 */
export interface MemberLevelStatsResponse {
  overview: {
    totalLevels: number;
    activeLevels: number;
    totalMembers: number;
    averageUpgradeTime: number; // 平均升级时间（天）
  };
  distribution: Array<{
    levelId: string;
    levelName: string;
    memberCount: number;
    percentage: number;
    averageOrderValue: number;
    totalRevenue: number;
  }>;
  upgradeTrend: Array<{
    date: string;
    upgrades: number;
    downgrades: number;
    netChange: number;
  }>;
  benefitUsage: Array<{
    benefitType: string;
    benefitName: string;
    usageCount: number;
    savings: number;
  }>;
  revenueImpact: Array<{
    levelId: string;
    levelName: string;
    revenue: number;
    orderCount: number;
    avgOrderValue: number;
    discountAmount: number;
    netRevenue: number;
  }>;
}

// ========================= 升级相关类型 =========================

/**
 * 等级升级检查结果接口
 */
export interface LevelUpgradeCheckResult {
  canUpgrade: boolean;
  targetLevelId?: string;
  targetLevel?: MemberLevel;
  currentConditions: Array<{
    condition: LevelUpgradeCondition;
    currentValue: number;
    requiredValue: number;
    satisfied: boolean;
    progress: number; // 0-1
  }>;
  nextMilestone?: {
    levelId: string;
    levelName: string;
    requirements: Array<{
      type: string;
      description: string;
      currentValue: number;
      requiredValue: number;
      remaining: number;
    }>;
  };
}

/**
 * 等级升级历史记录接口
 */
export interface LevelUpgradeHistory extends BaseEntity {
  memberId: string;
  username: string;
  fromLevelId: string;
  fromLevelName: string;
  toLevelId: string;
  toLevelName: string;
  upgradeType: 'auto' | 'manual' | 'admin';
  reason: string;
  conditions: Array<{
    type: string;
    value: number;
    satisfied: boolean;
  }>;
  operatorId?: string;
  operatorName?: string;
  upgradeTime: string;
  
  // 升级前后的数据快照
  beforeSnapshot: {
    points: number;
    totalOrders: number;
    totalAmount: number;
  };
  afterSnapshot: {
    points: number;
    totalOrders: number;
    totalAmount: number;
  };
}

/**
 * 等级保级检查结果接口
 */
export interface LevelMaintenanceCheckResult {
  needsAttention: boolean;
  currentLevel: MemberLevel;
  maintenanceStatus: 'safe' | 'warning' | 'danger' | 'expired';
  nextCheckDate: string;
  conditions: Array<{
    condition: LevelUpgradeCondition;
    currentValue: number;
    requiredValue: number;
    satisfied: boolean;
    timeRemaining: number; // 天数
  }>;
  recommendations?: string[];
  possibleDowngradeLevel?: MemberLevel;
}

// ========================= 事件类型 =========================

/**
 * 等级升级事件
 */
export interface LevelUpgradeEvent {
  memberId: string;
  username: string;
  fromLevelId: string;
  toLevelId: string;
  upgradeType: 'auto' | 'manual' | 'admin';
  reason: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 等级降级事件
 */
export interface LevelDowngradeEvent {
  memberId: string;
  username: string;
  fromLevelId: string;
  toLevelId: string;
  downgradeType: 'auto' | 'maintenance' | 'admin';
  reason: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 等级配置变更事件
 */
export interface LevelConfigChangedEvent {
  levelId: string;
  levelName: string;
  changeType: 'created' | 'updated' | 'deleted' | 'activated' | 'deactivated';
  changes?: Record<string, { old: any; new: any }>;
  operatorId: string;
  timestamp: string;
}

// ========================= 服务接口 =========================

/**
 * 会员等级服务接口
 */
export interface IMemberLevelService {
  // 基础CRUD
  create(input: MemberLevelCreateInput): Promise<MemberLevel>;
  findById(id: string): Promise<MemberLevel | null>;
  findByName(name: string): Promise<MemberLevel | null>;
  findByLevel(level: number): Promise<MemberLevel | null>;
  update(id: string, input: MemberLevelUpdateInput): Promise<MemberLevel>;
  delete(id: string): Promise<boolean>;
  
  // 查询
  findMany(query: MemberLevelQueryInput): Promise<MemberLevelsResponse>;
  getAll(): Promise<MemberLevel[]>;
  getActive(): Promise<MemberLevel[]>;
  getDefault(): Promise<MemberLevel | null>;
  
  // 等级管理
  activate(id: string): Promise<boolean>;
  deactivate(id: string): Promise<boolean>;
  setDefault(id: string): Promise<boolean>;
  reorder(levelIds: string[]): Promise<boolean>;
  
  // 升级逻辑
  checkUpgradeEligibility(memberId: string): Promise<LevelUpgradeCheckResult>;
  upgradeToLevel(memberId: string, levelId: string, reason?: string): Promise<boolean>;
  autoUpgradeCheck(memberId: string): Promise<boolean>;
  batchUpgradeCheck(): Promise<Array<{ memberId: string; result: LevelUpgradeCheckResult }>>;
  
  // 保级逻辑
  checkMaintenance(memberId: string): Promise<LevelMaintenanceCheckResult>;
  processMaintenanceCheck(): Promise<Array<{ memberId: string; result: LevelMaintenanceCheckResult }>>;
  
  // 统计分析
  getStats(dateRange?: DateRange): Promise<MemberLevelStatsResponse>;
  getUpgradeHistory(memberId?: string): Promise<LevelUpgradeHistory[]>;
  getLevelPerformance(levelId: string): Promise<any>;
  
  // 权益管理
  getBenefits(levelId: string): Promise<LevelBenefit[]>;
  addBenefit(levelId: string, benefit: Omit<LevelBenefit, 'id'>): Promise<LevelBenefit>;
  updateBenefit(levelId: string, benefitId: string, benefit: Partial<LevelBenefit>): Promise<LevelBenefit>;
  removeBenefit(levelId: string, benefitId: string): Promise<boolean>;
  
  // 业务逻辑
  calculateDiscount(memberId: string, originalPrice: number): Promise<number>;
  calculatePointsRate(memberId: string): Promise<number>;
  checkFreeShipping(memberId: string, orderAmount: number): Promise<boolean>;
  validateBenefitUsage(memberId: string, benefitType: string): Promise<boolean>;
} 