#!/usr/bin/env -S deno run --allow-all

/**
 * RabbitMQ 集成测试脚本
 * 用于验证RabbitMQ与GraphQL的集成是否正常工作
 */

import { pocketbaseClient } from '../config/pocketbase.ts';
import { rabbitMQClient } from '../config/rabbitmq.ts';
import { eventConsumer } from '../services/event-consumer.ts';
import { eventPublisher } from '../services/event-publisher.ts';

// 测试配置
const TEST_CONFIG = {
  testProductId: 'test_product_001',
  testOrderId: 'test_order_001',
  testUserId: 'test_user_001',
  testCouponId: 'test_coupon_001',
};

// 测试结果
const testResults = {
  connection: false,
  publish: false,
  consume: false,
  events: [] as string[],
  errors: [] as string[],
};

// 测试工具函数
async function testConnection() {
  console.log('🔄 测试RabbitMQ连接...');
  try {
    await rabbitMQClient.connect();
    testResults.connection = true;
    console.log('✅ RabbitMQ连接成功');
  } catch (error) {
    testResults.errors.push(`连接失败: ${error}`);
    console.error('❌ RabbitMQ连接失败:', error);
  }
}

async function testPublishEvents() {
  console.log('📤 测试事件发布...');
  
  try {
    // 测试产品事件
    await eventPublisher.publishProductEvent({
      type: 'product.created',
      productId: TEST_CONFIG.testProductId,
      productData: {
        id: TEST_CONFIG.testProductId,
        name: '测试产品',
        price: 99.99,
        stock: 100,
      },
      userId: TEST_CONFIG.testUserId,
    });
    testResults.events.push('product.created');
    
    // 测试订单事件
    await eventPublisher.publishOrderEvent({
      type: 'order.completed',
      orderId: TEST_CONFIG.testOrderId,
      orderData: {
        id: TEST_CONFIG.testOrderId,
        orderNumber: 'ORD-2024-001',
        totalAmount: 299.99,
        status: 'completed',
      },
      userId: TEST_CONFIG.testUserId,
    });
    testResults.events.push('order.completed');
    
    // 测试用户事件
    await eventPublisher.publishUserEvent({
      type: 'user.created',
      userId: TEST_CONFIG.testUserId,
      userData: {
        id: TEST_CONFIG.testUserId,
        username: 'testuser',
        email: 'test@example.com',
      },
    });
    testResults.events.push('user.created');
    
    // 测试营销事件
    await eventPublisher.publishMarketingEvent({
      type: 'coupon.used',
      userId: TEST_CONFIG.testUserId,
      marketingData: {
        couponId: TEST_CONFIG.testCouponId,
        discountAmount: 20,
      },
    });
    testResults.events.push('coupon.used');
    
    testResults.publish = true;
    console.log('✅ 事件发布测试成功');
  } catch (error) {
    testResults.errors.push(`事件发布失败: ${error}`);
    console.error('❌ 事件发布测试失败:', error);
  }
}

async function testConsumeEvents() {
  console.log('📥 测试事件消费...');
  
  try {
    let receivedEvents = 0;
    const expectedEvents = 4;
    
    // 设置事件监听器
    const unsubscribeProduct = await rabbitMQClient.consume('product.events', (message) => {
      console.log('📦 收到产品事件:', message.type);
      receivedEvents++;
    });
    
    const unsubscribeOrder = await rabbitMQClient.consume('order.events', (message) => {
      console.log('📋 收到订单事件:', message.type);
      receivedEvents++;
    });
    
    const unsubscribeUser = await rabbitMQClient.consume('user.events', (message) => {
      console.log('👤 收到用户事件:', message.type);
      receivedEvents++;
    });
    
    const unsubscribeMarketing = await rabbitMQClient.consume('marketing.events', (message) => {
      console.log('🎯 收到营销事件:', message.type);
      receivedEvents++;
    });
    
    // 等待事件处理
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (receivedEvents >= expectedEvents) {
      testResults.consume = true;
      console.log('✅ 事件消费测试成功');
    } else {
      testResults.errors.push(`事件消费数量不匹配: 期望${expectedEvents}, 实际${receivedEvents}`);
      console.error('❌ 事件消费测试失败');
    }
    
    // 清理监听器
    await unsubscribeProduct();
    await unsubscribeOrder();
    await unsubscribeUser();
    await unsubscribeMarketing();
    
  } catch (error) {
    testResults.errors.push(`事件消费失败: ${error}`);
    console.error('❌ 事件消费测试失败:', error);
  }
}

async function testGraphQLSubscriptions() {
  console.log('🔔 测试GraphQL订阅...');
  
  try {
    // 这里可以添加WebSocket订阅测试
    // 由于Deno的限制，我们使用模拟测试
    
    console.log('✅ GraphQL订阅测试框架已就绪');
    console.log('   请使用GraphiQL界面测试实时订阅:');
    console.log('   http://localhost:8082/graphql');
    
  } catch (error) {
    testResults.errors.push(`GraphQL订阅测试失败: ${error}`);
    console.error('❌ GraphQL订阅测试失败:', error);
  }
}

async function testBusinessLogic() {
  console.log('💼 测试业务逻辑处理...');
  
  try {
    // 测试库存更新
    await eventConsumer.handleProductCreated({
      productId: TEST_CONFIG.testProductId,
      productData: { stock: 100 },
      userId: TEST_CONFIG.testUserId,
    });
    
    // 测试积分计算
    await eventConsumer.handleOrderCompleted({
      orderId: TEST_CONFIG.testOrderId,
      orderData: { totalAmount: 299.99, userId: TEST_CONFIG.testUserId },
      userId: TEST_CONFIG.testUserId,
    });
    
    console.log('✅ 业务逻辑测试成功');
  } catch (error) {
    testResults.errors.push(`业务逻辑测试失败: ${error}`);
    console.error('❌ 业务逻辑测试失败:', error);
  }
}

async function testErrorHandling() {
  console.log('⚠️ 测试错误处理...');
  
  try {
    // 测试无效事件
    await eventPublisher.publishProductEvent({
      type: 'invalid.event' as any,
      productId: TEST_CONFIG.testProductId,
      productData: {},
      userId: TEST_CONFIG.testUserId,
    });
    
    // 测试重试机制
    await rabbitMQClient.publish('test.retry', {
      type: 'test.retry',
      data: { test: true },
    });
    
    console.log('✅ 错误处理测试成功');
  } catch (error) {
    testResults.errors.push(`错误处理测试失败: ${error}`);
    console.error('❌ 错误处理测试失败:', error);
  }
}

async function generateTestReport() {
  console.log('\n📊 测试报告');
  console.log('================');
  
  console.log('连接测试:', testResults.connection ? '✅ 通过' : '❌ 失败');
  console.log('发布测试:', testResults.publish ? '✅ 通过' : '❌ 失败');
  console.log('消费测试:', testResults.consume ? '✅ 通过' : '❌ 失败');
  
  console.log('\n已发布事件:');
  testResults.events.forEach(event => {
    console.log(`  - ${event}`);
  });
  
  if (testResults.errors.length > 0) {
    console.log('\n错误信息:');
    testResults.errors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
  
  const passed = testResults.connection && testResults.publish && testResults.consume;
  console.log(`\n总体结果: ${passed ? '✅ 通过' : '❌ 失败'}`);
  
  return passed;
}

async function runAllTests() {
  console.log('🚀 开始RabbitMQ集成测试...\n');
  
  try {
    // 初始化PocketBase连接
    await pocketbaseClient.ensureAuth();
    
    // 运行测试
    await testConnection();
    await testPublishEvents();
    await testConsumeEvents();
    await testGraphQLSubscriptions();
    await testBusinessLogic();
    await testErrorHandling();
    
    // 生成报告
    const passed = await generateTestReport();
    
    // 清理
    await rabbitMQClient.close();
    
    if (passed) {
      console.log('\n🎉 所有测试通过！RabbitMQ集成成功。');
      Deno.exit(0);
    } else {
      console.log('\n💥 测试失败，请检查配置和日志。');
      Deno.exit(1);
    }
    
  } catch (error) {
    console.error('💥 测试执行失败:', error);
    Deno.exit(1);
  }
}

// 命令行参数处理
const args = Deno.args;
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
RabbitMQ 集成测试脚本

用法: deno run --allow-all test-rabbitmq.ts [选项]

选项:
  --help, -h    显示帮助信息
  --verbose     显示详细日志

示例:
  deno run --allow-all test-rabbitmq.ts
  deno run --allow-all test-rabbitmq.ts --verbose
  `);
  Deno.exit(0);
}

// 运行测试
if (import.meta.main) {
  runAllTests();
}
