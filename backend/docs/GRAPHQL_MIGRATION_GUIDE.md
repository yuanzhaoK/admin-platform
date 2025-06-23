# GraphQL 标准化迁移指南

## 概述

项目已成功迁移到 GraphQL 最新标准范式，使用标准的 `.graphql` 文件替代原有的 TypeScript 内嵌模式。

## 主要变更

### 1. Schema 文件结构

#### 之前 (TypeScript 内嵌)
```typescript
// backend/schema/admin/product.ts
export const productTypeDefs = `
  type Product {
    id: String!
    name: String!
    // ...
  }
`;
```

#### 现在 (标准 .graphql 文件)
```graphql
# backend/schema/admin/product.graphql
type Product {
  id: ID!
  name: String!
  # ...
}
```

### 2. 新的文件结构

```
backend/schema/
├── base.graphql              # 基础类型定义
├── admin/
│   ├── product.graphql       # 产品管理
│   ├── category.graphql      # 分类管理
│   └── brand.graphql         # 品牌管理
├── mobile/
│   └── app.graphql           # 移动端应用
├── loader.ts                 # Schema 加载器
└── index.ts                  # 统一导出
```

### 3. 新的导入方式

#### 之前
```typescript
import { typeDefs } from "./schema/index.ts";
```

#### 现在
```typescript
import { getTypeDefs, validateSchema } from "./schema/index.ts";

// 验证 schema
if (!validateSchema()) {
  console.error('Schema 验证失败！');
  Deno.exit(1);
}

const typeDefs = getTypeDefs();
```

## 关键优势

### 1. 标准化
- 使用业界标准的 `.graphql` 文件格式
- 更好的工具支持（语法高亮、格式化、校验）
- IDE 集成更完善

### 2. 维护性
- 类型定义与实现代码分离
- 更清晰的文件组织结构
- 更好的版本控制体验

### 3. 开发体验
- 内置 schema 验证
- 更好的错误提示
- 支持 GraphQL 工具链

### 4. 性能优化
- 按需加载 schema 文件
- 构建时验证
- 更好的缓存机制

## 新功能

### 1. Schema 验证
```bash
# 验证 GraphQL schema 语法
deno task validate-schema

# 或使用别名
deno task schema-check
```

### 2. 类型安全
- 使用标准 GraphQL 语法
- 更严格的类型检查
- 运行时验证

### 3. 现代化语法
- 使用 `ID!` 替代 `String!` 作为主键
- 支持默认值：`page: Int = 1`
- 更好的注释支持：`"""描述"""`

## 迁移检查清单

- [x] ✅ 创建基础 schema 文件 (`base.graphql`)
- [x] ✅ 迁移通用 schemas
  - [x] 认证管理 (`common/auth.graphql`)
- [x] ✅ 迁移管理后台 schemas
  - [x] 用户管理 (`admin/user.graphql`)
  - [x] 产品管理 (`admin/product.graphql`)
  - [x] 分类管理 (`admin/category.graphql`)
  - [x] 品牌管理 (`admin/brand.graphql`)
  - [x] 产品类型管理 (`admin/product-type.graphql`)
  - [x] 订单管理 (`admin/order.graphql`)
  - [x] 退款管理 (`admin/refund.graphql`)
  - [x] 系统设置 (`admin/setting.graphql`)
- [x] ✅ 迁移移动端 schema (`mobile/app.graphql`)
- [x] ✅ 创建 Schema 加载器 (`loader.ts`)
- [x] ✅ 更新服务器配置
- [x] ✅ 添加验证脚本
- [x] ✅ 更新 deno.json 任务
- [x] ✅ 解决类型冲突和重复定义
- [x] ✅ 验证完整性和语法正确性

## 使用指南

### 1. 开发流程
1. 修改相应的 `.graphql` 文件
2. 运行 `deno task validate-schema` 验证语法
3. 重启服务器以应用更改

### 2. 添加新类型
1. 在相应的 `.graphql` 文件中定义类型
2. 使用 `extend type Query` 或 `extend type Mutation` 扩展操作
3. 在 `loader.ts` 中添加新文件的加载路径

### 3. Schema 文件组织原则
- 按功能模块划分文件
- 使用 `extend` 关键字扩展根类型
- 保持文件大小适中
- 添加详细的注释

## 向后兼容性

项目保留了向后兼容性：
- 现有的 TypeScript resolver 无需修改
- 旧的导入方式仍然可用（通过 `legacyTypeDefs`）
- 渐进式迁移支持

## 故障排除

### 1. Schema 验证失败
```bash
deno task validate-schema
```
检查错误信息并修复 `.graphql` 文件中的语法问题。

### 2. 服务器启动失败
确保所有 `.graphql` 文件语法正确，并且 `loader.ts` 中包含了所有必要的文件路径。

### 3. 类型不匹配
检查 resolver 中的字段名称是否与 `.graphql` 文件中的定义一致。

## 最佳实践

1. **命名规范**
   - 文件名使用 kebab-case
   - 类型名使用 PascalCase
   - 字段名使用 camelCase

2. **文档注释**
   - 为所有公共类型添加描述
   - 使用三引号注释：`"""描述"""`

3. **类型安全**
   - 尽量使用非空类型 (`!`)
   - 为输入类型提供默认值
   - 使用适当的标量类型

4. **版本控制**
   - 记录 schema 变更
   - 考虑向后兼容性
   - 使用语义化版本 