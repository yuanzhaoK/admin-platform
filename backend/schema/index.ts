/**
 * 现代化 GraphQL Schema 入口文件
 * 使用标准 .graphql 文件和加载器
 */

// 导出新的 schema 加载器（主要接口）
export {
  buildGraphQLSchema, getTypeDefs, loadSchema, typeDefs, validateSchema
} from './loader.ts';

// 向后兼容：保留旧的导入
import {
  brandTypeDefs,
  categoryTypeDefs,
  orderTypeDefs,
  productTypeDefs,
  productTypeTypeDefs,
  refundTypeDefs,
  settingTypeDefs,
  userTypeDefs,
} from './admin/index.ts';
import { baseTypeDefs } from './base-types.ts';
import { authTypeDefs, commonTypeDefs } from './common/index.ts';
import { appTypeDefs } from './mobile/index.ts';

// 向后兼容：旧的 typeDefs 导出
export const legacyTypeDefs = [
  baseTypeDefs,
  commonTypeDefs,
  authTypeDefs,
  userTypeDefs,
  productTypeDefs,
  categoryTypeDefs,
  brandTypeDefs,
  productTypeTypeDefs,
  orderTypeDefs,
  refundTypeDefs,
  settingTypeDefs,
  appTypeDefs,
].join('\n');

// 默认导出基础类型定义（兼容性）
export { baseTypeDefs };

