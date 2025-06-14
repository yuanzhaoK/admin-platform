'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Package } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  price: number;
  market_price?: number;
  cost_price?: number;
  status: 'active' | 'inactive' | 'draft';
  sku?: string;
  stock: number;
  unit?: string;
  weight?: number;
  is_featured: boolean;
  is_new: boolean;
  is_hot: boolean;
  is_published: boolean;
  is_recommended: boolean;
}

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        // 模拟获取商品数据
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockProduct: Product = {
          id: productId,
          name: '苹果 iPhone 15 Pro',
          subtitle: '钛金属边框，A17 Pro芯片',
          description: '最新款苹果手机，采用钛金属边框，配备A17 Pro芯片，支持ProRAW和ProRes视频录制，拥有更长的电池续航和更快的充电速度。',
          price: 7999,
          market_price: 8999,
          cost_price: 6000,
          status: 'active',
          sku: 'IP15P-128GB-TI',
          stock: 100,
          unit: '台',
          weight: 187,
          is_featured: true,
          is_new: true,
          is_hot: true,
          is_published: true,
          is_recommended: true
        };

        setProduct(mockProduct);
      } catch (err) {
        setError('加载商品信息失败');
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      setSaving(true);
      setError(null);

      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saving product:', product);
      
      // 保存成功后返回详情页
      router.push(`/dashboard/products/management/${productId}`);
    } catch (err) {
      setError('保存失败，请重试');
      console.error('Failed to save product:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateProduct = (updates: Partial<Product>) => {
    if (product) {
      setProduct({ ...product, ...updates });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || '商品不存在'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error ? '请稍后重试' : '请检查商品ID是否正确'}
          </p>
          <Link href="/dashboard/products/management">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回商品列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/products/management/${productId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回详情
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">编辑商品</h1>
            <p className="text-gray-600">{product.name}</p>
          </div>
        </div>
        <Button 
          onClick={handleSubmit}
          disabled={saving}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? '保存中...' : '保存商品'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本信息 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">商品名称 *</Label>
                <Input
                  id="name"
                  value={product.name}
                  onChange={(e) => updateProduct({ name: e.target.value })}
                  placeholder="请输入商品名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">商品副标题</Label>
                <Input
                  id="subtitle"
                  value={product.subtitle || ''}
                  onChange={(e) => updateProduct({ subtitle: e.target.value })}
                  placeholder="请输入商品副标题"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">商品描述</Label>
                <Textarea
                  id="description"
                  value={product.description || ''}
                  onChange={(e) => updateProduct({ description: e.target.value })}
                  placeholder="请输入商品描述"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">商品SKU</Label>
                <Input
                  id="sku"
                  value={product.sku || ''}
                  onChange={(e) => updateProduct({ sku: e.target.value })}
                  placeholder="请输入商品SKU"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>价格设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">售价 *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => updateProduct({ price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market_price">市场价</Label>
                  <Input
                    id="market_price"
                    type="number"
                    step="0.01"
                    value={product.market_price || ''}
                    onChange={(e) => updateProduct({ market_price: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost_price">成本价</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={product.cost_price || ''}
                    onChange={(e) => updateProduct({ cost_price: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 库存和设置 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>库存信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">库存数量 *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={product.stock}
                    onChange={(e) => updateProduct({ stock: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">单位</Label>
                  <Input
                    id="unit"
                    value={product.unit || ''}
                    onChange={(e) => updateProduct({ unit: e.target.value })}
                    placeholder="件/台/个"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">重量 (克)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={product.weight || ''}
                    onChange={(e) => updateProduct({ weight: parseFloat(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>商品设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div className="flex items-center justify-between">
                 <div>
                   <Label>推荐商品</Label>
                   <p className="text-sm text-gray-600">在推荐位置显示此商品</p>
                 </div>
                <Switch
                  checked={product.is_featured}
                  onCheckedChange={(checked) => updateProduct({ is_featured: checked })}
                />
              </div>

                             <div className="flex items-center justify-between">
                 <div>
                   <Label>新品标记</Label>
                   <p className="text-sm text-gray-600">显示新品标签</p>
                 </div>
                 <Switch
                   checked={product.is_new}
                   onCheckedChange={(checked) => updateProduct({ is_new: checked })}
                 />
               </div>

               <div className="flex items-center justify-between">
                 <div>
                   <Label>热销标记</Label>
                   <p className="text-sm text-gray-600">显示热销标签</p>
                 </div>
                 <Switch
                   checked={product.is_hot}
                   onCheckedChange={(checked) => updateProduct({ is_hot: checked })}
                 />
               </div>

               <div className="flex items-center justify-between">
                 <div>
                   <Label>发布状态</Label>
                   <p className="text-sm text-gray-600">是否在前台显示</p>
                 </div>
                 <Switch
                   checked={product.is_published}
                   onCheckedChange={(checked) => updateProduct({ is_published: checked })}
                 />
               </div>

               <div className="flex items-center justify-between">
                 <div>
                   <Label>推荐标记</Label>
                   <p className="text-sm text-gray-600">在推荐商品中显示</p>
                 </div>
                 <Switch
                   checked={product.is_recommended}
                   onCheckedChange={(checked) => updateProduct({ is_recommended: checked })}
                 />
               </div>
            </CardContent>
          </Card>

          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-red-600 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  );
} 