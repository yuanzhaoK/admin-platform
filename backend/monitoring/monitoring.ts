/**
 * 监控和日志系统
 * @description 提供系统性能监控、日志记录、错误追踪功能
 */

import { redisCache } from '../cache/redis-cache.ts';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: string;
  requestId?: string;
  service: string;
  component: string;
}

export interface MetricEntry {
  timestamp: Date;
  name: string;
  value: number;
  tags?: Record<string, string>;
  unit?: string;
}

export interface SystemMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    usage: number;
  };
  requests: {
    total: number;
    perSecond: number;
    avgResponseTime: number;
    errorRate: number;
  };
  database: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    operations: number;
  };
}

class MonitoringService {
  private logs: LogEntry[] = [];
  private metrics: MetricEntry[] = [];
  private alertRules: AlertRule[] = [];
  private maxLogs = 10000;
  private maxMetrics = 50000;
  private logLevel = LogLevel.INFO;

  constructor() {
    this.initializeMetricsCollection();
  }

  /**
   * 记录日志
   */
  log(
    level: LogLevel, 
    message: string, 
    context?: any, 
    component: string = 'general',
    userId?: string,
    requestId?: string
  ): void {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      userId,
      requestId,
      service: 'admin-platform',
      component
    };

    this.logs.push(entry);
    
    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 立即输出到控制台
    this.outputToConsole(entry);

    // 异步持久化到Redis（可选）
    this.persistLogToRedis(entry).catch(console.error);

    // 检查告警规则
    this.checkAlerts(entry);
  }

  debug(message: string, context?: any, component?: string, userId?: string, requestId?: string): void {
    this.log(LogLevel.DEBUG, message, context, component, userId, requestId);
  }

  info(message: string, context?: any, component?: string, userId?: string, requestId?: string): void {
    this.log(LogLevel.INFO, message, context, component, userId, requestId);
  }

  warn(message: string, context?: any, component?: string, userId?: string, requestId?: string): void {
    this.log(LogLevel.WARN, message, context, component, userId, requestId);
  }

  error(message: string, context?: any, component?: string, userId?: string, requestId?: string): void {
    this.log(LogLevel.ERROR, message, context, component, userId, requestId);
  }

  fatal(message: string, context?: any, component?: string, userId?: string, requestId?: string): void {
    this.log(LogLevel.FATAL, message, context, component, userId, requestId);
  }

  /**
   * 记录指标
   */
  recordMetric(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    const entry: MetricEntry = {
      timestamp: new Date(),
      name,
      value,
      tags,
      unit
    };

    this.metrics.push(entry);

    // 保持指标数量在限制内
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // 异步持久化到Redis
    this.persistMetricToRedis(entry).catch(console.error);
  }

  /**
   * 获取系统指标
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const memoryUsage = Deno.memoryUsage();
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // 计算最近一分钟的请求指标
    const recentMetrics = this.metrics.filter(m => 
      m.timestamp.getTime() >= oneMinuteAgo && 
      m.name.startsWith('request.')
    );

    const requestCount = recentMetrics.filter(m => m.name === 'request.count').length;
    const responseTimeMetrics = recentMetrics.filter(m => m.name === 'request.duration');
    const errorMetrics = recentMetrics.filter(m => m.name === 'request.error').length;

    const avgResponseTime = responseTimeMetrics.length > 0
      ? responseTimeMetrics.reduce((sum, m) => sum + m.value, 0) / responseTimeMetrics.length
      : 0;

    const errorRate = requestCount > 0 ? (errorMetrics / requestCount) * 100 : 0;

    // 获取缓存指标
    const cacheMetrics = await this.getCacheMetrics();
    
    // 获取数据库指标
    const dbMetrics = await this.getDatabaseMetrics();

    return {
      cpu: {
        usage: 0, // Deno不直接提供CPU使用率
        loadAverage: []
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        usage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      },
      requests: {
        total: requestCount,
        perSecond: requestCount / 60,
        avgResponseTime,
        errorRate
      },
      database: dbMetrics,
      cache: cacheMetrics
    };
  }

  /**
   * 获取日志
   */
  getLogs(
    level?: LogLevel,
    component?: string,
    limit: number = 100,
    offset: number = 0
  ): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }

    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  /**
   * 获取指标
   */
  getMetrics(
    name?: string,
    tags?: Record<string, string>,
    from?: Date,
    to?: Date,
    limit: number = 1000
  ): MetricEntry[] {
    let filteredMetrics = this.metrics;

    if (name) {
      filteredMetrics = filteredMetrics.filter(metric => metric.name === name);
    }

    if (tags) {
      filteredMetrics = filteredMetrics.filter(metric => {
        if (!metric.tags) return false;
        return Object.entries(tags).every(([key, value]) => 
          metric.tags![key] === value
        );
      });
    }

    if (from) {
      filteredMetrics = filteredMetrics.filter(metric => 
        metric.timestamp >= from
      );
    }

    if (to) {
      filteredMetrics = filteredMetrics.filter(metric => 
        metric.timestamp <= to
      );
    }

    return filteredMetrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * 设置日志级别
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * 添加告警规则
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  /**
   * 移除告警规则
   */
  removeAlertRule(id: string): void {
    this.alertRules = this.alertRules.filter(rule => rule.id !== id);
  }

  private outputToConsole(entry: LogEntry): void {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const levelColors = ['\x1b[36m', '\x1b[32m', '\x1b[33m', '\x1b[31m', '\x1b[35m'];
    const resetColor = '\x1b[0m';
    
    const timestamp = entry.timestamp.toISOString();
    const level = levelNames[entry.level];
    const color = levelColors[entry.level];
    
    let logString = `${color}[${timestamp}] ${level}${resetColor} [${entry.component}] ${entry.message}`;
    
    if (entry.requestId) {
      logString += ` (req: ${entry.requestId})`;
    }
    
    if (entry.userId) {
      logString += ` (user: ${entry.userId})`;
    }

    console.log(logString);
    
    if (entry.context) {
      console.log('Context:', entry.context);
    }
  }

  private async persistLogToRedis(entry: LogEntry): Promise<void> {
    try {
      const key = `logs:${entry.timestamp.toISOString().split('T')[0]}`;
      const logData = JSON.stringify(entry);
      
      // 使用Redis列表存储当日日志
      await redisCache.getClient()?.lpush(key, logData);
      
      // 设置过期时间为30天
      await redisCache.getClient()?.expire(key, 30 * 24 * 60 * 60);
    } catch (error) {
      console.warn('Failed to persist log to Redis:', error);
    }
  }

  private async persistMetricToRedis(entry: MetricEntry): Promise<void> {
    try {
      const key = `metrics:${entry.name}:${entry.timestamp.toISOString().split('T')[0]}`;
      const metricData = JSON.stringify(entry);
      
      // 使用Redis列表存储当日指标
      await redisCache.getClient()?.lpush(key, metricData);
      
      // 设置过期时间为7天
      await redisCache.getClient()?.expire(key, 7 * 24 * 60 * 60);
    } catch (error) {
      console.warn('Failed to persist metric to Redis:', error);
    }
  }

  private async getCacheMetrics(): Promise<any> {
    try {
      // 这里需要从查询优化器获取缓存指标
      const { queryOptimizer } = await import('../database/query-optimizer.ts');
      const metrics = queryOptimizer.getMetrics();
      
      const totalOperations = metrics.cacheHits + metrics.cacheMisses;
      const hitRate = totalOperations > 0 ? (metrics.cacheHits / totalOperations) * 100 : 0;
      const missRate = totalOperations > 0 ? (metrics.cacheMisses / totalOperations) * 100 : 0;

      return {
        hitRate,
        missRate,
        operations: totalOperations
      };
    } catch (error) {
      return {
        hitRate: 0,
        missRate: 0,
        operations: 0
      };
    }
  }

  private async getDatabaseMetrics(): Promise<any> {
    try {
      const { queryOptimizer } = await import('../database/query-optimizer.ts');
      const metrics = queryOptimizer.getMetrics();

      return {
        connections: 1, // PocketBase单连接
        queryTime: metrics.avgQueryTime,
        slowQueries: metrics.slowQueries.length
      };
    } catch (error) {
      return {
        connections: 0,
        queryTime: 0,
        slowQueries: 0
      };
    }
  }

  private initializeMetricsCollection(): void {
    // 每30秒收集一次系统指标
    setInterval(async () => {
      try {
        const metrics = await this.getSystemMetrics();
        
        // 记录内存使用率
        this.recordMetric('system.memory.usage', metrics.memory.usage, undefined, '%');
        this.recordMetric('system.memory.used', metrics.memory.used, undefined, 'bytes');
        
        // 记录请求指标
        this.recordMetric('system.requests.total', metrics.requests.total);
        this.recordMetric('system.requests.per_second', metrics.requests.perSecond);
        this.recordMetric('system.requests.avg_response_time', metrics.requests.avgResponseTime, undefined, 'ms');
        this.recordMetric('system.requests.error_rate', metrics.requests.errorRate, undefined, '%');
        
        // 记录缓存指标
        this.recordMetric('system.cache.hit_rate', metrics.cache.hitRate, undefined, '%');
        this.recordMetric('system.cache.operations', metrics.cache.operations);
        
        // 记录数据库指标
        this.recordMetric('system.database.avg_query_time', metrics.database.queryTime, undefined, 'ms');
        this.recordMetric('system.database.slow_queries', metrics.database.slowQueries);
        
      } catch (error) {
        this.error('Failed to collect system metrics', { error: error.message }, 'monitoring');
      }
    }, 30000);
  }

  private checkAlerts(entry: LogEntry): void {
    this.alertRules.forEach(rule => {
      if (this.shouldTriggerAlert(rule, entry)) {
        this.triggerAlert(rule, entry);
      }
    });
  }

  private shouldTriggerAlert(rule: AlertRule, entry: LogEntry): boolean {
    // 检查日志级别
    if (rule.condition.logLevel && entry.level < rule.condition.logLevel) {
      return false;
    }

    // 检查组件
    if (rule.condition.component && entry.component !== rule.condition.component) {
      return false;
    }

    // 检查消息模式
    if (rule.condition.messagePattern) {
      const regex = new RegExp(rule.condition.messagePattern);
      if (!regex.test(entry.message)) {
        return false;
      }
    }

    return true;
  }

  private triggerAlert(rule: AlertRule, entry: LogEntry): void {
    this.warn('Alert triggered', {
      rule: rule.name,
      entry: entry.message,
      component: entry.component,
      level: LogLevel[entry.level]
    }, 'monitoring');

    // 这里可以添加实际的告警通知逻辑
    // 比如发送邮件、Webhook通知等
  }
}

interface AlertRule {
  id: string;
  name: string;
  condition: {
    logLevel?: LogLevel;
    component?: string;
    messagePattern?: string;
    metricThreshold?: {
      name: string;
      operator: '>' | '<' | '=' | '>=' | '<=';
      value: number;
    };
  };
  actions: {
    email?: string[];
    webhook?: string;
    slack?: string;
  };
}

// 全局监控实例
export const monitoring = new MonitoringService();

// 请求追踪中间件
export function requestTracking(requestId: string, userId?: string) {
  return {
    start: (operation: string) => {
      monitoring.recordMetric('request.count', 1, { operation });
      monitoring.info(`Request started: ${operation}`, undefined, 'request', userId, requestId);
      return performance.now();
    },
    
    end: (startTime: number, operation: string, success: boolean = true) => {
      const duration = performance.now() - startTime;
      monitoring.recordMetric('request.duration', duration, { operation }, 'ms');
      
      if (success) {
        monitoring.info(`Request completed: ${operation} (${duration.toFixed(2)}ms)`, undefined, 'request', userId, requestId);
      } else {
        monitoring.recordMetric('request.error', 1, { operation });
        monitoring.error(`Request failed: ${operation} (${duration.toFixed(2)}ms)`, undefined, 'request', userId, requestId);
      }
    },
    
    error: (startTime: number, operation: string, error: any) => {
      const duration = performance.now() - startTime;
      monitoring.recordMetric('request.duration', duration, { operation }, 'ms');
      monitoring.recordMetric('request.error', 1, { operation });
      monitoring.error(`Request error: ${operation}`, { error: error.message, duration }, 'request', userId, requestId);
    }
  };
}
