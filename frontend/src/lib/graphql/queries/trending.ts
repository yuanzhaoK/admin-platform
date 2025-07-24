import { gql } from "@apollo/client";

// 热门项目列表查询
export const GET_TRENDING_ITEMS = gql`
  query GetTrendingItems($input: TrendingItemQueryInput) {
    trendingItems(input: $input) {
      items {
        id
        product_name
        description
        type
        product_id
        item_data
        category
        tags
        score
        manual_score
        auto_score
        rank
        status
        start_time
        end_time
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

// 单个热门项目查询
export const GET_TRENDING_ITEM = gql`
  query GetTrendingItem($id: String!) {
    trendingItem(id: $id) {
      id
      name
      description
      type
      product_id
      item_data
      category
      tags
      score
      manual_score
      auto_score
      rank
      status
      start_time
      end_time
      created
      updated
    }
  }
`;

// 热门规则列表查询
export const GET_TRENDING_RULES = gql`
  query GetTrendingRules($input: TrendingItemQueryInput) {
    trendingRules(input: $input) {
      items {
        id
        name
        description
        type
        display_count
        update_frequency
        calculation_method
        weight_config
        is_active
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

// 单个热门规则查询
export const GET_TRENDING_RULE = gql`
  query GetTrendingRule($id: String!) {
    trendingRule(id: $id) {
      id
      name
      description
      type
      display_count
      update_frequency
      calculation_method
      weight_config
      is_active
      sort_order
      created
      updated
    }
  }
`;

// 热门统计数据查询
export const GET_TRENDING_STATS = gql`
  query GetTrendingStats($input: TrendingStatsQueryInput) {
    trendingStats(input: $input) {
      items {
        id
        product_id
        date
        view_count
        click_count
        share_count
        like_count
        comment_count
        purchase_count
        score
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

// 热门概览统计
export const GET_TRENDING_OVERVIEW_STATS = gql`
  query GetTrendingOverviewStats {
    trendingOverviewStats {
      totalItems
      activeItems
      totalViews
      totalClicks
      topTrending {
        id
        name
        type
        score
        rank
        status
      }
      categoryStats
      typeStats
      dailyTrends
      weeklyTrends
      monthlyTrends
    }
  }
`;

// 计算热门分数
export const CALCULATE_TRENDING_SCORE = gql`
  query CalculateTrendingScore($product_id: String!, $type: TrendingType!) {
    calculateTrendingScore(product_id: $product_id, type: $type)
  }
`;

// 创建热门项目
export const CREATE_TRENDING_ITEM = gql`
  mutation CreateTrendingItem($input: TrendingItemInput!) {
    createTrendingItem(input: $input) {
      id
      name
      description
      type
      product_id
      item_data
      category
      tags
      score
      manual_score
      auto_score
      rank
      status
      start_time
      end_time
      created
      updated
    }
  }
`;

// 更新热门项目
export const UPDATE_TRENDING_ITEM = gql`
  mutation UpdateTrendingItem($id: String!, $input: TrendingItemUpdateInput!) {
    updateTrendingItem(id: $id, input: $input) {
      id
      name
      description
      type
      product_id
      item_data
      category
      tags
      score
      manual_score
      auto_score
      rank
      status
      start_time
      end_time
      created
      updated
    }
  }
`;

// 删除热门项目
export const DELETE_TRENDING_ITEM = gql`
  mutation DeleteTrendingItem($id: String!) {
    deleteTrendingItem(id: $id)
  }
`;

// 批量删除热门项目
export const BATCH_DELETE_TRENDING_ITEMS = gql`
  mutation BatchDeleteTrendingItems($ids: [String!]!) {
    batchDeleteTrendingItems(ids: $ids) {
      success
      message
      successCount
      failureCount
      errors
    }
  }
`;

// 创建热门规则
export const CREATE_TRENDING_RULE = gql`
  mutation CreateTrendingRules($input: TrendingRuleInput!) {
    createTrendingRules(input: $input) {
      id
      name
      description
      type
      display_count
      update_frequency
      calculation_method
      weight_config
      is_active
      sort_order
      created
      updated
    }
  }
`;

// 更新热门规则
export const UPDATE_TRENDING_RULE = gql`
  mutation UpdateTrendingRules($id: String!, $input: TrendingRuleUpdateInput!) {
    updateTrendingRules(id: $id, input: $input) {
      id
      name
      description
      type
      display_count
      update_frequency
      calculation_method
      weight_config
      is_active
      sort_order
      created
      updated
    }
  }
`;

// 删除热门规则
export const DELETE_TRENDING_RULE = gql`
  mutation DeleteTrendingRules($id: String!) {
    deleteTrendingRules(id: $id)
  }
`;

// 刷新热门分数
export const REFRESH_TRENDING_SCORES = gql`
  mutation RefreshTrendingScores($category_id: String) {
    refreshTrendingScores(category_id: $category_id)
  }
`;

// 更新热门排名
export const UPDATE_TRENDING_RANKS = gql`
  mutation UpdateTrendingRanks($category_id: String) {
    updateTrendingRanks(category_id: $category_id)
  }
`;

// 添加到热门
export const ADD_TO_TRENDING = gql`
  mutation AddToTrending($product_id: String!, $type: TrendingType!, $category: String!) {
    addToTrending(product_id: $product_id, type: $type, category: $category) {
      id
      name
      type
      product_id
      category
      score
      rank
      status
      created
    }
  }
`;

// 从热门移除
export const REMOVE_FROM_TRENDING = gql`
  mutation RemoveFromTrending($id: String!) {
    removeFromTrending(id: $id)
  }
`;
