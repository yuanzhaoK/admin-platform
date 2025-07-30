// 移动端解析器索引
import { appResolvers } from './app.ts';
import { homeResolvers } from './home.ts';
import { mobileMemberResolvers } from './member.ts';
// import { mobileMemberResolvers } from './member.ts';

// 移动端解析器合并
export const mobileResolvers = {
  Query: {
    // ...mobileMemberResolvers.Query,
    ...appResolvers.Query,
    ...homeResolvers.Query,
    ...mobileMemberResolvers.Query,
  },
  Mutation: {
    // ...mobileMemberResolvers.Mutation,
    ...appResolvers.Mutation,
    ...mobileMemberResolvers.Mutation,
  },
  Subscription: {
    ...appResolvers.Subscription,
  },
};
