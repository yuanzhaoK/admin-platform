
// TypeScript 类型定义
export interface Advertisement {
  id: string;
  name: string;
  description?: string;
  type: AdType;
  position: AdPosition;
  image: string;
  link_type: LinkType;
  link_url?: string;
  link_product_id?: string;
  link_category_id?: string;
  target_type: TargetType;
  content?: string;
  status: AdStatus;
  start_time: string;
  end_time: string;
  weight: number;
  click_count: number;
  view_count: number;
  budget?: number;
  cost: number;
  tags: string[];
  created: string;
  updated: string;
}

export interface AdGroup {
  id: string;
  name: string;
  description?: string;
  position: AdPosition;
  ads: Advertisement[];
  display_count: number;
  rotation_type: RotationType;
  is_active: boolean;
  created: string;
  updated: string;
}

export interface AdStats {
  id: string;
  ad_id: string;
  date: string;
  view_count: number;
  click_count: number;
  ctr: number;
  cost: number;
  conversion_count: number;
  conversion_rate: number;
}

export type AdType = 
  | 'banner'
  | 'popup'
  | 'floating'
  | 'text'
  | 'video'
  | 'rich_media';

export type AdPosition = 
  | 'homepage_top'
  | 'homepage_middle'
  | 'homepage_bottom'
  | 'category_top'
  | 'category_sidebar'
  | 'product_detail_top'
  | 'product_detail_bottom'
  | 'cart_page'
  | 'checkout_page'
  | 'search_results'
  | 'mobile_banner';

export type LinkType = 
  | 'url'
  | 'product'
  | 'category'
  | 'page'
  | 'none';

export type TargetType = 
  | 'self'
  | 'blank';

export type AdStatus = 
  | 'active'
  | 'inactive'
  | 'expired'
  | 'paused';

export type RotationType = 
  | 'sequential'
  | 'random'
  | 'weighted';

export interface AdvertisementQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  type?: AdType;
  position?: AdPosition;
  status?: AdStatus;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdvertisementInput {
  name: string;
  description?: string;
  type: AdType;
  position: AdPosition;
  image: string;
  link_type: LinkType;
  link_url?: string;
  link_product_id?: string;
  link_category_id?: string;
  target_type: TargetType;
  content?: string;
  status: AdStatus;
  start_time: string;
  end_time: string;
  weight: number;
  budget?: number;
  tags?: string[];
}

export interface AdvertisementUpdateInput {
  name?: string;
  description?: string;
  type?: AdType;
  position?: AdPosition;
  image?: string;
  link_type?: LinkType;
  link_url?: string;
  link_product_id?: string;
  link_category_id?: string;
  target_type?: TargetType;
  content?: string;
  status?: AdStatus;
  start_time?: string;
  end_time?: string;
  weight?: number;
  budget?: number;
  tags?: string[];
}

export interface AdGroupInput {
  name: string;
  description?: string;
  position: AdPosition;
  ad_ids: string[];
  display_count: number;
  rotation_type: RotationType;
  is_active: boolean;
}

export interface AdGroupUpdateInput {
  name?: string;
  description?: string;
  position?: AdPosition;
  ad_ids?: string[];
  display_count?: number;
  rotation_type?: RotationType;
  is_active?: boolean;
}

export interface AdStatsQueryInput {
  ad_id?: string;
  start_date: string;
  end_date: string;
  page?: number;
  perPage?: number;
}

export interface AdOverviewStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalClicks: number;
  totalCost: number;
  avgCtr: number;
  topPerforming: Advertisement[];
  positionStats: Record<string, any>;
  typeStats: Record<string, any>;
  dailyStats: Record<string, any>;
} 