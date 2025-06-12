export const typeDefs = `
  # 用户类型 - 完全匹配 PocketBase 用户结构
  type User {
    id: String!
    email: String!
    name: String
    avatar: String
    role: String
    created: String!
    updated: String!
    collectionId: String
    collectionName: String
    emailVisibility: Boolean
    verified: Boolean
  }

  # 产品类型 - 完全匹配 PocketBase 产品结构
  type Product {
    id: String!
    name: String!
    description: String
    price: Float
    category: String
    status: ProductStatus!
    tags: [String!]
    config: JSON
    sku: String
    stock: Int
    weight: Float
    dimensions: ProductDimensions
    images: [String!]
    meta_data: JSON
    created: String!
    updated: String!
  }

  type ProductDimensions {
    length: Float
    width: Float
    height: Float
  }

  enum ProductStatus {
    active
    inactive
    draft
  }

  # 订单类型 - 完全匹配 PocketBase 订单结构
  type Order {
    id: String!
    collectionId: String!
    collectionName: String!
    order_number: String!
    user_id: String!
    total_amount: Float!
    payment_method: String!
    order_source: String!
    order_type: String!
    status: String!
    items: [OrderItem!]!
    shipping_address: ShippingAddress!
    logistics_info: LogisticsInfo
    notes: String
    shipped_at: String
    delivered_at: String
    expand: OrderExpand
  }

  type OrderExpand {
    user_id: User
  }

  type OrderItem {
    product_id: String!
    product_name: String!
    product_image: String
    sku: String
    price: Float!
    quantity: Int!
    total: Float!
  }

  type ShippingAddress {
    name: String!
    phone: String!
    province: String!
    city: String!
    district: String!
    address: String!
    postal_code: String
  }

  type LogisticsInfo {
    company: String
    tracking_number: String
    status: String
    updates: [LogisticsUpdate!]
  }

  type LogisticsUpdate {
    time: String!
    status: String!
    description: String!
    location: String
  }

  # 退款请求类型 - 完全匹配 PocketBase 退款结构
  type RefundRequest {
    id: String!
    service_number: String!
    order_id: String!
    user_id: String!
    refund_type: RefundType!
    refund_amount: Float!
    reason: RefundReason!
    description: String!
    evidence_images: [String!]
    status: RefundStatus!
    admin_notes: String
    processed_at: String
    processed_by: String
    created: String!
    updated: String!
    expand: RefundExpand
  }

  type RefundExpand {
    order_id: Order
    user_id: User
    processed_by: User
  }

  enum RefundType {
    refund_only
    return_and_refund
    exchange
  }

  enum RefundReason {
    quality_issue
    wrong_item
    damaged_in_transit
    not_as_described
    size_issue
    change_of_mind
    other
  }

  enum RefundStatus {
    pending
    approved
    rejected
    processing
    completed
    cancelled
  }

  # 订单设置类型
  type OrderSetting {
    id: String!
    setting_key: String!
    setting_name: String!
    setting_value: String!
    setting_type: SettingType!
    description: String
    category: SettingCategory!
    created: String!
    updated: String!
  }

  enum SettingType {
    number
    boolean
    text
    json
  }

  enum SettingCategory {
    payment
    shipping
    timeout
    auto_operations
    notifications
  }

  # 分页响应类型
  type PaginationInfo {
    page: Int!
    perPage: Int!
    totalPages: Int!
    totalItems: Int!
  }

  type ProductsResponse {
    items: [Product!]!
    pagination: PaginationInfo!
  }

  type OrdersResponse {
    items: [Order!]!
    pagination: PaginationInfo!
  }

  type RefundsResponse {
    items: [RefundRequest!]!
    pagination: PaginationInfo!
  }

  # 统计类型
  type ProductStats {
    total: Int!
    active: Int!
    inactive: Int!
    draft: Int!
    categories: JSON!
    avgPrice: Float
    totalStock: Int
  }

  type OrderStats {
    total: Int!
    pending_payment: Int!
    paid: Int!
    processing: Int!
    shipped: Int!
    delivered: Int!
    completed: Int!
    cancelled: Int!
    refunding: Int!
    refunded: Int!
    total_amount: Float!
    avg_amount: Float!
    payment_methods: JSON!
    order_sources: JSON!
    order_types: JSON!
  }

  # 输入类型
  input ProductQueryInput {
    page: Int
    perPage: Int
    status: ProductStatus
    category: String
    search: String
    sortBy: String
    sortOrder: SortOrder
  }

  input OrderQueryInput {
    page: Int
    perPage: Int
    status: String
    payment_method: String
    order_source: String
    order_type: String
    user_id: String
    search: String
    date_from: String
    date_to: String
    sortBy: String
    sortOrder: SortOrder
  }

  input RefundQueryInput {
    page: Int
    perPage: Int
    status: RefundStatus
    refund_type: RefundType
    reason: RefundReason
    user_id: String
    order_id: String
    search: String
    date_from: String
    date_to: String
    sortBy: String
    sortOrder: SortOrder
  }

  enum SortOrder {
    asc
    desc
  }

  # 认证类型
  type AuthResponse {
    token: String!
    record: User!
  }

  input LoginInput {
    identity: String!
    password: String!
  }

  # JSON 标量类型
  scalar JSON

  # 查询
  type Query {
    # 产品查询
    products(query: ProductQueryInput): ProductsResponse!
    product(id: String!): Product
    productStats: ProductStats!

    # 订单查询
    orders(query: OrderQueryInput): OrdersResponse!
    order(id: String!): Order
    orderStats: OrderStats!

    # 退款查询
    refunds(query: RefundQueryInput): RefundsResponse!
    refund(id: String!): RefundRequest

    # 设置查询
    orderSettings: [OrderSetting!]!
    orderSetting(key: String!): OrderSetting

    # 用户查询
    users: [User!]!
    user(id: String!): User

    # 健康检查
    health: String!
  }

  # 变更
  type Mutation {
    # 认证变更
    login(input: LoginInput!): AuthResponse!
    logout: Boolean!

    # 产品变更
    createProduct(input: ProductInput!): Product!
    updateProduct(id: String!, input: ProductUpdateInput!): Product!
    deleteProduct(id: String!): Boolean!

    # 订单变更
    updateOrderStatus(id: String!, status: String!, notes: String): Order!
    updateOrderLogistics(id: String!, logistics: LogisticsInfoInput!): Order!

    # 退款变更
    processRefund(id: String!, status: RefundStatus!, adminNotes: String, processedBy: String): RefundRequest!

    # 设置变更
    updateOrderSetting(id: String!, value: String!): OrderSetting!
  }

  # 输入类型定义
  input ProductInput {
    name: String!
    description: String
    price: Float
    category: String
    status: ProductStatus!
    tags: [String!]
    sku: String
    stock: Int
    weight: Float
    images: [String!]
  }

  input ProductUpdateInput {
    name: String
    description: String
    price: Float
    category: String
    status: ProductStatus
    tags: [String!]
    sku: String
    stock: Int
    weight: Float
    images: [String!]
  }

  input LogisticsInfoInput {
    company: String
    tracking_number: String
    status: String
  }
`; 