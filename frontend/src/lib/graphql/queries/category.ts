import { gql } from "@apollo/client";

// 分类管理查询
export const GET_PRODUCT_CATEGORIES = gql`
  query GetProductCategories($query: CategoryQueryInput) {
    categories(query: $query) {
      items {
        id
        name
        description
        parent_id
        sort_order
        is_active
        image
        slug
        meta_title
        meta_description
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
  query GetProductCategory($id: ID!) {
    category(id: $id) {
      id
      name
      description
      parent_id
      sort_order
      is_active
      image
      slug
      meta_title
      meta_description
      parent {
        id
        name
      }
      children {
        id
        name
        is_active
      }
      created
      updated
    }
  }
`;

export const GET_PRODUCT_CATEGORY_TREE = gql`
  query GetProductCategoryTree {
    categoryTree {
      category {
        id
        name
        description
        sort_order
        is_active
        image
        slug
        parent_id
        created
        updated
      }
      children {
        category {
          id
          name
          description
          sort_order
          is_active
          image
          slug
          parent_id
          created
          updated
        }
      }
    }
  }
`;

// 分类管理变更
export const CREATE_PRODUCT_CATEGORY = gql`
  mutation CreateProductCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      is_active
      created
    }
  }
`;

export const UPDATE_PRODUCT_CATEGORY = gql`
  mutation UpdateProductCategory($id: ID!, $input: CategoryUpdateInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      is_active
      updated
    }
  }
`;

export const DELETE_PRODUCT_CATEGORY = gql`
  mutation DeleteProductCategory($id: ID!) {
    deleteCategory(id: $id) {
      success
      message
    }
  }
`;
