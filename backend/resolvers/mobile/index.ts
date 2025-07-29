// 移动端解析器索引
import { appResolvers } from './app.ts';
// import { mobileMemberResolvers } from './member.ts';

// 移动端解析器合并
export const mobileResolvers = {
  Query: {
    // ...mobileMemberResolvers.Query,
    ...appResolvers.Query,
  },
  Mutation: {
    // ...mobileMemberResolvers.Mutation,
    ...appResolvers.Mutation,
  },
  Subscription: {
    ...appResolvers.Subscription,
  },
};
