'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/lib/pocketbase';
import { graphqlProductService } from '@/lib/graphql/product';
import { 
  Trash2, 
  Download, 
  RefreshCw, 
  Play, 
  Pause, 
  FileText, 
  FileX 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductBatchActionsProps {
  selectedProducts: string[];
  products: Product[];
  onClearSelection: () => void;
  onRefresh: () => void;
  disabled?: boolean;
}

export function ProductBatchActions({
  selectedProducts,
  products,
  onClearSelection,
  onRefresh,
  disabled = false,
}: ProductBatchActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const selectedCount = selectedProducts.length;
  const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

  const handleBatchStatusUpdate = async (status: Product['status']) => {
    if (selectedProducts.length === 0) return;

    setIsLoading(true);
    try {
      const result = await graphqlProductService.batchUpdateProductStatus(selectedProducts, status);
      if (result.success && result.data?.success) {
        onClearSelection();
        onRefresh();
      } else {
        alert(result.error || result.data?.message || '批量更新失败');
      }
    } catch (error) {
      console.error('批量更新失败:', error);
      alert('批量更新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedProducts.length === 0) return;

    setIsLoading(true);
    try {
      const result = await graphqlProductService.batchDeleteProducts(selectedProducts);
      if (result.success && result.data?.success) {
        onClearSelection();
        onRefresh();
        setShowDeleteDialog(false);
      } else {
        alert(result.error || result.data?.message || '批量删除失败');
      }
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('批量删除失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'JSON' | 'CSV') => {
    setIsLoading(true);
    try {
      const result = await graphqlProductService.exportProducts(format);
      if (result.success && result.data?.success && result.data.downloadUrl) {
        // 创建下载链接
        const a = document.createElement('a');
        a.href = result.data.downloadUrl;
        a.download = result.data.filename || `products.${format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        alert(result.error || result.data?.message || '导出失败');
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedCount === 0) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            选择产品以执行批量操作
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('JSON')}>
                <FileText className="mr-2 h-4 w-4" />
                导出为 JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('CSV')}>
                <FileX className="mr-2 h-4 w-4" />
                导出为 CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={disabled || isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            已选择 {selectedCount} 个产品
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={disabled || isLoading}
            className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            取消选择
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* 状态更新 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled || isLoading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                更新状态
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => handleBatchStatusUpdate('active')}
                className="text-green-600 dark:text-green-400"
              >
                <Play className="mr-2 h-4 w-4" />
                设为活跃
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleBatchStatusUpdate('inactive')}
                className="text-red-600 dark:text-red-400"
              >
                <Pause className="mr-2 h-4 w-4" />
                设为停用
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleBatchStatusUpdate('draft')}
                className="text-yellow-600 dark:text-yellow-400"
              >
                <FileText className="mr-2 h-4 w-4" />
                设为草稿
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 导出选中的产品 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled || isLoading}>
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('JSON')}>
                <FileText className="mr-2 h-4 w-4" />
                导出为 JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('CSV')}>
                <FileX className="mr-2 h-4 w-4" />
                导出为 CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenuSeparator />

          {/* 批量删除 */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={disabled || isLoading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除选中
          </Button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>您确定要删除选中的 {selectedCount} 个产品吗？</p>
              <div className="text-sm bg-slate-100 dark:bg-slate-800 p-3 rounded">
                <p className="font-medium mb-1">即将删除的产品：</p>
                <ul className="space-y-1">
                  {selectedProductsData.slice(0, 5).map(product => (
                    <li key={product.id} className="text-slate-600 dark:text-slate-400">
                      • {product.name}
                    </li>
                  ))}
                  {selectedProductsData.length > 5 && (
                    <li className="text-slate-500 dark:text-slate-500">
                      ... 以及其他 {selectedProductsData.length - 5} 个产品
                    </li>
                  )}
                </ul>
              </div>
              <p className="text-red-600 dark:text-red-400 font-medium">
                此操作无法撤销！
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBatchDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {isLoading ? '删除中...' : '确认删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 