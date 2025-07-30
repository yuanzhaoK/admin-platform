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
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  ChevronRight,
  Clock,
  Eye,
  Hash,
  Plus,
  Settings,
  Shield,
  Star,
  Tag,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  GET_MEMBER_TAGS,
  GET_TAG_GROUPS,
} from "@/lib/graphql/queries/member-system";

interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  action?: string;
}

interface TagData {
  id: string;
  name: string;
  displayName: string;
  type: string;
  category: string;
  color: string;
  backgroundColor?: string;
  icon?: string;
  memberCount: number;
  isSystem: boolean;
  isActive: boolean;
  businessValue?: number;
}

interface TagGroupData {
  id: string;
  name: string;
  displayName: string;
  color: string;
  icon?: string;
  tagCount: number;
  memberCount: number;
  isSystem: boolean;
  isActive: boolean;
}

interface CategoryData {
  category: string;
  count: number;
  subcategories?: Array<{
    subcategory: string;
    count: number;
  }>;
}

export default function TagsOverviewPage() {
  // GraphQL queries
  const { data: tagsData } = useQuery(GET_MEMBER_TAGS, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 10,
          sortBy: "memberCount",
          sortOrder: "DESC",
        },
        isActive: true,
        includeStats: true,
      },
    },
    errorPolicy: "all",
  });

  const { data: groupsData } = useQuery(GET_TAG_GROUPS, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 8,
          sortBy: "memberCount",
          sortOrder: "DESC",
        },
        isActive: true,
        includeStats: true,
      },
    },
    errorPolicy: "all",
  });

  // Data processing
  const tagStats = tagsData?.memberTags?.stats;
  const topTags = tagsData?.memberTags?.items || [];
  const categories = tagsData?.memberTags?.categories || [];
  const topGroups = groupsData?.tagGroups?.items || [];

  // Quick action configurations
  const quickActions: QuickActionCard[] = [
    {
      title: "标签列表",
      description: "查看和管理所有会员标签",
      href: "/dashboard/members/tags/list",
      icon: Tag,
      color: "text-blue-600",
      action: "管理标签",
    },
    {
      title: "标签关系",
      description: "管理会员与标签的关联关系",
      href: "/dashboard/members/tags/relations",
      icon: Target,
      color: "text-purple-600",
      action: "管理关系",
    },
    {
      title: "标签统计",
      description: "查看标签数据分析和洞察",
      href: "/dashboard/members/tags/stats",
      icon: BarChart3,
      color: "text-green-600",
      action: "查看统计",
    },
    {
      title: "标签规则",
      description: "设置自动标记规则和条件",
      href: "/dashboard/members/tags/rules",
      icon: Brain,
      color: "text-orange-600",
      action: "配置规则",
    },
  ];

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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">标签管理</h1>
          <p className="text-muted-foreground">
            会员标签分类、关系管理和智能分析
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/members/tags/list">
            <Plus className="h-4 w-4 mr-2" />
            新增标签
          </Link>
        </Button>
      </div>

      {/* 统计概览 */}
      {tagStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总标签数</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tagStats.totalTags?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                系统标签 {tagStats.systemTags || 0} 个
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
                {tagStats.totalMembers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                平均 {tagStats.averageTagsPerMember?.toFixed(1) || 0} 个标签/人
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
                {tagStats.autoAssignedTags?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                自动化率 {tagStats.totalTags
                  ? ((tagStats.autoAssignedTags / tagStats.totalTags) * 100)
                    .toFixed(1)
                  : 0}%
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
                {tagStats.customTags?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                占比 {tagStats.totalTags
                  ? ((tagStats.customTags / tagStats.totalTags) * 100).toFixed(
                    1,
                  )
                  : 0}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            快速操作
          </CardTitle>
          <CardDescription>常用的标签管理功能入口</CardDescription>
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
        {/* 热门标签 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  热门标签
                </CardTitle>
                <CardDescription>使用最多的会员标签</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/tags/list">
                  查看全部
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topTags.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无标签记录</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/members/tags/list">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个标签
                    </Link>
                  </Button>
                </div>
              )
              : (
                <div className="space-y-4">
                  {topTags.slice(0, 8).map((tag: TagData, index: number) => (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index < 3
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTagBadge(tag)}
                          {tag.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              系统
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {getTagTypeBadge(tag.type)}
                          <span className="text-sm font-medium">
                            {formatNumber(tag.memberCount)} 人
                          </span>
                        </div>
                        {tag.businessValue && (
                          <div className="text-xs text-muted-foreground">
                            商业价值: {tag.businessValue.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 标签分组 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  标签分组
                </CardTitle>
                <CardDescription>标签的分类和组织结构</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/tags/groups">
                  管理分组
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {topGroups.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Hash className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无标签分组</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/members/tags/groups">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个分组
                    </Link>
                  </Button>
                </div>
              )
              : (
                <div className="space-y-4">
                  {topGroups.slice(0, 6).map((group: TagGroupData) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: `${group.color}20`,
                            color: group.color,
                          }}
                        >
                          {group.icon
                            ? <span>{group.icon}</span>
                            : <Hash className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-medium">{group.displayName}</div>
                          <div className="text-sm text-muted-foreground">
                            {group.tagCount} 个标签
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatNumber(group.memberCount)} 人
                        </div>
                        <div className="flex items-center space-x-2">
                          {group.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              系统
                            </Badge>
                          )}
                          <Badge
                            variant={group.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {group.isActive ? "启用" : "禁用"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 标签分类分布 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  分类分布
                </CardTitle>
                <CardDescription>标签按分类的分布情况</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {categories.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无分类数据</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {categories.slice(0, 6).map((category: CategoryData) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.count} 个标签
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (category.count / (tagStats?.totalTags || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                        <div className="text-xs text-muted-foreground ml-4">
                          子分类:{" "}
                          {category.subcategories.map((
                            sub: { subcategory: string; count: number },
                          ) =>
                            sub.subcategory
                          ).join(", ")}
                        </div>
                      )}
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
              <Shield className="h-5 w-5" />
              系统状态
            </CardTitle>
            <CardDescription>标签系统运行状态和健康度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">标签引擎</div>
                    <div className="text-sm text-muted-foreground">
                      正常运行中
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600">
                  活跃
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">自动标记</div>
                    <div className="text-sm text-muted-foreground">
                      规则执行中
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-blue-600">
                  运行中
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
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">智能建议</span>
                </div>
                <p className="text-sm text-blue-800">
                  系统检测到高价值标签组合，建议开启智能推荐功能以提升营销效果。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 趋势分析 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                标签趋势
              </CardTitle>
              <CardDescription>标签使用和分配的趋势分析</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                本月
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/tags/stats">
                  <Eye className="h-4 w-4 mr-2" />
                  详细分析
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4" />
            <p>趋势图表功能开发中...</p>
            <p className="text-sm mt-2">将显示标签创建、分配和使用的数据趋势</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
