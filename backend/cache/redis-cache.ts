/**
 * Redis 缓存服务
 * 提供高性能的缓存解决方案，支持多种缓存策略
 */

import { Redis } from 'https://deno.land/x/redis@v0.32.1/mod.ts';

// Redis 配置
const REDIS_CONFIG = {
  hostname: Deno.env.get('REDIS_HOST') || 'localhost',
  port: parseInt(Deno.env.get('REDIS_PORT') || '6379'),
  password: Deno.env.get('REDIS_PASSWORD') || undefined,
  db: parseInt(Deno.env.get('REDIS_DB') || '0'),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxLoadingTimeout: 3000,
};

// 缓存键前缀
const CACHE_PREFIX = {
  PRODUCT: 'product:',
  CATEGORY: 'category:',
  USER: 'user:',
  ORDER: 'order:',
  STATS: 'stats:',
  SESSION: 'session:',
  API: 'api:',
  GRAPHQL: 'graphql:',
};

// 缓存过期时间（秒）
const CACHE_TTL = {
  PRODUCT: 3600, // 1小时
  CATEGORY: 7200, // 2小时
  USER: 1800, // 30分钟
  ORDER: 900, // 15分钟
  STATS: 300, // 5分钟
  SESSION: 86400, // 24小时
  API: 60, // 1分钟
  GRAPHQL: 300, // 5分钟
};

// 缓存策略
export enum CacheStrategy {
  CACHE_FIRST = 'cache-first',
  NETWORK_FIRST = 'network-first',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate',
  CACHE_ONLY = 'cache-only',
  NETWORK_ONLY = 'network-only',
}

// 缓存结果
export interface CacheResult<T> {
  data: T;
  fromCache: boolean;
  cacheKey: string;
  ttl: number;
}

// Redis 客户端
let redisClient: Redis | null = null;

// 获取 Redis 客户端
async function getRedisClient(): Promise<Redis> {
  if (!redisClient) {
    try {
      redisClient = await Redis.connect(REDIS_CONFIG);
      console.log('✅ Redis 连接成功');
    } catch (error) {
      console.error('❌ Redis 连接失败:', error);
      throw error;
    }
  }
  return redisClient;
}

// 缓存管理器
export class RedisCache {
  private client: Redis | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.client = await getRedisClient();
    } catch (error) {
      console.warn('⚠️ Redis 未初始化，将使用内存缓存');
    }
  }

  /**
   * 生成缓存键
   */
  private generateKey(prefix: string, key: string): string {
    return `${CACHE_PREFIX[prefix as keyof typeof CACHE_PREFIX]}${key}`;
  }

  /**
   * 设置缓存
   */
  async set<T>(
    prefix: string,
    key: string,
    value: T,
    ttl: number = CACHE_TTL[prefix as keyof typeof CACHE_TTL] || 3600
  ): Promise<void> {
    if (!this.client) return;

    const cacheKey = this.generateKey(prefix, key);
    try {
      await this.client.setex(cacheKey, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('设置缓存失败:', error);
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(prefix: string, key: string): Promise<T | null> {
    if (!this.client) return null;

    const cacheKey = this.generateKey(prefix, key);
    try {
      const value = await this.client.get(cacheKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   */
  async del(prefix: string, key: string): Promise<void> {
    if (!this.client) return;

    const cacheKey = this.generateKey(prefix, key);
    try {
      await this.client.del(cacheKey);
    } catch (error) {
      console.error('删除缓存失败:', error);
    }
  }

  /**
   * 批量删除缓存（支持通配符）
   */
  async delPattern(pattern: string): Promise<void> {
    if (!this.client) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('批量删除缓存失败:', error);
    }
  }

  /**
   * 检查缓存是否存在
   */
  async exists(prefix: string, key: string): Promise<boolean> {
    if (!this.client) return false;

    const cacheKey = this.generateKey(prefix, key);
    try {
      const result = await this.client.exists(cacheKey);
      return result === 1;
    } catch (error) {
      console.error('检查缓存失败:', error);
      return false;
    }
  }

  /**
   * 获取缓存 TTL
   */
  async ttl(prefix: string, key: string): Promise<number> {
    if (!this.client) return -1;

    const cacheKey = this.generateKey(prefix, key);
    try {
      return await this.client.ttl(cacheKey);
    } catch (error) {
      console.error('获取缓存 TTL 失败:', error);
      return -1;
    }
  }

  /**
   * 设置缓存 TTL
   */
  async expire(prefix: string, key: string, ttl: number): Promise<void> {
    if (!this.client) return;

    const cacheKey = this.generateKey(prefix, key);
    try {
      await this.client.expire(cacheKey, ttl);
    } catch (error) {
      console.error('设置缓存 TTL 失败:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: number;
    hitRate: number;
  }> {
    if (!this.client) {
      return { totalKeys: 0, memoryUsage: 0, hitRate: 0 };
    }

    try {
      const info = await this.client.info();
      const lines = info.split('\r\n');
      
      let totalKeys = 0;
      let memoryUsage = 0;
      
      for (const line of lines) {
        if (line.startsWith('db0:keys=')) {
          totalKeys = parseInt(line.split(',')[0].split('=')[1]) || 0;
        } else if (line.startsWith('used_memory:')) {
          memoryUsage = parseInt(line.split(':')[1]) || 0;
        }
      }

      return {
        totalKeys,
        memoryUsage,
        hitRate: 0, // 需要额外的统计逻辑
      };
    } catch (error) {
      console.error('获取缓存统计失败:', error);
      return { totalKeys: 0, memoryUsage: 0, hitRate: 0 };
    }
  }

  /**
   * 清空所有缓存
   */
  async flushAll(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.flushall();
    } catch (error) {
      console.error('清空缓存失败:', error);
    }
  }

  /**
   * 使用缓存策略获取数据
   */
  async getWithStrategy<T>(
    prefix: string,
    key: string,
    fetcher: () => Promise<T>,
    strategy: CacheStrategy = CacheStrategy.CACHE_FIRST,
    ttl?: number
  ): Promise<CacheResult<T>> {
    const cacheKey = this.generateKey(prefix, key);
    
    switch (strategy) {
      case CacheStrategy.CACHE_FIRST:
        return this.cacheFirst(prefix, key, fetcher, ttl);
      
      case CacheStrategy.NETWORK_FIRST:
        return this.networkFirst(prefix, key, fetcher, ttl);
      
      case CacheStrategy.STALE_WHILE_REVALIDATE:
        return this.staleWhileRevalidate(prefix, key, fetcher, ttl);
      
      case CacheStrategy.CACHE_ONLY:
        const cached = await this.get<T>(prefix, key);
        return {
          data: cached!,
          fromCache: true,
          cacheKey,
          ttl: await this.ttl(prefix, key),
        };
      
      case CacheStrategy.NETWORK_ONLY:
        const data = await fetcher();
        return {
          data,
          fromCache: false,
          cacheKey,
          ttl: 0,
        };
      
      default:
        return this.cacheFirst(prefix, key, fetcher, ttl);
    }
  }

  /**
   * 缓存优先策略
   */
  private async cacheFirst<T>(
    prefix: string,
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<CacheResult<T>> {
    const cacheKey = this.generateKey(prefix, key);
    
    // 先尝试从缓存获取
    const cached = await this.get<T>(prefix, key);
    if (cached !== null) {
      return {
        data: cached,
        fromCache: true,
        cacheKey,
        ttl: await this.ttl(prefix, key),
      };
    }
    
    // 缓存未命中，从数据源获取
    const data = await fetcher();
    await this.set(prefix, key, data, ttl);
    
    return {
      data,
      fromCache: false,
      cacheKey,
      ttl: ttl || CACHE_TTL[prefix as keyof typeof CACHE_TTL] || 3600,
    };
  }

  /**
   * 网络优先策略
   */
  private async networkFirst<T>(
    prefix: string,
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<CacheResult<T>> {
    const cacheKey = this.generateKey(prefix, key);
    
    try {
      // 先从数据源获取
      const data = await fetcher();
      await this.set(prefix, key, data, ttl);
      
      return {
        data,
        fromCache: false,
        cacheKey,
        ttl: ttl || CACHE_TTL[prefix as keyof typeof CACHE_TTL] || 3600,
      };
    } catch (error) {
      // 网络失败，尝试从缓存获取
      const cached = await this.get<T>(prefix, key);
      if (cached !== null) {
        return {
          data: cached,
          fromCache: true,
          cacheKey,
          ttl: await this.ttl(prefix, key),
        };
      }
      
      throw error;
    }
  }

  /**
   * 过期后重新验证策略
   */
  private async staleWhileRevalidate<T>(
    prefix: string,
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<CacheResult<T>> {
    const cacheKey = this.generateKey(prefix, key);
    
    const cached = await this.get<T>(prefix, key);
    const currentTtl = await this.ttl(prefix, key);
    
    if (cached !== null) {
      // 如果缓存过期，异步更新
      if (currentTtl <= 0) {
        fetcher().then(data => {
          this.set(prefix, key, data, ttl);
        }).catch(error => {
          console.error('异步更新缓存失败:', error);
        });
      }
      
      return {
        data: cached,
        fromCache: true,
        cacheKey,
        ttl: currentTtl,
      };
    }
    
    // 缓存不存在，从数据源获取
    const data = await fetcher();
    await this.set(prefix, key, data, ttl);
    
    return {
      data,
      fromCache: false,
      cacheKey,
      ttl: ttl || CACHE_TTL[prefix as keyof typeof CACHE_TTL] || 3600,
    };
  }
}

// 缓存装饰器
export function Cacheable(
  prefix: string,
  ttl?: number,
  strategy: CacheStrategy = CacheStrategy.CACHE_FIRST
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const cache = new RedisCache();
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`;
      
      return cache.getWithStrategy(
        prefix,
        cacheKey,
        () => originalMethod.apply(this, args),
        strategy,
        ttl
      );
    };
    
    return descriptor;
  };
}

// 单例实例
export const redisCache = new RedisCache();
