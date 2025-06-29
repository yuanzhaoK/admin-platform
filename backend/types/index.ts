/**
 * 类型定义模块索引
 * @description 统一导出所有类型定义，提供完整的TypeScript类型支持
 * @author Admin Platform Team
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * import { User, Product, Order } from '@/types';
 * import type { UserQuery, ProductInput } from '@/types';
 * ```
 */

// ==================== 基础类型 ====================
export * from './base.ts';
export type {
  AmountRangeQuery, ApiResponse, BaseEntity,
  BaseQuery, BatchOperationResult, DateRangeQuery, OperationResult, PaginationInfo, ProductStatus,
  ReviewStatus, SortOrder, Status, UserRole,
  UserStatus
} from './base.ts';

// ==================== 用户相关类型 ====================
export * from './user.ts';
export type {
  AdminChangePasswordInput,
  BatchUserUpdateInput, User, UserActivity, UserInput, UserQuery, UsersResponse, UserStats, UserUpdateInput
} from './user.ts';

// ==================== 产品相关类型 ====================
export * from './product.ts';
export type {
  BatchPriceUpdateInput, Brand, ExportProductsInput, Product,
  ProductCategory, ProductDimensions, ProductExportResult, ProductInput, ProductQuery, ProductsResponse, ProductStats, ProductType,
  ProductTypeAttribute, ProductUpdateInput, StockAdjustmentInput, StockOperationResult
} from './product.ts';

// ==================== 订单相关类型 ====================
export * from './order.ts';
export type {
  CouponInfo, LogisticsInfo, LogisticsStatus, LogisticsUpdate, Order, OrderInput, OrderItem, OrderItemInput, OrderQuery, OrderSource, OrdersResponse, OrderStats, OrderStatus, OrderType, OrderUpdateInput, PaymentInfo, PaymentMethod, ShippingAddress, ShippingAddressInput
} from './order.ts';

// ==================== 退款相关类型 ====================
export * from './refund.ts';
export type {
  BatchRefundProcessInput, RefundItem, RefundItemInput, RefundMethod, RefundProcessInput, RefundQuery, RefundReason, RefundRequest, RefundRequestInput, RefundsResponse, RefundStats, RefundStatus, RefundTimeline, RefundType
} from './refund.ts';

// ==================== 系统相关类型 ====================
export * from './system.ts';
export type {
  AuthAttempt, AuthProvider, AuthResponse, AuthSession, ChangePasswordInput, DeviceInfo, ForgotPasswordInput, LoginInput, PasswordPolicy, RefreshTokenResponse, RegisterInput, ResetPasswordInput, SessionStatus, SettingCategory, SettingInput, SettingQuery, SettingType, SystemInfo,
  SystemSetting, TokenType, TwoFactorAuth
} from './system.ts';

// ==================== 向后兼容的类型别名 ====================
/**
 * @deprecated 请使用 SystemSetting 替代
 */
export interface OrderSetting {
  id: string;
  setting_key: string;
  setting_name: string;
  setting_value: string;
  setting_type: 'number' | 'boolean' | 'text' | 'json';
  description?: string;
  category: 'payment' | 'shipping' | 'timeout' | 'auto_operations' | 'notifications';
  created: string;
  updated: string;
}

// ==================== 类型工具函数 ====================

/**
 * 提取实体的ID类型
 * @template T 实体类型
 */
export type EntityId<T extends { id: string }> = T['id'];

/**
 * 提取实体的可选字段
 * @template T 实体类型
 */
export type OptionalFields<T> = {
  [K in keyof T]?: T[K];
};

/**
 * 创建输入类型（排除系统字段）
 * @template T 实体类型
 */
export type CreateInput<T extends { id: string; created: string; updated: string }> = Omit<T, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName'>;

/**
 * 更新输入类型（所有字段可选，排除系统字段）
 * @template T 实体类型
 */
export type UpdateInput<T extends { id: string; created: string; updated: string }> = Partial<CreateInput<T>>;

/**
 * 分页响应类型
 * @template T 数据项类型
 */
export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * 查询过滤器类型
 * @template T 实体类型
 */
export type QueryFilter<T> = {
  [K in keyof T]?: T[K] | T[K][];
} & {
  page?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};



// ==================== 模块导出声明 ====================

/**
 * 类型定义模块信息
 */
export const TYPE_MODULES = {
  base: 'base.ts',
  user: 'user.ts', 
  product: 'product.ts',
  order: 'order.ts',
  refund: 'refund.ts',
  system: 'system.ts'
} as const;

/**
 * 版本信息
 */
export const TYPE_DEFINITIONS_VERSION = '1.0.0';

/**
 * 支持的实体类型列表
 */
export const ENTITY_TYPES = [
  'User',
  'Product', 
  'ProductCategory',
  'Brand',
  'ProductType',
  'Order',
  'OrderItem', 
  'RefundRequest',
  'SystemSetting',
  'AuthSession'
] as const;

export type EntityType = typeof ENTITY_TYPES[number]; 