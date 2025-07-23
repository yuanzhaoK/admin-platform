# RabbitMQ 集成指南

本文档介绍了如何在当前后端架构中集成RabbitMQ消息队列系统，实现事件驱动架构。

## 架构概览

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GraphQL API   │───▶│   RabbitMQ       │───▶│   Event         │
│   Resolvers     │    │   Message Queue  │    │   Consumers     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Event         │    │   WebSocket      │    │   Business      │
│   Publisher     │    │   Subscriptions  │    │   Logic         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 核心组件

### 1. 消息队列配置 (`config/rabbitmq.ts`)
- 统一的RabbitMQ配置管理
- 支持多种消息队列模式（直接、主题、扇出、头部）
- 内置重试机制和错误处理

### 2. 事件发布服务 (`services/event-publisher.ts`)
- 标准化的事件发布接口
- 支持产品、订单、用户、营销等各类事件
- 批量事件发布功能

### 3. 事件消费服务 (`services/event-consumer.ts`)
- 自动事件路由和处理
- 内置业务逻辑处理（库存更新、积分计算、通知发送等）
- 可扩展的事件处理器架构

### 4. GraphQL订阅 (`resolvers/subscriptions.ts`)
- 实时事件推送
- WebSocket支持
- 细粒度的事件过滤

## 快速开始

### 1. 启动服务

```bash
# 启动GraphQL服务器（自动初始化RabbitMQ）
deno task dev

# 或者手动启动
deno run --allow-all server.ts
```

### 2. 验证集成

访问 `http://localhost:8082/graphql` 测试GraphQL接口。

## 使用示例

### 发布事件

在GraphQL resolver中发布事件：

```typescript
import { eventPublisher } from '../services/event-publisher.ts';

// 产品创建事件
await eventPublisher.publishProductEvent({
  type: 'product.created',
  productId: product.id,
  productData: product,
  userId: context.user?.id || 'system',
});

// 订单完成事件
await eventPublisher.publishOrderEvent({
  type: 'order.completed',
  orderId: order.id,
  orderData: order,
  userId: context.user?.id || 'system',
});
```

### 订阅事件

使用GraphQL订阅实时事件：

```graphql
# 订阅产品创建事件
subscription {
  productCreated {
    id
    type
    productId
    productData {
      id
      name
      price
    }
    userId
    timestamp
  }
}

# 订阅订单完成事件
subscription {
  orderCompleted {
    id
    type
    orderId
    orderData {
      id
      orderNumber
      totalAmount
    }
    userId
    timestamp
  }
}

# 订阅实时统计
subscription {
  realtimeStats {
    totalProducts
    totalOrders
    totalUsers
    revenueToday
    ordersToday
  }
}
```

### 自定义事件处理

添加自定义事件处理器：

```typescript
// 在事件消费者中添加新的处理器
await rabbitMQClient.consume('custom.events', async (message) => {
  console.log('处理自定义事件:', message);
  // 实现自定义业务逻辑
});
```

## 事件类型

### 产品事件
- `product.created` - 产品创建
- `product.updated` - 产品更新
- `product.deleted` - 产品删除

### 订单事件
- `order.created` - 订单创建
- `order.updated` - 订单更新
- `order.completed` - 订单完成
- `order.cancelled` - 订单取消

### 用户事件
- `user.created` - 用户创建
- `user.updated` - 用户更新
- `user.deleted` - 用户删除

### 营销事件
- `coupon.used` - 优惠券使用
- `points.earned` - 积分获取
- `member.upgraded` - 会员升级

### 通知事件
- `notification.general` - 通用通知
- `stock.low` - 库存预警

## 配置选项

### 环境变量

```bash
# RabbitMQ连接配置
RABBITMQ_URL=amqp://localhost:5672

# 消息队列配置
RABBITMQ_EXCHANGE=admin_platform
RABBITMQ_PREFETCH=10
RABBITMQ_MAX_RETRIES=3
```

### 队列配置

在 `config/rabbitmq.ts` 中配置：

```typescript
const config = {
  url: Deno.env.get('RABBITMQ_URL') || 'amqp://localhost:5672',
  exchange: {
    name: 'admin_platform',
    type: 'topic',
    durable: true,
  },
  queues: {
    product_events: { name: 'product.events', durable: true },
    order_events: { name: 'order.events', durable: true },
    user_events: { name: 'user.events', durable: true },
    notification_events: { name: 'notification.events', durable: true },
    marketing_events: { name: 'marketing.events', durable: true },
  },
  prefetch: 10,
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};
```

## 监控和调试

### 查看事件统计

```typescript
import { rabbitMQClient } from './config/rabbitmq.ts';

// 获取消息队列状态
const status = rabbitMQClient.getStatus();
console.log('消息队列状态:', status);

// 获取事件统计
const stats = rabbitMQClient.getStats();
console.log('事件统计:', stats);
```

### 调试工具

1. **GraphiQL界面**: `http://localhost:8082/graphql`
2. **健康检查**: `http://localhost:8082/health`
3. **事件监控**: 查看控制台日志输出

## 扩展指南

### 添加新的事件类型

1. 在 `config/rabbitmq.ts` 中定义事件接口
2. 在 `services/event-publisher.ts` 中添加发布方法
3. 在 `services/event-consumer.ts` 中添加处理器
4. 在 `schema/subscriptions.graphql` 中添加订阅定义
5. 在 `resolvers/subscriptions.ts` 中添加订阅实现

### 集成外部系统

```typescript
// 示例：集成邮件服务
await rabbitMQClient.consume('notification.email', async (message) => {
  const { to, subject, body } = message.data;
  await sendEmail(to, subject, body);
});
```

## 性能优化

### 批量处理

```typescript
// 批量发布事件
await eventPublisher.publishBatch([
  { routingKey: 'product.created', data: product1 },
  { routingKey: 'product.created', data: product2 },
  { routingKey: 'product.created', data: product3 },
]);
```

### 异步处理

```typescript
// 异步事件处理
await rabbitMQClient.consume('product.events', async (message) => {
  // 立即确认消息，后台异步处理
  setTimeout(async () => {
    await processProductEvent(message);
  }, 0);
});
```

## 故障排除

### 常见问题

1. **连接失败**: 检查RabbitMQ服务是否运行
2. **事件丢失**: 检查队列持久化配置
3. **性能问题**: 调整prefetch和并发设置

### 日志级别

```typescript
// 启用详细日志
DEBUG=rabbitmq:* deno task dev
```

## 最佳实践

1. **事件命名**: 使用 `domain.action` 格式
2. **数据大小**: 保持事件数据简洁，避免大对象
3. **错误处理**: 始终实现重试机制
4. **监控**: 设置事件处理指标监控
5. **测试**: 使用模拟事件进行集成测试

## 相关文件

- `config/rabbitmq.ts` - 消息队列配置
- `services/event-publisher.ts` - 事件发布服务
- `services/event-consumer.ts` - 事件消费服务
- `resolvers/subscriptions.ts` - GraphQL订阅实现
- `schema/subscriptions.graphql` - 订阅schema定义
