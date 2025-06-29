# 管理平台 - PocketBase + GraphQL 全栈项目

一个基于 PocketBase + GraphQL + Next.js 的现代化管理平台，展示完整的全栈开发流程。

## 🚀 项目特性

- **后端**: PocketBase + Deno GraphQL Server
- **API层**: GraphQL + Apollo Server
- **前端**: Next.js 14 + TypeScript + Tailwind CSS + Apollo Client
- **UI组件**: shadcn/ui 组件库
- **数据库**: SQLite (通过 PocketBase)
- **认证**: 内置用户认证系统
- **实时**: 支持实时数据同步
- **类型安全**: 完整的 TypeScript 类型系统
- **现代化**: Deno 原生支持，无需 node_modules

## 📁 项目结构

```
admin-platform/
├── backend/                    # 后端服务
│   ├── schema/                # GraphQL Schema 定义
│   │   ├── modules/           # 模块化 Schema
│   │   │   ├── product.ts     # 产品模块 Schema
│   │   │   └── user.ts        # 用户模块 Schema
│   │   └── index.ts           # Schema 入口
│   ├── resolvers/             # GraphQL Resolvers
│   │   ├── modules/           # 模块化 Resolvers
│   │   │   ├── product.ts     # 产品模块 Resolvers
│   │   │   └── user.ts        # 用户模块 Resolvers
│   │   └── index.ts           # Resolvers 入口
│   ├── types/                 # TypeScript 类型定义
│   │   └── index.ts           # 类型定义
│   ├── utils/                 # 工具函数
│   │   └── pocketbase.ts      # PocketBase 客户端
│   ├── pb_hooks/              # PocketBase 钩子
│   │   └── main.pb.js         # 主钩子文件
│   ├── pb_data/               # 数据库文件
│   ├── bin/                   # PocketBase 二进制文件
│   ├── server.ts              # GraphQL 服务器
│   ├── proxy-server.ts        # 代理服务器(开发用)
│   └── deno.json              # Deno 配置
├── frontend/                  # Next.js 前端
│   ├── src/
│   │   ├── app/              # App Router 页面
│   │   │   ├── dashboard/    # 仪表板页面
│   │   │   │   ├── products/ # 产品管理
│   │   │   │   └── ...
│   │   │   └── api/          # API 路由
│   │   ├── components/       # React 组件
│   │   ├── lib/              # 工具库
│   │   │   ├── apollo.ts     # Apollo Client 配置
│   │   │   ├── graphql/      # GraphQL 查询和服务
│   │   │   │   ├── queries.ts # GraphQL 查询定义
│   │   │   │   └── product.ts # 产品 GraphQL 服务
│   │   │   └── pocketbase.ts # PocketBase 客户端
│   │   └── contexts/         # React Context
│   └── package.json
└── README.md
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
# 前端依赖
cd frontend
npm install

# 后端使用 Deno，无需安装依赖
```

### 2. 启动后端服务

#### 🦕 使用 Deno (推荐)
```bash
cd backend

# 下载 PocketBase (首次运行)
deno task download-pb

# 启动完整服务栈 (推荐)
deno task dev
```

这将启动：
- **PocketBase**: http://localhost:8090 (数据库服务)
- **GraphQL Server**: http://localhost:8082 (GraphQL API)
- **代理服务器**: http://localhost:8091 (开发代理)

#### 单独启动服务
```bash
# 仅启动 PocketBase
deno task pocketbase

# 仅启动 GraphQL 服务器
deno task graphql

# 启动代理服务器
deno task proxy
```

### 3. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将在 http://localhost:3000 启动

### 4. 访问管理界面

- **前端应用**: http://localhost:3000
- **PocketBase 管理**: http://localhost:8090/_/
- **GraphQL Playground**: http://localhost:8082/graphql

### 5. 初始化数据

首次启动时，系统会自动：
- 创建必要的数据集合 (users, products)
- 创建测试管理员账户: `admin@example.com` / `admin123`
- 插入示例产品数据

## 📊 功能模块

### 1. 产品管理 (GraphQL 驱动)
- ✅ 产品列表展示 (分页、过滤、排序)
- ✅ 创建/编辑/删除产品
- ✅ 批量操作 (状态更新、删除、价格调整)
- ✅ 产品状态管理 (活跃/停用/草稿)
- ✅ 高级过滤 (价格范围、库存范围、标签)
- ✅ 分类管理
- ✅ 库存管理和预警
- ✅ 搜索和推荐
- ✅ 数据导出 (JSON/CSV/Excel)
- ✅ 图片管理
- ✅ 实时数据同步

### 2. GraphQL API
- ✅ 类型安全的 API 接口
- ✅ 模块化 Schema 设计
- ✅ 高效的数据查询
- ✅ 批量操作支持
- ✅ 错误处理和验证
- ✅ Apollo Client 集成

### 3. 用户管理
- ✅ 用户认证系统
- ✅ 角色权限控制
- ✅ 用户信息管理

## 🔧 开发指南

### GraphQL 开发

#### 添加新的 GraphQL 模块

1. **定义 Schema** (在 `backend/schema/modules/your_module.ts`)
```typescript
export const yourModuleTypeDefs = `
  type YourType {
    id: ID!
    name: String!
    created: String!
    updated: String!
  }

  extend type Query {
    yourTypes: [YourType!]!
    yourType(id: ID!): YourType
  }

  extend type Mutation {
    createYourType(input: YourTypeInput!): YourType!
    updateYourType(id: ID!, input: YourTypeInput!): YourType!
    deleteYourType(id: ID!): Boolean!
  }

  input YourTypeInput {
    name: String!
  }
`;
```

2. **实现 Resolvers** (在 `backend/resolvers/modules/your_module.ts`)
```typescript
import { pb } from '../../utils/pocketbase.ts';

export const yourModuleResolvers = {
  Query: {
    yourTypes: async () => {
      const records = await pb.collection('your_collection').getFullList();
      return records;
    },
    yourType: async (_: any, { id }: { id: string }) => {
      const record = await pb.collection('your_collection').getOne(id);
      return record;
    },
  },
  Mutation: {
    createYourType: async (_: any, { input }: { input: any }) => {
      const record = await pb.collection('your_collection').create(input);
      return record;
    },
    // ... 其他 mutations
  },
};
```

3. **更新前端查询** (在 `frontend/src/lib/graphql/queries.ts`)
```typescript
export const GET_YOUR_TYPES = gql`
  query GetYourTypes {
    yourTypes {
      id
      name
      created
      updated
    }
  }
`;
```

### 数据库操作

#### 🦕 Deno 命令
```bash
# 清理数据库
deno task clean

# 重置数据库并重启
deno task reset

# 下载最新 PocketBase
deno task download-pb

# 查看所有可用任务
deno task
```

## 🌐 API 架构

### GraphQL API (端口 8082)
```
POST /graphql - GraphQL 查询和变更
GET /graphql - GraphQL Playground (开发环境)
```

### PocketBase API (端口 8090)
```
POST /api/collections/users/auth-with-password - 用户登录
POST /api/collections/users/auth-refresh - 刷新token
GET /api/collections/*/records - 获取记录列表
POST /api/collections/*/records - 创建记录
PATCH /api/collections/*/records/:id - 更新记录
DELETE /api/collections/*/records/:id - 删除记录
```

### 服务架构
```
Frontend (Next.js + Apollo Client :3000)
    ↓ GraphQL queries
GraphQL Server (Deno + Apollo Server :8082)
    ↓ REST API calls
PocketBase (:8090)
    ↓ SQLite operations
Database (pb_data/)
```

## 🔐 权限控制

### PocketBase 集合权限
- **List/View**: `@request.auth.id != ""` (需要登录)
- **Create/Update/Delete**: `@request.auth.role = "admin"` (需要管理员权限)

### GraphQL 权限
- 在 Resolvers 中实现权限检查
- 基于 PocketBase 认证状态
- 支持角色级别的访问控制

### 前端路由保护
- 所有 `/dashboard/*` 路由需要认证
- 使用 `AuthContext` 进行状态管理
- Apollo Client 自动处理认证状态

## 🚀 部署

### 生产环境部署

1. **构建前端**
```bash
cd frontend
npm run build
```

2. **配置后端服务**
```bash
cd backend
# 修改生产环境配置
deno task start
```

3. **环境变量**
```bash
# .env.local
NEXT_PUBLIC_GRAPHQL_URL=https://your-domain.com/graphql
NEXT_PUBLIC_POCKETBASE_URL=https://your-domain.com
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request



## 🙏 致谢

- [PocketBase](https://pocketbase.io/) - 优秀的后端服务
- [GraphQL](https://graphql.org/) - 现代化的 API 查询语言
- [Apollo](https://www.apollographql.com/) - GraphQL 生态系统
- [Deno](https://deno.land/) - 现代化的 JavaScript 运行时
- [Next.js](https://nextjs.org/) - React 全栈框架
- [shadcn/ui](https://ui.shadcn.com/) - 现代化 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架 