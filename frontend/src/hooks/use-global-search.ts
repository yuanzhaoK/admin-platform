import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL查询定义
const GLOBAL_SEARCH_QUERY = gql`
  query GlobalSearch($query: String!, $limit: Int, $types: [SearchResultType!]) {
    globalSearch(query: $query, limit: $limit, types: $types) {
      query
      total
      executionTime
      groups {
        type
        title
        icon
        total
        items {
          id
          type
          title
          description
          subtitle
          url
          icon
          score
          metadata
        }
      }
      suggestions
    }
  }
`;



interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  subtitle?: string;
  url: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  score?: number;
}

interface SearchGroup {
  type: string;
  title: string;
  icon: string;
  items: SearchResult[];
  total: number;
}

interface GlobalSearchData {
  query: string;
  total: number;
  groups: SearchGroup[];
  suggestions: string[];
  executionTime: number;
}

export function useGlobalSearch(query: string, limit: number = 20) {
  const [isEnabled, setIsEnabled] = useState(false);

  // 启用搜索（只有当查询不为空时）
  useEffect(() => {
    setIsEnabled(query.trim().length > 0);
  }, [query]);

  const { 
    data, 
    loading: isLoading, 
    error,
    refetch 
  } = useQuery<{ globalSearch: GlobalSearchData }>(GLOBAL_SEARCH_QUERY, {
    variables: { query, limit },
    skip: !isEnabled,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all'
  });

  return {
    data: data?.globalSearch,
    isLoading: isEnabled && isLoading,
    error,
    refetch,
    quickSearch: data?.globalSearch?.groups?.flatMap(group => group.items)?.slice(0, 5) || [],
    quickSearchLoading: isEnabled && isLoading,
    refetchQuickSearch: refetch
  };
}

export function useSearchSuggestions(query: string, limit: number = 10) {
  // 使用静态建议，避免额外的GraphQL查询
  const commonSuggestions = [
    '商品管理',
    '商品分类', 
    '品牌管理',
    '商品类型',
    '订单管理',
    '用户管理',
    '系统设置',
    '仪表板'
  ];

  const queryLower = query.toLowerCase();
  const filteredSuggestions = commonSuggestions
    .filter(suggestion => suggestion.toLowerCase().includes(queryLower))
    .slice(0, limit);

  return {
    suggestions: filteredSuggestions.map(text => ({ text, type: 'PAGE', count: 1 })),
    loading: false,
    error: null
  };
} 