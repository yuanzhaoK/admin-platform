export const commonTypeDefs = `
  # JSON 标量类型
  scalar JSON

  # 分页响应类型
  type PaginationInfo {
    page: Int!
    perPage: Int!
    totalPages: Int!
    totalItems: Int!
  }

  # 排序枚举
  enum SortOrder {
    asc
    desc
  }

  # 查询根类型
  type Query {
    # 健康检查
    health: String!
  }

  # 变更根类型
  type Mutation {
    # 占位符
    _empty: String
  }
`; 