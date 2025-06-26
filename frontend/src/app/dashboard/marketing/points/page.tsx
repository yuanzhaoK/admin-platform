"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  DELETE_POINTS_EXCHANGE,
  DELETE_POINTS_RULE,
  EXPORT_POINTS_RECORDS,
  GET_POINTS_EXCHANGES,
  GET_POINTS_RECORDS,
  GET_POINTS_RULES,
  GET_POINTS_STATS,
  type PointsExchangeQueryInput,
  type PointsRecordQueryInput,
  type PointsRuleQueryInput,
} from "@/lib/graphql/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  Edit,
  Plus,
  RefreshCw,
  Settings,
  Star,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import PointsRuleModal from "@/components/points/PointsRuleModal";
import PointsExchangeModal from "@/components/points/PointsExchangeModal";
import PointsAdjustmentModal from "@/components/points/PointsAdjustmentModal";
import PointsRecordFilter, {
  type PointsRecordFilterOptions,
} from "@/components/points/PointsRecordFilter";

// 定义类型接口
interface PointsRule {
  id: string;
  name: string;
  description?: string;
  type: string;
  points: number;
  is_active: boolean;
  daily_limit?: number;
  total_limit?: number;
  sort_order: number;
  created: string;
}

interface PointsExchange {
  id: string;
  name: string;
  description?: string;
  image?: string;
  points_required: number;
  exchange_type: string;
  reward_value?: number;
  stock?: number;
  used_count: number;
  status: string;
  sort_order: number;
  created: string;
}

interface PointsRecord {
  id: string;
  user_id: string;
  username: string;
  type: string;
  points: number;
  balance: number;
  reason: string;
  created: string;
}

export default function PointsPage() {
  const [selectedTab, setSelectedTab] = useState("rules");

  // 模态框状态
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [adjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PointsRule | undefined>();
  const [editingExchange, setEditingExchange] = useState<
    PointsExchange | undefined
  >();

  // 筛选状态
  const [recordFilters, setRecordFilters] = useState<PointsRecordFilterOptions>(
    {
      sort_by: "created",
      sort_order: "desc",
    },
  );

  // GraphQL查询
  const { data: statsData, loading: statsLoading, refetch: refetchStats } =
    useQuery(GET_POINTS_STATS);
  const { data: rulesData, loading: rulesLoading, refetch: refetchRules } =
    useQuery(GET_POINTS_RULES, {
      variables: {
        input: {
          page: 1,
          perPage: 20,
          sortBy: "created",
          sortOrder: "desc",
        } as PointsRuleQueryInput,
      },
    });
  const {
    data: exchangesData,
    loading: exchangesLoading,
    refetch: refetchExchanges,
  } = useQuery(GET_POINTS_EXCHANGES, {
    variables: {
      input: {
        page: 1,
        perPage: 20,
        sortBy: "created",
        sortOrder: "desc",
      } as PointsExchangeQueryInput,
    },
  });
  const {
    data: recordsData,
    loading: recordsLoading,
    refetch: refetchRecords,
  } = useQuery(GET_POINTS_RECORDS, {
    variables: {
      input: {
        page: 1,
        perPage: 20,
        sortBy: "created",
        sortOrder: "desc",
      } as PointsRecordQueryInput,
    },
  });

  // Mutations
  const [deleteRule] = useMutation(DELETE_POINTS_RULE, {
    onCompleted: () => refetchRules(),
  });
  const [deleteExchange] = useMutation(DELETE_POINTS_EXCHANGE, {
    onCompleted: () => refetchExchanges(),
  });
  const [exportRecords, { loading: exportLoading }] = useMutation(
    EXPORT_POINTS_RECORDS,
  );

  const getTypeDisplay = (type: string) => {
    const typeMap = {
      earned_registration: {
        label: "注册奖励",
        color: "bg-purple-100 text-purple-800",
      },
      earned_login: { label: "签到奖励", color: "bg-blue-100 text-blue-800" },
      earned_order: { label: "消费奖励", color: "bg-green-100 text-green-800" },
      earned_review: {
        label: "评价奖励",
        color: "bg-orange-100 text-orange-800",
      },
      earned_referral: {
        label: "推荐奖励",
        color: "bg-pink-100 text-pink-800",
      },
      spent_exchange: { label: "积分兑换", color: "bg-red-100 text-red-800" },
      admin_adjust: { label: "管理员调整", color: "bg-gray-100 text-gray-800" },
    };
    const config = typeMap[type as keyof typeof typeMap] ||
      { label: type, color: "bg-gray-100 text-gray-800" };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getExchangeTypeBadge = (type: string) => {
    const typeMap = {
      balance: { label: "余额", color: "bg-green-100 text-green-800" },
      coupon: { label: "优惠券", color: "bg-blue-100 text-blue-800" },
      product: { label: "商品", color: "bg-purple-100 text-purple-800" },
      privilege: { label: "特权", color: "bg-yellow-100 text-yellow-800" },
    };
    const config = typeMap[type as keyof typeof typeMap] || typeMap.balance;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "有效", color: "bg-green-100 text-green-800" },
      inactive: { label: "无效", color: "bg-gray-100 text-gray-800" },
      out_of_stock: { label: "库存不足", color: "bg-red-100 text-red-800" },
    };
    const config = statusMap[status as keyof typeof statusMap] ||
      statusMap.inactive;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // 处理数据和事件
  const handleDeleteRule = async (id: string) => {
    if (confirm("确定要删除这个积分规则吗？")) {
      try {
        await deleteRule({ variables: { id } });
      } catch (error) {
        console.error("删除规则失败:", error);
      }
    }
  };

  const handleDeleteExchange = async (id: string) => {
    if (confirm("确定要删除这个兑换项吗？")) {
      try {
        await deleteExchange({ variables: { id } });
      } catch (error) {
        console.error("删除兑换项失败:", error);
      }
    }
  };

  const handleRefresh = () => {
    refetchStats();
    refetchRules();
    refetchExchanges();
    refetchRecords();
  };

  // 模态框处理函数
  const handleCreateRule = () => {
    setEditingRule(undefined);
    setRuleModalOpen(true);
  };

  const handleEditRule = (rule: PointsRule) => {
    setEditingRule(rule);
    setRuleModalOpen(true);
  };

  const handleCreateExchange = () => {
    setEditingExchange(undefined);
    setExchangeModalOpen(true);
  };

  const handleEditExchange = (exchange: PointsExchange) => {
    setEditingExchange(exchange);
    setExchangeModalOpen(true);
  };

  const handleModalSuccess = () => {
    handleRefresh();
  };

  // 筛选处理函数
  const handleRecordFilter = (filters: PointsRecordFilterOptions) => {
    setRecordFilters(filters);
    // 更新积分记录查询参数
    refetchRecords({
      input: {
        page: 1,
        perPage: 20,
        username: filters.username,
        user_id: filters.user_id,
        type: filters.type,
        sortBy: filters.sort_by || "created",
        sortOrder: filters.sort_order || "desc",
      } as PointsRecordQueryInput,
    });
  };

  // 导出处理函数
  const handleExportRecords = async (filters: PointsRecordFilterOptions) => {
    try {
      const result = await exportRecords({
        variables: {
          input: {
            username: filters.username,
            user_id: filters.user_id,
            type: filters.type,
            points_min: filters.points_min,
            points_max: filters.points_max,
            date_from: filters.date_from,
            date_to: filters.date_to,
            sortBy: filters.sort_by || "created",
            sortOrder: filters.sort_order || "desc",
          },
        },
      });

      if (result.data?.exportPointsRecords) {
        const exportData = result.data.exportPointsRecords;
        downloadCSV(exportData);
      }
    } catch (error) {
      console.error("导出失败:", error);
    }
  };

  // CSV下载函数
  const downloadCSV = (
    data: { headers: string[]; rows: string[][]; filename: string },
  ) => {
    const csvContent = [
      data.headers.join(","),
      ...data.rows.map((row: string[]) =>
        row.map((cell: string) => `"${cell}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", data.filename || "export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 统计数据
  const stats = {
    totalPoints: statsData?.pointsStats?.totalPoints || 0,
    totalUsers: statsData?.pointsStats?.totalUsers || 0,
    totalEarned: statsData?.pointsStats?.totalEarned || 0,
    totalSpent: statsData?.pointsStats?.totalSpent || 0,
    activeRules:
      rulesData?.pointsRules?.items?.filter((r: PointsRule) => r.is_active)
        .length ||
      0,
    exchangeItems: exchangesData?.pointsExchanges?.items?.length || 0,
  };

  // 获取数据
  const pointsRules = rulesData?.pointsRules?.items || [];
  const pointsExchanges = exchangesData?.pointsExchanges?.items || [];
  const pointsRecords = recordsData?.pointsRecords?.items || [];

  // 数据加载状态
  const isLoading = statsLoading || rulesLoading || exchangesLoading ||
    recordsLoading;

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">积分管理</h1>
          <p className="text-muted-foreground mt-2">
            管理积分规则、兑换商品和用户积分记录
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新数据
          </Button>
          <Button onClick={handleCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            添加规则
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分总量</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalPoints / 10000).toFixed(1)}万
            </div>
            <p className="text-xs text-muted-foreground">
              已发放{" "}
              <span className="text-green-600">
                {(stats.totalEarned / 10000).toFixed(1)}万
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              活跃度 <span className="text-blue-600">72.3%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已兑换积分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalSpent / 10000).toFixed(1)}万
            </div>
            <p className="text-xs text-muted-foreground">
              兑换率{" "}
              <span className="text-yellow-600">
                {((stats.totalSpent / stats.totalEarned) * 100).toFixed(1)}%
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃规则</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground">
              兑换商品{" "}
              <span className="text-purple-600">{stats.exchangeItems}</span> 种
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区 */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="rules">积分规则</TabsTrigger>
          <TabsTrigger value="exchange">积分兑换</TabsTrigger>
          <TabsTrigger value="records">积分记录</TabsTrigger>
          <TabsTrigger value="stats">数据统计</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">积分规则</h2>
              <p className="text-muted-foreground">
                配置用户获得积分的规则和条件
              </p>
            </div>
            <Button onClick={handleCreateRule}>
              <Plus className="mr-2 h-4 w-4" />
              添加规则
            </Button>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>规则名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>积分数量</TableHead>
                    <TableHead>限制条件</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesLoading
                    ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          加载中...
                        </TableCell>
                      </TableRow>
                    )
                    : pointsRules.length === 0
                    ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          暂无积分规则
                        </TableCell>
                      </TableRow>
                    )
                    : (
                      pointsRules.map((rule: PointsRule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{rule.name}</div>
                              {rule.description && (
                                <div className="text-sm text-muted-foreground">
                                  {rule.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getTypeDisplay(rule.type)}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-green-600">
                              +{rule.points}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {rule.daily_limit && (
                                <div>每日限制: {rule.daily_limit}次</div>
                              )}
                              {rule.total_limit && (
                                <div>总限制: {rule.total_limit}次</div>
                              )}
                              {!rule.daily_limit && !rule.total_limit && (
                                <div className="text-muted-foreground">
                                  无限制
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={rule.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"}
                            >
                              {rule.is_active ? "启用" : "禁用"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditRule(rule)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRule(rule.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchange" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">积分兑换</h2>
              <p className="text-muted-foreground">
                管理用户可以兑换的商品和服务
              </p>
            </div>
            <Button onClick={handleCreateExchange}>
              <Plus className="mr-2 h-4 w-4" />
              添加兑换项
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exchangesLoading
              ? <div className="col-span-full text-center py-8">加载中...</div>
              : pointsExchanges.length === 0
              ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  暂无兑换商品
                </div>
              )
              : (
                pointsExchanges.map((item: PointsExchange) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{item.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            {getExchangeTypeBadge(item.exchange_type)}
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleEditExchange(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteExchange(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {item.points_required.toLocaleString()} 积分
                        </div>
                        {item.exchange_type === "balance" &&
                          item.reward_value && (
                          <div className="text-sm text-muted-foreground">
                            = ¥{item.reward_value}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>已兑换</span>
                          <span className="font-medium">
                            {item.used_count.toLocaleString()}
                          </span>
                        </div>
                        {item.stock && (
                          <div className="flex justify-between text-sm">
                            <span>剩余库存</span>
                            <span className="font-medium">
                              {(item.stock - item.used_count).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {!item.stock && (
                          <div className="flex justify-between text-sm">
                            <span>库存</span>
                            <span className="font-medium text-green-600">
                              无限
                            </span>
                          </div>
                        )}
                      </div>

                      {item.stock && (
                        <div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  (item.used_count / item.stock) * 100
                                }%`,
                              }}
                            >
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {((item.used_count / item.stock) * 100).toFixed(1)}%
                            已兑换
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}

            <Card className="border-dashed border-2">
              <CardContent className="flex items-center justify-center h-full min-h-48">
                <Button variant="ghost" className="h-full w-full">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-muted-foreground">添加兑换项</div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">积分记录</h2>
              <p className="text-muted-foreground">
                查看所有用户的积分获得和消费记录
              </p>
            </div>
            <Button onClick={() => setAdjustmentModalOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              调整积分
            </Button>
          </div>

          {/* 筛选组件 */}
          <PointsRecordFilter
            onFilter={handleRecordFilter}
            onExport={handleExportRecords}
            loading={recordsLoading || exportLoading}
          />

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>积分变动</TableHead>
                    <TableHead>余额</TableHead>
                    <TableHead>原因</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsLoading
                    ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          加载中...
                        </TableCell>
                      </TableRow>
                    )
                    : pointsRecords.length === 0
                    ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-muted-foreground"
                        >
                          暂无积分记录
                        </TableCell>
                      </TableRow>
                    )
                    : (
                      pointsRecords.map((record: PointsRecord) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="font-medium">{record.username}</div>
                          </TableCell>
                          <TableCell>
                            {getTypeDisplay(record.type)}
                          </TableCell>
                          <TableCell>
                            <div
                              className={`font-medium ${
                                record.points > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {record.points > 0 ? "+" : ""}
                              {record.points.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {record.balance.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{record.reason}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(record.created).toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">数据统计</h2>
            <p className="text-muted-foreground">
              积分系统的使用情况和效果分析
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>积分获得趋势</CardTitle>
                <CardDescription>最近30天积分发放趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  图表组件将在后续实现
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>兑换热度排行</CardTitle>
                <CardDescription>最受欢迎的兑换商品</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exchangesLoading
                    ? <div className="text-center py-4">加载中...</div>
                    : pointsExchanges.length === 0
                    ? (
                      <div className="text-center py-4 text-muted-foreground">
                        暂无数据
                      </div>
                    )
                    : (
                      pointsExchanges
                        .sort((a: PointsExchange, b: PointsExchange) =>
                          b.used_count - a.used_count
                        )
                        .map((item: PointsExchange, index: number) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-medium">
                                {index + 1}
                              </div>
                              <span className="font-medium">{item.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.used_count.toLocaleString()} 次
                            </div>
                          </div>
                        ))
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 模态框组件 */}
      <PointsRuleModal
        open={ruleModalOpen}
        onOpenChange={setRuleModalOpen}
        rule={editingRule}
        onSuccess={handleModalSuccess}
      />

      <PointsExchangeModal
        open={exchangeModalOpen}
        onOpenChange={setExchangeModalOpen}
        exchange={editingExchange}
        onSuccess={handleModalSuccess}
      />

      <PointsAdjustmentModal
        open={adjustmentModalOpen}
        onOpenChange={setAdjustmentModalOpen}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
