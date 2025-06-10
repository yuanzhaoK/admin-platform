'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product } from '@/lib/pocketbase';
import { Package, Calendar, Hash, Warehouse, Tag, FileText } from 'lucide-react';

interface ProductViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductViewModal({ product, open, onOpenChange }: ProductViewModalProps) {
  if (!product) return null;

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return `¥${price.toFixed(2)}`;
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: React.ReactNode }) => (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <Icon className="h-5 w-5 text-slate-500 dark:text-slate-400 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</p>
        <div className="text-sm text-slate-900 dark:text-slate-100 mt-1">
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>产品详情</span>
          </DialogTitle>
          <DialogDescription>
            查看产品的详细信息
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
              基本信息
            </h3>
            
            <div className="grid gap-4">
              <DetailItem
                icon={Package}
                label="产品名称"
                value={product.name}
              />
              
              <DetailItem
                icon={FileText}
                label="产品描述"
                value={product.description || <span className="text-slate-400">暂无描述</span>}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={Tag}
                  label="价格"
                  value={<span className="font-semibold text-lg">{formatPrice(product.price)}</span>}
                />
                
                <DetailItem
                  icon={Warehouse}
                  label="库存数量"
                  value={
                    <span className={`font-semibold ${
                      product.stock === 0 
                        ? 'text-red-600 dark:text-red-400' 
                        : (product.stock || 0) < 10 
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-green-600 dark:text-green-400'
                    }`}>
                      {product.stock ?? '-'}
                    </span>
                  }
                />
              </div>
            </div>
          </div>

          {/* 分类和状态 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
              分类和状态
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                icon={Tag}
                label="产品分类"
                value={product.category || <span className="text-slate-400">暂未分类</span>}
              />
              
              <DetailItem
                icon={Package}
                label="产品状态"
                value={formatStatus(product.status)}
              />
            </div>
          </div>

          {/* SKU和ID */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
              标识信息
            </h3>
            
            <div className="grid gap-4">
              <DetailItem
                icon={Hash}
                label="SKU"
                value={product.sku || <span className="text-slate-400">暂无SKU</span>}
              />
              
              <DetailItem
                icon={Hash}
                label="产品ID"
                value={<code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{product.id}</code>}
              />
            </div>
          </div>

          {/* 时间信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
              时间信息
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem
                icon={Calendar}
                label="创建时间"
                value={formatDate(product.created)}
              />
              
              <DetailItem
                icon={Calendar}
                label="更新时间"
                value={formatDate(product.updated)}
              />
            </div>
          </div>

          {/* 标签 */}
          {product.tags && product.tags.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                标签
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 