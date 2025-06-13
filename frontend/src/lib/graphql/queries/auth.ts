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