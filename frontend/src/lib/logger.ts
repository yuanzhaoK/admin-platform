/**
 * 前端日志系统
 * 包括错误监控、性能监控、用户行为跟踪等
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  data?: any;
  context?: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
  };
  stackTrace?: string;
  performance?: {
    memory?: any;
    timing?: any;
    navigation?: any;
  };
}

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  errorBoundary?: string;
  errorInfo?: any;
}

interface UserAction {
  type: "click" | "navigate" | "form_submit" | "api_call" | "error" | "custom";
  element?: string;
  page: string;
  timestamp: number;
  data?: any;
}

class FrontendLogger {
  private logs: LogEntry[] = [];
  private userActions: UserAction[] = [];
  private sessionId: string;
  private userId?: string;
  private maxLogs = 1000;
  private maxUserActions = 500;

  // 配置
  private config = {
    enableConsoleOutput: process.env.NODE_ENV === "development",
    enableRemoteLogging: process.env.NODE_ENV === "production",
    enableUserTracking: true,
    enablePerformanceTracking: true,
    enableErrorReporting: true,
    logLevels: ["debug", "info", "warn", "error", "fatal"] as LogLevel[],
    batchSize: 10,
    flushInterval: 30000, // 30秒
    remoteEndpoint: "/api/logs",
  };

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupErrorHandlers();
    this.setupPerformanceTracking();
    this.setupUserActionTracking();

    // 定期发送日志到服务器
    if (this.config.enableRemoteLogging) {
      setInterval(() => this.flush(), this.config.flushInterval);
    }

    // 页面卸载时发送剩余日志
    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", () => this.flush());
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.flush();
        }
      });
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupErrorHandlers(): void {
    if (typeof window === "undefined") return;

    // 全局错误处理
    window.addEventListener("error", (event) => {
      this.error("Global Error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
      });
    });

    // Promise 错误处理
    window.addEventListener("unhandledrejection", (event) => {
      this.error("Unhandled Promise Rejection", {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });

    // React 错误边界错误
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // 检测是否是 React 错误
      if (args[0] && args[0].includes && args[0].includes("React")) {
        this.error("React Error", { args });
      }
      originalConsoleError.apply(console, args);
    };
  }

  private setupPerformanceTracking(): void {
    if (
      !this.config.enablePerformanceTracking || typeof window === "undefined"
    ) return;

    // 页面加载性能
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType(
          "navigation",
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType("paint");

        this.info("Page Load Performance", {
          navigation: {
            domContentLoaded: navigation.domContentLoadedEventEnd -
              navigation.navigationStart,
            loadComplete: navigation.loadEventEnd - navigation.navigationStart,
            firstByte: navigation.responseStart - navigation.navigationStart,
            domInteractive: navigation.domInteractive -
              navigation.navigationStart,
          },
          paint: paint.reduce((acc, entry) => {
            acc[entry.name] = entry.startTime;
            return acc;
          }, {} as any),
          memory: (performance as any).memory
            ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
            }
            : null,
        });
      }, 1000);
    });
  }

  private setupUserActionTracking(): void {
    if (!this.config.enableUserTracking || typeof window === "undefined") {
      return;
    }

    // 点击事件跟踪
    document.addEventListener("click", (event) => {
      const target = event.target as Element;
      const element = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;

      this.trackUserAction("click", {
        element,
        className,
        id,
        text: target.textContent?.slice(0, 100),
      });
    }, { passive: true });

    // 导航跟踪
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      logger.trackUserAction("navigate", {
        type: "pushState",
        url: window.location.href,
      });
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      logger.trackUserAction("navigate", {
        type: "replaceState",
        url: window.location.href,
      });
    };

    window.addEventListener("popstate", () => {
      this.trackUserAction("navigate", {
        type: "popstate",
        url: window.location.href,
      });
    });
  }

  private getContext(): LogEntry["context"] {
    if (typeof window === "undefined") {
      return {
        url: "",
        userAgent: "",
      };
    }

    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
    };
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
      context: this.getContext(),
    };

    // 添加错误堆栈信息
    if (level === "error" || level === "fatal") {
      const error = new Error();
      entry.stackTrace = error.stack;
    }

    // 添加性能信息
    if (
      this.config.enablePerformanceTracking && typeof window !== "undefined"
    ) {
      entry.performance = {
        memory: (performance as any).memory
          ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
          }
          : null,
        timing: performance.now(),
      };
    }

    return entry;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 控制台输出
    if (this.config.enableConsoleOutput) {
      const consoleMethod = entry.level === "debug" ? "log" : entry.level;
      if (console[consoleMethod]) {
        console[consoleMethod](
          `[${entry.level.toUpperCase()}] ${entry.message}`,
          entry.data || "",
        );
      }
    }

    // 批量发送到服务器
    if (
      this.config.enableRemoteLogging &&
      this.logs.length >= this.config.batchSize
    ) {
      this.flush();
    }
  }

  // 日志记录方法
  debug(message: string, data?: any): void {
    if (this.config.logLevels.includes("debug")) {
      this.addLog(this.createLogEntry("debug", message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.config.logLevels.includes("info")) {
      this.addLog(this.createLogEntry("info", message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.config.logLevels.includes("warn")) {
      this.addLog(this.createLogEntry("warn", message, data));
    }
  }

  error(message: string, data?: any): void {
    if (this.config.logLevels.includes("error")) {
      this.addLog(this.createLogEntry("error", message, data));
    }
  }

  fatal(message: string, data?: any): void {
    if (this.config.logLevels.includes("fatal")) {
      this.addLog(this.createLogEntry("fatal", message, data));
      this.flush(); // 立即发送致命错误
    }
  }

  // React 错误边界专用方法
  logReactError(error: Error, errorInfo: ErrorInfo): void {
    this.error("React Error Boundary", {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo,
    });
  }

  // API 错误记录
  logApiError(
    url: string,
    method: string,
    status: number,
    response?: any,
  ): void {
    this.error("API Error", {
      url,
      method,
      status,
      response,
      timestamp: Date.now(),
    });
  }

  // 用户行为跟踪
  trackUserAction(type: UserAction["type"], data?: any): void {
    if (!this.config.enableUserTracking) return;

    const action: UserAction = {
      type,
      page: window.location.pathname,
      timestamp: Date.now(),
      data,
    };

    this.userActions.push(action);

    // 限制用户行为记录数量
    if (this.userActions.length > this.maxUserActions) {
      this.userActions = this.userActions.slice(-this.maxUserActions);
    }

    // 记录到日志
    this.debug("User Action", action);
  }

  // 设置用户ID
  setUserId(userId: string): void {
    this.userId = userId;
  }

  // 设置上下文信息
  setContext(context: Partial<LogEntry["context"]>): void {
    if (this.logs.length > 0) {
      const lastLog = this.logs[this.logs.length - 1];
      lastLog.context = { ...lastLog.context, ...context };
    }
  }

  // 获取日志统计
  getStats() {
    const logsByLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<LogLevel, number>);

    const actionsByType = this.userActions.reduce((acc, action) => {
      acc[action.type] = (acc[action.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLogs: this.logs.length,
      logsByLevel,
      totalUserActions: this.userActions.length,
      actionsByType,
      sessionId: this.sessionId,
      userId: this.userId,
    };
  }

  // 导出日志
  exportLogs(): { logs: LogEntry[]; userActions: UserAction[]; stats: any } {
    return {
      logs: [...this.logs],
      userActions: [...this.userActions],
      stats: this.getStats(),
    };
  }

  // 清理日志
  clearLogs(): void {
    this.logs = [];
    this.userActions = [];
  }

  // 发送日志到服务器
  async flush(): Promise<void> {
    if (!this.config.enableRemoteLogging || this.logs.length === 0) return;

    try {
      const payload = {
        logs: [...this.logs],
        userActions: [...this.userActions],
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
      };

      // 使用 fetch 发送日志
      if (typeof fetch !== "undefined") {
        await fetch(this.config.remoteEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      } else {
        // 使用 sendBeacon 作为后备（页面卸载时）
        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            this.config.remoteEndpoint,
            JSON.stringify(payload),
          );
        }
      }

      // 清理已发送的日志
      this.clearLogs();
    } catch (error) {
      console.warn("Failed to send logs to server:", error);
    }
  }

  // 配置更新
  updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// 创建全局日志实例
export const logger = new FrontendLogger();

// React Error Boundary 组件使用的错误处理器
export function logReactError(error: Error, errorInfo: any): void {
  logger.logReactError(error, errorInfo);
}

// API 错误装饰器
export function logApiErrors(apiName: string) {
  return function <T extends (...args: any[]) => Promise<any>>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>,
  ) {
    const originalMethod = descriptor.value!;

    descriptor.value = (async function (this: any, ...args: any[]) {
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } catch (error) {
        logger.logApiError(
          apiName,
          propertyKey,
          error instanceof Response ? error.status : 0,
          error,
        );
        throw error;
      }
    }) as T;

    return descriptor;
  };
}

// 用户行为跟踪装饰器
export function trackUserAction(actionType: UserAction["type"]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      logger.trackUserAction(actionType, {
        method: propertyKey,
        args: args.length > 0 ? args : undefined,
      });
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

export default logger;
