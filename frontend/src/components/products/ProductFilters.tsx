'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { ProductQuery } from '@/lib/pocketbase';

interface ProductFiltersProps {
  query: ProductQuery;
  onQueryChange: (query: ProductQuery) => void;
  categories: string[];
  loading?: boolean;
}

export function ProductFilters({ 
  query, 
  onQueryChange, 
  categories, 
  loading = false 
}: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(query.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange({ ...query, search: searchInput, page: 1 });
  };

  const handleFilterChange = (key: keyof ProductQuery, value: string | undefined) => {
    onQueryChange({ ...query, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput('');
    onQueryChange({ page: 1, perPage: query.perPage });
  };

  const hasActiveFilters = query.status || query.category || query.search;

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="搜索产品名称、描述或SKU..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button type="submit" disabled={loading}>
          搜索
        </Button>
      </form>

      {/* 过滤器 */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-400">过滤:</span>
        </div>

        {/* 状态过滤 */}
        <Select
          value={query.status || 'all'}
          onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
          disabled={loading}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="active">活跃</SelectItem>
            <SelectItem value="inactive">停用</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
          </SelectContent>
        </Select>

        {/* 分类过滤 */}
        <Select
          value={query.category || 'all'}
          onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
          disabled={loading}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 排序 */}
        <Select
          value={query.sortBy || 'created'}
          onValueChange={(value) => handleFilterChange('sortBy', value as ProductQuery['sortBy'])}
          disabled={loading}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="排序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">创建时间</SelectItem>
            <SelectItem value="updated">更新时间</SelectItem>
            <SelectItem value="name">名称</SelectItem>
            <SelectItem value="price">价格</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={query.sortOrder || 'desc'}
          onValueChange={(value) => handleFilterChange('sortOrder', value as ProductQuery['sortOrder'])}
          disabled={loading}
        >
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">降序</SelectItem>
            <SelectItem value="asc">升序</SelectItem>
          </SelectContent>
        </Select>

        {/* 清除过滤器 */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            disabled={loading}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4 mr-1" />
            清除
          </Button>
        )}
      </div>

      {/* 活跃过滤器显示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {query.search && (
            <Badge variant="secondary" className="gap-1">
              搜索: {query.search}
              <button
                onClick={() => {
                  setSearchInput('');
                  handleFilterChange('search', undefined);
                }}
                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {query.status && (
            <Badge variant="secondary" className="gap-1">
              状态: {query.status === 'active' ? '活跃' : query.status === 'inactive' ? '停用' : '草稿'}
              <button
                onClick={() => handleFilterChange('status', undefined)}
                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {query.category && (
            <Badge variant="secondary" className="gap-1">
              分类: {query.category}
              <button
                onClick={() => handleFilterChange('category', undefined)}
                className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
} 