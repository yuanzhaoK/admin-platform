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
import {
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
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
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import {
  ASSIGN_TAGS,
  GET_MEMBER_TAG_RELATIONS,
  GET_MEMBER_TAGS,
  REMOVE_TAGS,
} from "@/lib/graphql/queries/member-system";

interface RelationData {
  id: string;
  memberId: string;
  tagId: string;
  member: {
    id: string;
    profile: {
      username: string;
      avatar?: string;
      realName?: string;
    };
  };
  tag: {
    id: string;
    name: string;
    displayName: string;
    type: string;
    category: string;
    color: string;
    backgroundColor?: string;
    icon?: string;
  };
  assignedBy: string;
  assignedByUserId?: string;
  assignedReason?: string;
  assignedSource?: string;
  assignedAt: string;
  expiresAt?: string;
  lastUpdated: string;
  value?: string;
  properties?: Record<string, unknown>;
  isActive: boolean;
  confidence?: number;
}

interface QueryFilters {
  search: string;
  memberId: string;
  tagId: string;
  tagType: string;
  tagCategory: string;
  assignedBy: string;
  isActive: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  perPage: number;
}

interface TagData {
  id: string;
  name: string;
  displayName: string;
  type: string;
  category: string;
  color: string;
  isActive: boolean;
}

export default function TagRelationsPage() {
  const [filters, setFilters] = useState<QueryFilters>({
    search: "",
    memberId: "",
    tagId: "",
    tagType: "all",
    tagCategory: "all",
    assignedBy: "all",
    isActive: "all",
    sortBy: "assignedAt",
    sortOrder: "DESC",
    page: 1,
    perPage: 20,
  });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedRelation, setSelectedRelation] = useState<RelationData | null>(
    null,
  );

  const [assignFormData, setAssignFormData] = useState({
    memberIds: [] as string[],
    tagIds: [] as string[],
    assignedReason: "",
    assignedSource: "",
    value: "",
    expiresAt: "",
    confidence: 1.0,
  });

  // GraphQL queries and mutations
  const { data, loading, refetch } = useQuery(GET_MEMBER_TAG_RELATIONS, {
    variables: {
      query: {
        memberId: filters.memberId || undefined,
        tagId: filters.tagId ? [filters.tagId] : undefined,
        tagType: filters.tagType !== "all" ? [filters.tagType] : undefined,
        tagCategory: filters.tagCategory !== "all"
          ? [filters.tagCategory]
          : undefined,
        assignedBy: filters.assignedBy !== "all"
          ? filters.assignedBy
          : undefined,
        isActive: filters.isActive !== "all"
          ? filters.isActive === "true"
          : undefined,
        includeTag: true,
        includeMember: true,
        pagination: {
          page: filters.page,
          perPage: filters.perPage,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder as "ASC" | "DESC",
        },
      },
    },
    errorPolicy: "all",
  });

  const { data: tagsData } = useQuery(GET_MEMBER_TAGS, {
    variables: {
      query: {
        pagination: { page: 1, perPage: 100 },
        isActive: true,
      },
    },
    errorPolicy: "all",
  });

  const [assignTags] = useMutation(ASSIGN_TAGS, {
    onCompleted: () => {
      setIsAssignModalOpen(false);
      resetAssignForm();
      refetch();
    },
  });

  const [removeTags] = useMutation(REMOVE_TAGS, {
    onCompleted: () => {
      refetch();
    },
  });

  // Data processing
  const relations = data?.memberTagRelations?.items || [];
  const pagination = data?.memberTagRelations?.pagination;
  const stats = data?.memberTagRelations?.stats;
  const availableTags = tagsData?.memberTags?.items || [];

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

  const resetAssignForm = () => {
    setAssignFormData({
      memberIds: [],
      tagIds: [],
      assignedReason: "",
      assignedSource: "",
      value: "",
      expiresAt: "",
      confidence: 1.0,
    });
  };

  const handleAssignTags = async () => {
    try {
      await assignTags({
        variables: {
          input: {
            memberIds: assignFormData.memberIds,
            tagIds: assignFormData.tagIds,
            assignedReason: assignFormData.assignedReason || undefined,
            assignedSource: assignFormData.assignedSource || undefined,
            value: assignFormData.value || undefined,
            expiresAt: assignFormData.expiresAt
              ? new Date(assignFormData.expiresAt).toISOString()
              : undefined,
            confidence: assignFormData.confidence,
          },
        },
      });
    } catch (error) {
      console.error("Error assigning tags:", error);
    }
  };

  const handleRemoveRelation = async (
    memberIds: string[],
    tagIds: string[],
  ) => {
    if (window.confirm("确定要移除这个标签关系吗？此操作不可撤销。")) {
      try {
        await removeTags({
          variables: { memberIds, tagIds },
        });
      } catch (error) {
        console.error("Error removing tag relation:", error);
      }
    }
  };

  const handleViewRelation = (relation: RelationData) => {
    setSelectedRelation(relation);
    setIsViewModalOpen(true);
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

  const getAssignedByBadge = (assignedBy: string) => {
    const assignedByMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      SYSTEM: { label: "系统", variant: "default" },
      ADMIN: { label: "管理员", variant: "secondary" },
      API: { label: "API", variant: "outline" },
      IMPORT: { label: "导入", variant: "outline" },
    };

    const assignedByInfo = assignedByMap[assignedBy] ||
      { label: assignedBy, variant: "outline" as const };
    return (
      <Badge variant={assignedByInfo.variant}>{assignedByInfo.label}</Badge>
    );
  };

  const getTagBadge = (tag: RelationData["tag"]) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">标签关系管理</h1>
          <p className="text-muted-foreground">
            管理会员与标签的关联关系，支持批量分配和移除
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={() => setIsAssignModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            分配标签
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总关系数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRelations?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                活跃关系 {stats.activeRelations || 0} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">系统分配</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.systemAssigned?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                自动化率 {stats.totalRelations
                  ? ((stats.systemAssigned / stats.totalRelations) * 100)
                    .toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">手动分配</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.manualAssigned?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                占比 {stats.totalRelations
                  ? ((stats.manualAssigned / stats.totalRelations) * 100)
                    .toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均可信度</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.averageConfidence
                  ? `${(stats.averageConfidence * 100).toFixed(1)}%`
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                关系质量评分
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
              <Label>搜索会员</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="输入会员ID或用户名..."
                  value={filters.search}
                  onChange={(e) =>
                    handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>会员ID</Label>
              <Input
                placeholder="精确会员ID"
                value={filters.memberId}
                onChange={(e) => handleFilterChange("memberId", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>标签类型</Label>
              <Select
                value={filters.tagType}
                onValueChange={(value) => handleFilterChange("tagType", value)}
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
              <Label>分配方式</Label>
              <Select
                value={filters.assignedBy}
                onValueChange={(value) =>
                  handleFilterChange("assignedBy", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部方式</SelectItem>
                  <SelectItem value="SYSTEM">系统分配</SelectItem>
                  <SelectItem value="ADMIN">管理员分配</SelectItem>
                  <SelectItem value="API">API分配</SelectItem>
                  <SelectItem value="IMPORT">导入分配</SelectItem>
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
                  <SelectItem value="true">活跃</SelectItem>
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

      {/* 关系列表 */}
      <Card>
        <CardHeader>
          <CardTitle>标签关系列表</CardTitle>
          <CardDescription>
            {pagination &&
              `第 ${pagination.page} 页，共 ${pagination.totalPages} 页，总计 ${pagination.totalItems} 个关系`}
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
            : relations.length === 0
            ? (
              <div className="text-center py-12 text-muted-foreground">
                <Tag className="h-12 w-12 mx-auto mb-4" />
                <p>没有找到符合条件的标签关系</p>
                <Button
                  className="mt-4"
                  onClick={() => setIsAssignModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个关系
                </Button>
              </div>
            )
            : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>会员</TableHead>
                      <TableHead>标签</TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("assignedBy")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>分配方式</span>
                          {getSortIcon("assignedBy")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort("assignedAt")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>分配时间</span>
                          {getSortIcon("assignedAt")}
                        </div>
                      </TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>可信度</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relations.map((relation: RelationData) => (
                      <TableRow key={relation.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {relation.member.profile.username?.charAt(0)
                                  .toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">
                                {relation.member.profile.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {relation.member.profile.realName ||
                                  relation.member.id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {getTagBadge(relation.tag)}
                            {getTagTypeBadge(relation.tag.type)}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {relation.tag.category}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getAssignedByBadge(relation.assignedBy)}
                            {relation.assignedReason && (
                              <div className="text-xs text-muted-foreground">
                                {relation.assignedReason}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm">
                              {formatDate(relation.assignedAt)}
                            </div>
                            {relation.expiresAt && (
                              <div
                                className={`text-xs ${
                                  isExpired(relation.expiresAt)
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }`}
                              >
                                到期: {formatDate(relation.expiresAt)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={relation.isActive
                                ? "default"
                                : "secondary"}
                            >
                              {relation.isActive ? "活跃" : "禁用"}
                            </Badge>
                            {isExpired(relation.expiresAt) && (
                              <Badge variant="destructive" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                已过期
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {relation.confidence && (
                            <div className="flex items-center space-x-2">
                              <div className="w-12 h-2 bg-gray-200 rounded-full">
                                <div
                                  className="h-2 bg-blue-600 rounded-full"
                                  style={{
                                    width: `${relation.confidence * 100}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {(relation.confidence * 100).toFixed(0)}%
                              </span>
                            </div>
                          )}
                        </TableCell>
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
                                onClick={() => handleViewRelation(relation)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRemoveRelation([relation.memberId], [
                                    relation.tagId,
                                  ])}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                移除关系
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

      {/* 分配标签对话框 */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>分配标签</DialogTitle>
            <DialogDescription>
              为会员分配标签，支持批量操作
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="memberIds">会员ID列表 *</Label>
              <Input
                id="memberIds"
                placeholder="输入会员ID，多个用逗号分隔"
                value={assignFormData.memberIds.join(",")}
                onChange={(e) =>
                  setAssignFormData((prev) => ({
                    ...prev,
                    memberIds: e.target.value.split(",").map((id) => id.trim())
                      .filter((id) => id),
                  }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagIds">选择标签 *</Label>
              <Select
                value={assignFormData.tagIds[0] || ""}
                onValueChange={(value) =>
                  setAssignFormData((prev) => ({
                    ...prev,
                    tagIds: value ? [value] : [],
                  }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择要分配的标签" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map((tag: TagData) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      {tag.displayName} ({tag.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignedReason">分配原因</Label>
                <Input
                  id="assignedReason"
                  value={assignFormData.assignedReason}
                  onChange={(e) =>
                    setAssignFormData((prev) => ({
                      ...prev,
                      assignedReason: e.target.value,
                    }))}
                  placeholder="为什么分配这个标签"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedSource">分配来源</Label>
                <Input
                  id="assignedSource"
                  value={assignFormData.assignedSource}
                  onChange={(e) =>
                    setAssignFormData((prev) => ({
                      ...prev,
                      assignedSource: e.target.value,
                    }))}
                  placeholder="如：活动、行为分析等"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">标签值</Label>
                <Input
                  id="value"
                  value={assignFormData.value}
                  onChange={(e) =>
                    setAssignFormData((prev) => ({
                      ...prev,
                      value: e.target.value,
                    }))}
                  placeholder="可选的标签参数值"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">过期时间</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={assignFormData.expiresAt}
                  onChange={(e) =>
                    setAssignFormData((prev) => ({
                      ...prev,
                      expiresAt: e.target.value,
                    }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">
                可信度 ({assignFormData.confidence})
              </Label>
              <input
                id="confidence"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={assignFormData.confidence}
                onChange={(e) =>
                  setAssignFormData((prev) => ({
                    ...prev,
                    confidence: parseFloat(e.target.value),
                  }))}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleAssignTags}
              disabled={assignFormData.memberIds.length === 0 ||
                assignFormData.tagIds.length === 0}
            >
              分配标签
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 查看关系详情对话框 */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>标签关系详情</DialogTitle>
            <DialogDescription>
              查看会员与标签的关系详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedRelation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      会员信息
                    </Label>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {selectedRelation.member.profile.username?.charAt(0)
                            .toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {selectedRelation.member.profile.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedRelation.member.profile.realName ||
                            selectedRelation.member.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      标签信息
                    </Label>
                    <div className="mt-2 space-y-2">
                      {getTagBadge(selectedRelation.tag)}
                      <div className="flex items-center space-x-2">
                        {getTagTypeBadge(selectedRelation.tag.type)}
                        <Badge variant="outline" className="text-xs">
                          {selectedRelation.tag.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    分配方式
                  </Label>
                  <div className="mt-1">
                    {getAssignedByBadge(selectedRelation.assignedBy)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    分配时间
                  </Label>
                  <div className="mt-1 font-medium">
                    {formatDate(selectedRelation.assignedAt)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">状态</Label>
                  <div className="mt-1">
                    <Badge
                      variant={selectedRelation.isActive
                        ? "default"
                        : "secondary"}
                    >
                      {selectedRelation.isActive ? "活跃" : "禁用"}
                    </Badge>
                  </div>
                </div>
                {selectedRelation.expiresAt && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      过期时间
                    </Label>
                    <div
                      className={`mt-1 font-medium ${
                        isExpired(selectedRelation.expiresAt)
                          ? "text-red-500"
                          : ""
                      }`}
                    >
                      {formatDate(selectedRelation.expiresAt)}
                      {isExpired(selectedRelation.expiresAt) && " (已过期)"}
                    </div>
                  </div>
                )}
              </div>

              {selectedRelation.assignedReason && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    分配原因
                  </Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {selectedRelation.assignedReason}
                  </div>
                </div>
              )}

              {selectedRelation.value && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    标签值
                  </Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {selectedRelation.value}
                  </div>
                </div>
              )}

              {selectedRelation.confidence && (
                <div>
                  <Label className="text-sm text-muted-foreground">
                    可信度
                  </Label>
                  <div className="mt-2 flex items-center space-x-3">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-2 bg-blue-600 rounded-full"
                        style={{
                          width: `${selectedRelation.confidence * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(selectedRelation.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  更新时间: {formatDate(selectedRelation.lastUpdated)}
                </div>
                <div className="text-sm text-muted-foreground">
                  ID: {selectedRelation.id}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              关闭
            </Button>
            {selectedRelation && (
              <Button
                variant="destructive"
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleRemoveRelation([selectedRelation.memberId], [
                    selectedRelation.tagId,
                  ]);
                }}
              >
                移除关系
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
