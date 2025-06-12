import { gql } from '@apollo/client';

// 认证相关的查询和变更
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      record {
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
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

// 用户查询
export const GET_USERS = gql`
  query GetUsers {
    users {
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
  }
`;

export const GET_USER = gql`
  query GetUser($id: String!) {
    user(id: $id) {
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
  }
`;

// 健康检查
export const HEALTH_CHECK = gql`
  query HealthCheck {
    health
  }
`; 