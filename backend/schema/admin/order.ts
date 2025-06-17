export const orderTypeDefs = `
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

  type OrdersResponse {
    items: [Order!]!
    pagination: PaginationInfo!
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

  input LogisticsInfoInput {
    company: String
    tracking_number: String
    status: String
  }

  extend type Query {
    # 订单查询
    orders(query: OrderQueryInput): OrdersResponse!
    order(id: String!): Order
    orderStats: OrderStats!
  }

  extend type Mutation {
    # 订单变更
    updateOrderStatus(id: String!, status: String!, notes: String): Order!
    updateOrderLogistics(id: String!, logistics: LogisticsInfoInput!): Order!
  }
`; 