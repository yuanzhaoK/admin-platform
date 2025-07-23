// 事件发布服务
import type { MarketingEvent, OrderEvent, ProductEvent, UserEvent } from '../config/rabbitmq.ts';
import { rabbitMQClient } from '../config/rabbitmq.ts';

export class EventPublisher {
  private static instance: EventPublisher;

  static getInstance(): EventPublisher {
    if (!EventPublisher.instance) {
      EventPublisher.instance = new EventPublisher();
    }
    return EventPublisher.instance;
  }

  async initialize(): Promise<void> {
    await rabbitMQClient.connect();
  }

  // 产品相关事件
  async publishProductEvent(event: ProductEvent): Promise<void> {
    await rabbitMQClient.publish(`product.${event.type}`, {
      type: event.type,
      data: {
        productId: event.productId,
        productData: event.productData,
        userId: event.userId,
      },
      source: 'graphql-api',
    });
  }

  // 订单相关事件
  async publishOrderEvent(event: OrderEvent): Promise<void> {
    await rabbitMQClient.publish(`order.${event.type}`, {
      type: event.type,
      data: {
        orderId: event.orderId,
        orderData: event.orderData,
        userId: event.userId,
      },
      source: 'graphql-api',
    });
  }

  // 用户相关事件
  async publishUserEvent(event: UserEvent): Promise<void> {
    await rabbitMQClient.publish(`user.${event.type}`, {
      type: event.type,
      data: {
        userId: event.userId,
        userData: event.userData,
      },
      source: 'graphql-api',
    });
  }

  // 营销相关事件
  async publishMarketingEvent(event: MarketingEvent): Promise<void> {
    await rabbitMQClient.publish(`marketing.${event.type}`, {
      type: event.type,
      data: {
        userId: event.userId,
        marketingData: event.marketingData,
      },
      source: 'graphql-api',
    });
  }

  // 通知事件
  async publishNotificationEvent(type: string, data: any, userId?: string): Promise<void> {
    await rabbitMQClient.publish('notification.general', {
      type,
      data,
      userId,
      source: 'graphql-api',
    });
  }

  // 批量发布事件
  async publishBatch(events: Array<{
    routingKey: string;
    data: any;
  }>): Promise<void> {
    for (const event of events) {
      await rabbitMQClient.publish(event.routingKey, {
        ...event.data,
        source: 'graphql-api',
      });
    }
  }

  // 获取发布统计
  getStats() {
    return rabbitMQClient.getStats();
  }
}

// 单例实例
export const eventPublisher = EventPublisher.getInstance();
