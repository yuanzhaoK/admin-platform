import { userTypeDefs } from './modules/user.ts';
import { authTypeDefs } from './modules/auth.ts';
import { productTypeDefs } from './modules/product.ts';
import { categoryTypeDefs } from './modules/category.ts';
import { brandTypeDefs } from './modules/brand.ts';
import { productTypeTypeDefs } from './modules/product-type.ts';
import { orderTypeDefs } from './modules/order.ts';
import { refundTypeDefs } from './modules/refund.ts';
import { settingTypeDefs } from './modules/setting.ts';

// 合并所有模块的 typeDefs
export const typeDefs = `
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

  # 搜索结果类型枚举
  enum SearchResultType {
    PRODUCT
    CATEGORY
    BRAND
    PRODUCT_TYPE
    ORDER
    USER
    PAGE
  }

  # 搜索结果项
  type SearchResultItem {
    id: ID!
    type: SearchResultType!
    title: String!
    description: String
    subtitle: String
    url: String!
    icon: String
    metadata: JSON
    score: Float
  }

  # 分组的搜索结果
  type GroupedSearchResults {
    type: SearchResultType!
    title: String!
    icon: String!
    items: [SearchResultItem!]!
    total: Int!
  }

  # 全局搜索结果
  type GlobalSearchResults {
    query: String!
    total: Int!
    groups: [GroupedSearchResults!]!
    suggestions: [String!]!
    executionTime: Float!
  }



  # 查询根类型
  type Query {
    # 健康检查
    health: String!
    
    # 全局搜索
    globalSearch(
      query: String!
      limit: Int = 20
      types: [SearchResultType!]
    ): GlobalSearchResults!
  }

  # 变更根类型
  type Mutation {
    # 占位符
    _empty: String
  }

  ${userTypeDefs}
  ${authTypeDefs}
  ${productTypeDefs}
  ${categoryTypeDefs}
  ${brandTypeDefs}
  ${productTypeTypeDefs}
  ${orderTypeDefs}
  ${refundTypeDefs}
  ${settingTypeDefs}
`; 