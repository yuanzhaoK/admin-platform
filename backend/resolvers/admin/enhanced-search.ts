// 增强搜索 GraphQL Resolver
import { searchEngineService, SearchRequest } from '../../services/search-engine.ts';
import { searchSyncService } from '../../services/search-sync.ts';
import { logger } from '../../utils/logger.ts';

export const enhancedSearchResolvers = {
  Query: {
    // 增强的全局搜索
    enhancedGlobalSearch: async (_: any, args: {
      query: string;
      filters?: any;
      sort?: { field: string; order: 'asc' | 'desc' };
      pagination?: { page: number; size: number };
      types?: string[];
    }, context: any) => {
      const startTime = Date.now();
      
      try {
        // 构建搜索请求
        const searchRequest: SearchRequest = {
          query: args.query,
          filters: args.filters ? {
            priceRange: args.filters.priceRange,
            categories: args.filters.categories,
            brands: args.filters.brands,
            tags: args.filters.tags,
            status: args.filters.status,
            dateRange: args.filters.dateRange,
            inStock: args.filters.inStock,
            featured: args.filters.featured,
            new: args.filters.new,
            hot: args.filters.hot
          } : undefined,
          sort: args.sort,
          pagination: args.pagination || { page: 1, size: 20 },
          types: args.types,
          userId: context.user?.id,
          sessionId: context.sessionId
        };

        // 执行搜索
        const result = await searchEngineService.search(searchRequest);
        
        logger.info(`搜索完成: "${args.query}", 结果数: ${result.total}, 耗时: ${result.executionTime}ms`);
        
        return {
          success: true,
          data: result,
          message: '搜索完成'
        };
        
      } catch (error) {
        const executionTime = Date.now() - startTime;
        logger.error('搜索失败:', error as Error);
        
        return {
          success: false,
          data: null,
          message: `搜索失败: ${(error as Error).message}`,
          executionTime
        };
      }
    },

    // 搜索建议
    searchSuggestions: async (_: any, { query, size = 5 }: {
      query: string;
      size?: number;
    }) => {
      try {
        const suggestions = await searchEngineService.getSuggestions(query, size);
        return {
          success: true,
          suggestions,
          message: '获取建议成功'
        };
      } catch (error) {
        logger.error('获取搜索建议失败:', error as Error);
        return {
          success: false,
          suggestions: [],
          message: `获取建议失败: ${(error as Error).message}`
        };
      }
    },

    // 热门搜索词
    hotSearchQueries: async (_: any, { limit = 10 }: { limit?: number }) => {
      try {
        const hotQueries = await searchEngineService.getHotQueries(limit);
        return {
          success: true,
          queries: hotQueries,
          message: '获取热门搜索词成功'
        };
      } catch (error) {
        logger.error('获取热门搜索词失败:', error as Error);
        return {
          success: false,
          queries: [],
          message: `获取热门搜索词失败: ${(error as Error).message}`
        };
      }
    },

    // 搜索分析数据
    searchAnalytics: async (_: any, { days = 7 }: { days?: number }) => {
      try {
        const analytics = await searchEngineService.getSearchAnalytics(days);
        return {
          success: true,
          analytics,
          message: '获取搜索分析数据成功'
        };
      } catch (error) {
        logger.error('获取搜索分析数据失败:', error as Error);
        return {
          success: false,
          analytics: null,
          message: `获取分析数据失败: ${(error as Error).message}`
        };
      }
    },

    // 搜索同步状态
    searchSyncStatus: async () => {
      try {
        const status = searchSyncService.getSyncStatus();
        return {
          success: true,
          status,
          message: '获取同步状态成功'
        };
      } catch (error) {
        logger.error('获取同步状态失败:', error as Error);
        return {
          success: false,
          status: null,
          message: `获取同步状态失败: ${(error as Error).message}`
        };
      }
    }
  },

  Mutation: {
    // 触发全量同步
    triggerFullSync: async (_: any, args: any, context: any) => {
      // 检查权限
      if (!context.user?.isAdmin) {
        return {
          success: false,
          message: '权限不足'
        };
      }

      try {
        await searchSyncService.fullSync();
        return {
          success: true,
          message: '全量同步已开始'
        };
      } catch (error) {
        logger.error('触发全量同步失败:', error as Error);
        return {
          success: false,
          message: `同步失败: ${(error as Error).message}`
        };
      }
    },

    // 触发增量同步
    triggerIncrementalSync: async (_: any, args: any, context: any) => {
      // 检查权限
      if (!context.user?.isAdmin) {
        return {
          success: false,
          message: '权限不足'
        };
      }

      try {
        await searchSyncService.incrementalSync();
        return {
          success: true,
          message: '增量同步已开始'
        };
      } catch (error) {
        logger.error('触发增量同步失败:', error as Error);
        return {
          success: false,
          message: `同步失败: ${(error as Error).message}`
        };
      }
    },

    // 同步单个文档
    syncDocument: async (_: any, { collection, recordId, operation }: {
      collection: string;
      recordId: string;
      operation: 'create' | 'update' | 'delete';
    }, context: any) => {
      // 检查权限
      if (!context.user?.isAdmin) {
        return {
          success: false,
          message: '权限不足'
        };
      }

      try {
        await searchSyncService.syncDocument(collection, recordId, operation);
        return {
          success: true,
          message: '文档同步成功'
        };
      } catch (error) {
        logger.error('同步文档失败:', error as Error);
        return {
          success: false,
          message: `同步文档失败: ${(error as Error).message}`
        };
      }
    }
  }
};

// 搜索相关的订阅（WebSocket）
export const searchSubscriptions = {
  Subscription: {
    // 实时搜索结果更新
    searchResultsUpdate: {
      subscribe: async function* (_: any, { query }: { query: string }) {
        // 这里可以实现实时搜索结果推送
        // 例如当有新的商品符合搜索条件时推送更新
        yield {
          query,
          timestamp: new Date(),
          message: '搜索结果已更新'
        };
      }
    },

    // 同步状态更新
    syncStatusUpdate: {
      subscribe: async function* () {
        // 定期推送同步状态
        const interval = setInterval(() => {
          const status = searchSyncService.getSyncStatus();
          return {
            status,
            timestamp: new Date()
          };
        }, 5000);

        try {
          while (true) {
            yield {
              status: searchSyncService.getSyncStatus(),
              timestamp: new Date()
            };
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        } finally {
          clearInterval(interval);
        }
      }
    }
  }
}; 