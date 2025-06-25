import { gql } from "@apollo/client";

// 优惠券基础信息片段
export const COUPON_FRAGMENT = gql`
  fragment CouponInfo on Coupon {
    id
    name
    description
    code
    type
    discount_type
    discount_value
    min_amount
    max_discount
    total_quantity
    used_quantity
    per_user_limit
    status
    start_time
    end_time
    applicable_products
    applicable_categories
    applicable_brands
    applicable_member_levels
  }
`;

// 优惠券使用记录片段
export const COUPON_USAGE_FRAGMENT = gql`
  fragment CouponUsageInfo on CouponUsage {
    id
    coupon_id
    user_id
    order_id
    discount_amount
    used_time
    coupon {
      ...CouponInfo
    }
  }
  ${COUPON_FRAGMENT}
`;

// 查询优惠券列表
export const GET_COUPONS = gql`
  query GetCoupons($input: CouponQueryInput) {
    coupons(input: $input) {
      items {
        ...CouponInfo
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
  ${COUPON_FRAGMENT}
`;

// 查询单个优惠券
export const GET_COUPON = gql`
  query GetCoupon($id: String!) {
    coupon(id: $id) {
      ...CouponInfo
    }
  }
  ${COUPON_FRAGMENT}
`;

// 查询优惠券统计
export const GET_COUPON_STATS = gql`
  query GetCouponStats {
    couponStats {
      total
      active
      expired
      used_up
      totalUsage
      totalDiscount
      typeDistribution
      usageThisMonth
    }
  }
`;

// 查询优惠券使用记录
export const GET_COUPON_USAGES = gql`
  query GetCouponUsages($input: CouponUsageQueryInput) {
    couponUsages(input: $input) {
      items {
        ...CouponUsageInfo
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
  ${COUPON_USAGE_FRAGMENT}
`;

// 验证优惠券代码
export const VALIDATE_COUPON_CODE = gql`
  query ValidateCouponCode($code: String!) {
    validateCouponCode(code: $code) {
      ...CouponInfo
    }
  }
  ${COUPON_FRAGMENT}
`;

// 创建优惠券
export const CREATE_COUPON = gql`
  mutation CreateCoupon($input: CouponInput!) {
    createCoupon(input: $input) {
      ...CouponInfo
    }
  }
  ${COUPON_FRAGMENT}
`;

// 更新优惠券
export const UPDATE_COUPON = gql`
  mutation UpdateCoupon($id: String!, $input: CouponUpdateInput!) {
    updateCoupon(id: $id, input: $input) {
      ...CouponInfo
    }
  }
  ${COUPON_FRAGMENT}
`;

// 删除优惠券
export const DELETE_COUPON = gql`
  mutation DeleteCoupon($id: String!) {
    deleteCoupon(id: $id)
  }
`;

// 批量删除优惠券
export const BATCH_DELETE_COUPONS = gql`
  mutation BatchDeleteCoupons($ids: [String!]!) {
    batchDeleteCoupons(ids: $ids) {
      success
      message
      successCount
      failureCount
    }
  }
`;

// 生成优惠券代码
export const GENERATE_COUPON_CODES = gql`
  mutation GenerateCouponCodes($template: String!, $count: Int!) {
    generateCouponCodes(template: $template, count: $count)
  }
`;

// 批量创建优惠券
export const BATCH_CREATE_COUPONS = gql`
  mutation BatchCreateCoupons($input: CouponInput!, $codes: [String!]!) {
    batchCreateCoupons(input: $input, codes: $codes) {
      success
      message
      successCount
      failureCount
    }
  }
`;
