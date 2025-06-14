'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Package, 
  FolderTree, 
  Star, 
  Tag, 
  ShoppingCart, 
  Users, 
  FileText,
  Clock,
  TrendingUp,
  X,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalSearch } from '@/hooks/use-global-search';

// 图标映射
const ICON_MAP = {
  Package,
  FolderTree,
  Star,
  Tag,
  ShoppingCart,
  Users,
  FileText,
};

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

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({ 
  placeholder = "搜索商品、订单、用户...", 
  className,
  onResultClick 
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    data: searchResults, 
    isLoading, 
    quickSearch 
  } = useGlobalSearch(debouncedQuery);

  // 处理点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理键盘导航
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      const results = getAllResults();
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex]);

  // 获取所有搜索结果（扁平化）
  const getAllResults = (): SearchResult[] => {
    if (!searchResults?.groups) return [];
    return searchResults.groups.flatMap(group => group.items);
  };

  // 处理搜索输入
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(0);
    
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    // 添加到最近搜索
    if (query.trim()) {
      const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    }

    // 清空搜索框
    setQuery('');
    setIsOpen(false);
    setIsFocused(false);
    
    // 调用回调
    onResultClick?.(result);
    
    // 导航到结果页面
    router.push(result.url);
  };

  // 处理清空搜索
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // 处理快捷键（Ctrl/Cmd + K）
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        setIsFocused(true);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 加载本地存储的最近搜索
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 渲染图标
  const renderIcon = (iconName?: string, className?: string) => {
    if (!iconName) return <Search className={className} />;
    
    const IconComponent = ICON_MAP[iconName as keyof typeof ICON_MAP];
    return IconComponent ? <IconComponent className={className} /> : <Search className={className} />;
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">搜索中...</span>
        </div>
      );
    }

    if (!searchResults || searchResults.total === 0) {
      if (debouncedQuery) {
        return (
          <div className="py-8 text-center text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>未找到 "{debouncedQuery}" 的相关结果</p>
            <p className="text-xs mt-2">试试其他关键词</p>
          </div>
        );
      }
      
      // 显示最近搜索
      if (recentSearches.length > 0) {
        return (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">最近搜索</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSearchChange(search)}
                >
                  {search}
                </Badge>
              ))}
            </div>
          </div>
        );
      }
      
      return (
        <div className="py-8 text-center text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>开始输入以搜索内容</p>
          <p className="text-xs mt-2">支持搜索商品、订单、用户等</p>
        </div>
      );
    }

    let currentIndex = 0;
    
    return (
      <ScrollArea className="max-h-96">
        <div className="p-2">
          {searchResults.groups.map((group, groupIndex) => (
            <div key={group.type} className={groupIndex > 0 ? 'mt-4' : ''}>
              {/* 分组标题 */}
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                {renderIcon(group.icon, "w-4 h-4 text-muted-foreground")}
                <span className="text-sm font-medium text-muted-foreground">
                  {group.title} ({group.total})
                </span>
              </div>
              
              {/* 搜索结果 */}
              <div className="space-y-1">
                {group.items.map((result, itemIndex) => {
                  const isSelected = currentIndex === selectedIndex;
                  currentIndex++;
                  
                  return (
                    <div
                      key={result.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-accent text-accent-foreground" 
                          : "hover:bg-accent/50"
                      )}
                      onClick={() => handleResultClick(result)}
                    >
                      {renderIcon(result.icon, "w-5 h-5 text-muted-foreground flex-shrink-0")}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        {result.description && (
                          <div className="text-sm text-muted-foreground truncate">
                            {result.description}
                          </div>
                        )}
                        {result.subtitle && (
                          <div className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      {result.score && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                          {Math.round(result.score * 100)}%
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {groupIndex < searchResults.groups.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          className="pl-10 pr-10 w-64 focus:w-80 transition-all duration-200"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        
        {/* 快捷键提示 */}
        {!isFocused && !query && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
            ⌘K
          </div>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border">
          <CardContent className="p-0">
            {renderSearchResults()}
            
            {/* 搜索提示 */}
            {searchResults && searchResults.total > 0 && (
              <div className="border-t p-3 bg-muted/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>找到 {searchResults.total} 个结果</span>
                  <span>用 ↑↓ 导航，回车选择</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 