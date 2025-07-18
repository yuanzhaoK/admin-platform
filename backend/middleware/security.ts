// 安全中间件
interface SecurityHeaders {
  "X-Content-Type-Options": string;
  "X-Frame-Options": string;
  "X-XSS-Protection": string;
  "Strict-Transport-Security": string;
  "Content-Security-Policy": string;
  "Referrer-Policy": string;
  "Permissions-Policy": string;
}

interface Context {
  request: {
    method: string;
    url: string;
    headers: Map<string, string>;
  };
  response: {
    status: number;
    headers: Map<string, string>;
    body: any;
  };
}

// 安全头部配置
const securityHeaders: SecurityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
};

// CORS配置
interface CorsConfig {
  origin: string | string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
}

const corsConfig: CorsConfig = {
  origin: ["http://localhost:3000", "https://admin-platform.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Cache-Control", "Pragma"],
  exposedHeaders: ["X-Total-Count", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
  credentials: true,
  maxAge: 86400, // 24小时
};

// 输入验证和清理
class InputValidator {
  // SQL注入检测
  static detectSQLInjection(input: string): boolean {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|#|\/\*|\*\/)/,
      /(\b(OR|AND)\b\s*\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\b\s*['"]\s*=\s*['"])/i,
    ];

    return sqlInjectionPatterns.some(pattern => pattern.test(input));
  }

  // XSS检测
  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // 清理输入
  static sanitizeInput(input: any): any {
    if (typeof input === "string") {
      // 移除潜在的恶意代码
      let sanitized = input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .trim();

      // 限制长度
      if (sanitized.length > 10000) {
        sanitized = sanitized.substring(0, 10000);
      }

      return sanitized;
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === "object" && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  // 验证文件上传
  static validateFileUpload(file: {
    name: string;
    size: number;
    type: string;
  }): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
    ];

    if (file.size > maxSize) {
      return { valid: false, error: "文件大小超过限制（最大10MB）" };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "不支持的文件类型" };
    }

    // 检查文件名
    if (this.detectXSS(file.name) || this.detectSQLInjection(file.name)) {
      return { valid: false, error: "文件名包含非法字符" };
    }

    return { valid: true };
  }
}

// 安全中间件
export function securityHeadersMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    await next();

    // 添加安全头部
    for (const [header, value] of Object.entries(securityHeaders)) {
      ctx.response.headers.set(header, value);
    }
  };
}

// CORS中间件
export function corsMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    const origin = ctx.request.headers.get("origin");

    // 处理预检请求
    if (ctx.request.method === "OPTIONS") {
      ctx.response.status = 204;
      
      // 设置CORS头部
      if (origin && (corsConfig.origin === "*" || 
          (Array.isArray(corsConfig.origin) && corsConfig.origin.includes(origin)))) {
        ctx.response.headers.set("Access-Control-Allow-Origin", origin);
      }
      
      ctx.response.headers.set("Access-Control-Allow-Methods", corsConfig.methods.join(", "));
      ctx.response.headers.set("Access-Control-Allow-Headers", corsConfig.allowedHeaders.join(", "));
      ctx.response.headers.set("Access-Control-Expose-Headers", corsConfig.exposedHeaders.join(", "));
      ctx.response.headers.set("Access-Control-Allow-Credentials", corsConfig.credentials.toString());
      ctx.response.headers.set("Access-Control-Max-Age", corsConfig.maxAge.toString());
      
      return;
    }

    await next();

    // 设置CORS头部
    if (origin && (corsConfig.origin === "*" || 
        (Array.isArray(corsConfig.origin) && corsConfig.origin.includes(origin)))) {
      ctx.response.headers.set("Access-Control-Allow-Origin", origin);
      ctx.response.headers.set("Access-Control-Allow-Credentials", corsConfig.credentials.toString());
    }
  };
}

// 输入验证中间件
export function inputValidationMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    // 验证查询参数
    const url = new URL(ctx.request.url, "http://localhost");
    const params = Object.fromEntries(url.searchParams.entries());
    
    for (const [key, value] of Object.entries(params)) {
      if (InputValidator.detectSQLInjection(value) || InputValidator.detectXSS(value)) {
        ctx.response.status = 400;
        ctx.response.body = {
          error: "Bad Request",
          message: `参数 ${key} 包含非法字符`,
        };
        return;
      }
    }

    // 验证请求体
    if (ctx.request.method !== "GET" && ctx.request.method !== "HEAD") {
      try {
        // 这里假设请求体已经被解析
        const body = ctx.request as any;
        if (body && typeof body === "object") {
          const sanitized = InputValidator.sanitizeInput(body);
          // 更新请求体
          Object.assign(ctx.request, sanitized);
        }
      } catch (error) {
        // 忽略解析错误
      }
    }

    await next();
  };
}

// 日志中间件
export function loggingMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    const start = Date.now();
    const { method, url } = ctx.request;

    await next();

    const duration = Date.now() - start;
    const { status } = ctx.response;

    console.log(`${method} ${url} - ${status} - ${duration}ms`);
  };
}

// 错误处理中间件
export function errorHandlerMiddleware() {
  return async (ctx: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      console.error("Unhandled error:", error);
      
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Internal Server Error",
        message: "服务器内部错误",
        timestamp: new Date().toISOString(),
      };
    }
  };
}

// 导出所有中间件
export const securityMiddleware = {
  securityHeaders: securityHeadersMiddleware,
  cors: corsMiddleware,
  inputValidation: inputValidationMiddleware,
  logging: loggingMiddleware,
  errorHandler: errorHandlerMiddleware,
  validator: InputValidator,
};
