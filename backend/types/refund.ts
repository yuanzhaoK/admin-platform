/**
 * 退款相关类型定义
 * @description 包含退款申请、处理流程等相关类型定义
 * @author Admin Platform Team
 * @version 1.0.0
 */

import type { AmountRangeQuery, BaseEntity, BaseQuery, DateRangeQuery } from './base.ts';
import type { Order } from './order.ts';
import type { Product } from './product.ts';
import type { User } from './user.ts';

/**
 * 退款类型枚举
 * @description 定义退款的业务类型
 */
export type RefundType = 
  | 'refund_only'        // 仅退款
  | 'return_and_refund'  // 退货退款
  | 'exchange'           // 换货
  | 'repair';            // 维修

/**
 * 退款原因枚举
 * @description 定义退款申请的原因
 */
export type RefundReason = 
  | 'quality_issue'      // 质量问题
  | 'wrong_item'         // 商品错误
  | 'damaged_in_transit' // 运输损坏
  | 'not_as_described'   // 与描述不符
  | 'size_issue'         // 尺寸问题
  | 'color_issue'        // 颜色问题
  | 'change_of_mind'     // 不想要了
  | 'duplicate_order'    // 重复下单
  | 'shipping_delay'     // 发货延迟
  | 'other';             // 其他原因

/**
 * 退款状态枚举
 * @description 定义退款申请的处理状态
 */
export type RefundStatus = 
  | 'pending'            // 待处理
  | 'approved'           // 已批准
  | 'rejected'           // 已拒绝
  | 'processing'         // 处理中
  | 'completed'          // 已完成
  | 'cancelled'          // 已取消
  | 'expired';           // 已过期

/**
 * 退款方式枚举
 * @description 定义退款的支付方式
 */
export type RefundMethod = 
  | 'original_payment'   // 原路退回
  | 'balance'            // 退到余额
  | 'points'             // 退为积分
  | 'bank_transfer'      // 银行转账
  | 'cash';              // 现金退款

/**
 * 退款商品项接口
 * @description 退款申请中的商品项信息
 */
export interface RefundItem {
  /** 项目ID */
  id: string;
  /** 产品ID */
  product_id: string;
  /** 关联的产品对象 */
  product?: Product;
  /** 产品名称 */
  product_name: string;
  /** 产品图片 */
  product_image?: string;
  /** 产品SKU */
  sku?: string;
  /** 原价格 */
  price: number;
  /** 原数量 */
  quantity: number;
  /** 退款数量 */
  refund_quantity: number;
  /** 退款金额 */
  refund_amount: number;
  /** 退款原因 */
  reason?: string;
}

/**
 * 退款时间线接口
 * @description 退款处理的时间线记录
 */
export interface RefundTimeline {
  /** 记录ID */
  id: string;
  /** 操作动作 */
  action: string;
  /** 操作描述 */
  description: string;
  /** 操作员 */
  operator?: string;
  /** 操作员类型 */
  operator_type: 'user' | 'admin' | 'system';
  /** 备注 */
  notes?: string;
  /** 创建时间 */
  created: string;
}

/**
 * 退款申请实体接口
 * @description 退款申请的完整数据结构
 */
export interface RefundRequest extends BaseEntity {
  /** 服务单号 */
  service_number: string;
  /** 订单ID */
  order_id: string;
  /** 关联的订单对象 */
  order?: Order;
  /** 用户ID */
  user_id: string;
  /** 关联的用户对象 */
  user?: User;
  /** 退款类型 */
  refund_type: RefundType;
  /** 退款方式 */
  refund_method: RefundMethod;
  /** 申请退款金额 */
  refund_amount: number;
  /** 实际退款金额 */
  actual_refund_amount?: number;
  /** 运费退款金额 */
  shipping_fee_refund: number;
  /** 退款原因 */
  reason: RefundReason;
  /** 退款描述 */
  description: string;
  /** 证据图片 */
  evidence_images?: string[];
  /** 退货快递单号 */
  return_tracking_number?: string;
  /** 退货物流公司 */
  return_logistics_company?: string;
  /** 退款状态 */
  status: RefundStatus;
  /** 管理员备注 */
  admin_notes?: string;
  /** 拒绝原因 */
  rejection_reason?: string;
  /** 处理时间 */
  processed_at?: string;
  /** 处理人ID */
  processed_by?: string;
  /** 处理人对象 */
  processor?: User;
  /** 退款完成时间 */
  refunded_at?: string;
  /** 过期时间 */
  expired_at?: string;
  /** 退款商品项 */
  items: RefundItem[];
  /** 时间线记录 */
  timeline: RefundTimeline[];
}

/**
 * 退款查询参数接口
 * @description 用于退款列表查询的参数
 */
export interface RefundQuery extends BaseQuery, DateRangeQuery, AmountRangeQuery {
  /** 按状态筛选 */
  status?: RefundStatus;
  /** 按退款类型筛选 */
  refund_type?: RefundType;
  /** 按退款原因筛选 */
  reason?: RefundReason;
  /** 按退款方式筛选 */
  refund_method?: RefundMethod;
  /** 按用户筛选 */
  user_id?: string;
  /** 按订单筛选 */
  order_id?: string;
  /** 按处理人筛选 */
  processed_by?: string;
}

/**
 * 退款商品项输入接口
 * @description 创建退款申请时的商品项数据
 */
export interface RefundItemInput {
  /** 产品ID */
  product_id: string;
  /** 产品名称 */
  product_name: string;
  /** 产品图片 */
  product_image?: string;
  /** 产品SKU */
  sku?: string;
  /** 原价格 */
  price: number;
  /** 原数量 */
  quantity: number;
  /** 退款数量 */
  refund_quantity: number;
  /** 退款原因 */
  reason?: string;
}

/**
 * 退款申请创建输入接口
 * @description 创建退款申请时需要的数据
 */
export interface RefundRequestInput {
  /** 订单ID */
  order_id: string;
  /** 退款类型 */
  refund_type: RefundType;
  /** 退款方式，默认为原路退回 */
  refund_method?: RefundMethod;
  /** 退款原因 */
  reason: RefundReason;
  /** 退款描述 */
  description: string;
  /** 证据图片 */
  evidence_images?: string[];
  /** 退款商品项 */
  items: RefundItemInput[];
  /** 退货快递单号 */
  return_tracking_number?: string;
  /** 退货物流公司 */
  return_logistics_company?: string;
}

/**
 * 退款处理输入接口
 * @description 处理退款申请时需要的数据
 */
export interface RefundProcessInput {
  /** 处理后的状态 */
  status: RefundStatus;
  /** 管理员备注 */
  admin_notes?: string;
  /** 拒绝原因（状态为rejected时必填） */
  rejection_reason?: string;
  /** 实际退款金额 */
  actual_refund_amount?: number;
  /** 退款方式 */
  refund_method?: RefundMethod;
  /** 处理人ID */
  processed_by: string;
}

/**
 * 批量退款处理输入接口
 * @description 批量处理退款申请的参数
 */
export interface BatchRefundProcessInput {
  /** 退款ID列表 */
  refund_ids: string[];
  /** 处理动作 */
  action: RefundStatus;
  /** 备注 */
  notes?: string;
  /** 处理人ID */
  processed_by: string;
}

/**
 * 退款统计信息接口
 * @description 退款相关的统计数据
 */
export interface RefundStats {
  /** 退款申请总数 */
  total: number;
  /** 各状态退款数量 */
  pending: number;
  approved: number;
  rejected: number;
  processing: number;
  completed: number;
  cancelled: number;
  /** 退款总金额 */
  total_amount: number;
  /** 平均退款金额 */
  avg_amount: number;
  /** 平均处理时间（小时） */
  avg_processing_time: number;
  /** 成功率 */
  success_rate: number;
  /** 各退款类型分布 */
  refund_types: Record<RefundType, number>;
  /** 各退款原因分布 */
  refund_reasons: Record<RefundReason, number>;
  /** 月度趋势数据 */
  monthly_trend: any;
}

/**
 * 退款响应接口
 * @description API返回的退款列表响应
 */
export interface RefundsResponse {
  /** 退款列表 */
  items: RefundRequest[];
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