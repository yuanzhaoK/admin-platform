'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiHelpers, Product } from '@/lib/pocketbase';
import { Plus, Edit, Trash2, Code, Database, Globe, CheckCircle } from 'lucide-react';

export default function CrudDemoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'draft' as 'draft' | 'active' | 'inactive',
    tags: ''
  });

  // 步骤状态追踪
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await apiHelpers.getProducts();
      if (result.success && result.data) {
        setProducts(result.data);
        if (!completedSteps.includes(1)) {
          setCompletedSteps(prev => [...prev, 1]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category: formData.category,
        status: formData.status,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        config: { source: 'crud-demo' }
      };

      let result;
      if (editingProduct) {
        result = await apiHelpers.updateProduct(editingProduct.id, productData);
        if (!completedSteps.includes(3)) {
          setCompletedSteps(prev => [...prev, 3]);
        }
      } else {
        result = await apiHelpers.createProduct(productData);
        if (!completedSteps.includes(2)) {
          setCompletedSteps(prev => [...prev, 2]);
        }
      }

      if (result.success) {
        await fetchProducts();
        setDialogOpen(false);
        resetForm();
      } else {
        alert('操作失败: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('操作失败');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      status: product.status,
      tags: product.tags?.join(', ') || ''
    });
    setDialogOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    try {
      const result = await apiHelpers.deleteProduct(id);
      if (result.success) {
        setProducts(products.filter(p => p.id !== id));
        if (!completedSteps.includes(4)) {
          setCompletedSteps(prev => [...prev, 4]);
        }
      } else {
        alert('删除失败: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('删除失败');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      status: 'draft',
      tags: ''
    });
    setEditingProduct(null);
  };

  const steps = [
    {
      id: 1,
      title: 'READ - 读取数据',
      description: '从PocketBase获取产品列表',
      icon: Database,
      color: 'text-blue-600'
    },
    {
      id: 2,
      title: 'CREATE - 创建数据',
      description: '添加新的产品记录',
      icon: Plus,
      color: 'text-green-600'
    },
    {
      id: 3,
      title: 'UPDATE - 更新数据',
      description: '修改现有产品信息',
      icon: Edit,
      color: 'text-yellow-600'
    },
    {
      id: 4,
      title: 'DELETE - 删除数据',
      description: '删除产品记录',
      icon: Trash2,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            CRUD 生命周期演示
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            完整的数据接口开发流程：从数据库到前端的全链路演示
          </p>
        </div>
      </div>

      {/* 步骤进度 */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>CRUD 操作步骤</span>
          </CardTitle>
          <CardDescription>
            按顺序完成每个操作来体验完整的数据生命周期
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step) => {
                             const StepIcon = step.icon;
               const isCompleted = completedSteps.includes(step.id);
               const isCurrent = false;
              
              return (
                <div 
                  key={step.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isCompleted 
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                      : isCurrent
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <StepIcon className={`h-5 w-5 ${step.color}`} />
                    )}
                    <span className="font-medium text-sm">步骤 {step.id}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>操作面板</CardTitle>
          <CardDescription>
            点击按钮执行相应的CRUD操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              onClick={fetchProducts}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Database className="h-4 w-4" />
              <span>读取数据 (READ)</span>
            </Button>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  onClick={() => {
                    resetForm();
                    setDialogOpen(true);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  创建产品 (CREATE)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? '编辑产品' : '创建新产品'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct ? '修改产品信息' : '填写产品信息来创建新产品'}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <label className="text-sm font-medium">产品名称</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="输入产品名称"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">描述</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="输入产品描述"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">价格</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">分类</label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="产品分类"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">状态</label>
                                         <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'inactive') => setFormData(prev => ({ ...prev, status: value }))}>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="draft">草稿</SelectItem>
                         <SelectItem value="active">活跃</SelectItem>
                         <SelectItem value="inactive">停用</SelectItem>
                       </SelectContent>
                     </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">标签</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="标签1, 标签2, 标签3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSaveProduct}>
                    {editingProduct ? '更新' : '创建'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* 产品列表 */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>产品列表</CardTitle>
          <CardDescription>
            当前数据库中的所有产品 ({products.length} 个)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-slate-600 dark:text-slate-400">正在加载...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">暂无产品数据</p>
                             <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                 点击&quot;创建产品&quot;按钮来添加第一个产品
               </p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {product.name}
                      </h3>
                      <Badge 
                        variant={product.status === 'active' ? 'default' : product.status === 'inactive' ? 'secondary' : 'outline'}
                      >
                        {product.status === 'active' ? '活跃' : product.status === 'inactive' ? '停用' : '草稿'}
                      </Badge>
                      {product.category && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {product.category}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {product.description || '暂无描述'}
                    </p>
                    {product.price && (
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                        ¥{(product.price || 0).toFixed(2)}
                      </p>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex space-x-1 mt-2">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900 dark:text-blue-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      编辑 (UPDATE)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      删除 (DELETE)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 技术栈说明 */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>完整技术栈</span>
          </CardTitle>
          <CardDescription>
            这个CRUD演示涵盖了从后端到前端的完整流程
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">后端 (PocketBase)</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• 数据库集合定义</li>
                <li>• 数据验证规则</li>
                <li>• 权限控制</li>
                <li>• 业务逻辑钩子</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">API 层</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• RESTful API 接口</li>
                <li>• 认证与授权</li>
                <li>• 错误处理</li>
                <li>• 数据序列化</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">前端 (Next.js)</h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>• React 组件</li>
                <li>• 状态管理</li>
                <li>• 表单处理</li>
                <li>• UI 组件库</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 