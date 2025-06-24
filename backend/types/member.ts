
// TypeScript 类型定义
export interface Member {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  real_name?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  level: MemberLevel;
  points: number;
  balance: number;
  status: 'active' | 'inactive' | 'banned';
  register_time: string;
  last_login_time?: string;
  total_orders: number;
  total_amount: number;
}

export interface MemberLevel {
  id: string;
  name: string;
  description?: string;
  discount_rate: number;
  points_required: number;
  benefits: string[];
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

export interface MemberQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'banned';
  level_id?: string;
  gender?: 'male' | 'female' | 'unknown';
  register_date_start?: string;
  register_date_end?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MemberInput {
  username: string;
  email: string;
  phone?: string;
  real_name?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  level_id: string;
  points?: number;
  balance?: number;
  total_orders?: number;
  total_amount?: number;
  status: 'active' | 'inactive' | 'banned';
}

export interface MemberUpdateInput {
  username?: string;
  email?: string;
  phone?: string;
  real_name?: string;
  gender?: 'male' | 'female' | 'unknown';
  birthday?: string;
  level_id?: string;
  points?: number;
  balance?: number;
  total_orders?: number;
  total_amount?: number;
  status?: 'active' | 'inactive' | 'banned';
}

export interface MemberLevelInput {
  name: string;
  description?: string;
  discount_rate: number;
  points_required: number;
  benefits: string[];
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

export interface MemberLevelUpdateInput {
  name?: string;
  description?: string;
  discount_rate?: number;
  points_required?: number;
  benefits?: string[];
  icon?: string;
  color?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  banned: number;
  totalPoints: number;
  totalBalance: number;
  levelDistribution: Record<string, any>;
  newMembersThisMonth: number;
} 