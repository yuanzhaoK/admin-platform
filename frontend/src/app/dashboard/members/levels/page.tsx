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
  Crown,
  Gift,
  History,
  Plus,
  Settings,
  Shield,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  GET_MEMBER_LEVEL_STATS,
  GET_MEMBER_LEVELS,
} from "@/lib/graphql/queries/member-system";

interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  action?: string;
}

export default function LevelsOverviewPage() {
  // GraphQL queries
  const { data: statsData } = useQuery(GET_MEMBER_LEVEL_STATS, {
    errorPolicy: "all",
  });

  const { data: levelsData, loading: levelsLoading } = useQuery(
    GET_MEMBER_LEVELS,
    {
      variables: {
        query: {
          pagination: {
            page: 1,
            perPage: 10,
            sortBy: "level",
            sortOrder: "ASC",
          },
          includeBenefits: true,
          includeMemberCount: true,
        },
      },
      errorPolicy: "all",
    },
  );

  // Data processing
  const levelStats = statsData?.memberLevelStats?.overview;
  const levels = levelsData?.memberLevels?.items || [];

  // Quick action configurations
  const quickActions: QuickActionCard[] = [
    {
      title: "等级列表",
      description: "查看和管理所有会员等级",
      href: "/dashboard/members/levels/list",
      icon: Crown,
      color: "text-yellow-600",
      action: "管理等级",
    },
    {
      title: "权益设置",
      description: "配置等级专属权益和特权",
      href: "/dashboard/members/levels/benefits",
      icon: Gift,
      color: "text-purple-600",
      action: "配置权益",
    },
    {
      title: "升级规则",
      description: "设置等级升级条件和规则",
      href: "/dashboard/members/levels/rules",
      icon: Settings,
      color: "text-blue-600",
      action: "设置规则",
    },
    {
      title: "升级历史",
      description: "查看会员等级变化记录",
      href: "/dashboard/members/levels/history",
      icon: History,
      color: "text-green-600",
      action: "查看历史",
    },
  ];

  // Utility functions
  interface Level {
    color: string;
    displayName: string;
    isActive: boolean;
    memberCount: number;
    benefits?: unknown[];
    level: number;
    id: string;
  }

  const getLevelBadge = (level: Level) => {
    return (
      <Badge
        style={{
          backgroundColor: level.color + "20",
          color: level.color,
          borderColor: level.color,
        }}
        variant="outline"
        className="flex items-center gap-1"
      >
        <Crown className="h-3 w-3" />
        {level.displayName}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">等级管理</h1>
          <p className="text-muted-foreground">
            会员等级体系管理和权益配置中心
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/members/levels/list">
            <Plus className="h-4 w-4 mr-2" />
            创建等级
          </Link>
        </Button>
      </div>

      {/* 统计概览 */}
      {levelStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总等级数</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levelStats.totalLevels}</div>
              <p className="text-xs text-muted-foreground">
                启用 {levelStats.activeLevels} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">会员分布</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {levelStats.totalMembers?.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                平均等级 {levelStats.averageLevel?.toFixed(1) || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">升级活跃度</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89.5%</div>
              <p className="text-xs text-muted-foreground">
                本月升级率
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">权益使用</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76.3%</div>
              <p className="text-xs text-muted-foreground">
                权益使用率
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
          <CardDescription>常用的等级管理功能入口</CardDescription>
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
        {/* 等级概览 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  等级概览
                </CardTitle>
                <CardDescription>当前等级体系概况</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/levels/list">
                  查看全部
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {levelsLoading
              ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gray-200 rounded animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )
              : levels.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无等级配置</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/members/levels/list">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个等级
                    </Link>
                  </Button>
                </div>
              )
              : (
                <div className="space-y-4">
                  {levels.slice(0, 5).map((level: Level) => (
                    <div
                      key={level.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{
                            backgroundColor: level.color + "20",
                            color: level.color,
                          }}
                        >
                          {level.level}
                        </div>
                        <div>
                          <div className="font-medium">{level.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {level.memberCount} 位会员
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getLevelBadge(level)}
                          {level.isActive
                            ? <Badge variant="default">启用</Badge>
                            : <Badge variant="secondary">停用</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {level.benefits?.length || 0} 项权益
                        </div>
                      </div>
                    </div>
                  ))}
                  {levels.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/members/levels/list">
                          查看更多 ({levels.length - 5} 个)
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              系统状态
            </CardTitle>
            <CardDescription>等级系统运行状态和健康度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">自动升级</div>
                    <div className="text-sm text-muted-foreground">
                      系统正常运行
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
                    <div className="font-medium">权益计算</div>
                    <div className="text-sm text-muted-foreground">
                      实时计算中
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
                  <Star className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">系统建议</span>
                </div>
                <p className="text-sm text-blue-800">
                  建议为高等级会员增加专属客服权益，可提升会员满意度。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近活动 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                最近活动
              </CardTitle>
              <CardDescription>近期的等级相关操作记录</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/members/levels/history">
                查看全部
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium">用户 张三 自动升级</div>
                <div className="text-sm text-muted-foreground">
                  从 银牌会员 升级到 金牌会员 · 5分钟前
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <Gift className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium">权益配置更新</div>
                <div className="text-sm text-muted-foreground">
                  金牌会员新增专属客服权益 · 1小时前
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium">升级规则调整</div>
                <div className="text-sm text-muted-foreground">
                  白金会员升级门槛调整为10000积分 · 2小时前
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
