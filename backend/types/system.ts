/**
 * 系统相关类型定义
 * @description 包含系统设置、配置、认证等相关类型定义
 * @author Admin Platform Team
 * @version 1.0.0
 */

import type { BaseEntity, BaseQuery } from './base.ts';

/**
 * 认证提供商枚举
 * @description 定义支持的认证方式
 */
export type AuthProvider = 
  | 'email'             // 邮箱登录
  | 'phone'             // 手机登录
  | 'wechat'            // 微信登录
  | 'alipay'            // 支付宝登录
  | 'google'            // Google登录
  | 'github'            // GitHub登录
  | 'facebook';         // Facebook登录

/**
 * 令牌类型枚举
 * @description 定义不同用途的令牌类型
 */
export type TokenType = 
  | 'access'            // 访问令牌
  | 'refresh'           // 刷新令牌
  | 'verification'      // 验证令牌
  | 'reset_password'    // 重置密码令牌
  | 'invitation';       // 邀请令牌

/**
 * 会话状态枚举
 * @description 定义用户会话的状态
 */
export type SessionStatus = 
  | 'active'            // 活跃
  | 'expired'           // 已过期
  | 'revoked'           // 已撤销
  | 'suspended';        // 已暂停

/**
 * 设置类型枚举
 * @description 定义系统设置的数据类型
 */
export type SettingType = 
  | 'string'            // 字符串
  | 'number'            // 数字
  | 'boolean'           // 布尔值
  | 'json'              // JSON对象
  | 'array'             // 数组
  | 'date'              // 日期
  | 'file'              // 文件
  | 'color'             // 颜色
  | 'url';              // URL链接

/**
 * 设置分类枚举
 * @description 定义系统设置的分类
 */
export type SettingCategory = 
  | 'general'           // 通用设置
  | 'security'          // 安全设置
  | 'payment'           // 支付设置
  | 'shipping'          // 物流设置
  | 'notification'      // 通知设置
  | 'email'             // 邮件设置
  | 'sms'               // 短信设置
  | 'storage'           // 存储设置
  | 'cache'             // 缓存设置
  | 'api'               // API设置
  | 'ui'                // 界面设置
  | 'seo';              // SEO设置

/**
 * 系统信息接口
 * @description 系统运行状态和版本信息
 */
export interface SystemInfo {
  /** 系统版本 */
  version: string;
  /** 运行环境 */
  environment: string;
  /** 运行时长 */
  uptime: string;
  /** 当前时间戳 */
  timestamp: string;
  /** 服务器信息 */
  server?: {
    /** 操作系统 */
    os: string;
    /** CPU架构 */
    arch: string;
    /** 内存使用情况 */
    memory: {
      total: number;
      used: number;
      free: number;
    };
    /** 磁盘使用情况 */
    disk: {
      total: number;
      used: number;
      free: number;
    };
  };
  /** 数据库信息 */
  database?: {
    /** 数据库类型 */
    type: string;
    /** 连接状态 */
    connected: boolean;
    /** 数据库大小 */
    size?: number;
  };
}

/**
 * 系统设置接口
 * @description 系统配置项的数据结构
 */
export interface SystemSetting extends BaseEntity {
  /** 设置键名 */
  key: string;
  /** 设置显示名称 */
  name: string;
  /** 设置值 */
  value: any;
  /** 默认值 */
  default_value?: any;
  /** 设置类型 */
  type: SettingType;
  /** 设置分类 */
  category: SettingCategory;
  /** 设置描述 */
  description?: string;
  /** 是否必填 */
  required?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 验证规则 */
  validation?: {
    /** 最小值/最小长度 */
    min?: number;
    /** 最大值/最大长度 */
    max?: number;
    /** 正则表达式 */
    pattern?: string;
    /** 可选值列表 */
    options?: any[];
  };
  /** 排序顺序 */
  sort_order?: number;
}

/**
 * 设备信息接口
 * @description 用户登录设备的信息
 */
export interface DeviceInfo {
  /** 设备ID */
  device_id?: string;
  /** 设备名称 */
  device_name?: string;
  /** 设备类型 */
  device_type?: string;
  /** 操作系统 */
  os?: string;
  /** 浏览器 */
  browser?: string;
  /** 应用版本 */
  app_version?: string;
}

/**
 * 认证会话接口
 * @description 用户认证会话信息
 */
export interface AuthSession extends BaseEntity {
  /** 用户ID */
  user_id: string;
  /** 令牌哈希 */
  token_hash: string;
  /** 刷新令牌哈希 */
  refresh_token_hash?: string;
  /** 设备信息 */
  device_info?: DeviceInfo;
  /** IP地址 */
  ip_address: string;
  /** 用户代理 */
  user_agent?: string;
  /** 地理位置 */
  location?: string;
  /** 会话状态 */
  status: SessionStatus;
  /** 最后活动时间 */
  last_activity: string;
  /** 过期时间 */
  expires_at: string;
}

/**
 * 认证尝试记录接口
 * @description 用户登录尝试的记录
 */
export interface AuthAttempt extends BaseEntity {
  /** 登录标识（邮箱/手机号等） */
  identity: string;
  /** 认证提供商 */
  provider: AuthProvider;
  /** IP地址 */
  ip_address: string;
  /** 用户代理 */
  user_agent?: string;
  /** 是否成功 */
  success: boolean;
  /** 失败原因 */
  failure_reason?: string;
  /** 用户ID（成功时） */
  user_id?: string;
}

/**
 * 密码策略接口
 * @description 系统密码安全策略
 */
export interface PasswordPolicy {
  /** 最小长度 */
  min_length: number;
  /** 是否需要大写字母 */
  require_uppercase: boolean;
  /** 是否需要小写字母 */
  require_lowercase: boolean;
  /** 是否需要数字 */
  require_numbers: boolean;
  /** 是否需要特殊字符 */
  require_symbols: boolean;
  /** 密码最大有效期（天） */
  max_age_days?: number;
  /** 历史密码记录数量 */
  history_count?: number;
}

/**
 * 双因子认证接口
 * @description 用户双因子认证设置
 */
export interface TwoFactorAuth {
  /** 是否已启用 */
  is_enabled: boolean;
  /** 备用代码 */
  backup_codes?: string[];
  /** 二维码 */
  qr_code?: string;
  /** 密钥 */
  secret?: string;
}

/**
 * 认证响应接口
 * @description 用户登录成功后的响应数据
 */
export interface AuthResponse {
  /** 访问令牌 */
  token: string;
  /** 刷新令牌 */
  refresh_token: string;
  /** 令牌有效期（秒） */
  expires_in: number;
  /** 令牌类型 */
  token_type: string;
  /** 用户记录 */
  record: any;
  /** 用户权限 */
  permissions: string[];
  /** 会话ID */
  session_id: string;
}

/**
 * 刷新令牌响应接口
 * @description 令牌刷新后的响应数据
 */
export interface RefreshTokenResponse {
  /** 新的访问令牌 */
  token: string;
  /** 新的刷新令牌 */
  refresh_token: string;
  /** 令牌有效期（秒） */
  expires_in: number;
}

/**
 * 登录输入接口
 * @description 用户登录时需要的数据
 */
export interface LoginInput {
  /** 登录标识（邮箱/手机号等） */
  identity: string;
  /** 密码 */
  password: string;
  /** 认证提供商，默认为邮箱 */
  provider?: AuthProvider;
  /** 设备信息 */
  device_info?: DeviceInfo;
  /** 是否记住登录 */
  remember_me?: boolean;
  /** 验证码令牌 */
  captcha_token?: string;
}

/**
 * 注册输入接口
 * @description 用户注册时需要的数据
 */
export interface RegisterInput {
  /** 邮箱地址 */
  email: string;
  /** 密码 */
  password: string;
  /** 用户姓名 */
  name?: string;
  /** 手机号码 */
  phone?: string;
  /** 邀请码 */
  invite_code?: string;
  /** 是否同意条款 */
  terms_accepted: boolean;
  /** 是否订阅邮件 */
  newsletter_opt_in?: boolean;
}

/**
 * 忘记密码输入接口
 * @description 忘记密码时需要的数据
 */
export interface ForgotPasswordInput {
  /** 邮箱地址 */
  email: string;
  /** 验证码令牌 */
  captcha_token?: string;
}

/**
 * 重置密码输入接口
 * @description 重置密码时需要的数据
 */
export interface ResetPasswordInput {
  /** 重置令牌 */
  token: string;
  /** 新密码 */
  new_password: string;
  /** 确认密码 */
  confirm_password: string;
}

/**
 * 修改密码输入接口
 * @description 修改密码时需要的数据
 */
export interface ChangePasswordInput {
  /** 当前密码 */
  current_password: string;
  /** 新密码 */
  new_password: string;
  /** 确认密码 */
  confirm_password: string;
}

/**
 * 系统设置查询参数接口
 * @description 用于系统设置查询的参数
 */
export interface SettingQuery extends BaseQuery {
  /** 按分类筛选 */
  category?: SettingCategory;
  /** 按类型筛选 */
  type?: SettingType;
  /** 是否必填 */
  required?: boolean;
  /** 是否只读 */
  readonly?: boolean;
}

/**
 * 系统设置输入接口
 * @description 创建/更新系统设置时需要的数据
 */
export interface SettingInput {
  /** 设置键名 */
  key: string;
  /** 设置显示名称 */
  name: string;
  /** 设置值 */
  value: any;
  /** 默认值 */
  default_value?: any;
  /** 设置类型 */
  type: SettingType;
  /** 设置分类 */
  category: SettingCategory;
  /** 设置描述 */
  description?: string;
  /** 是否必填 */
  required?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 验证规则 */
  validation?: any;
  /** 排序顺序 */
  sort_order?: number;
} 