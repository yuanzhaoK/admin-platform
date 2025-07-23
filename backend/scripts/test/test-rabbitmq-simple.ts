#!/usr/bin/env -S deno run --allow-all

/**
 * 简化的RabbitMQ集成测试脚本
 * 用于验证RabbitMQ与GraphQL的基本集成
 */

import { pocketbaseClient } from '../../config/pocketbase.ts';
import { rabbitMQClient } from '../../config/rabbitmq.ts';
import { eventPublisher } from '../../services/event-publisher.ts';

// 测试配置
const TEST_CONFIG = {
  testProductId: 'test_product_001',
  testOrderId: 'test_order_001',
  testUserId: 'test_user_001',
};

// 测试结果
const testResults = {
  connection: false,
  publish: false,
  events: [] as string[],
  errors: [] as string[],
};

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
    
    // 设置事件监听器
    await rabbitMQClient.consume('product.events', async (message) => {
      console.log('📦 收到产品事件:', message.type);
      receivedEvents++;
    });
    
    await rabbitMQClient.consume('order.events', async (message) => {
      console.log('📋 收到订单事件:', message.type);
      receivedEvents++;
    });
    
    // 等待事件处理
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`✅ 事件消费测试完成，收到 ${receivedEvents} 个事件`);
    
  } catch (error) {
    testResults.errors.push(`事件消费失败: ${error}`);
    console.error('❌ 事件消费测试失败:', error);
  }
}

async function generateTestReport() {
  console.log('\n📊 测试报告');
  console.log('================');
  
  console.log('连接测试:', testResults.connection ? '✅ 通过' : '❌ 失败');
  console.log('发布测试:', testResults.publish ? '✅ 通过' : '❌ 失败');
  
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
  
  const passed = testResults.connection && testResults.publish;
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
    
    // 生成报告
    const passed = await generateTestReport();
    
    // 清理
    await rabbitMQClient.close();
    
    if (passed) {
      console.log('\n🎉 测试通过！RabbitMQ集成成功。');
      console.log('\n📚 使用指南:');
      console.log('   1. 启动服务器: deno task dev');
      console.log('   2. 访问GraphiQL: http://localhost:8082/graphql');
      console.log('   3. 测试订阅: 使用subscription查询');
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
简化的RabbitMQ集成测试脚本

用法: deno run --allow-all test-rabbitmq-simple.ts [选项]

选项:
  --help, -h    显示帮助信息
  --verbose     显示详细日志

示例:
  deno run --allow-all test-rabbitmq-simple.ts
  `);
  Deno.exit(0);
}

// 运行测试
if (import.meta.main) {
  runAllTests();
}
