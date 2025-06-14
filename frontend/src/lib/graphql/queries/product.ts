import { gql } from '@apollo/client';

// ==================== 类型定义 ====================

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  price?: number;
  market_price?: number;
  cost_price?: number;
  category_id?: string;
  brand_id?: string;
  product_type_id?: string;
  category?: {
    id: string;
    name: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  product_type?: {
    id: string;
    name: string;
    attributes?: Array<{
      name: string;
      type: string;
      required: boolean;
      options?: string[];
    }>;
  };
  status: 'active' | 'inactive' | 'draft';
  review_status: 'pending' | 'approved' | 'rejected';
  tags?: string[];
  config?: Record<string, unknown>;
  sku?: string;
  stock?: number;
  unit?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images?: string[];
  meta_data?: Record<string, unknown>;
  sort_order?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  is_published?: boolean;
  is_recommended?: boolean;
  points?: number;
  growth_value?: number;
  points_purchase_limit?: number;
  preview_enabled?: boolean;
  service_guarantee?: string[];
  sales_count?: number;
  view_count?: number;
  attributes?: Record<string, unknown>;
  created: string;
  updated: string;
}

export interface ProductQuery {
  page?: number;
  perPage?: number;
  status?: 'active' | 'inactive' | 'draft';
  category_id?: string;
  brand_id?: string;
  product_type_id?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  priceMin?: number;
  priceMax?: number;
  stockMin?: number;
  stockMax?: number;
  tags?: string[];
  is_featured?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  is_published?: boolean;
  review_status?: 'pending' | 'approved' | 'rejected';
}

export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  categories: Record<string, number>;
  avgPrice?: number;
  totalStock?: number;
  lowStock: number;
  outOfStock: number;
  brands: Record<string, number>;
  productTypes: Record<string, number>;
}

export interface ProductCategory {
  name: string;
  count: number;
  description?: string;
}

export interface BatchOperationResult {
  success: boolean;
  message?: string;
  successCount: number;
  failureCount: number;
  errors?: string[];
}

export interface StockOperationResult {
  success: boolean;
  message?: string;
  product?: Product;
  previousStock?: number;
  newStock?: number;
}

export interface ExportResult {
  success: boolean;
  message?: string;
  downloadUrl?: string;
  filename?: string;
}

export interface ProductInput {
  name: string;
  subtitle?: string;
  description?: string;
  price?: number;
  market_price?: number;
  cost_price?: number;
  category_id?: string;
  brand_id?: string;
  product_type_id?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  sku?: string;
  stock?: number;
  unit?: string;
  weight?: number;
  images?: string[];
  sort_order?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  points?: number;
  growth_value?: number;
  points_purchase_limit?: number;
  preview_enabled?: boolean;
  is_published?: boolean;
  is_recommended?: boolean;
  service_guarantee?: string[];
  attributes?: Record<string, unknown>;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  meta_data?: Record<string, unknown>;
}

export interface ProductUpdateInput {
  name?: string;
  subtitle?: string;
  description?: string;
  price?: number;
  market_price?: number;
  cost_price?: number;
  category_id?: string;
  brand_id?: string;
  product_type_id?: string;
  status?: 'active' | 'inactive' | 'draft';
  tags?: string[];
  sku?: string;
  stock?: number;
  unit?: string;
  weight?: number;
  images?: string[];
  sort_order?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  points?: number;
  growth_value?: number;
  points_purchase_limit?: number;
  preview_enabled?: boolean;
  is_published?: boolean;
  is_recommended?: boolean;
  service_guarantee?: string[];
  attributes?: Record<string, unknown>;
  review_status?: 'pending' | 'approved' | 'rejected';
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  meta_data?: Record<string, unknown>;
}

// ==================== 产品管理 GraphQL 查询和变更 ====================

// 产品查询
export const GET_PRODUCTS = gql`
  query GetProducts($query: ProductQueryInput) {
    products(query: $query) {
      items {
        id
        name
        subtitle
        description
        price
        market_price
        cost_price
        sku
        stock
        unit
        weight
        images
        status
        review_status
        is_featured
        is_new
        is_hot
        is_published
        is_recommended
        tags
        sales_count
        view_count
        sort_order
        points
        growth_value
        service_guarantee
        category {
          id
          name
        }
        brand {
          id
          name
        }
        product_type {
          id
          name
        }
        created
        updated
      }
      pagination {
        page
        perPage
        totalPages
        totalItems
      }
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: String!) {
    product(id: $id) {
      id
      name
      subtitle
      description
      price
      market_price
      cost_price
      category_id
      brand_id
      product_type_id
      sku
      stock
      unit
      weight
      images
      status
      review_status
      is_featured
      is_new
      is_hot
      is_published
      is_recommended
      tags
      sales_count
      view_count
      sort_order
      points
      growth_value
      points_purchase_limit
      preview_enabled
      service_guarantee
      attributes
      category {
        id
        name
      }
      brand {
        id
        name
      }
      product_type {
        id
        name
        attributes {
          name
          type
          required
          options
        }
      }
      created
      updated
    }
  }
`;

export const GET_PRODUCT_STATS = gql`
  query GetProductStats {
    productStats {
      total
      active
      inactive
      draft
      categories
      avgPrice
      totalStock
      lowStock
      outOfStock
      brands
      productTypes
    }
  }
`;

// 库存查询
export const GET_LOW_STOCK_PRODUCTS = gql`
  query GetLowStockProducts($threshold: Int) {
    lowStockProducts(threshold: $threshold) {
      id
      name
      sku
      stock
      status
      category
    }
  }
`;

export const GET_OUT_OF_STOCK_PRODUCTS = gql`
  query GetOutOfStockProducts {
    outOfStockProducts {
      id
      name
      sku
      stock
      status
      category
    }
  }
`;

// 搜索建议
export const GET_PRODUCT_SEARCH_SUGGESTIONS = gql`
  query GetProductSearchSuggestions($query: String!) {
    productSearchSuggestions(query: $query)
  }
`;

// 相关产品
export const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($productId: String!, $limit: Int) {
    relatedProducts(productId: $productId, limit: $limit) {
      id
      name
      description
      price
      category
      status
      images
      created
    }
  }
`;

// ==================== 产品变更操作 ====================

// 基础产品操作
export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      name
      status
      created
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
      id
      name
      status
      updated
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: String!) {
    deleteProduct(id: $id)
  }
`;

export const DUPLICATE_PRODUCT = gql`
  mutation DuplicateProduct($id: String!) {
    duplicateProduct(id: $id) {
      id
      name
      description
      price
      category
      status
      tags
      sku
      stock
      weight
      images
      created
      updated
    }
  }
`;

// 批量操作
export const BATCH_UPDATE_PRODUCT_STATUS = gql`
  mutation BatchUpdateProductStatus($ids: [String!]!, $status: ProductStatus!) {
    batchUpdateProductStatus(ids: $ids, status: $status)
  }
`;

export const BATCH_DELETE_PRODUCTS = gql`
  mutation BatchDeleteProducts($ids: [String!]!) {
    batchDeleteProducts(ids: $ids)
  }
`;

export const BATCH_UPDATE_PRODUCT_PRICES = gql`
  mutation BatchUpdateProductPrices($input: BatchPriceUpdateInput!) {
    batchUpdateProductPrices(input: $input) {
      success
      message
      successCount
      failureCount
      errors
    }
  }
`;

// 库存管理
export const UPDATE_PRODUCT_STOCK = gql`
  mutation UpdateProductStock($input: StockUpdateInput!) {
    updateProductStock(input: $input) {
      success
      message
      product {
        id
        name
        stock
      }
      previousStock
      newStock
    }
  }
`;

export const BATCH_UPDATE_STOCK = gql`
  mutation BatchUpdateStock($inputs: [StockUpdateInput!]!) {
    batchUpdateStock(inputs: $inputs) {
      success
      message
      product {
        id
        name
        stock
      }
      previousStock
      newStock
    }
  }
`;

// 导出功能
export const EXPORT_PRODUCTS = gql`
  mutation ExportProducts($input: ExportInput!) {
    exportProducts(input: $input) {
      success
      message
      downloadUrl
      filename
    }
  }
`;

// 图片管理
export const UPLOAD_PRODUCT_IMAGE = gql`
  mutation UploadProductImage($productId: String!, $imageData: String!) {
    uploadProductImage(productId: $productId, imageData: $imageData)
  }
`;

export const DELETE_PRODUCT_IMAGE = gql`
  mutation DeleteProductImage($productId: String!, $imageUrl: String!) {
    deleteProductImage(productId: $productId, imageUrl: $imageUrl)
  }
`;

export const REORDER_PRODUCT_IMAGES = gql`
  mutation ReorderProductImages($productId: String!, $imageUrls: [String!]!) {
    reorderProductImages(productId: $productId, imageUrls: $imageUrls) {
      id
      images
    }
  }
`;

// 按分类查询产品（使用通用产品查询）
export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($categoryId: String!, $page: Int, $perPage: Int) {
    products(query: { category_id: $categoryId, page: $page, perPage: $perPage }) {
      items {
        id
        name
        subtitle
        description
        price
        market_price
        cost_price
        sku
        stock
        status
        review_status
        is_featured
        is_new
        is_hot
        is_published
        images
        tags
        created
        updated
      }
      pagination {
        page
        perPage
        totalPages
        totalItems
      }
    }
  }
`; 