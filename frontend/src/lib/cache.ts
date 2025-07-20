/**
 * 前端缓存系统
 * 包括内存缓存、LocalStorage缓存、SessionStorage缓存和IndexedDB缓存
 */

type CacheValue = any;
type CacheOptions = {
  ttl?: number; // 缓存时间 (毫秒)
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  compress?: boolean; // 是否压缩
  encrypt?: boolean; // 是否加密
};

interface CacheEntry {
  value: CacheValue;
  expires: number;
  created: number;
  accessed: number;
  hits: number;
}

interface CacheStats {
  totalKeys: number;
  memoryUsage: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
}

class FrontendCache {
  private memoryCache = new Map<string, CacheEntry>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0
  };

  private readonly maxMemorySize = 50 * 1024 * 1024; // 50MB
  private readonly defaultTTL = 30 * 60 * 1000; // 30分钟

  constructor() {
    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 5 * 60 * 1000); // 每5分钟清理一次
    
    // 监听页面卸载事件，清理内存缓存
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup());
    }
  }

  // 获取缓存
  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const storage = options.storage || 'memory';
    
    try {
      let entry: CacheEntry | null = null;

      switch (storage) {
        case 'memory':
          entry = this.memoryCache.get(key) || null;
          break;
        case 'localStorage':
          entry = this.getFromStorage('localStorage', key);
          break;
        case 'sessionStorage':
          entry = this.getFromStorage('sessionStorage', key);
          break;
        case 'indexedDB':
          entry = await this.getFromIndexedDB(key);
          break;
      }

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // 检查是否过期
      if (entry.expires && Date.now() > entry.expires) {
        await this.delete(key, options);
        this.stats.misses++;
        return null;
      }

      // 更新访问统计
      entry.accessed = Date.now();
      entry.hits++;
      
      if (storage === 'memory') {
        this.memoryCache.set(key, entry);
      }

      this.stats.hits++;
      
      // 解密和解压缩
      let value = entry.value;
      if (options.encrypt) {
        value = this.decrypt(value);
      }
      if (options.compress) {
        value = this.decompress(value);
      }

      return value;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error);
      this.stats.misses++;
      return null;
    }
  }

  // 设置缓存
  async set(key: string, value: CacheValue, options: CacheOptions = {}): Promise<void> {
    const storage = options.storage || 'memory';
    const ttl = options.ttl || this.defaultTTL;
    
    try {
      let processedValue = value;
      
      // 压缩和加密
      if (options.compress) {
        processedValue = this.compress(processedValue);
      }
      if (options.encrypt) {
        processedValue = this.encrypt(processedValue);
      }

      const entry: CacheEntry = {
        value: processedValue,
        expires: ttl > 0 ? Date.now() + ttl : 0,
        created: Date.now(),
        accessed: Date.now(),
        hits: 0
      };

      switch (storage) {
        case 'memory':
          // 检查内存使用量
          if (this.getMemoryUsage() > this.maxMemorySize) {
            this.evictLRU();
          }
          this.memoryCache.set(key, entry);
          break;
        case 'localStorage':
          this.setToStorage('localStorage', key, entry);
          break;
        case 'sessionStorage':
          this.setToStorage('sessionStorage', key, entry);
          break;
        case 'indexedDB':
          await this.setToIndexedDB(key, entry);
          break;
      }

      this.stats.sets++;
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error);
      throw error;
    }
  }

  // 删除缓存
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    const storage = options.storage || 'memory';
    
    try {
      let deleted = false;

      switch (storage) {
        case 'memory':
          deleted = this.memoryCache.delete(key);
          break;
        case 'localStorage':
          deleted = this.deleteFromStorage('localStorage', key);
          break;
        case 'sessionStorage':
          deleted = this.deleteFromStorage('sessionStorage', key);
          break;
        case 'indexedDB':
          deleted = await this.deleteFromIndexedDB(key);
          break;
      }

      if (deleted) {
        this.stats.deletes++;
      }

      return deleted;
    } catch (error) {
      console.warn(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  // 清空缓存
  async clear(storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB'): Promise<void> {
    try {
      if (!storage || storage === 'memory') {
        this.memoryCache.clear();
      }
      if (!storage || storage === 'localStorage') {
        this.clearStorage('localStorage');
      }
      if (!storage || storage === 'sessionStorage') {
        this.clearStorage('sessionStorage');
      }
      if (!storage || storage === 'indexedDB') {
        await this.clearIndexedDB();
      }
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  // 获取缓存统计
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      totalKeys: this.memoryCache.size,
      memoryUsage: this.getMemoryUsage(),
      hitRate,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses
    };
  }

  // Storage 操作
  private getFromStorage(storageType: 'localStorage' | 'sessionStorage', key: string): CacheEntry | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const storage = window[storageType];
      const item = storage.getItem(`cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn(`Storage get error:`, error);
      return null;
    }
  }

  private setToStorage(storageType: 'localStorage' | 'sessionStorage', key: string, entry: CacheEntry): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storage = window[storageType];
      storage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      // Storage 满了，清理一些旧数据
      if (error.name === 'QuotaExceededError') {
        this.cleanupStorage(storageType);
        try {
          storage.setItem(`cache_${key}`, JSON.stringify(entry));
        } catch (secondError) {
          console.warn(`Storage set error after cleanup:`, secondError);
        }
      } else {
        console.warn(`Storage set error:`, error);
      }
    }
  }

  private deleteFromStorage(storageType: 'localStorage' | 'sessionStorage', key: string): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const storage = window[storageType];
      if (storage.getItem(`cache_${key}`) !== null) {
        storage.removeItem(`cache_${key}`);
        return true;
      }
      return false;
    } catch (error) {
      console.warn(`Storage delete error:`, error);
      return false;
    }
  }

  private clearStorage(storageType: 'localStorage' | 'sessionStorage'): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storage = window[storageType];
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.warn(`Storage clear error:`, error);
    }
  }

  private cleanupStorage(storageType: 'localStorage' | 'sessionStorage'): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storage = window[storageType];
      const entries: { key: string; entry: CacheEntry }[] = [];
      
      // 收集所有缓存条目
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('cache_')) {
          try {
            const entry = JSON.parse(storage.getItem(key)!);
            entries.push({ key, entry });
          } catch {
            // 删除无效的条目
            storage.removeItem(key);
          }
        }
      }
      
      // 按访问时间排序，删除最旧的50%
      entries.sort((a, b) => a.entry.accessed - b.entry.accessed);
      const toDelete = entries.slice(0, Math.floor(entries.length * 0.5));
      
      toDelete.forEach(({ key }) => storage.removeItem(key));
    } catch (error) {
      console.warn(`Storage cleanup error:`, error);
    }
  }

  // IndexedDB 操作
  private async getFromIndexedDB(key: string): Promise<CacheEntry | null> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('FrontendCache', 1);
        
        request.onerror = () => resolve(null);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['cache'], 'readonly');
          const store = transaction.objectStore('cache');
          const getRequest = store.get(key);
          
          getRequest.onsuccess = () => {
            resolve(getRequest.result || null);
          };
          getRequest.onerror = () => resolve(null);
        };
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' });
          }
        };
      } catch {
        resolve(null);
      }
    });
  }

  private async setToIndexedDB(key: string, entry: CacheEntry): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('FrontendCache', 1);
        
        request.onerror = () => reject(new Error('IndexedDB open failed'));
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          
          store.put({ key, ...entry });
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => reject(new Error('IndexedDB set failed'));
        };
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('cache')) {
            db.createObjectStore('cache', { keyPath: 'key' });
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private async deleteFromIndexedDB(key: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('FrontendCache', 1);
        
        request.onerror = () => resolve(false);
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          
          store.delete(key);
          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () => resolve(false);
        };
      } catch {
        resolve(false);
      }
    });
  }

  private async clearIndexedDB(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('FrontendCache', 1);
        
        request.onerror = () => resolve();
        request.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const transaction = db.transaction(['cache'], 'readwrite');
          const store = transaction.objectStore('cache');
          
          store.clear();
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => resolve();
        };
      } catch {
        resolve();
      }
    });
  }

  // 工具方法
  private getMemoryUsage(): number {
    let size = 0;
    for (const [key, entry] of this.memoryCache) {
      size += new Blob([key + JSON.stringify(entry)]).size;
    }
    return size;
  }

  private evictLRU(): void {
    // 移除最少使用的缓存条目
    let lruKey: string | null = null;
    let lruTime = Date.now();
    
    for (const [key, entry] of this.memoryCache) {
      if (entry.accessed < lruTime) {
        lruTime = entry.accessed;
        lruKey = key;
      }
    }
    
    if (lruKey) {
      this.memoryCache.delete(lruKey);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    // 清理过期的内存缓存
    for (const [key, entry] of this.memoryCache) {
      if (entry.expires && now > entry.expires) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.memoryCache.delete(key));
  }

  private compress(value: any): string {
    // 简单的压缩实现 (实际项目中可以使用 LZ4 或其他压缩算法)
    return JSON.stringify(value);
  }

  private decompress(value: string): any {
    // 简单的解压缩实现
    return JSON.parse(value);
  }

  private encrypt(value: any): string {
    // 简单的加密实现 (实际项目中应该使用更安全的加密算法)
    return btoa(JSON.stringify(value));
  }

  private decrypt(value: string): any {
    // 简单的解密实现
    return JSON.parse(atob(value));
  }
}

// 创建全局缓存实例
export const frontendCache = new FrontendCache();

// 缓存装饰器
export function cacheable(key: string, options: CacheOptions = {}) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = (async function (this: any, ...args: any[]) {
      const cacheKey = `${key}_${JSON.stringify(args)}`;
      
      // 尝试从缓存获取
      const cached = await frontendCache.get(cacheKey, options);
      if (cached !== null) {
        return cached;
      }

      // 执行原方法并缓存结果
      const result = await originalMethod.apply(this, args);
      await frontendCache.set(cacheKey, result, options);
      
      return result;
    }) as T;

    return descriptor;
  };
}

// React Hook 用于缓存 (需要在React组件中使用)
export function useCache<T = any>(key: string, options: CacheOptions = {}) {
  // 注意：这个Hook需要在React组件中使用，需要先导入React
  // import React from 'react';
  
  // 由于这是一个工具文件，我们将Hook的实现移到单独的文件中
  // 这里只提供接口定义
  throw new Error('useCache hook should be imported from @/hooks/use-cache instead');
}

export default frontendCache;
