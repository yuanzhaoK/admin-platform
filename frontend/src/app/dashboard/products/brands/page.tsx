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
  Building,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'
import { 
  GET_BRANDS,
  CREATE_BRAND,
  UPDATE_BRAND,
  DELETE_BRAND
} from '@/lib/graphql/queries'

interface Brand {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  sort_order?: number
  status: 'active' | 'inactive'
  created: string
  updated: string
}

interface BrandFormData {
  name: string
  description: string
  logo: string
  website: string
  sort_order: number
  status: 'active' | 'inactive'
}

const initialFormData: BrandFormData = {
  name: '',
  description: '',
  logo: '',
  website: '',
  sort_order: 0,
  status: 'active'
}

export default function BrandsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState<BrandFormData>(initialFormData)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  // GraphQL 查询
  const { data: brandsData, loading, error, refetch } = useQuery(GET_BRANDS, {
    variables: {
      query: {
        page,
        perPage,
        search: search || undefined
      }
    }
  })

  // GraphQL 变更
  const [createBrand, { loading: creating }] = useMutation(CREATE_BRAND)
  const [updateBrand, { loading: updating }] = useMutation(UPDATE_BRAND)
  const [deleteBrand] = useMutation(DELETE_BRAND)

  const brands = brandsData?.brands?.items || []
  const pagination = brandsData?.brands?.pagination

  // 表单处理
  const updateFormData = (field: keyof BrandFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
      setFormData({
        name: brand.name,
        description: brand.description || '',
        logo: brand.logo || '',
        website: brand.website || '',
        sort_order: brand.sort_order || 0,
        status: brand.status
      })
    } else {
      setEditingBrand(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingBrand(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async () => {
    try {
      if (editingBrand) {
        await updateBrand({
          variables: {
            id: editingBrand.id,
            input: {
              ...formData,
              sort_order: Number(formData.sort_order)
            }
          }
        })
      } else {
        await createBrand({
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
      console.error('Error saving brand:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个品牌吗？此操作不可撤销。')) {
      return
    }

    try {
      await deleteBrand({
        variables: { id }
      })
      refetch()
    } catch (error) {
      console.error('Error deleting brand:', error)
    }
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
          <h1 className="text-3xl font-bold">品牌管理</h1>
          <p className="text-gray-600">管理您的商品品牌信息</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          添加品牌
        </Button>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索品牌名称..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 品牌列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>品牌Logo</TableHead>
                <TableHead>品牌名称</TableHead>
                <TableHead>官网</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand: Brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="w-16 h-16 relative bg-gray-100 rounded-md overflow-hidden">
                      {brand.logo ? (
                        <Image
                          src={brand.logo}
                          alt={brand.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{brand.name}</div>
                      {brand.description && (
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {brand.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {brand.website ? (
                      <a 
                        href={brand.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        访问官网
                      </a>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{brand.sort_order || 0}</TableCell>
                  <TableCell>{getStatusBadge(brand.status)}</TableCell>
                  <TableCell>
                    {new Date(brand.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenDialog(brand)}>
                          <Edit className="w-4 h-4 mr-2" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(brand.id)}
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
        </CardContent>
      </Card>

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            显示 {((page - 1) * perPage) + 1} 到 {Math.min(page * perPage, pagination.totalItems)} 条，
            共 {pagination.totalItems} 条记录
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 添加/编辑对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? '编辑品牌' : '添加品牌'}
            </DialogTitle>
            <DialogDescription>
              {editingBrand ? '修改品牌信息' : '创建新的品牌'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">品牌名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="请输入品牌名称"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">官网地址</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://example.com"
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
              <Label htmlFor="logo">品牌Logo</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => updateFormData('logo', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">品牌描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="请输入品牌描述"
                rows={4}
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