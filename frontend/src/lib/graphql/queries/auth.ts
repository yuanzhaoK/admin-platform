import { gql } from '@apollo/client';

// 认证相关的查询和变更
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      token
      refresh_token
      expires_in
      user {
        id
        email
        permissions
        role
        status
        username
        record
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`; 