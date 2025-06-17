export const brandTypeDefs = `
  # 品牌类型
  type Brand {
    id: String!
    name: String!
    description: String
    logo: String
    website: String
    sort_order: Int
    status: BrandStatus!
    created: String!
    updated: String!
  }

  enum BrandStatus {
    active
    inactive
  }

  # 分页响应类型
  type BrandsResponse {
    items: [Brand!]!
    pagination: PaginationInfo!
  }

  # 输入类型
  input BrandQueryInput {
    page: Int
    perPage: Int
    status: BrandStatus
    search: String
    sortBy: String
    sortOrder: SortOrder
  }

  input BrandInput {
    name: String!
    description: String
    logo: String
    website: String
    sort_order: Int
    status: BrandStatus!
  }

  input BrandUpdateInput {
    name: String
    description: String
    logo: String
    website: String
    sort_order: Int
    status: BrandStatus
  }

  extend type Query {
    # 品牌查询
    brands(query: BrandQueryInput): BrandsResponse!
    brand(id: String!): Brand
  }

  extend type Mutation {
    # 品牌变更
    createBrand(input: BrandInput!): Brand!
    updateBrand(id: String!, input: BrandUpdateInput!): Brand!
    deleteBrand(id: String!): Boolean!
  }
`; 