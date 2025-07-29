/**
 * 会员模块基础类型定义
 * @description 包含会员系统的基础枚举、接口和通用类型
 */

// ========================= 基础枚举 =========================

/**
 * 性别枚举
 */
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown'
}

/**
 * 会员状态枚举
 */
export enum MembershipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  PENDING = 'pending'
}

/**
 * 积分类型枚举
 */
export enum PointsType {
  // 获得积分
  EARNED_REGISTRATION = 'earned_registration',
  EARNED_LOGIN = 'earned_login',
  EARNED_ORDER = 'earned_order',
  EARNED_REVIEW = 'earned_review',
  EARNED_REFERRAL = 'earned_referral',
  EARNED_ACTIVITY = 'earned_activity',
  EARNED_CHECKIN = 'earned_checkin',
  EARNED_SHARE = 'earned_share',
  EARNED_ADMIN = 'earned_admin',
  
  // 消费积分
  SPENT_EXCHANGE = 'spent_exchange',
  SPENT_ORDER = 'spent_order',
  SPENT_DEDUCTION = 'spent_deduction',
  
  // 其他
  EXPIRED = 'expired',
  FROZEN = 'frozen',
  UNFROZEN = 'unfrozen',
  ADMIN_ADJUST = 'admin_adjust'
}

/**
 * 积分兑换类型枚举
 */
export enum ExchangeType {
  BALANCE = 'balance',
  COUPON = 'coupon',
  PRODUCT = 'product',
  PRIVILEGE = 'privilege',
  DISCOUNT = 'discount'
}

/**
 * 积分兑换状态枚举
 */
export enum ExchangeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
  EXPIRED = 'expired'
}

/**
 * 积分兑换记录状态枚举
 */
export enum ExchangeRecordStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

/**
 * 登录类型枚举
 */
export enum LoginType {
  WECHAT = 'wechat',
  PHONE = 'phone',
  EMAIL = 'email',
  USERNAME = 'username',
  THIRD_PARTY = 'third_party'
}

/**
 * 第三方平台枚举
 */
export enum ThirdPartyPlatform {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  QQ = 'qq',
  WEIBO = 'weibo',
  APPLE = 'apple',
  GOOGLE = 'google'
}

/**
 * 认证状态枚举
 */
export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

/**
 * 会员标签类型枚举
 */
export enum TagType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
  BEHAVIOR = 'behavior',
  PREFERENCE = 'preference',
  DEMOGRAPHIC = 'demographic'
}

/**
 * 通知类型枚举
 */
export enum NotificationType {
  SYSTEM = 'system',
  ORDER = 'order',
  POINTS = 'points',
  LEVEL = 'level',
  PROMOTION = 'promotion',
  SOCIAL = 'social'
}

// ========================= 基础接口 =========================

/**
 * 基础实体接口
 */
export interface BaseEntity {
  id: string;
  created: string;
  updated: string;
}

/**
 * 分页查询参数接口
 */
export interface PaginationInput {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分页响应信息接口
 */
export interface PaginationInfo {
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationInfo;
}

/**
 * 批量操作结果接口
 */
export interface BatchOperationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  totalCount: number;
  message: string;
  errors: string[];
  details?: Record<string, any>;
}

/**
 * API响应接口
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  meta?: Record<string, any>;
}

/**
 * 搜索条件接口
 */
export interface SearchCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin';
  value: any;
}

/**
 * 复杂查询接口
 */
export interface ComplexQuery {
  conditions: SearchCondition[];
  logic?: 'and' | 'or';
  pagination?: PaginationInput;
}

/**
 * 统计数据接口
 */
export interface StatsData {
  label: string;
  value: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

/**
 * 时间范围接口
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * 地理位置接口
 */
export interface Location {
  province: string;
  city: string;
  district: string;
  address: string;
  longitude?: number;
  latitude?: number;
  postalCode?: string;
}

/**
 * 联系方式接口
 */
export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  wechat?: string;
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  path: string;
  uploaded: string;
}

/**
 * 审计日志接口
 */
export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, { old: any; new: any }>;
  ip: string;
  userAgent: string;
  timestamp: string;
}

// ========================= 工具类型 =========================

/**
 * 部分可选类型
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 深度可选类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 排除字段类型
 */
export type OmitFields<T, K extends keyof T> = Omit<T, K>;

/**
 * 选择字段类型
 */
export type PickFields<T, K extends keyof T> = Pick<T, K>;

/**
 * 必需字段类型
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * 可空类型
 */
export type Nullable<T> = T | null;

/**
 * 可选可空类型
 */
export type Optional<T> = T | null | undefined;

// ========================= 常量定义 =========================

/**
 * 默认分页设置
 */
export const DEFAULT_PAGINATION = {
  page: 1,
  perPage: 20,
  maxPerPage: 100
} as const;

/**
 * 会员等级颜色映射
 */
export const LEVEL_COLORS = {
  bronze: '#CD7F32',
  silver: '#C0C0C0', 
  gold: '#FFD700',
  platinum: '#E5E4E2',
  diamond: '#B9F2FF'
} as const;

/**
 * 积分规则限制
 */
export const POINTS_LIMITS = {
  dailyMax: 1000,
  singleActionMax: 500,
  balanceMax: 999999,
  exchangeMin: 100
} as const;

/**
 * 验证规则
 */
export const VALIDATION_RULES = {
  username: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    minLength: 6,
    maxLength: 32,
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,32}$/
  }
} as const; 