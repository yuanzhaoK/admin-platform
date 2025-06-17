# 移动端商城 API

基于现有backend架构扩展的移动端商城GraphQL API，支持Flutter等移动端应用的完整商城功能。

## 🚀 快速开始

### 1. 启动服务
```bash
cd backend
deno task dev
```

### 2. 初始化移动端数据
```bash
deno run --allow-net --allow-read --allow-write scripts/init-mobile-data.ts
```

### 3. 访问接口
- **GraphQL 端点**: http://localhost:8082/graphql
- **GraphiQL 界面**: http://localhost:8082/graphql (浏览器访问)
- **健康检查**: http://localhost:8082/health

## 📱 核心功能

### 首页模块
- ✅ 轮播图管理
- ✅ 套装展示 (现代简约、北欧风格、中式传统)
- ✅ 特色商品
- ✅ 分类导航
- ✅ 推荐商品

### 商品模块
- ✅ 商品列表 (支持分页、筛选、排序)
- ✅ 商品详情
- ✅ 商品搜索
- ✅ 分类筛选
- ✅ 品牌筛选
- ✅ 价格区间筛选
- ✅ 相关商品推荐

### 购物车模块
- ✅ 添加商品到购物车
- ✅ 购物车列表
- ✅ 修改商品数量
- ✅ 删除购物车商品
- ✅ 全选/取消全选
- ✅ 清空购物车

### 收藏模块
- ✅ 添加/取消收藏
- ✅ 收藏列表
- ✅ 收藏状态检查

### 地址管理
- ✅ 地址列表
- ✅ 添加地址
- ✅ 编辑地址
- ✅ 删除地址
- ✅ 设置默认地址

### 用户中心
- ✅ 用户信息
- ✅ 积分系统
- ✅ 成长值系统
- ✅ VIP会员体系
- ✅ 余额管理

### 订单管理
- ✅ 创建订单
- ✅ 订单列表
- ✅ 订单详情
- ✅ 取消订单
- ✅ 确认收货

### 其他功能
- ✅ 搜索历史
- ✅ 浏览历史
- ✅ 优惠券系统
- ✅ 系统通知
- ✅ 客服消息

## 🎯 接口示例

### 获取首页数据
```graphql
query {
  homeData {
    banners {
      id
      title
      image
      link_type
      link_value
    }
    packages {
      id
      name
      price
      market_price
      cover_image
      style_type
    }
    featured_products {
      id
      name
      price
      images
    }
  }
}
```

### 添加商品到购物车
```graphql
mutation {
  addToCart(input: {
    product_id: "product_id_here"
    quantity: 1
  }) {
    id
    quantity
    product {
      name
      price
    }
  }
}
```

## 📚 完整文档

详细的API文档请查看: [mobile-api.md](./docs/mobile-api.md)

## 🏗️ 架构说明

- **框架**: Deno + GraphQL
- **数据库**: PocketBase
- **认证**: JWT Token
- **文件上传**: PocketBase 文件系统
- **缓存**: GraphQL 内置缓存

## 📦 数据模型

### 核心集合 (Collections)
- `home_banners` - 首页轮播图
- `home_packages` - 首页套装  
- `cart_items` - 购物车项
- `favorites` - 收藏记录
- `addresses` - 收货地址
- `search_history` - 搜索历史
- `view_history` - 浏览历史
- `coupons` - 优惠券
- `user_coupons` - 用户优惠券
- `notifications` - 系统通知

## 🔧 开发说明

### 目录结构
```
backend/
├── schema/modules/mobile.ts      # 移动端 GraphQL Schema
├── resolvers/modules/mobile.ts   # 移动端 Resolvers
├── collections/mobile.json       # 数据库集合配置
├── scripts/init-mobile-data.ts   # 数据初始化脚本
└── docs/mobile-api.md            # 完整API文档
```

### 环境变量
```env
GRAPHQL_PORT=8082
POCKETBASE_URL=http://localhost:8090
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-password
```

## 🎨 Flutter 集成

推荐使用 `graphql_flutter` 包：

```yaml
dependencies:
  graphql_flutter: ^5.1.2
```

示例代码请参考完整文档中的 Flutter 集成部分。

## 🛡️ 安全性

- 用户认证: JWT Token
- 数据权限: PocketBase Rules
- 输入验证: GraphQL Schema 验证
- SQL 注入防护: PocketBase ORM

## 📈 性能优化

- GraphQL 查询优化
- 数据库索引
- 分页查询
- 图片懒加载
- 缓存策略

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## �� 许可证

MIT License 