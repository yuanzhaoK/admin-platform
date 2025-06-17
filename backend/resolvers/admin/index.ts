// 管理后台 Resolvers 模块
import { rootResolvers } from './root.ts';
import { productResolvers } from './product.ts';
import { categoryResolvers } from './category.ts';
import { brandResolvers } from './brand.ts';
import { productTypeResolvers } from './product-type.ts';
import { orderResolvers } from './order.ts';
import { refundResolvers } from './refund.ts';
import { settingResolvers } from './setting.ts';
import { userResolvers } from './user.ts';

// 手动合并所有管理后台 resolvers
export const adminResolvers = {
  Query: {
    ...rootResolvers.Query,
    ...productResolvers.Query,
    ...categoryResolvers.Query,
    ...brandResolvers.Query,
    ...productTypeResolvers.Query,
    ...orderResolvers.Query,
    ...refundResolvers.Query,
    ...settingResolvers.Query,
    ...userResolvers.Query,
  },
  
  Mutation: {
    ...productResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...brandResolvers.Mutation,
    ...productTypeResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...refundResolvers.Mutation,
    ...settingResolvers.Mutation,
    ...userResolvers.Mutation,
  },
  
  // 类型解析器
  ProductCategory: categoryResolvers.ProductCategory,
}; 