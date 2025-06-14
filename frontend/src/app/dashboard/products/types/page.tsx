'use client'

import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  MoreHorizontal,
  Package,
  Tag,
  Settings
} from 'lucide-react'
import { 
  GET_PRODUCT_TYPES,
  CREATE_PRODUCT_TYPE,
  UPDATE_PRODUCT_TYPE,
  DELETE_PRODUCT_TYPE
} from '@/lib/graphql/queries'

interface ProductTypeAttribute {
  name: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'date' | 'color' | 'image'
  required: boolean
  options?: string[]
}

interface ProductType {
  id: string
  name: string
  description?: string
  attributes?: ProductTypeAttribute[]
  status: 'active' | 'inactive'
  created: string
  updated: string
}

interface TypeFormData {
  name: string
  description: string
  status: 'active' | 'inactive'
  attributes: ProductTypeAttribute[]
}

const initialFormData: TypeFormData = {
  name: '',
  description: '',
  status: 'active',
  attributes: []
}

const initialAttribute: ProductTypeAttribute = {
  name: '',
  type: 'text',
  required: false,
  options: []
}

const attributeTypes = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'select', label: '单选' },
  { value: 'multiselect', label: '多选' },
  { value: 'boolean', label: '布尔值' },
  { value: 'date', label: '日期' },
  { value: 'color', label: '颜色' },
  { value: 'image', label: '图片' }
]

export default function ProductTypesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<ProductType | null>(null)
  const [formData, setFormData] = useState<TypeFormData>(initialFormData)
  const [search, setSearch] = useState('')

  // GraphQL 查询
  const { data: typesData, loading, error, refetch } = useQuery(GET_PRODUCT_TYPES, {
    variables: {
      query: {
        search: search || null
      }
    },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache'
  })

  const types = typesData?.productTypes?.items || []

  // GraphQL 变更
  const [createType, { loading: creating }] = useMutation(CREATE_PRODUCT_TYPE)
  const [updateType, { loading: updating }] = useMutation(UPDATE_PRODUCT_TYPE)
  const [deleteType] = useMutation(DELETE_PRODUCT_TYPE)

  // 表单处理
  const updateFormData = (field: keyof TypeFormData, value: string | ProductTypeAttribute[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOpenDialog = (type?: ProductType) => {
    if (type) {
      setEditingType(type)
      setFormData({
        name: type.name,
        description: type.description || '',
        status: type.status,
        attributes: type.attributes || []
      })
    } else {
      setEditingType(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingType(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async () => {
    try {
      const input = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        attributes: formData.attributes.length > 0 ? formData.attributes : null
      }

      if (editingType) {
        await updateType({
          variables: {
            id: editingType.id,
            input
          }
        })
      } else {
        await createType({
          variables: {
            input
          }
        })
      }
      
      refetch()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving product type:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('确定要删除这个商品类型吗？')) {
      try {
        await deleteType({
          variables: { id }
        })
        refetch()
      } catch (error) {
        console.error('Error deleting product type:', error)
        alert('删除失败，可能有关联的商品使用了此类型')
      }
    }
  }

  // 属性管理
  const addAttribute = () => {
    setFormData(prev => ({
      ...prev,
      attributes: [...prev.attributes, { ...initialAttribute }]
    }))
  }

  const updateAttribute = (index: number, field: keyof ProductTypeAttribute, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }))
  }

  const removeAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }))
  }

  const addAttributeOption = (attrIndex: number) => {
    const newOptions = [...(formData.attributes[attrIndex].options || []), '']
    updateAttribute(attrIndex, 'options', newOptions)
  }

  const updateAttributeOption = (attrIndex: number, optionIndex: number, value: string) => {
    const newOptions = [...(formData.attributes[attrIndex].options || [])]
    newOptions[optionIndex] = value
    updateAttribute(attrIndex, 'options', newOptions)
  }

  const removeAttributeOption = (attrIndex: number, optionIndex: number) => {
    const newOptions = (formData.attributes[attrIndex].options || []).filter((_, i) => i !== optionIndex)
    updateAttribute(attrIndex, 'options', newOptions)
  }

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
        启用
      </Badge>
    ) : (
      <Badge variant="secondary">
        禁用
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (loading) return <div className="p-6">加载中...</div>
  if (error) return <div className="p-6 text-red-500">加载失败: {error.message}</div>

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">商品类型</h1>
          <p className="text-muted-foreground">
            管理商品类型和属性模板
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          新增类型
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">筛选条件</CardTitle>
          <CardDescription>
            搜索和筛选商品类型
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">搜索</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="搜索类型名称或描述..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                搜索
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 类型列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            商品类型列表
          </CardTitle>
          <CardDescription>
            共 {types.length} 个商品类型
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名称</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>属性数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {types.map((type: ProductType) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      {type.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate text-muted-foreground">
                      {type.description || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {type.attributes?.length || 0} 个属性
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(type.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(type.created)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenDialog(type)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(type.id)}
                          className="gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {editingType ? '编辑商品类型' : '新增商品类型'}
            </DialogTitle>
            <DialogDescription>
              设置商品类型的基本信息和属性模板
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h4 className="font-medium">基本信息</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">类型名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="请输入类型名称"
                  />
                </div>
                <div>
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => updateFormData('status', value as 'active' | 'inactive')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">启用</SelectItem>
                      <SelectItem value="inactive">禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="请输入类型描述"
                  rows={3}
                />
              </div>
            </div>

            {/* 属性配置 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">属性配置</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  添加属性
                </Button>
              </div>
              
              {formData.attributes.map((attribute, attrIndex) => (
                <Card key={attrIndex} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">属性 {attrIndex + 1}</h5>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttribute(attrIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>属性名称</Label>
                        <Input
                          value={attribute.name}
                          onChange={(e) => updateAttribute(attrIndex, 'name', e.target.value)}
                          placeholder="属性名称"
                        />
                      </div>
                      <div>
                        <Label>属性类型</Label>
                        <Select
                          value={attribute.type}
                          onValueChange={(value) => updateAttribute(attrIndex, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {attributeTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-8">
                        <input
                          type="checkbox"
                          id={`required-${attrIndex}`}
                          checked={attribute.required}
                          onChange={(e) => updateAttribute(attrIndex, 'required', e.target.checked)}
                          title="设置属性是否必填"
                        />
                        <Label htmlFor={`required-${attrIndex}`}>必填</Label>
                      </div>
                    </div>

                    {/* 选项配置 */}
                    {(attribute.type === 'select' || attribute.type === 'multiselect') && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>选项配置</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addAttributeOption(attrIndex)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {(attribute.options || []).map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateAttributeOption(attrIndex, optionIndex, e.target.value)}
                              placeholder={`选项 ${optionIndex + 1}`}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttributeOption(attrIndex, optionIndex)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              取消
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={creating || updating || !formData.name.trim()}
            >
              {creating || updating ? '保存中...' : (editingType ? '更新' : '创建')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 