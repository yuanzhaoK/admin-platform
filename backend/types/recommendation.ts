// TypeScript 类型定义
export interface ProductRecommendation {
  id: string;
  name: string;
  description?: string;
  type: RecommendationType;
  position: RecommendationPosition;
  products: any[]; // Product 类型
  product_ids: string[];
  conditions?: Record<string, any>;
  display_count: number;
  sort_type: SortType;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  weight: number;
  click_count: number;
  conversion_count: number;
  created: string;
  updated: string;
}

export interface RecommendationRule {
  id: string;
  name: string;
  description?: string;
  type: RecommendationType;
  conditions: Record<string, any>;
  default_display_count: number;
  default_sort_type: SortType;
  is_system: boolean;
  created: string;
  updated: string;
}

export interface RecommendationStats {
  id: string;
  recommendation_id: string;
  date: string;
  view_count: number;
  click_count: number;
  conversion_count: number;
  ctr: number;
  conversion_rate: number;
}

export type RecommendationType = 
  | 'hot_products'
  | 'new_products'
  | 'recommended_products'
  | 'category_based'
  | 'user_behavior'
  | 'collaborative_filtering'
  | 'custom_selection';

export type RecommendationPosition = 
  | 'homepage_banner'
  | 'homepage_grid'
  | 'category_sidebar'
  | 'product_detail_related'
  | 'cart_recommend'
  | 'checkout_recommend'
  | 'search_recommend';

export type SortType = 
  | 'manual'
  | 'sales_desc'
  | 'price_asc'
  | 'price_desc'
  | 'created_desc'
  | 'rating_desc'
  | 'random';

export interface ProductRecommendationQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  type?: RecommendationType;
  position?: RecommendationPosition;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductRecommendationInput {
  name: string;
  description?: string;
  type: RecommendationType;
  position: RecommendationPosition;
  product_ids?: string[];
  conditions?: Record<string, any>;
  display_count: number;
  sort_type: SortType;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  weight: number;
}

export interface ProductRecommendationUpdateInput {
  name?: string;
  description?: string;
  type?: RecommendationType;
  position?: RecommendationPosition;
  product_ids?: string[];
  conditions?: Record<string, any>;
  display_count?: number;
  sort_type?: SortType;
  is_active?: boolean;
  start_time?: string;
  end_time?: string;
  weight?: number;
}

export interface RecommendationRuleInput {
  name: string;
  description?: string;
  type: RecommendationType;
  conditions: Record<string, any>;
  default_display_count: number;
  default_sort_type: SortType;
}

export interface RecommendationRuleUpdateInput {
  name?: string;
  description?: string;
  type?: RecommendationType;
  conditions?: Record<string, any>;
  default_display_count?: number;
  default_sort_type?: SortType;
}

export interface RecommendationStatsQueryInput {
  recommendation_id?: string;
  start_date: string;
  end_date: string;
  page?: number;
  perPage?: number;
}

export interface RecommendationOverviewStats {
  totalRecommendations: number;
  activeRecommendations: number;
  totalViews: number;
  totalClicks: number;
  totalConversions: number;
  avgCtr: number;
  avgConversionRate: number;
  topPerforming: ProductRecommendation[];
  positionStats: Record<string, any>;
  typeStats: Record<string, any>;
} 