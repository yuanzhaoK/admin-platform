import { gql } from "@apollo/client";

// 用户基本信息片段
export const USER_FRAGMENT = gql`
  fragment UserInfo on User {
    id
    email
    name
    avatar
    role
    status
    phone
    # last_login
    # login_count
    created
    updated
    collectionId
    collectionName
    emailVisibility
    verified
  }
`;

// 获取所有用户 - 使用分页查询
export const GET_USERS = gql`
  ${USER_FRAGMENT}
  query GetUsers($query: UserQueryInput) {
    users(query: $query) {
      items {
        ...UserInfo
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

// 获取单个用户
export const GET_USER = gql`
  ${USER_FRAGMENT}
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserInfo
    }
  }
`;

// 获取用户统计信息
export const GET_USER_STATS = gql`
  query GetUserStats {
    userStats {
      total
      active
      inactive
      suspended
      verified
      unverified
      admins
      regular_users
      new_this_month
    }
  }
`;

// 搜索用户
export const SEARCH_USERS = gql`
  ${USER_FRAGMENT}
  query SearchUsers($keyword: String!, $limit: Int) {
    searchUsers(keyword: $keyword, limit: $limit) {
      ...UserInfo
    }
  }
`;

// 创建用户
export const CREATE_USER = gql`
  ${USER_FRAGMENT}
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      ...UserInfo
    }
  }
`;

// 更新用户
export const UPDATE_USER = gql`
  ${USER_FRAGMENT}
  mutation UpdateUser($id: ID!, $input: UserUpdateInput!) {
    updateUser(id: $id, input: $input) {
      ...UserInfo
    }
  }
`;

// 删除用户
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

// 用户相关的类型定义
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: "admin" | "user" | "moderator" | "guest";
  status?: "active" | "inactive" | "suspended" | "pending";
  phone?: string;
  points?: number;
  growth_value?: number;
  level?: number;
  vip_status?: string;
  balance?: number;
  last_login?: string;
  login_count?: number;
  created: string;
  updated: string;
  collectionId?: string;
  collectionName?: string;
  emailVisibility?: boolean;
  verified?: boolean;
}

export interface UsersResponse {
  items: User[];
  pagination: {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  verified: number;
  unverified: number;
  admins: number;
  regular_users: number;
  new_this_month: number;
}

export interface GetUsersData {
  users: UsersResponse;
}

export interface GetUsersVariables {
  query?: {
    page?: number;
    perPage?: number;
    role?: string;
    status?: string;
    verified?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

export interface GetUserData {
  user: User | null;
}

export interface GetUserVariables {
  id: string;
}

export interface GetUserStatsData {
  userStats: UserStats;
}

export interface SearchUsersData {
  searchUsers: User[];
}

export interface SearchUsersVariables {
  keyword: string;
  limit?: number;
}

export interface CreateUserData {
  createUser: User;
}

export interface CreateUserVariables {
  input: {
    email: string;
    name?: string;
    password: string;
    role?: string;
    status?: string;
    phone?: string;
    avatar?: string;
  };
}

export interface UpdateUserData {
  updateUser: User;
}

export interface UpdateUserVariables {
  id: string;
  input: {
    email?: string;
    name?: string;
    role?: string;
    status?: string;
    phone?: string;
    avatar?: string;
    verified?: boolean;
    points?: number;
    growth_value?: number;
    balance?: number;
  };
}

export interface DeleteUserData {
  deleteUser: {
    success: boolean;
    message: string;
  };
}

export interface DeleteUserVariables {
  id: string;
}
