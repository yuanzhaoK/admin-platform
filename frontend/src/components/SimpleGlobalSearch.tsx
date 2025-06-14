'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Package, FolderTree, Star, Tag, ShoppingCart, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
}

interface SimpleGlobalSearchProps {
  placeholder?: string;
  className?: string;
}

// 模拟搜索数据
const mockSearchData = [
  { id: '1', type: 'PRODUCT', title: '商品管理', description: '管理商品信息、分类和库存', url: '/dashboard/products/management', icon: 'Package' },
  { id: '2', type: 'CATEGORY', title: '商品分类', description: '管理商品分类树形结构', url: '/dashboard/products/categories', icon: 'FolderTree' },
  { id: '3', type: 'BRAND', title: '品牌管理', description: '管理商品品牌信息', url: '/dashboard/products/brands', icon: 'Star' },
  { id: '4', type: 'PRODUCT_TYPE', title: '商品类型', description: '管理商品类型和属性模板', url: '/dashboard/products/types', icon: 'Tag' },
  { id: '5', type: 'ORDER', title: '订单管理', description: '查看和管理订单信息', url: '/dashboard/orders/list', icon: 'ShoppingCart' },
  { id: '6', type: 'USER', title: '用户管理', description: '管理系统用户和权限', url: '/dashboard/users', icon: 'Users' },
  { id: '7', type: 'PAGE', title: '系统设置', description: '系统配置和参数设置', url: '/dashboard/settings', icon: 'FileText' },
  { id: '8', type: 'PAGE', title: '仪表板', description: '系统概览和统计信息', url: '/dashboard', icon: 'FileText' },
];

const iconComponents = {
  Package,
  FolderTree,
  Star,
  Tag,
  ShoppingCart,
  Users,
  FileText,
};

export function SimpleGlobalSearch({ placeholder = "搜索...", className }: SimpleGlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 模拟搜索
  useEffect(() => {
    if (query.trim()) {
      const filtered = mockSearchData.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
      );
      setResults(filtered);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query]);

  // 处理点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 处理键盘导航
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

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
          inputRef.current?.blur();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results]);

  // 处理全局快捷键 (Ctrl/Cmd + K)
  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 处理搜索输入
  const handleSearchChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  // 处理结果点击
  const handleResultClick = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    router.push(result.url);
  };

  // 处理清空搜索
  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // 渲染图标
  const renderIcon = (iconName?: string) => {
    if (!iconName) return <Search className="w-4 h-4" />;
    const IconComponent = iconComponents[iconName as keyof typeof iconComponents];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Search className="w-4 h-4" />;
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsOpen(query.length > 0)}
          className="pl-10 pr-10 py-2 w-64 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:w-80 transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            title="清空搜索"
            aria-label="清空搜索"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        
        {/* 快捷键提示 */}
        {!query && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
            ⌘K
          </div>
        )}
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                    index === selectedIndex 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-700"
                  )}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="text-slate-400">
                    {renderIcon(result.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    {result.description && (
                      <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {result.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : query.length > 0 ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>未找到相关结果</p>
            </div>
          ) : null}
          
          {/* 搜索提示 */}
          {results.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-600 p-3 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>找到 {results.length} 个结果</span>
                <span>用 ↑↓ 导航，回车选择</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 