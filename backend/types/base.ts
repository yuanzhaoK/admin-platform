/**
 * 基础类型定义
 * @description 包含系统中通用的基础类型、枚举和接口定义
 * @author Admin Platform Team
 * @version 1.0.0
 */

/**
 * 通用状态枚举
 * @description 用于表示各种实体的状态
 */
export type Status = 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected';

/**
 * 排序方向枚举
 * @description 用于查询时指定排序方向
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 用户角色枚举
 * @description 定义系统中的用户角色类型
 */
export type UserRole = 'admin' | 'user' | 'moderator' | 'guest';

/**
 * 用户状态枚举
 * @description 定义用户账户的状态
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/**
 * 产品状态枚举
 * @description 定义产品的发布状态
 */
export type ProductStatus = 'active' | 'inactive' | 'draft';

/**
 * 审核状态枚举
 * @description 用于内容审核流程
 */
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

/**
 * 分页信息接口
 * @description 用于API响应中的分页数据
 */
export interface PaginationInfo {
  /** 当前页码 */
  page: number;
  /** 每页条数 */
  perPage: number;
  /** 总页数 */
  totalPages: number;
  /** 总记录数 */
  totalItems: number;
  /** 是否有下一页 */
  hasNext?: boolean;
  /** 是否有上一页 */
  hasPrev?: boolean;
}

/**
 * 通用API响应接口
 * @description 标准化的API响应格式
 * @template T 响应数据的类型
 */
export interface ApiResponse<T = any> {
  /** 操作是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 提示消息 */
  message?: string;
  /** 分页信息 */
  pagination?: PaginationInfo;
}

/**
 * 操作结果接口
 * @description 用于表示操作执行的结果
 */
export interface OperationResult {
  /** 操作是否成功 */
  success: boolean;
  /** 结果消息 */
  message?: string;
  /** 错误代码 */
  code?: string;
}

/**
 * 批量操作结果接口
 * @description 用于表示批量操作的执行结果
 */
export interface BatchOperationResult extends OperationResult {
  /** 成功处理的数量 */
  successCount: number;
  /** 失败处理的数量 */
  failureCount: number;
  /** 错误详情列表 */
  errors?: string[];
}

/**
 * 基础实体接口
 * @description 所有数据实体的基础接口
 */
export interface BaseEntity {
  /** 唯一标识符 */
  id: string;
  /** 创建时间 */
  created: string;
  /** 更新时间 */
  updated: string;
  /** 集合ID (PocketBase特有) */
  collectionId?: string;
  /** 集合名称 (PocketBase特有) */
  collectionName?: string;
}

/**
 * 基础查询参数接口
 * @description 通用的查询参数
 */
export interface BaseQuery {
  /** 页码，默认为1 */
  page?: number;
  /** 每页条数，默认为20 */
  perPage?: number;
  /** 搜索关键词 */
  search?: string;
  /** 排序字段 */
  sortBy?: string;
  /** 排序方向 */
  sortOrder?: SortOrder;
}

/**
 * 时间范围查询接口
 * @description 用于时间范围筛选的查询参数
 */
export interface DateRangeQuery {
  /** 开始日期 */
  date_from?: string;
  /** 结束日期 */
  date_to?: string;
}

/**
 * 金额范围查询接口
 * @description 用于金额范围筛选的查询参数
 */
export interface AmountRangeQuery {
  /** 最小金额 */
  amount_min?: number;
  /** 最大金额 */
  amount_max?: number;
} 