import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import type { DocumentNode } from "graphql";

// GraphQL 服务器端点 - 更新为外部服务器
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL ||
  "http://localhost:8082/graphql";

// 创建HTTP链接
const httpLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

// 创建认证链接
const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
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
        fields: {
          price: {
            read(value: number) {
              return value;
            },
          },
        },
      },
      ProductCategory: {
        keyFields: ["id"],
      },
      User: {
        keyFields: ["id"],
      },
      Order: {
        keyFields: ["id"],
      },
      Query: {
        fields: {
          products: {
            keyArgs: ["query"],
            merge(
              existing = { items: [], pagination: {} },
              incoming: { items: unknown[]; pagination: unknown },
            ) {
              return {
                ...incoming,
                items: [...(existing.items as unknown[]), ...incoming.items],
              };
            },
          },
          product: {
            read(existing: unknown, { args, toReference }) {
              return existing ||
                toReference({ __typename: "Product", id: args?.id as string });
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
      fetchPolicy: "cache-first",
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

// 性能优化工具
export const prefetchQuery = async (
  query: DocumentNode,
  variables?: Record<string, unknown>,
) => {
  try {
    await apolloClient.query({
      query,
      variables,
      fetchPolicy: "cache-first",
    });
  } catch (error) {
    console.error("Prefetch error:", error);
  }
};

// 批量查询优化
export const batchQuery = async (
  queries: Array<{ query: DocumentNode; variables?: Record<string, unknown> }>,
) => {
  return Promise.all(
    queries.map(({ query, variables }) =>
      apolloClient.query({ query, variables })
    ),
  );
};
