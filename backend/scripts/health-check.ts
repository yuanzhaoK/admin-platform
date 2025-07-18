/**
 * 系统健康检查脚本
 * 检查 PocketBase 连接、GraphQL 服务和各个组件的健康状态
 */
import { memoryCache } from "../config/cache.ts";
import { environmentConfig } from '../config/environment.ts';
import { performanceMonitor } from "../utils/performance.ts";

// 服务健康检查结果接口
interface ServiceCheckResult {
  service: string;
  status: string;
  responseTime?: number;
  details?: any;
  error?: string;
}

// 健康检查接口
interface HealthCheckResult {
  status: "healthy" | "warning" | "critical";
  timestamp: string;
  uptime: number;
  services: {
    database: {
        status: "connected" | "disconnected" | "error";
        responseTime?: number;
        details?: {
          url?: string;
          version?: string;
        };
      };
    cache: {
      status: "healthy" | "warning";
      hitRate: number;
      size: number;
    };
    memory: {
      status: "healthy" | "warning" | "critical";
      usage: number;
      peak: number;
    };
  };
  metrics: {
    totalRequests: number;
    errorRate: number;
    slowQueries: number;
    avgResponseTime: number;
  };
}

class HealthChecker {
  private config = environmentConfig;
  private pocketbaseUrl: string;

  constructor() {
    this.pocketbaseUrl = this.config.pocketbase.url || "http://localhost:8090";
  }

  async checkDatabase(): Promise<HealthCheckResult["services"]["database"]> {
    try {
      const start = Date.now();
      const response = await fetch(`${this.pocketbaseUrl}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseTime = Date.now() - start;

      if (response.ok) {
         const data = await response.json();
          return {
            status: 'connected',
            responseTime,
            details: {
              url: this.config.pocketbase.url,
              version: data.version || 'unknown',
            },
          };
      } else {
        return {
          status: "error",
          responseTime,
        };
      }
    } catch (error) {
      console.error("Database health check failed:", error);
      return {
        status: "disconnected",
      };
    }
  }
  
  // 为了保持与runAllChecks中调用一致，提供checkPocketBase作为checkDatabase的别名
  async checkPocketBase(): Promise<HealthCheckResult["services"]["database"]> {
    return this.checkDatabase();
  }

  async checkGraphQLServer(): Promise<ServiceCheckResult> {
    const start = Date.now();
    const url = `http://${this.config.graphql.host}:${this.config.graphql.port}/health`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        return {
          service: 'GraphQL Server',
          status: data.status === 'OK' ? 'healthy' : 'critical',
          responseTime,
          details: {
            url,
            timestamp: data.timestamp,
            pocketbaseStatus: data.pocketbase,
          },
        };
      } else {
        return {
          service: 'GraphQL Server',
          status: 'critical',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - start;
      return {
        service: 'GraphQL Server',
        status: 'critical',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async checkGraphQLSchema(): Promise<ServiceCheckResult> {
    const start = Date.now();
    const url = `http://${this.config.graphql.host}:${this.config.graphql.port}/graphql`;
    
    // 简单的 introspection 查询
    const query = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
          }
          mutationType {
            name
          }
        }
      }
    `;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(5000),
      });
      
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.errors) {
          return {
            service: 'GraphQL Schema',
            status: 'unhealthy',
            responseTime,
            error: 'Schema validation errors',
            details: { errors: data.errors },
          };
        }
        
        return {
          service: 'GraphQL Schema',
          status: 'healthy',
          responseTime,
          details: {
            queryType: data.data?.__schema?.queryType?.name,
            mutationType: data.data?.__schema?.mutationType?.name,
          },
        };
      } else {
        return {
          service: 'GraphQL Schema',
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - start;
      return {
        service: 'GraphQL Schema',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async runAllChecks(): Promise<ServiceCheckResult[]> {
    console.log('🔍 开始系统健康检查...\n');
    
    const checks = [
      this.checkPocketBase().then(result => ({ ...result, service: 'PocketBase' })),
      this.checkGraphQLServer(),
      this.checkGraphQLSchema(),
    ];
    
    const results = await Promise.allSettled(checks);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const services = ['PocketBase', 'GraphQL Server', 'GraphQL Schema'];
        return {
          service: services[index],
          status: 'unknown',
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        };
      }
    });
  }

  printResults(results: ServiceCheckResult[]): void {
    console.log('📊 健康检查结果:');
    console.log('================');
    
    let healthyCount = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    results.forEach((result) => {
      const statusIcon = result.status === 'healthy' ? '✅' : 
                        result.status === 'unhealthy' || result.status === 'critical' ? '❌' : '❓';
      
      console.log(`\n${statusIcon} ${result.service}`);
      console.log(`   状态: ${result.status.toUpperCase()}`);
      
      if (result.responseTime !== undefined) {
        console.log(`   响应时间: ${result.responseTime}ms`);
        totalResponseTime += result.responseTime;
        responseTimeCount++;
      }
      
      if (result.error) {
        console.log(`   错误: ${result.error}`);
      }
      
      if (result.details) {
        console.log(`   详情: ${JSON.stringify(result.details, null, 4)}`);
      }
      
      if (result.status === 'healthy') {
        healthyCount++;
      }
    });
    
    console.log('\n📈 统计信息:');
    console.log('============');
    console.log(`健康服务: ${healthyCount}/${results.length}`);
    
    if (responseTimeCount > 0) {
      const avgResponseTime = Math.round(totalResponseTime / responseTimeCount);
      console.log(`平均响应时间: ${avgResponseTime}ms`);
    }
    
    const overallStatus = healthyCount === results.length ? '健康' : 
                         healthyCount > 0 ? '部分异常' : '异常';
    console.log(`总体状态: ${overallStatus}`);
    
    // 退出码
    const exitCode = healthyCount === results.length ? 0 : 1;
    if (exitCode !== 0) {
      console.log('\n⚠️  系统存在问题，请检查上述错误信息');
    }
    
    Deno.exit(exitCode);
  }

  checkCache(): HealthCheckResult["services"]["cache"] {
    const stats = memoryCache.getStats();
    
    return {
      status: stats.enabled ? "healthy" : "warning",
      hitRate: 0, // 实际命中率需要从缓存实现中获取
      size: stats.size,
    };
  }

  checkMemory(): HealthCheckResult["services"]["memory"] {
    let usage = 0;
    let peak = 0;

    try {
      if (typeof Deno !== "undefined") {
        const mem = (Deno as any).memoryUsage();
        usage = mem.rss || 0;
        peak = mem.total || 0;
      }
    } catch (error) {
      console.warn("Memory usage check failed:", error);
    }

    const usagePercent = peak > 0 ? (usage / peak) * 100 : 0;
    
    let status: "healthy" | "warning" | "critical" = "healthy";
    if (usagePercent > 80) status = "warning";
    if (usagePercent > 95) status = "critical";

    return {
      status,
      usage: usagePercent,
      peak,
    };
  }

  async performHealthCheck(): Promise<HealthCheckResult> {
    const perfReport = performanceMonitor.getHealthCheck();
    
    const [dbStatus, cacheStatus, memoryStatus] = await Promise.all([
      this.checkDatabase(),
      Promise.resolve(this.checkCache()),
      Promise.resolve(this.checkMemory()),
    ]);

    const overallStatus = this.determineOverallStatus(
      dbStatus.status,
      cacheStatus.status,
      memoryStatus.status,
      perfReport.status
    );

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: perfReport.uptime,
      services: {
        database: dbStatus,
        cache: cacheStatus,
        memory: memoryStatus,
      },
      metrics: {
        totalRequests: performanceMonitor.getReport().api.requests,
        errorRate: perfReport.metrics.errorRate,
        slowQueries: perfReport.metrics.slowQueries,
        avgResponseTime: performanceMonitor.getReport().api.avgResponseTime,
      },
    };
  }

  private determineOverallStatus(
    dbStatus: string,
    cacheStatus: string,
    memoryStatus: string,
    perfStatus: string
  ): "healthy" | "warning" | "critical" {
    const statuses = [dbStatus, cacheStatus, memoryStatus, perfStatus];
    
    if (statuses.includes("critical") || dbStatus === "disconnected") {
      return "critical";
    }
    
    if (statuses.includes("warning") || statuses.includes("error")) {
      return "warning";
    }
    
    return "healthy";
  }

  async run(): Promise<void> {
    console.log("🔍 开始健康检查...");
    
    try {
      const result = await this.performHealthCheck();
      
      console.log("\n📊 健康检查结果:");
      console.log(`状态: ${result.status.toUpperCase()}`);
      console.log(`运行时间: ${Math.floor(result.uptime / 1000)}s`);
      console.log(`时间戳: ${result.timestamp}`);
      
      console.log("\n🔧 服务状态:");
      console.log(`数据库: ${result.services.database.status}`);
      if (result.services.database.responseTime) {
        console.log(`响应时间: ${result.services.database.responseTime}ms`);
      }
      
      console.log(`缓存: ${result.services.cache.status}`);
      console.log(`缓存大小: ${result.services.cache.size}`);
      
      console.log(`内存: ${result.services.memory.status}`);
      console.log(`内存使用率: ${result.services.memory.usage.toFixed(2)}%`);
      
      console.log("\n📈 性能指标:");
      console.log(`总请求数: ${result.metrics.totalRequests}`);
      console.log(`错误率: ${result.metrics.errorRate.toFixed(2)}%`);
      console.log(`慢查询: ${result.metrics.slowQueries}`);
      console.log(`平均响应时间: ${result.metrics.avgResponseTime.toFixed(2)}ms`);
      
      // 根据状态码退出
      const exitCode = result.status === "critical" ? 1 : result.status === "warning" ? 2 : 0;
      Deno.exit(exitCode);
      
    } catch (error) {
      console.error("❌ 健康检查失败:", error);
      Deno.exit(1);
    }
  }
}

// 主函数
async function main(): Promise<void> {
  const checker = new HealthChecker();
  
  try {
    // 检查每个服务的健康状态
    const results = await checker.runAllChecks();
    // 打印结果摘要
    checker.printResults(results);
  } catch (error) {
    console.error("❌ 健康检查失败:", error);
  }
}
  
// 如果直接运行此脚本
if (import.meta.main) {
  const checker = new HealthChecker();
  await checker.run();
}

export { HealthChecker };
