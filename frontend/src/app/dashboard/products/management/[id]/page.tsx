'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Package, DollarSign, BarChart3, Eye, Settings } from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  subtitle?: string;
  description?: string;
  price: number;
  market_price?: number;
  cost_price?: number;
  category_id?: string;
  brand_id?: string;
  product_type_id?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  sku?: string;
  stock: number;
  unit?: string;
  weight?: number;
  images?: string[];
  meta_data?: Record<string, unknown>;
  sort_order?: number;
  is_featured: boolean;
  is_new: boolean;
  is_hot: boolean;
  points?: number;
  growth_value?: number;
  points_purchase_limit?: number;
  preview_enabled: boolean;
  is_published: boolean;
  is_recommended: boolean;
  service_guarantee?: string[];
  sales_count: number;
  view_count: number;
  review_status: 'pending' | 'approved' | 'rejected';
  attributes?: Record<string, unknown>;
  created: string;
  updated: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productId = params.id as string;

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);

        // 这里应该调用真实的API获取商品详情
        // 现在先使用模拟数据
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟

        const mockProduct: Product = {
          id: productId,
          name: '苹果 iPhone 15 Pro',
          subtitle: '钛金属边框，A17 Pro芯片',
          description: '最新款苹果手机，采用钛金属边框，配备A17 Pro芯片，支持ProRAW和ProRes视频录制，拥有更长的电池续航和更快的充电速度。',
          price: 7999,
          market_price: 8999,
          cost_price: 6000,
          category_id: 'cat_001',
          brand_id: 'brand_001',
          product_type_id: 'type_001',
          status: 'active',
          tags: ['手机', '苹果', 'iPhone', '5G'],
          sku: 'IP15P-128GB-TI',
          stock: 100,
          unit: '台',
          weight: 187,
          images: [
            '/api/placeholder/400/400',
            '/api/placeholder/400/400',
            '/api/placeholder/400/400'
          ],
          meta_data: {
            color: 'Titanium Blue',
            storage: '128GB',
            warranty: '1年'
          },
          sort_order: 1,
          is_featured: true,
          is_new: true,
          is_hot: true,
          points: 799,
          growth_value: 100,
          points_purchase_limit: 1,
          preview_enabled: true,
          is_published: true,
          is_recommended: true,
          service_guarantee: ['7天无理由退货', '正品保证', '全国联保'],
          sales_count: 1250,
          view_count: 8500,
          review_status: 'approved',
          attributes: {
            '屏幕尺寸': '6.1英寸',
            '存储容量': '128GB',
            '颜色': '钛蓝色',
            '网络': '5G'
          },
          created: '2024-01-15T10:00:00Z',
          updated: '2024-01-20T15:30:00Z'
        };

        setProduct(mockProduct);
      } catch (err) {
        setError('加载商品详情失败');
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '已发布';
      case 'inactive':
        return '已下架';
      case 'draft':
        return '草稿';
      default:
        return status;
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600">{product.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(product.status)}>
            {getStatusText(product.status)}
          </Badge>
          <Link href={`/dashboard/products/management/${productId}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              编辑商品
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 商品图片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                商品图片
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images?.map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.name} - 图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 商品描述 */}
          <Card>
            <CardHeader>
              <CardTitle>商品描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {product.description || '暂无描述'}
              </p>
            </CardContent>
          </Card>

          {/* 商品属性 */}
          {product.attributes && (
            <Card>
              <CardHeader>
                <CardTitle>商品规格</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-600">{key}</span>
                      <span className="text-gray-900">{value as string}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 侧边栏信息 */}
        <div className="space-y-6">
          {/* 价格信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                价格信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">售价</span>
                <span className="text-xl font-bold text-red-600">¥{product.price}</span>
              </div>
              {product.market_price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">市场价</span>
                  <span className="text-gray-500 line-through">¥{product.market_price}</span>
                </div>
              )}
              {product.cost_price && (
                <div className="flex justify-between">
                  <span className="text-gray-600">成本价</span>
                  <span className="text-gray-900">¥{product.cost_price}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 库存信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                库存信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">当前库存</span>
                <span className="font-semibold">{product.stock} {product.unit || '件'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SKU</span>
                <span className="font-mono text-sm">{product.sku || '无'}</span>
              </div>
              {product.weight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">重量</span>
                  <span>{product.weight}g</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                销售统计
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">浏览次数</span>
                <span className="font-semibold">{product.view_count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">销售数量</span>
                <span className="font-semibold">{product.sales_count.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* 设置信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                商品设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">推荐商品</span>
                <Badge variant={product.is_featured ? "default" : "secondary"}>
                  {product.is_featured ? '是' : '否'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">新品标记</span>
                <Badge variant={product.is_new ? "default" : "secondary"}>
                  {product.is_new ? '是' : '否'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">热销标记</span>
                <Badge variant={product.is_hot ? "default" : "secondary"}>
                  {product.is_hot ? '是' : '否'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">发布状态</span>
                <Badge variant={product.is_published ? "default" : "secondary"}>
                  {product.is_published ? '已发布' : '未发布'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 服务保障 */}
          {product.service_guarantee && product.service_guarantee.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>服务保障</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.service_guarantee.map((service, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{service}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 页面底部信息 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="block font-medium">商品ID</span>
              <span className="font-mono">{product.id}</span>
            </div>
            <div>
              <span className="block font-medium">创建时间</span>
              <span>{new Date(product.created).toLocaleString()}</span>
            </div>
            <div>
              <span className="block font-medium">更新时间</span>
              <span>{new Date(product.updated).toLocaleString()}</span>
            </div>
            <div>
              <span className="block font-medium">审核状态</span>
              <span className="capitalize">{product.review_status}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 