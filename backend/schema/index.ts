import { commonTypeDefs } from './modules/common.ts';
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
export const typeDefs = [
  commonTypeDefs,
  userTypeDefs,
  authTypeDefs,
  productTypeDefs,
  categoryTypeDefs,
  brandTypeDefs,
  productTypeTypeDefs,
  orderTypeDefs,
  refundTypeDefs,
  settingTypeDefs,
].join('\n'); 