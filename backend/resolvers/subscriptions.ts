// GraphQL 订阅实现
import { rabbitMQClient } from '../config/rabbitmq.ts';

// 简单的发布-订阅实现
class EventBus {
  private listeners: Map<string, Array<(data: any) => void>> = new Map();
  private static instance: EventBus;

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(callback);
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  publish(eventType: string, data: any): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  getStats() {
    const stats: Record<string, number> = {};
    this.listeners.forEach((callbacks, type) => {
      stats[type] = callbacks.length;
    });
    return stats;
  }
}

const eventBus = EventBus.getInstance();

// 初始化事件监听
async function initializeEventListeners() {
  // 监听所有RabbitMQ事件并转发到GraphQL订阅
  await rabbitMQClient.consume('product.events', async (message) => {
    const eventType = `product.${message.type}`;
    eventBus.publish(eventType, {
      id: message.id,
      type: message.type,
      productId: message.data.productId,
      productData: message.data.productData,
      userId: message.data.userId,
      timestamp: message.timestamp,
    });
  });

  await rabbitMQClient.consume('order.events', async (message) => {
    const eventType = `order.${message.type}`;
    eventBus.publish(eventType, {
      id: message.id,
      type: message.type,
      orderId: message.data.orderId,
      orderData: message.data.orderData,
      userId: message.data.userId,
      timestamp: message.timestamp,
    });
  });

  await rabbitMQClient.consume('user.events', async (message) => {
    const eventType = `user.${message.type}`;
    eventBus.publish(eventType, {
      id: message.id,
      type: message.type,
      userId: message.data.userId,
      userData: message.data.userData,
      timestamp: message.timestamp,
    });
  });

  await rabbitMQClient.consume('marketing.events', async (message) => {
    const eventType = `marketing.${message.type}`;
    eventBus.publish(eventType, {
      id: message.id,
      type: message.type,
      userId: message.data.userId,
      marketingData: message.data.marketingData,
      timestamp: message.timestamp,
    });
  });

  await rabbitMQClient.consume('notification.events', async (message) => {
    eventBus.publish('notification.received', {
      id: message.id,
      type: message.type,
      title: message.data.title || '新通知',
      message: message.data.message,
      userId: message.data.userId,
      data: message.data,
      timestamp: message.timestamp,
    });
  });
}

// 模拟实时数据生成器
class RealtimeDataGenerator {
  private interval: number | null = null;
  private stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    activeUsers: 0,
    revenueToday: 0,
    ordersToday: 0,
    lowStockProducts: 0,
    pendingReviews: 0,
  };

  start() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      // 模拟数据更新
      this.stats.totalProducts += Math.floor(Math.random() * 2);
      this.stats.totalOrders += Math.floor(Math.random() * 5);
      this.stats.activeUsers += Math.floor(Math.random() * 10);
      this.stats.revenueToday += Math.floor(Math.random() * 1000);
      this.stats.ordersToday += Math.floor(Math.random() * 3);
      
      // 发布实时统计更新
      eventBus.publish('realtime.stats', this.stats);
    }, 5000); // 每5秒更新一次
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getStats() {
    return this.stats;
  }
}

const realtimeGenerator = new RealtimeDataGenerator();

// 订阅resolver
export const subscriptionResolvers = {
  Subscription: {
    // 产品相关订阅
    productCreated: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('product.created', (data) => {
                    resolve({ value: data });
                  });
                  
                  // 清理函数
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000); // 30秒后自动取消订阅
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    productUpdated: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('product.updated', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    productDeleted: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('product.deleted', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    // 订单相关订阅
    orderCreated: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('order.created', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    orderUpdated: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('order.updated', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    orderCompleted: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('order.completed', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    orderCancelled: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('order.cancelled', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    // 用户相关订阅
    userCreated: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('user.created', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    userUpdated: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('user.updated', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    // 营销相关订阅
    couponUsed: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('coupon.used', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    pointsEarned: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('points.earned', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    memberUpgraded: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('member.upgraded', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    // 通知相关订阅
    notificationReceived: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('notification.received', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    // 库存预警订阅
    stockAlert: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('stock.alert', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    // 通用事件订阅
    eventReceived: {
      subscribe: (_: any, { eventType }: { eventType: string }) => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe(eventType, (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },

    // 实时统计订阅
    realtimeStats: {
      subscribe: () => {
        const asyncIterator = {
          [Symbol.asyncIterator]() {
            return {
              next() {
                return new Promise((resolve) => {
                  const unsubscribe = eventBus.subscribe('realtime.stats', (data) => {
                    resolve({ value: data });
                  });
                  
                  setTimeout(() => {
                    unsubscribe();
                  }, 30000);
                });
              }
            };
          }
        };
        return asyncIterator;
      }
    },
  }
};

// 初始化
export async function initializeSubscriptions() {
  await initializeEventListeners();
  realtimeGenerator.start();
  console.log('✅ GraphQL 订阅系统初始化完成');
}

// 导出事件总线供其他模块使用
export { eventBus };
