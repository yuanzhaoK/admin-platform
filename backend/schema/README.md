# GraphQL Schema 模块化架构

本目录包含按功能模块组织的 GraphQL schema 定义。

## 📁 模块结构

```
schema/
├── index.ts           # 统一导出入口
├── modules/           # 模块化schema定义
│   ├── common.ts      # 🔧 通用类型 (JSON、分页、排序、根Query/Mutation)
│   ├── auth.ts        # 🔐 认证模块 (登录/登出)
│   ├── user.ts        # 👥 用户管理
│   ├── product.ts     # 📦 产品管理 (增强版本，包含关联字段)
│   ├── category.ts    # 🏷️  分类管理 (树形结构)
│   ├── brand.ts       # 🏢 品牌管理
│   ├── product-type.ts # 📊 产品类型管理
│   ├── order.ts       # 📋 订单管理
│   ├── refund.ts      # 💰 退款管理
│   └── setting.ts     # ⚙️  系统设置
└── README.md          # 📖 本文档
```

## 🚀 使用方式

### 统一导入 (推荐)
```typescript
import { typeDefs } from './schema/index.ts';
```

### 按模块导入
```typescript
import { productTypeDefs } from './schema/modules/product.ts';
import { categoryTypeDefs } from './schema/modules/category.ts';
```

## 📋 各模块功能

### 🔧 通用模块 (`common.ts`)
- `JSON` - JSON 标量类型
- `PaginationInfo` - 分页信息类型
- `SortOrder` - 排序枚举
- `Query` - 根查询类型 (健康检查)
- `Mutation` - 根变更类型 (占位符)

### 🔐 认证模块 (`auth.ts`)
- `AuthResponse` - 认证响应类型
- `LoginInput` - 登录输入类型
- **Mutations**: `login`, `logout`

### 📦 产品管理 (`product.ts`)
- **增强的产品类型** - 包含 20+ 字段
- **关联字段** - category, brand, product_type
- **统计类型** - ProductStats (总数、状态、库存等)
- **批量操作** - 状态更新、删除、价格调整
- **库存管理** - 库存操作和结果类型

### 🏷️ 分类管理 (`category.ts`)
- **树形结构** - 支持父子关系
- **状态管理** - active/inactive
- **SEO 字段** - seo_title, seo_description
- **查询**: `productCategories`, `productCategory`, `productCategoryTree`

### 🏢 品牌管理 (`brand.ts`)
- **品牌信息** - logo, website, 排序
- **状态管理** - active/inactive
- **查询**: `brands`, `brand`

### 📊 产品类型 (`product-type.ts`)
- **属性系统** - 支持多种属性类型
- **属性配置** - name, type, required, options
- **查询**: `productTypes`, `productType`

## 🔧 维护指南

### 添加新模块
1. 在 `modules/` 目录创建新的 `.ts` 文件
2. 导出 `*TypeDefs` 常量包含 GraphQL schema
3. 在 `index.ts` 中导入并合并
4. 使用 `extend type Query` 和 `extend type Mutation` 扩展根类型

### 模块间关联
- 使用类型关联而不是重复定义
- 在 resolvers 中实现关联字段的解析
- 保持类型定义的一致性

### 示例新模块
```typescript
// modules/example.ts
export const exampleTypeDefs = `
  type Example {
    id: String!
    name: String!
  }

  extend type Query {
    examples: [Example!]!
  }

  extend type Mutation {
    createExample(input: ExampleInput!): Example!
  }

  input ExampleInput {
    name: String!
  }
`;
```

## 🎯 设计原则

1. **模块职责单一** - 每个模块负责特定功能域
2. **类型复用** - 通用类型在 common.ts 中定义
3. **扩展而非重写** - 使用 extend 关键字扩展根类型
4. **关联明确** - 明确定义类型间的关联关系
5. **向后兼容** - 新增字段保持可选，避免破坏性变更

## 🔄 从单体到模块化

原来的大型 `typeDefs.ts` 文件已经按功能拆分为多个模块，提供了：
- **更好的组织** - 相关类型集中在一起
- **更容易维护** - 每个模块可以独立开发和测试
- **减少冲突** - 团队开发时减少文件合并冲突
- **清晰的职责** - 每个模块有明确的功能边界 