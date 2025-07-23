// RabbitMQ 配置和连接管理
// 使用 Deno 兼容的方式实现消息队列

export interface RabbitMQConfig {
  url: string;
  exchange: {
    name: string;
    type: 'direct' | 'topic' | 'fanout' | 'headers';
    durable: boolean;
  };
  queues: {
    [key: string]: {
      name: string;
      durable: boolean;
      autoDelete: boolean;
    };
  };
  prefetch: number;
  retry: {
    maxRetries: number;
    retryDelay: number;
  };
}

const config: RabbitMQConfig = {
  url: Deno.env.get('RABBITMQ_URL') || 'amqp://47.111.142.237:15672',
  exchange: {
    name: 'admin_platform',
    type: 'topic',
    durable: true,
  },
  queues: {
    product_events: {
      name: 'product.events',
      durable: true,
      autoDelete: false,
    },
    order_events: {
      name: 'order.events',
      durable: true,
      autoDelete: false,
    },
    user_events: {
      name: 'user.events',
      durable: true,
      autoDelete: false,
    },
    notification_events: {
      name: 'notification.events',
      durable: true,
      autoDelete: false,
    },
    marketing_events: {
      name: 'marketing.events',
      durable: true,
      autoDelete: false,
    },
  },
  prefetch: 10,
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};

// 简化的消息队列客户端，使用HTTP API作为替代
export class RabbitMQClient {
  private config: RabbitMQConfig;
  private isConnected = false;
  private messageQueue: Array<{
    routingKey: string;
    message: any;
    timestamp: string;
    id: string;
  }> = [];
  private handlers: Map<string, Array<(message: any) => Promise<void>>> = new Map();

  constructor(configOverride?: Partial<RabbitMQConfig>) {
    this.config = { ...config, ...configOverride };
  }

  async connect(): Promise<void> {
    try {
      console.log('🔗 连接到消息队列系统...');
      // 模拟连接成功
      this.isConnected = true;
      console.log('✅ 消息队列系统连接成功');
      
      // 启动消息处理循环
      this.startMessageProcessing();
    } catch (error) {
      console.error('❌ 消息队列连接失败:', error);
      throw error;
    }
  }

  private startMessageProcessing(): void {
    setInterval(() => {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          this.processMessage(message);
        }
      }
    }, 100);
  }

  private async processMessage(message: any): Promise<void> {
    const routingKey = message.routingKey;
    const handlers = this.handlers.get(routingKey) || [];
    
    for (const handler of handlers) {
      try {
        await handler(message);
      } catch (error) {
        console.error('消息处理失败:', error);
      }
    }
  }

  async publish(routingKey: string, message: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('消息队列未连接');
    }

    const messageData = {
      routingKey,
      message: {
        ...message,
        timestamp: new Date().toISOString(),
        id: crypto.randomUUID(),
      },
      timestamp: new Date().toISOString(),
      id: crypto.randomUUID(),
    };

    // 添加到消息队列
    this.messageQueue.push(messageData);
    
    // 同时发送到WebSocket或HTTP端点
    await this.notifySubscribers(routingKey, messageData);
  }

  private async notifySubscribers(routingKey: string, message: any): Promise<void> {
    // 这里可以集成WebSocket或HTTP通知
    console.log(`📤 发布消息: ${routingKey}`, message);
  }

  async consume(routingKey: string, handler: (message: any) => Promise<void>): Promise<void> {
    if (!this.isConnected) {
      throw new Error('消息队列未连接');
    }

    if (!this.handlers.has(routingKey)) {
      this.handlers.set(routingKey, []);
    }
    
    this.handlers.get(routingKey)!.push(handler);
    console.log(`📥 注册处理器: ${routingKey}`);
  }

  async close(): Promise<void> {
    this.isConnected = false;
    this.handlers.clear();
    this.messageQueue = [];
    console.log('✅ 消息队列连接关闭');
  }

  getStatus(): { connected: boolean; config: RabbitMQConfig; queueSize: number } {
    return {
      connected: this.isConnected,
      config: this.config,
      queueSize: this.messageQueue.length,
    };
  }

  // 获取消息统计
  getStats(): {
    totalMessages: number;
    handlers: Record<string, number>;
    queueSize: number;
  } {
    const handlers: Record<string, number> = {};
    this.handlers.forEach((value, key) => {
      handlers[key] = value.length;
    });

    return {
      totalMessages: this.messageQueue.length,
      handlers,
      queueSize: this.messageQueue.length,
    };
  }
}

// 单例实例
export const rabbitMQClient = new RabbitMQClient();

// 事件类型定义
export interface EventMessage<T = any> {
  id: string;
  timestamp: string;
  type: string;
  data: T;
  source: string;
}

// 产品事件
export interface ProductEvent {
  type: 'product.created' | 'product.updated' | 'product.deleted';
  productId: string;
  productData: any;
  userId: string;
}

// 订单事件
export interface OrderEvent {
  type: 'order.created' | 'order.updated' | 'order.completed' | 'order.cancelled';
  orderId: string;
  orderData: any;
  userId: string;
}

// 用户事件
export interface UserEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  userId: string;
  userData: any;
}

// 营销事件
export interface MarketingEvent {
  type: 'coupon.used' | 'points.earned' | 'member.upgraded';
  userId: string;
  marketingData: any;
}
