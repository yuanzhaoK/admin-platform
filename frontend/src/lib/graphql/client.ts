import { ApolloClient, InMemoryCache } from '@apollo/client';

// GraphQL 服务器端点
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8082/graphql';

// 创建 Apollo Client 实例
export const apolloClient = new ApolloClient({
  uri: GRAPHQL_ENDPOINT,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    },
    query: {
      errorPolicy: 'all', 
      fetchPolicy: 'no-cache',
    },
  },
});

// 导出类型定义
export type { ApolloClient } from '@apollo/client'; 