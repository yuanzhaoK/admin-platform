/**
 * Dapr 配置和客户端封装
 * 提供统一的Dapr功能访问接口
 */

import { DaprClient, DaprServer } from 'https://deno.land/x/dapr@v0.3.0/mod.ts';

// Dapr配置
export const DAPR_CONFIG = {
  // 服务配置
  appId: 'admin-platform',
  appPort: parseInt(Deno.env.get('GRAPHQL_PORT') || '8082'),
  daprPort: parseInt(Deno.env.get('DAPR_HTTP_PORT') || '3500'),
  
  // 组件配置
  pubSubName: Deno.env.get('DAPR_PUBSUB_NAME') || 'pubsub',
  stateStoreName: Deno.env.get('DAPR_STATESTORE_NAME') || 'statestore',
  
  // 主题配置
  topics: {
    productEvents: 'product-events',
    orderEvents: 'order-events',
    userEvents: 'user-events',
    marketingEvents: 'marketing-events',
    notificationEvents: 'notification-events',
    statsEvents: 'stats-updates',
  },
  
  // 状态配置
  stateKeys: {
    products: 'products',
    orders: 'orders',
    users: 'users',
    stats: 'stats',
  },
  
  // 重试配置
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};

// Dapr客户端单例
class DaprManager {
  private static instance: DaprManager;
  private client: DaprClient | null = null;
  private server: DaprServer | null = null;
  
  private constructor() {}
  
  public static getInstance(): DaprManager {
    if (!DaprManager.instance) {
      DaprManager.instance = new DaprManager();
    }
    return DaprManager.instance;
  }
  
  // 获取Dapr客户端
  public getClient(): DaprClient {
    if (!this.client) {
      this.client = new DaprClient({
        daprHost: 'localhost',
        daprPort: DAPR_CONFIG.daprPort,
      });
    }
    return this.client;
  }
  
  // 获取Dapr服务器
  public getServer(): DaprServer {
    if (!this.server) {
      this.server = new DaprServer({
        serverHost: 'localhost',
        serverPort: DAPR_CONFIG.appPort,
        daprHost: 'localhost',
        daprPort: DAPR_CONFIG.daprPort,
      });
    }
    return this.server;
  }
  
  // 健康检查
  public async healthCheck(): Promise<boolean> {
    try {
      const client = this.getClient();
      const health = await client.health.isHealthy();
      return health;
    } catch (error) {
      console.error('Dapr健康检查失败:', error);
      return false;
    }
  }
  
  // 关闭连接
  public async close(): Promise<void> {
    if (this.client) {
      // Dapr客户端没有close方法，清理引用
      this.client = null;
    }
    if (this.server) {
      // Dapr服务器没有close方法，清理引用
      this.server = null;
    }
  }
}

// 导出单例
export const daprManager = DaprManager.getInstance();

// 快捷访问
export const daprClient = daprManager.getClient();
export const daprServer = daprManager.getServer();

// 工具函数
export const daprUtils = {
  // 构建状态键
  buildStateKey: (type: string, id: string): string => `${type}:${id}`,
  
  // 构建事件数据
  buildEventData: (type: string, data: any, userId?: string) => ({
    type,
    data,
    userId: userId || 'system',
    timestamp: new Date().toISOString(),
  }),
  
  // 错误处理
  handleError: (error: any, context: string) => {
    console.error(`Dapr错误 [${context}]:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  },
  
  // 重试逻辑
  retry: async <T>(
    fn: () => Promise<T>,
    maxRetries = DAPR_CONFIG.retry.maxRetries,
    delay = DAPR_CONFIG.retry.retryDelay
  ): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError!;
  },
};

// 初始化检查
export async function initializeDapr(): Promise<boolean> {
  try {
    console.log('🔍 初始化Dapr连接...');
    
    // 检查Dapr sidecar是否运行
    const isHealthy = await daprManager.healthCheck();
    
    if (isHealthy) {
      console.log('✅ Dapr连接成功');
      return true;
    } else {
      console.warn('⚠️ Dapr sidecar未运行，将使用模拟模式');
      return false;
    }
  } catch (error) {
    console.warn('⚠️ Dapr初始化失败，将使用模拟模式:', error);
    return false;
  }
}

// 模拟Dapr客户端（用于开发环境）
export class MockDaprClient {
  private events: Map<string, any[]> = new Map();
  private states: Map<string, any> = new Map();
  
  async pubsubPublish(pubsubName: string, topic: string, data: any): Promise<void> {
    console.log(`📤 模拟发布事件: ${topic}`, data);
    
    if (!this.events.has(topic)) {
      this.events.set(topic, []);
    }
    this.events.get(topic)!.push(data);
  }
  
  async pubsubSubscribe(pubsubName: string, topic: string, callback: (data: any) => Promise<void>): Promise<void> {
    console.log(`📥 模拟订阅: ${topic}`);
    
    // 模拟事件接收
    setInterval(() => {
      const events = this.events.get(topic) || [];
      if (events.length > 0) {
        const event = events.shift();
        callback(event);
      }
    }, 5000);
  }
  
  async stateSave(storeName: string, data: any[]): Promise<void> {
    data.forEach(item => {
      this.states.set(item.key, item.value);
    });
  }
  
  async stateGet(storeName: string, key: string): Promise<any> {
    return this.states.get(key) || null;
  }
  
  async stateDelete(storeName: string, key: string): Promise<void> {
    this.states.delete(key);
  }
}

// 根据环境选择客户端
export const getDaprClient = () => {
  const useMock = Deno.env.get('USE_MOCK_DAPR') === 'true';
  return useMock ? new MockDaprClient() : daprClient;
};
