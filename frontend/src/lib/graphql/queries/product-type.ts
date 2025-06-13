import { gql } from '@apollo/client';

// 商品类型查询
export const GET_PRODUCT_TYPES = gql`
  query GetProductTypes($query: ProductTypeQueryInput) {
    productTypes(query: $query) {
      items {
        id
        name
        description
        status
        attributes {
          name
          type
          required
          options
        }
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
  query GetProductType($id: String!) {
    productType(id: $id) {
      id
      name
      description
      status
      attributes {
        name
        type
        required
        options
      }
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
      status
      created
    }
  }
`;

export const UPDATE_PRODUCT_TYPE = gql`
  mutation UpdateProductType($id: String!, $input: ProductTypeUpdateInput!) {
    updateProductType(id: $id, input: $input) {
      id
      name
      status
      updated
    }
  }
`;

export const DELETE_PRODUCT_TYPE = gql`
  mutation DeleteProductType($id: String!) {
    deleteProductType(id: $id)
  }
`; 