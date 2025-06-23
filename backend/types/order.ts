/**
 * 订单相关类型定义
 * @description 包含订单、物流、支付等相关类型定义
 * @author Admin Platform Team
 * @version 1.0.0
 */

import type { AmountRangeQuery, BaseEntity, BaseQuery, DateRangeQuery } from './base.ts';
import type { Product } from './product.ts';
import type { User } from './user.ts';

/**
 * 订单状态枚举
 * @description 定义订单的各种状态
 */
export type OrderStatus = 
  | 'pending_payment'    // 待付款
  | 'paid'              // 已付款
  | 'processing'        // 处理中
  | 'shipped'           // 已发货
  | 'delivered'         // 已送达
  | 'completed'         // 已完成
  | 'cancelled'         // 已取消
  | 'refunding'         // 退款中
  | 'refunded';         // 已退款

/**
 * 支付方式枚举
 * @description 定义支持的支付方式
 */
export type PaymentMethod = 
  | 'alipay'            // 支付宝
  | 'wechat'            // 微信支付
  | 'credit_card'       // 信用卡
  | 'bank_transfer'     // 银行转账
  | 'cash_on_delivery'  // 货到付款
  | 'points'            // 积分支付
  | 'balance';          // 余额支付

/**
 * 订单来源枚举
 * @description 定义订单的来源渠道
 */
export type OrderSource = 
  | 'web'               // 网站
  | 'mobile'            // 手机端
  | 'app'               // APP
  | 'wechat'            // 微信
  | 'admin';            // 管理后台

/**
 * 订单类型枚举
 * @description 定义订单的业务类型
 */
export type OrderType = 
  | 'normal'            // 普通订单
  | 'presale'           // 预售订单
  | 'group_buy'         // 团购订单
  | 'flash_sale'        // 秒杀订单
  | 'points_exchange';  // 积分兑换

/**
 * 物流状态枚举
 * @description 定义物流配送状态
 */
export type LogisticsStatus = 
  | 'pending'           // 待发货
  | 'picked_up'         // 已揽件
  | 'in_transit'        // 运输中
  | 'out_for_delivery'  // 派送中
  | 'delivered'         // 已送达
  | 'failed'            // 配送失败
  | 'returned';         // 已退回

/**
 * 收货地址接口
 * @description 订单收货地址信息
 */
export interface ShippingAddress {
  /** 收货人姓名 */
  name: string;
  /** 收货人电话 */
  phone: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 区县 */
  district: string;
  /** 详细地址 */
  address: string;
  /** 邮政编码 */
  postal_code?: string;
  /** 国家 */
  country?: string;
}

/**
 * 物流更新记录接口
 * @description 物流状态更新记录
 */
export interface LogisticsUpdate {
  /** 更新时间 */
  time: string;
  /** 物流状态 */
  status: LogisticsStatus;
  /** 状态描述 */
  description: string;
  /** 所在位置 */
  location?: string;
  /** 操作员 */
  operator?: string;
}

/**
 * 物流信息接口
 * @description 订单物流配送信息
 */
export interface LogisticsInfo {
  /** 物流公司 */
  company?: string;
  /** 物流公司编码 */
  company_code?: string;
  /** 运单号 */
  tracking_number?: string;
  /** 物流状态 */
  status?: LogisticsStatus;
  /** 预计送达时间 */
  estimated_delivery?: string;
  /** 物流更新记录 */
  updates?: LogisticsUpdate[];
  /** 创建时间 */
  created: string;
  /** 更新时间 */
  updated: string;
}

/**
 * 支付信息接口
 * @description 订单支付相关信息
 */
export interface PaymentInfo {
  /** 交易ID */
  transaction_id?: string;
  /** 支付网关 */
  payment_gateway?: string;
  /** 网关响应数据 */
  gateway_response?: any;
  /** 实际支付金额 */
  paid_amount: number;
  /** 货币类型 */
  currency: string;
  /** 汇率 */
  exchange_rate?: number;
  /** 支付时间 */
  paid_at?: string;
}

/**
 * 优惠券信息接口
 * @description 订单使用的优惠券信息
 */
export interface CouponInfo {
  /** 优惠券ID */
  coupon_id?: string;
  /** 优惠券代码 */
  coupon_code?: string;
  /** 优惠券名称 */
  coupon_name?: string;
  /** 折扣类型 */
  discount_type?: string;
  /** 折扣值 */
  discount_value: number;
  /** 最小使用金额 */
  min_amount?: number;
}

/**
 * 订单商品项接口
 * @description 订单中的商品项信息
 */
export interface OrderItem {
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
  /** 单价 */
  price: number;
  /** 原价 */
  original_price: number;
  /** 折扣金额 */
  discount: number;
  /** 数量 */
  quantity: number;
  /** 小计 */
  total: number;
  /** 产品属性 */
  attributes?: any;
  /** 备注 */
  notes?: string;
}

/**
 * 订单实体接口
 * @description 订单的完整数据结构
 */
export interface Order extends BaseEntity {
  /** 订单号 */
  order_number: string;
  /** 用户ID */
  user_id: string;
  /** 关联的用户对象 */
  user?: User;
  /** 订单总金额 */
  total_amount: number;
  /** 实际支付金额 */
  payment_amount: number;
  /** 折扣金额 */
  discount_amount: number;
  /** 运费 */
  shipping_fee: number;
  /** 税费 */
  tax_amount: number;
  /** 支付方式 */
  payment_method: PaymentMethod;
  /** 订单来源 */
  order_source: OrderSource;
  /** 订单类型 */
  order_type: OrderType;
  /** 订单状态 */
  status: OrderStatus;
  /** 订单商品项 */
  items: OrderItem[];
  /** 收货地址 */
  shipping_address: ShippingAddress;
  /** 账单地址 */
  billing_address?: ShippingAddress;
  /** 物流信息 */
  logistics_info?: LogisticsInfo;
  /** 支付信息 */
  payment_info?: PaymentInfo;
  /** 优惠券信息 */
  coupon_info?: CouponInfo;
  /** 订单备注 */
  notes?: string;
  /** 管理员备注 */
  admin_notes?: string;
  /** 支付时间 */
  paid_at?: string;
  /** 发货时间 */
  shipped_at?: string;
  /** 送达时间 */
  delivered_at?: string;
  /** 取消时间 */
  cancelled_at?: string;
  /** 退款时间 */
  refunded_at?: string;
}

/**
 * 订单查询参数接口
 * @description 用于订单列表查询的参数
 */
export interface OrderQuery extends BaseQuery, DateRangeQuery, AmountRangeQuery {
  /** 按状态筛选 */
  status?: OrderStatus;
  /** 按支付方式筛选 */
  payment_method?: PaymentMethod;
  /** 按订单来源筛选 */
  order_source?: OrderSource;
  /** 按订单类型筛选 */
  order_type?: OrderType;
  /** 按用户筛选 */
  user_id?: string;
}

/**
 * 订单商品项输入接口
 * @description 创建订单时的商品项数据
 */
export interface OrderItemInput {
  /** 产品ID */
  product_id: string;
  /** 产品名称 */
  product_name: string;
  /** 产品图片 */
  product_image?: string;
  /** 产品SKU */
  sku?: string;
  /** 单价 */
  price: number;
  /** 原价 */
  original_price: number;
  /** 折扣金额 */
  discount: number;
  /** 数量 */
  quantity: number;
  /** 产品属性 */
  attributes?: any;
  /** 备注 */
  notes?: string;
}

/**
 * 收货地址输入接口
 * @description 创建订单时的收货地址数据
 */
export interface ShippingAddressInput {
  /** 收货人姓名 */
  name: string;
  /** 收货人电话 */
  phone: string;
  /** 省份 */
  province: string;
  /** 城市 */
  city: string;
  /** 区县 */
  district: string;
  /** 详细地址 */
  address: string;
  /** 邮政编码 */
  postal_code?: string;
  /** 国家 */
  country?: string;
}

/**
 * 订单创建输入接口
 * @description 创建订单时需要的数据
 */
export interface OrderInput {
  /** 用户ID */
  user_id: string;
  /** 订单商品项 */
  items: OrderItemInput[];
  /** 收货地址 */
  shipping_address: ShippingAddressInput;
  /** 账单地址 */
  billing_address?: ShippingAddressInput;
  /** 支付方式 */
  payment_method: PaymentMethod;
  /** 订单来源 */
  order_source: OrderSource;
  /** 订单类型 */
  order_type: OrderType;
  /** 运费 */
  shipping_fee?: number;
  /** 税费 */
  tax_amount?: number;
  /** 优惠券代码 */
  coupon_code?: string;
  /** 订单备注 */
  notes?: string;
}

/**
 * 订单更新输入接口
 * @description 更新订单时需要的数据
 */
export interface OrderUpdateInput {
  /** 订单状态 */
  status?: OrderStatus;
  /** 管理员备注 */
  admin_notes?: string;
  /** 物流信息 */
  logistics_info?: Partial<LogisticsInfo>;
  /** 支付信息 */
  payment_info?: Partial<PaymentInfo>;
}

/**
 * 订单统计信息接口
 * @description 订单相关的统计数据
 */
export interface OrderStats {
  /** 订单总数 */
  total: number;
  /** 各状态订单数量 */
  pending_payment: number;
  paid: number;
  processing: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
  refunding: number;
  refunded: number;
  /** 订单总金额 */
  total_amount: number;
  /** 平均订单金额 */
  avg_amount: number;
  /** 今日订单数 */
  today_orders: number;
  /** 今日订单金额 */
  today_amount: number;
  /** 各支付方式分布 */
  payment_methods: Record<PaymentMethod, number>;
  /** 各订单来源分布 */
  order_sources: Record<OrderSource, number>;
  /** 各订单类型分布 */
  order_types: Record<OrderType, number>;
  /** 月度趋势数据 */
  monthly_trend: any;
}

/**
 * 订单响应接口
 * @description API返回的订单列表响应
 */
export interface OrdersResponse {
  /** 订单列表 */
  items: Order[];
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