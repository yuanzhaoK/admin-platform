/**
 * 会员核心类型定义
 * @description 包含会员实体、查询参数、输入输出类型等
 */

import { 
  BaseEntity, 
  PaginationInput, 
  PaginatedResponse, 
  Gender, 
  MembershipStatus, 
  VerificationStatus,
  ContactInfo,
  Location,
  FileInfo,
  DateRange
} from './base.ts';
import { MemberLevel } from './level.ts';
import { MemberTag } from './tags.ts';

// ========================= 会员核心实体 =========================

/**
 * 会员基础信息接口
 */
export interface MemberProfile {
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  realName?: string;
  nickname?: string;
  gender: Gender;
  birthday?: string;
  bio?: string;
  location?: Location;
  preferences?: MemberPreferences;
}

/**
 * 会员偏好设置接口
 */
export interface MemberPreferences {
  language: string;
  timezone: string;
  currency: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  marketing: MarketingSettings;
}

/**
 * 通知设置接口
 */
export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  wechat: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  pointsUpdates: boolean;
  systemMessages: boolean;
}

/**
 * 隐私设置接口
 */
export interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  showLocation: boolean;
  showBirthday: boolean;
  showPhone: boolean;
  showEmail: boolean;
  allowSearch: boolean;
  allowRecommendation: boolean;
}

/**
 * 营销设置接口
 */
export interface MarketingSettings {
  emailMarketing: boolean;
  smsMarketing: boolean;
  pushMarketing: boolean;
  personalizedRecommendations: boolean;
  behaviorTracking: boolean;
}

/**
 * 会员统计信息接口
 */
export interface MemberStats {
  totalOrders: number;
  totalAmount: number;
  totalSavings: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  loyaltyScore: number;
  engagementScore: number;
  lastOrderDate?: string;
  membershipDuration: number; // 天数
}

/**
 * 会员认证信息接口
 */
export interface MemberVerification {
  status: VerificationStatus;
  type: 'none' | 'phone' | 'email' | 'identity' | 'enterprise';
  identityCard?: {
    number: string;
    name: string;
    verified: boolean;
    verifiedAt?: string;
  };
  enterprise?: {
    companyName: string;
    businessLicense: string;
    taxNumber: string;
    verified: boolean;
    verifiedAt?: string;
  };
  documents?: FileInfo[];
  verifiedAt?: string;
  verifiedBy?: string;
  rejectReason?: string;
}

/**
 * 第三方账号绑定接口
 */
export interface ThirdPartyBinding {
  platform: string;
  platformUserId: string;
  platformUsername?: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  bindTime: string;
  lastSyncTime?: string;
  isActive: boolean;
}

/**
 * 会员完整信息接口
 */
export interface Member extends BaseEntity {
  // 基础信息
  profile: MemberProfile;
  
  // 等级和积分
  level: MemberLevel;
  levelId: string;
  points: number;
  frozenPoints: number;
  totalEarnedPoints: number;
  totalSpentPoints: number;
  balance: number;
  frozenBalance: number;
  
  // 状态
  status: MembershipStatus;
  isVerified: boolean;
  verification: MemberVerification;
  
  // 统计数据
  stats: MemberStats;
  
  // 时间信息
  registerTime: string;
  lastLoginTime?: string;
  lastActiveTime?: string;
  levelUpgradeTime?: string;
  
  // 第三方绑定
  wechatOpenid?: string;
  wechatUnionid?: string;
  thirdPartyBindings: ThirdPartyBinding[];
  
  // 标签和分组
  tags: MemberTag[];
  groups: string[];
  segment?: string;
  
  // 风控信息
  riskLevel: 'low' | 'medium' | 'high';
  trustScore: number;
  blacklistReason?: string;
  
  // 扩展字段
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

// ========================= 查询参数 =========================

/**
 * 会员查询参数接口
 */
export interface MemberQueryInput extends PaginationInput {
  // 基础搜索
  search?: string;
  username?: string;
  email?: string;
  phone?: string;
  realName?: string;
  
  // 状态筛选
  status?: MembershipStatus | MembershipStatus[];
  isVerified?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
  
  // 等级筛选
  levelId?: string | string[];
  levelName?: string;
  pointsMin?: number;
  pointsMax?: number;
  
  // 时间筛选
  registerDateRange?: DateRange;
  lastLoginDateRange?: DateRange;
  
  // 地理位置筛选
  province?: string;
  city?: string;
  
  // 统计筛选
  totalOrdersMin?: number;
  totalOrdersMax?: number;
  totalAmountMin?: number;
  totalAmountMax?: number;
  
  // 标签筛选
  tags?: string | string[];
  groups?: string | string[];
  segment?: string;
  
  // 高级筛选
  hasOrders?: boolean;
  hasReviews?: boolean;
  isActive?: boolean; // 最近30天内有活动
  
  // 包含关联数据
  includeLevel?: boolean;
  includeTags?: boolean;
  includeStats?: boolean;
  includeVerification?: boolean;
}

/**
 * 会员复杂查询接口
 */
export interface MemberComplexQuery {
  conditions: Array<{
    field: keyof Member | string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'nin' | 'exists' | 'between';
    value: any;
  }>;
  logic?: 'and' | 'or';
  nested?: MemberComplexQuery[];
  pagination?: PaginationInput;
}

// ========================= 输入类型 =========================

/**
 * 会员创建输入接口
 */
export interface MemberCreateInput {
  username: string;
  email: string;
  phone?: string;
  password?: string;
  realName?: string;
  nickname?: string;
  gender?: Gender;
  birthday?: string;
  avatar?: string;
  levelId?: string;
  initialPoints?: number;
  initialBalance?: number;
  status?: MembershipStatus;
  wechatOpenid?: string;
  wechatUnionid?: string;
  referrerId?: string;
  source?: string;
  customFields?: Record<string, any>;
}

/**
 * 会员更新输入接口
 */
export interface MemberUpdateInput {
  username?: string;
  email?: string;
  phone?: string;
  realName?: string;
  nickname?: string;
  gender?: Gender;
  birthday?: string;
  avatar?: string;
  bio?: string;
  levelId?: string;
  status?: MembershipStatus;
  preferences?: Partial<MemberPreferences>;
  customFields?: Record<string, any>;
}

/**
 * 会员资料更新输入接口（用户自己更新）
 */
export interface ProfileUpdateInput {
  nickname?: string;
  avatar?: string;
  bio?: string;
  gender?: Gender;
  birthday?: string;
  location?: Partial<Location>;
  preferences?: Partial<MemberPreferences>;
}

/**
 * 密码修改输入接口
 */
export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 手机号绑定/解绑输入接口
 */
export interface PhoneBindingInput {
  phone: string;
  verificationCode: string;
  action: 'bind' | 'unbind' | 'change';
}

/**
 * 邮箱绑定/解绑输入接口
 */
export interface EmailBindingInput {
  email: string;
  verificationCode: string;
  action: 'bind' | 'unbind' | 'change';
}

/**
 * 实名认证输入接口
 */
export interface IdentityVerificationInput {
  realName: string;
  identityCard: string;
  frontImage: string; // 身份证正面
  backImage: string;  // 身份证反面
  handheldImage?: string; // 手持身份证
}

/**
 * 企业认证输入接口
 */
export interface EnterpriseVerificationInput {
  companyName: string;
  businessLicense: string;
  taxNumber: string;
  legalPerson: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  businessLicenseImage: string;
  additionalDocuments?: string[];
}

// ========================= 输出类型 =========================

/**
 * 会员列表响应接口
 */
export interface MembersResponse extends PaginatedResponse<Member> {
  stats?: {
    totalActive: number;
    totalInactive: number;
    totalBanned: number;
    totalNewThisMonth: number;
    averageLevel: number;
    totalPoints: number;
    totalBalance: number;
  };
}

/**
 * 会员详情响应接口
 */
export interface MemberDetailResponse {
  member: Member;
  recentOrders?: any[];
  recentPoints?: any[];
  loginHistory?: any[];
  behaviorData?: any[];
  recommendations?: any[];
}

/**
 * 会员统计响应接口
 */
export interface MemberStatsResponse {
  overview: {
    total: number;
    active: number;
    inactive: number;
    banned: number;
    newThisMonth: number;
    retentionRate: number;
  };
  levelDistribution: Array<{
    levelId: string;
    levelName: string;
    count: number;
    percentage: number;
  }>;
  genderDistribution: Array<{
    gender: Gender;
    count: number;
    percentage: number;
  }>;
  ageDistribution: Array<{
    ageGroup: string;
    count: number;
    percentage: number;
  }>;
  locationDistribution: Array<{
    province: string;
    city?: string;
    count: number;
    percentage: number;
  }>;
  registrationTrend: Array<{
    date: string;
    count: number;
    cumulative: number;
  }>;
  activityTrend: Array<{
    date: string;
    activeUsers: number;
    loginCount: number;
    orderCount: number;
  }>;
  segmentAnalysis: Array<{
    segment: string;
    count: number;
    avgOrderValue: number;
    totalRevenue: number;
    retentionRate: number;
  }>;
}

/**
 * 会员导出数据接口
 */
export interface MemberExportData {
  id: string;
  username: string;
  email: string;
  phone?: string;
  realName?: string;
  gender: string;
  birthday?: string;
  levelName: string;
  points: number;
  balance: number;
  totalOrders: number;
  totalAmount: number;
  status: string;
  registerTime: string;
  lastLoginTime?: string;
  isVerified: boolean;
  province?: string;
  city?: string;
  tags: string;
}

/**
 * 会员导入结果接口
 */
export interface MemberImportResult {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
  summary: {
    newMembers: number;
    updatedMembers: number;
    skippedMembers: number;
  };
}

// ========================= 事件类型 =========================

/**
 * 会员注册事件
 */
export interface MemberRegisteredEvent {
  memberId: string;
  username: string;
  email: string;
  source: string;
  referrerId?: string;
  timestamp: string;
}

/**
 * 会员等级升级事件
 */
export interface MemberLevelUpgradedEvent {
  memberId: string;
  username: string;
  fromLevelId: string;
  toLevelId: string;
  points: number;
  timestamp: string;
}

/**
 * 会员状态变更事件
 */
export interface MemberStatusChangedEvent {
  memberId: string;
  username: string;
  fromStatus: MembershipStatus;
  toStatus: MembershipStatus;
  reason?: string;
  operatorId?: string;
  timestamp: string;
}

/**
 * 会员认证事件
 */
export interface MemberVerifiedEvent {
  memberId: string;
  username: string;
  verificationType: string;
  status: VerificationStatus;
  verifiedBy?: string;
  timestamp: string;
}

// ========================= 服务接口 =========================

/**
 * 会员服务接口
 */
export interface IMemberService {
  // 基础CRUD
  create(input: MemberCreateInput): Promise<Member>;
  findById(id: string): Promise<Member | null>;
  findByUsername(username: string): Promise<Member | null>;
  findByEmail(email: string): Promise<Member | null>;
  findByPhone(phone: string): Promise<Member | null>;
  update(id: string, input: MemberUpdateInput): Promise<Member>;
  delete(id: string): Promise<boolean>;
  
  // 查询
  findMany(query: MemberQueryInput): Promise<MembersResponse>;
  search(keyword: string): Promise<Member[]>;
  complexQuery(query: MemberComplexQuery): Promise<MembersResponse>;
  
  // 统计
  getStats(dateRange?: DateRange): Promise<MemberStatsResponse>;
  getSegmentAnalysis(): Promise<any>;
  
  // 认证
  verifyIdentity(id: string, input: IdentityVerificationInput): Promise<boolean>;
  verifyEnterprise(id: string, input: EnterpriseVerificationInput): Promise<boolean>;
  
  // 状态管理
  activate(id: string): Promise<boolean>;
  deactivate(id: string): Promise<boolean>;
  ban(id: string, reason: string): Promise<boolean>;
  unban(id: string): Promise<boolean>;
  
  // 批量操作
  batchUpdate(ids: string[], input: Partial<MemberUpdateInput>): Promise<any>;
  batchDelete(ids: string[]): Promise<any>;
  
  // 导入导出
  exportMembers(query: MemberQueryInput): Promise<MemberExportData[]>;
  importMembers(data: any[]): Promise<MemberImportResult>;
} 