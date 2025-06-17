export const mobileTypeDefs = `
  # 移动端首页套装类型
  type HomePackage {
    id: String!
    name: String!
    subtitle: String
    description: String
    price: Float!
    market_price: Float
    cover_image: String!
    images: [String!]!
    category: String!
    style_type: String!
    products: [Product!]!
    is_recommended: Boolean!
    is_featured: Boolean!
    tags: [String!]
    sort_order: Int
    status: String!
    created: String!
    updated: String!
  }

  # 首页轮播图
  type HomeBanner {
    id: String!
    title: String
    image: String!
    link_type: String!
    link_value: String
    sort_order: Int
    is_active: Boolean!
    start_time: String
    end_time: String
    created: String!
  }

  # 购物车类型
  type CartItem {
    id: String!
    user_id: String!
    product_id: String!
    product: Product!
    quantity: Int!
    selected: Boolean!
    created: String!
    updated: String!
  }

  type Cart {
    items: [CartItem!]!
    total_items: Int!
    total_amount: Float!
    selected_amount: Float!
  }

  # 收藏类型
  type Favorite {
    id: String!
    user_id: String!
    product_id: String!
    product: Product!
    created: String!
  }

  type FavoritesResponse {
    items: [Favorite!]!
    pagination: PaginationInfo!
  }

  # 收货地址类型
  type Address {
    id: String!
    user_id: String!
    name: String!
    phone: String!
    province: String!
    city: String!
    district: String!
    address: String!
    postal_code: String
    is_default: Boolean!
    tag: String
    created: String!
    updated: String!
  }

  # 用户积分记录
  type PointRecord {
    id: String!
    user_id: String!
    type: String!
    amount: Int!
    description: String!
    order_id: String
    created: String!
  }

  # 用户成长值记录
  type GrowthRecord {
    id: String!
    user_id: String!
    type: String!
    amount: Int!
    description: String!
    order_id: String
    created: String!
  }

  # 扩展用户类型（移动端）
  type MobileUser {
    id: String!
    email: String!
    name: String
    avatar: String
    phone: String
    nickname: String
    gender: String
    birthday: String
    points: Int!
    growth_value: Int!
    level: Int!
    vip_status: String!
    balance: Float!
    created: String!
    updated: String!
  }

  # 商品搜索历史
  type SearchHistory {
    id: String!
    user_id: String!
    keyword: String!
    created: String!
  }

  # 浏览历史
  type ViewHistory {
    id: String!
    user_id: String!
    product_id: String!
    product: Product!
    created: String!
    updated: String!
  }

  # 优惠券类型
  type Coupon {
    id: String!
    name: String!
    type: String!
    value: Float!
    min_amount: Float
    max_discount: Float
    description: String
    start_time: String!
    end_time: String!
    usage_limit: Int
    used_count: Int!
    status: String!
    applicable_categories: [String!]
    applicable_products: [String!]
    created: String!
  }

  # 用户优惠券
  type UserCoupon {
    id: String!
    user_id: String!
    coupon_id: String!
    coupon: Coupon!
    status: String!
    used_at: String
    order_id: String
    created: String!
  }

  # 系统通知
  type Notification {
    id: String!
    user_id: String
    title: String!
    content: String!
    type: String!
    is_read: Boolean!
    link_type: String
    link_value: String
    created: String!
  }

  # 客服消息
  type ServiceMessage {
    id: String!
    user_id: String!
    content: String!
    type: String!
    is_from_user: Boolean!
    images: [String!]
    created: String!
  }

  # 首页数据响应
  type HomeData {
    banners: [HomeBanner!]!
    packages: [HomePackage!]!
    featured_products: [Product!]!
    categories: [ProductCategory!]!
    recommendations: [Product!]!
  }

  # 分类页数据响应
  type CategoryData {
    categories: [ProductCategory!]!
    products: ProductsResponse!
    filters: CategoryFilters!
  }

  type CategoryFilters {
    brands: [Brand!]!
    price_ranges: [PriceRange!]!
    attributes: JSON!
  }

  type PriceRange {
    label: String!
    min: Float!
    max: Float!
  }

  # 输入类型
  input CartItemInput {
    product_id: String!
    quantity: Int!
  }

  input CartUpdateInput {
    quantity: Int
    selected: Boolean
  }

  input AddressInput {
    name: String!
    phone: String!
    province: String!
    city: String!
    district: String!
    address: String!
    postal_code: String
    is_default: Boolean
    tag: String
  }

  input MobileProductQueryInput {
    page: Int
    perPage: Int
    category_id: String
    brand_id: String
    keyword: String
    price_min: Float
    price_max: Float
    sort_by: String
    sort_order: SortOrder
    filters: JSON
  }

  input OrderCreateInput {
    items: [OrderItemInput!]!
    shipping_address: ShippingAddressInput!
    payment_method: String!
    coupon_id: String
    notes: String
  }

  input OrderItemInput {
    product_id: String!
    quantity: Int!
    price: Float!
  }

  input ShippingAddressInput {
    name: String!
    phone: String!
    province: String!
    city: String!
    district: String!
    address: String!
    postal_code: String
  }

  extend type Query {
    # 首页数据
    homeData: HomeData!
    
    # 分类页数据
    categoryData(category_id: String): CategoryData!
    
    # 产品相关
    mobileProducts(query: MobileProductQueryInput): ProductsResponse!
    productDetail(id: String!): Product
    
    # 购物车
    cart: Cart!
    
    # 收藏
    favorites(page: Int = 1, perPage: Int = 20): FavoritesResponse!
    isFavorite(product_id: String!): Boolean!
    
    # 地址管理
    addresses: [Address!]!
    defaultAddress: Address
    
    # 用户相关
    mobileProfile: MobileUser
    pointRecords(page: Int = 1, perPage: Int = 20): [PointRecord!]!
    growthRecords(page: Int = 1, perPage: Int = 20): [GrowthRecord!]!
    
    # 搜索历史
    searchHistory: [SearchHistory!]!
    
    # 浏览历史
    viewHistory(page: Int = 1, perPage: Int = 20): [ViewHistory!]!
    
    # 优惠券
    availableCoupons: [Coupon!]!
    userCoupons(status: String): [UserCoupon!]!
    
    # 通知
    notifications(page: Int = 1, perPage: Int = 20): [Notification!]!
    unreadNotificationCount: Int!
    
    # 客服
    serviceMessages: [ServiceMessage!]!
  }

  extend type Mutation {
    # 购物车操作
    addToCart(input: CartItemInput!): CartItem!
    updateCartItem(id: String!, input: CartUpdateInput!): CartItem!
    removeFromCart(id: String!): Boolean!
    clearCart: Boolean!
    toggleCartSelection(id: String!): CartItem!
    selectAllCart(selected: Boolean!): Boolean!
    
    # 收藏操作
    addToFavorites(product_id: String!): Favorite!
    removeFromFavorites(product_id: String!): Boolean!
    
    # 地址管理
    createAddress(input: AddressInput!): Address!
    updateAddress(id: String!, input: AddressInput!): Address!
    deleteAddress(id: String!): Boolean!
    setDefaultAddress(id: String!): Address!
    
    # 用户操作
    updateMobileProfile(name: String, avatar: String, phone: String, nickname: String, gender: String, birthday: String): MobileUser!
    
    # 搜索历史
    addSearchHistory(keyword: String!): SearchHistory!
    clearSearchHistory: Boolean!
    
    # 浏览历史
    addViewHistory(product_id: String!): ViewHistory!
    clearViewHistory: Boolean!
    
    # 订单操作
    createMobileOrder(input: OrderCreateInput!): Order!
    cancelOrder(id: String!, reason: String): Order!
    confirmReceived(id: String!): Order!
    
    # 优惠券操作
    receiveCoupon(coupon_id: String!): UserCoupon!
    
    # 通知操作
    markNotificationRead(id: String!): Notification!
    markAllNotificationsRead: Boolean!
    
    # 客服操作
    sendServiceMessage(content: String!, images: [String!]): ServiceMessage!
  }
`; 