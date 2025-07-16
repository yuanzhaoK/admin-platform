import { gql } from "@apollo/client";

// 广告列表查询
export const GET_ADVERTISEMENTS = gql`
  query GetAdvertisements($input: AdvertisementQueryInput) {
    advertisements(input: $input) {
      items {
        id
        title
        description
        type
        position
        image_url
        link_type
        link_url
        link_product_id
        link_category_id
        target_type
        content
        status
        start_time
        end_time
        weight
        click_count
        view_count
        budget
        cost
        tags
        created
        updated
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

// 单个广告查询
export const GET_ADVERTISEMENT = gql`
  query GetAdvertisement($id: String!) {
    advertisement(id: $id) {
      id
      title
      description
      type
      position
      image_url
      link_type
      link_url
      link_product_id
      link_category_id
      target_type
      content
      status
      start_time
      end_time
      weight
      click_count
      view_count
      budget
      cost
      tags
      created
      updated
    }
  }
`;

// 广告组列表查询
export const GET_AD_GROUPS = gql`
  query GetAdGroups($input: AdvertisementQueryInput) {
    adGroups(input: $input) {
      items {
        id
        name
        description
        position
        ads {
          id
          name
          type
          status
        }
        display_count
        rotation_type
        is_active
        created
        updated
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

// 广告统计数据查询
export const GET_AD_STATS = gql`
  query GetAdStats($input: AdStatsQueryInput) {
    adStats(input: $input) {
      items {
        id
        ad_id
        date
        view_count
        click_count
        ctr
        cost
        conversion_count
        conversion_rate
      }
      pagination {
        page
        perPage
        totalItems
        totalPages
      }
    }
  }
`;

// 广告概览统计
export const GET_AD_OVERVIEW_STATS = gql`
  query GetAdOverviewStats {
    adOverviewStats {
      totalAds
      activeAds
      totalViews
      totalClicks
      totalCost
      avgCtr
      topPerforming {
        id
        name
        type
        click_count
        view_count
        cost
      }
      positionStats
      typeStats
      dailyStats
    }
  }
`;

// 广告预览
export const PREVIEW_AD = gql`
  query PreviewAd($input: AdvertisementInput!) {
    previewAd(input: $input) {
      id
      name
      description
      type
      position
      image
      link_type
      link_url
      content
      status
      start_time
      end_time
      weight
    }
  }
`;

// 创建广告
export const CREATE_ADVERTISEMENT = gql`
  mutation CreateAdvertisement($input: AdvertisementInput!) {
    createAdvertisement(input: $input) {
      id
      name
      description
      type
      position
      image
      link_type
      link_url
      link_product_id
      link_category_id
      target_type
      content
      status
      start_time
      end_time
      weight
      click_count
      view_count
      budget
      cost
      tags
      created
      updated
    }
  }
`;

// 更新广告
export const UPDATE_ADVERTISEMENT = gql`
  mutation UpdateAdvertisement($id: String!, $input: AdvertisementUpdateInput!) {
    updateAdvertisement(id: $id, input: $input) {
      id
      name
      description
      type
      position
      image
      link_type
      link_url
      link_product_id
      link_category_id
      target_type
      content
      status
      start_time
      end_time
      weight
      click_count
      view_count
      budget
      cost
      tags
      created
      updated
    }
  }
`;

// 删除广告
export const DELETE_ADVERTISEMENT = gql`
  mutation DeleteAdvertisement($id: String!) {
    deleteAdvertisement(id: $id)
  }
`;

// 批量删除广告
export const BATCH_DELETE_ADVERTISEMENTS = gql`
  mutation BatchDeleteAdvertisements($ids: [String!]!) {
    batchDeleteAdvertisements(ids: $ids) {
      success
      failed
      total
      message
    }
  }
`;

// 复制广告
export const DUPLICATE_ADVERTISEMENT = gql`
  mutation DuplicateAdvertisement($id: String!) {
    duplicateAdvertisement(id: $id) {
      id
      name
      description
      type
      position
      image
      link_type
      link_url
      content
      status
      start_time
      end_time
      weight
      budget
      cost
      created
      updated
    }
  }
`;

// 暂停广告
export const PAUSE_ADVERTISEMENT = gql`
  mutation PauseAdvertisement($id: String!) {
    pauseAdvertisement(id: $id) {
      id
      name
      status
      updated
    }
  }
`;

// 恢复广告
export const RESUME_ADVERTISEMENT = gql`
  mutation ResumeAdvertisement($id: String!) {
    resumeAdvertisement(id: $id) {
      id
      name
      status
      updated
    }
  }
`;

// 创建广告组
export const CREATE_AD_GROUP = gql`
  mutation CreateAdGroup($input: AdGroupInput!) {
    createAdGroup(input: $input) {
      id
      name
      description
      position
      ads {
        id
        name
        type
        status
      }
      display_count
      rotation_type
      is_active
      created
      updated
    }
  }
`;

// 更新广告组
export const UPDATE_AD_GROUP = gql`
  mutation UpdateAdGroup($id: String!, $input: AdGroupUpdateInput!) {
    updateAdGroup(id: $id, input: $input) {
      id
      name
      description
      position
      ads {
        id
        name
        type
        status
      }
      display_count
      rotation_type
      is_active
      created
      updated
    }
  }
`;

// 删除广告组
export const DELETE_AD_GROUP = gql`
  mutation DeleteAdGroup($id: String!) {
    deleteAdGroup(id: $id)
  }
`;
