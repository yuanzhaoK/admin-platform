import { gql } from '@apollo/client';

// 认证相关的查询和变更
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      record {
        id
        email
        name
        avatar
        role
        created
        updated
        collectionId
        collectionName
        emailVisibility
        verified
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

// 用户查询
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      avatar
      role
      created
      updated
      collectionId
      collectionName
      emailVisibility
      verified
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
      id
      email
      name
      avatar
      role
      created
      updated
      collectionId
      collectionName
      emailVisibility
      verified
    }
  }
`;

// 健康检查
export const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`;

// ==================== 产品管理 GraphQL 查询和变更 ====================

// 产品查询
export const GET_PRODUCTS = gql`
  query GetProducts($query: ProductQueryInput) {
    products(query: $query) {
      items {
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
      description
      price
      category
      status
      tags
      config
      sku
      stock
      weight
      dimensions {
        length
        width
        height
      }
      images
      meta_data
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
    }
  }
`;

// 分类管理查询
export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories {
    productCategories {
      name
      count
      description
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = gql`
  query GetProductsByCategory($category: String!) {
    productsByCategory(category: $category) {
      id
      name
      description
      price
      status
      sku
      stock
      images
      created
      updated
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

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: String!, $input: ProductUpdateInput!) {
    updateProduct(id: $id, input: $input) {
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
  mutation BatchUpdateProductStatus($input: BatchStatusUpdateInput!) {
    batchUpdateProductStatus(input: $input) {
      success
      message
      successCount
      failureCount
      errors
    }
  }
`;

export const BATCH_DELETE_PRODUCTS = gql`
  mutation BatchDeleteProducts($input: BatchDeleteInput!) {
    batchDeleteProducts(input: $input) {
      success
      message
      successCount
      failureCount
      errors
    }
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

// 分类管理
export const CREATE_PRODUCT_CATEGORY = gql`
  mutation CreateProductCategory($input: CategoryInput!) {
    createProductCategory(input: $input) {
      name
      count
      description
    }
  }
`;

export const UPDATE_PRODUCT_CATEGORY = gql`
  mutation UpdateProductCategory($name: String!, $input: CategoryInput!) {
    updateProductCategory(name: $name, input: $input) {
      name
      count
      description
    }
  }
`;

export const DELETE_PRODUCT_CATEGORY = gql`
  mutation DeleteProductCategory($name: String!) {
    deleteProductCategory(name: $name)
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