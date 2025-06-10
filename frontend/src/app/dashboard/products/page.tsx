'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiHelpers, Product, ProductQuery, ProductStats } from '@/lib/pocketbase';
import { Plus, Package, TrendingUp, ShoppingCart, AlertCircle } from 'lucide-react';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductBatchActions } from '@/components/products/ProductBatchActions';
import { ProductEditModal } from '@/components/products/ProductEditModal';
import { ProductViewModal } from '@/components/products/ProductViewModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<ProductQuery>({
    page: 1,
    perPage: 20,
    sortBy: 'created',
    sortOrder: 'desc',
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 20,
    totalPages: 1,
    totalItems: 0,
  });
  
  // 模态框状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 获取产品列表
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiHelpers.getProducts(query);
      if (result.success && result.data) {
        setProducts(result.data);
        if (result.pagination) {
          setPagination(result.pagination);
        }
      } else {
        console.error('获取产品失败:', result.error);
      }
    } catch (error) {
      console.error('获取产品失败:', error);
    } finally {
      setLoading(false);
    }
  }, [query]);

  // 获取产品统计
  const fetchStats = useCallback(async () => {
    try {
      const result = await apiHelpers.getProductStats();
      if (result.success && result.data) {
        setStats(result.data);
        // 提取分类列表
        const categoryList = Object.keys(result.data.categories);
        setCategories(categoryList);
      }
    } catch (error) {
      console.error('获取统计数据失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, [fetchProducts, fetchStats]);

  // 查询变更处理
  const handleQueryChange = (newQuery: ProductQuery) => {
    setQuery(newQuery);
    // 清除选择
    setSelectedProducts([]);
  };

  // 产品选择处理
  const handleProductSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  // 产品操作处理
  const handleProductEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleProductView = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchProducts();
    fetchStats();
    setSelectedProduct(null);
  };

  const handleProductDelete = async (product: Product) => {
    if (!confirm(`确定要删除产品"${product.name}"吗？`)) return;
    
    try {
      const result = await apiHelpers.deleteProduct(product.id);
      if (result.success) {
        await fetchProducts();
        await fetchStats();
        // 如果删除的产品在选择列表中，移除它
        setSelectedProducts(prev => prev.filter(id => id !== product.id));
      } else {
        alert('删除失败: ' + result.error);
      }
    } catch (error) {
      console.error('删除产品失败:', error);
      alert('删除失败');
    }
  };

  const handleStatusToggle = async (product: Product) => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      const result = await apiHelpers.updateProduct(product.id, { status: newStatus });
      if (result.success) {
        await fetchProducts();
        await fetchStats();
      } else {
        alert('更新状态失败: ' + result.error);
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      alert('更新状态失败');
    }
  };

  const handleRefresh = () => {
    fetchProducts();
    fetchStats();
  };

  const handleAddProduct = () => {
    // 跳转到产品创建页面
    window.location.href = '/dashboard/products/create';
  };

  // 统计卡片数据
  const statsCards = [
    {
      title: '总产品数',
      value: stats?.total || 0,
      icon: Package,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: '活跃产品',
      value: stats?.active || 0,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: '停用产品',
      value: stats?.inactive || 0,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
    {
      title: '草稿产品',
      value: stats?.draft || 0,
      icon: ShoppingCart,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">产品管理</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">管理系统中的所有产品配置</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardHeader>
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-6 w-3/4 rounded"></div>
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-4 w-1/2 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-4 w-full rounded mb-2"></div>
                <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-4 w-2/3 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            产品管理
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            管理系统中的所有产品配置和库存
          </p>
        </div>
        <Button 
          onClick={handleAddProduct}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          添加产品
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {card.value.toLocaleString()}
              </div>
              {stats?.avgPrice && card.title === '总产品数' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  平均价格: ¥{stats.avgPrice.toFixed(2)}
                </p>
              )}
              {stats?.totalStock && card.title === '活跃产品' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  总库存: {stats.totalStock}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">搜索和过滤</CardTitle>
          <CardDescription>
            使用下方工具搜索和筛选产品
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductFilters
            query={query}
            onQueryChange={handleQueryChange}
            categories={categories}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Batch Actions */}
      <ProductBatchActions
        selectedProducts={selectedProducts}
        products={products}
        onClearSelection={handleClearSelection}
        onRefresh={handleRefresh}
        disabled={loading}
      />

      {/* Products Table */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">
                产品列表
              </CardTitle>
              <CardDescription>
                {loading ? '加载中...' : `共 ${pagination.totalItems} 个产品，第 ${pagination.page} 页`}
              </CardDescription>
            </div>
            {pagination.totalItems > 0 && (
              <div className="text-sm text-slate-500 dark:text-slate-400">
                显示第 {((pagination.page - 1) * pagination.perPage) + 1} - {Math.min(pagination.page * pagination.perPage, pagination.totalItems)} 项
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ProductTable
            products={products}
            loading={loading}
            selectedProducts={selectedProducts}
            onProductSelect={handleProductSelect}
            onSelectAll={handleSelectAll}
            onProductEdit={handleProductEdit}
            onProductView={handleProductView}
            onProductDelete={handleProductDelete}
            onStatusToggle={handleStatusToggle}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1 || loading}
            onClick={() => handleQueryChange({ ...query, page: pagination.page - 1 })}
          >
            上一页
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQueryChange({ ...query, page: pageNum })}
                  disabled={loading}
                >
                  {pageNum}
                </Button>
              );
            })}
            {pagination.totalPages > 5 && (
              <>
                {pagination.totalPages > 6 && <span className="text-slate-400">...</span>}
                <Button
                  variant={pagination.page === pagination.totalPages ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQueryChange({ ...query, page: pagination.totalPages })}
                  disabled={loading}
                >
                  {pagination.totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => handleQueryChange({ ...query, page: pagination.page + 1 })}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 模态框 */}
      <ProductEditModal
        product={selectedProduct}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSuccess={handleEditSuccess}
      />
      
      <ProductViewModal
        product={selectedProduct}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
    </div>
  );
} 