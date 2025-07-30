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
  ArrowUpDown,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  MapPin,
  Package,
  RefreshCcw,
  Search,
  ShoppingCart,
  Truck,
  XCircle,
} from "lucide-react";
import { GET_ADDRESS_USAGE_RECORDS } from "@/lib/graphql/queries/member-system";

// 类型定义
interface AddressSnapshot {
  name?: string;
  phone?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  address?: string;
  detailAddress?: string;
}

interface UsageRecordData {
  id: string;
  created: string;
  updated: string;
  addressId: string;
  userId: string;
  usageType: string;
  orderId?: string;
  addressSnapshot: AddressSnapshot;
  result: string;
  resultDetails?: string;
  metadata?: Record<string, unknown>;
}

interface QueryFilters {
  addressId?: string;
  userId?: string;
  usageType?: string;
  result?: string;
  orderId?: string;
}

export default function AddressUsagePage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QueryFilters>({});
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // GraphQL queries
  const {
    data: usageRecordsData,
    loading: usageRecordsLoading,
    refetch: refetchUsageRecords,
  } = useQuery(GET_ADDRESS_USAGE_RECORDS, {
    variables: {
      query: {
        pagination: {
          page: currentPage,
          perPage: pageSize,
          sortBy,
          sortOrder,
        },
        ...filters,
        includeAddress: true,
        includeUser: true,
        includeOrder: true,
      },
    },
    errorPolicy: "all",
  });

  // Data processing
  const usageRecords = usageRecordsData?.addressUsageRecords?.items || [];
  const pagination = usageRecordsData?.addressUsageRecords?.pagination;
  const stats = usageRecordsData?.addressUsageRecords?.stats;

  // Utility functions
  const getUsageTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      {
        label: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
        color: string;
      }
    > = {
      ORDER: { label: "订单", icon: ShoppingCart, color: "blue" },
      SHIPPING: { label: "配送", icon: Truck, color: "green" },
      BILLING: { label: "账单", icon: CreditCard, color: "purple" },
      OTHER: { label: "其他", icon: Package, color: "gray" },
    };

    const typeInfo = typeMap[type] ||
      { label: type, icon: Package, color: "gray" };
    const Icon = typeInfo.icon;

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {typeInfo.label}
      </Badge>
    );
  };

  const getResultBadge = (result: string) => {
    const resultMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      SUCCESS: { label: "成功", variant: "default" },
      FAILED: { label: "失败", variant: "destructive" },
      CANCELLED: { label: "取消", variant: "secondary" },
    };

    const resultInfo = resultMap[result] ||
      { label: result, variant: "secondary" as const };
    return <Badge variant={resultInfo.variant}>{resultInfo.label}</Badge>;
  };

  const getResultIcon = (result: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<React.SVGProps<SVGSVGElement>>
    > = {
      SUCCESS: CheckCircle,
      FAILED: XCircle,
      CANCELLED: Clock,
    };

    return iconMap[result] || Clock;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === "ASC"
      ? <ArrowUpDown className="h-4 w-4 rotate-180" />
      : <ArrowUpDown className="h-4 w-4" />;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  const formatAddress = (addressSnapshot: AddressSnapshot) => {
    if (!addressSnapshot) return "地址信息缺失";

    const parts = [
      addressSnapshot.province,
      addressSnapshot.city,
      addressSnapshot.district,
      addressSnapshot.street,
      addressSnapshot.address,
      addressSnapshot.detailAddress,
    ].filter(Boolean);

    return parts.join(" ");
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">使用记录</h1>
          <p className="text-muted-foreground">
            查看地址的使用历史和统计信息
          </p>
        </div>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总记录数</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRecords?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">成功使用</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.successfulUsage || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                成功率 {stats.totalRecords
                  ? ((stats.successfulUsage / stats.totalRecords) * 100)
                    .toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">失败使用</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.failedUsage || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                失败率 {stats.totalRecords
                  ? ((stats.failedUsage / stats.totalRecords) * 100).toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均使用</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.averageUsagePerAddress?.toFixed(1) || "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                每个地址平均使用次数
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">搜索筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>搜索订单</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>使用类型</Label>
              <Select
                value={filters.usageType || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    usageType: value === "all" ? undefined : value,
                  })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="ORDER">订单</SelectItem>
                  <SelectItem value="SHIPPING">配送</SelectItem>
                  <SelectItem value="BILLING">账单</SelectItem>
                  <SelectItem value="OTHER">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>使用结果</Label>
              <Select
                value={filters.result || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    result: value === "all" ? undefined : value,
                  })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择结果" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有结果</SelectItem>
                  <SelectItem value="SUCCESS">成功</SelectItem>
                  <SelectItem value="FAILED">失败</SelectItem>
                  <SelectItem value="CANCELLED">取消</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>地址ID</Label>
              <Input
                placeholder="地址ID"
                value={filters.addressId || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    addressId: e.target.value || undefined,
                  })}
              />
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => refetchUsageRecords()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用记录列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>使用记录</CardTitle>
              <CardDescription>
                共 {pagination?.totalItems || 0} 条使用记录
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {usageRecordsLoading
            ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            )
            : usageRecords.length === 0
            ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无使用记录</h3>
                <p className="text-muted-foreground">
                  没有找到符合条件的地址使用记录
                </p>
              </div>
            )
            : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>地址信息</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("usageType")}
                          className="p-0 h-auto font-medium"
                        >
                          使用类型
                          {getSortIcon("usageType")}
                        </Button>
                      </TableHead>
                      <TableHead>订单信息</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("result")}
                          className="p-0 h-auto font-medium"
                        >
                          使用结果
                          {getSortIcon("result")}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("created")}
                          className="p-0 h-auto font-medium"
                        >
                          使用时间
                          {getSortIcon("created")}
                        </Button>
                      </TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageRecords.map((record: UsageRecordData) => {
                      const ResultIcon = getResultIcon(record.result);
                      const addressSnapshot = record.addressSnapshot || {};

                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {addressSnapshot.name || "未知联系人"}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {addressSnapshot.phone || "无联系方式"}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 text-sm text-muted-foreground">
                                {formatAddress(addressSnapshot)}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground">
                                ID: {record.addressId}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getUsageTypeBadge(record.usageType)}
                          </TableCell>
                          <TableCell>
                            {record.orderId
                              ? (
                                <div className="flex items-center space-x-2">
                                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-mono text-sm">
                                    {record.orderId}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              )
                              : (
                                <span className="text-muted-foreground">-</span>
                              )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <ResultIcon
                                className={`h-4 w-4 ${
                                  record.result === "SUCCESS"
                                    ? "text-green-600"
                                    : record.result === "FAILED"
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              />
                              {getResultBadge(record.result)}
                            </div>
                            {record.resultDetails && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {record.resultDetails}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(record.created)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: {record.id.slice(0, 8)}...
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      显示 {(currentPage - 1) * pageSize + 1} 到{" "}
                      {Math.min(currentPage * pageSize, pagination.totalItems)}
                      {" "}
                      项， 共 {pagination.totalItems} 项
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        第 {currentPage} 页，共 {pagination.totalPages} 页
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNext}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
