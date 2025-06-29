import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// GraphQL 服务器端点 - 更新为外部服务器
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "http://localhost:8082/graphql";

// 创建HTTP链接
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// 创建认证链接
const authLink = setContext((_, { headers }) => {
  // 从localStorage或其他地方获取token（如果需要）
  // const token = localStorage.getItem('token');

  return {
    headers: {
      ...headers,
      // authorization: token ? `Bearer ${token}` : "",
      // 移除 X-Request-Source 头以避免CORS问题
    },
  };
});

// 创建 Apollo Client 实例
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Product: {
        keyFields: ["id"],
      },
      ProductCategory: {
        keyFields: ["id"],
      },
      Query: {
        fields: {
          products: {
            // 合并分页结果
            keyArgs: ["query"],
            merge(existing = { items: [], pagination: {} }, incoming) {
              return {
                ...incoming,
                items: [...existing.items, ...incoming.items],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-first", // 改为cache-first以提高性能
    },
    query: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

// 导出类型定义
export type { ApolloClient } from "@apollo/client";

// 导出工具函数
export const clearCache = () => {
  apolloClient.cache.reset();
};

// GraphQL错误处理工具
export const handleGraphQLError = (error: unknown) => {
  console.error("GraphQL Error:", error);

  const errorObj = error as {
    networkError?: { message?: string };
    graphQLErrors?: Array<{ message?: string }>;
  };

  if (errorObj.networkError) {
    console.error("Network Error:", errorObj.networkError);
    return {
      success: false,
      error: "网络连接失败，请检查服务器状态",
    };
  }

  if (errorObj.graphQLErrors && errorObj.graphQLErrors.length > 0) {
    console.error("GraphQL Errors:", errorObj.graphQLErrors);
    return {
      success: false,
      error: errorObj.graphQLErrors[0].message || "GraphQL查询失败",
    };
  }

  return {
    success: false,
    error: "未知错误",
  };
};
