export const baseTypeDefs = `
  # 自定义标量类型
  scalar JSON

  # 基础Query和Mutation类型
  type Query {
    _: Boolean
    health: String!
  }

  type Mutation {
    _: Boolean
  }

  # 排序枚举
  enum SortOrder {
    ASC
    DESC
  }

  # 分页信息类型
  type PaginationInfo {
    page: Int!
    perPage: Int!
    total: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }
`; 