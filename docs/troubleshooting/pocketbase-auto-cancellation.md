# PocketBase Auto-Cancellation 问题排查指南

## 问题概述

**问题现象**: GraphQL查询失败，后端抛出 `ClientResponseError 0: The request was autocancelled` 错误

**影响范围**: 使用PocketBase作为数据源的GraphQL服务器，特别是在有并发请求时

**严重程度**: 高 - 导致前端无法正常加载数据

## 错误特征

### 典型错误信息
```
Failed to fetch product categories: ClientResponseError 0: The request was autocancelled. 
You can find more info in https://github.com/pocketbase/js-sdk#auto-cancellation.
```

### 错误堆栈关键信息
- `isAbort: true`
- `originalError: AbortError: The signal has been aborted`
- `Client.cancelRequest` 在调用栈中
- `status: 0` (非HTTP错误)

## 根本原因分析

### 1. PocketBase JS SDK Auto-Cancellation 机制
- PocketBase JS SDK 内置了自动取消机制
- 当检测到同一个客户端有新的相同类型请求时，会自动取消之前未完成的请求
- 这是为了避免请求堆积和潜在的竞态条件

### 2. 触发条件
- **并发请求**: 前端快速发送多个GraphQL请求
- **页面切换**: 用户快速切换页面导致多个请求同时发出
- **重复点击**: 用户多次点击加载按钮
- **Apollo Client缓存策略**: 某些缓存策略可能导致多个请求

### 3. 为什么是问题
- GraphQL服务器期望所有请求都能成功完成
- 被取消的请求导致resolver抛出异常
- 前端收到错误响应，用户看到加载失败

## 排查步骤

### 1. 确认错误类型
```bash
# 检查错误日志中是否包含关键词
grep -r "autocancelled\|ClientResponseError 0" logs/
```

### 2. 复现问题
```bash
# 使用并发请求测试
for i in {1..5}; do
  curl -X POST -H "Content-Type: application/json" \
    -d '{"query":"query { productCategories { items { id } } }"}' \
    http://localhost:8082/graphql &
done
wait
```

### 3. 检查PocketBase客户端配置
```typescript
// 检查是否有特殊的请求配置
const pb = new PocketBase(url);
// 查看是否设置了 beforeSend 钩子或其他配置
```

### 4. 分析GraphQL resolver
```typescript
// 检查resolver中是否有并发的PocketBase调用
productCategories: async () => {
  // 多个await pb.collection().getList() 可能导致冲突
}
```

## 解决方案

### 方案1: 请求队列 (推荐)

#### 实现请求队列管理器
```typescript
// backend/config/pocketbase.ts
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    
    while (this.queue.length > 0) {
      const request = this.queue.shift()!;
      try {
        await request();
        // 添加小延迟避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Queue request failed:', error);
      }
    }
    
    this.processing = false;
  }
}

export class PocketBaseClient {
  private requestQueue = new RequestQueue();
  
  async queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return this.requestQueue.add(requestFn);
  }
}
```

#### 修改GraphQL Resolver
```typescript
// backend/resolvers/modules/category.ts
productCategories: async (_, { query }) => {
  await pocketbaseClient.ensureAuth();
  const pb = pocketbaseClient.getClient();
  
  // 使用请求队列
  const result = await pocketbaseClient.queueRequest(async () => {
    return await pb.collection('product_categories').getList(page, perPage, options);
  });
  
  return {
    items: result.items,
    pagination: {
      page: result.page,
      perPage: result.perPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems
    }
  };
}
```

### 方案2: 重试机制
```typescript
const maxRetries = 3;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    const result = await pb.collection('product_categories').getList();
    return result;
  } catch (error) {
    if (error?.name === 'ClientResponseError 0' && attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, attempt * 100));
      continue;
    }
    throw error;
  }
}
```

### 方案3: 前端Apollo Client优化
```typescript
// 简化Apollo Client配置，减少并发请求
const client = new ApolloClient({
  uri: GRAPHQL_ENDPOINT,
  fetchPolicy: 'no-cache', // 避免缓存导致的多重请求
});
```

## 实施步骤

### 1. 备份现有代码
```bash
git checkout -b fix/pocketbase-auto-cancellation
```

### 2. 实施请求队列
- 修改 `backend/config/pocketbase.ts`
- 修改所有使用PocketBase的resolver

### 3. 重启服务
```bash
# 停止现有服务
pkill -f "deno.*server.ts"

# 重启GraphQL服务器
cd backend && deno run --allow-net --allow-env --allow-read server.ts
```

### 4. 验证修复
```bash
# 单个请求测试
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"query { productCategories { items { id } } }"}' \
  http://localhost:8082/graphql

# 并发请求测试
for i in {1..10}; do
  curl -X POST -H "Content-Type: application/json" \
    -d '{"query":"query { productCategories { items { id } } }"}' \
    http://localhost:8082/graphql &
done
wait
```

## 验证清单

- [ ] 单个GraphQL查询正常返回数据
- [ ] 并发查询不再出现auto-cancellation错误
- [ ] 前端页面正常加载数据
- [ ] 服务器日志无相关错误
- [ ] 性能测试通过（请求延迟在可接受范围内）

## 预防措施

### 1. 代码层面
- 所有PocketBase请求都通过请求队列
- 避免在resolver中并发调用PocketBase API
- 实施统一的错误处理机制

### 2. 架构层面
- 考虑实施数据库连接池
- 监控PocketBase服务器性能
- 实施请求限流机制

### 3. 测试层面
- 添加并发请求的自动化测试
- 负载测试覆盖PocketBase相关功能
- 监控auto-cancellation错误的发生频率

## 性能影响

### 请求队列方案
- **延迟增加**: 每个请求增加约50ms延迟
- **吞吐量**: 略有降低，但错误率大幅减少
- **资源使用**: 内存使用量轻微增加

### 权衡考虑
- 稳定性 > 轻微性能损失
- 用户体验改善显著
- 维护成本降低

## 相关资源

- [PocketBase JS SDK Auto-cancellation](https://github.com/pocketbase/js-sdk#auto-cancellation)
- [GraphQL Error Handling Best Practices](https://graphql.org/learn/best-practices/#errors)
- [Apollo Client Caching](https://www.apollographql.com/docs/react/caching/cache-configuration/)

## 更新记录

| 日期 | 版本 | 更新内容 | 作者 |
|------|------|----------|------|
| 2025-06-14 | 1.0 | 初始版本，基于产品分类页面auto-cancellation问题 | Admin |

