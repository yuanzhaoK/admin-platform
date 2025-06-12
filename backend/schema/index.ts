import { commonTypeDefs } from './modules/common.ts';
import { rootTypeDefs } from './modules/root.ts';
import { userTypeDefs } from './modules/user.ts';
import { productTypeDefs } from './modules/product.ts';
import { orderTypeDefs } from './modules/order.ts';
import { refundTypeDefs } from './modules/refund.ts';
import { settingTypeDefs } from './modules/setting.ts';

// 合并所有模块的 typeDefs
export const typeDefs = [
  commonTypeDefs,
  rootTypeDefs,
  userTypeDefs,
  productTypeDefs,
  orderTypeDefs,
  refundTypeDefs,
  settingTypeDefs,
].join('\n'); 