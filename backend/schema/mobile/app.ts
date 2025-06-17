/**
 * 移动端APP相关类型定义
 * 专门为Flutter移动应用设计的GraphQL类型
 */

export const appTypeDefs = `
  # ===== 移动端APP数据类型 =====
  
  # 首页轮播图
  type AppBanner {
    id: ID!
    title: String!
    image: String!
    link: String
    sort_order: Int!
    is_active: Boolean!
    created: String!
    updated: String!
  }
  
  # 首页装饰套装
  type AppPackage {
    id: ID!
    name: String!
    description: String
    image: String!
    price: Float!
    original_price: Float
    discount: Float
    products: [Product!]
    is_featured: Boolean!
    sort_order: Int!
    status: String!
    created: String!
    updated: String!
  }
  
  # 移动端用户信息
  type AppUser {
    id: ID!
    username: String!
    email: String!
    name: String
    avatar: String
    phone: String
    points: Int!
    growth_value: Int!
    level: Int!
    vip_status: String!
    balance: Float!
    created: String!
    updated: String!
  }
  
  # 购物车项
  type CartItem {
    id: ID!
    user_id: String!
    product_id: String!
    product: Product!
    quantity: Int!
    selected: Boolean!
    created: String!
    updated: String!
  }
  
  # 购物车
  type Cart {
    items: [CartItem!]!
    total_items: Int!
    total_amount: Float!
    selected_amount: Float!
  }
  
  # 收藏项
  type Favorite {
    id: ID!
    user_id: String!
    product_id: String!
    product: Product!
    created: String!
  }
  
  # 收藏列表响应
  type FavoritesResponse {
    items: [Favorite!]!
    pagination: PaginationInfo!
  }
  
  # 地址信息
  type Address {
    id: ID!
    user_id: String!
    name: String!
    phone: String!
    province: String!
    city: String!
    district: String!
    detail: String!
    postal_code: String
    is_default: Boolean!
    created: String!
    updated: String!
  }
  
  # 优惠券
  type Coupon {
    id: ID!
    name: String!
    description: String
    type: String!
    value: Float!
    min_amount: Float
    max_discount: Float
    start_time: String!
    end_time: String!
    usage_limit: Int
    used_count: Int!
    status: String!
    created: String!
  }
  
  # 用户优惠券
  type UserCoupon {
    id: ID!
    user_id: String!
    coupon_id: String!
    coupon: Coupon!
    status: String!
    used_time: String
    created: String!
  }
  
  # 通知消息
  type Notification {
    id: ID!
    title: String!
    content: String!
    type: String!
    user_id: String
    is_read: Boolean!
    created: String!
  }
  
  # ===== 输入类型 =====
  
  # 添加到购物车输入
  input AddToCartInput {
    product_id: String!
    quantity: Int!
  }
  
  # 更新购物车项输入
  input UpdateCartItemInput {
    quantity: Int
    selected: Boolean
  }
  
  # 创建地址输入
  input CreateAddressInput {
    name: String!
    phone: String!
    province: String!
    city: String!
    district: String!
    detail: String!
    postal_code: String
    is_default: Boolean
  }
  
  # 创建移动端订单输入
  input CreateMobileOrderInput {
    items: [OrderItemInput!]!
    shipping_address: AddressInput!
    payment_method: String!
    notes: String
  }
  
  input OrderItemInput {
    product_id: String!
    quantity: Int!
    price: Float!
  }
  
  input AddressInput {
    name: String!
    phone: String!
    province: String!
    city: String!
    district: String!
    detail: String!
    postal_code: String
  }
  
  # ===== 移动端查询 =====
  
  extend type Query {
    # 首页数据
    appHomeData: AppHomeData!
    
    # 购物车
    appCart: Cart!
    
    # 收藏列表
    appFavorites(page: Int = 1, perPage: Int = 20): FavoritesResponse!
    
    # 检查是否收藏
    appIsFavorite(product_id: String!): Boolean!
    
    # 地址列表
    appAddresses: [Address!]!
    
    # 默认地址
    appDefaultAddress: Address
    
    # 移动端用户信息
    appProfile: AppUser!
    
    # 用户优惠券
    appUserCoupons: [UserCoupon!]!
    
    # 通知列表
    appNotifications(page: Int = 1, perPage: Int = 20): [Notification!]!
  }
  
  # ===== 移动端变更 =====
  
  extend type Mutation {
    # 购物车操作
    appAddToCart(input: AddToCartInput!): CartItem!
    appUpdateCartItem(id: String!, input: UpdateCartItemInput!): CartItem!
    appRemoveFromCart(id: String!): Boolean!
    appClearCart: Boolean!
    
    # 收藏操作
    appAddToFavorites(product_id: String!): Favorite!
    appRemoveFromFavorites(product_id: String!): Boolean!
    
    # 地址操作
    appCreateAddress(input: CreateAddressInput!): Address!
    appUpdateAddress(id: String!, input: CreateAddressInput!): Address!
    appDeleteAddress(id: String!): Boolean!
    appSetDefaultAddress(id: String!): Boolean!
    
    # 订单操作
    appCreateOrder(input: CreateMobileOrderInput!): Order!
    
    # 通知操作
    appMarkNotificationRead(id: String!): Boolean!
    appMarkAllNotificationsRead: Boolean!
  }
  
  # 首页数据集合
  type AppHomeData {
    banners: [AppBanner!]!
    packages: [AppPackage!]!
    featured_products: [Product!]!
    categories: [ProductCategory!]!
    recommendations: [Product!]!
  }
`; 