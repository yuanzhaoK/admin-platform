export const productTypeDefs = `
  # 产品类型 - 完全匹配 PocketBase 产品结构
  type Product {
    id: String!
    name: String!
    description: String
    price: Float
    category: String
    status: ProductStatus!
    tags: [String!]
    config: JSON
    sku: String
    stock: Int
    weight: Float
    dimensions: ProductDimensions
    images: [String!]
    meta_data: JSON
    created: String!
    updated: String!
  }

  type ProductDimensions {
    length: Float
    width: Float
    height: Float
  }

  enum ProductStatus {
    active
    inactive
    draft
  }

  type ProductsResponse {
    items: [Product!]!
    pagination: PaginationInfo!
  }

  # 统计类型
  type ProductStats {
    total: Int!
    active: Int!
    inactive: Int!
    draft: Int!
    categories: JSON!
    avgPrice: Float
    totalStock: Int
  }

  # 批量操作结果
  type BatchOperationResult {
    success: Boolean!
    message: String
    successCount: Int!
    failureCount: Int!
    errors: [String!]
  }

  # 产品分类
  type ProductCategory {
    name: String!
    count: Int!
    description: String
  }

  # 库存操作结果
  type StockOperationResult {
    success: Boolean!
    message: String
    product: Product
    previousStock: Int
    newStock: Int
  }

  # 导出结果
  type ExportResult {
    success: Boolean!
    message: String
    downloadUrl: String
    filename: String
  }

  # 输入类型
  input ProductQueryInput {
    page: Int
    perPage: Int
    status: ProductStatus
    category: String
    search: String
    sortBy: String
    sortOrder: SortOrder
    priceMin: Float
    priceMax: Float
    stockMin: Int
    stockMax: Int
    tags: [String!]
  }

  input ProductInput {
    name: String!
    description: String
    price: Float
    category: String
    status: ProductStatus!
    tags: [String!]
    sku: String
    stock: Int
    weight: Float
    images: [String!]
    dimensions: ProductDimensionsInput
    meta_data: JSON
  }

  input ProductUpdateInput {
    name: String
    description: String
    price: Float
    category: String
    status: ProductStatus
    tags: [String!]
    sku: String
    stock: Int
    weight: Float
    images: [String!]
    dimensions: ProductDimensionsInput
    meta_data: JSON
  }

  input ProductDimensionsInput {
    length: Float
    width: Float
    height: Float
  }

  # 批量操作输入
  input BatchStatusUpdateInput {
    productIds: [String!]!
    status: ProductStatus!
  }

  input BatchDeleteInput {
    productIds: [String!]!
  }

  input BatchPriceUpdateInput {
    productIds: [String!]!
    price: Float!
    updateType: PriceUpdateType!
  }

  enum PriceUpdateType {
    SET
    INCREASE
    DECREASE
    PERCENTAGE_INCREASE
    PERCENTAGE_DECREASE
  }

  # 库存操作输入
  input StockUpdateInput {
    productId: String!
    quantity: Int!
    operation: StockOperation!
    reason: String
  }

  enum StockOperation {
    SET
    ADD
    SUBTRACT
  }

  # 导出输入
  input ExportInput {
    format: ExportFormat!
    productIds: [String!]
    includeImages: Boolean
    filters: ProductQueryInput
  }

  enum ExportFormat {
    JSON
    CSV
    EXCEL
  }

  # 分类管理输入
  input CategoryInput {
    name: String!
    description: String
  }

  extend type Query {
    # 产品查询
    products(query: ProductQueryInput): ProductsResponse!
    product(id: String!): Product
    productStats: ProductStats!
    
    # 分类管理
    productCategories: [ProductCategory!]!
    productsByCategory(category: String!): [Product!]!
    
    # 库存查询
    lowStockProducts(threshold: Int): [Product!]!
    outOfStockProducts: [Product!]!
    
    # 搜索建议
    productSearchSuggestions(query: String!): [String!]!
    
    # 相关产品
    relatedProducts(productId: String!, limit: Int): [Product!]!
  }

  extend type Mutation {
    # 基础产品操作
    createProduct(input: ProductInput!): Product!
    updateProduct(id: String!, input: ProductUpdateInput!): Product!
    deleteProduct(id: String!): Boolean!
    duplicateProduct(id: String!): Product!
    
    # 批量操作
    batchUpdateProductStatus(input: BatchStatusUpdateInput!): BatchOperationResult!
    batchDeleteProducts(input: BatchDeleteInput!): BatchOperationResult!
    batchUpdateProductPrices(input: BatchPriceUpdateInput!): BatchOperationResult!
    
    # 库存管理
    updateProductStock(input: StockUpdateInput!): StockOperationResult!
    batchUpdateStock(inputs: [StockUpdateInput!]!): [StockOperationResult!]!
    
    # 分类管理
    createProductCategory(input: CategoryInput!): ProductCategory!
    updateProductCategory(name: String!, input: CategoryInput!): ProductCategory!
    deleteProductCategory(name: String!): Boolean!
    
    # 导出功能
    exportProducts(input: ExportInput!): ExportResult!
    
    # 图片管理
    uploadProductImage(productId: String!, imageData: String!): String!
    deleteProductImage(productId: String!, imageUrl: String!): Boolean!
    reorderProductImages(productId: String!, imageUrls: [String!]!): Product!
  }
`; 