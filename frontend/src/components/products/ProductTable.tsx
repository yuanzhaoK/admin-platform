'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/lib/pocketbase';
import { Edit, Trash2, MoreHorizontal, Eye, Package, Image as ImageIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  selectedProducts: string[];
  onProductSelect: (productId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onProductEdit: (product: Product) => void;
  onProductView: (product: Product) => void;
  onProductDelete: (product: Product) => void;
  onStatusToggle: (product: Product) => void;
}

export function ProductTable({
  products,
  loading = false,
  selectedProducts,
  onProductSelect,
  onSelectAll,
  onProductEdit,
  onProductView,
  onProductDelete,
  onStatusToggle,
}: ProductTableProps) {
  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0 && selectedProducts.length < products.length;

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return `¥${(price || 0).toFixed(2)}`;
  };

  const formatStatus = (status: Product['status']) => {
    const statusConfig = {
      active: { label: '活跃', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      inactive: { label: '停用', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
      draft: { label: '草稿', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant="secondary" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSelectAll = () => {
    onSelectAll(!allSelected);
  };

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox disabled />
              </TableHead>
              <TableHead>产品信息</TableHead>
              <TableHead>价格</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>库存</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="w-20">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Checkbox disabled />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-12"></div>
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-12"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-8"></div>
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-16"></div>
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-8"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 dark:border-slate-700">
        <div className="flex flex-col items-center justify-center py-16">
          <Package className="h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            暂无产品
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-center">
            没有找到符合条件的产品，请尝试调整搜索条件或添加新产品。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>产品信息</TableHead>
            <TableHead>价格</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>库存</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead className="w-20">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={() => onProductSelect(product.id)}
                />
              </TableCell>
              
              <TableCell className="max-w-0">
                <div className="flex items-start space-x-3">
                  {/* 产品图片 */}
                  <div className="flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* 产品信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {product.name}
                      </p>
                      {product.sku && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          #{product.sku}
                        </span>
                      )}
                    </div>
                    {product.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {product.description}
                      </p>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex space-x-1 mt-1">
                        {product.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900 dark:text-blue-300"
                          >
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 2 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            +{product.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              
              <TableCell>
                <span className="font-medium">
                  {formatPrice(product.price)}
                </span>
              </TableCell>
              
              <TableCell>
                {product.category ? (
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {product.category}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </TableCell>
              
              <TableCell>
                {formatStatus(product.status)}
              </TableCell>
              
              <TableCell>
                {product.stock !== undefined ? (
                  <span className={`text-sm ${
                    product.stock === 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : product.stock < 10 
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {product.stock}
                  </span>
                ) : (
                  <span className="text-sm text-slate-400">-</span>
                )}
              </TableCell>
              
              <TableCell>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(product.created)}
                </span>
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onProductView(product)}>
                      <Eye className="mr-2 h-4 w-4" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onProductEdit(product)}>
                      <Edit className="mr-2 h-4 w-4" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusToggle(product)}
                      className="text-blue-600 dark:text-blue-400"
                    >
                      <Package className="mr-2 h-4 w-4" />
                      {product.status === 'active' ? '停用' : '启用'}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onProductDelete(product)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 