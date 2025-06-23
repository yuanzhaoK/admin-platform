# 类型定义模块

本目录包含了 Admin Platform 项目的所有 TypeScript 类型定义，采用模块化组织结构，提供完整的类型安全支持。

## 📁 目录结构

```
types/
├── index.ts          # 主导出文件，统一导出所有类型
├── base.ts           # 基础类型和通用枚举
├── user.ts           # 用户相关类型
├── product.ts        # 产品相关类型
├── order.ts          # 订单相关类型
├── refund.ts         # 退款相关类型
├── system.ts         # 系统设置和认证相关类型
└── README.md         # 本文档
```

## 🔧 使用方法

### 基础导入

```typescript
// 导入所有类型
import * as Types from '@/types';

// 导入特定类型
import { User, Product, Order } from '@/types';

// 使用 type 关键字导入类型（推荐）
import type { UserQuery, ProductInput, OrderStats } from '@/types';
```

### 按模块导入

```typescript
// 仅导入用户相关类型
import type { User, UserQuery, UserInput } from '@/types/user';

// 仅导入产品相关类型
import type { Product, ProductCategory, Brand } from '@/types/product';
```

## 📋 类型分类

### 基础类型 (`base.ts`)
- **枚举类型**: `Status`, `SortOrder`, `UserRole`, `UserStatus`, `ProductStatus`, `ReviewStatus`
- **通用接口**: `PaginationInfo`, `ApiResponse`, `OperationResult`, `BaseEntity`, `BaseQuery`
- **工具类型**: `DateRangeQuery`, `AmountRangeQuery`

### 用户类型 (`user.ts`)
- **实体**: `User`, `UserActivity`
- **查询**: `UserQuery`
- **输入**: `UserInput`, `UserUpdateInput`, `AdminChangePasswordInput`
- **统计**: `UserStats`
- **响应**: `UsersResponse`

### 产品类型 (`product.ts`)
- **实体**: `Product`, `ProductCategory`, `Brand`, `ProductType`
- **查询**: `ProductQuery`
- **输入**: `ProductInput`, `ProductUpdateInput`, `StockAdjustmentInput`
- **统计**: `ProductStats`
- **操作**: `StockOperationResult`, `ExportResult`

### 订单类型 (`order.ts`)
- **实体**: `Order`, `OrderItem`, `ShippingAddress`, `LogisticsInfo`
- **枚举**: `OrderStatus`, `PaymentMethod`, `OrderSource`, `OrderType`
- **查询**: `OrderQuery`
- **输入**: `OrderInput`, `OrderItemInput`, `ShippingAddressInput`
- **统计**: `OrderStats`

### 退款类型 (`refund.ts`)
- **实体**: `RefundRequest`, `RefundItem`, `RefundTimeline`
- **枚举**: `RefundType`, `RefundReason`, `RefundStatus`, `RefundMethod`
- **查询**: `RefundQuery`
- **输入**: `RefundRequestInput`, `RefundProcessInput`
- **统计**: `RefundStats`

### 系统类型 (`system.ts`)
- **实体**: `SystemSetting`, `AuthSession`, `AuthAttempt`
- **枚举**: `AuthProvider`, `TokenType`, `SessionStatus`, `SettingType`
- **认证**: `AuthResponse`, `LoginInput`, `RegisterInput`
- **设备**: `DeviceInfo`, `PasswordPolicy`, `TwoFactorAuth`

## 🛠️ 工具类型

项目提供了一些有用的工具类型：

```typescript
// 提取实体ID类型
type UserId = EntityId<User>; // string

// 创建输入类型（排除系统字段）
type UserCreateInput = CreateInput<User>;

// 更新输入类型（所有字段可选）
type UserUpdateInput = UpdateInput<User>;

// 分页响应类型
type UserListResponse = PaginatedResponse<User>;

// 查询过滤器类型
type UserFilter = QueryFilter<User>;
```

## 📝 命名约定

### 接口命名
- **实体接口**: 使用名词，如 `User`, `Product`, `Order`
- **查询接口**: 以 `Query` 结尾，如 `UserQuery`, `ProductQuery`
- **输入接口**: 以 `Input` 结尾，如 `UserInput`, `ProductInput`
- **响应接口**: 以 `Response` 结尾，如 `UsersResponse`, `ProductsResponse`
- **统计接口**: 以 `Stats` 结尾，如 `UserStats`, `ProductStats`

### 枚举命名
- 使用小写字母和下划线，如 `'active'`, `'pending_payment'`
- 保持与数据库中存储的值一致

### 字段命名
- 使用 snake_case 格式，与 PocketBase 数据库字段保持一致
- 关联字段以 `_id` 结尾，如 `user_id`, `category_id`
- 时间字段以 `_at` 结尾，如 `created_at`, `updated_at`

## 🔄 版本控制

- **版本**: 1.0.0
- **兼容性**: 向后兼容，废弃的类型会标记 `@deprecated`
- **更新**: 新增类型不会影响现有代码，修改类型会提供迁移指南

## 📚 最佳实践

### 1. 类型导入
```typescript
// ✅ 推荐：使用 type 关键字
import type { User, UserQuery } from '@/types';

// ❌ 避免：直接导入可能增加打包体积
import { User, UserQuery } from '@/types';
```

### 2. 可选字段处理
```typescript
// ✅ 推荐：明确处理可选字段
const user: User = {
  id: '123',
  email: 'user@example.com',
  name: user.name || '未设置',
  created: new Date().toISOString(),
  updated: new Date().toISOString()
};
```

### 3. 枚举使用
```typescript
// ✅ 推荐：使用类型安全的枚举
const status: ProductStatus = 'active';

// ❌ 避免：使用字符串字面量
const status = 'active';
```

### 4. 查询参数
```typescript
// ✅ 推荐：使用类型化的查询参数
const query: ProductQuery = {
  page: 1,
  perPage: 20,
  status: 'active',
  category_id: 'cat_123'
};
```

## 🔗 相关文档

- [GraphQL Schema 文档](../schema/README.md)
- [API 接口文档](../docs/)
- [数据库设计文档](../docs/)

## 🤝 贡献指南

### 添加新类型
1. 确定类型所属的模块（user, product, order 等）
2. 在对应的模块文件中添加类型定义
3. 在 `index.ts` 中添加导出
4. 更新本 README 文档
5. 添加相应的 JSDoc 注释

### 修改现有类型
1. 评估变更的影响范围
2. 如果是破坏性变更，添加 `@deprecated` 标记
3. 提供迁移指南
4. 更新相关文档

---

**维护者**: Admin Platform Team  
**最后更新**: 2024-06-23 