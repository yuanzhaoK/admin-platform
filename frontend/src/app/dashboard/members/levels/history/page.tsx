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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Crown,
  Download,
  Eye,
  Filter,
  Search,
  Settings,
  TrendingDown,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import {
  GET_ALL_MEMBER_LEVELS,
  GET_LEVEL_UPGRADE_HISTORIES,
  GET_MEMBER_LEVEL_STATS,
} from "@/lib/graphql/queries/member-system";

interface UpgradeHistoryData {
  id: string;
  created: string;
  memberId: string;
  username: string;
  fromLevelId: string;
  fromLevelName: string;
  toLevelId: string;
  toLevelName: string;
  upgradeType: string;
  reason: string;
  conditions: Array<{
    type: string;
    value: number;
    satisfied: boolean;
  }>;
  operatorId?: string;
  operatorName?: string;
  upgradeTime: string;
  beforeSnapshot: {
    points: number;
    totalOrders: number;
    totalAmount: number;
  };
  afterSnapshot: {
    points: number;
    totalOrders: number;
    totalAmount: number;
  };
}

interface QueryFilters {
  search?: string;
  fromLevelId?: string;
  toLevelId?: string;
  upgradeType?: string;
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

export default function LevelUpgradeHistoryPage() {
  // State management
  const [filters, setFilters] = useState<QueryFilters>({
    pagination: {
      page: 1,
      perPage: 20,
      sortBy: "upgradeTime",
      sortOrder: "DESC",
    },
  });
  const [showFilters, setShowFilters] = useState(false);

  // GraphQL queries
  const {
    data: historyData,
    loading: historyLoading,
    refetch: refetchHistory,
  } = useQuery(GET_LEVEL_UPGRADE_HISTORIES, {
    variables: { query: filters },
    errorPolicy: "all",
  });

  const { data: statsData } = useQuery(GET_MEMBER_LEVEL_STATS, {
    errorPolicy: "all",
  });

  const { data: levelsData } = useQuery(GET_ALL_MEMBER_LEVELS, {
    errorPolicy: "all",
  });

  // Data processing
  const histories = historyData?.levelUpgradeHistories?.items || [];
  const pagination = historyData?.levelUpgradeHistories?.pagination;
  const historyStats = historyData?.levelUpgradeHistories?.stats;
  const levelStats = statsData?.memberLevelStats;
  const levels = levelsData?.allMemberLevels || [];

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
      [key]: value,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  };

  // Utility functions
  const getUpgradeTypeBadge = (type: string) => {
    const typeMap = {
      AUTO: {
        label: "自动升级",
        variant: "default" as const,
        icon: CheckCircle,
      },
      MANUAL: { label: "手动升级", variant: "secondary" as const, icon: User },
      ADMIN: {
        label: "管理员操作",
        variant: "outline" as const,
        icon: Settings,
      },
    };

    const typeInfo = typeMap[type as keyof typeof typeMap] || {
      label: type,
      variant: "default" as const,
      icon: CheckCircle,
    };

    const Icon = typeInfo.icon;

    return (
      <Badge variant={typeInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {typeInfo.label}
      </Badge>
    );
  };

  const getLevelBadge = (levelName: string, isFrom = false) => {
    const level = levels.find((l: any) => l.name === levelName);
    return (
      <Badge
        style={{
          backgroundColor: level?.color ? level.color + "20" : "#e5e7eb",
          color: level?.color || "#6b7280",
          borderColor: level?.color || "#d1d5db",
        }}
        variant="outline"
        className="flex items-center gap-1"
      >
        <Crown className="h-3 w-3" />
        {level?.displayName || levelName}
      </Badge>
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

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const getUpgradeDirection = (fromLevel: string, toLevel: string) => {
    const fromLevelData = levels.find((l: any) => l.name === fromLevel);
    const toLevelData = levels.find((l: any) => l.name === toLevel);

    if (!fromLevelData || !toLevelData) return null;

    return fromLevelData.level < toLevelData.level ? "upgrade" : "downgrade";
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">升级历史</h1>
          <p className="text-muted-foreground">
            查看会员等级变化记录和升级统计分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出记录
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总升级次数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyStats?.totalUpgrades?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              自动升级 {historyStats?.autoUpgrades || 0} 次
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">手动升级</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {historyStats?.manualUpgrades?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              管理员操作 {historyStats?.adminUpgrades || 0} 次
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日升级</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              较昨日 +25%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">升级率</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.5%</div>
            <p className="text-xs text-muted-foreground">
              本月升级成功率
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">搜索筛选</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "隐藏筛选" : "高级筛选"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基础搜索 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索会员用户名"
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
                <Label>原等级</Label>
                <Select
                  value={filters.fromLevelId || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "fromLevelId",
                      value === "all" ? undefined : value,
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择原等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有等级</SelectItem>
                    {levels.map((level: any) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>目标等级</Label>
                <Select
                  value={filters.toLevelId || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "toLevelId",
                      value === "all" ? undefined : value,
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择目标等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有等级</SelectItem>
                    {levels.map((level: any) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>升级类型</Label>
                <Select
                  value={filters.upgradeType || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "upgradeType",
                      value === "all" ? undefined : value,
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="AUTO">自动升级</SelectItem>
                    <SelectItem value="MANUAL">手动升级</SelectItem>
                    <SelectItem value="ADMIN">管理员操作</SelectItem>
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* 升级记录 */}
      <Tabs defaultValue="records" className="space-y-4">
        <TabsList>
          <TabsTrigger value="records">升级记录</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
          <TabsTrigger value="stats">等级统计</TabsTrigger>
        </TabsList>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>升级记录</CardTitle>
                  <CardDescription>
                    共 {pagination?.totalItems || 0} 条记录
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading
                ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
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
                : histories.length === 0
                ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无升级记录
                  </div>
                )
                : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>会员信息</TableHead>
                          <TableHead>等级变化</TableHead>
                          <TableHead>升级类型</TableHead>
                          <TableHead>数据快照</TableHead>
                          <TableHead>升级时间</TableHead>
                          <TableHead>操作员</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {histories.map((history: UpgradeHistoryData) => {
                          const direction = getUpgradeDirection(
                            history.fromLevelName,
                            history.toLevelName,
                          );
                          return (
                            <TableRow key={history.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {history.username?.[0]?.toUpperCase() ||
                                        "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">
                                      {history.username}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      ID: {history.memberId}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {getLevelBadge(history.fromLevelName, true)}
                                  {direction === "upgrade"
                                    ? (
                                      <ArrowUp className="h-4 w-4 text-green-600" />
                                    )
                                    : (
                                      <ArrowDown className="h-4 w-4 text-red-600" />
                                    )}
                                  {getLevelBadge(history.toLevelName)}
                                </div>
                              </TableCell>
                              <TableCell>
                                {getUpgradeTypeBadge(history.upgradeType)}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">
                                      积分:
                                    </span>
                                    <span>{history.beforeSnapshot.points}</span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">
                                      {history.afterSnapshot.points}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-muted-foreground">
                                      订单:
                                    </span>
                                    <span>
                                      {history.beforeSnapshot.totalOrders}
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <span className="font-medium">
                                      {history.afterSnapshot.totalOrders}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatDate(history.upgradeTime)}
                              </TableCell>
                              <TableCell className="text-sm">
                                {history.operatorName || "系统自动"}
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
                  </div>
                )}

              {/* 分页 */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    显示第 {(pagination.page - 1) * pagination.perPage + 1} -
                    {" "}
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
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>升级趋势分析</CardTitle>
              <CardDescription>升级数据的时间趋势和模式分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>趋势图表功能开发中...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>等级统计</CardTitle>
              <CardDescription>各等级的会员分布和升级情况</CardDescription>
            </CardHeader>
            <CardContent>
              {levelStats?.distribution
                ? (
                  <div className="space-y-4">
                    {levelStats.distribution.map((item: any) => (
                      <Card key={item.levelId}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getLevelBadge(item.levelName)}
                              <div>
                                <div className="font-medium">
                                  {item.memberCount} 位会员
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  占比 {item.percentage.toFixed(1)}%
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatCurrency(item.averageOrderValue)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                平均订单值
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )
                : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无统计数据
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
