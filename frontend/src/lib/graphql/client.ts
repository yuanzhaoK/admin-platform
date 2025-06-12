import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// GraphQL 服务器端点
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8082/graphql';

// HTTP 链接
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// 认证链接 - 添加认证头
const authLink = setContext((_, { headers }) => {
  // 从 localStorage 获取 GraphQL token
  let token = '';
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('graphql-auth-token') || '';
  }
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    }
  };
});

// 创建 Apollo Client 实例
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // 配置分页查询的缓存策略
          orders: {
            keyArgs: ['query', ['status', 'payment_method', 'order_source', 'order_type', 'user_id', 'search', 'date_from', 'date_to', 'sortBy', 'sortOrder']],
            merge(existing, incoming) {
              return incoming;
            },
          },
          products: {
            keyArgs: ['query', ['status', 'category', 'search', 'sortBy', 'sortOrder']],
            merge(existing, incoming) {
              return incoming;
            },
          },
          refunds: {
            keyArgs: ['query', ['status', 'refund_type', 'reason', 'user_id', 'order_id', 'search', 'date_from', 'date_to', 'sortBy', 'sortOrder']],
            merge(existing, incoming) {
              return incoming;
            },
          },
          users: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// 导出类型定义
export type { ApolloClient } from '@apollo/client'; 