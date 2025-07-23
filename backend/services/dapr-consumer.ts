/**
 * Dapr 事件消费服务
 * 提供基于Dapr的事件消费和处理功能
 */

import { DAPR_CONFIG, daprClient, daprServer } from '../config/dapr.ts';
import { pocketbaseClient } from '../config/pocketbase.ts';
import { daprEventPublisher } from './dapr-publisher.ts';

// 事件处理器接口
export interface EventHandler {
  handle(event: any): Promise<void>;
}

// 产品事件处理器
export class ProductEventHandler implements EventHandler {
  async handle(event: any): Promise<void> {
    console.log('📦 处理产品事件:', event.type);
    
    try {
      switch (event.type) {
        case 'product.created':
          await this.handleProductCreated(event);
          break;
        case 'product.updated':
          await this.handleProductUpdated(event);
          break;
        case 'product.deleted':
          await this.handleProductDeleted(event);
          break;
        default:
          console.warn('未知的产品事件类型:', event.type);
      }
    } catch (error) {
      console.error('处理产品事件失败:', error);
      throw error;
    }
  }
  
  private async handleProductCreated(event: any): Promise<void> {
    const { productData, userId } = event;
    
    // 更新库存统计
    await this.updateProductStats();
    
    // 发送通知给管理员
    await daprEventPublisher.publishNotificationEvent({
      type: 'notification.general',
      notificationData: {
        title: '新产品创建',
        message: `产品 ${productData.name} 已创建`,
        recipients: ['admin@example.com'],
      },
      userId,
    });
    
    console.log('✅ 产品创建事件处理完成');
  }
  
  private async handleProductUpdated(event: any): Promise<void> {
    const { productData } = event;
    
    // 检查库存预警
    if (productData.stock < 10) {
      await daprEventPublisher.publishNotificationEvent({
        type: 'notification.general',
        notificationData: {
          title: '库存预警',
          message: `产品 ${productData.name} 库存不足，当前库存: ${productData.stock}`,
          recipients: ['admin@example.com'],
        },
      });
    }
    
    console.log('✅ 产品更新事件处理完成');
  }
  
  private async handleProductDeleted(event: any): Promise<void> {
    const { productData } = event;
    
    // 清理相关缓存
    await daprClient.state.delete(
      DAPR_CONFIG.stateStoreName,
      `product:${productData.id}`
    );
    
    console.log('✅ 产品删除事件处理完成');
  }
  
  private async updateProductStats(): Promise<void> {
    try {
      const pb = await pocketbaseClient.getClient();
      const products = await pb.collection('products').getFullList();
      
      const stats = {
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock < 10).length,
        outOfStockProducts: products.filter(p => p.stock === 0).length,
      };
      
      await daprClient.state.save(DAPR_CONFIG.stateStoreName, [
        { key: 'product-stats', value: stats }
      ]);
      
      await daprEventPublisher.publishStatsEvent({
        totalProducts: products.length,
        totalOrders: 0, // 将在订单处理器中更新
        totalUsers: 0, // 将在用户处理器中更新
        revenueToday: 0,
        ordersToday: 0,
        activeUsers: 0,
      });
      
    } catch (error) {
      console.error('更新产品统计失败:', error);
    }
  }
}

// 订单事件处理器
export class OrderEventHandler implements EventHandler {
  async handle(event: any): Promise<void> {
    console.log('📋 处理订单事件:', event.type);
    
    try {
      switch (event.type) {
        case 'order.created':
          await this.handleOrderCreated(event);
          break;
        case 'order.completed':
          await this.handleOrderCompleted(event);
          break;
        case 'order.cancelled':
          await this.handleOrderCancelled(event);
          break;
        default:
          console.warn('未知的订单事件类型:', event.type);
      }
    } catch (error) {
      console.error('处理订单事件失败:', error);
      throw error;
    }
  }
  
  private async handleOrderCreated(event: any): Promise<void> {
    const { orderData, userId } = event;
    
    // 更新库存
    await this.updateInventory(orderData);
    
    // 发送订单确认通知
    await daprEventPublisher.publishNotificationEvent({
      type: 'notification.general',
      notificationData: {
        title: '订单创建成功',
        message: `订单 #${orderData.orderNumber} 已创建，总金额: ¥${orderData.totalAmount}`,
        recipients: [orderData.userEmail || 'user@example.com'],
      },
      userId,
    });
    
    console.log('✅ 订单创建事件处理完成');
  }
  
  private async handleOrderCompleted(event: any): Promise<void> {
    const { orderData, userId } = event;
    
    // 计算积分
    const points = Math.floor(orderData.totalAmount);
    await this.awardPoints(orderData.userId, points, `订单 #${orderData.orderNumber} 完成`);
    
    // 更新统计
    await this.updateOrderStats();
    
    // 发送完成通知
    await daprEventPublisher.publishNotificationEvent({
      type: 'notification.general',
      notificationData: {
        title: '订单完成',
        message: `订单 #${orderData.orderNumber} 已完成，获得 ${points} 积分`,
        recipients: [orderData.userEmail || 'user@example.com'],
      },
      userId,
    });
    
    console.log('✅ 订单完成事件处理完成');
  }
  
  private async handleOrderCancelled(event: any): Promise<void> {
    const { orderData } = event;
    
    // 恢复库存
    await this.restoreInventory(orderData);
    
    // 发送取消通知
    await daprEventPublisher.publishNotificationEvent({
      type: 'notification.general',
      notificationData: {
        title: '订单取消',
        message: `订单 #${orderData.orderNumber} 已取消`,
        recipients: [orderData.userEmail || 'user@example.com'],
      },
    });
    
    console.log('✅ 订单取消事件处理完成');
  }
  
  private async updateInventory(orderData: any): Promise<void> {
    try {
      const pb = await pocketbaseClient.getClient();
      
      for (const item of orderData.items || []) {
        const product = await pb.collection('products').getOne(item.productId);
        const newStock = product.stock - item.quantity;
        
        await pb.collection('products').update(item.productId, {
          stock: newStock,
          sold: (product.sold || 0) + item.quantity,
        });
        
        // 检查库存预警
        if (newStock < 10) {
          await daprEventPublisher.publishNotificationEvent({
            type: 'notification.general',
            notificationData: {
              title: '库存预警',
              message: `产品 ${product.name} 库存不足，当前库存: ${newStock}`,
              recipients: ['admin@example.com'],
            },
          });
        }
      }
    } catch (error) {
      console.error('更新库存失败:', error);
    }
  }
  
  private async restoreInventory(orderData: any): Promise<void> {
    try {
      const pb = await pocketbaseClient.getClient();
      
      for (const item of orderData.items || []) {
        const product = await pb.collection('products').getOne(item.productId);
        const newStock = product.stock + item.quantity;
        
        await pb.collection('products').update(item.productId, {
          stock: newStock,
          sold: Math.max(0, (product.sold || 0) - item.quantity),
        });
      }
    } catch (error) {
      console.error('恢复库存失败:', error);
    }
  }
  
  private async awardPoints(userId: string, points: number, reason: string): Promise<void> {
    try {
      const pb = await pocketbaseClient.getClient();
      
      // 获取用户当前积分
      const user = await pb.collection('users').getOne(userId);
      const currentPoints = user.points || 0;
      
      // 更新积分
      await pb.collection('users').update(userId, {
        points: currentPoints + points,
      });
      
      // 记录积分历史
      await pb.collection('points_records').create({
        user_id: userId,
        points,
        type: 'earned',
        description: reason,
      });
      
      // 发布积分获取事件
      await daprEventPublisher.publishMarketingEvent({
        type: 'points.earned',
        userId,
        marketingData: { points, reason },
      });
      
    } catch (error) {
      console.error('奖励积分失败:', error);
    }
  }
  
  private async updateOrderStats(): Promise<void> {
    try {
      const pb = await pocketbaseClient.getClient();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const orders = await pb.collection('orders').getFullList();
      const todayOrders = orders.filter(order => 
        new Date(order.created) >= today
      );
      
      const stats = {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        pendingOrders: orders.filter(o => o.status === 'pending').length,
      };
      
      await daprClient.state.save(DAPR_CONFIG.stateStoreName, [
        { key: 'order-stats', value: stats }
      ]);
      
      const currentStats = await daprClient.state.get(
        DAPR_CONFIG.stateStoreName,
        'stats'
      ) || {};
      
      await daprEventPublisher.publishStatsEvent({
        ...currentStats,
        totalOrders: orders.length,
        revenueToday: stats.todayRevenue,
        ordersToday: stats.todayOrders,
      });
      
    } catch (error) {
      console.error('更新订单统计失败:', error);
    }
  }
}

// 用户事件处理器
export class UserEventHandler implements EventHandler {
  async handle(event: any): Promise<void> {
    console.log('👤 处理用户事件:', event.type);
    
    try {
      switch (event.type) {
        case 'user.created':
          await this.handleUserCreated(event);
          break;
        case 'user.updated':
          await this.handleUserUpdated(event);
          break;
        default:
          console.warn('未知的用户事件类型:', event.type);
      }
    } catch (error) {
      console.error('处理用户事件失败:', error);
      throw error;
    }
  }
  
  private async handleUserCreated(event: any): Promise<void> {
    const { userData } = event;
    
    // 发送欢迎通知
    await daprEventPublisher.publishNotificationEvent({
      type: 'notification.general',
      notificationData: {
        title: '欢迎注册',
        message: `欢迎 ${userData.username} 加入我们的平台！`,
        recipients: [userData.email],
      },
      userId: userData.id,
    });
    
    // 更新用户统计
    await this.updateUserStats();
    
    console.log('✅ 用户创建事件处理完成');
  }
  
  private async handleUserUpdated(event: any): Promise<void> {
    const { userData } = event;
    
    // 更新缓存
    await daprClient.state.save(DAPR_CONFIG.stateStoreName, [
      { key: `user:${userData.id}`, value: userData }
    ]);
    
    console.log('✅ 用户更新事件处理完成');
  }
  
  private async updateUserStats(): Promise<void> {
    try {
      const pb = await pocketbaseClient.getClient();
      const users = await pb.collection('users').getFullList();
      
      const stats = {
        totalUsers: users.length,
        activeUsers: users.filter(u => u.lastLogin && 
          new Date(u.lastLogin) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
        newUsersToday: users.filter(u => 
          new Date(u.created) >= new Date(new Date().setHours(0, 0, 0, 0))
        ).length,
      };
      
      await daprClient.state.save(DAPR_CONFIG.stateStoreName, [
        { key: 'user-stats', value: stats }
      ]);
      
      const currentStats = await daprClient.state.get(
        DAPR_CONFIG.stateStoreName,
        'stats'
      ) || {};
      
      await daprEventPublisher.publishStatsEvent({
        ...currentStats,
        totalUsers: users.length,
      });
      
    } catch (error) {
      console.error('更新用户统计失败:', error);
    }
  }
}

// 事件消费管理器
export class DaprEventConsumer {
  private handlers: Map<string, EventHandler> = new Map();
  private isInitialized = false;
  
  constructor() {
    this.initializeHandlers();
  }
  
  private initializeHandlers(): void {
    this.handlers.set('product-events', new ProductEventHandler());
    this.handlers.set('order-events', new OrderEventHandler());
    this.handlers.set('user-events', new UserEventHandler());
  }
  
  /**
   * 初始化事件消费
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    
    console.log('🚀 初始化Dapr事件消费...');
    
    try {
      // 订阅各个主题
      for (const [topic, handler] of this.handlers) {
        await this.subscribeTopic(topic, handler);
      }
      
      this.isInitialized = true;
      console.log('✅ Dapr事件消费初始化完成');
      
    } catch (error) {
      console.error('初始化Dapr事件消费失败:', error);
    }
  }
  
  /**
   * 订阅主题
   */
  private async subscribeTopic(topic: string, handler: EventHandler): Promise<void> {
    try {
      await daprServer.pubsub.subscribe(
        DAPR_CONFIG.pubSubName,
        topic,
        async (data: any) => {
          try {
            await handler.handle(data);
          } catch (error) {
            console.error(`处理${topic}事件失败:`, error);
          }
        }
      );
      
      console.log(`📥 已订阅主题: ${topic}`);
      
    } catch (error) {
      console.error(`订阅主题${topic}失败:`, error);
    }
  }
  
  /**
   * 获取事件处理器
   */
  getHandler(topic: string): EventHandler | undefined {
    return this.handlers.get(topic);
  }
  
  /**
   * 获取所有处理器
   */
  getAllHandlers(): Map<string, EventHandler> {
    return new Map(this.handlers);
  }
}

// 单例实例
export const daprEventConsumer = new DaprEventConsumer();
