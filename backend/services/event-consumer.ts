// 事件消费服务
import { pocketbaseClient } from '../config/pocketbase.ts';
import { rabbitMQClient } from '../config/rabbitmq.ts';
import { eventPublisher } from './event-publisher.ts';

export class EventConsumer {
  private static instance: EventConsumer;
  private isInitialized = false;

  static getInstance(): EventConsumer {
    if (!EventConsumer.instance) {
      EventConsumer.instance = new EventConsumer();
    }
    return EventConsumer.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await rabbitMQClient.connect();
    await this.setupConsumers();
    
    this.isInitialized = true;
    console.log('✅ 事件消费者初始化完成');
  }

  private async setupConsumers(): Promise<void> {
    // 产品事件消费者
    await rabbitMQClient.consume('product.events', async (message) => {
      console.log('📦 处理产品事件:', message);
      
      switch (message.type) {
        case 'product.created':
          await this.handleProductCreated(message.data);
          break;
        case 'product.updated':
          await this.handleProductUpdated(message.data);
          break;
        case 'product.deleted':
          await this.handleProductDeleted(message.data);
          break;
      }
    });

    // 订单事件消费者
    await rabbitMQClient.consume('order.events', async (message) => {
      console.log('📋 处理订单事件:', message);
      
      switch (message.type) {
        case 'order.created':
          await this.handleOrderCreated(message.data);
          break;
        case 'order.completed':
          await this.handleOrderCompleted(message.data);
          break;
        case 'order.cancelled':
          await this.handleOrderCancelled(message.data);
          break;
      }
    });

    // 用户事件消费者
    await rabbitMQClient.consume('user.events', async (message) => {
      console.log('👤 处理用户事件:', message);
      
      switch (message.type) {
        case 'user.created':
          await this.handleUserCreated(message.data);
          break;
        case 'user.updated':
          await this.handleUserUpdated(message.data);
          break;
      }
    });

    // 营销事件消费者
    await rabbitMQClient.consume('marketing.events', async (message) => {
      console.log('🎯 处理营销事件:', message);
      
      switch (message.type) {
        case 'coupon.used':
          await this.handleCouponUsed(message.data);
          break;
        case 'points.earned':
          await this.handlePointsEarned(message.data);
          break;
        case 'member.upgraded':
          await this.handleMemberUpgraded(message.data);
          break;
      }
    });

    // 通知事件消费者
    await rabbitMQClient.consume('notification.events', async (message) => {
      console.log('🔔 处理通知事件:', message);
      await this.handleNotification(message.data);
    });
  }

  // 产品事件处理
  private async handleProductCreated(data: any): Promise<void> {
    // 更新搜索索引
    console.log('🔄 更新产品搜索索引:', data.productId);
    
    // 发送通知给管理员
    await eventPublisher.publishNotificationEvent(
      'product.created',
      {
        productId: data.productId,
        productName: data.productData.name,
        action: 'create',
      },
      data.userId
    );
  }

  private async handleProductUpdated(data: any): Promise<void> {
    // 更新缓存
    console.log('🔄 更新产品缓存:', data.productId);
    
    // 检查库存变化
    if (data.productData.stock !== undefined) {
      await this.checkStockAlert(data.productId, data.productData.stock);
    }
  }

  private async handleProductDeleted(data: any): Promise<void> {
    // 清理相关数据
    console.log('🗑️ 清理产品相关数据:', data.productId);
    
    // 从推荐中移除
    try {
      const pb = pocketbaseClient.getClient();
      await pb.collection('recommendations').delete(data.productId);
    } catch (error) {
      console.error('清理推荐数据失败:', error);
    }
  }

  // 订单事件处理
  private async handleOrderCreated(data: any): Promise<void> {
    // 更新库存
    console.log('📦 处理新订单库存更新:', data.orderId);
    
    // 发送订单确认通知
    await eventPublisher.publishNotificationEvent(
      'order.created',
      {
        orderId: data.orderId,
        orderNumber: data.orderData.orderNumber,
        totalAmount: data.orderData.totalAmount,
      },
      data.userId
    );
  }

  private async handleOrderCompleted(data: any): Promise<void> {
    // 更新用户积分
    console.log('🎯 处理订单完成，更新积分:', data.orderId);
    
    const pointsEarned = Math.floor(data.orderData.totalAmount / 10);
    
    await eventPublisher.publishMarketingEvent({
      type: 'points.earned',
      userId: data.userId,
      marketingData: {
        orderId: data.orderId,
        points: pointsEarned,
        reason: 'order_completed',
      },
    });
  }

  private async handleOrderCancelled(data: any): Promise<void> {
    // 恢复库存
    console.log('🔄 处理订单取消，恢复库存:', data.orderId);
    
    // 发送取消通知
    await eventPublisher.publishNotificationEvent(
      'order.cancelled',
      {
        orderId: data.orderId,
        reason: data.orderData.cancelReason,
      },
      data.userId
    );
  }

  // 用户事件处理
  private async handleUserCreated(data: any): Promise<void> {
    // 创建用户欢迎礼包
    console.log('🎁 为新用户创建欢迎礼包:', data.userId);
    
    try {
      const pb = pocketbaseClient.getClient();
      
      // 创建新用户优惠券
      await pb.collection('coupons').create({
        name: '新用户专享券',
        discount_type: 'percentage',
        discount_value: 20,
        min_amount: 100,
        user_id: data.userId,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后过期
      });
      
      // 发送欢迎通知
      await eventPublisher.publishNotificationEvent(
        'user.welcome',
        {
          userName: data.userData.username || data.userData.email,
          welcomeCoupon: '新用户专享券',
        },
        data.userId
      );
    } catch (error) {
      console.error('创建欢迎礼包失败:', error);
    }
  }

  private async handleUserUpdated(data: any): Promise<void> {
    // 检查会员等级变化
    if (data.userData.level) {
      await this.checkMemberLevelUpgrade(data.userId, data.userData.level);
    }
  }

  // 营销事件处理
  private async handleCouponUsed(data: any): Promise<void> {
    console.log('🎫 处理优惠券使用:', data.userId);
    
    // 更新优惠券使用统计
    try {
      const pb = pocketbaseClient.getClient();
      await pb.collection('coupon_usage').create({
        coupon_id: data.marketingData.couponId,
        user_id: data.userId,
        order_id: data.marketingData.orderId,
        used_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('更新优惠券使用记录失败:', error);
    }
  }

  private async handlePointsEarned(data: any): Promise<void> {
    console.log('⭐ 处理积分获取:', data.userId);
    
    // 更新用户积分
    try {
      const pb = pocketbaseClient.getClient();
      const user = await pb.collection('users').getOne(data.userId);
      
      const newPoints = (user.points || 0) + data.marketingData.points;
      
      await pb.collection('users').update(data.userId, {
        points: newPoints,
      });
      
      // 记录积分历史
      await pb.collection('points_records').create({
        user_id: data.userId,
        points: data.marketingData.points,
        type: 'earned',
        description: data.marketingData.reason,
        created: new Date().toISOString(),
      });
      
      // 检查会员等级
      await this.checkMemberLevelUpgrade(data.userId, user.level, newPoints);
    } catch (error) {
      console.error('更新用户积分失败:', error);
    }
  }

  private async handleMemberUpgraded(data: any): Promise<void> {
    console.log('🎖️ 处理会员升级:', data.userId);
    
    // 发送升级通知
    await eventPublisher.publishNotificationEvent(
      'member.upgraded',
      {
        newLevel: data.marketingData.newLevel,
        benefits: data.marketingData.benefits,
      },
      data.userId
    );
  }

  // 通知事件处理
  private async handleNotification(data: any): Promise<void> {
    console.log('🔔 处理通知:', data.type);
    
    // 这里可以集成邮件、短信、推送通知等
    // 暂时只记录日志
    console.log('通知内容:', data);
  }

  // 辅助方法
  private async checkStockAlert(productId: string, stock: number): Promise<void> {
    if (stock < 10) {
      await eventPublisher.publishNotificationEvent(
        'stock.low',
        {
          productId,
          currentStock: stock,
          threshold: 10,
        }
      );
    }
  }

  private async checkMemberLevelUpgrade(
    userId: string, 
    currentLevel?: string, 
    currentPoints?: number
  ): Promise<void> {
    try {
      const pb = pocketbaseClient.getClient();
      const user = await pb.collection('users').getOne(userId);
      
      const points = currentPoints || user.points || 0;
      let newLevel = 'bronze';
      
      if (points >= 10000) {
        newLevel = 'diamond';
      } else if (points >= 5000) {
        newLevel = 'gold';
      } else if (points >= 1000) {
        newLevel = 'silver';
      }
      
      if (newLevel !== (currentLevel || user.level)) {
        await pb.collection('users').update(userId, {
          level: newLevel,
        });
        
        await eventPublisher.publishMarketingEvent({
          type: 'member.upgraded',
          userId,
          marketingData: {
            oldLevel: user.level || 'bronze',
            newLevel,
            points,
          },
        });
      }
    } catch (error) {
      console.error('检查会员等级失败:', error);
    }
  }
}

// 单例实例
export const eventConsumer = EventConsumer.getInstance();
