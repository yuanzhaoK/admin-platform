export const categoryTypeDefs = `
  # 商品分类类型
  type ProductCategory {
    id: String!
    name: String!
    description: String
    parent_id: String
    parent: ProductCategory
    children: [ProductCategory!]
    sort_order: Int
    status: CategoryStatus!
    image: String
    icon: String
    seo_title: String
    seo_description: String
    created: String!
    updated: String!
  }

  enum CategoryStatus {
    active
    inactive
  }

  # 分页响应类型
  type ProductCategoriesResponse {
    items: [ProductCategory!]!
    pagination: PaginationInfo!
  }

  # 输入类型
  input ProductCategoryQueryInput {
    page: Int
    perPage: Int
    status: CategoryStatus
    parent_id: String
    search: String
    sortBy: String
    sortOrder: SortOrder
  }

  input ProductCategoryInput {
    name: String!
    description: String
    parent_id: String
    sort_order: Int
    status: CategoryStatus!
    image: String
    icon: String
    seo_title: String
    seo_description: String
  }

  input ProductCategoryUpdateInput {
    name: String
    description: String
    parent_id: String
    sort_order: Int
    status: CategoryStatus
    image: String
    icon: String
    seo_title: String
    seo_description: String
  }

  extend type Query {
    # 产品分类查询
    productCategories(query: ProductCategoryQueryInput): ProductCategoriesResponse!
    productCategory(id: String!): ProductCategory
    productCategoryTree: [ProductCategory!]!
  }

  extend type Mutation {
    # 产品分类变更
    createProductCategory(input: ProductCategoryInput!): ProductCategory!
    updateProductCategory(id: String!, input: ProductCategoryUpdateInput!): ProductCategory!
    deleteProductCategory(id: String!): Boolean!
  }
`; 