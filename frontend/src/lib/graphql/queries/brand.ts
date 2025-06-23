import { gql } from "@apollo/client";

// 品牌查询
export const GET_BRANDS = gql`
  query GetBrands($query: BrandQueryInput) {
    brands(query: $query) {
      items {
        id
        name
        slug
        description
        logo
        website
        country
        founded_year
        is_active
        sort_order
        meta_title
        meta_description
        products_count
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
  query GetBrand($id: ID!) {
    brand(id: $id) {
      id
      name
      slug
      description
      logo
      website
      country
      founded_year
      is_active
      sort_order
      meta_title
      meta_description
      products_count
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
      is_active
      created
    }
  }
`;

export const UPDATE_BRAND = gql`
  mutation UpdateBrand($id: ID!, $input: BrandUpdateInput!) {
    updateBrand(id: $id, input: $input) {
      id
      name
      is_active
      updated
    }
  }
`;

export const DELETE_BRAND = gql`
  mutation DeleteBrand($id: ID!) {
    deleteBrand(id: $id) {
      success
      message
    }
  }
`;
