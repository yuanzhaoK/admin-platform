#!/usr/bin/env deno run --allow-all

/**
 * Dapr 集成测试脚本
 * 测试Dapr的事件发布、消费和状态管理功能
 */

import { DAPR_CONFIG, daprClient } from '../../config/dapr.ts';
import { daprEventConsumer } from '../../services/dapr-consumer.ts';
import { daprEventPublisher } from '../../services/dapr-publisher.ts';

// 测试数据
const testData = {
  product: {
    id: 'test-product-001',
    name: '测试产品',
    price: 99.99,
    stock: 100,
    description: '这是一个测试产品',
  },
  order: {
    id: 'test-order-001',
    orderNumber: 'ORD-2024-001',
    totalAmount: 199.98,
    status: 'pending',
    userId: 'test-user-001',
    userEmail: 'test@example.com',
    items: [
      { productId: 'test-product-001', quantity: 2, price: 99.99 },
    ],
  },
  user: {
    id: 'test-user-001',
    username: 'testuser',
    email: 'test@example.com',
    points: 0,
  },
};

// 测试工具
class DaprTester {
  async runAllTests(): Promise<void> {
    console.log('🧪 开始Dapr集成测试...\n');
    
    try {
      // 测试状态管理
      await this.testStateManagement();
      
      // 测试事件发布
      await this.testEventPublishing();
      
      // 测试事件消费
      await this.testEventConsumption();
      
      // 测试实时统计
      await this.testRealtimeStats();
      
      console.log('✅ 所有测试完成！');
      
    } catch (error) {
      console.error('❌ 测试失败:', error);
    }
  }
  
  private async testStateManagement(): Promise<void> {
    console.log('💾 测试状态管理...');
    
    try {
      // 保存状态
      await daprClient.state.save(DAPR_CONFIG.stateStoreName, [
        { key: 'test:product:001', value: testData.product },
        { key: 'test:order:001', value: testData.order },
        { key: 'test:user:001', value: testData.user },
      ]);
      
      console.log('✅ 状态保存成功');
      
      // 获取状态
      const product = await daprClient.state.get(
        DAPR_CONFIG.stateStoreName,
        'test:product:001'
      );
      
      console.log('✅ 状态获取成功:', product?.name);
      
      // 删除状态
      await daprClient.state.delete(
        DAPR_CONFIG.stateStoreName,
        'test:product:001'
      );
      
      console.log('✅ 状态删除成功');
      
    } catch (error) {
      console.error('状态管理测试失败:', error);
    }
  }
  
  private async testEventPublishing(): Promise<void> {
    console.log('📤 测试事件发布...');
    
    try {
      // 发布产品创建事件
      await daprEventPublisher.publishProductEvent({
        type: 'product.created',
        productId: testData.product.id,
        productData: testData.product,
        userId: 'test-user',
      });
      
      // 发布订单创建事件
      await daprEventPublisher.publishOrderEvent({
        type: 'order.created',
        orderId: testData.order.id,
        orderData: testData.order,
        userId: 'test-user',
      });
      
      // 发布用户创建事件
      await daprEventPublisher.publishUserEvent({
        type: 'user.created',
        userId: testData.user.id,
        userData: testData.user,
      });
      
      console.log('✅ 事件发布测试完成');
      
    } catch (error) {
      console.error('事件发布测试失败:', error);
    }
  }
  
  private async testEventConsumption(): Promise<void> {
    console.log('📥 测试事件消费...');
    
    try {
      // 初始化事件消费
      await daprEventConsumer.initialize();
      
      // 模拟事件处理
      const productHandler = daprEventConsumer.getHandler('product-events');
      if (productHandler) {
        await productHandler.handle({
          type: 'product.created',
          productData: testData.product,
          userId: 'test-user',
        });
      }
      
      console.log('✅ 事件消费测试完成');
      
    } catch (error) {
      console.error('事件消费测试失败:', error);
    }
  }
  
  private async testRealtimeStats(): Promise<void> {
    console.log('📊 测试实时统计...');
    
    try {
      const stats = {
        totalProducts: 100,
        totalOrders: 50,
        totalUsers: 200,
        revenueToday: 9999.99,
        ordersToday: 10,
        activeUsers: 25,
      };
      
      await daprEventPublisher.publishStatsEvent(stats);
      
      // 保存到状态存储
      await daprClient.state.save(DAPR_CONFIG.stateStoreName, [
        { key: 'realtime-stats', value: stats }
      ]);
      
      // 获取统计
      const savedStats = await daprClient.state.get(
        DAPR_CONFIG.stateStoreName,
        'realtime-stats'
      );
      
      console.log('✅ 实时统计测试完成:', savedStats);
      
    } catch (error) {
      console.error('实时统计测试失败:', error);
    }
  }
}

// 性能测试
class PerformanceTester {
  async runPerformanceTest(): Promise<void> {
    console.log('⚡ 开始性能测试...\n');
    
    const iterations = 100;
    const startTime = Date.now();
    
    // 批量事件发布测试
    const events = Array.from({ length: iterations }, (_, i) => ({
      type: 'product.created',
      productId: `perf-product-${i}`,
      productData: {
        id: `perf-product-${i}`,
        name: `性能测试产品 ${i}`,
        price: Math.random() * 1000,
        stock: Math.floor(Math.random() * 100),
      },
      userId: 'perf-user',
    }));
    
    console.log(`📊 发布 ${iterations} 个事件...`);
    
    const publishStart = Date.now();
    await Promise.all(
      events.map(event => 
        daprEventPublisher.publishProductEvent(event)
      )
    );
    const publishEnd = Date.now();
    
    console.log(`✅ 批量发布完成，耗时: ${publishEnd - publishStart}ms`);
    
    // 状态操作测试
    const stateStart = Date.now();
    await Promise.all(
      Array.from({ length: iterations }, (_, i) =>
        daprClient.state.save(DAPR_CONFIG.stateStoreName, [
          { key: `perf:product:${i}`, value: { id: i, name: `产品${i}` } }
        ])
      )
    );
    const stateEnd = Date.now();
    
    console.log(`✅ 批量状态保存完成，耗时: ${stateEnd - stateStart}ms`);
    
    const totalTime = Date.now() - startTime;
    console.log(`🎯 性能测试完成，总耗时: ${totalTime}ms`);
  }
}

// 集成测试
class IntegrationTester {
  async runIntegrationTest(): Promise<void> {
    console.log('🔗 开始集成测试...\n');
    
    try {
      // 模拟完整业务流程
      console.log('1. 创建产品...');
      await daprEventPublisher.publishProductEvent({
        type: 'product.created',
        productId: 'integration-product-001',
        productData: {
          id: 'integration-product-001',
          name: '集成测试产品',
          price: 299.99,
          stock: 50,
        },
        userId: 'integration-user',
      });
      
      console.log('2. 创建订单...');
      await daprEventPublisher.publishOrderEvent({
        type: 'order.created',
        orderId: 'integration-order-001',
        orderData: {
          id: 'integration-order-001',
          orderNumber: 'INT-2024-001',
          totalAmount: 299.99,
          status: 'created',
          userId: 'integration-user',
          userEmail: 'integration@example.com',
          items: [
            { productId: 'integration-product-001', quantity: 1, price: 299.99 },
          ],
        },
        userId: 'integration-user',
      });
      
      console.log('3. 完成订单...');
      await daprEventPublisher.publishOrderEvent({
        type: 'order.completed',
        orderId: 'integration-order-001',
        orderData: {
          id: 'integration-order-001',
          orderNumber: 'INT-2024-001',
          totalAmount: 299.99,
          status: 'completed',
          userId: 'integration-user',
          userEmail: 'integration@example.com',
        },
        userId: 'integration-user',
      });
      
      console.log('✅ 集成测试完成');
      
    } catch (error) {
      console.error('集成测试失败:', error);
    }
  }
}

// 主函数
async function main() {
  const args = Deno.args;
  
  console.log('🚀 Dapr 集成测试工具\n');
  
  const tester = new DaprTester();
  const perfTester = new PerformanceTester();
  const integrationTester = new IntegrationTester();
  
  if (args.includes('--performance')) {
    await perfTester.runPerformanceTest();
  } else if (args.includes('--integration')) {
    await integrationTester.runIntegrationTest();
  } else {
    await tester.runAllTests();
  }
  
  console.log('\n🎉 测试完成！');
}

// 运行测试
if (import.meta.main) {
  main();
}
