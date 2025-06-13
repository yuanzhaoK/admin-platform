import { gql } from '@apollo/client';

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