export const refundTypeDefs = `
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

  type RefundsResponse {
    items: [RefundRequest!]!
    pagination: PaginationInfo!
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

  extend type Query {
    # 退款查询
    refunds(query: RefundQueryInput): RefundsResponse!
    refund(id: String!): RefundRequest
  }

  extend type Mutation {
    # 退款变更
    processRefund(id: String!, status: RefundStatus!, adminNotes: String, processedBy: String): RefundRequest!
  }
`; 