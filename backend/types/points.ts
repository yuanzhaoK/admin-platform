
// TypeScript 类型定义
export interface PointsRecord {
  id: string;
  user_id: string;
  username: string;
  type: PointsType;
  points: number;
  balance: number;
  reason: string;
  order_id?: string;
  related_id?: string;
  created: string;
}

export interface PointsRule {
  id: string;
  name: string;
  description?: string;
  type: PointsType;
  points: number;
  conditions?: Record<string, any>;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  daily_limit?: number;
  total_limit?: number;
  sort_order: number;
  created: string;
  updated: string;
}

export interface PointsExchange {
  id: string;
  name: string;
  description?: string;
  image?: string;
  points_required: number;
  exchange_type: 'balance' | 'coupon' | 'product' | 'privilege';
  reward_value?: number;
  reward_product_id?: string;
  reward_coupon_id?: string;
  stock?: number;
  used_count: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  sort_order: number;
  created: string;
  updated: string;
}

export interface PointsExchangeRecord {
  id: string;
  user_id: string;
  username: string;
  exchange_id: string;
  exchange: PointsExchange;
  points_cost: number;
  reward_type: 'balance' | 'coupon' | 'product' | 'privilege';
  reward_value?: number;
  status: 'pending' | 'completed' | 'cancelled' | 'failed';
  created: string;
  processed_time?: string;
}

export type PointsType = 
  | 'earned_registration'
  | 'earned_login'
  | 'earned_order'
  | 'earned_review'
  | 'earned_referral'
  | 'earned_activity'
  | 'earned_admin'
  | 'spent_exchange'
  | 'spent_order'
  | 'expired'
  | 'admin_adjust';

export interface PointsRecordQueryInput {
  page?: number;
  perPage?: number;
  user_id?: string;
  username?: string;
  type?: PointsType;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PointsRuleQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  type?: PointsType;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PointsRuleInput {
  name: string;
  description?: string;
  type: PointsType;
  points: number;
  conditions?: Record<string, any>;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  daily_limit?: number;
  total_limit?: number;
  sort_order: number;
}

export interface PointsRuleUpdateInput {
  name?: string;
  description?: string;
  type?: PointsType;
  points?: number;
  conditions?: Record<string, any>;
  is_active?: boolean;
  start_time?: string;
  end_time?: string;
  daily_limit?: number;
  total_limit?: number;
  sort_order?: number;
}

export interface PointsExchangeQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  exchange_type?: 'balance' | 'coupon' | 'product' | 'privilege';
  status?: 'active' | 'inactive' | 'out_of_stock';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PointsExchangeInput {
  name: string;
  description?: string;
  image?: string;
  points_required: number;
  exchange_type: 'balance' | 'coupon' | 'product' | 'privilege';
  reward_value?: number;
  reward_product_id?: string;
  reward_coupon_id?: string;
  stock?: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  sort_order: number;
}

export interface PointsExchangeUpdateInput {
  name?: string;
  description?: string;
  image?: string;
  points_required?: number;
  exchange_type?: 'balance' | 'coupon' | 'product' | 'privilege';
  reward_value?: number;
  reward_product_id?: string;
  reward_coupon_id?: string;
  stock?: number;
  status?: 'active' | 'inactive' | 'out_of_stock';
  sort_order?: number;
}

export interface PointsExchangeRecordQueryInput {
  page?: number;
  perPage?: number;
  user_id?: string;
  exchange_id?: string;
  status?: 'pending' | 'completed' | 'cancelled' | 'failed';
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PointsStats {
  totalPoints: number;
  totalUsers: number;
  totalEarned: number;
  totalSpent: number;
  totalExpired: number;
  exchangeStats: Record<string, any>;
  ruleStats: Record<string, any>;
  monthlyTrend: Record<string, any>;
} 