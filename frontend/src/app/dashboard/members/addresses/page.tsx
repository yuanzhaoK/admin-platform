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
  CheckCircle,
  ChevronRight,
  Clock,
  Globe,
  Home,
  MapPin,
  Plus,
  Shield,
  Star,
  Target,
  Users,
} from "lucide-react";
import {
  GET_ADDRESS_STATS,
  GET_ADDRESS_TEMPLATES,
  GET_ADDRESSES,
  GET_REGIONS,
} from "@/lib/graphql/queries/member-system";

interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  action?: string;
}

interface AddressData {
  id: string;
  created: string;
  name: string;
  phone: string;
  fullAddress: string;
  isDefault: boolean;
  verificationStatus: string;
  tag?: string;
  tagColor?: string;
}

interface TemplateData {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  usageCount: number;
}

interface RegionData {
  id: string;
  name: string;
  fullName: string;
}

export default function AddressesOverviewPage() {
  // GraphQL queries
  const { data: statsData } = useQuery(GET_ADDRESS_STATS, {
    errorPolicy: "all",
  });

  const { data: recentAddressesData } = useQuery(GET_ADDRESSES, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 5,
          sortBy: "created",
          sortOrder: "DESC",
        },
        includeUser: true,
      },
    },
    errorPolicy: "all",
  });

  const { data: templatesData } = useQuery(GET_ADDRESS_TEMPLATES, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 5,
          sortBy: "popularityScore",
          sortOrder: "DESC",
        },
        isActive: true,
        isPublic: true,
      },
    },
    errorPolicy: "all",
  });

  const { data: regionsData } = useQuery(GET_REGIONS, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 10,
          sortBy: "sortOrder",
          sortOrder: "ASC",
        },
        isHot: true,
        level: [1], // 只获取省级数据
      },
    },
    errorPolicy: "all",
  });

  // Data processing
  const addressStats = statsData?.addressStats?.overview;
  const recentAddresses = recentAddressesData?.addresses?.items || [];
  const popularTemplates = templatesData?.addressTemplates?.items || [];
  const hotRegions = regionsData?.regions?.items || [];

  // Quick action configurations
  const quickActions: QuickActionCard[] = [
    {
      title: "地址列表",
      description: "查看和管理所有收货地址",
      href: "/dashboard/members/addresses/list",
      icon: MapPin,
      color: "text-blue-600",
      action: "管理地址",
    },
    {
      title: "地址模板",
      description: "管理地址模板和快速填充",
      href: "/dashboard/members/addresses/templates",
      icon: Star,
      color: "text-purple-600",
      action: "管理模板",
    },
    {
      title: "使用记录",
      description: "查看地址使用历史记录",
      href: "/dashboard/members/addresses/usage",
      icon: Clock,
      color: "text-green-600",
      action: "查看记录",
    },
    {
      title: "区域管理",
      description: "管理省市区域数据",
      href: "/dashboard/members/addresses/regions",
      icon: Globe,
      color: "text-orange-600",
      action: "管理区域",
    },
  ];

  // Utility functions
  const getVerificationBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      VERIFIED: { label: "已验证", variant: "default" },
      PENDING: { label: "待验证", variant: "secondary" },
      FAILED: { label: "验证失败", variant: "destructive" },
    };

    const statusInfo = statusMap[status] ||
      { label: status, variant: "secondary" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getTagBadge = (tag: string, tagColor?: string) => {
    if (!tag) return null;

    return (
      <Badge
        style={{
          backgroundColor: tagColor ? `${tagColor}20` : undefined,
          color: tagColor || undefined,
          borderColor: tagColor || undefined,
        }}
        variant="outline"
        className="flex items-center gap-1"
      >
        <Home className="h-3 w-3" />
        {tag}
      </Badge>
    );
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
          <h1 className="text-2xl font-bold tracking-tight">地址管理</h1>
          <p className="text-muted-foreground">
            会员地址管理、验证和模板中心
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/members/addresses/list">
            <Plus className="h-4 w-4 mr-2" />
            新增地址
          </Link>
        </Button>
      </div>

      {/* 统计概览 */}
      {addressStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总地址数</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {addressStats.totalAddresses?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                已验证 {addressStats.verifiedAddresses || 0} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">使用用户</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {addressStats.totalUsers?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                平均每人 {addressStats.averageAddressesPerUser?.toFixed(1) || 0}
                {" "}
                个地址
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">默认地址</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {addressStats.defaultAddresses?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                设置率 {addressStats.totalUsers
                  ? ((addressStats.defaultAddresses / addressStats.totalUsers) *
                    100).toFixed(1)
                  : 0}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">使用次数</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {addressStats.totalUsage?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                总计使用次数
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
          <CardDescription>常用的地址管理功能入口</CardDescription>
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
        {/* 最近地址 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  最近地址
                </CardTitle>
                <CardDescription>最新添加的收货地址</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/addresses/list">
                  查看全部
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentAddresses.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无地址记录</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/members/addresses/list">
                      <Plus className="h-4 w-4 mr-2" />
                      添加第一个地址
                    </Link>
                  </Button>
                </div>
              )
              : (
                <div className="space-y-4">
                  {recentAddresses.slice(0, 5).map((address: AddressData) => (
                    <div
                      key={address.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{address.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {address.phone} · {address.fullAddress}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(address.created)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          {address.isDefault && (
                            <Badge variant="default">默认</Badge>
                          )}
                          {getVerificationBadge(address.verificationStatus)}
                        </div>
                        {address.tag &&
                          getTagBadge(address.tag, address.tagColor)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 热门模板 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  热门模板
                </CardTitle>
                <CardDescription>最受欢迎的地址模板</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/addresses/templates">
                  管理模板
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {popularTemplates.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无地址模板</p>
                  <Button asChild className="mt-4">
                    <Link href="/dashboard/members/addresses/templates">
                      <Plus className="h-4 w-4 mr-2" />
                      创建第一个模板
                    </Link>
                  </Button>
                </div>
              )
              : (
                <div className="space-y-4">
                  {popularTemplates.slice(0, 5).map((
                    template: TemplateData,
                  ) => (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                          <Star className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.description || template.category}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {template.usageCount} 次使用
                        </div>
                        <Badge variant="outline">{template.type}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 热门地区 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  热门地区
                </CardTitle>
                <CardDescription>用户地址分布热门地区</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/addresses/regions">
                  管理地区
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {hotRegions.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无地区数据</p>
                </div>
              )
              : (
                <div className="space-y-3">
                  {hotRegions.slice(0, 8).map((
                    region: RegionData,
                    index: number,
                  ) => (
                    <div
                      key={region.id}
                      className="flex items-center justify-between"
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
                        <div>
                          <div className="font-medium">{region.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {region.fullName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">热门</Badge>
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
              <Shield className="h-5 w-5" />
              系统状态
            </CardTitle>
            <CardDescription>地址系统运行状态和健康度</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">地址验证</div>
                    <div className="text-sm text-muted-foreground">
                      实时验证中
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
                    <div className="font-medium">地址解析</div>
                    <div className="text-sm text-muted-foreground">
                      API服务中
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
                  <span className="font-medium text-blue-900">系统建议</span>
                </div>
                <p className="text-sm text-blue-800">
                  建议开启地址智能补全功能，可以提升用户体验和地址准确性。
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
                地址趋势
              </CardTitle>
              <CardDescription>地址新增和使用的趋势分析</CardDescription>
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
            <p className="text-sm mt-2">将显示地址新增、验证和使用的数据趋势</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
