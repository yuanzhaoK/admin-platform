# 微信/移动商城会员模块设计文档

## 目录

1. [项目概述](#项目概述)
2. [需求文档](#需求文档)
3. [架构设计](#架构设计)
4. [数据库设计](#数据库设计)
5. [API设计](#api设计)
6. [功能模块设计](#功能模块设计)
7. [技术实现方案](#技术实现方案)
8. [部署与运维](#部署与运维)

## 项目概述

### 项目背景

基于现代微服务架构，构建一个功能完整、可扩展的微信/移动商城会员模块系统。该系统采用GraphQL + PocketBase的技术栈，支持多终端访问，具备完整的会员生命周期管理能力。

### 技术栈

- **后端**: Node.js + GraphQL + PocketBase
- **前端**: Next.js + React + TypeScript + Tailwind CSS
- **数据库**: SQLite (PocketBase内置) / PostgreSQL (扩展)
- **缓存**: Redis
- **消息队列**: RabbitMQ + Dapr
- **监控**: 自研监控系统
- **部署**: Docker + Docker Compose

### 核心特性

- 多层级会员体系
- 完整的积分系统
- 灵活的优惠券机制
- 智能推荐引擎
- 实时数据分析
- 移动端优先设计

## 需求文档

### 功能性需求

#### 1. 会员注册与认证

- **微信授权登录**
  - 支持微信小程序授权
  - 支持微信公众号授权
  - 自动获取用户基础信息
- **手机号验证**
  - 短信验证码登录
  - 手机号绑定/解绑
- **实名认证**
  - 身份证验证
  - 银行卡验证（可选）
- **第三方登录**
  - 支付宝登录
  - QQ登录
  - 微博登录

#### 2. 会员等级体系

- **多层级设计**
  - 青铜会员（0-999积分）
  - 白银会员（1000-4999积分）
  - 黄金会员（5000-19999积分）
  - 铂金会员（20000-49999积分）
  - 钻石会员（50000+积分）
- **等级权益**
  - 不同折扣率（9.5折-8折）
  - 专属客服
  - 优先发货
  - 生日特权
  - 免邮门槛降低
- **升级条件**
  - 积分达标自动升级
  - 消费金额达标
  - 订单数量达标
  - 保级机制（年度重置）

#### 3. 积分体系

- **积分获取规则**
  - 注册奖励（100积分）
  - 完善资料（50积分）
  - 首次购买（200积分）
  - 每日签到（5-20积分）
  - 订单完成（消费金额1%）
  - 评价商品（10-50积分）
  - 分享商品（5积分）
  - 邀请好友（500积分）
- **积分消费**
  - 积分抵现（100积分=1元）
  - 积分商城兑换
  - 参与抽奖活动
  - 购买会员特权
- **积分管理**
  - 积分有效期设置
  - 积分冻结机制
  - 积分流水记录
  - 异常积分监控

#### 4. 个人中心功能

- **个人信息管理**
  - 头像上传
  - 基础信息编辑
  - 收货地址管理
  - 隐私设置
- **订单管理**
  - 订单列表查看
  - 订单状态跟踪
  - 退换货申请
  - 发票管理
- **资产管理**
  - 积分余额查看
  - 优惠券管理
  - 余额充值/提现
  - 交易记录
- **消息中心**
  - 系统通知
  - 订单通知
  - 营销消息
  - 客服消息

#### 5. 社交功能

- **好友系统**
  - 添加好友
  - 好友分组
  - 好友动态
- **分享机制**
  - 商品分享
  - 优惠券分享
  - 邀请注册
  - 社交奖励
- **团购功能**
  - 发起团购
  - 参与团购
  - 团购分享

#### 6. 营销工具

- **优惠券系统**
  - 满减券
  - 折扣券
  - 免邮券
  - 新人专享券
- **活动参与**
  - 签到活动
  - 抽奖活动
  - 限时秒杀
  - 拼团活动
- **会员专享**
  - 会员价格
  - 专享商品
  - 生日福利
  - 升级奖励

### 非功能性需求

#### 1. 性能要求

- **响应时间**
  - 页面加载时间 < 2秒
  - API响应时间 < 500ms
  - 搜索响应时间 < 1秒
- **并发处理**
  - 支持1万并发用户
  - 峰值QPS达到5000
- **数据处理**
  - 支持千万级用户数据
  - 日志数据保留3个月

#### 2. 可用性要求

- **系统可用性**: 99.9%
- **数据备份**: 每日全量备份
- **容灾恢复**: 4小时内恢复
- **监控告警**: 实时监控关键指标

#### 3. 安全要求

- **数据加密**: 敏感数据AES加密
- **传输安全**: HTTPS/WSS协议
- **访问控制**: RBAC权限模型
- **审计日志**: 完整操作日志

#### 4. 扩展性要求

- **水平扩展**: 支持负载均衡
- **模块解耦**: 微服务架构
- **插件机制**: 支持功能扩展
- **多租户**: 支持多商户模式

## 架构设计

### 系统架构图

```mermaid
graph TB
    subgraph "客户端层"
        A[微信小程序]
        B[H5商城]
        C[管理后台]
        D[移动App]
    end
    
    subgraph "网关层"
        E[API Gateway]
        F[负载均衡器]
    end
    
    subgraph "服务层"
        G[GraphQL服务]
        H[认证服务]
        I[会员服务]
        J[积分服务]
        K[消息服务]
        L[推荐服务]
    end
    
    subgraph "数据层"
        M[PocketBase]
        N[Redis缓存]
        O[文件存储]
    end
    
    subgraph "外部服务"
        P[微信API]
        Q[短信服务]
        R[支付服务]
        S[物流服务]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    E --> F
    F --> G
    G --> H
    G --> I
    G --> J
    G --> K
    G --> L
    I --> M
    I --> N
    J --> M
    J --> N
    H --> P
    K --> Q
    L --> O
```

### 技术架构

#### 1. 微服务架构

采用基于GraphQL的微服务架构，通过Dapr实现服务间通信和状态管理。

#### 2. 数据架构

- **主数据库**: PocketBase (SQLite/PostgreSQL)
- **缓存层**: Redis (会话、热点数据)
- **消息队列**: RabbitMQ (异步任务)
- **文件存储**: 本地存储/云存储

#### 3. 安全架构

- **认证**: JWT Token + 微信OAuth
- **授权**: RBAC权限模型
- **数据安全**: 敏感信息加密存储
- **接口安全**: 请求签名验证

## 数据库设计

### 核心表结构

#### 1. 会员表 (members)

```sql
CREATE TABLE members (
    id VARCHAR(15) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    avatar TEXT,
    real_name VARCHAR(50),
    gender ENUM('male', 'female', 'unknown') DEFAULT 'unknown',
    birthday DATE,
    level_id VARCHAR(15),
    points INTEGER DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0.00,
    total_orders INTEGER DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_time DATETIME,
    wechat_openid VARCHAR(100),
    wechat_unionid VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_level_id (level_id),
    INDEX idx_phone (phone),
    INDEX idx_wechat_openid (wechat_openid),
    INDEX idx_status (status),
    INDEX idx_register_time (register_time)
);
```

#### 2. 会员等级表 (member_levels)

```sql
CREATE TABLE member_levels (
    id VARCHAR(15) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    discount_rate DECIMAL(3,2) DEFAULT 1.00,
    points_required INTEGER DEFAULT 0,
    benefits JSON,
    icon VARCHAR(255),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_points_required (points_required),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
);
```

#### 3. 积分记录表 (points_records)

```sql
CREATE TABLE points_records (
    id VARCHAR(15) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    username VARCHAR(50) NOT NULL,
    type ENUM('earned_registration', 'earned_login', 'earned_order', 'earned_review', 
             'earned_referral', 'earned_activity', 'earned_admin', 'spent_exchange', 
             'spent_order', 'expired', 'admin_adjust') NOT NULL,
    points INTEGER NOT NULL,
    balance INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    order_id VARCHAR(15),
    related_id VARCHAR(15),
    expire_time DATETIME,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created (created),
    INDEX idx_expire_time (expire_time),
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
);
```

#### 4. 积分规则表 (points_rules)

```sql
CREATE TABLE points_rules (
    id VARCHAR(15) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('earned_registration', 'earned_login', 'earned_order', 'earned_review', 
             'earned_referral', 'earned_activity', 'earned_admin') NOT NULL,
    points INTEGER NOT NULL,
    conditions JSON,
    is_active BOOLEAN DEFAULT TRUE,
    start_time DATETIME,
    end_time DATETIME,
    daily_limit INTEGER,
    total_limit INTEGER,
    sort_order INTEGER DEFAULT 0,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_type (type),
    INDEX idx_is_active (is_active),
    INDEX idx_start_end_time (start_time, end_time)
);
```

#### 5. 积分兑换商品表 (points_exchanges)

```sql
CREATE TABLE points_exchanges (
    id VARCHAR(15) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    points_required INTEGER NOT NULL,
    exchange_type ENUM('balance', 'coupon', 'product', 'privilege') NOT NULL,
    reward_value DECIMAL(10,2),
    reward_product_id VARCHAR(15),
    reward_coupon_id VARCHAR(15),
    stock INTEGER,
    used_count INTEGER DEFAULT 0,
    status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_exchange_type (exchange_type),
    INDEX idx_status (status),
    INDEX idx_points_required (points_required)
);
```

#### 6. 积分兑换记录表 (points_exchange_records)

```sql
CREATE TABLE points_exchange_records (
    id VARCHAR(15) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    username VARCHAR(50) NOT NULL,
    exchange_id VARCHAR(15) NOT NULL,
    points_cost INTEGER NOT NULL,
    reward_type ENUM('balance', 'coupon', 'product', 'privilege') NOT NULL,
    reward_value DECIMAL(10,2),
    status ENUM('pending', 'completed', 'cancelled', 'failed') DEFAULT 'pending',
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed_time DATETIME,
    
    INDEX idx_user_id (user_id),
    INDEX idx_exchange_id (exchange_id),
    INDEX idx_status (status),
    INDEX idx_created (created),
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (exchange_id) REFERENCES points_exchanges(id) ON DELETE CASCADE
);
```

#### 7. 收货地址表 (addresses)

```sql
CREATE TABLE addresses (
    id VARCHAR(15) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    tag VARCHAR(20),
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_is_default (is_default),
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
);
```

#### 8. 会员关注表 (member_follows)

```sql
CREATE TABLE member_follows (
    id VARCHAR(15) PRIMARY KEY,
    follower_id VARCHAR(15) NOT NULL,
    following_id VARCHAR(15) NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_follower_following (follower_id, following_id),
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id),
    FOREIGN KEY (follower_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES members(id) ON DELETE CASCADE
);
```

#### 9. 商品收藏表 (favorites)

```sql
CREATE TABLE favorites (
    id VARCHAR(15) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    product_id VARCHAR(15) NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
);
```

#### 10. 购物车表 (cart_items)

```sql
CREATE TABLE cart_items (
    id VARCHAR(15) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    product_id VARCHAR(15) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    selected BOOLEAN DEFAULT TRUE,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE
);
```

#### 11. 会员标签表 (member_tags)

```sql
CREATE TABLE member_tags (
    id VARCHAR(15) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(20),
    is_system BOOLEAN DEFAULT FALSE,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_name (name)
);
```

#### 12. 会员标签关联表 (member_tag_relations)

```sql
CREATE TABLE member_tag_relations (
    id VARCHAR(15) PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    tag_id VARCHAR(15) NOT NULL,
    created DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_tag (user_id, tag_id),
    INDEX idx_user_id (user_id),
    INDEX idx_tag_id (tag_id),
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES member_tags(id) ON DELETE CASCADE
);
```

### 数据库关系图

```mermaid
erDiagram
    members ||--o{ points_records : "has"
    members ||--o{ addresses : "has"
    members ||--o{ favorites : "has"
    members ||--o{ cart_items : "has"
    members ||--o{ points_exchange_records : "has"
    members ||--o{ member_tag_relations : "has"
    members }o--|| member_levels : "belongs_to"
    
    member_levels ||--o{ members : "contains"
    
    points_records }o--|| members : "belongs_to"
    
    points_exchanges ||--o{ points_exchange_records : "has"
    
    points_exchange_records }o--|| members : "belongs_to"
    points_exchange_records }o--|| points_exchanges : "belongs_to"
    
    member_tags ||--o{ member_tag_relations : "has"
    member_tag_relations }o--|| members : "belongs_to"
    member_tag_relations }o--|| member_tags : "belongs_to"
```

## API设计

### GraphQL Schema 设计

#### 查询接口 (Query)

```graphql
type Query {
    """会员管理查询"""
    # 获取会员列表
    members(input: MemberQueryInput): MembersResponse!
    # 获取单个会员信息
    member(id: String!): Member
    # 获取会员统计信息
    memberStats: MemberStats!
    
    """会员等级查询"""
    # 获取会员等级列表
    memberLevels(input: MemberQueryInput): MemberLevelsResponse!
    # 获取单个会员等级
    memberLevel(id: String!): MemberLevel
    
    """积分系统查询"""
    # 获取积分记录
    pointsRecords(input: PointsRecordQueryInput): PointsRecordsResponse!
    # 获取积分规则
    pointsRules(input: PointsRuleQueryInput): PointsRulesResponse!
    # 获取积分兑换商品
    pointsExchanges(input: PointsExchangeQueryInput): PointsExchangesResponse!
    # 获取积分统计
    pointsStats: PointsStats!
    
    """移动端专用查询"""
    # 获取当前用户信息
    appMember: Member
    # 获取用户地址列表
    appMemberAddresses: AddressList!
    # 获取购物车信息
    appMemberCart: CartInfo!
    # 获取用户订单列表
    memberOrders(query: OrderQueryInput): OrdersResponse!
    # 获取用户收藏列表
    memberFavorites(input: QueryInput): FavoritesResponse!
    # 获取推荐商品
    recommendedProducts(limit: Int): [Product!]!
}
```

#### 变更接口 (Mutation)

```graphql
type Mutation {
    """会员管理"""
    # 创建会员
    createMember(input: MemberInput!): Member!
    # 更新会员信息
    updateMember(id: String!, input: MemberUpdateInput!): Member!
    # 删除会员
    deleteMember(id: String!): Boolean!
    # 批量删除会员
    batchDeleteMembers(ids: [String!]!): BatchOperationResult!
    
    """会员等级管理"""
    # 创建会员等级
    createMemberLevel(input: MemberLevelInput!): MemberLevel!
    # 更新会员等级
    updateMemberLevel(id: String!, input: MemberLevelUpdateInput!): MemberLevel!
    # 删除会员等级
    deleteMemberLevel(id: String!): Boolean!
    
    """积分管理"""
    # 调整会员积分
    adjustMemberPoints(id: String!, points: Int!, reason: String!): Member!
    # 调整会员余额
    adjustMemberBalance(id: String!, amount: Float!, reason: String!): Member!
    
    """移动端用户操作"""
    # 用户注册
    registerMember(input: RegisterInput!): AuthResponse!
    # 用户登录
    login(input: LoginInput!): AuthResponse!
    # 微信登录
    wechatLogin(input: WechatLoginInput!): AuthResponse!
    # 更新个人信息
    updateProfile(input: ProfileUpdateInput!): Member!
    # 修改密码
    changePassword(input: ChangePasswordInput!): Boolean!
    
    """地址管理"""
    # 添加收货地址
    addAddress(input: AddressInput!): Address!
    # 更新收货地址
    updateAddress(id: String!, input: AddressInput!): Address!
    # 删除收货地址
    deleteAddress(id: String!): Boolean!
    # 设置默认地址
    setDefaultAddress(id: String!): Boolean!
    
    """购物车管理"""
    # 添加到购物车
    addToCart(input: AddToCartInput!): CartInfo!
    # 更新购物车商品
    updateCartItem(id: String!, quantity: Int!): CartInfo!
    # 删除购物车商品
    removeFromCart(id: String!): CartInfo!
    # 清空购物车
    clearCart: Boolean!
    
    """收藏管理"""
    # 添加收藏
    addToFavorites(product_id: String!): Boolean!
    # 取消收藏
    removeFromFavorites(product_id: String!): Boolean!
    # 批量取消收藏
    batchRemoveFavorites(product_ids: [String!]!): Boolean!
    
    """积分操作"""
    # 签到获得积分
    dailyCheckIn: PointsRecord!
    # 兑换积分商品
    exchangePoints(exchange_id: String!): PointsExchangeRecord!
    
    """社交功能"""
    # 关注用户
    followMember(user_id: String!): Boolean!
    # 取消关注
    unfollowMember(user_id: String!): Boolean!
    # 分享商品
    shareProduct(product_id: String!, platform: String!): Boolean!
}
```

#### 订阅接口 (Subscription)

```graphql
type Subscription {
    """实时通知"""
    # 用户消息通知
    memberNotifications(user_id: String!): Notification!
    # 积分变动通知
    pointsUpdated(user_id: String!): PointsRecord!
    # 订单状态更新
    orderStatusUpdated(user_id: String!): Order!
    # 系统公告
    systemAnnouncements: SystemAnnouncement!
}
```

### REST API 接口设计

为了兼容性和特殊场景，同时提供关键的REST API接口：

#### 认证相关

```
POST /api/auth/register          # 用户注册
POST /api/auth/login             # 用户登录
POST /api/auth/wechat-login      # 微信登录
POST /api/auth/refresh-token     # 刷新令牌
POST /api/auth/logout            # 用户登出
POST /api/auth/forgot-password   # 忘记密码
POST /api/auth/reset-password    # 重置密码
```

#### 会员相关

```
GET    /api/members              # 获取会员列表
POST   /api/members              # 创建会员
GET    /api/members/{id}         # 获取会员详情
PUT    /api/members/{id}         # 更新会员信息
DELETE /api/members/{id}         # 删除会员
GET    /api/members/{id}/orders  # 获取会员订单
GET    /api/members/{id}/points  # 获取会员积分记录
```

#### 积分相关

```
GET    /api/points/rules         # 获取积分规则
POST   /api/points/rules         # 创建积分规则
GET    /api/points/exchanges     # 获取积分兑换商品
POST   /api/points/exchange      # 兑换积分商品
POST   /api/points/checkin       # 每日签到
GET    /api/points/records       # 获取积分记录
```

#### 地址相关

```
GET    /api/addresses            # 获取地址列表
POST   /api/addresses            # 添加地址
PUT    /api/addresses/{id}       # 更新地址
DELETE /api/addresses/{id}       # 删除地址
PUT    /api/addresses/{id}/default # 设置默认地址
```

### API 安全设计

#### 1. 认证机制

```javascript
// JWT Token 结构
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "1234567890",
    "username": "user@example.com",
    "role": "member",
    "level": "gold",
    "exp": 1635724800,
    "iat": 1635638400
  }
}
```

#### 2. 权限控制

```javascript
// 权限级别定义
const PERMISSIONS = {
  MEMBER: ['read:self', 'update:self'],
  VIP: ['read:self', 'update:self', 'access:vip'],
  ADMIN: ['read:all', 'update:all', 'delete:all'],
  SUPER_ADMIN: ['*']
};
```

#### 3. 请求限制

```javascript
// 接口限流配置
const RATE_LIMITS = {
  '/api/auth/login': { max: 5, window: '15min' },
  '/api/auth/register': { max: 3, window: '1hour' },
  '/api/points/checkin': { max: 1, window: '1day' },
  '/api/members': { max: 100, window: '1min' }
};
```

## 功能模块设计

### 1. 用户认证模块

#### 架构设计

```mermaid
graph TB
    A[认证请求] --> B{认证方式}
    B -->|微信| C[微信OAuth]
    B -->|手机| D[短信验证]
    B -->|邮箱| E[邮箱验证]
    B -->|第三方| F[第三方OAuth]
    
    C --> G[获取用户信息]
    D --> G
    E --> G
    F --> G
    
    G --> H{用户是否存在}
    H -->|否| I[创建用户]
    H -->|是| J[更新登录信息]
    
    I --> K[生成JWT Token]
    J --> K
    K --> L[返回认证结果]
```

#### 核心功能实现

**微信登录流程**

```typescript
// 微信登录服务
class WechatAuthService {
  async login(code: string, userInfo: WechatUserInfo) {
    // 1. 通过code获取openid和unionid
    const { openid, unionid } = await this.getWechatUserToken(code);
    
    // 2. 查找或创建用户
    let user = await this.findUserByOpenid(openid);
    if (!user) {
      user = await this.createUserFromWechat({
        openid,
        unionid,
        ...userInfo
      });
    }
    
    // 3. 更新登录信息
    await this.updateLoginInfo(user.id);
    
    // 4. 生成JWT Token
    const token = await this.generateToken(user);
    
    return { user, token };
  }
}
```

**JWT Token 管理**

```typescript
// Token管理服务
class TokenService {
  generateToken(user: User): string {
    const payload = {
      user_id: user.id,
      username: user.username,
      role: user.role,
      level: user.level?.name,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24小时
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET);
  }
  
  async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await this.userService.findById(decoded.user_id);
      return user;
    } catch (error) {
      return null;
    }
  }
}
```

### 2. 会员等级模块

#### 等级升级策略

```typescript
// 等级升级服务
class MemberLevelService {
  async checkAndUpgradeLevel(userId: string) {
    const member = await this.getMember(userId);
    const currentLevel = member.level;
    const availableLevels = await this.getAllLevels();
    
    // 根据积分查找应有等级
    const targetLevel = availableLevels
      .filter(level => member.points >= level.points_required)
      .sort((a, b) => b.points_required - a.points_required)[0];
    
    if (targetLevel && targetLevel.id !== currentLevel.id) {
      await this.upgradeMemberLevel(userId, targetLevel.id);
      
      // 发送升级通知
      await this.notificationService.sendLevelUpgradeNotification(
        userId, 
        targetLevel
      );
      
      // 发放升级奖励
      await this.rewardService.grantLevelUpgradeReward(userId, targetLevel);
    }
  }
}
```

#### 等级权益计算

```typescript
// 等级权益服务
class MemberBenefitService {
  calculateDiscount(member: Member, originalPrice: number): number {
    const discountRate = member.level.discount_rate;
    return originalPrice * discountRate;
  }
  
  canAccessVipFeature(member: Member, feature: string): boolean {
    const benefits = member.level.benefits;
    return benefits.includes(feature);
  }
  
  getFreeShippingThreshold(member: Member): number {
    const baseThreshold = 99; // 基础免邮门槛
    const levelBenefit = member.level.benefits.find(b => 
      b.startsWith('free_shipping_')
    );
    
    if (levelBenefit) {
      const threshold = parseInt(levelBenefit.split('_')[2]);
      return Math.min(baseThreshold, threshold);
    }
    
    return baseThreshold;
  }
}
```

### 3. 积分系统模块

#### 积分规则引擎

```typescript
// 积分规则引擎
class PointsRuleEngine {
  private rules: Map<PointsType, PointsRule[]> = new Map();
  
  async initialize() {
    const rules = await this.pointsRuleService.getAllActiveRules();
    
    rules.forEach(rule => {
      if (!this.rules.has(rule.type)) {
        this.rules.set(rule.type, []);
      }
      this.rules.get(rule.type).push(rule);
    });
  }
  
  async calculatePoints(
    type: PointsType, 
    context: PointsContext
  ): Promise<number> {
    const rules = this.rules.get(type) || [];
    let totalPoints = 0;
    
    for (const rule of rules) {
      if (await this.matchesConditions(rule, context)) {
        const points = await this.calculateRulePoints(rule, context);
        totalPoints += points;
      }
    }
    
    return totalPoints;
  }
  
  private async matchesConditions(
    rule: PointsRule, 
    context: PointsContext
  ): Promise<boolean> {
    const conditions = rule.conditions;
    
    // 检查时间条件
    if (rule.start_time && new Date() < new Date(rule.start_time)) {
      return false;
    }
    if (rule.end_time && new Date() > new Date(rule.end_time)) {
      return false;
    }
    
    // 检查每日限制
    if (rule.daily_limit) {
      const todayUsage = await this.getTodayUsage(rule.id, context.user_id);
      if (todayUsage >= rule.daily_limit) {
        return false;
      }
    }
    
    // 检查总限制
    if (rule.total_limit) {
      const totalUsage = await this.getTotalUsage(rule.id, context.user_id);
      if (totalUsage >= rule.total_limit) {
        return false;
      }
    }
    
    // 检查自定义条件
    return this.evaluateCustomConditions(conditions, context);
  }
}
```

#### 积分操作服务

```typescript
// 积分操作服务
class PointsService {
  async earnPoints(
    userId: string, 
    type: PointsType, 
    context: PointsContext
  ) {
    const points = await this.ruleEngine.calculatePoints(type, context);
    
    if (points > 0) {
      const member = await this.memberService.getMember(userId);
      const newBalance = member.points + points;
      
      // 更新会员积分
      await this.memberService.updatePoints(userId, newBalance);
      
      // 记录积分变动
      await this.recordPointsChange({
        user_id: userId,
        username: member.username,
        type,
        points,
        balance: newBalance,
        reason: context.reason,
        order_id: context.order_id,
        related_id: context.related_id
      });
      
      // 检查等级升级
      await this.memberLevelService.checkAndUpgradeLevel(userId);
      
      // 发送积分获得通知
      await this.notificationService.sendPointsEarnedNotification(
        userId, 
        points
      );
    }
  }
  
  async spendPoints(
    userId: string, 
    points: number, 
    reason: string, 
    relatedId?: string
  ) {
    const member = await this.memberService.getMember(userId);
    
    if (member.points < points) {
      throw new Error('积分余额不足');
    }
    
    const newBalance = member.points - points;
    
    // 更新会员积分
    await this.memberService.updatePoints(userId, newBalance);
    
    // 记录积分变动
    await this.recordPointsChange({
      user_id: userId,
      username: member.username,
      type: 'spent_exchange',
      points: -points,
      balance: newBalance,
      reason,
      related_id: relatedId
    });
  }
}
```

### 4. 营销活动模块

#### 签到系统

```typescript
// 签到服务
class CheckInService {
  async dailyCheckIn(userId: string) {
    // 检查今日是否已签到
    const todayCheckIn = await this.getTodayCheckIn(userId);
    if (todayCheckIn) {
      throw new Error('今日已签到');
    }
    
    // 获取连续签到天数
    const consecutiveDays = await this.getConsecutiveDays(userId);
    
    // 计算签到奖励
    const reward = this.calculateCheckInReward(consecutiveDays + 1);
    
    // 记录签到
    await this.recordCheckIn(userId, consecutiveDays + 1, reward);
    
    // 发放积分
    await this.pointsService.earnPoints(userId, 'earned_activity', {
      reason: `每日签到第${consecutiveDays + 1}天`,
      points: reward.points
    });
    
    return {
      consecutiveDays: consecutiveDays + 1,
      reward
    };
  }
  
  private calculateCheckInReward(days: number) {
    const basePoints = 5;
    const bonusMap = {
      7: 20,   // 连续7天额外20积分
      15: 50,  // 连续15天额外50积分
      30: 100  // 连续30天额外100积分
    };
    
    let totalPoints = basePoints;
    
    // 添加连续签到奖励
    if (days % 7 === 0) totalPoints += bonusMap[7];
    if (days % 15 === 0) totalPoints += bonusMap[15];
    if (days % 30 === 0) totalPoints += bonusMap[30];
    
    return {
      points: totalPoints,
      bonus: totalPoints - basePoints
    };
  }
}
```

#### 邀请奖励系统

```typescript
// 邀请奖励服务
class ReferralService {
  async processReferral(referrerId: string, newUserId: string) {
    // 检查邀请关系是否有效
    if (await this.isValidReferral(referrerId, newUserId)) {
      // 记录邀请关系
      await this.recordReferral(referrerId, newUserId);
      
      // 邀请者获得奖励
      await this.pointsService.earnPoints(referrerId, 'earned_referral', {
        reason: '邀请新用户注册',
        related_id: newUserId
      });
      
      // 新用户获得奖励
      await this.pointsService.earnPoints(newUserId, 'earned_registration', {
        reason: '通过邀请注册奖励'
      });
      
      // 发送奖励通知
      await this.sendReferralRewardNotification(referrerId, newUserId);
    }
  }
  
  async getReferralStats(userId: string) {
    const referrals = await this.getUserReferrals(userId);
    const totalReward = await this.getTotalReferralReward(userId);
    
    return {
      totalReferrals: referrals.length,
      successfulReferrals: referrals.filter(r => r.status === 'completed').length,
      totalReward,
      referralList: referrals
    };
  }
}
```

### 5. 智能推荐模块

#### 推荐算法引擎

```typescript
// 推荐引擎
class RecommendationEngine {
  async getPersonalizedRecommendations(
    userId: string, 
    limit: number = 10
  ): Promise<Product[]> {
    const user = await this.memberService.getMember(userId);
    
    // 获取用户行为数据
    const behaviors = await this.getBehaviorData(userId);
    
    // 协同过滤推荐
    const collaborativeProducts = await this.collaborativeFiltering(userId, behaviors);
    
    // 基于内容的推荐
    const contentBasedProducts = await this.contentBasedFiltering(behaviors);
    
    // 热门商品推荐
    const trendingProducts = await this.getTrendingProducts(user.level);
    
    // 混合推荐算法
    const recommendations = this.hybridRecommendation([
      { products: collaborativeProducts, weight: 0.4 },
      { products: contentBasedProducts, weight: 0.4 },
      { products: trendingProducts, weight: 0.2 }
    ]);
    
    return recommendations.slice(0, limit);
  }
  
  private async collaborativeFiltering(
    userId: string, 
    behaviors: UserBehavior[]
  ): Promise<Product[]> {
    // 找到相似用户
    const similarUsers = await this.findSimilarUsers(userId, behaviors);
    
    // 获取相似用户喜欢的商品
    const recommendations = [];
    for (const similarUser of similarUsers) {
      const userProducts = await this.getUserPreferences(similarUser.id);
      recommendations.push(...userProducts);
    }
    
    // 过滤已购买/已收藏商品
    return this.filterExistingProducts(userId, recommendations);
  }
  
  private hybridRecommendation(
    sources: Array<{ products: Product[], weight: number }>
  ): Product[] {
    const scoreMap = new Map<string, { product: Product, score: number }>();
    
    sources.forEach(source => {
      source.products.forEach((product, index) => {
        const score = (source.products.length - index) * source.weight;
        const existing = scoreMap.get(product.id);
        
        if (existing) {
          existing.score += score;
        } else {
          scoreMap.set(product.id, { product, score });
        }
      });
    });
    
    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  }
}
```

## 技术实现方案

### 1. 微服务拆分策略

#### 服务划分

```
admin-platform/
├── services/
│   ├── auth-service/           # 认证服务
│   │   ├── src/
│   │   ├── schema/
│   │   └── resolvers/
│   ├── member-service/         # 会员服务
│   │   ├── src/
│   │   ├── schema/
│   │   └── resolvers/
│   ├── points-service/         # 积分服务
│   ├── notification-service/   # 通知服务
│   ├── recommendation-service/ # 推荐服务
│   └── analytics-service/      # 分析服务
```

#### 服务间通信

```typescript
// Dapr服务间通信配置
export const serviceConfig = {
  auth: {
    appId: 'auth-service',
    port: 3001,
    endpoints: {
      validate: '/api/auth/validate',
      refresh: '/api/auth/refresh'
    }
  },
  member: {
    appId: 'member-service', 
    port: 3002,
    endpoints: {
      profile: '/api/members/profile',
      upgrade: '/api/members/upgrade'
    }
  },
  points: {
    appId: 'points-service',
    port: 3003,
    endpoints: {
      earn: '/api/points/earn',
      spend: '/api/points/spend'
    }
  }
};
```

### 2. 数据一致性方案

#### 分布式事务处理

```typescript
// Saga事务模式实现
class MemberRegistrationSaga {
  async execute(userData: RegisterInput) {
    const saga = new Saga('member-registration');
    
    try {
      // 步骤1: 创建用户账户
      const user = await saga.step('create-user', 
        () => this.authService.createUser(userData),
        (user) => this.authService.deleteUser(user.id)
      );
      
      // 步骤2: 初始化会员信息
      const member = await saga.step('init-member',
        () => this.memberService.initializeMember(user.id, userData),
        (member) => this.memberService.deleteMember(member.id)
      );
      
      // 步骤3: 发放注册奖励
      await saga.step('grant-signup-reward',
        () => this.pointsService.grantSignupReward(user.id),
        () => this.pointsService.revokeSignupReward(user.id)
      );
      
      // 步骤4: 发送欢迎通知
      await saga.step('send-welcome',
        () => this.notificationService.sendWelcome(user.id),
        () => {} // 通知无需回滚
      );
      
      await saga.commit();
      return member;
      
    } catch (error) {
      await saga.rollback();
      throw error;
    }
  }
}
```

#### 事件驱动架构

```typescript
// 事件发布订阅模式
class EventBus {
  private handlers: Map<string, Function[]> = new Map();
  
  subscribe(event: string, handler: Function) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }
  
  async publish(event: string, data: any) {
    const handlers = this.handlers.get(event) || [];
    await Promise.all(handlers.map(handler => handler(data)));
  }
}

// 事件处理器
export class MemberEventHandlers {
  constructor(
    private pointsService: PointsService,
    private levelService: MemberLevelService,
    private notificationService: NotificationService
  ) {}
  
  @EventHandler('member.registered')
  async handleMemberRegistered(event: MemberRegisteredEvent) {
    // 发放注册奖励
    await this.pointsService.earnPoints(
      event.userId, 
      'earned_registration',
      { reason: '新用户注册奖励' }
    );
  }
  
  @EventHandler('order.completed')
  async handleOrderCompleted(event: OrderCompletedEvent) {
    // 计算订单积分
    const points = Math.floor(event.amount * 0.01); // 1%返积分
    await this.pointsService.earnPoints(
      event.userId,
      'earned_order',
      { 
        reason: `订单完成奖励 - 订单号: ${event.orderId}`,
        order_id: event.orderId
      }
    );
    
    // 更新会员统计
    await this.memberService.updateOrderStats(
      event.userId,
      event.amount
    );
    
    // 检查等级升级
    await this.levelService.checkAndUpgradeLevel(event.userId);
  }
  
  @EventHandler('points.earned')
  async handlePointsEarned(event: PointsEarnedEvent) {
    // 发送积分获得通知
    await this.notificationService.sendPointsNotification(
      event.userId,
      event.points,
      event.reason
    );
  }
}
```

### 3. 缓存策略

#### 多级缓存架构

```typescript
// 缓存管理器
class CacheManager {
  private redis: Redis;
  private localCache: Map<string, any> = new Map();
  
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }
  
  async get(key: string): Promise<any> {
    // L1: 本地缓存
    if (this.localCache.has(key)) {
      return this.localCache.get(key);
    }
    
    // L2: Redis缓存
    const redisValue = await this.redis.get(key);
    if (redisValue) {
      const value = JSON.parse(redisValue);
      this.localCache.set(key, value);
      return value;
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttl: number = 3600) {
    // 设置本地缓存
    this.localCache.set(key, value);
    
    // 设置Redis缓存
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidate(pattern: string) {
    // 清除本地缓存
    for (const key of this.localCache.keys()) {
      if (key.includes(pattern)) {
        this.localCache.delete(key);
      }
    }
    
    // 清除Redis缓存
    const keys = await this.redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// 会员服务缓存策略
class MemberServiceWithCache {
  constructor(
    private memberService: MemberService,
    private cache: CacheManager
  ) {}
  
  async getMember(id: string): Promise<Member> {
    const cacheKey = `member:${id}`;
    
    // 尝试从缓存获取
    let member = await this.cache.get(cacheKey);
    if (member) {
      return member;
    }
    
    // 从数据库获取
    member = await this.memberService.getMember(id);
    if (member) {
      // 缓存30分钟
      await this.cache.set(cacheKey, member, 1800);
    }
    
    return member;
  }
  
  async updateMember(id: string, data: MemberUpdateInput): Promise<Member> {
    // 更新数据库
    const member = await this.memberService.updateMember(id, data);
    
    // 更新缓存
    const cacheKey = `member:${id}`;
    await this.cache.set(cacheKey, member, 1800);
    
    // 清除相关缓存
    await this.cache.invalidate(`member_list:*`);
    
    return member;
  }
}
```

### 4. 性能优化方案

#### 数据库优化

```sql
-- 创建必要的索引
CREATE INDEX idx_members_composite ON members(status, level_id, register_time);
CREATE INDEX idx_points_records_user_time ON points_records(user_id, created);
CREATE INDEX idx_addresses_user_default ON addresses(user_id, is_default);

-- 分区表策略(大数据量情况下)
CREATE TABLE points_records_2024 PARTITION OF points_records
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

#### GraphQL查询优化

```typescript
// DataLoader模式解决N+1问题
class MemberDataLoader {
  private levelLoader = new DataLoader(async (levelIds: string[]) => {
    const levels = await this.memberLevelService.getByIds(levelIds);
    return levelIds.map(id => levels.find(level => level.id === id));
  });
  
  private pointsLoader = new DataLoader(async (userIds: string[]) => {
    const pointsRecords = await this.pointsService.getByUserIds(userIds);
    return userIds.map(id => 
      pointsRecords.filter(record => record.user_id === id)
    );
  });
  
  async loadLevel(id: string) {
    return this.levelLoader.load(id);
  }
  
  async loadPointsRecords(userId: string) {
    return this.pointsLoader.load(userId);
  }
}

// GraphQL Resolver优化
export const memberResolvers = {
  Member: {
    level: (parent: Member, _: any, { dataLoaders }: Context) => {
      return dataLoaders.member.loadLevel(parent.level_id);
    },
    
    pointsRecords: (parent: Member, _: any, { dataLoaders }: Context) => {
      return dataLoaders.member.loadPointsRecords(parent.id);
    }
  }
};
```

### 5. 监控与日志

#### 业务监控指标

```typescript
// 监控指标定义
export const METRICS = {
  // 用户相关
  USER_REGISTRATION_RATE: 'user_registration_rate',
  USER_ACTIVE_RATE: 'user_active_rate',
  USER_RETENTION_RATE: 'user_retention_rate',
  
  // 积分相关
  POINTS_EARNED_TOTAL: 'points_earned_total',
  POINTS_SPENT_TOTAL: 'points_spent_total',
  POINTS_EXCHANGE_RATE: 'points_exchange_rate',
  
  // 等级相关
  LEVEL_UPGRADE_RATE: 'level_upgrade_rate',
  LEVEL_DISTRIBUTION: 'level_distribution',
  
  // 性能相关
  API_RESPONSE_TIME: 'api_response_time',
  DB_QUERY_TIME: 'db_query_time',
  CACHE_HIT_RATE: 'cache_hit_rate'
};

// 监控服务
class MonitoringService {
  private prometheus = new PrometheusRegistry();
  
  constructor() {
    this.initializeMetrics();
  }
  
  private initializeMetrics() {
    // 注册计数器
    this.prometheus.registerMetric({
      name: METRICS.USER_REGISTRATION_RATE,
      help: 'User registration rate',
      type: 'counter'
    });
    
    // 注册直方图
    this.prometheus.registerMetric({
      name: METRICS.API_RESPONSE_TIME,
      help: 'API response time',
      type: 'histogram',
      buckets: [0.1, 0.5, 1, 2, 5]
    });
  }
  
  incrementCounter(metric: string, labels?: Record<string, string>) {
    this.prometheus.getCounter(metric).inc(1, labels);
  }
  
  recordHistogram(metric: string, value: number, labels?: Record<string, string>) {
    this.prometheus.getHistogram(metric).observe(value, labels);
  }
}
```

#### 结构化日志

```typescript
// 日志服务
class LoggerService {
  private winston = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
      new winston.transports.Console()
    ]
  });
  
  logUserAction(userId: string, action: string, details?: any) {
    this.winston.info('User Action', {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
      type: 'user_action'
    });
  }
  
  logBusinessEvent(event: string, data: any) {
    this.winston.info('Business Event', {
      event,
      data,
      timestamp: new Date().toISOString(),
      type: 'business_event'
    });
  }
  
  logError(error: Error, context?: any) {
    this.winston.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      type: 'application_error'
    });
  }
}
```

## 部署与运维

### 1. Docker容器化

#### Dockerfile

```dockerfile
# 后端服务Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

#### Docker Compose配置

```yaml
version: '3.8'

services:
  # GraphQL服务
  api:
    build: 
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@postgres:5432/admin_platform
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    
  # 前端应用
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:3000/graphql
    depends_on:
      - api
  
  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=admin_platform
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d admin_platform"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  # RabbitMQ消息队列
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=admin123
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
  
  # Nginx负载均衡
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
      - frontend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

### 2. Kubernetes部署

#### Deployment配置

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: member-service
  labels:
    app: member-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: member-service
  template:
    metadata:
      labels:
        app: member-service
    spec:
      containers:
      - name: member-service
        image: admin-platform/member-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: member-service
spec:
  selector:
    app: member-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

### 3. 监控配置

#### Prometheus配置

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'member-service'
    static_configs:
      - targets: ['member-service:3000']
    metrics_path: /metrics
    scrape_interval: 10s
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:9187']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['redis:9121']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### 告警规则

```yaml
groups:
- name: member-service-alerts
  rules:
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, api_response_time) > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "API响应时间过高"
      description: "95%的请求响应时间超过2秒"
  
  - alert: HighErrorRate
    expr: rate(api_errors_total[5m]) > 0.1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "API错误率过高"
      description: "5分钟内错误率超过10%"
  
  - alert: DatabaseConnectionFailed
    expr: up{job="postgres"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "数据库连接失败"
      description: "PostgreSQL数据库连接失败"
```

### 4. 自动化部署

#### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Run integration tests
      run: npm run test:integration
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -t admin-platform/member-service:${{ github.sha }} ./backend
        docker build -t admin-platform/frontend:${{ github.sha }} ./frontend
        
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push admin-platform/member-service:${{ github.sha }}
        docker push admin-platform/frontend:${{ github.sha }}
        
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/member-service member-service=admin-platform/member-service:${{ github.sha }}
        kubectl set image deployment/frontend frontend=admin-platform/frontend:${{ github.sha }}
        kubectl rollout status deployment/member-service
        kubectl rollout status deployment/frontend
```

## 总结

本文档详细设计了一个现代化的微信/移动商城会员模块系统，具备以下特点：

### 核心优势

1. **先进架构**: 采用微服务架构，支持水平扩展
2. **完整功能**: 涵盖会员生命周期的所有关键环节
3. **高性能**: 多级缓存策略，支持高并发访问
4. **可扩展**: 插件化设计，支持功能快速扩展
5. **安全可靠**: 完善的安全机制和监控体系

### 技术创新

1. **GraphQL优先**: 提供灵活的API查询能力
2. **事件驱动**: 解耦服务间依赖，提高系统弹性
3. **智能推荐**: 基于机器学习的个性化推荐
4. **实时处理**: 支持实时数据同步和通知

### 业务价值

1. **提升用户体验**: 个性化服务和智能推荐
2. **增强用户粘性**: 完善的积分和等级体系
3. **促进转化**: 精准的营销活动和优惠机制
4. **数据驱动**: 全面的数据分析和业务洞察
