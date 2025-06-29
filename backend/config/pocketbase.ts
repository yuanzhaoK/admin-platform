import PocketBase from 'pocketbase';

// PocketBase client configuration - 外部服务器配置
const POCKETBASE_URL = Deno.env.get('POCKETBASE_URL') || 'http://47.111.142.237:8090';
const ADMIN_EMAIL = Deno.env.get('POCKETBASE_ADMIN_EMAIL') || 'ahukpyu@outlook.com';
const ADMIN_PASSWORD = Deno.env.get('POCKETBASE_ADMIN_PASSWORD') || 'kpyu1512..@';

// 连接配置 - 针对外部服务器优化
const CONNECTION_CONFIG = {
  timeout: 30000, // 30秒超时
  retryAttempts: 3,
  retryDelay: 1000, // 1秒重试延迟
  healthCheckInterval: 60000, // 60秒健康检查间隔
};

console.log(`🔗 PocketBase URL: ${POCKETBASE_URL}`);

// 请求队列管理器 - 优化远程连接
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minRequestInterval = 100; // 最小请求间隔100ms

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          // 确保请求间隔
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          if (timeSinceLastRequest < this.minRequestInterval) {
            await new Promise(resolve => 
              setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
            );
          }
          
          const result = await requestFn();
          this.lastRequestTime = Date.now();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      try {
        await request();
        // 添加小延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Queue request failed:', error);
      }
    }
    
    this.processing = false;
  }
}

export class PocketBaseClient {
  private pb: PocketBase;
  private isAuthenticated = false;
  private requestQueue = new RequestQueue();
  private healthCheckTimer?: number;
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';

  constructor() {
    this.pb = new PocketBase(POCKETBASE_URL);
    
    // 配置请求参数 - 针对外部服务器优化
    this.pb.beforeSend = (url, options) => {
      // 设置超时时间
      options.signal = AbortSignal.timeout(CONNECTION_CONFIG.timeout);
      
      // 添加请求头
      options.headers = {
        ...options.headers,
        'X-Request-Source': 'graphql-server',
        'X-Request-Time': Date.now().toString(),
        'X-Client-Version': '1.0.0',
      };
      
      return { url, options };
    };

    // 启动健康检查
    this.startHealthCheck();
  }

  private startHealthCheck() {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, CONNECTION_CONFIG.healthCheckInterval);
  }

  private async performHealthCheck() {
    try {
      await this.pb.health.check();
      if (this.connectionStatus !== 'connected') {
        this.connectionStatus = 'connected';
        console.log('✅ PocketBase连接恢复');
      }
         } catch (error) {
       if (this.connectionStatus !== 'disconnected') {
         this.connectionStatus = 'disconnected';
         const errorMessage = error instanceof Error ? error.message : String(error);
         console.warn('⚠️ PocketBase连接异常:', errorMessage);
       }
     }
  }

  async authenticate(): Promise<void> {
    if (this.isAuthenticated && this.pb.authStore.isValid) return;

    this.connectionStatus = 'connecting';
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= CONNECTION_CONFIG.retryAttempts; attempt++) {
      try {
        console.log(`🔐 PocketBase认证尝试 ${attempt}/${CONNECTION_CONFIG.retryAttempts}...`);
        
        await this.pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        
        this.isAuthenticated = true;
        this.connectionStatus = 'connected';
        console.log('✅ PocketBase认证成功 - 超级用户');
        return;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ 认证尝试 ${attempt} 失败:`, lastError.message);
        
        if (attempt < CONNECTION_CONFIG.retryAttempts) {
          console.log(`⏳ ${CONNECTION_CONFIG.retryDelay}ms后重试...`);
          await new Promise(resolve => setTimeout(resolve, CONNECTION_CONFIG.retryDelay));
        }
      }
    }
    
    this.connectionStatus = 'disconnected';
    throw new Error(`PocketBase认证失败，已尝试${CONNECTION_CONFIG.retryAttempts}次: ${lastError?.message}`);
  }

  async ensureAuth(): Promise<void> {
    if (!this.pb.authStore.isValid) {
      await this.authenticate();
    }
  }

  getClient(): PocketBase {
    return this.pb;
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    return this.connectionStatus;
  }

  // 排队执行PocketBase请求，避免并发冲突
  async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return this.requestQueue.add(requestFn);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pb.health.check();
      return true;
    } catch {
      return false;
    }
  }

  // 清理资源
  cleanup(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

// Singleton instance
export const pocketbaseClient = new PocketBaseClient(); 