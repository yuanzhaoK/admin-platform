/**
 * 前端性能监控工具
 * 用于监控页面加载、API请求、组件渲染等性能指标
 */

interface PerformanceEntry {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  type: 'navigation' | 'api' | 'component' | 'interaction';
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
  // 页面性能指标
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
  
  // 自定义指标
  apiCalls: PerformanceEntry[];
  componentRenders: PerformanceEntry[];
  userInteractions: PerformanceEntry[];
  navigation: PerformanceEntry[];
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    apiCalls: [],
    componentRenders: [],
    userInteractions: [],
    navigation: []
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.measureWebVitals();
    }
  }

  private initializeObservers() {
    // 监控导航性能
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.recordNavigation({
                name: 'page-load',
                startTime: navEntry.navigationStart,
                endTime: navEntry.loadEventEnd,
                duration: navEntry.loadEventEnd - navEntry.navigationStart,
                type: 'navigation',
                metadata: {
                  domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
                  firstByte: navEntry.responseStart - navEntry.navigationStart,
                  domComplete: navEntry.domComplete - navEntry.navigationStart
                }
              });
            }
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (e) {
        console.warn('Navigation timing observer not supported:', e);
      }

      // 监控资源加载性能
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
              const resource = entry as PerformanceResourceTiming;
              // 只记录重要资源
              if (resource.name.includes('/api/') || 
                  resource.name.includes('.js') || 
                  resource.name.includes('.css')) {
                this.recordApiCall({
                  name: resource.name,
                  startTime: resource.startTime,
                  endTime: resource.responseEnd,
                  duration: resource.duration,
                  type: 'api',
                  metadata: {
                    size: resource.transferSize || 0,
                    cached: resource.transferSize === 0,
                    resourceType: this.getResourceType(resource.name)
                  }
                });
              }
            }
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing observer not supported:', e);
      }
    }
  }

  private measureWebVitals() {
    // 测量 Web Vitals
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // First Contentful Paint
      try {
        const paintObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = entry.startTime;
            }
          }
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        console.warn('Paint timing observer not supported:', e);
      }

      // Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.LCP = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported:', e);
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.metrics.FID = entry.processingStart - entry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported:', e);
      }

      // Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as LayoutShift[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.CLS = clsValue;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported:', e);
      }
    }
  }

  private getResourceType(url: string): string {
    if (url.includes('/api/')) return 'api';
    if (url.endsWith('.js')) return 'script';
    if (url.endsWith('.css')) return 'style';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  // 记录 API 调用性能
  recordApiCall(entry: PerformanceEntry) {
    this.metrics.apiCalls.push(entry);
    
    // 检查慢 API 调用
    if (entry.duration > 1000) {
      console.warn(`Slow API call detected: ${entry.name} took ${entry.duration}ms`);
    }
  }

  // 记录组件渲染性能
  recordComponentRender(componentName: string, renderTime: number, metadata?: Record<string, any>) {
    const entry: PerformanceEntry = {
      name: componentName,
      startTime: performance.now() - renderTime,
      endTime: performance.now(),
      duration: renderTime,
      type: 'component',
      metadata
    };
    
    this.metrics.componentRenders.push(entry);

    // 检查慢组件渲染
    if (renderTime > 16) { // 超过一帧的时间
      console.warn(`Slow component render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  // 记录用户交互性能
  recordUserInteraction(interactionType: string, duration: number, target?: string) {
    const entry: PerformanceEntry = {
      name: interactionType,
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      type: 'interaction',
      metadata: { target }
    };
    
    this.metrics.userInteractions.push(entry);

    // 检查慢交互
    if (duration > 100) {
      console.warn(`Slow user interaction detected: ${interactionType} took ${duration}ms`);
    }
  }

  // 记录导航性能
  recordNavigation(entry: PerformanceEntry) {
    this.metrics.navigation.push(entry);
  }

  // 获取性能报告
  getPerformanceReport(): PerformanceMetrics & {
    summary: {
      avgApiCallTime: number;
      slowApiCalls: number;
      avgComponentRenderTime: number;
      slowComponentRenders: number;
      totalInteractions: number;
      webVitalsScore: 'good' | 'needs-improvement' | 'poor';
    }
  } {
    const avgApiCallTime = this.metrics.apiCalls.length > 0 
      ? this.metrics.apiCalls.reduce((sum, entry) => sum + entry.duration, 0) / this.metrics.apiCalls.length
      : 0;

    const slowApiCalls = this.metrics.apiCalls.filter(entry => entry.duration > 1000).length;

    const avgComponentRenderTime = this.metrics.componentRenders.length > 0
      ? this.metrics.componentRenders.reduce((sum, entry) => sum + entry.duration, 0) / this.metrics.componentRenders.length
      : 0;

    const slowComponentRenders = this.metrics.componentRenders.filter(entry => entry.duration > 16).length;

    const webVitalsScore = this.calculateWebVitalsScore();

    return {
      ...this.metrics,
      summary: {
        avgApiCallTime,
        slowApiCalls,
        avgComponentRenderTime,
        slowComponentRenders,
        totalInteractions: this.metrics.userInteractions.length,
        webVitalsScore
      }
    };
  }

  private calculateWebVitalsScore(): 'good' | 'needs-improvement' | 'poor' {
    let score = 0;
    let total = 0;

    // FCP 评分
    if (this.metrics.FCP !== undefined) {
      total++;
      if (this.metrics.FCP <= 1800) score++;
      else if (this.metrics.FCP <= 3000) score += 0.5;
    }

    // LCP 评分
    if (this.metrics.LCP !== undefined) {
      total++;
      if (this.metrics.LCP <= 2500) score++;
      else if (this.metrics.LCP <= 4000) score += 0.5;
    }

    // FID 评分
    if (this.metrics.FID !== undefined) {
      total++;
      if (this.metrics.FID <= 100) score++;
      else if (this.metrics.FID <= 300) score += 0.5;
    }

    // CLS 评分
    if (this.metrics.CLS !== undefined) {
      total++;
      if (this.metrics.CLS <= 0.1) score++;
      else if (this.metrics.CLS <= 0.25) score += 0.5;
    }

    if (total === 0) return 'good';

    const ratio = score / total;
    if (ratio >= 0.8) return 'good';
    if (ratio >= 0.5) return 'needs-improvement';
    return 'poor';
  }

  // 清理资源
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }

  // 导出性能数据
  exportMetrics() {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.getPerformanceReport()
    };

    return JSON.stringify(data, null, 2);
  }
}

// 创建全局实例
export const performanceMonitor = new PerformanceMonitor();

// React Hook 用于组件性能监控
export function useComponentPerformance(componentName: string) {
  const startTime = performance.now();

  return {
    recordRender: (metadata?: Record<string, any>) => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.recordComponentRender(componentName, renderTime, metadata);
    }
  };
}

// 装饰器用于 API 调用性能监控
export function measureApiCall(apiName: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = (async function (this: any, ...args: any[]) {
      const startTime = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const endTime = performance.now();
        
        performanceMonitor.recordApiCall({
          name: apiName,
          startTime,
          endTime,
          duration: endTime - startTime,
          type: 'api',
          metadata: {
            method: propertyKey,
            success: true
          }
        });

        return result;
      } catch (error) {
        const endTime = performance.now();
        
        performanceMonitor.recordApiCall({
          name: apiName,
          startTime,
          endTime,
          duration: endTime - startTime,
          type: 'api',
          metadata: {
            method: propertyKey,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          }
        });

        throw error;
      }
    }) as T;

    return descriptor;
  };
}

// 用户交互性能监控
export function measureUserInteraction(interactionType: string, callback: () => void | Promise<void>) {
  return async () => {
    const startTime = performance.now();
    try {
      await callback();
    } finally {
      const endTime = performance.now();
      performanceMonitor.recordUserInteraction(interactionType, endTime - startTime);
    }
  };
}

export default performanceMonitor;
