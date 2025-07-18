# 管理平台设置指南 - GraphQL 架构

## 项目架构

本项目采用现代化的 GraphQL 全栈架构，包含以下组件：

- **前端**: Next.js + React + TypeScript + Tailwind CSS + Apollo Client
- **API层**: GraphQL + Apollo Server (Deno)
- **后端**: PocketBase (数据库和认证)
- **数据库**: PocketBase (内置SQLite)
- **类型系统**: 完整的 TypeScript 类型安全

## 服务架构图

```
Frontend (Next.js + Apollo Client :3000)
    ↓ GraphQL queries/mutations
GraphQL Server (Deno + Apollo Server :8082)
    ↓ REST API calls
PocketBase (:8090)
    ↓ SQLite operations
Database (pb_data/)
```

```
┌─────────────────────────────────────────────────────────────┐
│                    前端层 (Next.js 15)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   Next.js   │  │  Apollo      │  │   shadcn/ui        │  │
│  │  App Router │  │  Client      │  │   组件库           │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ GraphQL (HTTP)
┌─────────────────────────┴───────────────────────────────────┐
│                    API网关层 (Deno)                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   GraphQL   │  │  Apollo      │  │   权限控制         │  │
│  │   Server    │  │  Server      │  │   中间件           │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
┌─────────────────────────┴───────────────────────────────────┐
│                   数据层 (PocketBase)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │   SQLite    │  │   实时       │  │   文件存储         │  │
│  │  Database   │  │   同步       │  │   服务             │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

```

## 快速启动

### 1. 启动后端服务栈

```bash
cd backend

# 首次运行需要下载PocketBase
deno task download-pb

# 启动完整服务栈 (推荐)
deno task dev
```

这会同时启动：
- **PocketBase 服务器**: http://localhost:8090 (数据库和认证)
- **GraphQL 服务器**: http://localhost:8082 (API层)
- **代理服务器**: http://localhost:8091 (开发代理，解决 CORS)

### 单独启动服务 (可选)

```bash
# 仅启动 PocketBase
deno task pocketbase

# 仅启动 GraphQL 服务器
deno task graphql

# 仅启动代理服务器
deno task proxy
```

### 2. 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

### 3. 访问各种管理界面

- **前端应用**: http://localhost:3000
- **PocketBase 管理界面**: http://localhost:8090/_/
- **GraphQL Playground**: http://localhost:8082/graphql (开发环境)

### 4. 配置 PocketBase 数据库
   
访问 PocketBase 管理界面：http://localhost:8090/_/

#### 创建管理员账户
首次访问时会提示创建管理员账户，推荐设置：
- 邮箱：admin@admin.com
- 密码：1234567890

> **注意**: 这些凭据将用于系统登录和数据管理

#### 自动创建集合 (推荐)

系统会自动创建必要的集合，包括：
- `users` - 用户集合
- `products` - 产品集合

如果需要手动创建，请参考下面的手动配置步骤。

#### 手动创建 products 集合 (如果需要)

1. 在管理界面中，点击 "Collections" → "New collection"
2. 选择 "Base collection"，命名为 "products"
3. 添加以下字段：
   - `name` (Text, 必填)
   - `description` (Text, 可选)
   - `price` (Number, 可选)
   - `category` (Text, 可选)
   - `status` (Select, 必填, 选项: active, inactive, draft)
   - `tags` (JSON, 可选)
   - `sku` (Text, 可选)
   - `stock` (Number, 可选)
   - `weight` (Number, 可选)
   - `dimensions` (JSON, 可选)
   - `images` (JSON, 可选)
   - `meta_data` (JSON, 可选)

4. **重要**: 清空所有API规则以避免权限问题
   - List rule: 留空
   - View rule: 留空  
   - Create rule: 留空
   - Update rule: 留空
   - Delete rule: 留空

### 5. 创建测试用户
1. 在 users 集合中，点击 "New record"
2. 设置：
   - Email: admin@example.com
   - Password: admin123
   - Name: 系统管理员
   - Role: admin
   - Verified: ✓ (勾选)

### 6. 测试 GraphQL API

访问 GraphQL Playground: http://localhost:8082/graphql

尝试以下查询：

```graphql
# 获取所有产品
query GetProducts {
  products {
    id
    name
    description
    price
    status
    created
    updated
  }
}

# 创建产品
mutation CreateProduct {
  createProduct(input: {
    name: "测试产品"
    description: "这是一个测试产品"
    price: 99.99
    status: active
    category: "electronics"
  }) {
    id
    name
    price
    status
  }
}
```

### 7. 测试前端应用
   
访问前端应用：http://localhost:3000
   
使用测试账户登录：
- 邮箱：admin@example.com
- 密码：admin123

## GraphQL 功能特性

### 产品管理 API

- **查询操作**:
  - `products` - 获取产品列表 (支持分页、过滤、排序)
  - `product(id)` - 获取单个产品
  - `productsByCategory(category)` - 按分类获取产品
  - `searchProducts(query)` - 搜索产品
  - `lowStockProducts(threshold)` - 获取低库存产品

- **变更操作**:
  - `createProduct(input)` - 创建产品
  - `updateProduct(id, input)` - 更新产品
  - `deleteProduct(id)` - 删除产品
  - `batchUpdateProductStatus(ids, status)` - 批量更新状态
  - `batchDeleteProducts(ids)` - 批量删除

- **高级功能**:
  - 价格范围过滤
  - 库存范围过滤
  - 标签过滤
  - 分类管理
  - 图片管理
  - 数据导出 (JSON/CSV/Excel)

### 前端 GraphQL 集成

前端使用 Apollo Client 进行 GraphQL 集成：

```typescript
// 查询示例
const { data, loading, error } = useQuery(GET_PRODUCTS, {
  variables: {
    page: 1,
    perPage: 10,
    filter: {
      status: 'active',
      priceMin: 0,
      priceMax: 1000
    }
  }
});

// 变更示例
const [createProduct] = useMutation(CREATE_PRODUCT, {
  refetchQueries: [{ query: GET_PRODUCTS }]
});
```

## 故障排除

### GraphQL 服务器问题
- 检查端口 8082 是否被占用
- 确认 Deno 权限设置正确
- 查看 GraphQL 服务器日志

### Apollo Client 错误
- 检查 GraphQL 端点配置 (http://localhost:8082/graphql)
- 确认网络连接正常
- 查看浏览器开发者工具的网络面板

### PocketBase 连接问题
- 确认 PocketBase 在端口 8090 正常运行
- 检查数据库文件权限
- 查看 PocketBase 日志

### CORS 错误
- 使用代理服务器 (端口 8091)
- 确认前端配置指向正确的端点
- 检查 GraphQL 服务器的 CORS 设置

### 登录失败
1. 检查浏览器控制台是否有错误信息
2. 确认 users 集合已创建
3. 确认测试用户已创建且已验证
4. 检查认证流程和 token 处理

## 开发工具

### 可用的 Deno 任务

```bash
# 查看所有可用任务
deno task

# 常用任务
deno task dev          # 启动完整开发环境
deno task pocketbase   # 仅启动 PocketBase
deno task graphql      # 仅启动 GraphQL 服务器
deno task proxy        # 仅启动代理服务器
deno task clean        # 清理数据库
deno task reset        # 重置数据库并重启
deno task download-pb  # 下载最新 PocketBase
```

### GraphQL 开发

1. **Schema 开发**: 在 `backend/schema/modules/` 中定义类型
2. **Resolver 开发**: 在 `backend/resolvers/modules/` 中实现逻辑
3. **前端查询**: 在 `frontend/src/lib/graphql/` 中定义查询
4. **类型生成**: 使用 GraphQL Code Generator (可选)

## 技术架构详解

### 后端架构
```
GraphQL Layer (Apollo Server)
    ↓ 类型安全的 API
Business Logic (Resolvers)
    ↓ 数据操作
PocketBase Client
    ↓ REST API 调用
PocketBase Server
    ↓ SQLite 操作
Database (pb_data/)
```

### 前端架构
```
React Components
    ↓ GraphQL Hooks
Apollo Client
    ↓ GraphQL Queries/Mutations
GraphQL Server
    ↓ 数据获取
PocketBase
```

## 环境要求

- **Deno**: 1.40+ (后端)
- **Node.js**: 18+ (前端)
- **现代浏览器**: 支持 ES2020+

## 端口使用

- **3000**: Next.js 前端应用
- **8082**: GraphQL 服务器 (Apollo Server)
- **8090**: PocketBase 服务器 (数据库和认证)
- **8091**: 代理服务器 (开发环境，解决 CORS)

## 生产环境部署

### 1. 构建前端
```bash
cd frontend
npm run build
npm run export  # 如果需要静态导出
```

### 2. 配置后端
```bash
cd backend
# 修改生产环境配置
deno task start
```

### 3. 环境变量
```bash
# .env.local (前端)
NEXT_PUBLIC_GRAPHQL_URL=https://your-domain.com/graphql
NEXT_PUBLIC_POCKETBASE_URL=https://your-domain.com

# 后端环境变量
POCKETBASE_URL=http://localhost:8090
GRAPHQL_PORT=8082
NODE_ENV=production
```

### 4. 反向代理配置 (Nginx 示例)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
    }

    # GraphQL API
    location /graphql {
        proxy_pass http://localhost:8082;
    }

    # PocketBase API
    location /api/ {
        proxy_pass http://localhost:8090;
    }

    # PocketBase 管理界面
    location /_/ {
        proxy_pass http://localhost:8090;
    }
}
``` 