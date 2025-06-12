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

  # 输入类型
  input ProductQueryInput {
    page: Int
    perPage: Int
    status: ProductStatus
    category: String
    search: String
    sortBy: String
    sortOrder: SortOrder
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
  }

  extend type Query {
    # 产品查询
    products(query: ProductQueryInput): ProductsResponse!
    product(id: String!): Product
    productStats: ProductStats!
  }

  extend type Mutation {
    # 产品变更
    createProduct(input: ProductInput!): Product!
    updateProduct(id: String!, input: ProductUpdateInput!): Product!
    deleteProduct(id: String!): Boolean!
  }
`; 