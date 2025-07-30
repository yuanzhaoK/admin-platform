// 移动端会员类型定义 - 专为移动商城设计

// 会员基础信息
export interface MobileMember {
  id: string;
  username: string;
  email: string;
  phone: string;
  avatar?: string;
  nickname: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthday?: string;
  level: MemberLevel;
  points: number;
  balance: number;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'banned';
  created: string;
  updated: string;
}

// 会员等级
export interface MemberLevel {
  id: string;
  name: string;
  level: number;
  minPoints: number;
  maxPoints: number;
  discount: number; // 折扣率 0-1
  benefits: string[];
  icon?: string;
  color?: string;
}

// 会员地址
export interface MemberAddress {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
  isDefault: boolean;
  label?: 'home' | 'work' | 'other';
  created: string;
  updated: string;
}

// 会员登录信息
export interface MemberLogin {
  id: string;
  memberId: string;
  deviceId: string;
  deviceType: 'ios' | 'android' | 'web' | 'miniapp';
  deviceName: string;
  osVersion: string;
  appVersion: string;
  loginAt: string;
  lastActiveAt: string;
  ip: string;
  location?: string;
  isActive: boolean;
}

// 会员注册输入
export interface RegisterInput {
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  nickname?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthday?: string;
  referralCode?: string;
}

// 会员登录输入
export interface LoginInput {
  username?: string;
  email?: string;
  phone?: string;
  password: string;
  deviceId?: string;
  deviceType?: 'ios' | 'android' | 'web' | 'miniapp';
  deviceName?: string;
  osVersion?: string;
  appVersion?: string;
}

// 会员更新输入
export interface UpdateMemberInput {
  nickname?: string;
  avatar?: string;
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  birthday?: string;
  phone?: string;
  email?: string;
}

// 地址创建输入
export interface CreateAddressInput {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  zipCode?: string;
  isDefault?: boolean;
  label?: 'home' | 'work' | 'other';
}

// 地址更新输入
export interface updateAddress extends Partial<CreateAddressInput> {}

// 添加到购物车输入
export interface AddToCartInput {
  productId: string;
  quantity: number;
}

// 更新购物车输入
export interface UpdateCartInput {
  quantity?: number;
  selected?: boolean;
}

// 会员统计
export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  newMembersToday: number;
  newMembersThisMonth: number;
  levelDistribution: {
    level: number;
    count: number;
    percentage: number;
  }[];
}

// 会员积分记录
export interface PointsRecord {
  id: string;
  memberId: string;
  points: number;
  type: 'earn' | 'spend' | 'expire' | 'adjust';
  source: 'order' | 'signin' | 'referral' | 'activity' | 'manual';
  description: string;
  orderId?: string;
  created: string;
  expiredAt?: string;
}

// 会员余额记录
export interface BalanceRecord {
  id: string;
  memberId: string;
  amount: number;
  type: 'recharge' | 'consume' | 'refund' | 'adjust';
  source: 'order' | 'recharge' | 'refund' | 'manual';
  description: string;
  orderId?: string;
  paymentMethod?: string;
  transactionId?: string;
  created: string;
}

// 会员优惠券
export interface MemberCoupon {
  id: string;
  memberId: string;
  couponId: string;
  code: string;
  status: 'unused' | 'used' | 'expired';
  usedAt?: string;
  orderId?: string;
  validFrom: string;
  validTo: string;
  created: string;
}

// 会员收藏
export interface MemberFavorite {
  id: string;
  memberId: string;
  productId: string;
  created: string;
}

// 会员浏览历史
export interface MemberHistory {
  id: string;
  memberId: string;
  productId: string;
  viewedAt: string;
  duration?: number;
}

// 会员购物车
export interface MemberCart {
  id: string;
  memberId: string;
  productId: string;
  quantity: number;
  selected: boolean;
  created: string;
  updated: string;
}

// 会员订单
export interface MemberOrder {
  id: string;
  orderNumber: string;
  memberId: string;
  addressId: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'unpaid' | 'paid' | 'partial' | 'refunded';
  shippingStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
  items: OrderItem[];
  address: MemberAddress;
  created: string;
  updated: string;
}

// 订单商品
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  total: number;
  specifications?: Record<string, string>;
}

// 会员签到
export interface MemberSignIn {
  id: string;
  memberId: string;
  date: string;
  points: number;
  consecutiveDays: number;
  created: string;
}

// 会员消息
export interface MemberNotification {
  id: string;
  memberId: string;
  type: 'order' | 'promotion' | 'system' | 'points';
  title: string;
  content: string;
  isRead: boolean;
  actionUrl?: string;
  created: string;
}

// 会员设置
export interface MemberSettings {
  id: string;
  memberId: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  language: 'zh-CN' | 'en-US';
  currency: 'CNY' | 'USD';
  theme: 'light' | 'dark' | 'auto';
  privacy: {
    showProfile: boolean;
    showOrders: boolean;
    showReviews: boolean;
  };
}

// 响应类型
export interface AuthResponse {
  success: boolean;
  token: string;
  member: MobileMember;
  expiresIn: number;
}

export interface RegisterResponse {
  success: boolean;
  member: MobileMember;
  message?: string;
}

export interface AddressListResponse {
  addresses: MemberAddress[];
  total: number;
}

export interface CartListResponse {
  items: MemberCart[];
  total: number;
  totalAmount: number;
}

export interface FavoriteListResponse {
  favorites: MemberFavorite[];
  total: number;
}

export interface OrderListResponse {
  orders: MemberOrder[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface PointsListResponse {
  records: PointsRecord[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface BalanceListResponse {
  records: BalanceRecord[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface NotificationListResponse {
  notifications: MemberNotification[];
  total: number;
  unreadCount: number;
}

export interface SignInResponse {
  success: boolean;
  points: number;
  consecutiveDays: number;
  message: string;
}

// 缓存键
export const MOBILE_MEMBER_CACHE_KEYS = {
  MEMBER: 'mobile:member:',
  ADDRESS: 'mobile:address:',
  CART: 'mobile:cart:',
  FAVORITE: 'mobile:favorite:',
  ORDER: 'mobile:order:',
  NOTIFICATION: 'mobile:notification:',
  SETTINGS: 'mobile:settings:',
} as const;
