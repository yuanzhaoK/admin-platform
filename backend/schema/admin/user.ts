export const userTypeDefs = `
  # 用户类型 - 完全匹配 PocketBase 用户结构
  type User {
    id: String!
    email: String!
    name: String
    avatar: String
    role: String
    created: String!
    updated: String!
    collectionId: String
    collectionName: String
    emailVisibility: Boolean
    verified: Boolean
  }



  extend type Query {
    # 用户查询
    users: [User!]!
    user(id: String!): User
  }


`; 