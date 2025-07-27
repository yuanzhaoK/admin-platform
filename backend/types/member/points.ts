/**
 * 积分系统类型定义
 * @description 包含积分记录、规则、兑换、统计等相关类型
 */

import { 
  BaseEntity, 
  PaginationInput, 
  PaginatedResponse, 
  PointsType, 
  ExchangeType, 
  ExchangeStatus, 
  ExchangeRecordStatus,
  DateRange 
} from './base.ts';

// ========================= 积分核心实体 =========================

/**
 * 积分记录接口
 */
export interface PointsRecord extends BaseEntity {
  // 基础信息
  userId: string;
  username: string;
  
  // 积分信息
  type: PointsType;
  points: number;
  balance: number;
  
  // 描述信息
  reason: string;
  description?: string;
  
  // 关联信息
  orderId?: string;
  productId?: string;
  ruleId?: string;
  exchangeId?: string;
  relatedId?: string;
  
  // 时间信息
  earnedAt?: string;
  spentAt?: string;
  expiredAt?: string;
  
  // 状态信息
  status: 'active' | 'expired' | 'frozen' | 'cancelled';
  isReversible: boolean;
  
  // 来源信息
  source: 'system' | 'manual' | 'import' | 'api';
  operatorId?: string;
  operatorName?: string;
  
  // 扩展信息
  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * 积分规则接口
 */
export interface PointsRule extends BaseEntity {
  // 基础信息
  name: string;
  displayName: string;
  description?: string;
  
  // 规则类型
  type: PointsType;
  category: 'basic' | 'promotion' | 'special' | 'admin';
  
  // 积分设置
  points: number;
  pointsMax?: number; // 最大积分（随机积分时使用）
  
  // 条件设置
  conditions: PointsRuleCondition[];
  
  // 限制设置
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  totalLimit?: number;
  userDailyLimit?: number;
  userTotalLimit?: number;
  
  // 时间设置
  startTime?: string;
  endTime?: string;
  validDays?: number[]; // 有效星期几 0-6
  validHours?: number[]; // 有效小时 0-23
  
  // 状态设置
  isActive: boolean;
  priority: number;
  weight?: number; // 权重，用于多规则匹配
  
  // 高级设置
  formula?: string; // 计算公式
  multiplier?: number; // 倍数
  excludeUsers?: string[]; // 排除用户
  includeUsers?: string[]; // 仅包含用户
  
  // 统计信息
  usageCount: number;
  totalPointsGranted: number;
  lastUsedAt?: string;
  
  // 扩展信息
  customConfig?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 积分规则条件接口
 */
export interface PointsRuleCondition {
  id: string;
  field: string; // 字段名
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'between' | 'exists';
  value: any;
  valueMax?: any; // 用于between操作
  description: string;
  weight?: number;
}

/**
 * 积分兑换商品接口
 */
export interface PointsExchange extends BaseEntity {
  // 基础信息
  name: string;
  displayName: string;
  description?: string;
  subtitle?: string;
  
  // 商品信息
  image?: string;
  images?: string[];
  category: string;
  tags?: string[];
  
  // 积分设置
  pointsRequired: number;
  originalPrice?: number; // 原价，用于显示优惠
  
  // 兑换类型和奖励
  exchangeType: ExchangeType;
  rewardValue?: number;
  rewardUnit?: string; // 奖励单位（元、天、次等）
  rewardProductId?: string;
  rewardCouponId?: string;
  rewardConfig?: Record<string, any>;
  
  // 库存管理
  stock?: number;
  unlimitedStock: boolean;
  virtualStock?: number; // 虚拟库存（用于营销）
  dailyStock?: number; // 每日库存
  userDailyLimit?: number; // 用户每日限额
  userTotalLimit?: number; // 用户总限额
  
  // 状态管理
  status: ExchangeStatus;
  
  // 时间设置
  startTime?: string;
  endTime?: string;
  
  // 兑换条件
  conditions?: PointsExchangeCondition[];
  
  // 排序和显示
  sortOrder: number;
  isHot: boolean; // 是否热门
  isNew: boolean; // 是否新品
  isRecommended: boolean; // 是否推荐
  
  // 统计信息
  usedCount: number;
  totalPointsSpent: number;
  conversionRate?: number;
  rating?: number;
  reviewCount?: number;
  
  // 扩展信息
  customConfig?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 积分兑换条件接口
 */
export interface PointsExchangeCondition {
  id: string;
  type: 'level' | 'points' | 'orders' | 'amount' | 'tag' | 'date' | 'custom';
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin';
  value: any;
  description: string;
  errorMessage?: string;
}

/**
 * 积分兑换记录接口
 */
export interface PointsExchangeRecord extends BaseEntity {
  // 基础信息
  userId: string;
  username: string;
  exchangeId: string;
  exchange?: PointsExchange;
  
  // 兑换信息
  pointsCost: number;
  quantity: number;
  totalPointsCost: number;
  
  // 奖励信息
  rewardType: ExchangeType;
  rewardValue?: number;
  rewardDescription?: string;
  
  // 状态信息
  status: ExchangeRecordStatus;
  
  // 处理信息
  processedAt?: string;
  processedBy?: string;
  failureReason?: string;
  
  // 发货信息（实物商品）
  shippingAddress?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // 扩展信息
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * 积分到期提醒接口
 */
export interface PointsExpiryNotification extends BaseEntity {
  userId: string;
  username: string;
  expiringPoints: number;
  expiryDate: string;
  notificationSent: boolean;
  notificationSentAt?: string;
  remindBefore: number; // 提前几天提醒
  status: 'pending' | 'sent' | 'expired';
}

// ========================= 查询参数 =========================

/**
 * 积分记录查询参数接口
 */
export interface PointsRecordQueryInput extends PaginationInput {
  userId?: string | string[];
  username?: string;
  type?: PointsType | PointsType[];
  pointsMin?: number;
  pointsMax?: number;
  status?: 'active' | 'expired' | 'frozen' | 'cancelled';
  dateRange?: DateRange;
  earnedDateRange?: DateRange;
  expiredDateRange?: DateRange;
  orderId?: string;
  ruleId?: string;
  exchangeId?: string;
  source?: 'system' | 'manual' | 'import' | 'api';
  operatorId?: string;
  tags?: string | string[];
  
  // 包含关联数据
  includeUser?: boolean;
  includeRule?: boolean;
  includeExchange?: boolean;
}

/**
 * 积分规则查询参数接口
 */
export interface PointsRuleQueryInput extends PaginationInput {
  search?: string;
  name?: string;
  type?: PointsType | PointsType[];
  category?: 'basic' | 'promotion' | 'special' | 'admin';
  isActive?: boolean;
  pointsMin?: number;
  pointsMax?: number;
  startTimeRange?: DateRange;
  endTimeRange?: DateRange;
  usageCountMin?: number;
  usageCountMax?: number;
  
  // 包含关联数据
  includeConditions?: boolean;
  includeStats?: boolean;
}

/**
 * 积分兑换商品查询参数接口
 */
export interface PointsExchangeQueryInput extends PaginationInput {
  search?: string;
  name?: string;
  category?: string | string[];
  exchangeType?: ExchangeType | ExchangeType[];
  status?: ExchangeStatus | ExchangeStatus[];
  pointsRequiredMin?: number;
  pointsRequiredMax?: number;
  hasStock?: boolean;
  isHot?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  startTimeRange?: DateRange;
  endTimeRange?: DateRange;
  
  // 包含关联数据
  includeConditions?: boolean;
  includeStats?: boolean;
}

/**
 * 积分兑换记录查询参数接口
 */
export interface PointsExchangeRecordQueryInput extends PaginationInput {
  userId?: string | string[];
  username?: string;
  exchangeId?: string | string[];
  status?: ExchangeRecordStatus | ExchangeRecordStatus[];
  rewardType?: ExchangeType | ExchangeType[];
  dateRange?: DateRange;
  processedDateRange?: DateRange;
  pointsCostMin?: number;
  pointsCostMax?: number;
  
  // 包含关联数据
  includeUser?: boolean;
  includeExchange?: boolean;
}

// ========================= 输入类型 =========================

/**
 * 积分调整输入接口
 */
export interface PointsAdjustmentInput {
  userId: string;
  points: number;
  type: PointsType;
  reason: string;
  description?: string;
  expiredAt?: string;
  orderId?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

/**
 * 积分规则创建输入接口
 */
export interface PointsRuleCreateInput {
  name: string;
  displayName: string;
  description?: string;
  type: PointsType;
  category: 'basic' | 'promotion' | 'special' | 'admin';
  points: number;
  pointsMax?: number;
  conditions?: Omit<PointsRuleCondition, 'id'>[];
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  totalLimit?: number;
  userDailyLimit?: number;
  userTotalLimit?: number;
  startTime?: string;
  endTime?: string;
  validDays?: number[];
  validHours?: number[];
  isActive?: boolean;
  priority?: number;
  weight?: number;
  formula?: string;
  multiplier?: number;
  excludeUsers?: string[];
  includeUsers?: string[];
  customConfig?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 积分规则更新输入接口
 */
export interface PointsRuleUpdateInput {
  name?: string;
  displayName?: string;
  description?: string;
  type?: PointsType;
  category?: 'basic' | 'promotion' | 'special' | 'admin';
  points?: number;
  pointsMax?: number;
  conditions?: Omit<PointsRuleCondition, 'id'>[];
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  totalLimit?: number;
  userDailyLimit?: number;
  userTotalLimit?: number;
  startTime?: string;
  endTime?: string;
  validDays?: number[];
  validHours?: number[];
  isActive?: boolean;
  priority?: number;
  weight?: number;
  formula?: string;
  multiplier?: number;
  excludeUsers?: string[];
  includeUsers?: string[];
  customConfig?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 积分兑换商品创建输入接口
 */
export interface PointsExchangeCreateInput {
  name: string;
  displayName: string;
  description?: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  category: string;
  tags?: string[];
  pointsRequired: number;
  originalPrice?: number;
  exchangeType: ExchangeType;
  rewardValue?: number;
  rewardUnit?: string;
  rewardProductId?: string;
  rewardCouponId?: string;
  rewardConfig?: Record<string, any>;
  stock?: number;
  unlimitedStock?: boolean;
  virtualStock?: number;
  dailyStock?: number;
  userDailyLimit?: number;
  userTotalLimit?: number;
  status?: ExchangeStatus;
  startTime?: string;
  endTime?: string;
  conditions?: Omit<PointsExchangeCondition, 'id'>[];
  sortOrder?: number;
  isHot?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  customConfig?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 积分兑换商品更新输入接口
 */
export interface PointsExchangeUpdateInput {
  name?: string;
  displayName?: string;
  description?: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  category?: string;
  tags?: string[];
  pointsRequired?: number;
  originalPrice?: number;
  exchangeType?: ExchangeType;
  rewardValue?: number;
  rewardUnit?: string;
  rewardProductId?: string;
  rewardCouponId?: string;
  rewardConfig?: Record<string, any>;
  stock?: number;
  unlimitedStock?: boolean;
  virtualStock?: number;
  dailyStock?: number;
  userDailyLimit?: number;
  userTotalLimit?: number;
  status?: ExchangeStatus;
  startTime?: string;
  endTime?: string;
  conditions?: Omit<PointsExchangeCondition, 'id'>[];
  sortOrder?: number;
  isHot?: boolean;
  isNew?: boolean;
  isRecommended?: boolean;
  customConfig?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 积分兑换输入接口
 */
export interface PointsExchangeInput {
  exchangeId: string;
  quantity?: number;
  shippingAddress?: string;
  notes?: string;
}

// ========================= 输出类型 =========================

/**
 * 积分记录列表响应接口
 */
export interface PointsRecordsResponse extends PaginatedResponse<PointsRecord> {
  stats?: {
    totalPoints: number;
    earnedPoints: number;
    spentPoints: number;
    expiredPoints: number;
    balancePoints: number;
  };
}

/**
 * 积分规则列表响应接口
 */
export interface PointsRulesResponse extends PaginatedResponse<PointsRule> {
  stats?: {
    totalRules: number;
    activeRules: number;
    totalUsage: number;
    totalPointsGranted: number;
  };
}

/**
 * 积分兑换商品列表响应接口
 */
export interface PointsExchangesResponse extends PaginatedResponse<PointsExchange> {
  stats?: {
    totalExchanges: number;
    activeExchanges: number;
    totalStock: number;
    totalExchanged: number;
  };
  categories?: Array<{
    category: string;
    count: number;
    totalStock: number;
  }>;
}

/**
 * 积分兑换记录列表响应接口
 */
export interface PointsExchangeRecordsResponse extends PaginatedResponse<PointsExchangeRecord> {
  stats?: {
    totalRecords: number;
    completedRecords: number;
    pendingRecords: number;
    totalPointsSpent: number;
  };
}

/**
 * 积分统计响应接口
 */
export interface PointsStatsResponse {
  overview: {
    totalUsers: number;
    totalPoints: number;
    totalEarned: number;
    totalSpent: number;
    totalExpired: number;
    totalFrozen: number;
    averageBalance: number;
  };
  
  typeDistribution: Array<{
    type: PointsType;
    count: number;
    points: number;
    percentage: number;
  }>;
  
  rulePerformance: Array<{
    ruleId: string;
    ruleName: string;
    usageCount: number;
    totalPoints: number;
    averagePoints: number;
    lastUsed: string;
  }>;
  
  exchangeStats: Array<{
    exchangeId: string;
    exchangeName: string;
    totalExchanged: number;
    totalPointsSpent: number;
    conversionRate: number;
    revenue: number;
  }>;
  
  trendAnalysis: Array<{
    date: string;
    earned: number;
    spent: number;
    expired: number;
    balance: number;
    activeUsers: number;
  }>;
  
  userSegmentation: Array<{
    segment: string;
    userCount: number;
    averageBalance: number;
    averageEarned: number;
    averageSpent: number;
    engagementRate: number;
  }>;
}

/**
 * 用户积分概览接口
 */
export interface UserPointsOverview {
  userId: string;
  username: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalExpired: number;
  
  recentRecords: PointsRecord[];
  upcomingExpiry: Array<{
    points: number;
    expiryDate: string;
    daysRemaining: number;
  }>;
  
  availableExchanges: PointsExchange[];
  recommendedExchanges: PointsExchange[];
  
  statistics: {
    thisMonthEarned: number;
    thisMonthSpent: number;
    averageMonthlyEarned: number;
    totalOrders: number;
    averagePointsPerOrder: number;
    membershipDuration: number;
  };
}

// ========================= 事件类型 =========================

/**
 * 积分获得事件
 */
export interface PointsEarnedEvent {
  userId: string;
  username: string;
  points: number;
  balance: number;
  type: PointsType;
  reason: string;
  ruleId?: string;
  orderId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 积分消费事件
 */
export interface PointsSpentEvent {
  userId: string;
  username: string;
  points: number;
  balance: number;
  type: PointsType;
  reason: string;
  exchangeId?: string;
  orderId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 积分到期事件
 */
export interface PointsExpiredEvent {
  userId: string;
  username: string;
  expiredPoints: number;
  remainingBalance: number;
  expiryDate: string;
  recordIds: string[];
  timestamp: string;
}

/**
 * 积分兑换事件
 */
export interface PointsExchangedEvent {
  userId: string;
  username: string;
  exchangeId: string;
  exchangeName: string;
  pointsCost: number;
  quantity: number;
  rewardType: ExchangeType;
  rewardValue?: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ========================= 服务接口 =========================

/**
 * 积分服务接口
 */
export interface IPointsService {
  // 积分记录管理
  getPointsRecords(query: PointsRecordQueryInput): Promise<PointsRecordsResponse>;
  getPointsRecord(id: string): Promise<PointsRecord | null>;
  getUserPointsOverview(userId: string): Promise<UserPointsOverview>;
  
  // 积分操作
  adjustPoints(input: PointsAdjustmentInput): Promise<PointsRecord>;
  batchAdjustPoints(inputs: PointsAdjustmentInput[]): Promise<PointsRecord[]>;
  freezePoints(userId: string, points: number, reason: string): Promise<boolean>;
  unfreezePoints(userId: string, points: number, reason: string): Promise<boolean>;
  
  // 积分规则管理
  createPointsRule(input: PointsRuleCreateInput): Promise<PointsRule>;
  updatePointsRule(id: string, input: PointsRuleUpdateInput): Promise<PointsRule>;
  deletePointsRule(id: string): Promise<boolean>;
  getPointsRules(query: PointsRuleQueryInput): Promise<PointsRulesResponse>;
  getPointsRule(id: string): Promise<PointsRule | null>;
  
  // 积分计算
  calculatePointsByRule(userId: string, ruleId: string, context?: any): Promise<number>;
  evaluateAllRules(userId: string, action: string, context?: any): Promise<PointsRecord[]>;
  
  // 积分兑换商品管理
  createPointsExchange(input: PointsExchangeCreateInput): Promise<PointsExchange>;
  updatePointsExchange(id: string, input: PointsExchangeUpdateInput): Promise<PointsExchange>;
  deletePointsExchange(id: string): Promise<boolean>;
  getPointsExchanges(query: PointsExchangeQueryInput): Promise<PointsExchangesResponse>;
  getPointsExchange(id: string): Promise<PointsExchange | null>;
  
  // 积分兑换操作
  exchangePoints(userId: string, input: PointsExchangeInput): Promise<PointsExchangeRecord>;
  processExchangeRecord(recordId: string, status: ExchangeRecordStatus, reason?: string): Promise<PointsExchangeRecord>;
  getExchangeRecords(query: PointsExchangeRecordQueryInput): Promise<PointsExchangeRecordsResponse>;
  getUserExchangeRecords(userId: string): Promise<PointsExchangeRecord[]>;
  
  // 统计分析
  getPointsStats(dateRange?: DateRange): Promise<PointsStatsResponse>;
  getRulePerformance(ruleId: string, dateRange?: DateRange): Promise<any>;
  getExchangePerformance(exchangeId: string, dateRange?: DateRange): Promise<any>;
  
  // 到期管理
  processExpiringPoints(): Promise<{ processed: number; expired: number; notified: number }>;
  getExpiringPoints(userId: string, days?: number): Promise<Array<{ points: number; expiryDate: string }>>;
  
  // 导入导出
  exportPointsRecords(query: PointsRecordQueryInput): Promise<any[]>;
  importPointsRecords(data: any[]): Promise<any>;
} 