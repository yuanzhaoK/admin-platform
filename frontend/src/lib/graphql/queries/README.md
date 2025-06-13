# GraphQL 查询模块结构

本目录包含按功能模块组织的 GraphQL 查询和变更操作。

## 📁 模块结构

```
queries/
├── index.ts           # 统一导出入口
├── auth.ts           # 🔐 认证模块 (登录/登出)
├── users.ts          # 👥 用户管理 (用户列表/详情)
├── system.ts         # 🏥 系统健康检查
├── product.ts        # 📦 产品管理 (CRUD + 批量操作)
├── category.ts       # 🏷️  分类管理 (树形结构)
├── brand.ts          # 🏢 品牌管理
└── product-type.ts   # 📊 产品类型管理
```

## 🚀 使用方式

### 统一导入 (推荐)
```typescript
import { 
  GET_PRODUCTS, 
  CREATE_PRODUCT, 
  GET_BRANDS,
  LOGIN_MUTATION 
} from '@/lib/graphql/queries';
```

### 按模块导入
```typescript
import { GET_PRODUCTS, CREATE_PRODUCT } from '@/lib/graphql/queries/product';
import { GET_BRANDS } from '@/lib/graphql/queries/brand';
import { LOGIN_MUTATION } from '@/lib/graphql/queries/auth';
```

## 📋 各模块功能

### 🔐 认证模块 (`auth.ts`)
- `LOGIN_MUTATION` - 用户登录
- `LOGOUT_MUTATION` - 用户登出

### 👥 用户管理 (`users.ts`)
- `GET_USERS` - 获取用户列表
- `GET_USER` - 获取单个用户
- `USER_FRAGMENT` - 用户信息片段

### 📦 产品管理 (`product.ts`)
- **查询**: `GET_PRODUCTS`, `GET_PRODUCT`, `GET_PRODUCT_STATS`
- **变更**: `CREATE_PRODUCT`, `UPDATE_PRODUCT`, `DELETE_PRODUCT`
- **批量**: `BATCH_UPDATE_PRODUCT_STATUS`, `BATCH_DELETE_PRODUCTS`
- **库存**: `GET_LOW_STOCK_PRODUCTS`, `UPDATE_PRODUCT_STOCK`
- **图片**: `UPLOAD_PRODUCT_IMAGE`, `DELETE_PRODUCT_IMAGE`

### 🏷️ 分类管理 (`category.ts`)
- **查询**: `GET_PRODUCT_CATEGORIES`, `GET_PRODUCT_CATEGORY_TREE`
- **变更**: `CREATE_PRODUCT_CATEGORY`, `UPDATE_PRODUCT_CATEGORY`

### 🏢 品牌管理 (`brand.ts`)
- **查询**: `GET_BRANDS`, `GET_BRAND`
- **变更**: `CREATE_BRAND`, `UPDATE_BRAND`, `DELETE_BRAND`

### 📊 产品类型 (`product-type.ts`)
- **查询**: `GET_PRODUCT_TYPES`, `GET_PRODUCT_TYPE`
- **变更**: `CREATE_PRODUCT_TYPE`, `UPDATE_PRODUCT_TYPE`

### 🏥 系统模块 (`system.ts`)
- `HEALTH_CHECK` - 健康检查

## 🔧 维护建议

1. **新增查询**: 按功能归类到相应模块
2. **命名规范**: 查询用 `GET_*`，变更用 `CREATE_*` / `UPDATE_*` / `DELETE_*`
3. **统一导出**: 在 `index.ts` 中添加导出
4. **类型安全**: 配合 TypeScript 接口使用 