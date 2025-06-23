# GraphQL Schema 架构

## 概述

本目录包含项目的 GraphQL Schema 定义，使用标准的 `.graphql` 文件格式，符合 GraphQL 最新标准范式。

## 文件结构

```
schema/
├── base.graphql                 # 基础类型定义
├── common/                      # 通用模块
│   └── auth.graphql             # 认证管理
├── admin/                       # 管理后台 Schema
│   ├── user.graphql             # 用户管理
│   ├── product.graphql          # 产品管理
│   ├── category.graphql         # 分类管理
│   ├── brand.graphql            # 品牌管理
│   ├── product-type.graphql     # 产品类型管理
│   ├── order.graphql            # 订单管理
│   ├── refund.graphql           # 退款管理
│   └── setting.graphql          # 系统设置
├── mobile/                      # 移动端 Schema
│   └── app.graphql              # 移动端应用
├── loader.ts                    # Schema 加载器
├── index.ts                     # 统一导出
└── README.md                    # 本文档
```

## 核心文件说明

### 1. base.graphql
包含项目的基础类型定义：
- 标量类型 (JSON, Date, Upload)
- 基础枚举 (SortOrder, Status)
- 通用类型 (PaginationInfo, OperationResult)
- 根查询和变更类型

### 2. common/*.graphql
通用模块的 Schema 定义：
- **auth.graphql**: 认证管理相关类型（登录、注册、会话管理等）

### 3. admin/*.graphql
管理后台相关的 Schema 定义：
- **user.graphql**: 用户管理相关类型
- **product.graphql**: 产品管理相关类型
- **category.graphql**: 分类管理相关类型
- **brand.graphql**: 品牌管理相关类型
- **product-type.graphql**: 产品类型管理相关类型
- **order.graphql**: 订单管理相关类型
- **refund.graphql**: 退款管理相关类型
- **setting.graphql**: 系统设置相关类型

### 4. mobile/app.graphql
移动端应用的 Schema 定义：
- 移动端用户类型
- 首页数据类型
- 购物车相关类型
- 收藏和地址管理
- 订单和通知类型

### 5. loader.ts
Schema 加载器，负责：
- 读取和合并所有 .graphql 文件
- 提供 Schema 验证功能
- 构建可执行的 GraphQL Schema

## 使用方法

### 1. 导入 Schema
```typescript
import { getTypeDefs, validateSchema } from './schema/index.ts';

// 获取合并后的 Schema 字符串
const typeDefs = getTypeDefs();

// 验证 Schema 语法
const isValid = validateSchema();
```

### 2. 验证 Schema
```bash
# 运行验证脚本
deno task validate-schema

# 或使用别名
deno task schema-check
```

### 3. 添加新的 Schema 文件
1. 在相应目录创建 `.graphql` 文件
2. 在 `loader.ts` 中添加文件路径
3. 运行验证确保语法正确

## Schema 设计原则

### 1. 模块化
- 按功能领域划分文件
- 使用 `extend` 关键字扩展根类型
- 保持单个文件的合理大小

### 2. 命名规范
- 文件名: kebab-case (如 `product-type.graphql`)
- 类型名: PascalCase (如 `ProductType`)
- 字段名: camelCase (如 `productType`)
- 枚举值: UPPER_CASE (如 `ACTIVE`)

### 3. 类型安全
- 使用 `ID!` 作为主键类型
- 适当使用非空类型 (`!`)
- 为输入类型提供默认值
- 使用描述性的枚举值

### 4. 文档注释
- 为公共类型添加描述
- 使用三引号格式: `"""描述"""`
- 提供使用示例和注意事项

## 类型定义示例

### 基础类型
```graphql
type Product {
  id: ID!
  name: String!
  description: String
  price: Float
  status: ProductStatus!
  created: Date!
  updated: Date!
}
```

### 枚举类型
```graphql
enum ProductStatus {
  ACTIVE
  INACTIVE
  DRAFT
}
```

### 输入类型
```graphql
input ProductInput {
  name: String!
  description: String
  price: Float
  status: ProductStatus = ACTIVE
}
```

### 查询扩展
```graphql
extend type Query {
  """获取产品列表"""
  products(query: ProductQueryInput): ProductsResponse!
  
  """获取单个产品"""
  product(id: ID!): Product
}
```

## 最佳实践

### 1. 字段设计
- 使用语义化的字段名
- 考虑字段的可空性
- 提供合理的默认值
- 避免过度嵌套

### 2. 输入验证
- 为必填字段使用非空类型
- 提供输入约束信息
- 使用枚举限制可选值
- 考虑输入的合理性

### 3. 响应设计
- 使用统一的响应格式
- 提供分页信息
- 包含必要的元数据
- 考虑性能优化

### 4. 错误处理
- 定义清晰的错误类型
- 提供有用的错误信息
- 使用标准的错误格式
- 考虑国际化需求

## 工具支持

### 1. IDE 集成
- VS Code GraphQL 扩展
- 语法高亮和智能提示
- 错误检查和格式化
- Schema 验证

### 2. 开发工具
- GraphiQL 交互式查询
- Schema 文档生成
- 类型定义导出
- 测试工具集成

### 3. 构建工具
- 自动化验证
- Schema 合并
- 代码生成
- 部署检查

## 版本控制

### 变更管理
- 记录 Schema 变更历史
- 使用语义化版本控制
- 考虑向后兼容性
- 提供迁移指南

### 发布流程
1. 修改相应的 `.graphql` 文件
2. 运行 `deno task validate-schema` 验证
3. 更新相关文档
4. 提交变更并创建版本标签

## 故障排除

### 常见问题
1. **Schema 验证失败**: 检查语法错误和类型引用
2. **类型未定义**: 确保所有引用的类型都已定义
3. **循环依赖**: 避免类型之间的循环引用
4. **性能问题**: 优化查询结构和字段设计

### 调试技巧
- 使用 GraphiQL 测试查询
- 检查服务器日志
- 验证 Schema 完整性
- 使用开发工具分析

## 扩展计划

### 即将添加的功能
- [ ] 通知管理 Schema
- [ ] 文件管理 Schema
- [ ] 日志管理 Schema
- [ ] 统计分析 Schema
- [ ] 工作流管理 Schema

### 长期规划
- 支持 GraphQL Federation
- 集成实时订阅
- 增强类型安全
- 性能优化

---

更多信息请参考 [GRAPHQL_MIGRATION_GUIDE.md](../docs/GRAPHQL_MIGRATION_GUIDE.md) 