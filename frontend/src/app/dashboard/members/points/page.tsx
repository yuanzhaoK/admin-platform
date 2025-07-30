"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
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
  ArrowRight,
  BarChart3,
  ChevronRight,
  Clock,
  Coins,
  Gift,
  History,
  Plus,
  Settings,
  Star,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import {
  GET_POINTS_EXCHANGES,
  GET_POINTS_RECORDS,
  GET_POINTS_RULES,
  GET_POINTS_STATS,
} from "@/lib/graphql/queries/member-system";

interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  action?: string;
}

interface PointsRecord {
  id: string;
  points: number;
  reason: string;
  type: string;
  created: string;
  user?: {
    username: string;
  };
}

interface PointsRule {
  id: string;
  name: string;
  points: number;
  type: string;
}

interface PointsExchange {
  id: string;
  name: string;
  pointsRequired: number;
  rewardValue?: number;
  exchangeType: string;
  stockRemaining?: number;
}

export default function PointsOverviewPage() {
  // GraphQL queries
  const { data: statsData } = useQuery(GET_POINTS_STATS, {
    errorPolicy: "all",
  });

  const { data: recentRecordsData } = useQuery(GET_POINTS_RECORDS, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 5,
          sortBy: "created",
          sortOrder: "DESC",
        },
        includeUser: true,
        includeRule: true,
      },
    },
    errorPolicy: "all",
  });

  const { data: rulesData } = useQuery(GET_POINTS_RULES, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 5,
          sortBy: "created",
          sortOrder: "DESC",
        },
        isActive: true,
      },
    },
    errorPolicy: "all",
  });

  const { data: exchangesData } = useQuery(GET_POINTS_EXCHANGES, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 5,
          sortBy: "created",
          sortOrder: "DESC",
        },
        isActive: true,
      },
    },
    errorPolicy: "all",
  });

  // Data processing
  const pointsStats = statsData?.pointsStats?.overview;
  const recentRecords = recentRecordsData?.pointsRecords?.items || [];
  const activeRules = rulesData?.pointsRules?.items || [];
  const activeExchanges = exchangesData?.pointsExchanges?.items || [];

  // Quick action configurations
  const quickActions: QuickActionCard[] = [
    {
      title: "积分记录",
      description: "查看所有积分变化记录",
      href: "/dashboard/members/points/records",
      icon: History,
      color: "text-blue-600",
      action: "查看记录",
    },
    {
      title: "积分规则",
      description: "管理积分获得和消费规则",
      href: "/dashboard/members/points/rules",
      icon: Settings,
      color: "text-green-600",
      action: "管理规则",
    },
    {
      title: "积分兑换",
      description: "配置积分兑换商品和服务",
      href: "/dashboard/members/points/exchanges",
      icon: Gift,
      color: "text-purple-600",
      action: "管理兑换",
    },
    {
      title: "兑换记录",
      description: "查看积分兑换历史记录",
      href: "/dashboard/members/points/exchange-records",
      icon: Wallet,
      color: "text-orange-600",
      action: "查看兑换",
    },
  ];

  // Utility functions
  const getPointsTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      EARNED_REGISTRATION: {
        label: "注册奖励",
        color: "bg-blue-100 text-blue-800",
      },
      EARNED_LOGIN: { label: "登录奖励", color: "bg-green-100 text-green-800" },
      EARNED_ORDER: {
        label: "订单奖励",
        color: "bg-purple-100 text-purple-800",
      },
      EARNED_ADMIN: {
        label: "管理员增加",
        color: "bg-orange-100 text-orange-800",
      },
      SPENT_EXCHANGE: { label: "积分兑换", color: "bg-red-100 text-red-800" },
      SPENT_ORDER: { label: "订单抵扣", color: "bg-red-100 text-red-800" },
      EXPIRED: { label: "积分过期", color: "bg-gray-100 text-gray-800" },
    };

    const typeInfo = typeMap[type] ||
      { label: type, color: "bg-gray-100 text-gray-800" };
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">积分系统</h1>
          <p className="text-muted-foreground">
            积分规则管理、兑换设置和数据统计中心
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/members/points/rules">
              <Plus className="h-4 w-4 mr-2" />
              创建规则
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/members/points/exchanges">
              <Gift className="h-4 w-4 mr-2" />
              新增兑换
            </Link>
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      {pointsStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总积分发放</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {pointsStats.totalPointsIssued?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                本月发放 {pointsStats.monthlyIssued?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总积分消费</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {pointsStats.totalPointsSpent?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                本月消费 {pointsStats.monthlySpent?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃规则</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {pointsStats.activeRules || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                总规则 {pointsStats.totalRules || 0} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">兑换使用率</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {pointsStats.exchangeRate?.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                总兑换 {pointsStats.totalExchanges?.toLocaleString() || 0} 次
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            快速操作
          </CardTitle>
          <CardDescription>常用的积分系统管理功能入口</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.href}
                  className="group hover:shadow-md transition-all cursor-pointer"
                >
                  <Link href={action.href}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div
                            className={`p-2 rounded-lg bg-gray-100 ${action.color}`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold group-hover:text-primary transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近积分记录 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  最近积分记录
                </CardTitle>
                <CardDescription>最新的积分变化记录</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/points/records">
                  查看全部
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentRecords.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无积分记录</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {recentRecords.map((record: PointsRecord) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            record.points > 0
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {record.points > 0
                            ? <TrendingUp className="h-4 w-4" />
                            : <Coins className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">
                            {record.user?.username || "未知用户"}
                            <span
                              className={`ml-2 ${
                                record.points > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {record.points > 0 ? "+" : ""}
                              {record.points}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.reason} · {formatDate(record.created)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getPointsTypeBadge(record.type)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 活跃规则 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  活跃规则
                </CardTitle>
                <CardDescription>当前生效的积分规则</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/points/rules">
                  管理规则
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeRules.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无活跃规则</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/members/points/rules">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个规则
                    </Link>
                  </Button>
                </div>
              )
              : (
                <div className="space-y-4">
                  {activeRules.map((rule: PointsRule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.points > 0 ? "+" : ""}
                            {rule.points} 积分
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">{rule.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 热门兑换 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  热门兑换
                </CardTitle>
                <CardDescription>最受欢迎的兑换商品</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/points/exchanges">
                  管理兑换
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeExchanges.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无兑换商品</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/members/points/exchanges">
                      <Plus className="h-4 w-4 mr-2" />
                      添加兑换商品
                    </Link>
                  </Button>
                </div>
              )
              : (
                <div className="space-y-4">
                  {activeExchanges.map((exchange: PointsExchange) => (
                    <div
                      key={exchange.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                          <Gift className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{exchange.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {exchange.pointsRequired} 积分
                            {exchange.rewardValue &&
                              ` · ${formatCurrency(exchange.rewardValue)}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          库存 {exchange.stockRemaining || 0}
                        </div>
                        <Badge variant="outline">
                          {exchange.exchangeType}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              系统状态
            </CardTitle>
            <CardDescription>积分系统运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">积分计算</div>
                    <div className="text-sm text-muted-foreground">
                      实时计算中
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  正常
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">兑换处理</div>
                    <div className="text-sm text-muted-foreground">
                      自动处理中
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  活跃
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">数据同步</div>
                    <div className="text-sm text-muted-foreground">
                      定期同步中
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-yellow-600">
                  同步中
                </Badge>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">运营建议</span>
                </div>
                <p className="text-sm text-blue-800">
                  建议增加限时兑换活动，提升积分使用率和用户活跃度。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据趋势 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                积分趋势
              </CardTitle>
              <CardDescription>积分发放和消费的趋势分析</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                本周
              </Button>
              <Button variant="outline" size="sm">
                导出报告
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4" />
            <p>趋势图表功能开发中...</p>
            <p className="text-sm mt-2">将显示积分发放、消费和兑换的数据趋势</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
