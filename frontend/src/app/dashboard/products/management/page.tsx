'use client'

import React, { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import { 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Package,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  GET_PRODUCTS,
  GET_PRODUCT_CATEGORIES,
  GET_BRANDS,
  BATCH_UPDATE_PRODUCT_STATUS,
  BATCH_DELETE_PRODUCTS
} from '@/lib/graphql/queries'

interface Product {
  id: string
  name: string
  subtitle?: string
  price?: number
  market_price?: number
  sku?: string
  stock?: number
  images?: string[]
  status: 'active' | 'inactive' | 'draft'
  review_status: 'pending' | 'approved' | 'rejected'
  is_featured?: boolean
  is_new?: boolean
  is_hot?: boolean
  is_published?: boolean
  sales_count?: number
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
  tags?: string[]
  created: string
  updated: string
}

interface ProductsResponse {
  products: {
    items: Product[]
    pagination: {
      page: number
      perPage: number
      totalPages: number
      totalItems: number
    }
  }
}

export default function ProductManagementPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category_id: '',
    brand_id: '',
    is_featured: '',
    is_published: '',
    review_status: ''
  })
  const [page, setPage] = useState(1)
  const perPage = 20

  // GraphQL queries
  const { data: productsData, loading, error, refetch } = useQuery<ProductsResponse>(GET_PRODUCTS, {
    variables: {
      query: {
        page,
        perPage,
        ...filters
      }
    }
  })

  const { data: categoriesData } = useQuery(GET_PRODUCT_CATEGORIES)
  const { data: brandsData } = useQuery(GET_BRANDS)

  // GraphQL mutations
  const [batchUpdateStatus] = useMutation(BATCH_UPDATE_PRODUCT_STATUS)
  const [batchDelete] = useMutation(BATCH_DELETE_PRODUCTS)

  const products = productsData?.products?.items || []
  const pagination = productsData?.products?.pagination
  const categories = categoriesData?.productCategories?.items || []
  const brands = brandsData?.brands?.items || []

  // Handle filters
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    setPage(1)
  }

  // Handle selections
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  // Handle batch operations
  const handleBatchStatusUpdate = async (status: string) => {
    if (selectedIds.length === 0) {
      toast({
        title: '请选择要操作的商品',
        variant: 'destructive'
      })
      return
    }

    try {
      await batchUpdateStatus({
        variables: {
          ids: selectedIds,
          status
        }
      })
      
      toast({
        title: '批量更新成功',
        description: `已更新 ${selectedIds.length} 个商品状态`
      })
      
      setSelectedIds([])
      refetch()
    } catch (error) {
      toast({
        title: '批量更新失败',
        description: error instanceof Error ? error.message : '操作失败',
        variant: 'destructive'
      })
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      toast({
        title: '请选择要删除的商品',
        variant: 'destructive'
      })
      return
    }

    if (!confirm(`确定要删除选中的 ${selectedIds.length} 个商品吗？此操作不可撤销。`)) {
      return
    }

    try {
      await batchDelete({
        variables: {
          ids: selectedIds
        }
      })
      
      toast({
        title: '批量删除成功',
        description: `已删除 ${selectedIds.length} 个商品`
      })
      
      setSelectedIds([])
      refetch()
    } catch (error) {
      toast({
        title: '批量删除失败',
        description: error instanceof Error ? error.message : '操作失败',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { label: '已上架', variant: 'default' as const },
      'inactive': { label: '已下架', variant: 'secondary' as const },
      'draft': { label: '草稿', variant: 'outline' as const }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getReviewStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: '待审核', variant: 'outline' as const },
      'approved': { label: '已通过', variant: 'default' as const },
      'rejected': { label: '已拒绝', variant: 'destructive' as const }
    }
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) return <div>加载中...</div>
  if (error) return <div>加载失败: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">商品管理</h1>
          <p className="text-gray-600">管理您的商品库存和信息</p>
        </div>
        <Link href="/dashboard/products/management/add">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            添加商品
          </Button>
        </Link>
      </div>

      {/* 搜索和过滤器 */}
      <Card>
        <CardHeader>
          <CardTitle>筛选</CardTitle>
          <CardDescription>使用下面的条件来筛选商品</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索商品名称、SKU..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="商品状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部状态</SelectItem>
                <SelectItem value="active">已上架</SelectItem>
                <SelectItem value="inactive">已下架</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category_id} onValueChange={(value) => handleFilterChange('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="商品分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部分类</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.brand_id} onValueChange={(value) => handleFilterChange('brand_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="品牌" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部品牌</SelectItem>
                {brands.map((brand: any) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 批量操作 */}
      {selectedIds.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm">已选择 {selectedIds.length} 个商品</span>
              <div className="space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBatchStatusUpdate('active')}
                >
                  批量上架
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBatchStatusUpdate('inactive')}
                >
                  批量下架
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleBatchDelete}
                >
                  批量删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 商品列表 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === products.length && products.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>编号</TableHead>
                <TableHead>商品图片</TableHead>
                <TableHead>商品名称</TableHead>
                <TableHead>价格/货号</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>SKU库存</TableHead>
                <TableHead>销量</TableHead>
                <TableHead>审核状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(product.id)}
                      onCheckedChange={(checked) => 
                        handleSelectItem(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.id.slice(-8)}
                  </TableCell>
                  <TableCell>
                    <div className="w-16 h-16 relative bg-gray-100 rounded-md overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.subtitle && (
                        <div className="text-sm text-gray-500">{product.subtitle}</div>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(product.status)}
                        {product.is_featured && <Badge variant="secondary">推荐</Badge>}
                        {product.is_new && <Badge variant="outline">新品</Badge>}
                        {product.is_hot && <Badge variant="default">热销</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {product.price && (
                        <div className="font-medium">¥{product.price}</div>
                      )}
                      {product.market_price && (
                        <div className="text-sm text-gray-500 line-through">
                          ¥{product.market_price}
                        </div>
                      )}
                      {product.sku && (
                        <div className="text-sm text-gray-500">#{product.sku}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.tags?.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags && product.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Package className="w-4 h-4 inline mr-1" />
                    {product.sort_order || 0}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.stock || 0}</div>
                      <div className="text-sm text-gray-500">库存</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{product.sales_count || 0}</div>
                  </TableCell>
                  <TableCell>
                    {getReviewStatusBadge(product.review_status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/management/${product.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            查看详情
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/management/${product.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleBatchDelete()}
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
    </div>
  )
} 