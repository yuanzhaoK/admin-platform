# 后端架构说明

## 目录结构

```
backend/
├── schema/                    # GraphQL Schema 定义
│   ├── admin/                # 管理后台 Schema
│   │   ├── product.graphql       # 产品管理
│   │   ├── category.graphql      # 分类管理
│   │   ├── brand.graphql         # 品牌管理
│   │   ├── product-type.graphql  # 产品类型管理
│   │   ├── order.graphql         # 订单管理
│   │   ├── refund.graphql        # 退款管理
│   │   ├── setting.graphql       # 系统设置
│   │   ├── user.graphql          # 用户管理
│   │   ├── member.graphql        # 会员管理
│   │   ├── coupon.graphql        # 优惠券管理
│   │   ├── points.graphql        # 积分管理
│   │   ├── recommendation.graphql # 商品推荐管理
│   │   ├── advertisement.graphql  # 广告管理
│   │   └── trending.graphql      # 热门管理
│   ├── mobile/               # 移动端 Schema
│   │   ├── app.graphql          # 移动端APP专用接口
│   │   └── legacy.ts            # 移动端兼容接口
│   ├── common/               # 公共 Schema
│   │   └── auth.graphql         # 认证相关
│   ├── base.graphql          # 基础类型定义
│   ├── index.ts              # 主Schema索引
│   ├── loader.ts             # Schema加载器
│   └── README.md             # Schema文档说明
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
│   │   ├── member.ts        # 会员管理逻辑
│   │   ├── coupon.ts        # 优惠券管理逻辑
│   │   ├── points.ts        # 积分管理逻辑
│   │   ├── recommendation.ts # 商品推荐管理逻辑
│   │   ├── advertisement.ts  # 广告管理逻辑
│   │   ├── trending.ts      # 热门管理逻辑
│   │   ├── global-search.ts # 全局搜索逻辑
│   │   └── root.ts          # 根查询
│   ├── mobile/              # 移动端 Resolvers
│   │   ├── index.ts         # 移动端模块索引
│   │   ├── app.ts           # 移动端APP专用逻辑
│   │   ├── legacy.ts        # 移动端兼容逻辑
│   │   ├── user.ts          # 移动端用户逻辑
│   │   └── mobile.ts.backup # 移动端备份文件
│   └── index.ts             # 主Resolvers索引
├── types/                   # TypeScript 类型定义
│   ├── base.ts              # 基础类型
│   ├── product.ts           # 产品相关类型
│   ├── order.ts             # 订单相关类型
│   ├── user.ts              # 用户相关类型
│   ├── member.ts            # 会员相关类型
│   ├── coupon.ts            # 优惠券相关类型
│   ├── points.ts            # 积分相关类型
│   ├── recommendation.ts    # 推荐相关类型
│   ├── advertisement.ts     # 广告相关类型
│   ├── trending.ts          # 热门相关类型
│   ├── refund.ts            # 退款相关类型
│   ├── system.ts            # 系统相关类型
│   ├── index.ts             # 类型索引
│   └── README.md            # 类型文档说明
├── config/                  # 配置文件
│   ├── pocketbase.ts        # PocketBase配置
│   └── server.ts            # 服务器配置
├── utils/                   # 工具函数
│   ├── client.ts            # 客户端工具
│   └── ProductUtils.ts      # 产品工具函数
├── services/                # 服务层
│   ├── ProductRepository.ts # 产品仓储
│   └── ProductService.ts    # 产品服务
├── middlewares/             # 中间件
│   ├── ProductController.ts # 产品控制器
│   └── ProductRouter.ts     # 产品路由
├── scalars/                 # GraphQL标量类型
│   └── index.ts             # 标量类型定义
├── scripts/                 # 脚本文件
│   ├── create-collections/  # 集合创建脚本
│   ├── data-export.ts       # 数据导出
│   ├── data-import.ts       # 数据导入
│   ├── data-manager.ts      # 数据管理
│   ├── setup.sh             # 环境设置
│   ├── validate-schema.ts   # Schema验证
│   └── verify-orders.ts     # 订单验证
├── collections/             # 集合数据
│   ├── mobile.json          # 移动端集合
│   ├── order_settings/      # 订单设置
│   ├── orders/              # 订单数据
│   ├── production/          # 生产环境数据
│   └── refund/              # 退款数据
├── help/                    # 帮助文档
│   ├── collection-blueprints.ts # 集合蓝图
│   ├── collection-creator-framework.ts # 集合创建框架
│   ├── COLLECTION-CREATOR-GUIDE.md # 集合创建指南
│   ├── create-collection-cli.ts # 集合创建CLI
│   ├── FRAMEWORK-SUMMARY.md # 框架总结
│   └── README.md            # 帮助文档
├── docs/                    # 文档
│   ├── GRAPHQL_MIGRATION_GUIDE.md # GraphQL迁移指南
│   └── mobile-api.md        # 移动端API文档
├── pb_data/                 # PocketBase数据目录
├── pb_hooks/                # PocketBase钩子
├── pb_migrations/           # PocketBase迁移
├── backups/                 # 备份文件
├── bin/                     # 二进制文件
├── server.ts                # 主服务器文件
├── proxy-server.ts          # 代理服务器
├── simple-start.ts          # 简单启动文件
├── setup-admin.ts           # 管理员设置
├── clean.ts                 # 清理脚本
├── download-pocketbase.ts   # PocketBase下载脚本
├── deno.json                # Deno配置
├── deno.lock                # Deno锁文件
├── ARCHITECTURE.md          # 架构文档
├── GRAPHQL_MIGRATION_COMPLETE.md # GraphQL迁移完成文档
└── README-mobile.md         # 移动端README
```

## 前端目录结构

```
frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── dashboard/       # 管理后台页面
│   │   │   ├── layout.tsx   # 后台布局组件
│   │   │   ├── page.tsx     # 后台首页
│   │   │   ├── products/    # 产品管理页面
│   │   │   │   ├── page.tsx            # 产品列表
│   │   │   │   ├── create/page.tsx     # 创建产品
│   │   │   │   ├── management/         # 产品管理
│   │   │   │   ├── brands/page.tsx     # 品牌管理
│   │   │   │   ├── categories/page.tsx # 分类管理
│   │   │   │   └── types/page.tsx      # 类型管理
│   │   │   ├── orders/      # 订单管理页面
│   │   │   │   ├── page.tsx            # 订单列表
│   │   │   │   ├── list/page.tsx       # 订单列表
│   │   │   │   ├── detail/[id]/page.tsx # 订单详情
│   │   │   │   ├── refunds/page.tsx    # 退款管理
│   │   │   │   └── settings/page.tsx   # 订单设置
│   │   │   ├── marketing/   # 营销管理页面
│   │   │   │   ├── page.tsx            # 营销首页
│   │   │   │   ├── members/page.tsx    # 会员管理
│   │   │   │   ├── coupons/page.tsx    # 优惠券管理
│   │   │   │   ├── points/page.tsx     # 积分管理
│   │   │   │   ├── recommendations/page.tsx # 推荐管理
│   │   │   │   ├── advertisements/page.tsx  # 广告管理
│   │   │   │   └── trending/page.tsx        # 热门管理
│   │   │   ├── users/page.tsx       # 用户管理
│   │   │   ├── settings/page.tsx    # 系统设置
│   │   │   ├── functions/           # 函数管理
│   │   │   ├── aircode/page.tsx     # AirCode集成
│   │   │   ├── crud-demo/page.tsx   # CRUD演示
│   │   │   ├── i18n-demo/page.tsx   # 国际化演示
│   │   │   └── search-demo/page.tsx # 搜索演示
│   │   ├── test-auth/page.tsx   # 认证测试
│   │   ├── globals.css          # 全局样式
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.tsx             # 首页
│   │   └── favicon.ico          # 网站图标
│   ├── components/          # React组件
│   │   ├── products/        # 产品相关组件
│   │   │   ├── ProductTable.tsx        # 产品表格
│   │   │   ├── ProductForm.tsx         # 产品表单
│   │   │   ├── ProductFilters.tsx      # 产品筛选
│   │   │   ├── ProductEditModal.tsx    # 产品编辑弹窗
│   │   │   ├── ProductViewModal.tsx    # 产品查看弹窗
│   │   │   └── ProductBatchActions.tsx # 产品批量操作
│   │   ├── providers/       # Context提供者
│   │   │   ├── GraphQLProvider.tsx     # GraphQL提供者
│   │   │   └── ThemeProvider.tsx       # 主题提供者
│   │   ├── ui/              # UI组件库
│   │   │   ├── button.tsx              # 按钮组件
│   │   │   ├── input.tsx               # 输入框组件
│   │   │   ├── table.tsx               # 表格组件
│   │   │   ├── dialog.tsx              # 对话框组件
│   │   │   ├── form.tsx                # 表单组件
│   │   │   ├── card.tsx                # 卡片组件
│   │   │   ├── badge.tsx               # 徽章组件
│   │   │   ├── tabs.tsx                # 标签页组件
│   │   │   ├── select.tsx              # 选择器组件
│   │   │   ├── checkbox.tsx            # 复选框组件
│   │   │   ├── switch.tsx              # 开关组件
│   │   │   ├── textarea.tsx            # 文本域组件
│   │   │   ├── label.tsx               # 标签组件
│   │   │   ├── alert.tsx               # 警告组件
│   │   │   ├── alert-dialog.tsx        # 警告对话框
│   │   │   ├── avatar.tsx              # 头像组件
│   │   │   ├── dropdown-menu.tsx       # 下拉菜单
│   │   │   ├── navigation-menu.tsx     # 导航菜单
│   │   │   ├── scroll-area.tsx         # 滚动区域
│   │   │   ├── separator.tsx           # 分隔符
│   │   │   ├── sheet.tsx               # 抽屉组件
│   │   │   ├── sidebar.tsx             # 侧边栏
│   │   │   ├── skeleton.tsx            # 骨架屏
│   │   │   └── tooltip.tsx             # 提示框
│   │   ├── DashboardLayout.tsx      # 后台布局组件
│   │   ├── GlobalSearch.tsx         # 全局搜索组件
│   │   ├── SimpleGlobalSearch.tsx   # 简单全局搜索
│   │   ├── LoginForm.tsx            # 登录表单
│   │   ├── ThemeToggle.tsx          # 主题切换
│   │   ├── ThemeScript.tsx          # 主题脚本
│   │   ├── LanguageSwitch.tsx       # 语言切换
│   │   ├── I18nProvider.tsx         # 国际化提供者
│   │   ├── CodeEditor.tsx           # 代码编辑器
│   │   ├── MonacoEditor.tsx         # Monaco编辑器
│   │   ├── VSCodeEditor.tsx         # VSCode编辑器
│   │   ├── AirCodeEditor.tsx        # AirCode编辑器
│   │   ├── AirCodeEditorFixed.tsx   # AirCode编辑器修复版
│   │   └── NoSSR.tsx                # 非SSR组件
│   ├── contexts/            # React上下文
│   │   └── AuthContext.tsx          # 认证上下文
│   ├── hooks/               # 自定义Hook
│   │   ├── use-theme.ts             # 主题Hook
│   │   ├── use-toast.ts             # 提示Hook
│   │   ├── use-debounce.ts          # 防抖Hook
│   │   ├── use-mobile.ts            # 移动端检测Hook
│   │   ├── use-i18n.ts              # 国际化Hook
│   │   └── use-global-search.ts     # 全局搜索Hook
│   ├── lib/                 # 工具库
│   │   ├── graphql/         # GraphQL相关
│   │   │   ├── client.ts            # GraphQL客户端
│   │   │   ├── auth.ts              # 认证相关查询
│   │   │   ├── product.ts           # 产品相关查询
│   │   │   └── queries/             # GraphQL查询
│   │   │       ├── index.ts         # 查询索引
│   │   │       ├── auth.ts          # 认证查询
│   │   │       ├── product.ts       # 产品查询
│   │   │       ├── category.ts      # 分类查询
│   │   │       ├── brand.ts         # 品牌查询
│   │   │       ├── product-type.ts  # 产品类型查询
│   │   │       ├── users.ts         # 用户查询
│   │   │       ├── system.ts        # 系统查询
│   │   │       └── README.md        # 查询文档
│   │   ├── pocketbase.ts        # PocketBase客户端
│   │   ├── pocketbase-aircode.ts # PocketBase AirCode集成
│   │   └── utils.ts             # 工具函数
│   └── locales/             # 国际化文件
│       ├── zh-CN.ts         # 中文简体
│       └── en-US.ts         # 英文
├── public/                  # 静态资源
│   ├── next.svg             # Next.js图标
│   ├── vercel.svg           # Vercel图标
│   ├── file.svg             # 文件图标
│   ├── globe.svg            # 全球图标
│   └── window.svg           # 窗口图标
├── components.json          # shadcn/ui配置
├── package.json             # 项目依赖
├── package-lock.json        # 依赖锁文件
├── next.config.ts           # Next.js配置
├── postcss.config.mjs       # PostCSS配置
├── eslint.config.mjs        # ESLint配置
├── tsconfig.json            # TypeScript配置
├── DEBUG_GUIDE.md           # 调试指南
└── README.md                # 前端文档

## 模块划分

### 营销管理模块 (Marketing)

**目标用户**: 营销人员、运营人员
**接口范围**: 营销相关的所有功能
**功能模块**:

#### 1. 会员管理 (Member)
- 会员信息管理（查询、创建、更新、删除）
- 会员等级管理（等级配置、权益设置）
- 积分余额调整（手动调整、批量操作）
- 会员统计分析（等级分布、活跃度统计）

**主要接口**:
- `members` - 会员列表查询
- `member` - 单个会员详情
- `createMember` - 创建会员
- `updateMember` - 更新会员信息
- `adjustMemberPoints` - 调整会员积分
- `adjustMemberBalance` - 调整会员余额
- `memberLevels` - 会员等级管理
- `memberStats` - 会员统计数据

#### 2. 优惠券管理 (Coupon)
- 优惠券创建配置（折扣类型、使用条件、有效期）
- 优惠券发放管理（批量发放、定向发放）
- 使用记录追踪（使用状态、使用时间、订单关联）
- 优惠券模板管理（预设模板、快速创建）

**主要接口**:
- `coupons` - 优惠券列表查询
- `coupon` - 单个优惠券详情
- `createCoupon` - 创建优惠券
- `updateCoupon` - 更新优惠券
- `couponUsageRecords` - 使用记录查询
- `couponStats` - 优惠券统计数据

#### 3. 积分管理 (Points)
- 积分规则配置（获取规则、消费规则、过期规则）
- 积分兑换商品（兑换项目、库存管理）
- 积分记录查询（收入记录、支出记录、余额变动）
- 积分统计分析（发放统计、使用统计、兑换统计）

**主要接口**:
- `pointsRules` - 积分规则管理
- `pointsExchanges` - 积分兑换商品
- `pointsRecords` - 积分记录查询
- `pointsStats` - 积分统计数据
- `createPointsRule` - 创建积分规则
- `exchangePoints` - 积分兑换操作

#### 4. 商品推荐管理 (Recommendation)
- 推荐位置配置（首页、分类页、详情页等）
- 推荐算法设置（热销、新品、个性化等）
- 推荐模板管理（推荐规则模板、快速配置）
- 推荐效果分析（点击率、转化率、收益分析）

**主要接口**:
- `productRecommendations` - 商品推荐列表
- `productRecommendation` - 单个推荐详情
- `createProductRecommendation` - 创建推荐
- `recommendationTemplates` - 推荐模板管理
- `recommendationStats` - 推荐效果统计
- `previewRecommendation` - 推荐预览

#### 5. 广告管理 (Advertisement)
- 广告创建配置（广告类型、展示位置、投放时间）
- 广告投放管理（投放状态、预算控制、定向设置）
- 广告效果统计（展示量、点击量、转化数据）
- 广告素材管理（图片、文案、链接管理）

**主要接口**:
- `advertisements` - 广告列表查询
- `advertisement` - 单个广告详情
- `createAdvertisement` - 创建广告
- `updateAdvertisement` - 更新广告
- `advertisementStats` - 广告统计数据
- `adGroups` - 广告组管理

#### 6. 热门管理 (Trending)
- 热门商品配置（热门算法、权重设置、展示数量）
- 热门分类管理（热门规则、更新频率、计算方法）
- 热门数据统计（浏览量、点击量、分享量等）
- 热门排名管理（手动调整、自动排序、定时更新）

**主要接口**:
- `trendingItems` - 热门商品列表
- `trendingItem` - 单个热门商品详情
- `createTrendingItem` - 添加热门商品
- `trendingRules` - 热门规则管理
- `trendingStats` - 热门统计数据
- `calculateTrendingScore` - 计算热门分数

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
- 营销管理（会员、优惠券、积分、推荐、广告、热门）

**主要接口**:
- `products` - 产品列表查询
- `createProduct` - 创建产品
- `updateProduct` - 更新产品
- `deleteProduct` - 删除产品
- `orders` - 订单列表查询
- `updateOrderStatus` - 更新订单状态
- `members` - 会员列表查询
- `coupons` - 优惠券管理
- `pointsRecords` - 积分记录
- `productRecommendations` - 商品推荐
- `advertisements` - 广告管理
- `trendingItems` - 热门商品
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

### 营销管理专用
- `members` - 会员信息
- `member_levels` - 会员等级配置
- `coupons` - 优惠券信息
- `coupon_usage` - 优惠券使用记录
- `points_rules` - 积分规则配置
- `points_exchanges` - 积分兑换商品
- `points_records` - 积分记录
- `recommendations` - 商品推荐配置
- `recommendation_templates` - 推荐模板
- `advertisements` - 广告信息
- `ad_groups` - 广告组
- `trending_items` - 热门商品
- `trending_rules` - 热门规则

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

#### 营销管理
```graphql
# 会员管理
query {
  members(input: { page: 1, perPage: 10 }) {
    items { id username email level points balance }
    pagination { totalItems }
  }
}

# 优惠券管理
query {
  coupons(input: { page: 1, perPage: 10 }) {
    items { id name discount_type discount_value min_amount }
    pagination { totalItems }
  }
}

# 积分管理
query {
  pointsRecords(input: { page: 1, perPage: 10 }) {
    items { id user_id points type description created }
    pagination { totalItems }
  }
}

# 商品推荐
query {
  productRecommendations(input: { page: 1, perPage: 10 }) {
    items { id name type position products { id name } }
    pagination { totalItems }
  }
}

# 广告管理
query {
  advertisements(input: { page: 1, perPage: 10 }) {
    items { id title type position status click_count }
    pagination { totalItems }
  }
}

# 热门管理
query {
  trendingItems(input: { page: 1, perPage: 10 }) {
    items { id name type score rank status }
    pagination { totalItems }
  }
}
``` 