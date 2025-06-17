// 移动端 Resolvers 模块
import { appResolvers } from './app.ts';

// 暂时只使用app resolvers，避免冲突
export const mobileResolvers = {
  Query: {
    ...appResolvers.Query,
  },
  
  Mutation: {
    ...appResolvers.Mutation,
  },
};

// 单独导出app模块
export { appResolvers }; 