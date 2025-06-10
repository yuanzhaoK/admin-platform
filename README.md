# 管理平台 - PocketBase 全栈项目

一个基于 PocketBase + Next.js 的现代化管理平台，展示完整的全栈开发流程。

## 🚀 项目特性

- **后端**: PocketBase + Deno/Node.js 双重支持
- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **UI组件**: shadcn/ui 组件库
- **数据库**: SQLite (通过 PocketBase)
- **认证**: 内置用户认证系统
- **实时**: 支持实时数据同步
- **CRUD演示**: 完整的数据生命周期演示
- **现代化**: Deno 原生支持，无需 node_modules

## 📁 项目结构

```
admin-platform/
├── backend/                    # PocketBase 后端
│   ├── collections/           # 集合业务逻辑钩子
│   │   └── products.pb.js     # 产品集合钩子
│   │   └── ...
│   ├── config/               # 配置文件
│   │   └── server.js         # 服务器配置
│   ├── pb_hooks/             # PocketBase 钩子
│   │   ├── init-collections.pb.js  # 数据库初始化
│   │   └── main.pb.js        # 主钩子文件
│   ├── pb_data/              # 数据库文件
│   ├── bin/                  # PocketBase 二进制文件
│   ├── server.js             # 直接服务器启动
│   ├── proxy-server.js       # 代理服务器(开发用)
│   └── package.json
├── frontend/                  # Next.js 前端
│   ├── src/
│   │   ├── app/              # App Router 页面
│   │   │   ├── dashboard/    # 仪表板页面
│   │   │   │   ├── products/ # 产品管理
│   │   │   │   ├── crud-demo/ # CRUD演示
│   │   │   │   └── ...
│   │   │   └── api/          # API 路由
│   │   ├── components/       # React 组件
│   │   ├── lib/              # 工具库
│   │   │   └── pocketbase.ts # PocketBase 客户端
│   │   └── contexts/         # React Context
│   └── package.json
└── README.md
```

## 🛠️ 快速开始

### 1. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 2. 启动后端服务

#### 🦕 使用 Deno (推荐)
```bash
cd backend

# 下载 PocketBase (首次运行)
deno task download-pb

# 启动代理服务器 (推荐开发环境)
deno task dev

# 或直接启动 PocketBase
deno task server
```

#### 📦 使用 Node.js (兼容)
```bash
cd backend

# 安装依赖
npm install

# 启动代理服务器
npm run dev

# 或直接启动 PocketBase
npm run server
```

后端服务将在以下地址启动：
- **代理服务器**: http://localhost:8091 (解决CORS问题)
- **PocketBase直接**: http://localhost:8090
- **管理界面**: http://localhost:8090/_/ 或 http://localhost:8091/_/

### 3. 启动前端服务

```bash
cd frontend
npm run dev
```

前端服务将在 http://localhost:3000 启动

### 4. 初始化数据

首次启动时，PocketBase 会自动：
- 创建必要的数据集合 (users, products)
- 创建测试管理员账户: `admin@example.com` / `admin123`
- 插入示例产品数据

## 📊 功能模块

### 1. 产品管理
- ✅ 产品列表展示
- ✅ 创建/编辑/删除产品
- ✅ 产品状态管理 (活跃/停用/草稿)
- ✅ 价格、分类、标签管理
- ✅ 实时数据同步

### 2. CRUD 演示
- ✅ 完整的数据生命周期演示
- ✅ 步骤化操作指引
- ✅ 技术栈说明
- ✅ 实时操作反馈

### 3. 用户管理
- ✅ 用户认证系统
- ✅ 角色权限控制
- ✅ 用户信息管理

## 🔧 开发指南

### 添加新的数据集合

1. **定义集合结构** (在 `pb_hooks/init-collections.pb.js`)
```javascript
const collection = new Collection({
  name: 'your_collection',
  type: 'base',
  schema: [
    {
      name: 'field_name',
      type: 'text',
      required: true
    }
  ],
  listRule: '@request.auth.id != ""',
  // ... 其他规则
});
```

2. **添加业务逻辑钩子** (在 `collections/your_collection.pb.js`)
```javascript
onRecordBeforeCreateRequest((e) => {
  if (e.collection.name !== 'your_collection') return;
  // 验证逻辑
});
```

3. **更新前端类型定义** (在 `frontend/src/lib/pocketbase.ts`)
```typescript
export interface YourModel {
  id: string;
  field_name: string;
  created: string;
  updated: string;
}
```

4. **添加API辅助函数**
```typescript
async getYourModels() {
  const records = await pb.collection('your_collection').getFullList<YourModel>();
  return { success: true, data: records };
}
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
```

#### 📦 Node.js 命令
```bash
# 清理数据库
npm run clean

# 重置数据库并重启
npm run reset

# 下载最新 PocketBase
npm run download-pb
```

## 🌐 API 接口

### 认证接口
- `POST /api/collections/users/auth-with-password` - 用户登录
- `POST /api/collections/users/auth-refresh` - 刷新token

### 产品接口
- `GET /api/collections/products/records` - 获取产品列表
- `POST /api/collections/products/records` - 创建产品
- `PATCH /api/collections/products/records/:id` - 更新产品
- `DELETE /api/collections/products/records/:id` - 删除产品

## 🔐 权限控制

### 集合权限规则
- **List/View**: `@request.auth.id != ""` (需要登录)
- **Create/Update/Delete**: `@request.auth.role = "admin"` (需要管理员权限)

### 前端路由保护
- 所有 `/dashboard/*` 路由需要认证
- 使用 `AuthContext` 进行状态管理

## 🚀 部署

### 生产环境部署

1. **构建前端**
```bash
cd frontend
npm run build
```

2. **配置 PocketBase**
```bash
cd backend
# 修改 config/server.js 中的生产环境配置
npm run start
```

3. **环境变量**
```bash
# .env.local
NEXT_PUBLIC_POCKETBASE_URL=https://your-domain.com
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [PocketBase](https://pocketbase.io/) - 优秀的后端服务
- [Next.js](https://nextjs.org/) - React 全栈框架
- [shadcn/ui](https://ui.shadcn.com/) - 现代化 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架 