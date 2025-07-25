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



# 仅启动 GraphQL 服务器
deno task graphql


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


## 已开发功能模块



### 1. GraphQL API
- ✅ 类型安全的 API 接口
- ✅ 模块化 Schema 设计
- ✅ 高效的数据查询
- ✅ 批量操作支持
- ✅ 错误处理和验证
- ✅ Apollo Client 集成

### 3. 用户管理
- ✅ 用户认证系统
- ✅ 用户信息管理
- ✅ 商品管理
- ✅ 营销管理
- ✅ 商品管理
- ✅ 订单管理
- ...
- 


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



## 🙏 致谢

- [PocketBase](https://pocketbase.io/) - 优秀的后端服务
- [GraphQL](https://graphql.org/) - 现代化的 API 查询语言
- [Apollo](https://www.apollographql.com/) - GraphQL 生态系统
- [Deno](https://deno.land/) - 现代化的 JavaScript 运行时
- [Next.js](https://nextjs.org/) - React 全栈框架
- [shadcn/ui](https://ui.shadcn.com/) - 现代化 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架 