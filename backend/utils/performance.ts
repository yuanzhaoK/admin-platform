// 性能监控工具
interface PerformanceMetrics {
  queries: {
    count: number;
    totalTime: number;
    slowQueries: Array<{
      query: string;
      duration: number;
      timestamp: string;
    }>;
  };
  api: {
    requests: number;
    errors: number;
    avgResponseTime: number;
    endpoints: Map<string, {
      count: number;
      avgTime: number;
      errors: number;
    }>;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  memory: {
    used: number;
    total: number;
    peak: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private startTime: number;

  constructor() {
    this.metrics = {
      queries: {
        count: 0,
        totalTime: 0,
        slowQueries: [],
      },
      api: {
        requests: 0,
        errors: 0,
        avgResponseTime: 0,
        endpoints: new Map(),
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
      memory: {
        used: 0,
        total: 0,
        peak: 0,
      },
    };
    this.startTime = Date.now();
  }

  // 记录数据库查询
  recordQuery(query: string, duration: number): void {
    this.metrics.queries.count++;
    this.metrics.queries.totalTime += duration;

    // 记录慢查询（超过100ms）
    if (duration > 100) {
      this.metrics.queries.slowQueries.push({
        query,
        duration,
        timestamp: new Date().toISOString(),
      });

      // 只保留最近的100个慢查询
      if (this.metrics.queries.slowQueries.length > 100) {
        this.metrics.queries.slowQueries.shift();
      }
    }
  }

  // 记录API请求
  recordApiRequest(endpoint: string, duration: number, isError: boolean = false): void {
    this.metrics.api.requests++;
    
    if (isError) {
      this.metrics.api.errors++;
    }

    // 更新端点统计
    const endpointStats = this.metrics.api.endpoints.get(endpoint) || {
      count: 0,
      avgTime: 0,
      errors: 0,
    };

    endpointStats.count++;
    if (isError) {
      endpointStats.errors++;
    }
    
    // 计算新的平均响应时间
    endpointStats.avgTime = (endpointStats.avgTime * (endpointStats.count - 1) + duration) / endpointStats.count;
    
    this.metrics.api.endpoints.set(endpoint, endpointStats);

    // 计算整体平均响应时间
    const totalEndpoints = Array.from(this.metrics.api.endpoints.values());
    const totalTime = totalEndpoints.reduce((sum, stats) => sum + (stats.avgTime * stats.count), 0);
    this.metrics.api.avgResponseTime = totalTime / this.metrics.api.requests;
  }

  // 记录缓存操作
  recordCacheHit(): void {
    this.metrics.cache.hits++;
    this.updateCacheHitRate();
  }

  recordCacheMiss(): void {
    this.metrics.cache.misses++;
    this.updateCacheHitRate();
  }

  private updateCacheHitRate(): void {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;
  }

  // 更新内存使用
  updateMemoryUsage(): void {
    // 在Deno环境中使用Deno.memoryUsage()
    if (typeof Deno !== "undefined") {
      const mem = (Deno as any).memoryUsage();
      this.metrics.memory.used = mem.rss || 0;
      this.metrics.memory.total = mem.total || 0;
      this.metrics.memory.peak = Math.max(this.metrics.memory.peak, this.metrics.memory.used);
    }
  }

  // 获取性能报告
  getReport(): {
    uptime: number;
    queries: {
      count: number;
      totalTime: number;
      slowQueries: Array<{
        query: string;
        duration: number;
        timestamp: string;
      }>;
    };
    api: {
      requests: number;
      errors: number;
      avgResponseTime: number;
      endpoints: Record<string, {
        count: number;
        avgTime: number;
        errors: number;
      }>;
    };
    cache: {
      hits: number;
      misses: number;
      hitRate: number;
    };
    memory: {
      used: number;
      total: number;
      peak: number;
    };
  } {
    this.updateMemoryUsage();
    
    return {
      uptime: Date.now() - this.startTime,
      queries: this.metrics.queries,
      api: {
        ...this.metrics.api,
        endpoints: Object.fromEntries(this.metrics.api.endpoints),
      },
      cache: this.metrics.cache,
      memory: this.metrics.memory,
    };
  }

  // 获取健康检查信息
  getHealthCheck(): {
    status: "healthy" | "warning" | "critical";
    uptime: number;
    metrics: {
      slowQueries: number;
      errorRate: number;
      cacheHitRate: number;
      memoryUsage: number;
    };
  } {
    const report = this.getReport();
    
    const slowQueries = report.queries.slowQueries.length;
    const errorRate = report.api.requests > 0 ? (report.api.errors / report.api.requests) * 100 : 0;
    const cacheHitRate = report.cache.hitRate;
    const memoryUsage = report.memory.total > 0 ? (report.memory.used / report.memory.total) * 100 : 0;

    let status: "healthy" | "warning" | "critical" = "healthy";
    
    if (errorRate > 5 || slowQueries > 10 || memoryUsage > 80) {
      status = "warning";
    }
    
    if (errorRate > 10 || slowQueries > 50 || memoryUsage > 95) {
      status = "critical";
    }

    return {
      status,
      uptime: report.uptime,
      metrics: {
        slowQueries,
        errorRate,
        cacheHitRate,
        memoryUsage,
      },
    };
  }

  // 重置指标
  reset(): void {
    this.metrics = {
      queries: {
        count: 0,
        totalTime: 0,
        slowQueries: [],
      },
      api: {
        requests: 0,
        errors: 0,
        avgResponseTime: 0,
        endpoints: new Map(),
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
      memory: {
        used: 0,
        total: 0,
        peak: 0,
      },
    };
    this.startTime = Date.now();
  }

  // 获取端点性能
  getEndpointPerformance(endpoint: string): {
    count: number;
    avgTime: number;
    errors: number;
    errorRate: number;
  } | null {
    const stats = this.metrics.api.endpoints.get(endpoint);
    if (!stats) return null;

    return {
      ...stats,
      errorRate: stats.count > 0 ? (stats.errors / stats.count) * 100 : 0,
    };
  }

  // 获取慢查询列表
  getSlowQueries(limit: number = 10): Array<{
    query: string;
    duration: number;
    timestamp: string;
  }> {
    return this.metrics.queries.slowQueries.slice(-limit);
  }

  // 获取缓存统计
  getCacheStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    total: number;
  } {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    return {
      ...this.metrics.cache,
      total,
    };
  }
}

// 创建全局性能监控实例
export const performanceMonitor = new PerformanceMonitor();

// 性能分析装饰器
export function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;

  descriptor.value = async function (this: any, ...args: any[]) {
    const start = Date.now();
    const className = target.constructor.name;
    
    try {
      const result = await method.apply(this, args);
      const duration = Date.now() - start;
      
      performanceMonitor.recordApiRequest(
        `${className}.${propertyName}`,
        duration
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      performanceMonitor.recordApiRequest(
        `${className}.${propertyName}`,
        duration,
        true
      );
      
      throw error;
    }
  };

  return descriptor;
}

// 数据库查询性能监控
export function measureQuery(query: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (this: any, ...args: any[]) {
      const start = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - start;
        
        performanceMonitor.recordQuery(query, duration);
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        
        performanceMonitor.recordQuery(query, duration);
        
        throw error;
      }
    };

    return descriptor;
  };
}

// 缓存性能监控
export function measureCache() {
  return {
    hit: () => performanceMonitor.recordCacheHit(),
    miss: () => performanceMonitor.recordCacheMiss(),
  };
}

// 导出性能监控工具
export const perf = {
  monitor: performanceMonitor,
  measure: measurePerformance,
  query: measureQuery,
  cache: measureCache(),
};
