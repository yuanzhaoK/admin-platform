'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Product, apiHelpers } from '@/lib/pocketbase';
import { X, Plus, Save, Loader2, Package } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  categories: string[];
}

interface FormData {
  name: string;
  description: string;
  price: string;
  category: string;
  status: Product['status'];
  tags: string[];
  sku: string;
  stock: string;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
}

export function ProductForm({ product, onSave, onCancel, categories }: ProductFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    category: 'uncategorized',
    status: 'draft',
    tags: [],
    sku: '',
    stock: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
    },
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单数据
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || 'uncategorized',
        status: product.status,
        tags: product.tags || [],
        sku: product.sku || '',
        stock: product.stock?.toString() || '',
        weight: product.weight?.toString() || '',
        dimensions: {
          length: product.dimensions?.length?.toString() || '',
          width: product.dimensions?.width?.toString() || '',
          height: product.dimensions?.height?.toString() || '',
        },
      });
    }
  }, [product]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDimensionChange = (dimension: keyof FormData['dimensions'], value: string) => {
    setFormData(prev => ({
      ...prev,
      dimensions: { ...prev.dimensions, [dimension]: value }
    }));
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '产品名称不能为空';
    }

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = '价格必须是有效数字';
    }

    if (formData.stock && isNaN(Number(formData.stock))) {
      newErrors.stock = '库存必须是有效数字';
    }

    if (formData.weight && isNaN(Number(formData.weight))) {
      newErrors.weight = '重量必须是有效数字';
    }

    const { length, width, height } = formData.dimensions;
    if (length && isNaN(Number(length))) {
      newErrors['dimensions.length'] = '长度必须是有效数字';
    }
    if (width && isNaN(Number(width))) {
      newErrors['dimensions.width'] = '宽度必须是有效数字';
    }
    if (height && isNaN(Number(height))) {
      newErrors['dimensions.height'] = '高度必须是有效数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const productData: Partial<Product> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: formData.price ? Number(formData.price) : undefined,
        category: formData.category === 'uncategorized' ? undefined : formData.category || undefined,
        status: formData.status,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        sku: formData.sku.trim() || undefined,
        stock: formData.stock ? Number(formData.stock) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        dimensions: {
          length: formData.dimensions.length ? Number(formData.dimensions.length) : undefined,
          width: formData.dimensions.width ? Number(formData.dimensions.width) : undefined,
          height: formData.dimensions.height ? Number(formData.dimensions.height) : undefined,
        },
      };

      // 移除空的dimensions对象
      if (!productData.dimensions?.length && !productData.dimensions?.width && !productData.dimensions?.height) {
        delete productData.dimensions;
      }

      let result;
      if (product) {
        // 更新产品
        result = await apiHelpers.updateProduct(product.id, productData);
      } else {
        // 创建产品
        result = await apiHelpers.createProduct(productData as Omit<Product, 'id' | 'created' | 'updated'>);
      }

      if (result.success && result.data) {
        onSave(result.data);
      } else {
        alert(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存产品失败:', error);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>{product ? '编辑产品' : '创建新产品'}</span>
        </CardTitle>
        <CardDescription>
          {product ? '修改产品信息和配置' : '填写产品基本信息和详细配置'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">产品名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="输入产品名称"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="产品SKU（留空自动生成）"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">产品描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="输入产品描述"
              rows={3}
            />
          </div>

          {/* 价格和库存 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="price">价格</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.price}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">库存数量</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                placeholder="0"
                className={errors.stock ? 'border-red-500' : ''}
              />
              {errors.stock && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.stock}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">重量 (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="0.00"
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.weight}</p>
              )}
            </div>
          </div>

          {/* 分类和状态 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category">产品分类</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">不分类</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">产品状态</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as Product['status'])}>
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
          </div>

          {/* 尺寸 */}
          <div className="space-y-2">
            <Label>产品尺寸 (cm)</Label>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.dimensions.length}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  placeholder="长度"
                  className={errors['dimensions.length'] ? 'border-red-500' : ''}
                />
                {errors['dimensions.length'] && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors['dimensions.length']}</p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.dimensions.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  placeholder="宽度"
                  className={errors['dimensions.width'] ? 'border-red-500' : ''}
                />
                {errors['dimensions.width'] && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors['dimensions.width']}</p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.dimensions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  placeholder="高度"
                  className={errors['dimensions.height'] ? 'border-red-500' : ''}
                />
                {errors['dimensions.height'] && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors['dimensions.height']}</p>
                )}
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="space-y-2">
            <Label htmlFor="tags">产品标签</Label>
            <div className="flex space-x-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                placeholder="输入标签后按回车添加"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {product ? '更新产品' : '创建产品'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 