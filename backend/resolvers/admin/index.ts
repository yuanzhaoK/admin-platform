// 管理后台 Resolvers 模块
import { brandResolvers } from './brand.ts';
import { categoryResolvers } from './category.ts';
import { orderResolvers } from './order.ts';
import { productTypeResolvers } from './product-type.ts';
import { productResolvers } from './product.ts';
import { refundResolvers } from './refund.ts';
import { rootResolvers } from './root.ts';
import { settingResolvers } from './setting.ts';
import { userResolvers } from './user.ts';
// 营销管理模块 resolvers
import { advertisementResolvers } from './advertisement.ts';
import { couponResolvers } from './coupon.ts';
// import { memberResolvers } from './member.ts';
// import { pointsResolvers } from './points.ts';
import { recommendationResolvers } from './recommendation.ts';
import { trendingResolvers } from './trending.ts';

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
    // 营销管理模块查询
    // ...memberResolvers.Query,
    ...couponResolvers.Query,
    // ...pointsResolvers.Query,
    ...recommendationResolvers.Query,
    ...advertisementResolvers.Query,
    ...trendingResolvers.Query,
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
    // 营销管理模块变更
    // ...memberResolvers.Mutation,
    ...couponResolvers.Mutation,
    // ...pointsResolvers.Mutation,
    ...recommendationResolvers.Mutation,
    ...advertisementResolvers.Mutation,
    ...trendingResolvers.Mutation,
  },
  
  // 类型解析器
  ProductCategory: categoryResolvers.ProductCategory,
}; 