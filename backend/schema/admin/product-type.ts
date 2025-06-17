export const productTypeTypeDefs = `
  # 商品类型
  type ProductType {
    id: String!
    name: String!
    description: String
    attributes: [ProductTypeAttribute!]
    status: ProductTypeStatus!
    created: String!
    updated: String!
  }

  type ProductTypeAttribute {
    name: String!
    type: AttributeType!
    required: Boolean!
    options: [String!]
  }

  enum ProductTypeStatus {
    active
    inactive
  }

  enum AttributeType {
    text
    number
    select
    multiselect
    boolean
    date
    color
    image
  }

  # 分页响应类型
  type ProductTypesResponse {
    items: [ProductType!]!
    pagination: PaginationInfo!
  }

  # 输入类型
  input ProductTypeQueryInput {
    page: Int
    perPage: Int
    status: ProductTypeStatus
    search: String
    sortBy: String
    sortOrder: SortOrder
  }

  input ProductTypeInput {
    name: String!
    description: String
    attributes: [ProductTypeAttributeInput!]
    status: ProductTypeStatus!
  }

  input ProductTypeUpdateInput {
    name: String
    description: String
    attributes: [ProductTypeAttributeInput!]
    status: ProductTypeStatus
  }

  input ProductTypeAttributeInput {
    name: String!
    type: AttributeType!
    required: Boolean!
    options: [String!]
  }

  extend type Query {
    # 商品类型查询
    productTypes(query: ProductTypeQueryInput): ProductTypesResponse!
    productType(id: String!): ProductType
  }

  extend type Mutation {
    # 商品类型变更
    createProductType(input: ProductTypeInput!): ProductType!
    updateProductType(id: String!, input: ProductTypeUpdateInput!): ProductType!
    deleteProductType(id: String!): Boolean!
  }
`; 