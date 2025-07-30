"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ArrowUpDown,
  Coins,
  Download,
  Eye,
  Filter,
  Gift,
  RefreshCcw,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { GET_POINTS_RECORDS } from "@/lib/graphql/queries/member-system";

interface PointsRecordData {
  id: string;
  created: string;
  updated: string;
  userId: string;
  username?: string;
  userAvatar?: string;
  type: string;
  points: number;
  reason: string;
  description?: string;
  balance: number;
  ruleId?: string;
  ruleName?: string;
  orderId?: string;
  exchangeId?: string;
  operatorId?: string;
  operatorName?: string;
  metadata?: Record<string, unknown>;
  status: string;
  expiresAt?: string;
}

interface QueryFilters {
  search?: string;
  userId?: string;
  type?: string;
  status?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  minPoints?: number;
  maxPoints?: number;
  pagination: {
    page: number;
    perPage: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  };
}

export default function PointsRecordsPage() {
  // State management
  const [filters, setFilters] = useState<QueryFilters>({
    pagination: { page: 1, perPage: 20, sortBy: "created", sortOrder: "DESC" },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PointsRecordData | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // GraphQL queries
  const {
    data: recordsData,
    loading: recordsLoading,
    refetch: refetchRecords,
  } = useQuery(GET_POINTS_RECORDS, {
    variables: { query: filters },
    errorPolicy: "all",
  });

  // Data processing
  const records = recordsData?.pointsRecords?.items || [];
  const pagination = recordsData?.pointsRecords?.pagination;
  const stats = recordsData?.pointsRecords?.stats;

  // Event handlers
  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  };

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        sortBy: field,
        sortOrder: prev.pagination.sortBy === field &&
            prev.pagination.sortOrder === "ASC"
          ? "DESC"
          : "ASC",
        page: 1,
      },
    }));
  };

  const handleViewDetail = (record: PointsRecordData) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      pagination: {
        page: 1,
        perPage: 20,
        sortBy: "created",
        sortOrder: "DESC",
      },
    });
  };

  // Utility functions
  const getPointsTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      {
        label: string;
        color: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      }
    > = {
      EARNED_REGISTRATION: {
        label: "注册奖励",
        color: "bg-blue-100 text-blue-800",
        icon: User,
      },
      EARNED_LOGIN: {
        label: "登录奖励",
        color: "bg-green-100 text-green-800",
        icon: Star,
      },
      EARNED_ORDER: {
        label: "订单奖励",
        color: "bg-purple-100 text-purple-800",
        icon: Star,
      },
      EARNED_ADMIN: {
        label: "管理员增加",
        color: "bg-orange-100 text-orange-800",
        icon: Star,
      },
      SPENT_EXCHANGE: {
        label: "积分兑换",
        color: "bg-red-100 text-red-800",
        icon: Gift,
      },
      SPENT_ORDER: {
        label: "订单抵扣",
        color: "bg-red-100 text-red-800",
        icon: Star,
      },
      EXPIRED: {
        label: "积分过期",
        color: "bg-gray-100 text-gray-800",
        icon: X,
      },
      FROZEN: {
        label: "积分冻结",
        color: "bg-yellow-100 text-yellow-800",
        icon: X,
      },
      UNFROZEN: {
        label: "积分解冻",
        color: "bg-green-100 text-green-800",
        icon: RefreshCcw,
      },
    };

    const typeInfo = typeMap[type] ||
      { label: type, color: "bg-gray-100 text-gray-800", icon: Star };
    const Icon = typeInfo.icon;

    return (
      <Badge className={`${typeInfo.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {typeInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      {
        label: string;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      COMPLETED: { label: "已完成", variant: "default" },
      PENDING: { label: "处理中", variant: "secondary" },
      FAILED: { label: "失败", variant: "destructive" },
      CANCELLED: { label: "已取消", variant: "outline" },
    };

    const statusInfo = statusMap[status] ||
      { label: status, variant: "outline" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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

  const getSortIcon = (field: string) => {
    if (filters.pagination.sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return filters.pagination.sortOrder === "ASC"
      ? <TrendingUp className="h-4 w-4" />
      : <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">积分记录</h1>
          <p className="text-muted-foreground">
            查看所有积分变化记录和详细信息
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchRecords()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总记录数</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRecords?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                今日新增 {stats.todayRecords || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">积分发放</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{stats.totalEarned?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                今日发放 +{stats.todayEarned?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">积分消费</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{stats.totalSpent?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                今日消费 -{stats.todaySpent?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.activeUsers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                今日活跃 {stats.todayActiveUsers || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">搜索筛选</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "隐藏筛选" : "高级筛选"}
              </Button>
              {Object.keys(filters).length > 1 && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  清除筛选
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基础搜索 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名或ID"
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* 高级筛选 */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>积分类型</Label>
                <Select
                  value={filters.type || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "type",
                      value === "all" ? undefined : value,
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="EARNED_REGISTRATION">
                      注册奖励
                    </SelectItem>
                    <SelectItem value="EARNED_LOGIN">登录奖励</SelectItem>
                    <SelectItem value="EARNED_ORDER">订单奖励</SelectItem>
                    <SelectItem value="EARNED_ADMIN">管理员增加</SelectItem>
                    <SelectItem value="SPENT_EXCHANGE">积分兑换</SelectItem>
                    <SelectItem value="SPENT_ORDER">订单抵扣</SelectItem>
                    <SelectItem value="EXPIRED">积分过期</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>记录状态</Label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "status",
                      value === "all" ? undefined : value,
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="COMPLETED">已完成</SelectItem>
                    <SelectItem value="PENDING">处理中</SelectItem>
                    <SelectItem value="FAILED">失败</SelectItem>
                    <SelectItem value="CANCELLED">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>积分范围</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="最小"
                    value={filters.minPoints || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "minPoints",
                        e.target.value ? Number(e.target.value) : undefined,
                      )}
                  />
                  <Input
                    type="number"
                    placeholder="最大"
                    value={filters.maxPoints || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "maxPoints",
                        e.target.value ? Number(e.target.value) : undefined,
                      )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>时间范围</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="选择时间" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有时间</SelectItem>
                    <SelectItem value="today">今天</SelectItem>
                    <SelectItem value="week">本周</SelectItem>
                    <SelectItem value="month">本月</SelectItem>
                    <SelectItem value="quarter">本季度</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 积分记录表格 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>积分记录</CardTitle>
              <CardDescription>
                共 {pagination?.totalItems || 0} 条记录
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recordsLoading
            ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )
            : records.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无积分记录
              </div>
            )
            : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户信息</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("type")}
                          className="flex items-center gap-1"
                        >
                          积分类型
                          {getSortIcon("type")}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("points")}
                          className="flex items-center gap-1"
                        >
                          积分变动
                          {getSortIcon("points")}
                        </Button>
                      </TableHead>
                      <TableHead>余额</TableHead>
                      <TableHead>原因</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("created")}
                          className="flex items-center gap-1"
                        >
                          时间
                          {getSortIcon("created")}
                        </Button>
                      </TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record: PointsRecordData) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={record.userAvatar} />
                              <AvatarFallback>
                                {record.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {record.username || "未知用户"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {record.userId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPointsTypeBadge(record.type)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              record.points > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {record.points > 0 ? "+" : ""}
                            {record.points.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div
                            className="max-w-32 truncate"
                            title={record.reason}
                          >
                            {record.reason}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(record.created)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewDetail(record)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

          {/* 分页 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                显示第 {(pagination.page - 1) * pagination.perPage + 1} -{" "}
                {Math.min(
                  pagination.page * pagination.perPage,
                  pagination.totalItems,
                )} 项，共 {pagination.totalItems} 项
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  上一页
                </Button>
                <div className="text-sm">
                  第 {pagination.page} / {pagination.totalPages} 页
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>积分记录详情</DialogTitle>
            <DialogDescription>
              查看积分变化的详细信息
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">用户信息</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedRecord.userAvatar} />
                      <AvatarFallback>
                        {selectedRecord.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {selectedRecord.username || "未知用户"}
                    </span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">积分类型</Label>
                  <div className="mt-1">
                    {getPointsTypeBadge(selectedRecord.type)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">积分变动</Label>
                  <div
                    className={`text-lg font-semibold mt-1 ${
                      selectedRecord.points > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedRecord.points > 0 ? "+" : ""}
                    {selectedRecord.points.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">变动后余额</Label>
                  <div className="text-lg font-semibold mt-1">
                    {selectedRecord.balance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">创建时间</Label>
                  <div className="mt-1">
                    {formatDate(selectedRecord.created)}
                  </div>
                </div>
              </div>

              {/* 详细信息 */}
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">变动原因</Label>
                  <p className="mt-1">{selectedRecord.reason}</p>
                </div>
                {selectedRecord.description && (
                  <div>
                    <Label className="text-muted-foreground">详细描述</Label>
                    <p className="mt-1">{selectedRecord.description}</p>
                  </div>
                )}
                {selectedRecord.ruleName && (
                  <div>
                    <Label className="text-muted-foreground">关联规则</Label>
                    <p className="mt-1">{selectedRecord.ruleName}</p>
                  </div>
                )}
                {selectedRecord.operatorName && (
                  <div>
                    <Label className="text-muted-foreground">操作员</Label>
                    <p className="mt-1">{selectedRecord.operatorName}</p>
                  </div>
                )}
                {selectedRecord.expiresAt && (
                  <div>
                    <Label className="text-muted-foreground">过期时间</Label>
                    <p className="mt-1">
                      {formatDate(selectedRecord.expiresAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* 元数据 */}
              {selectedRecord.metadata &&
                Object.keys(selectedRecord.metadata).length > 0 && (
                <div>
                  <Label className="text-muted-foreground">元数据</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <pre className="text-sm">
                      {JSON.stringify(selectedRecord.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
