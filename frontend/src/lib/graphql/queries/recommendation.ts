import { gql } from "@apollo/client";

// ===== 查询定义 =====

// 获取推荐列表
export const GET_PRODUCT_RECOMMENDATIONS = gql`
  query GetProductRecommendations($input: ProductRecommendationQueryInput) {
    productRecommendations(input: $input) {
      items {
        id
        name
        description
        type
        position
        products {
          id
          name
          price
          images
          category {
            name
          }
          brand {
            name
          }
        }
        product_ids
        display_count
        sort_type
        is_active
        start_time
        end_time
        weight
        click_count
        conversion_count
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

// 获取单个推荐
export const GET_PRODUCT_RECOMMENDATION = gql`
  query GetProductRecommendation($id: String!) {
    productRecommendation(id: $id) {
      id
      name
      description
      type
      position
      products {
        id
        name
        price
        images
        category {
          name
        }
        brand {
          name
        }
      }
      product_ids
      conditions
      display_count
      sort_type
      is_active
      start_time
      end_time
      weight
      click_count
      conversion_count
      created
      updated
    }
  }
`;

// 获取推荐规则列表
export const GET_RECOMMENDATION_RULES = gql`
  query GetRecommendationRules($input: ProductRecommendationQueryInput) {
    recommendationRules(input: $input) {
      items {
        id
        name
        description
        type
        conditions
        default_display_count
        default_sort_type
        is_system
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

// 获取推荐概览统计
export const GET_RECOMMENDATION_OVERVIEW_STATS = gql`
  query GetRecommendationOverviewStats {
    recommendationOverviewStats {
      totalRecommendations
      activeRecommendations
      totalViews
      totalClicks
      totalConversions
      avgCtr
      avgConversionRate
      topPerforming {
        id
        name
        click_count
        conversion_count
      }
      positionStats
      typeStats
    }
  }
`;

// 预览推荐商品
export const PREVIEW_RECOMMENDATION = gql`
  query PreviewRecommendation($input: ProductRecommendationInput!) {
    previewRecommendation(input: $input) {
      id
      name
      price
      images
      category {
        name
      }
      brand {
        name
      }
      rating
      sales_count
    }
  }
`;

// ===== 变更定义 =====

// 创建推荐
export const CREATE_PRODUCT_RECOMMENDATION = gql`
  mutation CreateProductRecommendation($input: ProductRecommendationInput!) {
    createProductRecommendation(input: $input) {
      id
      name
      description
      type
      position
      product_ids
      display_count
      sort_type
      is_active
      start_time
      end_time
      weight
      created
      updated
    }
  }
`;

// 更新推荐
export const UPDATE_PRODUCT_RECOMMENDATION = gql`
  mutation UpdateProductRecommendation($id: String!, $input: ProductRecommendationUpdateInput!) {
    updateProductRecommendation(id: $id, input: $input) {
      id
      name
      description
      type
      position
      product_ids
      display_count
      sort_type
      is_active
      start_time
      end_time
      weight
      updated
    }
  }
`;

// 删除推荐
export const DELETE_PRODUCT_RECOMMENDATION = gql`
  mutation DeleteProductRecommendation($id: String!) {
    deleteProductRecommendation(id: $id)
  }
`;

// 批量删除推荐
export const BATCH_DELETE_PRODUCT_RECOMMENDATIONS = gql`
  mutation BatchDeleteProductRecommendations($ids: [String!]!) {
    batchDeleteProductRecommendations(ids: $ids) {
      success
      message
      successCount
      failureCount
      errors
    }
  }
`;

// 创建推荐规则
export const CREATE_RECOMMENDATION_RULE = gql`
  mutation CreateRecommendationRule($input: RecommendationRuleInput!) {
    createRecommendationRules(input: $input) {
      id
      name
      description
      type
      conditions
      default_display_count
      default_sort_type
      created
      updated
    }
  }
`;

// 更新推荐规则
export const UPDATE_RECOMMENDATION_RULE = gql`
  mutation UpdateRecommendationRule($id: String!, $input: RecommendationRuleUpdateInput!) {
    updateRecommendationRules(id: $id, input: $input) {
      id
      name
      description
      type
      conditions
      default_display_count
      default_sort_type
      updated
    }
  }
`;

// 删除推荐规则
export const DELETE_RECOMMENDATION_RULE = gql`
  mutation DeleteRecommendationRule($id: String!) {
    deleteRecommendationRules(id: $id)
  }
`;

// 复制推荐
export const DUPLICATE_RECOMMENDATION = gql`
  mutation DuplicateRecommendation($id: String!) {
    duplicateRecommendation(id: $id) {
      id
      name
      type
      position
      is_active
    }
  }
`;

// 重新排序推荐
export const REORDER_RECOMMENDATIONS = gql`
  mutation ReorderRecommendations($ids: [String!]!) {
    reorderRecommendations(ids: $ids)
  }
`;
