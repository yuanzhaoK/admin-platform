import { gql } from '@apollo/client';

// 分类管理查询
export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories($query: ProductCategoryQueryInput) {
    productCategories(query: $query) {
      items {
        id
        name
        description
        parent_id
        sort_order
        status
        image
        icon
        seo_title
        seo_description
        parent {
          id
          name
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

export const GET_PRODUCT_CATEGORY = gql`
  query GetProductCategory($id: String!) {
    productCategory(id: $id) {
      id
      name
      description
      parent_id
      sort_order
      status
      image
      icon
      seo_title
      seo_description
      parent {
        id
        name
      }
      children {
        id
        name
        status
      }
      created
      updated
    }
  }
`;

export const GET_PRODUCT_CATEGORY_TREE = gql`
  query GetProductCategoryTree {
    productCategoryTree {
      id
      name
      description
      sort_order
      status
      image
      icon
      parent_id
      created
      updated
    }
  }
`;

// 分类管理变更
export const CREATE_PRODUCT_CATEGORY = gql`
  mutation CreateProductCategory($input: ProductCategoryInput!) {
    createProductCategory(input: $input) {
      id
      name
      status
      created
    }
  }
`;

export const UPDATE_PRODUCT_CATEGORY = gql`
  mutation UpdateProductCategory($id: String!, $input: ProductCategoryUpdateInput!) {
    updateProductCategory(id: $id, input: $input) {
      id
      name
      status
      updated
    }
  }
`;

export const DELETE_PRODUCT_CATEGORY = gql`
  mutation DeleteProductCategory($id: String!) {
    deleteProductCategory(id: $id)
  }
`; 