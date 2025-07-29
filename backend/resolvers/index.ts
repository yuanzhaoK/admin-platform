import { pocketbaseClient } from '../config/pocketbase.ts';
import { scalars } from '../scalars/index.ts';
import type { Product } from '../types/index.ts';
import { subscriptionResolvers } from './subscriptions.ts';

// 管理后台 Resolvers
import { adminResolvers } from './admin/index.ts';

// 移动端 Resolvers  
import { mobileResolvers } from './mobile/index.ts';

// 会员模块 Resolvers
import { memberModuleResolvers } from './member/index.ts';

// 合并所有resolvers
export const resolvers = {
  // 标量类型
  ...scalars,

  // 枚举解析器
  ProductStatus: {
    active: 'active',
    inactive: 'inactive',
    draft: 'draft',
  },

  ReviewStatus: {
    pending: 'pending',
    approved: 'approved',
    rejected: 'rejected',
  },

  UserRole: {
    admin: 'admin',
    user: 'user',
    moderator: 'moderator',
    guest: 'guest',
  },

  UserStatus: {
    active: 'active',
    inactive: 'inactive',
    suspended: 'suspended',
    pending: 'pending',
  },

  OrderStatus: {
    pending_payment: 'pending_payment',
    paid: 'paid',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    completed: 'completed',
    cancelled: 'cancelled',
    refunding: 'refunding',
    refunded: 'refunded',
  },

  SortOrder: {
    ASC: 'asc',
    DESC: 'desc',
  },

  // 会员模块枚举解析器
  ...memberModuleResolvers.Gender && { Gender: memberModuleResolvers.Gender },
  ...memberModuleResolvers.MembershipStatus && { MembershipStatus: memberModuleResolvers.MembershipStatus },
  ...memberModuleResolvers.PointsType && { PointsType: memberModuleResolvers.PointsType },
  ...memberModuleResolvers.ExchangeType && { ExchangeType: memberModuleResolvers.ExchangeType },
  ...memberModuleResolvers.ExchangeStatus && { ExchangeStatus: memberModuleResolvers.ExchangeStatus },
  ...memberModuleResolvers.ExchangeRecordStatus && { ExchangeRecordStatus: memberModuleResolvers.ExchangeRecordStatus },
  ...memberModuleResolvers.LoginType && { LoginType: memberModuleResolvers.LoginType },
  ...memberModuleResolvers.ThirdPartyPlatform && { ThirdPartyPlatform: memberModuleResolvers.ThirdPartyPlatform },
  ...memberModuleResolvers.VerificationStatus && { VerificationStatus: memberModuleResolvers.VerificationStatus },
  ...memberModuleResolvers.TagType && { TagType: memberModuleResolvers.TagType },
  ...memberModuleResolvers.NotificationType && { NotificationType: memberModuleResolvers.NotificationType },
  ...memberModuleResolvers.ProfileVisibility && { ProfileVisibility: memberModuleResolvers.ProfileVisibility },
  ...memberModuleResolvers.MemberRiskLevel && { MemberRiskLevel: memberModuleResolvers.MemberRiskLevel },
  ...memberModuleResolvers.IdentityVerificationType && { IdentityVerificationType: memberModuleResolvers.IdentityVerificationType },

  // 查询resolvers - 合并管理后台、移动端和会员模块
  Query: {
    ...adminResolvers.Query,
    ...mobileResolvers.Query,
    // ...memberModuleResolvers.Query,
  },

  // 变更resolvers - 合并管理后台、移动端和会员模块
  Mutation: {
    ...adminResolvers.Mutation,
    ...mobileResolvers.Mutation,
    // ...memberModuleResolvers.Mutation,
  },

  // 订阅resolvers
  Subscription: {
    ...subscriptionResolvers.Subscription,
  },

  // 类型解析器 - 从管理后台继承
  ...(adminResolvers.ProductCategory && { ProductCategory: adminResolvers.ProductCategory }),
  
  // 会员模块类型解析器
  ...memberModuleResolvers.Member && { Member: memberModuleResolvers.Member },
  ...memberModuleResolvers.MemberLevel && { MemberLevel: memberModuleResolvers.MemberLevel },
  ...memberModuleResolvers.PointsRecord && { PointsRecord: memberModuleResolvers.PointsRecord },
  ...memberModuleResolvers.Address && { Address: memberModuleResolvers.Address },
  ...memberModuleResolvers.MemberTag && { MemberTag: memberModuleResolvers.MemberTag },
  ...memberModuleResolvers.MemberTagRelation && { MemberTagRelation: memberModuleResolvers.MemberTagRelation },
  
  // Product 关联字段解析器
  Product: {
    category: async (product: Product) => {
      if (!product.category_id) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_categories').getOne(product.category_id);
      } catch (error) {
        console.error('Failed to fetch product category:', error);
        return null;
      }
    },
    
    brand: async (product: Product) => {
      if (!product.brand_id) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('brands').getOne(product.brand_id);
      } catch (error) {
        console.error('Failed to fetch product brand:', error);
        return null;
      }
    },
    
    product_type: async (product: Product) => {
      if (!product.product_type_id) return null;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('product_types').getOne(product.product_type_id);
      } catch (error) {
        console.error('Failed to fetch product type:', error);
        return null;
      }
    },
  },
};
