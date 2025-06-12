export const rootTypeDefs = `
  # 根查询类型
  type Query {
    # 健康检查
    health: String!
  }

  # 根变更类型
  type Mutation {
    _empty: String
  }
`; 