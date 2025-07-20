/**
 * 数据库查询优化器
 * @description 提供查询缓存、批量查询、查询分析等功能
 */

import { pocketbaseClient } from '../config/pocketbase.ts';
import { redisCache, RedisCache } from '../cache/redis-cache.ts';

interface QueryCacheOptions {
  ttl?: number;
  useCache?: boolean;
  invalidateOnWrite?: boolean;
}

interface BatchQueryItem {
  collection: string;
  id: string;
  expand?: string;
}

interface QueryMetrics {
  queryCount: number;
  cacheHits: number;
  cacheMisses: number;
  totalQueryTime: number;
  avgQueryTime: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
}

export class DatabaseQueryOptimizer {
  private cache: RedisCache;
  private metrics: QueryMetrics;
  private slowQueryThreshold = 1000; // 1秒

  constructor() {
    this.cache = redisCache;
    this.metrics = {
      queryCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalQueryTime: 0,
      avgQueryTime: 0,
      slowQueries: []
    };
  }

  /**
   * 优化的单条记录查询
   */
  async getOne<T>(
    collection: string,
    id: string,
    options: { expand?: string } & QueryCacheOptions = {}
  ): Promise<T | null> {
    const startTime = performance.now();
    const cacheKey = RedisCache.generateKey('record', collection, id, options.expand || '');

    try {
      // 尝试从缓存获取
      if (options.useCache !== false) {
        const cached = await this.cache.get<T>(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // 从数据库查询
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const queryOptions: any = {};
      if (options.expand) {
        queryOptions.expand = options.expand;
      }

      const result = await pb.collection(collection).getOne<T>(id, queryOptions);

      // 存入缓存
      if (options.useCache !== false) {
        const ttl = options.ttl || 300; // 默认5分钟
        await this.cache.set(cacheKey, result, ttl);
      }

      this.updateMetrics(startTime, `${collection}.getOne(${id})`);
      return result;

    } catch (error) {
      this.updateMetrics(startTime, `${collection}.getOne(${id})`, true);
      console.error(`Query failed for ${collection}:${id}`, error);
      return null;
    }
  }

  /**
   * 优化的列表查询
   */
  async getList<T>(
    collection: string,
    page: number = 1,
    perPage: number = 20,
    options: {
      filter?: string;
      sort?: string;
      expand?: string;
    } & QueryCacheOptions = {}
  ): Promise<{
    items: T[];
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  }> {
    const startTime = performance.now();
    const queryHash = this.generateQueryHash(collection, { page, perPage, ...options });
    const cacheKey = RedisCache.generateKey('list', collection, queryHash);

    try {
      // 尝试从缓存获取
      if (options.useCache !== false) {
        const cached = await this.cache.get(cacheKey);
        if (cached) {
          this.metrics.cacheHits++;
          return cached;
        }
        this.metrics.cacheMisses++;
      }

      // 从数据库查询
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const queryOptions: any = {};
      if (options.filter) queryOptions.filter = options.filter;
      if (options.sort) queryOptions.sort = options.sort;
      if (options.expand) queryOptions.expand = options.expand;

      const result = await pb.collection(collection).getList<T>(page, perPage, queryOptions);

      // 存入缓存
      if (options.useCache !== false) {
        const ttl = options.ttl || 300; // 默认5分钟
        await this.cache.set(cacheKey, result, ttl);
      }

      this.updateMetrics(startTime, `${collection}.getList(p:${page},pp:${perPage})`);
      return result;

    } catch (error) {
      this.updateMetrics(startTime, `${collection}.getList`, true);
      throw error;
    }
  }

  /**
   * 批量查询优化
   */
  async batchGet<T>(items: BatchQueryItem[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    const cacheKeys = items.map(item => 
      RedisCache.generateKey('record', item.collection, item.id, item.expand || '')
    );

    try {
      // 批量从缓存获取
      const cachedResults = await this.cache.mget<T>(cacheKeys);
      const uncachedItems: BatchQueryItem[] = [];

      items.forEach((item, index) => {
        const key = `${item.collection}:${item.id}`;
        if (cachedResults[index] !== null) {
          results.set(key, cachedResults[index]);
          this.metrics.cacheHits++;
        } else {
          uncachedItems.push(item);
          this.metrics.cacheMisses++;
        }
      });

      // 批量从数据库查询未缓存的数据
      if (uncachedItems.length > 0) {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const fetchPromises = uncachedItems.map(async (item) => {
          try {
            const queryOptions: any = {};
            if (item.expand) {
              queryOptions.expand = item.expand;
            }
            
            const result = await pb.collection(item.collection).getOne<T>(item.id, queryOptions);
            const key = `${item.collection}:${item.id}`;
            results.set(key, result);

            // 存入缓存
            const cacheKey = RedisCache.generateKey('record', item.collection, item.id, item.expand || '');
            await this.cache.set(cacheKey, result, 300);

            return { key, result };
          } catch (error) {
            console.error(`Batch query failed for ${item.collection}:${item.id}`, error);
            const key = `${item.collection}:${item.id}`;
            results.set(key, null);
            return { key, result: null };
          }
        });

        await Promise.all(fetchPromises);
      }

      return results;
    } catch (error) {
      console.error('Batch query failed:', error);
      throw error;
    }
  }

  /**
   * 智能预加载相关数据
   */
  async preloadRelatedData<T>(
    collection: string,
    records: T[],
    relationships: string[]
  ): Promise<void> {
    const batchItems: BatchQueryItem[] = [];

    records.forEach((record: any) => {
      relationships.forEach(rel => {
        if (record[rel]) {
          // 确定关联集合名称
          const relatedCollection = this.inferCollectionName(rel);
          batchItems.push({
            collection: relatedCollection,
            id: record[rel],
            expand: ''
          });
        }
      });
    });

    if (batchItems.length > 0) {
      await this.batchGet(batchItems);
    }
  }

  /**
   * 查询结果聚合
   */
  async aggregateQuery(
    collection: string,
    aggregations: {
      count?: boolean;
      sum?: string[];
      avg?: string[];
      min?: string[];
      max?: string[];
    },
    filter?: string
  ): Promise<any> {
    const cacheKey = RedisCache.generateKey('aggregate', collection, JSON.stringify(aggregations), filter || '');
    
    // 尝试从缓存获取
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.metrics.cacheHits++;
      return cached;
    }
    this.metrics.cacheMisses++;

    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const queryOptions: any = {};
      if (filter) queryOptions.filter = filter;

      // 获取全部数据进行聚合（PocketBase不支持原生聚合查询）
      const records = await pb.collection(collection).getFullList(queryOptions);
      
      const result: any = {};

      if (aggregations.count) {
        result.count = records.length;
      }

      ['sum', 'avg', 'min', 'max'].forEach(operation => {
        if (aggregations[operation as keyof typeof aggregations]) {
          result[operation] = {};
          (aggregations[operation as keyof typeof aggregations] as string[]).forEach(field => {
            const values = records
              .map(record => record[field])
              .filter(val => typeof val === 'number');
            
            switch (operation) {
              case 'sum':
                result[operation][field] = values.reduce((sum, val) => sum + val, 0);
                break;
              case 'avg':
                result[operation][field] = values.length > 0 
                  ? values.reduce((sum, val) => sum + val, 0) / values.length 
                  : 0;
                break;
              case 'min':
                result[operation][field] = values.length > 0 ? Math.min(...values) : null;
                break;
              case 'max':
                result[operation][field] = values.length > 0 ? Math.max(...values) : null;
                break;
            }
          });
        }
      });

      // 缓存结果
      await this.cache.set(cacheKey, result, 600); // 10分钟缓存
      return result;

    } catch (error) {
      console.error('Aggregate query failed:', error);
      throw error;
    }
  }

  /**
   * 缓存失效管理
   */
  async invalidateCache(collection: string, recordId?: string): Promise<void> {
    if (recordId) {
      // 失效特定记录的缓存
      const pattern = `record:${collection}:${recordId}:*`;
      await this.cache.deletePattern(pattern);
    } else {
      // 失效整个集合的缓存
      const patterns = [
        `record:${collection}:*`,
        `list:${collection}:*`,
        `aggregate:${collection}:*`
      ];
      
      for (const pattern of patterns) {
        await this.cache.deletePattern(pattern);
      }
    }
  }

  /**
   * 获取查询性能指标
   */
  getMetrics(): QueryMetrics {
    return {
      ...this.metrics,
      avgQueryTime: this.metrics.queryCount > 0 
        ? this.metrics.totalQueryTime / this.metrics.queryCount 
        : 0
    };
  }

  /**
   * 重置性能指标
   */
  resetMetrics(): void {
    this.metrics = {
      queryCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalQueryTime: 0,
      avgQueryTime: 0,
      slowQueries: []
    };
  }

  private generateQueryHash(collection: string, options: any): string {
    const hashInput = JSON.stringify({ collection, ...options });
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private updateMetrics(startTime: number, query: string, failed: boolean = false): void {
    const duration = performance.now() - startTime;
    
    this.metrics.queryCount++;
    this.metrics.totalQueryTime += duration;

    if (duration > this.slowQueryThreshold) {
      this.metrics.slowQueries.push({
        query,
        duration,
        timestamp: new Date()
      });

      // 只保留最近的100个慢查询
      if (this.metrics.slowQueries.length > 100) {
        this.metrics.slowQueries = this.metrics.slowQueries.slice(-100);
      }
    }
  }

  private inferCollectionName(relationship: string): string {
    // 根据关系字段推断集合名称
    const mappings: Record<string, string> = {
      'category_id': 'product_categories',
      'brand_id': 'brands',
      'product_type_id': 'product_types',
      'user_id': 'users',
      'order_id': 'orders',
      'product_id': 'products'
    };

    return mappings[relationship] || relationship.replace('_id', 's');
  }
}

export const queryOptimizer = new DatabaseQueryOptimizer();
