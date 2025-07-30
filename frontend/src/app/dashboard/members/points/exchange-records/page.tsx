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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowUpDown,
  CheckCircle,
  Clock,
  Coins,
  CreditCard,
  Download,
  Eye,
  Gift,
  MoreHorizontal,
  Package,
  RefreshCcw,
  Search,
  ShoppingBag,
  Star,
  Ticket,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  GET_EXCHANGE_RECORDS,
  UPDATE_EXCHANGE_RECORD_STATUS,
} from "@/lib/graphql/queries/member-system";

interface ExchangeRecordData {
  id: string;
  created: string;
  updated: string;
  userId: string;
  username?: string;
  userAvatar?: string;
  exchangeId: string;
  exchangeName: string;
  exchangeType: string;
  pointsSpent: number;
  rewardValue?: number;
  status: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  deliveryInfo?: {
    address?: string;
    phone?: string;
    trackingNumber?: string;
    deliveryStatus?: string;
  };
}

interface QueryFilters {
  search?: string;
  userId?: string;
  exchangeType?: string;
  status?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  pagination: {
    page: number;
    perPage: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  };
}

export default function ExchangeRecordsPage() {
  // State management
  const [filters, setFilters] = useState<QueryFilters>({
    pagination: { page: 1, perPage: 20, sortBy: "created", sortOrder: "DESC" },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<
    ExchangeRecordData | null
  >(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // GraphQL queries and mutations
  const {
    data: recordsData,
    loading: recordsLoading,
    refetch: refetchRecords,
  } = useQuery(GET_EXCHANGE_RECORDS, {
    variables: { query: filters },
    errorPolicy: "all",
  });

  const [updateRecordStatus] = useMutation(UPDATE_EXCHANGE_RECORD_STATUS, {
    onCompleted: () => {
      refetchRecords();
      setStatusDialogOpen(false);
      setSelectedRecord(null);
      setNewStatus("");
    },
  });

  // Data processing
  const records = recordsData?.exchangeRecords?.items || [];
  const pagination = recordsData?.exchangeRecords?.pagination;
  const stats = recordsData?.exchangeRecords?.stats;

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
        sortOrder:
          prev.pagination.sortBy === field &&
            prev.pagination.sortOrder === "ASC"
            ? "DESC"
            : "ASC",
        page: 1,
      },
    }));
  };

  const handleViewDetail = (record: ExchangeRecordData) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const handleUpdateStatus = (record: ExchangeRecordData, status: string) => {
    setSelectedRecord(record);
    setNewStatus(status);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedRecord && newStatus) {
      updateRecordStatus({
        variables: {
          id: selectedRecord.id,
          status: newStatus,
          notes: `状态更新为: ${getStatusLabel(newStatus)}`,
        },
      });
    }
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
  const getExchangeTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      {
        label: string;
        color: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      }
    > = {
      BALANCE: {
        label: "余额充值",
        color: "bg-green-100 text-green-800",
        icon: Wallet,
      },
      COUPON: {
        label: "优惠券",
        color: "bg-red-100 text-red-800",
        icon: Ticket,
      },
      PRODUCT: {
        label: "实物商品",
        color: "bg-blue-100 text-blue-800",
        icon: Package,
      },
      SERVICE: {
        label: "服务权益",
        color: "bg-purple-100 text-purple-800",
        icon: Star,
      },
      CARD: {
        label: "卡券",
        color: "bg-yellow-100 text-yellow-800",
        icon: CreditCard,
      },
      CUSTOM: {
        label: "自定义",
        color: "bg-gray-100 text-gray-800",
        icon: Gift,
      },
    };

    const typeInfo = typeMap[type] ||
      { label: type, color: "bg-gray-100 text-gray-800", icon: Gift };
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
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      }
    > = {
      PENDING: { label: "待处理", variant: "secondary", icon: Clock },
      PROCESSING: { label: "处理中", variant: "outline", icon: RefreshCcw },
      COMPLETED: { label: "已完成", variant: "default", icon: CheckCircle },
      DELIVERED: { label: "已发货", variant: "default", icon: Package },
      FAILED: { label: "失败", variant: "destructive", icon: XCircle },
      CANCELLED: { label: "已取消", variant: "outline", icon: XCircle },
      REFUNDED: { label: "已退款", variant: "secondary", icon: RefreshCcw },
    };

    const statusInfo = statusMap[status] ||
      { label: status, variant: "outline" as const, icon: Clock };
    const Icon = statusInfo.icon;

    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: "待处理",
      PROCESSING: "处理中",
      COMPLETED: "已完成",
      DELIVERED: "已发货",
      FAILED: "失败",
      CANCELLED: "已取消",
      REFUNDED: "已退款",
    };
    return statusMap[status] || status;
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

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
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
          <h1 className="text-2xl font-bold tracking-tight">兑换记录</h1>
          <p className="text-muted-foreground">
            查看和管理所有积分兑换记录
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
              <CardTitle className="text-sm font-medium">总兑换次数</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
              <CardTitle className="text-sm font-medium">积分消耗</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalPointsSpent?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                今日消耗 {stats.todayPointsSpent?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">完成率</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.completionRate?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                成功兑换率
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
                  placeholder="搜索用户名或商品名称"
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
                <Label>兑换类型</Label>
                <Select
                  value={filters.exchangeType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "exchangeType",
                      value === "all" ? undefined : value,
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="BALANCE">余额充值</SelectItem>
                    <SelectItem value="COUPON">优惠券</SelectItem>
                    <SelectItem value="PRODUCT">实物商品</SelectItem>
                    <SelectItem value="SERVICE">服务权益</SelectItem>
                    <SelectItem value="CARD">卡券</SelectItem>
                    <SelectItem value="CUSTOM">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>状态</Label>
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
                    <SelectItem value="PENDING">待处理</SelectItem>
                    <SelectItem value="PROCESSING">处理中</SelectItem>
                    <SelectItem value="COMPLETED">已完成</SelectItem>
                    <SelectItem value="DELIVERED">已发货</SelectItem>
                    <SelectItem value="FAILED">失败</SelectItem>
                    <SelectItem value="CANCELLED">已取消</SelectItem>
                    <SelectItem value="REFUNDED">已退款</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="space-y-2">
                <Label>用户ID</Label>
                <Input
                  placeholder="搜索特定用户"
                  value={filters.userId || ""}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 兑换记录表格 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>兑换记录</CardTitle>
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
                暂无兑换记录
              </div>
            )
            : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>用户信息</TableHead>
                      <TableHead>兑换商品</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("pointsSpent")}
                          className="flex items-center gap-1"
                        >
                          积分消耗
                          {getSortIcon("pointsSpent")}
                        </Button>
                      </TableHead>
                      <TableHead>价值</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("created")}
                          className="flex items-center gap-1"
                        >
                          兑换时间
                          {getSortIcon("created")}
                        </Button>
                      </TableHead>
                      <TableHead>处理时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record: ExchangeRecordData) => (
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
                          <div
                            className="max-w-32 truncate"
                            title={record.exchangeName}
                          >
                            {record.exchangeName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getExchangeTypeBadge(record.exchangeType)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-orange-600">
                            {record.pointsSpent.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          {record.rewardValue
                            ? (
                              <span className="font-medium">
                                {formatCurrency(record.rewardValue)}
                              </span>
                            )
                            : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(record.status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(record.created)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {record.processedAt
                            ? formatDate(record.processedAt)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewDetail(record)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {record.status === "PENDING" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUpdateStatus(record, "PROCESSING")}
                                >
                                  <RefreshCcw className="mr-2 h-4 w-4" />
                                  标记为处理中
                                </DropdownMenuItem>
                              )}
                              {record.status === "PROCESSING" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(record, "COMPLETED")}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    标记为已完成
                                  </DropdownMenuItem>
                                  {record.exchangeType === "PRODUCT" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleUpdateStatus(record, "DELIVERED")}
                                    >
                                      <Package className="mr-2 h-4 w-4" />
                                      标记为已发货
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {["PENDING", "PROCESSING"].includes(
                                record.status,
                              ) && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(record, "FAILED")}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    标记为失败
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleUpdateStatus(record, "CANCELLED")}
                                    className="text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    取消兑换
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <DialogTitle>兑换记录详情</DialogTitle>
            <DialogDescription>
              查看兑换的详细信息和处理状态
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
                  <Label className="text-muted-foreground">兑换商品</Label>
                  <div className="mt-1 font-medium">
                    {selectedRecord.exchangeName}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">商品类型</Label>
                  <div className="mt-1">
                    {getExchangeTypeBadge(selectedRecord.exchangeType)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">积分消耗</Label>
                  <div className="text-lg font-semibold mt-1 text-orange-600">
                    {selectedRecord.pointsSpent.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">商品价值</Label>
                  <div className="text-lg font-semibold mt-1">
                    {selectedRecord.rewardValue
                      ? formatCurrency(selectedRecord.rewardValue)
                      : "-"}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">兑换时间</Label>
                  <div className="mt-1">
                    {formatDate(selectedRecord.created)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">处理时间</Label>
                  <div className="mt-1">
                    {selectedRecord.processedAt
                      ? formatDate(selectedRecord.processedAt)
                      : "未处理"}
                  </div>
                </div>
              </div>

              {/* 处理信息 */}
              {selectedRecord.processedBy && (
                <div>
                  <Label className="text-muted-foreground">处理人</Label>
                  <p className="mt-1">{selectedRecord.processedBy}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div>
                  <Label className="text-muted-foreground">处理备注</Label>
                  <p className="mt-1">{selectedRecord.notes}</p>
                </div>
              )}

              {/* 配送信息 */}
              {selectedRecord.deliveryInfo && (
                <div className="space-y-3">
                  <Label className="text-muted-foreground">配送信息</Label>
                  <div className="p-3 bg-gray-50 rounded-md space-y-2">
                    {selectedRecord.deliveryInfo.address && (
                      <div>
                        <span className="font-medium">收货地址:</span>
                        {selectedRecord.deliveryInfo.address}
                      </div>
                    )}
                    {selectedRecord.deliveryInfo.phone && (
                      <div>
                        <span className="font-medium">联系电话:</span>
                        {selectedRecord.deliveryInfo.phone}
                      </div>
                    )}
                    {selectedRecord.deliveryInfo.trackingNumber && (
                      <div>
                        <span className="font-medium">快递单号:</span>
                        {selectedRecord.deliveryInfo.trackingNumber}
                      </div>
                    )}
                    {selectedRecord.deliveryInfo.deliveryStatus && (
                      <div>
                        <span className="font-medium">配送状态:</span>
                        {selectedRecord.deliveryInfo.deliveryStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}

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

      {/* 状态更新确认对话框 */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认状态更新</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要将兑换记录状态更新为 "{getStatusLabel(newStatus)}" 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusUpdate}>
              确认更新
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
