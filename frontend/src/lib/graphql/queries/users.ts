import { gql } from '@apollo/client';

// 用户基本信息片段
export const USER_FRAGMENT = gql`
  fragment UserInfo on User {
    id
    email
    name
    avatar
    role
    created
    updated
    collectionId
    collectionName
    emailVisibility
    verified
  }
`;

// 获取所有用户
export const GET_USERS = gql`
  ${USER_FRAGMENT}
  query GetUsers {
    users {
      ...UserInfo
    }
  }
`;

// 获取单个用户
export const GET_USER = gql`
  ${USER_FRAGMENT}
  query GetUser($id: String!) {
    user(id: $id) {
      ...UserInfo
    }
  }
`;

// 用户相关的类型定义
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'admin' | 'user';
  created: string;
  updated: string;
  collectionId?: string;
  collectionName?: string;
  emailVisibility?: boolean;
  verified?: boolean;
}

export interface GetUsersData {
  users: User[];
}

export interface GetUserData {
  user: User | null;
}

export interface GetUserVariables {
  id: string;
} 