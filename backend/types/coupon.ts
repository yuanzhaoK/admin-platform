
// TypeScript 类型定义
export interface Coupon {
  id: string;
  name: string;
  description?: string;
  code: string;
  type: 'general' | 'member_exclusive' | 'new_user' | 'birthday' | 'activity';
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'fixed';
  discount_value: number;
  min_amount?: number;
  max_discount?: number;
  total_quantity?: number;
  used_quantity: number;
  per_user_limit?: number;
  status: 'active' | 'inactive' | 'expired' | 'used_up';
  start_time: string;
  end_time: string;
  applicable_products: string[];
  applicable_categories: string[];
  applicable_brands: string[];
  applicable_member_levels: string[];
}

// PocketBase 实际存储的数据结构
export interface PocketBaseCoupon {
  id: string;
  name: string;
  description?: string;
  code: string;
  type: 'fixed' | 'percent'; // PocketBase中的实际值
  value: number; // 对应discount_value
  min_amount?: number;
  max_discount?: number;
  usage_limit?: number; // 对应total_quantity
  used_count: number; // 对应used_quantity
  status: 'active' | 'inactive' | 'expired';
  start_time: string;
  end_time: string;
  applicable_categories?: string;
  applicable_products?: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  coupon: Coupon;
  user_id: string;
  order_id?: string;
  discount_amount: number;
  used_time: string;
  created: string;
}

export interface CouponQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  type?: 'general' | 'member_exclusive' | 'new_user' | 'birthday' | 'activity';
  status?: 'active' | 'inactive' | 'expired' | 'used_up';
  discount_type?: 'percentage' | 'fixed_amount' | 'free_shipping';
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CouponInput {
  name: string;
  description?: string;
  code: string;
  type: 'general' | 'member_exclusive' | 'new_user' | 'birthday' | 'activity';
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  min_amount?: number;
  max_discount?: number;
  total_quantity?: number;
  per_user_limit?: number;
  status: 'active' | 'inactive' | 'expired' | 'used_up';
  start_time: string;
  end_time: string;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  applicable_member_levels?: string[];
}

export interface CouponUpdateInput {
  name?: string;
  description?: string;
  code?: string;
  type?: 'general' | 'member_exclusive' | 'new_user' | 'birthday' | 'activity';
  discount_type?: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value?: number;
  min_amount?: number;
  max_discount?: number;
  total_quantity?: number;
  per_user_limit?: number;
  status?: 'active' | 'inactive' | 'expired' | 'used_up';
  start_time?: string;
  end_time?: string;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  applicable_member_levels?: string[];
}

export interface CouponUsageQueryInput {
  page?: number;
  perPage?: number;
  coupon_id?: string;
  user_id?: string;
  order_id?: string;
  used_date_start?: string;
  used_date_end?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CouponStats {
  total: number;
  active: number;
  expired: number;
  used_up: number;
  totalUsage: number;
  totalDiscount: number;
  typeDistribution: Record<string, any>;
  usageThisMonth: number;
} 