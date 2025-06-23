/**
 * 用户相关类型定义
 * @description 包含用户实体、查询、输入等相关类型定义
 * @author Admin Platform Team
 * @version 1.0.0
 */

import type { BaseEntity, BaseQuery, UserRole, UserStatus } from './base.ts';

/**
 * 用户实体接口
 * @description 系统用户的完整数据结构
 */
export interface User extends BaseEntity {
  /** 用户邮箱地址 */
  email: string;
  /** 用户姓名 */
  name?: string;
  /** 用户头像URL */
  avatar?: string;
  /** 用户角色 */
  role?: UserRole;
  /** 用户状态 */
  status?: UserStatus;
  /** 手机号码 */
  phone?: string;
  /** 用户积分 */
  points?: number;
  /** 成长值 */
  growth_value?: number;
  /** 用户等级 */
  level?: number;
  /** VIP状态 */
  vip_status?: string;
  /** 账户余额 */
  balance?: number;
  /** 最后登录时间 */
  last_login?: string;
  /** 登录次数 */
  login_count?: number;
  /** 邮箱是否可见 */
  emailVisibility?: boolean;
  /** 邮箱是否已验证 */
  verified?: boolean;
}

/**
 * 用户查询参数接口
 * @description 用于用户列表查询的参数
 */
export interface UserQuery extends BaseQuery {
  /** 按角色筛选 */
  role?: UserRole;
  /** 按状态筛选 */
  status?: UserStatus;
  /** 按验证状态筛选 */
  verified?: boolean;
  /** 按VIP状态筛选 */
  vip_status?: string;
  /** 最小积分 */
  points_min?: number;
  /** 最大积分 */
  points_max?: number;
  /** 最小余额 */
  balance_min?: number;
  /** 最大余额 */
  balance_max?: number;
}

/**
 * 用户创建输入接口
 * @description 创建新用户时需要的数据
 */
export interface UserInput {
  /** 用户邮箱地址（必填） */
  email: string;
  /** 用户密码（必填） */
  password: string;
  /** 用户姓名 */
  name?: string;
  /** 用户头像URL */
  avatar?: string;
  /** 用户角色，默认为user */
  role?: UserRole;
  /** 用户状态，默认为active */
  status?: UserStatus;
  /** 手机号码 */
  phone?: string;
}

/**
 * 用户更新输入接口
 * @description 更新用户信息时需要的数据
 */
export interface UserUpdateInput {
  /** 用户邮箱地址 */
  email?: string;
  /** 用户姓名 */
  name?: string;
  /** 用户头像URL */
  avatar?: string;
  /** 用户角色 */
  role?: UserRole;
  /** 用户状态 */
  status?: UserStatus;
  /** 手机号码 */
  phone?: string;
  /** 邮箱验证状态 */
  verified?: boolean;
  /** 用户积分 */
  points?: number;
  /** 成长值 */
  growth_value?: number;
  /** 账户余额 */
  balance?: number;
}

/**
 * 用户统计信息接口
 * @description 用户相关的统计数据
 */
export interface UserStats {
  /** 用户总数 */
  total: number;
  /** 活跃用户数 */
  active: number;
  /** 非活跃用户数 */
  inactive: number;
  /** 被暂停用户数 */
  suspended: number;
  /** 已验证用户数 */
  verified: number;
  /** 未验证用户数 */
  unverified: number;
  /** 管理员数量 */
  admins: number;
  /** 普通用户数量 */
  regular_users: number;
  /** 本月新增用户数 */
  new_this_month: number;
  /** 各角色用户分布 */
  role_distribution: Record<UserRole, number>;
  /** VIP用户分布 */
  vip_distribution: Record<string, number>;
}

/**
 * 用户活动记录接口
 * @description 记录用户的操作活动
 */
export interface UserActivity extends BaseEntity {
  /** 用户ID */
  user_id: string;
  /** 关联的用户对象 */
  user?: User;
  /** 操作动作 */
  action: string;
  /** 操作描述 */
  description: string;
  /** IP地址 */
  ip_address?: string;
  /** 用户代理 */
  user_agent?: string;
  /** 操作结果 */
  result?: 'success' | 'failure';
  /** 额外数据 */
  metadata?: Record<string, any>;
}

/**
 * 管理员修改密码输入接口
 * @description 管理员为用户修改密码时的参数
 */
export interface AdminChangePasswordInput {
  /** 目标用户ID */
  user_id: string;
  /** 新密码 */
  new_password: string;
  /** 是否通知用户，默认为true */
  notify_user?: boolean;
}

/**
 * 批量用户更新输入接口
 * @description 批量更新用户信息的参数
 */
export interface BatchUserUpdateInput {
  /** 用户ID列表 */
  user_ids: string[];
  /** 更新的数据 */
  updates: UserUpdateInput;
}

/**
 * 用户响应接口
 * @description API返回的用户列表响应
 */
export interface UsersResponse {
  /** 用户列表 */
  items: User[];
  /** 分页信息 */
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} 