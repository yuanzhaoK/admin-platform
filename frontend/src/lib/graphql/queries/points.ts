import { gql } from "@apollo/client";

// 积分规则查询
export const GET_POINTS_RULES = gql`
  query GetPointsRules($input: PointsRuleQueryInput) {
    pointsRules(input: $input) {
      items {
        id
        name
        description
        type
        points
        conditions
        is_active
        start_time
        end_time
        daily_limit
        total_limit
        sort_order
        created
        updated
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

// 单个积分规则查询
export const GET_POINTS_RULE = gql`
  query GetPointsRule($id: String!) {
    pointsRule(id: $id) {
      id
      name
      description
      type
      points
      conditions
      is_active
      start_time
      end_time
      daily_limit
      total_limit
      sort_order
      created
      updated
    }
  }
`;

// 积分兑换商品查询
export const GET_POINTS_EXCHANGES = gql`
  query GetPointsExchanges($input: PointsExchangeQueryInput) {
    pointsExchanges(input: $input) {
      items {
        id
        name
        description
        image
        points_required
        exchange_type
        reward_value
        reward_product_id
        reward_coupon_id
        stock
        used_count
        status
        sort_order
        created
        updated
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

// 单个积分兑换商品查询
export const GET_POINTS_EXCHANGE = gql`
  query GetPointsExchange($id: String!) {
    pointsExchange(id: $id) {
      id
      name
      description
      image
      points_required
      exchange_type
      reward_value
      reward_product_id
      reward_coupon_id
      stock
      used_count
      status
      sort_order
      created
      updated
    }
  }
`;

// 积分记录查询
export const GET_POINTS_RECORDS = gql`
  query GetPointsRecords($input: PointsRecordQueryInput) {
    pointsRecords(input: $input) {
      items {
        id
        user_id
        username
        type
        points
        balance
        reason
        order_id
        related_id
        created
        member {
          id
          username
          name
        }
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

// 积分兑换记录查询
export const GET_POINTS_EXCHANGE_RECORDS = gql`
  query GetPointsExchangeRecords($input: PointsExchangeRecordQueryInput) {
    pointsExchangeRecords(input: $input) {
      items {
        id
        user_id
        username
        exchange_id
        exchange {
          id
          name
          description
          points_required
          exchange_type
        }
        points_cost
        reward_type
        reward_value
        status
        created
        processed_time
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

// 积分统计数据查询
export const GET_POINTS_STATS = gql`
  query GetPointsStats {
    pointsStats {
      totalPoints
      totalUsers
      totalEarned
      totalSpent
      totalExpired
      exchangeStats
      ruleStats
      monthlyTrend
    }
  }
`;

// 创建积分规则
export const CREATE_POINTS_RULE = gql`
  mutation CreatePointsRule($input: PointsRuleInput!) {
    createPointsRule(input: $input) {
      id
      name
      description
      type
      points
      conditions
      is_active
      start_time
      end_time
      daily_limit
      total_limit
      sort_order
      created
      updated
    }
  }
`;

// 更新积分规则
export const UPDATE_POINTS_RULE = gql`
  mutation UpdatePointsRule($id: String!, $input: PointsRuleUpdateInput!) {
    updatePointsRule(id: $id, input: $input) {
      id
      name
      description
      type
      points
      conditions
      is_active
      start_time
      end_time
      daily_limit
      total_limit
      sort_order
      created
      updated
    }
  }
`;

// 删除积分规则
export const DELETE_POINTS_RULE = gql`
  mutation DeletePointsRule($id: String!) {
    deletePointsRule(id: $id)
  }
`;

// 创建积分兑换商品
export const CREATE_POINTS_EXCHANGE = gql`
  mutation CreatePointsExchange($input: PointsExchangeInput!) {
    createPointsExchange(input: $input) {
      id
      name
      description
      image
      points_required
      exchange_type
      reward_value
      reward_product_id
      reward_coupon_id
      stock
      used_count
      status
      sort_order
      created
      updated
    }
  }
`;

// 更新积分兑换商品
export const UPDATE_POINTS_EXCHANGE = gql`
  mutation UpdatePointsExchange($id: String!, $input: PointsExchangeUpdateInput!) {
    updatePointsExchange(id: $id, input: $input) {
      id
      name
      description
      image
      points_required
      exchange_type
      reward_value
      reward_product_id
      reward_coupon_id
      stock
      used_count
      status
      sort_order
      created
      updated
    }
  }
`;

// 删除积分兑换商品
export const DELETE_POINTS_EXCHANGE = gql`
  mutation DeletePointsExchange($id: String!) {
    deletePointsExchange(id: $id)
  }
`;

// 调整用户积分
export const ADJUST_USER_POINTS = gql`
  mutation AdjustUserPoints($user_id: String!, $points: Int!, $reason: String!) {
    adjustUserPointsRecord(user_id: $user_id, points: $points, reason: $reason) {
      id
      user_id
      username
      type
      points
      balance
      reason
      created
    }
  }
`;

export const EXPORT_POINTS_RECORDS = gql`
  mutation ExportPointsRecords($input: PointsRecordFilterInput) {
    exportPointsRecords(input: $input) {
      headers
      rows
      total
      filename
    }
  }
`;

// 批量调整积分
export const BATCH_ADJUST_POINTS = gql`
  mutation BatchAdjustPoints($user_ids: [String!]!, $points: Int!, $reason: String!) {
    batchAdjustPoints(user_ids: $user_ids, points: $points, reason: $reason) {
      success
      processedCount
      errors
    }
  }
`;

// TypeScript 类型定义
export interface PointsRuleQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  type?: string;
  is_active?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PointsExchangeQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  exchange_type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PointsRecordQueryInput {
  page?: number;
  perPage?: number;
  user_id?: string;
  username?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PointsExchangeRecordQueryInput {
  page?: number;
  perPage?: number;
  user_id?: string;
  exchange_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PointsRuleInput {
  name: string;
  description?: string;
  type: string;
  points: number;
  conditions?: Record<string, unknown>;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  daily_limit?: number;
  total_limit?: number;
  sort_order: number;
}

export interface PointsRuleUpdateInput {
  name?: string;
  description?: string;
  type?: string;
  points?: number;
  conditions?: Record<string, unknown>;
  is_active?: boolean;
  start_time?: string;
  end_time?: string;
  daily_limit?: number;
  total_limit?: number;
  sort_order?: number;
}

export interface PointsExchangeInput {
  name: string;
  description?: string;
  image?: string;
  points_required: number;
  exchange_type: string;
  reward_value?: number;
  reward_product_id?: string;
  reward_coupon_id?: string;
  stock?: number;
  status: string;
  sort_order: number;
}

export interface PointsExchangeUpdateInput {
  name?: string;
  description?: string;
  image?: string;
  points_required?: number;
  exchange_type?: string;
  reward_value?: number;
  reward_product_id?: string;
  reward_coupon_id?: string;
  stock?: number;
  status?: string;
  sort_order?: number;
}

export interface PointsStats {
  totalPoints: number;
  totalUsers: number;
  totalEarned: number;
  totalSpent: number;
  totalExpired: number;
  exchangeStats: Record<string, unknown>;
  ruleStats: Record<string, unknown>;
  monthlyTrend: Record<string, unknown>;
}

export interface PointsBatchOperationResult {
  success: boolean;
  processedCount: number;
  errors: string[];
}

export interface PointsRecordFilterInput {
  username?: string;
  user_id?: string;
  type?: string;
  points_min?: number;
  points_max?: number;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface PointsExportResult {
  headers: string[];
  rows: string[][];
  total: number;
  filename: string;
}

// 积分规则模板相关类型
export interface PointsRuleTemplate {
  id: string;
  name: string;
  description?: string;
  template_data: Record<string, unknown>;
  category?: string;
  is_public: boolean;
  usage_count: number;
  created_by: string;
  created: string;
  updated: string;
}

export interface PointsRuleTemplatesResponse {
  items: PointsRuleTemplate[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface PointsRuleTemplateQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  category?: string;
  is_public?: boolean;
  created_by?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface PointsRuleTemplateInput {
  name: string;
  description?: string;
  template_data: Record<string, unknown>;
  category?: string;
  is_public: boolean;
}

export interface PointsRuleTemplateUpdateInput {
  name?: string;
  description?: string;
  template_data?: Record<string, unknown>;
  category?: string;
  is_public?: boolean;
}

// 积分规则模板查询
export const GET_POINTS_RULE_TEMPLATES = gql`
  query GetPointsRuleTemplates($input: PointsRuleTemplateQueryInput!) {
    pointsRuleTemplates(input: $input) {
      items {
        id
        name
        description
        template_data
        category
        is_public
        usage_count
        created_by
        created
        updated
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

export const GET_POINTS_RULE_TEMPLATE = gql`
  query GetPointsRuleTemplate($id: String!) {
    pointsRuleTemplate(id: $id) {
      id
      name
      description
      template_data
      category
      is_public
      usage_count
      created_by
      created
      updated
    }
  }
`;

// 积分规则模板变更操作
export const CREATE_POINTS_RULE_TEMPLATE = gql`
  mutation CreatePointsRuleTemplate($input: PointsRuleTemplateInput!) {
    createPointsRuleTemplate(input: $input) {
      id
      name
      description
      template_data
      category
      is_public
      usage_count
      created_by
      created
      updated
    }
  }
`;

export const UPDATE_POINTS_RULE_TEMPLATE = gql`
  mutation UpdatePointsRuleTemplate($id: String!, $input: PointsRuleTemplateUpdateInput!) {
    updatePointsRuleTemplate(id: $id, input: $input) {
      id
      name
      description
      template_data
      category
      is_public
      usage_count
      created_by
      created
      updated
    }
  }
`;

export const DELETE_POINTS_RULE_TEMPLATE = gql`
  mutation DeletePointsRuleTemplate($id: String!) {
    deletePointsRuleTemplate(id: $id)
  }
`;

export const APPLY_POINTS_RULE_TEMPLATE = gql`
  mutation ApplyPointsRuleTemplate($templateId: String!, $ruleInput: PointsRuleInput!) {
    applyPointsRuleTemplate(template_id: $templateId, rule_input: $ruleInput) {
      id
      name
      description
      type
      points
      daily_limit
      total_limit
      is_active
      created
      updated
    }
  }
`;
