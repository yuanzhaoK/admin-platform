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
  OrderStats,
  ProductCategory,
  Brand,
  ProductType
} from '../types/index.ts';
import { scalars } from '../scalars/index.ts';
import { rootResolvers } from './modules/root.ts';
import { userResolvers } from './modules/user.ts';
import { productResolvers } from './modules/product.ts';
import { orderResolvers } from './modules/order.ts';
import { refundResolvers } from './modules/refund.ts';
import { settingResolvers } from './modules/setting.ts';
import { categoryResolvers } from './modules/category.ts';
import { brandResolvers } from './modules/brand.ts';
import { productTypeResolvers } from './modules/product-type.ts';
import { globalSearchResolvers } from './modules/global-search.ts';

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
    ...categoryResolvers.Query,
    ...brandResolvers.Query,
    ...productTypeResolvers.Query,
    ...globalSearchResolvers.Query,
  },

  // 变更resolvers
  Mutation: {
    ...userResolvers.Mutation,
    ...productResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...refundResolvers.Mutation,
    ...settingResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...brandResolvers.Mutation,
    ...productTypeResolvers.Mutation,
  },

  // 类型解析器
  ProductCategory: categoryResolvers.ProductCategory,
  
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