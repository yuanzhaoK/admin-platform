'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,·  
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Card,
  CardContent,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { 
  ArrowLeft,
  ArrowRight,
  Save,
  Upload,
  X,
  Plus,
  Link as LinkIcon
} from 'lucide-react'
import Link from 'next/link'
import { 
  GET_PRODUCT_CATEGORIES,
  GET_BRANDS,
  GET_PRODUCT_TYPES,
  CREATE_PRODUCT
} from '@/lib/graphql/queries'

interface ProductFormData {
  // 基本信息
  name: string
  subtitle: string
  description: string
  category_id: string
  brand_id: string
  product_type_id: string
  sku: string
  unit: string
  sort_order: number
  
  // 价格信息
  price: number
  market_price: number
  cost_price: number
  
  // 库存信息
  stock: number
  
  // 促销信息
  points: number
  growth_value: number
  points_purchase_limit: number
  preview_enabled: boolean
  is_published: boolean
  is_recommended: boolean
  is_featured: boolean
  is_new: boolean
  is_hot: boolean
  service_guarantee: string[]
  
  // 其他信息
  tags: string[]
  images: string[]
  attributes: Record<string, any>
  status: 'active' | 'inactive' | 'draft'
  weight: number
}

const initialFormData: ProductFormData = {
  name: '',
  subtitle: '',
  description: '',
  category_id: '',
  brand_id: '',
  product_type_id: '',
  sku: '',
  unit: '件',
  sort_order: 0,
  price: 0,
  market_price: 0,
  cost_price: 0,
  stock: 0,
  points: 0,
  growth_value: 0,
  points_purchase_limit: 0,
  preview_enabled: false,
  is_published: false,
  is_recommended: false,
  is_featured: false,
  is_new: false,
  is_hot: false,
  service_guarantee: [],
  tags: [],
  images: [],
  attributes: {},
  status: 'draft',
  weight: 0
}

const steps = [
  { id: 'basic', title: '商品信息', description: '填写基本商品信息' },
  { id: 'promotion', title: '商品促销', description: '设置促销和推荐信息' },
  { id: 'attributes', title: '商品属性', description: '配置商品属性' },
  { id: 'relations', title: '选择商品关联', description: '关联相关商品' }
]

export default function AddProductPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [tagInput, setTagInput] = useState('')

  // GraphQL 查询
  const { data: categoriesData } = useQuery(GET_PRODUCT_CATEGORIES)
  const { data: brandsData } = useQuery(GET_BRANDS)
  const { data: productTypesData } = useQuery(GET_PRODUCT_TYPES)

  // GraphQL 变更
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT)

  const categories = categoriesData?.productCategories?.items || []
  const brands = brandsData?.brands?.items || []
  const productTypes = productTypesData?.productTypes?.items || []

  // 表单处理
  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      updateFormData('tags', [...formData.tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    updateFormData('tags', formData.tags.filter(t => t !== tag))
  }

  const toggleServiceGuarantee = (service: string) => {
    const currentServices = formData.service_guarantee
    if (currentServices.includes(service)) {
      updateFormData('service_guarantee', currentServices.filter(s => s !== service))
    } else {
      updateFormData('service_guarantee', [...currentServices, service])
    }
  }

  // 步骤导航
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 表单提交
  const handleSubmit = async () => {
    try {
      const result = await createProduct({
        variables: {
          input: {
            ...formData,
            price: Number(formData.price),
            market_price: Number(formData.market_price),
            cost_price: Number(formData.cost_price),
            stock: Number(formData.stock),
            points: Number(formData.points),
            growth_value: Number(formData.growth_value),
            points_purchase_limit: Number(formData.points_purchase_limit),
            sort_order: Number(formData.sort_order),
            weight: Number(formData.weight)
          }
        }
      })

      toast({
        title: '商品创建成功',
        description: '商品已成功添加到系统中'
      })

      router.push('/dashboard/products/management')
    } catch (error) {
      toast({
        title: '创建失败',
        description: error instanceof Error ? error.message : '创建商品时发生错误',
        variant: 'destructive'
      })
    }
  }

  const serviceGuaranteeOptions = [
    '7天无理由退货',
    '正品保证',
    '闪电发货',
    '售后保障',
    '质量保证',
    '免费配送'
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/products/management">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回商品列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">添加商品</h1>
            <p className="text-gray-600">按步骤填写商品信息</p>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-gray-500">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 表单内容 */}
      <Card>
        <CardContent className="pt-6">
          {/* 步骤1: 商品信息 */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">商品名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="请输入商品名称"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subtitle">副标题</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => updateFormData('subtitle', e.target.value)}
                    placeholder="商品副标题"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">商品分类 *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => updateFormData('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择商品分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">商品品牌</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => updateFormData('brand_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择品牌" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand: any) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">商品货号</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => updateFormData('sku', e.target.value)}
                    placeholder="商品SKU编号"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">计量单位</Label>
                  <Select value={formData.unit} onValueChange={(value) => updateFormData('unit', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择单位" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="件">件</SelectItem>
                      <SelectItem value="个">个</SelectItem>
                      <SelectItem value="套">套</SelectItem>
                      <SelectItem value="盒">盒</SelectItem>
                      <SelectItem value="包">包</SelectItem>
                      <SelectItem value="公斤">公斤</SelectItem>
                      <SelectItem value="升">升</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="market_price">市场价</Label>
                  <Input
                    id="market_price"
                    type="number"
                    step="0.01"
                    value={formData.market_price}
                    onChange={(e) => updateFormData('market_price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">销售价 *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">商品库存 *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => updateFormData('stock', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sort_order">排序</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => updateFormData('sort_order', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">商品介绍</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="请输入商品详细介绍"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* 步骤2: 商品促销 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="points">积分</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => updateFormData('points', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="growth_value">成长值</Label>
                  <Input
                    id="growth_value"
                    type="number"
                    value={formData.growth_value}
                    onChange={(e) => updateFormData('growth_value', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points_purchase_limit">积分购买限制</Label>
                  <Input
                    id="points_purchase_limit"
                    type="number"
                    value={formData.points_purchase_limit}
                    onChange={(e) => updateFormData('points_purchase_limit', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="preview_enabled">预告商品</Label>
                  <Switch
                    id="preview_enabled"
                    checked={formData.preview_enabled}
                    onCheckedChange={(checked) => updateFormData('preview_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_published">商品是否上架</Label>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => updateFormData('is_published', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_recommended">商品推荐</Label>
                  <Switch
                    id="is_recommended"
                    checked={formData.is_recommended}
                    onCheckedChange={(checked) => updateFormData('is_recommended', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured">首页推荐</Label>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => updateFormData('is_featured', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_new">新品标识</Label>
                  <Switch
                    id="is_new"
                    checked={formData.is_new}
                    onCheckedChange={(checked) => updateFormData('is_new', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_hot">热销标识</Label>
                  <Switch
                    id="is_hot"
                    checked={formData.is_hot}
                    onCheckedChange={(checked) => updateFormData('is_hot', checked)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>服务保障</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceGuaranteeOptions.map((service) => (
                    <div key={service} className="flex items-center space-x-2">
                      <Checkbox
                        id={service}
                        checked={formData.service_guarantee.includes(service)}
                        onCheckedChange={() => toggleServiceGuarantee(service)}
                      />
                      <Label htmlFor={service} className="text-sm">{service}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 步骤3: 商品属性 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label>商品标签</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="输入标签名称"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {tag}
                      <X
                        className="w-3 h-3 ml-2 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>商品图册</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">点击或拖拽上传商品图片</p>
                  <Button variant="outline">
                    选择图片
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 步骤4: 选择商品关联 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <LinkIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">商品关联</h3>
                <p className="text-gray-600 mb-6">选择与此商品相关的其他商品，提升用户购买体验</p>
                <Button variant="outline">
                  选择关联商品
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>

        <div className="flex items-center space-x-2">
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep}>
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={creating}>
              <Save className="w-4 h-4 mr-2" />
              {creating ? '创建中...' : '完成，提交商品'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
} 