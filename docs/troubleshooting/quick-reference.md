# 快速参考 - 常见问题

## 🚨 PocketBase Auto-Cancellation

**错误信号**: `ClientResponseError 0: The request was autocancelled`

**快速修复**:
```bash
# 1. 检查是否有多个相同请求
grep -r "ClientResponseError 0" logs/

# 2. 应用请求队列修复
# 编辑 backend/config/pocketbase.ts 添加请求队列
# 编辑 resolvers 使用 queueRequest()

# 3. 重启服务
pkill -f "deno.*server.ts"
cd backend && deno run --allow-net --allow-env --allow-read server.ts

# 4. 验证修复
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"query { productCategories { items { id } } }"}' \
  http://localhost:8082/graphql
```

**根本原因**: PocketBase SDK自动取消并发请求

**详细文档**: [pocketbase-auto-cancellation.md](./pocketbase-auto-cancellation.md)

---

## 📋 常用命令

### 服务管理
```bash
# 查看运行中的服务
ps aux | grep deno
ps aux | grep pocketbase

# 重启GraphQL服务器
pkill -f "deno.*server.ts"
cd backend && deno run --allow-net --allow-env --allow-read server.ts

# 重启PocketBase
pkill -f pocketbase
cd pocketbase && ./pocketbase serve
```

### 日志检查
```bash
# 检查错误日志
tail -f logs/error.log

# 搜索特定错误
grep -r "ClientResponseError" logs/
grep -r "Failed to fetch" logs/
```

### 数据库连接测试
```bash
# 测试PocketBase连接
curl http://localhost:8090/api/health

# 测试GraphQL连接
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { types { name } } }"}' \
  http://localhost:8082/graphql
```

---

## 🔧 调试技巧

### 1. 并发请求测试
```bash
# 测试5个并发请求
for i in {1..5}; do
  curl -X POST -H "Content-Type: application/json" \
    -d '{"query":"query { productCategories { items { id } } }"}' \
    http://localhost:8082/graphql &
done
wait
```

### 2. 检查请求时序
```bash
# 添加时间戳到请求
date && curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"query { productCategories { items { id } } }"}' \
  http://localhost:8082/graphql
```

### 3. 查看详细错误
```javascript
// 在resolver中添加详细日志
console.log('Request started:', new Date().toISOString());
try {
  const result = await pb.collection('categories').getList();
  console.log('Request completed:', new Date().toISOString());
} catch (error) {
  console.error('Request failed:', error.name, error.message);
  throw error;
}
```

---
