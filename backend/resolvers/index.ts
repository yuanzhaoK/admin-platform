import { pocketbaseClient } from '../config/pocketbase.ts';
import type { 
  Product, 
  Order, 
  RefundRequest, 
  OrderSetting, 
  User,
  ProductQuery,
  OrderQuery,
  RefundQuery,
  ProductStats,
  OrderStats
} from '../types/index.ts';
import { scalars } from '../scalars/index.ts';
import { rootResolvers } from './modules/root.ts';
import { userResolvers } from './modules/user.ts';
import { productResolvers } from './modules/product.ts';
import { orderResolvers } from './modules/order.ts';
import { refundResolvers } from './modules/refund.ts';
import { settingResolvers } from './modules/setting.ts';

// JSON 标量类型解析器
const JSONScalar = {
  serialize: (value: any) => value,
  parseValue: (value: any) => value,
  parseLiteral: (ast: any) => {
    if (ast.kind === 'StringValue') {
      return JSON.parse(ast.value);
    }
    return null;
  },
};

// 合并所有resolvers
export const resolvers = {
  // 标量类型
  ...scalars,

  // 查询resolvers
  Query: {
    ...rootResolvers.Query,
    ...userResolvers.Query,
    ...productResolvers.Query,
    ...orderResolvers.Query,
    ...refundResolvers.Query,
    ...settingResolvers.Query,
  },

  // 变更resolvers
  Mutation: {
    ...userResolvers.Mutation,
    ...productResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...refundResolvers.Mutation,
    ...settingResolvers.Mutation,
  },
}; 