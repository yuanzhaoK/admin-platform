import { gql } from '@apollo/client';

// 品牌查询
export const GET_BRANDS = gql`
  query GetBrands($query: BrandQueryInput) {
    brands(query: $query) {
      items {
        id
        name
        description
        logo
        website
        sort_order
        status
        created
        updated
      }
      pagination {
        page
        perPage
        totalPages
        totalItems
      }
    }
  }
`;

export const GET_BRAND = gql`
  query GetBrand($id: String!) {
    brand(id: $id) {
      id
      name
      description
      logo
      website
      sort_order
      status
      created
      updated
    }
  }
`;

// 品牌变更
export const CREATE_BRAND = gql`
  mutation CreateBrand($input: BrandInput!) {
    createBrand(input: $input) {
      id
      name
      status
      created
    }
  }
`;

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($id: String!, $input: BrandUpdateInput!) {
    updateBrand(id: $id, input: $input) {
      id
      name
      status
      updated
    }
  }
`;

export const DELETE_BRAND = gql`
  mutation DeleteBrand($id: String!) {
    deleteBrand(id: $id)
  }
`; 