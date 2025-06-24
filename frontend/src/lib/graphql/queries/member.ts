import { gql } from "@apollo/client";

// 会员列表查询
export const GET_MEMBERS = gql`
  query GetMembers($input: MemberQueryInput) {
    members(input: $input) {
      items {
        id
        username
        email
        phone
        real_name
        gender
        birthday
        level {
          id
          name
          discount_rate
          color
        }
        points
        balance
        status
        register_time
        last_login_time
        total_orders
        total_amount
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

// 单个会员详情查询
export const GET_MEMBER = gql`
  query GetMember($id: String!) {
    member(id: $id) {
      id
      username
      email
      phone
      real_name
      gender
      birthday
      level {
        id
        name
        description
        discount_rate
        points_required
        benefits
        color
        icon
      }
      points
      balance
      status
      register_time
      last_login_time
      total_orders
      total_amount
    }
  }
`;

// 会员等级列表查询
export const GET_MEMBER_LEVELS = gql`
  query GetMemberLevels($input: MemberQueryInput) {
    memberLevels(input: $input) {
      items {
        id
        name
        description
        discount_rate
        points_required
        benefits
        icon
        color
        sort_order
        is_active
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

// 会员统计查询
export const GET_MEMBER_STATS = gql`
  query GetMemberStats {
    memberStats {
      total
      active
      inactive
      banned
      totalPoints
      totalBalance
      levelDistribution
      newMembersThisMonth
    }
  }
`;

// 创建会员
export const CREATE_MEMBER = gql`
  mutation CreateMember($input: MemberInput!) {
    createMember(input: $input) {
      id
      username
      email
      phone
      real_name
      gender
      birthday
      level {
        id
        name
        discount_rate
        color
      }
      points
      balance
      status
      register_time
      total_orders
      total_amount
    }
  }
`;

// 更新会员
export const UPDATE_MEMBER = gql`
  mutation UpdateMember($id: String!, $input: MemberUpdateInput!) {
    updateMember(id: $id, input: $input) {
      id
      username
      email
      phone
      real_name
      gender
      birthday
      level {
        id
        name
        discount_rate
        color
      }
      points
      balance
      status
      register_time
      total_orders
      total_amount
    }
  }
`;

// 删除会员
export const DELETE_MEMBER = gql`
  mutation DeleteMember($id: String!) {
    deleteMember(id: $id)
  }
`;

// 批量删除会员
export const BATCH_DELETE_MEMBERS = gql`
  mutation BatchDeleteMembers($ids: [String!]!) {
    batchDeleteMembers(ids: $ids) {
      success
      message
      successCount
      failureCount
      errors
    }
  }
`;

// 创建会员等级
export const CREATE_MEMBER_LEVEL = gql`
  mutation CreateMemberLevel($input: MemberLevelInput!) {
    createMemberLevel(input: $input) {
      id
      name
      description
      discount_rate
      points_required
      benefits
      icon
      color
      sort_order
      is_active
    }
  }
`;

// 更新会员等级
export const UPDATE_MEMBER_LEVEL = gql`
  mutation UpdateMemberLevel($id: String!, $input: MemberLevelUpdateInput!) {
    updateMemberLevel(id: $id, input: $input) {
      id
      name
      description
      discount_rate
      points_required
      benefits
      icon
      color
      sort_order
      is_active
    }
  }
`;

// 删除会员等级
export const DELETE_MEMBER_LEVEL = gql`
  mutation DeleteMemberLevel($id: String!) {
    deleteMemberLevel(id: $id)
  }
`;

// 调整会员积分
export const ADJUST_MEMBER_POINTS = gql`
  mutation AdjustMemberPoints($id: String!, $points: Int!, $reason: String!) {
    adjustMemberPoints(id: $id, points: $points, reason: $reason) {
      id
      username
      points
      balance
      level {
        id
        name
        discount_rate
        color
      }
      updated
    }
  }
`;

// 调整会员余额
export const ADJUST_MEMBER_BALANCE = gql`
  mutation AdjustMemberBalance($id: String!, $amount: Float!, $reason: String!) {
    adjustMemberBalance(id: $id, amount: $amount, reason: $reason) {
      id
      username
      points
      balance
      level {
        id
        name
        discount_rate
        color
      }
      updated
    }
  }
`;

// 导出会员数据
export const EXPORT_MEMBERS = gql`
  mutation ExportMembers($input: MemberQueryInput) {
    exportMembers(input: $input)
  }
`;

// 导入会员数据
export const IMPORT_MEMBERS = gql`
  mutation ImportMembers($csvData: String!) {
    importMembers(csvData: $csvData) {
      success
      message
      successCount
      failureCount
      errors
    }
  }
`;
