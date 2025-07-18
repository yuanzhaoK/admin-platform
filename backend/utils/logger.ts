// 日志工具
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  error?: Error;
  duration?: number;
}

type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize: number;
  maxFiles: number;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: "info",
      enableConsole: true,
      enableFile: false,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      ...config,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error", "fatal"];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, error, duration } = entry;
    
    let formatted = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (duration !== undefined) {
      formatted += ` (${duration}ms)`;
    }
    
    if (context) {
      formatted += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formatted += ` | Error: ${error.message}\n${error.stack}`;
    }
    
    return formatted;
  }

  private log(level: LogLevel, message: string, context?: any, error?: Error, duration?: number) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      duration,
    };

    const formattedMessage = this.formatMessage(entry);

    if (this.config.enableConsole) {
      console.log(formattedMessage);
    }

    if (this.config.enableFile && this.config.filePath) {
      this.writeToFile(formattedMessage);
    }
  }

  private writeToFile(message: string) {
    // 简化的文件写入实现
    // 在实际应用中，应该使用更完善的日志轮转机制
    try {
      // 这里使用Deno的文件系统API
      // 由于环境限制，这里只是示例
      console.log("Writing to file:", message);
    } catch (error) {
      console.error("Failed to write log to file:", error);
    }
  }

  // 日志方法
  debug(message: string, context?: any) {
    this.log("debug", message, context);
  }

  info(message: string, context?: any) {
    this.log("info", message, context);
  }

  warn(message: string, context?: any, error?: Error) {
    this.log("warn", message, context, error);
  }

  error(message: string, error?: Error, context?: any) {
    this.log("error", message, context, error);
  }

  fatal(message: string, error?: Error, context?: any) {
    this.log("fatal", message, context, error);
  }

  // 性能监控
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`${label} completed`, { duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed`, error as Error, { duration });
      throw error;
    }
  }

  // 数据库查询日志
  logQuery(query: string, params?: any[], duration?: number) {
    this.info("Database query", { query, params, duration });
  }

  // API请求日志
  logRequest(method: string, url: string, status: number, duration: number, ip?: string) {
    this.info("API request", { method, url, status, duration, ip });
  }

  // 错误详情日志
  logError(error: Error, context?: any) {
    this.error("Application error", error, context);
  }

  // 安全事件日志
  logSecurity(event: string, details: any) {
    this.warn("Security event", { event, details });
  }

  // 性能指标
  logPerformance(metric: string, value: number, context?: any) {
    this.info("Performance metric", { metric, value, context });
  }

  // 获取日志统计
  getStats() {
    return {
      level: this.config.level,
      enableConsole: this.config.enableConsole,
      enableFile: this.config.enableFile,
    };
  }
}

// 创建全局日志实例
export const logger = new Logger({
  level: "info",
  enableConsole: true,
  enableFile: false,
});

// 创建不同场景的日志实例
export const apiLogger = new Logger({
  level: "info",
  enableConsole: true,
  enableFile: false,
});

export const dbLogger = new Logger({
  level: "debug",
  enableConsole: true,
  enableFile: false,
});

export const securityLogger = new Logger({
  level: "warn",
  enableConsole: true,
  enableFile: false,
});

export const performanceLogger = new Logger({
  level: "info",
  enableConsole: true,
  enableFile: false,
});
