# Dapr 集成指南

本文档介绍了如何在当前后端架构中集成Dapr（分布式应用程序运行时），实现现代化的微服务架构。

## 架构概览

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GraphQL API   │───▶│   Dapr Sidecar   │───▶│   Microservices │
│   Resolvers     │    │   Runtime        │    │   & Components  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Dapr Pub/Sub  │    │   Dapr State     │    │   Dapr Bindings │
│   Messaging     │    │   Management     │    │   & Tracing     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 为什么选择Dapr

### 相比RabbitMQ的优势
1. **云原生** - 原生支持Kubernetes和容器化
2. **多语言** - 支持所有主流编程语言
3. **标准化** - CNCF托管的开源项目
4. **功能丰富** - 内置状态管理、服务调用、发布订阅等
5. **可观测性** - 内置分布式追踪和监控
6. **可移植性** - 支持多种云平台和本地环境

### 核心能力
- **服务调用** - 服务间通信
- **状态管理** - 键值存储和状态持久化
- **发布订阅** - 消息队列和事件驱动
- **资源绑定** - 外部系统集成
- **可观测性** - 分布式追踪和监控
- **密钥管理** - 安全密钥存储

## 快速开始

### 1. 安装Dapr CLI

```bash
# macOS
brew install dapr/tap/dapr-cli

# Linux
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Windows
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```

### 2. 初始化Dapr

```bash
# 本地开发环境
dapr init

# 生产环境（Kubernetes）
dapr init -k
```

### 3. 启动服务

```bash
# 启动Dapr sidecar
dapr run --app-id admin-platform --app-port 8082 --dapr-http-port 3500 deno task dev

# 或者使用Docker Compose
docker-compose up -d
```

## 组件配置

### 1. 发布订阅组件 (`components/pubsub.yaml`)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

### 2. 状态存储组件 (`components/statestore.yaml`)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

### 3. 绑定组件 (`components/bindings.yaml`)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-binding
spec:
  type: bindings.kafka
  version: v1
  metadata:
  - name: brokers
    value: localhost:9092
  - name: topics
    value: product-events,order-events
```

## 使用示例

### 1. 发布事件

```typescript
import { DaprClient } from '@dapr/dapr';

const client = new DaprClient();

// 发布产品创建事件
await client.pubsub.publish('pubsub', 'product-events', {
  type: 'product.created',
  productId: product.id,
  productData: product,
  userId: context.user?.id || 'system',
  timestamp: new Date().toISOString(),
});

// 发布订单完成事件
await client.pubsub.publish('pubsub', 'order-events', {
  type: 'order.completed',
  orderId: order.id,
  orderData: order,
  userId: context.user?.id || 'system',
  timestamp: new Date().toISOString(),
});
```

### 2. 订阅事件

```typescript
import { DaprServer } from '@dapr/dapr';

const server = new DaprServer();

// 订阅产品事件
await server.pubsub.subscribe('pubsub', 'product-events', async (data) => {
  console.log('收到产品事件:', data);
  await handleProductEvent(data);
});

// 订阅订单事件
await server.pubsub.subscribe('pubsub', 'order-events', async (data) => {
  console.log('收到订单事件:', data);
  await handleOrderEvent(data);
});
```

### 3. 状态管理

```typescript
// 保存状态
await client.state.save('statestore', [
  {
    key: `product:${productId}`,
    value: productData,
  },
]);

// 获取状态
const product = await client.state.get('statestore', `product:${productId}`);

// 删除状态
await client.state.delete('statestore', `product:${productId}`);
```

### 4. 服务调用

```typescript
// 调用其他服务
const response = await client.invoker.invoke(
  'inventory-service',
  'check-stock',
  HttpMethod.POST,
  { productId, quantity }
);
```

## GraphQL集成

### 1. 订阅实现 (`resolvers/subscriptions.ts`)

```typescript
import { DaprClient } from '@dapr/dapr';

const daprClient = new DaprClient();

export const subscriptionResolvers = {
  Subscription: {
    productCreated: {
      subscribe: () => {
        return daprClient.pubsub.subscribe('pubsub', 'product-events');
      },
    },
    orderCompleted: {
      subscribe: () => {
        return daprClient.pubsub.subscribe('pubsub', 'order-events');
      },
    },
    realtimeStats: {
      subscribe: () => {
        return daprClient.pubsub.subscribe('pubsub', 'stats-updates');
      },
    },
  },
};
```

### 2. 实时数据流

```graphql
# 订阅产品创建事件
subscription {
  productCreated {
    id
    type
    productData {
      id
      name
      price
      stock
    }
    timestamp
  }
}

# 订阅订单状态更新
subscription {
  orderStatusUpdated {
    orderId
    status
    updatedAt
  }
}

# 订阅实时统计
subscription {
  realtimeStats {
    totalProducts
    totalOrders
    revenueToday
    activeUsers
  }
}
```

## 部署配置

### 1. Docker Compose

```yaml
version: '3.8'
services:
  admin-platform:
    build: .
    ports:
      - "8082:8082"
      - "3500:3500"
    environment:
      - DAPR_HTTP_PORT=3500
    depends_on:
      - redis
      - placement

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  placement:
    image: daprio/dapr
    command: ["./placement", "-port", "50005"]
    ports:
      - "50005:50005"
```

### 2. Kubernetes部署

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: admin-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: admin-platform
  template:
    metadata:
      labels:
        app: admin-platform
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "admin-platform"
        dapr.io/app-port: "8082"
    spec:
      containers:
      - name: admin-platform
        image: admin-platform:latest
        ports:
        - containerPort: 8082
```

## 监控和可观测性

### 1. 分布式追踪

```typescript
// 自动追踪
import { DaprClient } from '@dapr/dapr';

const client = new DaprClient({
  logger: {
    level: 'info',
  },
});

// 自定义追踪
await client.tracing.startSpan('process-order', {
  orderId,
  userId,
});
```

### 2. 指标监控

```bash
# 查看Dapr指标
curl http://localhost:3500/v1.0/metrics

# Prometheus集成
# 访问 http://localhost:9090
```

### 3. 日志查看

```bash
# 查看Dapr sidecar日志
dapr logs --app-id admin-platform

# 查看应用日志
dapr logs --app-id admin-platform --follow
```

## 高级功能

### 1. Actor模式

```typescript
import { ActorProxyBuilder } from '@dapr/dapr';

interface ProductActorInterface {
  updateStock(quantity: number): Promise<void>;
  getStock(): Promise<number>;
}

const builder = new ActorProxyBuilder<ProductActorInterface>(ProductActor);
const productActor = builder.build(new ActorId(productId));
```

### 2. 输入绑定

```typescript
// 处理外部事件
await server.binding.receive('cron-binding', async (data) => {
  console.log('定时任务触发:', data);
  await generateDailyReport();
});
```

### 3. 输出绑定

```typescript
// 发送邮件通知
await client.binding.send('email-binding', 'create', {
  to: 'admin@example.com',
  subject: '新订单通知',
  body: `新订单 #${orderId} 已创建`,
});
```

## 性能优化

### 1. 批量处理

```typescript
// 批量发布事件
await client.pubsub.publishBulk('pubsub', 'product-events', [
  { type: 'product.created', data: product1 },
  { type: 'product.created', data: product2 },
  { type: 'product.created', data: product3 },
]);
```

### 2. 并发控制

```typescript
// 配置并发限制
const server = new DaprServer({
  concurrency: 10,
});
```

## 故障排除

### 1. 常见问题

```bash
# 检查Dapr状态
dapr status

# 查看组件状态
dapr components

# 检查sidecar连接
curl http://localhost:3500/v1.0/health
```

### 2. 调试工具

```bash
# 启动Dapr dashboard
dapr dashboard

# 查看配置
dapr configurations
```

## 迁移指南

### 从RabbitMQ迁移到Dapr

1. **配置替换** - 将RabbitMQ配置替换为Dapr组件
2. **代码更新** - 使用Dapr SDK替换RabbitMQ客户端
3. **测试验证** - 确保功能一致性
4. **性能优化** - 利用Dapr的高级特性

### 兼容性

- 支持现有GraphQL schema
- 保持API接口不变
- 平滑迁移，零停机

## 最佳实践

1. **服务命名** - 使用清晰的服务ID
2. **事件命名** - 采用 `domain.action` 格式
3. **状态管理** - 合理使用状态存储
4. **错误处理** - 实现重试和降级机制
5. **监控告警** - 设置关键指标监控

## 相关文件

- `config/dapr.ts` - Dapr配置
- `services/dapr-publisher.ts` - Dapr事件发布
- `services/dapr-consumer.ts` - Dapr事件消费
- `components/` - Dapr组件配置
- `docker-compose.yml` - 容器化部署
- `k8s/` - Kubernetes部署配置
