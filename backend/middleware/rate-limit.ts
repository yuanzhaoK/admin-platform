// 速率限制中间件
interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  max: number; // 最大请求数
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface Context {
  request: {
    ip?: string;
    headers: Map<string, string>;
  };
  response: {
    status: number;
    headers: Map<string, string>;
    body: any;
  };
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每15分钟最多100个请求
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
};

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private getKey(ctx: Context): string {
    // 使用IP地址作为标识符
    const ip = ctx.request.ip || "unknown";
    return `rate_limit:${ip}`;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of Object.entries(this.store)) {
      if (now > data.resetTime) {
        delete this.store[key];
      }
    }
  }

  check(ctx: Context): {
    allowed: boolean;
    limit: number;
    remaining: number;
    resetTime: number;
  } {
    const key = this.getKey(ctx);
    const now = Date.now();

    this.cleanup();

    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.config.windowMs,
      };
    }

    const data = this.store[key];
    const remaining = Math.max(0, this.config.max - data.count);

    return {
      allowed: data.count < this.config.max,
      limit: this.config.max,
      remaining,
      resetTime: data.resetTime,
    };
  }

  increment(ctx: Context): void {
    const key = this.getKey(ctx);
    if (this.store[key]) {
      this.store[key].count++;
    }
  }

  reset(ctx: Context): void {
    const key = this.getKey(ctx);
    delete this.store[key];
  }

  getStats() {
    return {
      activeKeys: Object.keys(this.store).length,
      config: this.config,
    };
  }
}

// 创建不同的速率限制器实例
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // API接口限制更高
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5, // 登录/注册接口限制更严格
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 50, // 文件上传限制
});

// 速率限制中间件工厂
export function createRateLimitMiddleware(limiter: RateLimiter) {
  return async (ctx: Context, next: () => Promise<void>) => {
    const result = limiter.check(ctx);

    // 设置响应头
    ctx.response.headers.set("X-RateLimit-Limit", result.limit.toString());
    ctx.response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    ctx.response.headers.set("X-RateLimit-Reset", result.resetTime.toString());

    if (!result.allowed) {
      ctx.response.status = 429;
      ctx.response.body = {
        error: "Too Many Requests",
        message: "请求过于频繁，请稍后再试",
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
      };
      return;
    }

    limiter.increment(ctx);
    await next();
  };
}
