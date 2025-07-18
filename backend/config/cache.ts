// 缓存配置
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // 缓存时间（秒）
  maxSize: number; // 最大缓存条目数
  strategies: {
    query: boolean;
    mutation: boolean;
    subscription: boolean;
  };
}

export const cacheConfig: CacheConfig = {
  enabled: true,
  ttl: 300, // 5分钟
  maxSize: 1000,
  strategies: {
    query: true,
    mutation: false,
    subscription: false,
  },
};

// 简单的内存缓存实现
class MemoryCache {
  private cache = new Map<string, { value: unknown; timestamp: number }>();
  private config: CacheConfig;

  constructor(config: CacheConfig) {
    this.config = config;
  }

  get<T>(key: string): T | undefined {
    if (!this.config.enabled) return undefined;

    const item = this.cache.get(key);
    if (!item) return undefined;

    // 检查是否过期
    if (Date.now() - item.timestamp > this.config.ttl * 1000) {
      this.cache.delete(key);
      return undefined;
    }

    return item.value as T;
  }

  set<T>(key: string, value: T): void {
    if (!this.config.enabled) return;

    // 清理过期缓存
    this.cleanup();

    // 如果达到最大容量，清理最旧的条目
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { value, timestamp: Date.now() });
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.config.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      enabled: this.config.enabled,
    };
  }
}

export const memoryCache = new MemoryCache(cacheConfig);
