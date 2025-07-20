/**
 * Redis缓存层实现
 * @description 提供分布式缓存功能，优化数据查询性能
 */

import { connect } from "https://deno.land/x/redis@v0.31.0/mod.ts";

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetryCount?: number;
  retryDelayMs?: number;
}

export class RedisCache {
  private redis: any = null;
  private config: CacheConfig;
  private reconnecting = false;

  constructor(config: CacheConfig = {
    host: Deno.env.get('REDIS_HOST') || 'localhost',
    port: parseInt(Deno.env.get('REDIS_PORT') || '6379'),
    password: Deno.env.get('REDIS_PASSWORD'),
    db: parseInt(Deno.env.get('REDIS_DB') || '0'),
    maxRetryCount: 3,
    retryDelayMs: 1000
  }) {
    this.config = config;
  }

  private async connect(): Promise<void> {
    if (this.redis && !this.redis.isClosed) {
      return;
    }

    try {
      this.redis = await connect({
        hostname: this.config.host,
        port: this.config.port,
        password: this.config.password,
        db: this.config.db,
      });
      
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      throw error;
    }
  }

  private async ensureConnection(): Promise<void> {
    if (!this.redis || this.redis.isClosed) {
      if (!this.reconnecting) {
        this.reconnecting = true;
        try {
          await this.connect();
        } finally {
          this.reconnecting = false;
        }
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureConnection();
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn('Redis get failed:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      await this.ensureConnection();
      const serialized = JSON.stringify(value);
      
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
      
      return true;
    } catch (error) {
      console.warn('Redis set failed:', error);
      return false;
    }
  }

  async del(key: string | string[]): Promise<boolean> {
    try {
      await this.ensureConnection();
      const keys = Array.isArray(key) ? key : [key];
      await this.redis.del(...keys);
      return true;
    } catch (error) {
      console.warn('Redis del failed:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.warn('Redis exists failed:', error);
      return false;
    }
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      await this.ensureConnection();
      const values = await this.redis.mget(...keys);
      return values.map((value: string | null) => 
        value ? JSON.parse(value) : null
      );
    } catch (error) {
      console.warn('Redis mget failed:', error);
      return keys.map(() => null);
    }
  }

  async mset(pairs: Record<string, any>, ttl?: number): Promise<boolean> {
    try {
      await this.ensureConnection();
      const serializedPairs: string[] = [];
      
      for (const [key, value] of Object.entries(pairs)) {
        serializedPairs.push(key, JSON.stringify(value));
      }
      
      await this.redis.mset(...serializedPairs);
      
      if (ttl) {
        const expirePromises = Object.keys(pairs).map(key => 
          this.redis.expire(key, ttl)
        );
        await Promise.all(expirePromises);
      }
      
      return true;
    } catch (error) {
      console.warn('Redis mset failed:', error);
      return false;
    }
  }

  async flush(): Promise<boolean> {
    try {
      await this.ensureConnection();
      await this.redis.flushdb();
      return true;
    } catch (error) {
      console.warn('Redis flush failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis && !this.redis.isClosed) {
      this.redis.close();
    }
  }

  // 缓存键生成工具
  static generateKey(namespace: string, ...parts: (string | number)[]): string {
    return `${namespace}:${parts.join(':')}`;
  }

  // 模式匹配删除
  async deletePattern(pattern: string): Promise<number> {
    try {
      await this.ensureConnection();
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.warn('Redis delete pattern failed:', error);
      return 0;
    }
  }
}

// 全局缓存实例
export const redisCache = new RedisCache();

// 缓存装饰器
export function Cached(ttl: number = 300, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator 
        ? keyGenerator(...args) 
        : `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cached = await redisCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // 执行原方法
      const result = await method.apply(this, args);
      
      // 存入缓存
      await redisCache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}
