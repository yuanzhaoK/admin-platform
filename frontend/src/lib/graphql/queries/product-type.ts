import { gql } from "@apollo/client";

// 商品类型查询
export const GET_PRODUCT_TYPES = gql`
  query GetProductTypes($query: ProductTypeQueryInput) {
    productTypes(query: $query) {
      items {
        id
        name
        slug
        description
        icon
        color
        attributes
        is_active
        sort_order
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

export const GET_PRODUCT_TYPE = gql`
  query GetProductType($id: ID!) {
    productType(id: $id) {
      id
      name
      slug
      description
      icon
      color
      attributes
      is_active
      sort_order
      products_count
      created
      updated
    }
  }
`;

// 商品类型变更
export const CREATE_PRODUCT_TYPE = gql`
  mutation CreateProductType($input: ProductTypeInput!) {
    createProductType(input: $input) {
      id
      name
      is_active
      created
    }
  }
`;

export const UPDATE_PRODUCT_TYPE = gql`
  mutation UpdateProductType($id: ID!, $input: ProductTypeUpdateInput!) {
    updateProductType(id: $id, input: $input) {
      id
      name
      is_active
      updated
    }
  }
`;

export const DELETE_PRODUCT_TYPE = gql`
  mutation DeleteProductType($id: ID!) {
    deleteProductType(id: $id) {
      success
      message
    }
  }
`;
