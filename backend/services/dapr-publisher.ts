/**
 * Dapr 事件发布服务
 * 提供基于Dapr的事件发布功能
 */

import { DAPR_CONFIG, daprClient, daprUtils } from '../config/dapr.ts';

// 事件类型定义
export interface DaprEvent {
  type: string;
  data: any;
  userId?: string;
  timestamp: string;
}

// 产品事件
export interface ProductEvent extends DaprEvent {
  type: 'product.created' | 'product.updated' | 'product.deleted';
  data: {
    id: string;
    name: string;
    price: number;
    stock: number;
    [key: string]: any;
  };
}

// 订单事件
export interface OrderEvent extends DaprEvent {
  type: 'order.created' | 'order.updated' | 'order.completed' | 'order.cancelled';
  data: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    userId: string;
    [key: string]: any;
  };
}

// 用户事件
export interface UserEvent extends DaprEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    username: string;
    email: string;
    [key: string]: any;
  };
}

// 营销事件
export interface MarketingEvent extends DaprEvent {
  type: 'coupon.used' | 'points.earned' | 'member.upgraded' | 'promotion.started';
  data: {
    userId: string;
    [key: string]: any;
  };
}

// 通知事件
export interface NotificationEvent extends DaprEvent {
  type: 'notification.general' | 'stock.low' | 'order.reminder';
  data: {
    title: string;
    message: string;
    recipients: string[];
    [key: string]: any;
  };
}

// 统计事件
export interface StatsEvent extends DaprEvent {
  type: 'stats.updated';
  data: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    revenueToday: number;
    ordersToday: number;
    activeUsers: number;
    [key: string]: any;
  };
}

// 事件发布服务
export class DaprEventPublisher {
  private client = daprClient;
  
  /**
   * 发布产品事件
   */
  async publishProductEvent(params: {
    type: ProductEvent['type'];
    productId: string;
    productData: any;
    userId?: string;
  }): Promise<void> {
    const event: ProductEvent = {
      type: params.type,
      data: params.productData,
      userId: params.userId || 'system',
      timestamp: new Date().toISOString(),
    };
    
    await daprUtils.retry(async () => {
      await this.client.pubsub.publish(
        DAPR_CONFIG.pubSubName,
        DAPR_CONFIG.topics.productEvents,
        event
      );
    });
    
    console.log(`📦 发布产品事件: ${params.type}`, { productId: params.productId });
  }
  
  /**
   * 发布订单事件
   */
  async publishOrderEvent(params: {
    type: OrderEvent['type'];
    orderId: string;
    orderData: any;
    userId?: string;
  }): Promise<void> {
    const event: OrderEvent = {
      type: params.type,
      data: params.orderData,
      userId: params.userId || 'system',
      timestamp: new Date().toISOString(),
    };
    
    await daprUtils.retry(async () => {
      await this.client.pubsub.publish(
        DAPR_CONFIG.pubSubName,
        DAPR_CONFIG.topics.orderEvents,
        event
      );
    });
    
    console.log(`📋 发布订单事件: ${params.type}`, { orderId: params.orderId });
  }
  
  /**
   * 发布用户事件
   */
  async publishUserEvent(params: {
    type: UserEvent['type'];
    userId: string;
    userData: any;
  }): Promise<void> {
    const event: UserEvent = {
      type: params.type,
      data: params.userData,
      userId: params.userId,
      timestamp: new Date().toISOString(),
    };
    
    await daprUtils.retry(async () => {
      await this.client.pubsub.publish(
        DAPR_CONFIG.pubSubName,
        DAPR_CONFIG.topics.userEvents,
        event
      );
    });
    
    console.log(`👤 发布用户事件: ${params.type}`, { userId: params.userId });
  }
  
  /**
   * 发布营销事件
   */
  async publishMarketingEvent(params: {
    type: MarketingEvent['type'];
    userId: string;
    marketingData: any;
  }): Promise<void> {
    const event: MarketingEvent = {
      type: params.type,
      data: params.marketingData,
      userId: params.userId,
      timestamp: new Date().toISOString(),
    };
    
    await daprUtils.retry(async () => {
      await this.client.pubsub.publish(
        DAPR_CONFIG.pubSubName,
        DAPR_CONFIG.topics.marketingEvents,
        event
      );
    });
    
    console.log(`🎯 发布营销事件: ${params.type}`, { userId: params.userId });
  }
  
  /**
   * 发布通知事件
   */
  async publishNotificationEvent(params: {
    type: NotificationEvent['type'];
    notificationData: {
      title: string;
      message: string;
      recipients: string[];
      [key: string]: any;
    };
    userId?: string;
  }): Promise<void> {
    const event: NotificationEvent = {
      type: params.type,
      data: params.notificationData,
      userId: params.userId || 'system',
      timestamp: new Date().toISOString(),
    };
    
    await daprUtils.retry(async () => {
      await this.client.pubsub.publish(
        DAPR_CONFIG.pubSubName,
        DAPR_CONFIG.topics.notificationEvents,
        event
      );
    });
    
    console.log(`🔔 发布通知事件: ${params.type}`, { 
      title: params.notificationData.title,
      recipients: params.notificationData.recipients.length 
    });
  }
  
  /**
   * 发布统计更新事件
   */
  async publishStatsEvent(statsData: StatsEvent['data']): Promise<void> {
    const event: StatsEvent = {
      type: 'stats.updated',
      data: statsData,
      userId: 'system',
      timestamp: new Date().toISOString(),
    };
    
    await daprUtils.retry(async () => {
      await this.client.pubsub.publish(
        DAPR_CONFIG.pubSubName,
        DAPR_CONFIG.topics.statsEvents,
        event
      );
    });
    
    console.log('📊 发布统计更新事件', statsData);
  }
  
  /**
   * 批量发布事件
   */
  async publishBatch(events: Array<{
    topic: string;
    type: string;
    data: any;
    userId?: string;
  }>): Promise<void> {
    const promises = events.map(event => {
      const daprEvent: DaprEvent = {
        type: event.type,
        data: event.data,
        userId: event.userId || 'system',
        timestamp: new Date().toISOString(),
      };
      
      return this.client.pubsub.publish(
        DAPR_CONFIG.pubSubName,
        event.topic,
        daprEvent
      );
    });
    
    await Promise.all(promises);
    console.log(`📦 批量发布 ${events.length} 个事件`);
  }
  
  /**
   * 保存状态
   */
  async saveState(key: string, value: any): Promise<void> {
    await daprUtils.retry(async () => {
      await this.client.state.save(DAPR_CONFIG.stateStoreName, [
        { key, value }
      ]);
    });
    
    console.log(`💾 保存状态: ${key}`);
  }
  
  /**
   * 获取状态
   */
  async getState<T>(key: string): Promise<T | null> {
    try {
      return await this.client.state.get(DAPR_CONFIG.stateStoreName, key);
    } catch (error) {
      console.error(`获取状态失败: ${key}`, error);
      return null;
    }
  }
  
  /**
   * 删除状态
   */
  async deleteState(key: string): Promise<void> {
    await this.client.state.delete(DAPR_CONFIG.stateStoreName, key);
    console.log(`🗑️ 删除状态: ${key}`);
  }
}

// 单例实例
export const daprEventPublisher = new DaprEventPublisher();

// 快捷方法
export const daprEvents = {
  // 产品事件
  productCreated: (product: any, userId?: string) => 
    daprEventPublisher.publishProductEvent({
      type: 'product.created',
      productId: product.id,
      productData: product,
      userId,
    }),
  
  productUpdated: (product: any, userId?: string) => 
    daprEventPublisher.publishProductEvent({
      type: 'product.updated',
      productId: product.id,
      productData: product,
      userId,
    }),
  
  productDeleted: (productId: string, userId?: string) => 
    daprEventPublisher.publishProductEvent({
      type: 'product.deleted',
      productId,
      productData: { id: productId },
      userId,
    }),
  
  // 订单事件
  orderCreated: (order: any, userId?: string) => 
    daprEventPublisher.publishOrderEvent({
      type: 'order.created',
      orderId: order.id,
      orderData: order,
      userId,
    }),
  
  orderCompleted: (order: any, userId?: string) => 
    daprEventPublisher.publishOrderEvent({
      type: 'order.completed',
      orderId: order.id,
      orderData: order,
      userId,
    }),
  
  orderCancelled: (orderId: string, userId?: string) => 
    daprEventPublisher.publishOrderEvent({
      type: 'order.cancelled',
      orderId,
      orderData: { id: orderId },
      userId,
    }),
  
  // 用户事件
  userCreated: (user: any) => 
    daprEventPublisher.publishUserEvent({
      type: 'user.created',
      userId: user.id,
      userData: user,
    }),
  
  userUpdated: (user: any) => 
    daprEventPublisher.publishUserEvent({
      type: 'user.updated',
      userId: user.id,
      userData: user,
    }),
  
  // 营销事件
  couponUsed: (couponId: string, userId: string, discountAmount: number) => 
    daprEventPublisher.publishMarketingEvent({
      type: 'coupon.used',
      userId,
      marketingData: { couponId, discountAmount },
    }),
  
  pointsEarned: (userId: string, points: number, reason: string) => 
    daprEventPublisher.publishMarketingEvent({
      type: 'points.earned',
      userId,
      marketingData: { points, reason },
    }),
  
  // 通知事件
  sendNotification: (title: string, message: string, recipients: string[], userId?: string) => 
    daprEventPublisher.publishNotificationEvent({
      type: 'notification.general',
      notificationData: { title, message, recipients },
      userId,
    }),
  
  // 统计事件
  updateStats: (stats: any) => 
    daprEventPublisher.publishStatsEvent(stats),
};
