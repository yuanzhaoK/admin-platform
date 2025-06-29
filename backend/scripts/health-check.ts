/**
 * 系统健康检查脚本
 * 检查 PocketBase 连接、GraphQL 服务和各个组件的健康状态
 */

import { environmentConfig } from '../config/environment.ts';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  responseTime?: number;
  error?: string;
  details?: Record<string, any>;
}

class HealthChecker {
  private config = environmentConfig;

  async checkPocketBase(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      const response = await fetch(`${this.config.pocketbase.url}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      
      const responseTime = Date.now() - start;
      
      if (response.ok) {
        const data = await response.json();
        return {
          service: 'PocketBase',
          status: 'healthy',
          responseTime,
          details: {
            url: this.config.pocketbase.url,
            version: data.version || 'unknown',
          },
        };
      } else {
        return {
          service: 'PocketBase',
          status: 'unhealthy', 
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - start;
      return {
        service: 'PocketBase',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async checkGraphQLServer(): Promise<HealthCheckResult> {
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
          status: data.status === 'OK' ? 'healthy' : 'unhealthy',
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
          status: 'unhealthy',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - start;
      return {
        service: 'GraphQL Server',
        status: 'unhealthy',
        responseTime,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async checkGraphQLSchema(): Promise<HealthCheckResult> {
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

  async runAllChecks(): Promise<HealthCheckResult[]> {
    console.log('🔍 开始系统健康检查...\n');
    
    const checks = [
      this.checkPocketBase(),
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
          status: 'unknown' as const,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        };
      }
    });
  }

  printResults(results: HealthCheckResult[]): void {
    console.log('📊 健康检查结果:');
    console.log('================');
    
    let healthyCount = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    
    results.forEach((result) => {
      const statusIcon = result.status === 'healthy' ? '✅' : 
                        result.status === 'unhealthy' ? '❌' : '❓';
      
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
}

// 主函数
async function main(): Promise<void> {
  const checker = new HealthChecker();
  
  try {
    const results = await checker.runAllChecks();
    checker.printResults(results);
  } catch (error) {
    console.error('❌ 健康检查过程中发生错误:', error);
    Deno.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.main) {
  main();
} 