import PocketBase from 'pocketbase';

// PocketBase client configuration
const POCKETBASE_URL = Deno.env.get('POCKETBASE_URL') || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = Deno.env.get('POCKETBASE_ADMIN_EMAIL') || 'ahukpyu@outlook.com';
const ADMIN_PASSWORD = Deno.env.get('POCKETBASE_ADMIN_PASSWORD') || 'kpyu1512..@';

// 请求队列管理器
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
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

  constructor() {
    this.pb = new PocketBase(POCKETBASE_URL);
    
    // 配置请求参数，增加超时时间并优化并发处理
    this.pb.beforeSend = (url, options) => {
      // 增加请求超时时间到30秒
      options.signal = AbortSignal.timeout(30000);
      
      // 添加请求头来标识请求来源
      options.headers = {
        ...options.headers,
        'X-Request-Source': 'graphql-server',
        'X-Request-Time': Date.now().toString()
      };
      
      return { url, options };
    };
  }

  async authenticate(): Promise<void> {
    if (this.isAuthenticated) return;

    try {
      await this.pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
      this.isAuthenticated = true;
      console.log('✅ PocketBase authenticated successfully as superuser');
    } catch (error) {
      console.error('❌ PocketBase authentication failed:', error);
      throw new Error('Failed to authenticate with PocketBase');
    }
  }

  async ensureAuth(): Promise<void> {
    if (!this.pb.authStore.isValid) {
      await this.authenticate();
    }
  }

  getClient(): PocketBase {
    return this.pb;
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
}

// Singleton instance
export const pocketbaseClient = new PocketBaseClient(); 