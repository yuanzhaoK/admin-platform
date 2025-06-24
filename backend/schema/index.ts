/**
 * 现代化 GraphQL Schema 入口文件
 * 使用标准 .graphql 文件和加载器
 */

// 导出新的 schema 加载器（主要接口）
export {
  buildGraphQLSchema, getTypeDefs, loadSchema, typeDefs, validateSchema
} from './loader.ts';




