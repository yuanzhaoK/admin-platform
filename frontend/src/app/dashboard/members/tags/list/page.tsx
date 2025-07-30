"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Tag,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import {
  CREATE_MEMBER_TAG,
  DELETE_MEMBER_TAG,
  GET_MEMBER_TAGS,
  UPDATE_MEMBER_TAG,
} from "@/lib/graphql/queries/member-system";

interface TagData {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: string;
  category: string;
  subcategory?: string;
  color: string;
  backgroundColor?: string;
  icon?: string;
  priority: number;
  isSystem: boolean;
  isAutoAssigned: boolean;
  isVisible: boolean;
  isActive: boolean;
  memberCount: number;
  usageCount: number;
  businessValue?: number;
  conversionRate?: number;
  averageOrderValue?: number;
  validityPeriod?: number;
  created: string;
  updated: string;
}

interface QueryFilters {
  search: string;
  type: string;
  category: string;
  isSystem: string;
  isActive: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  perPage: number;
}

interface TagFormData {
  name: string;
  displayName: string;
  description: string;
  type: string;
  category: string;
  subcategory: string;
  color: string;
  backgroundColor: string;
  icon: string;
  priority: number;
  isAutoAssigned: boolean;
  isVisible: boolean;
  isActive: boolean;
  businessValue: number;
  validityPeriod: number;
}

export default function TagsListPage() {
  const [filters, setFilters] = useState<QueryFilters>({
    search: "",
    type: "all",
    category: "all",
    isSystem: "all",
    isActive: "all",
    sortBy: "memberCount",
    sortOrder: "DESC",
    page: 1,
    perPage: 20,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState<TagFormData>({
    name: "",
    displayName: "",
    description: "",
    type: "CUSTOM",
    category: "",
    subcategory: "",
    color: "#3B82F6",
    backgroundColor: "",
    icon: "",
    priority: 100,
    isAutoAssigned: false,
    isVisible: true,
    isActive: true,
    businessValue: 0,
    validityPeriod: 0,
  });

  // GraphQL queries and mutations
  const { data, loading, refetch } = useQuery(GET_MEMBER_TAGS, {
    variables: {
      query: {
        search: filters.search || undefined,
        type: filters.type !== "all" ? [filters.type] : undefined,
        category: filters.category !== "all" ? [filters.category] : undefined,
        isSystem: filters.isSystem !== "all"
          ? filters.isSystem === "true"
          : undefined,
        isActive: filters.isActive !== "all"
          ? filters.isActive === "true"
          : undefined,
        pagination: {
          page: filters.page,
          perPage: filters.perPage,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder as "ASC" | "DESC",
        },
        includeStats: true,
      },
    },
    errorPolicy: "all",
  });

  const [createTag] = useMutation(CREATE_MEMBER_TAG, {
    onCompleted: () => {
      setIsCreateModalOpen(false);
      resetForm();
      refetch();
    },
  });

  const [updateTag] = useMutation(UPDATE_MEMBER_TAG, {
    onCompleted: () => {
      setIsEditModalOpen(false);
      setSelectedTag(null);
      resetForm();
      refetch();
    },
  });

  const [deleteTag] = useMutation(DELETE_MEMBER_TAG, {
    onCompleted: () => {
      refetch();
    },
  });

  // Data processing
  const tags = data?.memberTags?.items || [];
  const pagination = data?.memberTags?.pagination;
  const stats = data?.memberTags?.stats;
  const categories = data?.memberTags?.categories || [];

  // Event handlers
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  const handleFilterChange = (
    key: keyof QueryFilters,
    value: string | number,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === "DESC"
        ? "ASC"
        : "DESC";
    setFilters((prev) => ({ ...prev, sortBy, sortOrder: newSortOrder }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      type: "CUSTOM",
      category: "",
      subcategory: "",
      color: "#3B82F6",
      backgroundColor: "",
      icon: "",
      priority: 100,
      isAutoAssigned: false,
      isVisible: true,
      isActive: true,
      businessValue: 0,
      validityPeriod: 0,
    });
  };

  const handleCreateTag = async () => {
    try {
      await createTag({
        variables: {
          input: {
            ...formData,
            businessValue: formData.businessValue || undefined,
            validityPeriod: formData.validityPeriod || undefined,
          },
        },
      });
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const handleEditTag = (tag: TagData) => {
    setSelectedTag(tag);
    setFormData({
      name: tag.name,
      displayName: tag.displayName,
      description: tag.description || "",
      type: tag.type,
      category: tag.category,
      subcategory: tag.subcategory || "",
      color: tag.color,
      backgroundColor: tag.backgroundColor || "",
      icon: tag.icon || "",
      priority: tag.priority,
      isAutoAssigned: tag.isAutoAssigned,
      isVisible: tag.isVisible,
      isActive: tag.isActive,
      businessValue: tag.businessValue || 0,
      validityPeriod: tag.validityPeriod || 0,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTag = async () => {
    if (!selectedTag) return;

    try {
      await updateTag({
        variables: {
          id: selectedTag.id,
          input: {
            ...formData,
            businessValue: formData.businessValue || undefined,
            validityPeriod: formData.validityPeriod || undefined,
          },
        },
      });
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (window.confirm("确定要删除这个标签吗？此操作不可撤销。")) {
      try {
        await deleteTag({
          variables: { id: tagId },
        });
      } catch (error) {
        console.error("Error deleting tag:", error);
      }
    }
  };

  const handleViewTag = (tag: TagData) => {
    setSelectedTag(tag);
    setIsViewModalOpen(true);
  };

  const handleDuplicateTag = (tag: TagData) => {
    setFormData({
      name: `${tag.name}_copy`,
      displayName: `${tag.displayName} (副本)`,
      description: tag.description || "",
      type: tag.type,
      category: tag.category,
      subcategory: tag.subcategory || "",
      color: tag.color,
      backgroundColor: tag.backgroundColor || "",
      icon: tag.icon || "",
      priority: tag.priority,
      isAutoAssigned: tag.isAutoAssigned,
      isVisible: tag.isVisible,
      isActive: tag.isActive,
      businessValue: tag.businessValue || 0,
      validityPeriod: tag.validityPeriod || 0,
    });
    setIsCreateModalOpen(true);
  };

  // Utility functions
  const getTagTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      BEHAVIOR: { label: "行为", variant: "default" },
      DEMOGRAPHIC: { label: "属性", variant: "secondary" },
      TRANSACTION: { label: "交易", variant: "outline" },
      CUSTOM: { label: "自定义", variant: "outline" },
    };

    const typeInfo = typeMap[type] ||
      { label: type, variant: "outline" as const };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const getTagBadge = (tag: TagData) => {
    return (
      <Badge
        style={{
          backgroundColor: tag.backgroundColor || `${tag.color}20`,
          color: tag.color,
          borderColor: tag.color,
        }}
        variant="outline"
        className="flex items-center gap-1"
      >
        {tag.icon && <span>{tag.icon}</span>}
        {tag.displayName}
      </Badge>
    );
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return (
      <ArrowUpDown
        className={`h-4 w-4 ${
          filters.sortOrder === "ASC" ? "rotate-180" : ""
        } text-primary`}
      />
    );
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">标签列表</h1>
          <p className="text-muted-foreground">
            管理所有会员标签，支持创建、编辑和删除操作
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新增标签
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总标签数</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTags?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                系统标签 {stats.systemTags || 0} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">自动标签</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.autoAssignedTags?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                自动化率 {stats.totalTags
                  ? ((stats.autoAssignedTags / stats.totalTags) * 100).toFixed(
                    1,
                  )
                  : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">标记会员</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalMembers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                平均 {stats.averageTagsPerMember?.toFixed(1) || 0} 个标签/人
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">自定义标签</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.customTags?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                占比 {stats.totalTags
                  ? ((stats.customTags / stats.totalTags) * 100).toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            搜索和筛选
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <Label>搜索标签</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入标签名称..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>标签类型</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => handleFilterChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="BEHAVIOR">行为标签</SelectItem>
                  <SelectItem value="DEMOGRAPHIC">属性标签</SelectItem>
                  <SelectItem value="TRANSACTION">交易标签</SelectItem>
                  <SelectItem value="CUSTOM">自定义标签</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>标签分类</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange("category", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  {categories.map((
                    cat: { category: string; count: number },
                  ) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category} ({cat.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>系统标签</Label>
              <Select
                value={filters.isSystem}
                onValueChange={(value) => handleFilterChange("isSystem", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="true">系统标签</SelectItem>
                  <SelectItem value="false">自定义标签</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={filters.isActive}
                onValueChange={(value) => handleFilterChange("isActive", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="true">启用</SelectItem>
                  <SelectItem value="false">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>每页显示</Label>
              <Select
                value={filters.perPage.toString()}
                onValueChange={(value) =>
                  handleFilterChange("perPage", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 条</SelectItem>
                  <SelectItem value="20">20 条</SelectItem>
                  <SelectItem value="50">50 条</SelectItem>
                  <SelectItem value="100">100 条</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 标签列表 */}
      <Card>
        <CardHeader>
          <CardTitle>标签列表</CardTitle>
          <CardDescription>
            {pagination &&
              `第 ${pagination.page} 页，共 ${pagination.totalPages} 页，总计 ${pagination.totalItems} 个标签`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading
            ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-gray-500 bg-white transition ease-in-out duration-150">
                  <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  加载中...
                </div>
              </div>
            )
            : tags.length === 0
            ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4" />
                <p>没有找到符合条件的标签</p>
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个标签
                </Button>
              </div>
            )
            : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标签</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>类型</span>
                          {getSortIcon("type")}
                        </div>
                      </TableHead>
                      <TableHead>分类</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("memberCount")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>会员数</span>
                          {getSortIcon("memberCount")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("priority")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>优先级</span>
                          {getSortIcon("priority")}
                        </div>
                      </TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("created")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>创建时间</span>
                          {getSortIcon("created")}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag: TagData) => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getTagBadge(tag)}
                            {tag.isSystem && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                系统
                              </Badge>
                            )}
                            {tag.isAutoAssigned && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                自动
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {tag.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTagTypeBadge(tag.type)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tag.category}</div>
                            {tag.subcategory && (
                              <div className="text-sm text-muted-foreground">
                                {tag.subcategory}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">
                              {formatNumber(tag.memberCount)}
                            </span>
                            {tag.businessValue && (
                              <Badge variant="outline" className="text-xs">
                                价值: {tag.businessValue.toFixed(1)}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={tag.priority >= 100
                              ? "default"
                              : "secondary"}
                          >
                            {tag.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={tag.isActive ? "default" : "secondary"}
                            >
                              {tag.isActive ? "启用" : "禁用"}
                            </Badge>
                            <Badge
                              variant={tag.isVisible ? "outline" : "secondary"}
                            >
                              {tag.isVisible ? "可见" : "隐藏"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(tag.created)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>操作</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleViewTag(tag)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditTag(tag)}
                                disabled={tag.isSystem}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                编辑标签
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicateTag(tag)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                复制标签
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteTag(tag.id)}
                                disabled={tag.isSystem}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除标签
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      显示第 {(pagination.page - 1) * pagination.perPage + 1} -
                      {" "}
                      {Math.min(
                        pagination.page * pagination.perPage,
                        pagination.totalItems,
                      )} 条，共 {pagination.totalItems} 条
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        上一页
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({
                          length: Math.min(5, pagination.totalPages),
                        }, (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={pagination.page === page
                                ? "default"
                                : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                      >
                        下一页
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
        </CardContent>
      </Card>

      {/* 创建标签对话框 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建新标签</DialogTitle>
            <DialogDescription>
              填写标签的基本信息和属性设置
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">标签名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="英文标识名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">显示名称 *</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))}
                  placeholder="中文显示名称"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                placeholder="标签的详细描述"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">标签类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEHAVIOR">行为标签</SelectItem>
                    <SelectItem value="DEMOGRAPHIC">属性标签</SelectItem>
                    <SelectItem value="TRANSACTION">交易标签</SelectItem>
                    <SelectItem value="CUSTOM">自定义标签</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">分类 *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))}
                  placeholder="标签分类"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subcategory">子分类</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))}
                  placeholder="标签子分类"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">优先级</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value),
                    }))}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">颜色 *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))}
                    className="w-20"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">图标</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="🏷️"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessValue">商业价值</Label>
                <Input
                  id="businessValue"
                  type="number"
                  step="0.1"
                  value={formData.businessValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessValue: parseFloat(e.target.value),
                    }))}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validityPeriod">有效期 (天)</Label>
                <Input
                  id="validityPeriod"
                  type="number"
                  value={formData.validityPeriod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validityPeriod: parseInt(e.target.value),
                    }))}
                  placeholder="0 (永久有效)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isAutoAssigned}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isAutoAssigned: checked,
                    }))}
                />
                <Label>自动分配</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isVisible}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isVisible: checked }))}
                />
                <Label>前端可见</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label>启用状态</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!formData.name || !formData.displayName ||
                !formData.category}
            >
              创建标签
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑标签对话框 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑标签</DialogTitle>
            <DialogDescription>
              修改标签的信息和属性设置
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">标签名称 *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="英文标识名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-displayName">显示名称 *</Label>
                <Input
                  id="edit-displayName"
                  value={formData.displayName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))}
                  placeholder="中文显示名称"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">描述</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                placeholder="标签的详细描述"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">标签类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEHAVIOR">行为标签</SelectItem>
                    <SelectItem value="DEMOGRAPHIC">属性标签</SelectItem>
                    <SelectItem value="TRANSACTION">交易标签</SelectItem>
                    <SelectItem value="CUSTOM">自定义标签</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">分类 *</Label>
                <Input
                  id="edit-category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))}
                  placeholder="标签分类"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-subcategory">子分类</Label>
                <Input
                  id="edit-subcategory"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))}
                  placeholder="标签子分类"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priority">优先级</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: parseInt(e.target.value),
                    }))}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-color">颜色 *</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))}
                    className="w-20"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))}
                    placeholder="#3B82F6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-icon">图标</Label>
                <Input
                  id="edit-icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="🏷️"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-businessValue">商业价值</Label>
                <Input
                  id="edit-businessValue"
                  type="number"
                  step="0.1"
                  value={formData.businessValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      businessValue: parseFloat(e.target.value),
                    }))}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-validityPeriod">有效期 (天)</Label>
                <Input
                  id="edit-validityPeriod"
                  type="number"
                  value={formData.validityPeriod}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      validityPeriod: parseInt(e.target.value),
                    }))}
                  placeholder="0 (永久有效)"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isAutoAssigned}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      isAutoAssigned: checked,
                    }))}
                />
                <Label>自动分配</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isVisible}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isVisible: checked }))}
                />
                <Label>前端可见</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label>启用状态</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleUpdateTag}
              disabled={!formData.name || !formData.displayName ||
                !formData.category}
            >
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看标签详情对话框 */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>标签详情</DialogTitle>
            <DialogDescription>
              查看标签的详细信息和统计数据
            </DialogDescription>
          </DialogHeader>
          {selectedTag && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                {getTagBadge(selectedTag)}
                <div className="flex items-center space-x-2">
                  {selectedTag.isSystem && (
                    <Badge variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      系统标签
                    </Badge>
                  )}
                  {selectedTag.isAutoAssigned && (
                    <Badge variant="outline">
                      <Zap className="h-3 w-3 mr-1" />
                      自动分配
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    标签名称
                  </Label>
                  <div className="font-medium">{selectedTag.name}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    显示名称
                  </Label>
                  <div className="font-medium">{selectedTag.displayName}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">类型</Label>
                  <div>{getTagTypeBadge(selectedTag.type)}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">分类</Label>
                  <div className="font-medium">
                    {selectedTag.category}
                    {selectedTag.subcategory && (
                      <span className="text-muted-foreground">
                        / {selectedTag.subcategory}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    优先级
                  </Label>
                  <div className="font-medium">{selectedTag.priority}</div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    会员数量
                  </Label>
                  <div className="font-medium">
                    {formatNumber(selectedTag.memberCount)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    使用次数
                  </Label>
                  <div className="font-medium">
                    {formatNumber(selectedTag.usageCount)}
                  </div>
                </div>
                {selectedTag.businessValue && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      商业价值
                    </Label>
                    <div className="font-medium">
                      {selectedTag.businessValue.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {selectedTag.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">描述</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {selectedTag.description}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  创建时间: {formatDate(selectedTag.created)}
                </div>
                <div className="text-sm text-muted-foreground">
                  更新时间: {formatDate(selectedTag.updated)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              关闭
            </Button>
            {selectedTag && !selectedTag.isSystem && (
              <Button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEditTag(selectedTag);
                }}
              >
                编辑标签
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
