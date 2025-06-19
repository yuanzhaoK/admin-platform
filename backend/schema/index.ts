// 基础类型定义
import { baseTypeDefs } from './base-types.ts';

// 管理后台 Schema 模块
import {
  productTypeDefs,
  categoryTypeDefs,
  brandTypeDefs,
  productTypeTypeDefs,
  orderTypeDefs,
  refundTypeDefs,
  settingTypeDefs,
  userTypeDefs,
} from './admin/index.ts';

// 移动端 Schema 模块
import {
  appTypeDefs,
} from './mobile/index.ts';
import { commonTypeDefs, authTypeDefs } from './common/index.ts';


// 合并所有模块的 typeDefs
export const typeDefs = [
  // 基础类型定义（必须放在最前面）
  baseTypeDefs,

  // 公共模块
  commonTypeDefs,
  authTypeDefs,

  // 管理后台模块
  userTypeDefs,
  productTypeDefs,
  categoryTypeDefs,
  brandTypeDefs,
  productTypeTypeDefs,
  orderTypeDefs,
  refundTypeDefs,
  settingTypeDefs,

  // 移动端模块
  appTypeDefs,
].join('\n'); 
