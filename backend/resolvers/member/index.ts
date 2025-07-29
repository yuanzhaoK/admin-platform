/**
 * 会员模块 Resolvers 主索引
 * @description 统一导出所有会员相关的 resolver
 */

import { memberResolvers } from './member.ts';
import { memberLevelResolvers } from './level.ts';
import { pointsResolvers } from './points.ts';
import { addressResolvers } from './address.ts';
import { memberTagResolvers } from './tags.ts';

// 枚举解析器
const enumResolvers = {
  Gender: {
    MALE: 'male',
    FEMALE: 'female',
    UNKNOWN: 'unknown',
  },

  MembershipStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    BANNED: 'banned',
    PENDING: 'pending',
  },

  PointsType: {
    // 获得积分
    EARNED_REGISTRATION: 'earned_registration',
    EARNED_LOGIN: 'earned_login',
    EARNED_ORDER: 'earned_order',
    EARNED_REVIEW: 'earned_review',
    EARNED_REFERRAL: 'earned_referral',
    EARNED_ACTIVITY: 'earned_activity',
    EARNED_CHECKIN: 'earned_checkin',
    EARNED_SHARE: 'earned_share',
    EARNED_ADMIN: 'earned_admin',
    
    // 消费积分
    SPENT_EXCHANGE: 'spent_exchange',
    SPENT_ORDER: 'spent_order',
    SPENT_DEDUCTION: 'spent_deduction',
    
    // 其他
    EXPIRED: 'expired',
    FROZEN: 'frozen',
    UNFROZEN: 'unfrozen',
    ADMIN_ADJUST: 'admin_adjust',
  },

  ExchangeType: {
    BALANCE: 'balance',
    COUPON: 'coupon',
    PRODUCT: 'product',
    PRIVILEGE: 'privilege',
    DISCOUNT: 'discount',
  },

  ExchangeStatus: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    OUT_OF_STOCK: 'out_of_stock',
    EXPIRED: 'expired',
  },

  ExchangeRecordStatus: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  LoginType: {
    WECHAT: 'wechat',
    PHONE: 'phone',
    EMAIL: 'email',
    USERNAME: 'username',
    THIRD_PARTY: 'third_party',
  },

  ThirdPartyPlatform: {
    WECHAT: 'wechat',
    ALIPAY: 'alipay',
    QQ: 'qq',
    WEIBO: 'weibo',
    APPLE: 'apple',
    GOOGLE: 'google',
  },

  VerificationStatus: {
    UNVERIFIED: 'unverified',
    PENDING: 'pending',
    VERIFIED: 'verified',
    REJECTED: 'rejected',
  },

  TagType: {
    SYSTEM: 'system',
    CUSTOM: 'custom',
    BEHAVIOR: 'behavior',
    PREFERENCE: 'preference',
    DEMOGRAPHIC: 'demographic',
  },

  NotificationType: {
    SYSTEM: 'system',
    ORDER: 'order',
    POINTS: 'points',
    LEVEL: 'level',
    PROMOTION: 'promotion',
    SOCIAL: 'social',
  },

  ProfileVisibility: {
    PUBLIC: 'public',
    FRIENDS: 'friends',
    PRIVATE: 'private',
  },

  MemberRiskLevel: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
  },

  IdentityVerificationType: {
    NONE: 'none',
    PHONE: 'phone',
    EMAIL: 'email',
    IDENTITY: 'identity',
    ENTERPRISE: 'enterprise',
  },
};

// 合并所有 Query resolvers
const Query = {
  ...memberResolvers.Query,
  ...memberLevelResolvers.Query,
  ...pointsResolvers.Query,
  ...addressResolvers.Query,
  ...memberTagResolvers.Query,
};

// 合并所有 Mutation resolvers
const Mutation = {
  ...memberResolvers.Mutation,
  ...memberLevelResolvers.Mutation,
  ...pointsResolvers.Mutation,
  ...addressResolvers.Mutation,
  ...memberTagResolvers.Mutation,
};

// 合并所有类型解析器
const typeResolvers = {
  ...memberResolvers.types,
  ...memberLevelResolvers.types,
  ...pointsResolvers.types,
  ...addressResolvers.types,
  ...memberTagResolvers.types,
};

// 导出合并后的 resolvers
export const memberModuleResolvers = {
  // 枚举解析器
  ...enumResolvers,
  
  // Query 和 Mutation
  Query,
  Mutation,
  
  // 类型解析器
  ...typeResolvers,
};

// 为了向后兼容，也导出各个模块的 resolvers
export {
  memberResolvers,
  memberLevelResolvers,
  pointsResolvers,
  addressResolvers,
  memberTagResolvers,
}; 