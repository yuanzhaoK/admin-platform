import React from 'react';
import { frontendCache } from '@/lib/cache';

type CacheOptions = {
  ttl?: number;
  storage?: 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';
  compress?: boolean;
  encrypt?: boolean;
};

/**
 * React Hook 用于缓存管理
 * @param key 缓存键
 * @param options 缓存选项
 * @returns 缓存数据和操作方法
 */
export function useCache<T = any>(key: string, options: CacheOptions = {}) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadFromCache = async () => {
      setLoading(true);
      setError(null);
      try {
        const cached = await frontendCache.get<T>(key, options);
        setData(cached);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Cache load error');
        setError(error);
        console.warn('Cache load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFromCache();
  }, [key, JSON.stringify(options)]);

  const setCache = React.useCallback(async (value: T) => {
    try {
      setError(null);
      await frontendCache.set(key, value, options);
      setData(value);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache set error');
      setError(error);
      console.warn('Cache set error:', error);
    }
  }, [key, options]);

  const clearCache = React.useCallback(async () => {
    try {
      setError(null);
      await frontendCache.delete(key, options);
      setData(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache clear error');
      setError(error);
      console.warn('Cache clear error:', error);
    }
  }, [key, options]);

  const refreshCache = React.useCallback(async (fetchFn: () => Promise<T>) => {
    setLoading(true);
    setError(null);
    try {
      const freshData = await fetchFn();
      await frontendCache.set(key, freshData, options);
      setData(freshData);
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache refresh error');
      setError(error);
      console.warn('Cache refresh error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, options]);

  return {
    data,
    loading,
    error,
    setCache,
    clearCache,
    refreshCache,
    isStale: data !== null && !loading
  };
}

/**
 * Hook 用于自动缓存异步函数结果
 * @param key 缓存键
 * @param fetchFn 获取数据的函数
 * @param options 缓存选项
 * @param dependencies 依赖数组
 */
export function useCachedQuery<T = any>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {},
  dependencies: React.DependencyList = []
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const execute = React.useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      // 如果不强制刷新，先尝试从缓存获取
      if (!forceRefresh) {
        const cached = await frontendCache.get<T>(key, options);
        if (cached !== null) {
          setData(cached);
          setLoading(false);
          return cached;
        }
      }

      // 执行获取函数
      const result = await fetchFn();
      
      // 缓存结果
      await frontendCache.set(key, result, options);
      setData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Query execution error');
      setError(error);
      console.warn('Cached query error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, options]);

  // 自动执行查询
  React.useEffect(() => {
    execute();
  }, [execute, ...dependencies]);

  const refresh = React.useCallback(() => execute(true), [execute]);

  const clearCache = React.useCallback(async () => {
    try {
      await frontendCache.delete(key, options);
      setData(null);
    } catch (err) {
      console.warn('Cache clear error:', err);
    }
  }, [key, options]);

  return {
    data,
    loading,
    error,
    execute,
    refresh,
    clearCache
  };
}

/**
 * Hook 用于批量缓存操作
 * @param keys 缓存键数组
 * @param options 缓存选项
 */
export function useBatchCache<T = any>(keys: string[], options: CacheOptions = {}) {
  const [data, setData] = React.useState<Record<string, T>>({});
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const loadBatchFromCache = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const results: Record<string, T> = {};
        
        await Promise.all(
          keys.map(async (key) => {
            const cached = await frontendCache.get<T>(key, options);
            if (cached !== null) {
              results[key] = cached;
            }
          })
        );
        
        setData(results);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Batch cache load error');
        setError(error);
        console.warn('Batch cache load error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (keys.length > 0) {
      loadBatchFromCache();
    }
  }, [JSON.stringify(keys), JSON.stringify(options)]);

  const setBatchCache = React.useCallback(async (dataMap: Record<string, T>) => {
    try {
      setError(null);
      
      await Promise.all(
        Object.entries(dataMap).map(([key, value]) =>
          frontendCache.set(key, value, options)
        )
      );
      
      setData(prev => ({ ...prev, ...dataMap }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Batch cache set error');
      setError(error);
      console.warn('Batch cache set error:', error);
    }
  }, [options]);

  const clearBatchCache = React.useCallback(async () => {
    try {
      setError(null);
      
      await Promise.all(
        keys.map(key => frontendCache.delete(key, options))
      );
      
      setData({});
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Batch cache clear error');
      setError(error);
      console.warn('Batch cache clear error:', error);
    }
  }, [keys, options]);

  return {
    data,
    loading,
    error,
    setBatchCache,
    clearBatchCache,
    getItem: (key: string) => data[key] || null,
    hasItem: (key: string) => key in data
  };
}

export default useCache;
