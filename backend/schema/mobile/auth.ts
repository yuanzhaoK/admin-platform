export const authTypeDefs = `
  # 认证类型
  type AuthResponse {
    token: String!
    record: User!
  }

  input LoginInput {
    identity: String!
    password: String!
  }

  extend type Mutation {
    # 认证变更
    login(input: LoginInput!): AuthResponse!
    logout: Boolean!
  }
`; 