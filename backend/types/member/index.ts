/**
 * 会员模块统一导出
 * @description 导出所有会员相关的类型定义、接口和常量
 */

import { VALIDATION_RULES } from './base.ts';

// ========================= 基础类型导出 =========================
export * from './base.ts';

// ========================= 核心模块导出 =========================
export * from './member.ts';
export * from './level.ts';
export * from './points.ts';
export * from './address.ts';
export * from './tags.ts';

// ========================= 类型重导出和别名 =========================

// 基础类型别名
export type {
  BaseEntity,
  PaginationInput,
  PaginationInfo,
  PaginatedResponse,
  BatchOperationResult,
  ApiResponse,
  DateRange,
  StatsData
} from './base.ts';

// 枚举类型别名
export {
  Gender,
  MembershipStatus,
  PointsType,
  ExchangeType,
  ExchangeStatus,
  ExchangeRecordStatus,
  LoginType,
  ThirdPartyPlatform,
  VerificationStatus,
  TagType,
  NotificationType
} from './base.ts';

// 会员相关类型别名
export type {
  Member,
  MemberProfile,
  MemberStats,
  MemberVerification,
  MembersResponse,
  MemberDetailResponse,
  MemberStatsResponse,
  MemberQueryInput,
  MemberCreateInput,
  MemberUpdateInput,
  ProfileUpdateInput
} from './member.ts';

// 会员等级相关类型别名
export type {
  MemberLevel,
  LevelBenefit,
  LevelUpgradeCondition,
  LevelMaintenanceRule,
  MemberLevelsResponse,
  MemberLevelStatsResponse,
  LevelUpgradeCheckResult,
  LevelUpgradeHistory,
  MemberLevelQueryInput,
  MemberLevelCreateInput,
  MemberLevelUpdateInput
} from './level.ts';

// 积分相关类型别名
export type {
  PointsRecord,
  PointsRule,
  PointsExchange,
  PointsExchangeRecord,
  PointsRecordsResponse,
  PointsRulesResponse,
  PointsExchangesResponse,
  PointsStatsResponse,
  UserPointsOverview,
  PointsRecordQueryInput,
  PointsRuleQueryInput,
  PointsExchangeQueryInput,
  PointsRuleCreateInput,
  PointsExchangeCreateInput,
  PointsAdjustmentInput
} from './points.ts';

// 地址相关类型别名
export type {
  Address,
  AddressTemplate,
  AddressValidationResult,
  Region,
  RegionTree,
  AddressesResponse,
  AddressStatsResponse,
  AddressQueryInput,
  AddressCreateInput,
  AddressUpdateInput,
  AddressValidationInput
} from './address.ts';

// 标签相关类型别名
export type {
  MemberTag,
  MemberTagRelation,
  TagGroup,
  TagRule,
  MemberTagsResponse,
  TagAnalysisResponse,
  MemberTagProfile,
  MemberTagQueryInput,
  MemberTagCreateInput,
  MemberTagAssignInput
} from './tags.ts';

// ========================= 服务接口导出 =========================
export type { IMemberService } from './member.ts';
export type { IMemberLevelService } from './level.ts';
export type { IPointsService } from './points.ts';
export type { IAddressService } from './address.ts';
export type { IMemberTagService } from './tags.ts';

// ========================= 事件类型导出 =========================
export type {
  MemberRegisteredEvent,
  MemberLevelUpgradedEvent,
  MemberStatusChangedEvent,
  MemberVerifiedEvent
} from './member.ts';

export type {
  LevelUpgradeEvent,
  LevelDowngradeEvent,
  LevelConfigChangedEvent
} from './level.ts';

export type {
  PointsEarnedEvent,
  PointsSpentEvent,
  PointsExpiredEvent,
  PointsExchangedEvent
} from './points.ts';

export type {
  AddressCreatedEvent,
  AddressUpdatedEvent,
  AddressValidatedEvent,
  AddressUsedEvent
} from './address.ts';

export type {
  TagAssignedEvent,
  TagRemovedEvent,
  TagRuleTriggeredEvent
} from './tags.ts';

// ========================= 常量导出 =========================
export {
  DEFAULT_PAGINATION,
  LEVEL_COLORS,
  POINTS_LIMITS,
  VALIDATION_RULES
} from './base.ts';

// ========================= 工具类型导出 =========================
export type {
  PartialBy,
  DeepPartial,
  OmitFields,
  PickFields,
  RequireFields,
  Nullable,
  Optional
} from './base.ts';

// ========================= 类型守卫函数 =========================

/**
 * 检查是否为有效的会员对象
 */
export function isMember(obj: any): boolean {
  return obj && 
        typeof obj.id === 'string' && 
        typeof obj.profile === 'object' &&
        typeof obj.level === 'object' &&
        typeof obj.points === 'number';
}

/**
 * 检查是否为有效的会员等级对象
 */
export function isMemberLevel(obj: any): boolean {
  return obj && 
        typeof obj.id === 'string' && 
        typeof obj.name === 'string' &&
        typeof obj.pointsRequired === 'number' &&
        typeof obj.discountRate === 'number';
}

/**
 * 检查是否为有效的积分记录对象
 */
export function isPointsRecord(obj: any): boolean {
  return obj && 
        typeof obj.id === 'string' && 
        typeof obj.userId === 'string' &&
        typeof obj.points === 'number' &&
        typeof obj.type === 'string';
}

/**
 * 检查是否为有效的地址对象
 */
export function isAddress(obj: any): boolean {
  return obj && 
        typeof obj.id === 'string' && 
        typeof obj.userId === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.phone === 'string' &&
        typeof obj.address === 'string';
}

/**
 * 检查是否为有效的会员标签对象
 */
export function isMemberTag(obj: any): boolean {
  return obj && 
        typeof obj.id === 'string' && 
        typeof obj.name === 'string' &&
        typeof obj.type === 'string';
}

// ========================= 枚举值数组 =========================

/**
 * 性别选项数组
 */
export const GENDER_OPTIONS = ['male', 'female', 'unknown'] as const;

/**
 * 会员状态选项数组
 */
export const MEMBER_STATUS_OPTIONS = ['active', 'inactive', 'banned', 'pending'] as const;

/**
 * 积分类型选项数组
 */
export const POINTS_TYPE_OPTIONS = [
  'earned_registration', 'earned_login', 'earned_order', 'earned_review',
  'earned_referral', 'earned_activity', 'earned_checkin', 'earned_share', 'earned_admin',
  'spent_exchange', 'spent_order', 'spent_deduction',
  'expired', 'frozen', 'unfrozen', 'admin_adjust'
] as const;

/**
 * 兑换类型选项数组
 */
export const EXCHANGE_TYPE_OPTIONS = ['balance', 'coupon', 'product', 'privilege', 'discount'] as const;

/**
 * 兑换状态选项数组
 */
export const EXCHANGE_STATUS_OPTIONS = ['active', 'inactive', 'out_of_stock', 'expired'] as const;

/**
 * 标签类型选项数组
 */
export const TAG_TYPE_OPTIONS = ['system', 'custom', 'behavior', 'preference', 'demographic'] as const;

/**
 * 登录类型选项数组
 */
export const LOGIN_TYPE_OPTIONS = ['wechat', 'phone', 'email', 'username', 'third_party'] as const;

/**
 * 第三方平台选项数组
 */
export const THIRD_PARTY_PLATFORM_OPTIONS = ['wechat', 'alipay', 'qq', 'weibo', 'apple', 'google'] as const;

// ========================= 默认值常量 =========================

/**
 * 默认会员偏好设置
 */
export const DEFAULT_MEMBER_PREFERENCES = {
  language: 'zh-CN',
  timezone: 'Asia/Shanghai',
  currency: 'CNY',
  notifications: {
    email: true,
    sms: true,
    push: true,
    wechat: true,
    orderUpdates: true,
    promotions: false,
    pointsUpdates: true,
    systemMessages: true
  },
  privacy: {
    profileVisibility: 'friends' as const,
    showLocation: false,
    showBirthday: false,
    showPhone: false,
    showEmail: false,
    allowSearch: true,
    allowRecommendation: true
  },
  marketing: {
    emailMarketing: false,
    smsMarketing: false,
    pushMarketing: false,
    personalizedRecommendations: true,
    behaviorTracking: true
  }
};

/**
 * 默认会员验证信息
 */
export const DEFAULT_MEMBER_VERIFICATION = {
  status: 'unverified' as const,
  type: 'none' as const
};

/**
 * 默认积分规则条件
 */
export const DEFAULT_POINTS_RULE_CONDITIONS = [];

/**
 * 默认积分兑换条件
 */
export const DEFAULT_POINTS_EXCHANGE_CONDITIONS = [];

/**
 * 默认地址验证结果
 */
export const DEFAULT_ADDRESS_VALIDATION_RESULT = {
  isValid: false,
  confidence: 0,
  details: {
    provinceValid: false,
    cityValid: false,
    districtValid: false
  },
  errors: [],
  warnings: [],
  validationMethod: 'unknown',
  validationTime: new Date().toISOString()
};

// ========================= 帮助函数 =========================

/**
 * 格式化会员显示名称
 */
export function formatMemberDisplayName(member: any): string {
  if (member.profile?.nickname) {
    return member.profile.nickname;
  }
  if (member.profile?.realName) {
    return member.profile.realName;
  }
  if (member.profile?.username) {
    return member.profile.username;
  }
  return member.profile?.email?.split('@')[0] || '';
}

/**
 * 格式化积分显示
 */
export function formatPoints(points: number): string {
  if (points >= 10000) {
    return `${(points / 10000).toFixed(1)}万`;
  }
  return points.toString();
}

/**
 * 格式化地址显示
 */
export function formatAddress(address: any, includeContact: boolean = false): string {
  const location = `${address.province}${address.city}${address.district}${address.address}`;
  if (includeContact) {
    return `${address.name} ${address.phone} ${location}`;
  }
  return location;
}

/**
 * 计算会员等级进度
 */
export function calculateLevelProgress(member: any, nextLevel?: any): number {
  if (!nextLevel) return 1;
  
  const currentPoints = member.points;
  const currentLevelPoints = member.level.pointsRequired;
  const nextLevelPoints = nextLevel.pointsRequired;
  
  const progress = (currentPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints);
  return Math.min(Math.max(progress, 0), 1);
}

/**
 * 获取积分类型显示名称
 */
export function getPointsTypeDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    'earned_registration': '注册奖励',
    'earned_login': '登录签到',
    'earned_order': '订单完成',
    'earned_review': '评价奖励',
    'earned_referral': '邀请好友',
    'earned_activity': '活动奖励',
    'earned_checkin': '每日签到',
    'earned_share': '分享奖励',
    'earned_admin': '管理员调整',
    'spent_exchange': '积分兑换',
    'spent_order': '订单抵扣',
    'spent_deduction': '积分扣除',
    'expired': '积分过期',
    'frozen': '积分冻结',
    'unfrozen': '积分解冻',
    'admin_adjust': '管理员调整'
  };
  return displayNames[type] || type;
}

/**
 * 验证手机号格式
 */
export function validatePhoneNumber(phone: string): boolean {
  return VALIDATION_RULES.phone.pattern.test(phone);
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email);
}

/**
 * 验证用户名格式
 */
export function validateUsername(username: string): boolean {
  return username.length >= VALIDATION_RULES.username.minLength &&
         username.length <= VALIDATION_RULES.username.maxLength &&
         VALIDATION_RULES.username.pattern.test(username);
} 