/**
 * 产品相关类型定义
 * @description 包含产品、分类、品牌、产品类型等相关类型定义
 * @author Admin Platform Team
 * @version 1.0.0
 */

import type { BaseEntity, BaseQuery, ProductStatus, ReviewStatus, Status } from './base.ts';

/**
 * 产品尺寸接口
 * @description 产品的物理尺寸信息
 */
export interface ProductDimensions {
  /** 长度(cm) */
  length?: number;
  /** 宽度(cm) */
  width?: number;
  /** 高度(cm) */
  height?: number;
}

/**
 * 产品实体接口
 * @description 产品的完整数据结构
 */
export interface Product extends BaseEntity {
  /** 产品名称 */
  name: string;
  /** 产品副标题 */
  subtitle?: string;
  /** 产品描述 */
  description?: string;
  /** 销售价格 */
  price?: number;
  /** 市场价格 */
  market_price?: number;
  /** 成本价格 */
  cost_price?: number;
  /** 分类ID */
  category_id?: string;
  /** 关联的分类对象 */
  category?: ProductCategory;
  /** 品牌ID */
  brand_id?: string;
  /** 关联的品牌对象 */
  brand?: Brand;
  /** 产品类型ID */
  product_type_id?: string;
  /** 关联的产品类型对象 */
  product_type?: ProductType;
  /** 产品状态 */
  status: ProductStatus;
  /** 产品标签 */
  tags?: string[];
  /** 产品配置 */
  config?: any;
  /** 产品SKU */
  sku?: string;
  /** 库存数量 */
  stock?: number;
  /** 计量单位 */
  unit?: string;
  /** 重量(g) */
  weight?: number;
  /** 产品尺寸 */
  dimensions?: ProductDimensions;
  /** 产品图片URL列表 */
  images?: string[];
  /** 元数据 */
  meta_data?: any;
  /** 排序顺序 */
  sort_order?: number;
  /** 是否推荐 */
  is_featured?: boolean;
  /** 是否新品 */
  is_new?: boolean;
  /** 是否热销 */
  is_hot?: boolean;
  /** 积分价值 */
  points?: number;
  /** 成长值 */
  growth_value?: number;
  /** 积分购买限制 */
  points_purchase_limit?: number;
  /** 是否启用预览 */
  preview_enabled?: boolean;
  /** 是否已发布 */
  is_published?: boolean;
  /** 是否推荐 */
  is_recommended?: boolean;
  /** 服务保障 */
  service_guarantee?: string[];
  /** 销售数量 */
  sales_count?: number;
  /** 浏览次数 */
  view_count?: number;
  /** 审核状态 */
  review_status: ReviewStatus;
  /** 产品属性 */
  attributes?: any;
}

/**
 * 产品分类接口
 * @description 产品分类的数据结构
 */
export interface ProductCategory extends BaseEntity {
  /** 分类名称 */
  name: string;
  /** 分类slug */
  slug: string;
  /** 分类描述 */
  description?: string;
  /** 分类图片 */
  image?: string;
  /** 父分类ID */
  parent_id?: string;
  /** 父分类对象 */
  parent?: ProductCategory;
  /** 子分类列表 */
  children?: ProductCategory[];
  /** 分类级别 */
  level: number;
  /** 分类路径 */
  path: string;
  /** 排序顺序 */
  sort_order?: number;
  /** 是否激活 */
  is_active: boolean;
  /** SEO标题 */
  meta_title?: string;
  /** SEO描述 */
  meta_description?: string;
  /** SEO关键词 */
  meta_keywords?: string;
  /** 产品数量 */
  products_count?: number;
  
  // 数据库字段（用于映射）
  /** @internal 数据库状态字段 */
  status?: Status;
  /** @internal 数据库图标字段 */
  icon?: string;
  /** @internal 数据库SEO标题字段 */
  seo_title?: string;
  /** @internal 数据库SEO描述字段 */
  seo_description?: string;
  /** @internal 数据库产品数量字段 */
  product_count?: number;
}

/**
 * 品牌接口
 * @description 产品品牌的数据结构
 */
export interface Brand extends BaseEntity {
  /** 品牌名称 */
  name: string;
  /** 品牌slug */
  slug: string;
  /** 品牌描述 */
  description?: string;
  /** 品牌LOGO */
  logo?: string;
  /** 品牌官网 */
  website?: string;
  /** 品牌国家 */
  country?: string;
  /** 成立年份 */
  founded_year?: number;
  /** 是否激活 */
  is_active: boolean;
  /** 排序顺序 */
  sort_order?: number;
  /** SEO标题 */
  meta_title?: string;
  /** SEO描述 */
  meta_description?: string;
  /** SEO关键词 */
  meta_keywords?: string;
  /** 产品数量 */
  products_count?: number;
  
  // 数据库字段（用于映射）
  /** @internal 数据库状态字段 */
  status?: Status;
  /** @internal 数据库SEO标题字段 */
  seo_title?: string;
  /** @internal 数据库SEO描述字段 */
  seo_description?: string;
  /** @internal 数据库产品数量字段 */
  product_count?: number;
}

/**
 * 产品类型属性接口
 * @description 产品类型的属性定义
 */
export interface ProductTypeAttribute {
  /** 属性名称 */
  name: string;
  /** 属性类型 */
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'color' | 'image';
  /** 是否必填 */
  required: boolean;
  /** 选项值（用于select和multiselect类型） */
  options?: string[];
  /** 默认值 */
  default_value?: any;
  /** 属性描述 */
  description?: string;
}

/**
 * 产品类型接口
 * @description 产品类型的数据结构
 */
export interface ProductType extends BaseEntity {
  /** 类型名称 */
  name: string;
  /** 类型描述 */
  description?: string;
  /** 属性列表 */
  attributes?: ProductTypeAttribute[];
  /** 类型状态 */
  status: Status;
  /** 产品数量 */
  product_count?: number;
}

/**
 * 产品查询参数接口
 * @description 用于产品列表查询的参数
 */
export interface ProductQuery extends BaseQuery {
  /** 按状态筛选 */
  status?: ProductStatus;
  /** 按分类筛选 */
  category_id?: string;
  /** 按品牌筛选 */
  brand_id?: string;
  /** 按产品类型筛选 */
  product_type_id?: string;
  /** 最小价格 */
  priceMin?: number;
  /** 最大价格 */
  priceMax?: number;
  /** 最小库存 */
  stockMin?: number;
  /** 最大库存 */
  stockMax?: number;
  /** 按标签筛选 */
  tags?: string[];
  /** 是否推荐 */
  is_featured?: boolean;
  /** 是否新品 */
  is_new?: boolean;
  /** 是否热销 */
  is_hot?: boolean;
  /** 是否已发布 */
  is_published?: boolean;
  /** 审核状态 */
  review_status?: ReviewStatus;
}

/**
 * 产品创建输入接口
 * @description 创建产品时需要的数据
 */
export interface ProductInput {
  /** 产品名称（必填） */
  name: string;
  /** 产品副标题 */
  subtitle?: string;
  /** 产品描述 */
  description?: string;
  /** 销售价格 */
  price?: number;
  /** 市场价格 */
  market_price?: number;
  /** 成本价格 */
  cost_price?: number;
  /** 分类ID */
  category_id?: string;
  /** 品牌ID */
  brand_id?: string;
  /** 产品类型ID */
  product_type_id?: string;
  /** 产品状态（必填） */
  status: ProductStatus;
  /** 产品标签 */
  tags?: string[];
  /** 产品SKU */
  sku?: string;
  /** 库存数量 */
  stock?: number;
  /** 计量单位 */
  unit?: string;
  /** 重量 */
  weight?: number;
  /** 产品图片 */
  images?: string[];
  /** 排序顺序 */
  sort_order?: number;
  /** 是否推荐 */
  is_featured?: boolean;
  /** 是否新品 */
  is_new?: boolean;
  /** 是否热销 */
  is_hot?: boolean;
  /** 积分价值 */
  points?: number;
  /** 成长值 */
  growth_value?: number;
  /** 积分购买限制 */
  points_purchase_limit?: number;
  /** 是否启用预览 */
  preview_enabled?: boolean;
  /** 是否已发布 */
  is_published?: boolean;
  /** 是否推荐 */
  is_recommended?: boolean;
  /** 服务保障 */
  service_guarantee?: string[];
  /** 产品属性 */
  attributes?: any;
}

/**
 * 产品更新输入接口
 * @description 更新产品时需要的数据
 */
export interface ProductUpdateInput extends Omit<ProductInput, 'name' | 'status'> {
  /** 产品名称 */
  name?: string;
  /** 产品状态 */
  status?: ProductStatus;
  /** 审核状态 */
  review_status?: ReviewStatus;
}

/**
 * 产品统计信息接口
 * @description 产品相关的统计数据
 */
export interface ProductStats {
  /** 产品总数 */
  total: number;
  /** 活跃产品数 */
  active: number;
  /** 非活跃产品数 */
  inactive: number;
  /** 草稿产品数 */
  draft: number;
  /** 各分类产品分布 */
  categories: Record<string, number>;
  /** 平均价格 */
  avgPrice?: number;
  /** 总库存 */
  totalStock?: number;
  /** 低库存产品数 */
  lowStock: number;
  /** 缺货产品数 */
  outOfStock: number;
  /** 各品牌产品分布 */
  brands: Record<string, number>;
  /** 各产品类型分布 */
  productTypes: Record<string, number>;
  /** 审核状态分布 */
  review_status_distribution: Record<ReviewStatus, number>;
}

/**
 * 库存操作结果接口
 * @description 库存操作的结果
 */
export interface StockOperationResult {
  /** 操作是否成功 */
  success: boolean;
  /** 结果消息 */
  message?: string;
  /** 产品对象 */
  product?: Product;
  /** 操作前库存 */
  previousStock?: number;
  /** 操作后库存 */
  newStock?: number;
}

/**
 * 库存调整输入接口
 * @description 库存调整操作的参数
 */
export interface StockAdjustmentInput {
  /** 产品ID */
  product_id: string;
  /** 调整类型 */
  adjustment_type: 'SET' | 'ADD' | 'SUBTRACT';
  /** 调整数量 */
  quantity: number;
  /** 调整原因 */
  reason?: string;
  /** 备注 */
  notes?: string;
}

/**
 * 批量价格更新输入接口
 * @description 批量更新产品价格的参数
 */
export interface BatchPriceUpdateInput {
  /** 产品ID列表 */
  productIds: string[];
  /** 价格值 */
  price: number;
  /** 更新类型 */
  updateType: 'SET' | 'INCREASE' | 'DECREASE' | 'PERCENTAGE_INCREASE' | 'PERCENTAGE_DECREASE';
}

/**
 * 产品导出输入接口
 * @description 产品导出的参数
 */
export interface ExportProductsInput {
  /** 筛选条件 */
  filters?: ProductQuery;
  /** 导出字段 */
  fields?: string[];
  /** 导出格式 */
  format?: 'csv' | 'excel' | 'json';
}

/**
 * 导出结果接口
 * @description 导出操作的结果
 */
export interface ProductExportResult {
  /** 操作是否成功 */
  success: boolean;
  /** 结果消息 */
  message?: string;
  /** 下载URL */
  downloadUrl?: string;
  /** 文件名 */
  filename?: string;
}

/**
 * 产品响应接口
 * @description API返回的产品列表响应
 */
export interface ProductsResponse {
  /** 产品列表 */
  items: Product[];
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