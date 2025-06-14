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
  DialogTrigger,
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
  FolderTree,
  Folder,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { 
  GET_PRODUCT_CATEGORIES,
  GET_PRODUCT_CATEGORY_TREE,
  CREATE_PRODUCT_CATEGORY,
  UPDATE_PRODUCT_CATEGORY,
  DELETE_PRODUCT_CATEGORY
} from '@/lib/graphql/queries'

interface ProductCategory {
  id: string
  name: string
  description?: string
  parent_id?: string
  sort_order?: number
  status: 'active' | 'inactive'
  image?: string
  icon?: string
  seo_title?: string
  seo_description?: string
  parent?: ProductCategory
  children?: ProductCategory[]
  created: string
  updated: string
}

interface CategoryFormData {
  name: string
  description: string
  parent_id: string
  sort_order: number
  status: 'active' | 'inactive'
  image: string
  icon: string
  seo_title: string
  seo_description: string
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  parent_id: '',
  sort_order: 0,
  status: 'active',
  image: '',
  icon: '',
  seo_title: '',
  seo_description: ''
}

export default function ProductCategoriesPage() {
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  // GraphQL 查询
  const { data: categoriesData, loading, error, refetch } = useQuery(GET_PRODUCT_CATEGORIES, {
    variables: {
      query: {
        search: search || null
      }
    },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache'
  })

  const { data: categoryTreeData } = useQuery(GET_PRODUCT_CATEGORY_TREE, {
    fetchPolicy: 'no-cache'
  })

  const categories = categoriesData?.productCategories?.items || []
  const categoryTree = categoryTreeData?.productCategoryTree || []

  // GraphQL 变更
  const [createCategory, { loading: creating }] = useMutation(CREATE_PRODUCT_CATEGORY)
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_PRODUCT_CATEGORY)
  const [deleteCategory] = useMutation(DELETE_PRODUCT_CATEGORY)

  // 表单处理
  const updateFormData = (field: keyof CategoryFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOpenDialog = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || '',
        sort_order: category.sort_order || 0,
        status: category.status,
        image: category.image || '',
        icon: category.icon || '',
        seo_title: category.seo_title || '',
        seo_description: category.seo_description || ''
      })
    } else {
      setEditingCategory(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async () => {
    try {
      if (editingCategory) {
        await updateCategory({
          variables: {
            id: editingCategory.id,
            input: {
              ...formData,
              sort_order: Number(formData.sort_order)
            }
          }
        })
      } else {
        await createCategory({
          variables: {
            input: {
              ...formData,
              sort_order: Number(formData.sort_order)
            }
          }
        })
      }
      
      refetch()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？此操作不可撤销。')) {
      return
    }

    try {
      await deleteCategory({
        variables: { id }
      })
      refetch()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const renderTreeNode = (category: ProductCategory, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedNodes.has(category.id)

    return (
      <div key={category.id}>
        <div 
          className="flex items-center p-2 hover:bg-gray-50 rounded-md"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-6 h-6 p-0 mr-2"
                onClick={() => toggleNode(category.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            ) : (
              <div className="w-6 h-6 mr-2" />
            )}
            
            <Folder className="w-4 h-4 mr-2 text-blue-500" />
            
            <div className="flex-1">
              <div className="font-medium">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-500">{category.description}</div>
              )}
            </div>
            
            <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
              {category.status === 'active' ? '启用' : '禁用'}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-2">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(category.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {category.children?.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status === 'active' ? '启用' : '禁用'}
      </Badge>
    )
  }

  if (loading) return <div>加载中...</div>
  if (error) return <div>加载失败: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">商品分类</h1>
          <p className="text-gray-600">管理您的商品分类结构</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          添加分类
        </Button>
      </div>

      {/* 工具栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索分类..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                列表视图
              </Button>
              <Button
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
              >
                <FolderTree className="w-4 h-4 mr-2" />
                树形视图
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 分类内容 */}
      <Card>
        <CardContent className="p-0">
          {viewMode === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>分类名称</TableHead>
                  <TableHead>父分类</TableHead>
                  <TableHead>排序</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-sm text-gray-500">{category.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.parent?.name || '-'}
                    </TableCell>
                    <TableCell>{category.sort_order || 0}</TableCell>
                    <TableCell>{getStatusBadge(category.status)}</TableCell>
                    <TableCell>
                      {new Date(category.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-4">
              {categoryTree.map(category => renderTreeNode(category))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '编辑分类' : '添加分类'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? '修改分类信息' : '创建新的商品分类'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">分类名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="请输入分类名称"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parent_id">父分类</Label>
                <Select value={formData.parent_id || "none"} onValueChange={(value) => updateFormData('parent_id', value === "none" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择父分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无（顶级分类）</SelectItem>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.id} 
                        value={category.id}
                        disabled={editingCategory?.id === category.id}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select value={formData.status} onValueChange={(value) => updateFormData('status', value as 'active' | 'inactive')}>
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

            <div className="space-y-2">
              <Label htmlFor="description">分类描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="请输入分类描述"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">SEO标题</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => updateFormData('seo_title', e.target.value)}
                  placeholder="SEO标题"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => updateFormData('icon', e.target.value)}
                  placeholder="图标URL或类名"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_description">SEO描述</Label>
              <Textarea
                id="seo_description"
                value={formData.seo_description}
                onChange={(e) => updateFormData('seo_description', e.target.value)}
                placeholder="SEO描述"
                rows={2}
              />
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
              {creating || updating ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 