# 后端架构说明

## 目录结构

```
backend/
├── schema/                    # GraphQL Schema 定义
│   ├── admin/                # 管理后台 Schema
│   │   ├── index.ts         # 管理后台模块索引
│   │   ├── product.ts       # 产品管理
│   │   ├── category.ts      # 分类管理
│   │   ├── brand.ts         # 品牌管理
│   │   ├── product-type.ts  # 产品类型管理
│   │   ├── order.ts         # 订单管理
│   │   ├── refund.ts        # 退款管理
│   │   ├── setting.ts       # 系统设置
│   │   └── user.ts          # 用户管理
│   ├── mobile/               # 移动端 Schema
│   │   ├── index.ts         # 移动端模块索引
│   │   ├── mobile.ts        # 移动端兼容接口
│   │   ├── app.ts           # 移动端APP专用接口
│   │   ├── auth.ts          # 认证相关
│   │   └── common.ts        # 公共类型
│   └── index.ts             # 主Schema索引
├── resolvers/                # GraphQL Resolvers 实现
│   ├── admin/               # 管理后台 Resolvers
│   │   ├── index.ts         # 管理后台模块索引
│   │   ├── product.ts       # 产品管理逻辑
│   │   ├── category.ts      # 分类管理逻辑
│   │   ├── brand.ts         # 品牌管理逻辑
│   │   ├── product-type.ts  # 产品类型管理逻辑
│   │   ├── order.ts         # 订单管理逻辑
│   │   ├── refund.ts        # 退款管理逻辑
│   │   ├── setting.ts       # 系统设置逻辑
│   │   ├── user.ts          # 用户管理逻辑
│   │   └── root.ts          # 根查询
│   ├── mobile/              # 移动端 Resolvers
│   │   ├── index.ts         # 移动端模块索引
│   │   ├── mobile.ts        # 移动端兼容逻辑
│   │   └── app.ts           # 移动端APP专用逻辑
│   └── index.ts             # 主Resolvers索引
└── ...其他目录
```

## 模块划分

### 管理后台模块 (Admin)

**目标用户**: 后台管理人员
**接口前缀**: 无前缀（原有接口）
**功能范围**:
- 产品管理（增删改查、批量操作）
- 分类管理（层级管理、排序）
- 品牌管理（品牌信息维护）
- 订单管理（订单处理、状态变更）
- 用户管理（用户信息、权限管理）
- 系统设置（配置管理）

**主要接口**:
- `products` - 产品列表查询
- `createProduct` - 创建产品
- `updateProduct` - 更新产品
- `deleteProduct` - 删除产品
- `orders` - 订单列表查询
- `updateOrderStatus` - 更新订单状态
- 等等...

### 移动端模块 (Mobile)

分为两个子模块：

#### 1. 兼容接口 (mobile.ts)
**目标**: 保持向后兼容
**接口前缀**: 无前缀
**功能**: 
- `homeData` - 首页数据
- `mobileProducts` - 产品查询
- `categoryData` - 分类数据
- `productDetail` - 产品详情

#### 2. APP专用接口 (app.ts)
**目标**: 专为Flutter移动应用设计
**接口前缀**: `app` 前缀
**功能**:
- `appHomeData` - 首页数据
- `appCart` - 购物车管理
- `appFavorites` - 收藏管理
- `appProfile` - 用户信息
- `appAddToCart` - 添加购物车
- `appCreateOrder` - 创建订单
- 等等...

## 接口命名规范

### 管理后台接口
- 查询: `products`, `orders`, `users`
- 变更: `createProduct`, `updateProduct`, `deleteProduct`
- 统计: `productStats`, `orderStats`

### 移动端APP接口
- 查询: `appHomeData`, `appCart`, `appProfile`
- 变更: `appAddToCart`, `appCreateOrder`, `appUpdateProfile`
- 操作: `appMarkNotificationRead`, `appSetDefaultAddress`

## 数据库集合

### 管理后台专用
- `products` - 产品信息
- `product_categories` - 产品分类
- `brands` - 品牌信息
- `product_types` - 产品类型
- `orders` - 订单信息
- `users` - 用户信息

### 移动端专用
- `home_banners` - 首页轮播图
- `home_packages` - 首页套装
- `cart_items` - 购物车项
- `favorites` - 收藏列表
- `addresses` - 用户地址
- `coupons` - 优惠券
- `user_coupons` - 用户优惠券
- `notifications` - 通知消息

### 共享集合
- `products` - 产品信息（管理后台维护，移动端查询）
- `product_categories` - 分类信息（管理后台维护，移动端查询）
- `orders` - 订单信息（移动端创建，管理后台处理）

## 权限控制

### 管理后台
- 需要管理员权限
- 完整的CRUD操作权限
- 可访问所有数据

### 移动端APP
- 需要用户登录
- 只能操作自己的数据
- 读取权限：产品、分类等公共数据
- 写入权限：购物车、收藏、地址、订单等个人数据

## 开发指南

### 添加新的管理后台功能
1. 在 `schema/admin/` 下创建新的 schema 文件
2. 在 `resolvers/admin/` 下实现对应的 resolvers
3. 在各自的 `index.ts` 中导出
4. 更新主 `schema/index.ts` 和 `resolvers/index.ts`

### 添加新的移动端功能
1. 在 `schema/mobile/app.ts` 中添加新的类型定义
2. 在 `resolvers/mobile/app.ts` 中实现对应的 resolvers
3. 使用 `app` 前缀命名所有新接口

### 数据库操作
- 统一使用 `pocketbaseClient.ensureAuth()` 进行认证
- 使用 `pocketbaseClient.getClient()` 获取客户端实例
- 为每个操作添加适当的错误处理

## 测试

### GraphQL 端点
- 开发环境: `http://localhost:8082/graphql`
- GraphiQL 界面: `http://localhost:8082/graphql`

### 示例查询

#### 管理后台
```graphql
query {
  products(query: { page: 1, perPage: 10 }) {
    items { id name price }
    pagination { totalItems }
  }
}
```

#### 移动端APP
```graphql
query {
  appHomeData {
    featured_products { id name price }
    categories { id name }
  }
}
``` 