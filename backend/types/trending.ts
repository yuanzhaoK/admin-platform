// TypeScript 类型定义
export interface TrendingItem {
  id: string;
  product_name: string;
  description?: string;
  type: TrendingType;
  product_id: string;
  item_data: Record<string, any>;
  category?: string;
  tags: string[];
  score: number;
  manual_score?: number;
  auto_score?: number;
  rank: number;
  status: TrendingStatus;
  start_time?: string;
  end_time?: string;
  created: string;
  updated: string;
}

export interface TrendingCategory {
  id: string;
  name: string;
  description?: string;
  type: TrendingType;
  display_count: number;
  update_frequency: UpdateFrequency;
  calculation_method: CalculationMethod;
  weight_config: Record<string, any>;
  is_active: boolean;
  sort_order: number;
  created: string;
  updated: string;
}

export interface TrendingStats {
  id: string;
  product_id: string;
  date: string;
  view_count: number;
  click_count: number;
  share_count: number;
  like_count: number;
  comment_count: number;
  purchase_count: number;
  score: number;
}

export type TrendingType = 
  | 'product'
  | 'category'
  | 'brand'
  | 'keyword'
  | 'content'
  | 'topic'
  | 'views'
  | 'search'
  | 'sales'
  | 'manual'
  | 'rating'
  | 'auto';

export type TrendingStatus = 
  | 'active'
  | 'inactive'
  | 'expired'
  | 'pending';

export type UpdateFrequency = 
  | 'realtime'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'manual';

export type CalculationMethod = 
  | 'view_based'
  | 'engagement_based'
  | 'purchase_based'
  | 'composite'
  | 'manual';

export interface TrendingItemQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  type?: TrendingType;
  category?: string;
  status?: TrendingStatus;
  score_min?: number;
  score_max?: number;
  rank_min?: number;
  rank_max?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TrendingItemInput {
  name: string;
  description?: string;
  type: TrendingType;
  product_id: string;
  category?: string;
  tags?: string[];
  manual_score?: number;
  status: TrendingStatus;
  start_time?: string;
  end_time?: string;
}

export interface TrendingItemUpdateInput {
  name?: string;
  description?: string;
  type?: TrendingType;
  product_id?: string;
  category?: string;
  tags?: string[];
  manual_score?: number;
  status?: TrendingStatus;
  start_time?: string;
  end_time?: string;
}

export interface TrendingCategoryInput {
  name: string;
  description?: string;
  type: TrendingType;
  display_count: number;
  update_frequency: UpdateFrequency;
  calculation_method: CalculationMethod;
  weight_config: Record<string, any>;
  is_active: boolean;
  sort_order: number;
}

export interface TrendingCategoryUpdateInput {
  name?: string;
  description?: string;
  type?: TrendingType;
  display_count?: number;
  update_frequency?: UpdateFrequency;
  calculation_method?: CalculationMethod;
  weight_config?: Record<string, any>;
  is_active?: boolean;
  sort_order?: number;
}

export interface TrendingStatsQueryInput {
  product_id?: string;
  start_date: string;
  end_date: string;
  page?: number;
  perPage?: number;
}

export interface TrendingOverviewStats {
  totalItems: number;
  activeItems: number;
  totalViews: number;
  totalClicks: number;
  topTrending: TrendingItem[];
  categoryStats: Record<string, any>;
  typeStats: Record<string, any>;
  dailyTrends: Record<string, any>;
  weeklyTrends: Record<string, any>;
  monthlyTrends: Record<string, any>;
} 