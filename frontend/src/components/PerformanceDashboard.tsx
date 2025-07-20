"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { performanceMonitor } from '@/lib/performance';
import { frontendCache } from '@/lib/cache';
import { logger } from '@/lib/logger';
import { 
  Activity, 
  AlertCircle,
  BarChart3, 
  Clock, 
  Database, 
  Download, 
  Eye, 
  Gauge, 
  MemoryStick,
  Network,
  RefreshCw,
  TrendingUp,
  Zap
} from 'lucide-react';

interface PerformanceStats {
  webVitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
  };
  apiCalls: {
    total: number;
    avgTime: number;
    slowCalls: number;
  };
  components: {
    total: number;
    avgRenderTime: number;
    slowRenders: number;
  };
  cache: {
    hitRate: number;
    totalKeys: number;
    memoryUsage: number;
  };
  logs: {
    totalLogs: number;
    errorRate: number;
    logsByLevel: Record<string, number>;
  };
}

export default function PerformanceDashboard() {
  const [stats, setStats] = React.useState<PerformanceStats | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    // 只在开发环境或者特定条件下显示
    const shouldShow = 
      process.env.NODE_ENV === 'development' || 
      window.location.search.includes('perf=true') ||
      localStorage.getItem('showPerformanceDashboard') === 'true';
    
    setIsVisible(shouldShow);
    
    if (shouldShow) {
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    setRefreshing(true);
    
    try {
      const perfReport = performanceMonitor.getPerformanceReport();
      const cacheStats = frontendCache.getStats();
      const logStats = logger.getStats();

      const newStats: PerformanceStats = {
        webVitals: {
          FCP: perfReport.FCP,
          LCP: perfReport.LCP,
          FID: perfReport.FID,
          CLS: perfReport.CLS,
        },
        apiCalls: {
          total: perfReport.apiCalls.length,
          avgTime: perfReport.summary.avgApiCallTime,
          slowCalls: perfReport.summary.slowApiCalls,
        },
        components: {
          total: perfReport.componentRenders.length,
          avgRenderTime: perfReport.summary.avgComponentRenderTime,
          slowRenders: perfReport.summary.slowComponentRenders,
        },
        cache: {
          hitRate: cacheStats.hitRate,
          totalKeys: cacheStats.totalKeys,
          memoryUsage: cacheStats.memoryUsage,
        },
        logs: {
          totalLogs: logStats.totalLogs,
          errorRate: logStats.logsByLevel.error ? 
            (logStats.logsByLevel.error / logStats.totalLogs) * 100 : 0,
          logsByLevel: logStats.logsByLevel,
        },
      };

      setStats(newStats);
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getScoreColor = (score: 'good' | 'needs-improvement' | 'poor') => {
    switch (score) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-100';
      case 'poor': return 'text-red-600 bg-red-100';
    }
  };

  const getWebVitalScore = (metric: string, value?: number) => {
    if (!value) return 'good';
    
    switch (metric) {
      case 'FCP':
        return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
      case 'LCP':
        return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
      case 'FID':
        return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
      case 'CLS':
        return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
      default:
        return 'good';
    }
  };

  const exportData = () => {
    const data = {
      performance: performanceMonitor.exportMetrics(),
      cache: frontendCache.getStats(),
      logs: logger.exportLogs(),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isVisible || !stats) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg"
        >
          <Activity className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-white border rounded-lg shadow-2xl max-h-[90vh] overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          性能监控面板
        </h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={loadStats}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={() => setIsVisible(false)} variant="outline" size="sm">
            ×
          </Button>
        </div>
      </div>

      <div className="overflow-auto max-h-[calc(90vh-80px)]">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mx-4 mt-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="webvitals">Web Vitals</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="cache">缓存</TabsTrigger>
            <TabsTrigger value="logs">日志</TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="overview">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">API 调用</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{stats.apiCalls.total}</div>
                    <div className="text-sm text-gray-500">
                      平均 {formatTime(stats.apiCalls.avgTime)}
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-600">组件渲染</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">{stats.components.total}</div>
                    <div className="text-sm text-gray-500">
                      平均 {formatTime(stats.components.avgRenderTime)}
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">缓存命中率</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">
                      {(stats.cache.hitRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">
                      {stats.cache.totalKeys} 个键
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2">
                    <MemoryStick className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-600">内存使用</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold">
                      {formatBytes(stats.cache.memoryUsage)}
                    </div>
                    <div className="text-sm text-gray-500">缓存内存</div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="webvitals">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.webVitals).map(([key, value]) => {
                  const score = getWebVitalScore(key, value);
                  return (
                    <Card key={key} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{key}</span>
                        <Badge className={getScoreColor(score)}>
                          {score === 'good' ? '优秀' : score === 'needs-improvement' ? '需要改进' : '差'}
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="text-2xl font-bold">
                          {value ? formatTime(value) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {key === 'FCP' && 'First Contentful Paint'}
                          {key === 'LCP' && 'Largest Contentful Paint'}
                          {key === 'FID' && 'First Input Delay'}
                          {key === 'CLS' && 'Cumulative Layout Shift'}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="api">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">总请求数</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {stats.apiCalls.total}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">平均响应时间</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {formatTime(stats.apiCalls.avgTime)}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">慢请求</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {stats.apiCalls.slowCalls}
                    </div>
                    <div className="text-xs text-gray-500">
                      > 1秒的请求
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cache">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">命中率</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {(stats.cache.hitRate * 100).toFixed(1)}%
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">缓存键数</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {stats.cache.totalKeys}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">内存使用</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {formatBytes(stats.cache.memoryUsage)}
                    </div>
                  </Card>
                </div>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">缓存配置建议</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    {stats.cache.hitRate < 0.5 && (
                      <div className="text-red-600">
                        • 缓存命中率较低，考虑增加缓存时间或优化缓存策略
                      </div>
                    )}
                    {stats.cache.memoryUsage > 25 * 1024 * 1024 && (
                      <div className="text-yellow-600">
                        • 内存使用较高，考虑清理不必要的缓存
                      </div>
                    )}
                    <div className="text-green-600">
                      • 当前缓存系统运行正常
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="logs">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">总日志数</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {stats.logs.totalLogs}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">错误率</span>
                    </div>
                    <div className="text-2xl font-bold mt-2">
                      {stats.logs.errorRate.toFixed(1)}%
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">状态</span>
                    </div>
                    <div className="mt-2">
                      <Badge className={stats.logs.errorRate < 5 ? getScoreColor('good') : getScoreColor('poor')}>
                        {stats.logs.errorRate < 5 ? '健康' : '需要关注'}
                      </Badge>
                    </div>
                  </Card>
                </div>

                <Card className="p-4">
                  <h3 className="font-medium mb-2">日志级别分布</h3>
                  <div className="space-y-2">
                    {Object.entries(stats.logs.logsByLevel).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="capitalize text-sm">{level}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
