"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  BarChart3,
  Flame,
  Gift,
  MousePointer,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function MarketingPage() {
  // 模拟数据
  const stats = {
    members: {
      total: 15420,
      active: 12340,
      newThisMonth: 856,
      growth: "+12.5%",
    },
    coupons: {
      total: 45,
      active: 28,
      used: 1240,
      growth: "+8.3%",
    },
    points: {
      totalIssued: 2450000,
      totalRedeemed: 890000,
      activeUsers: 8900,
      growth: "+15.2%",
    },
    ads: {
      total: 12,
      active: 8,
      clicks: 25600,
      growth: "+22.1%",
    },
  };

  const modules = [
    {
      title: "会员管理",
      description: "管理会员信息、等级和权益",
      icon: Users,
      href: "/dashboard/marketing/members",
      stats: [
        { label: "总会员数", value: stats.members.total.toLocaleString() },
        { label: "活跃会员", value: stats.members.active.toLocaleString() },
        {
          label: "本月新增",
          value: stats.members.newThisMonth.toLocaleString(),
        },
      ],
      color: "blue",
    },
    {
      title: "优惠券管理",
      description: "创建和管理各类优惠券活动",
      icon: Gift,
      href: "/dashboard/marketing/coupons",
      stats: [
        { label: "优惠券总数", value: stats.coupons.total.toString() },
        { label: "活跃优惠券", value: stats.coupons.active.toString() },
        { label: "使用次数", value: stats.coupons.used.toLocaleString() },
      ],
      color: "green",
    },
    {
      title: "积分管理",
      description: "积分规则、兑换和记录管理",
      icon: Star,
      href: "/dashboard/marketing/points",
      stats: [
        {
          label: "总发放积分",
          value: (stats.points.totalIssued / 10000).toFixed(1) + "万",
        },
        {
          label: "总兑换积分",
          value: (stats.points.totalRedeemed / 10000).toFixed(1) + "万",
        },
        { label: "活跃用户", value: stats.points.activeUsers.toLocaleString() },
      ],
      color: "yellow",
    },
    {
      title: "商品推荐",
      description: "智能商品推荐和展示位管理",
      icon: TrendingUp,
      href: "/dashboard/marketing/recommendations",
      stats: [
        { label: "推荐位", value: "18" },
        { label: "点击率", value: "3.2%" },
        { label: "转化率", value: "1.8%" },
      ],
      color: "purple",
    },
    {
      title: "广告管理",
      description: "广告投放、展示和效果统计",
      icon: Target,
      href: "/dashboard/marketing/advertisements",
      stats: [
        { label: "广告总数", value: stats.ads.total.toString() },
        { label: "活跃广告", value: stats.ads.active.toString() },
        { label: "总点击量", value: stats.ads.clicks.toLocaleString() },
      ],
      color: "red",
    },
    {
      title: "热门管理",
      description: "热门商品和内容的排行管理",
      icon: Flame,
      href: "/dashboard/marketing/trending",
      stats: [
        { label: "热门商品", value: "156" },
        { label: "浏览量", value: "89.2万" },
        { label: "转化率", value: "4.1%" },
      ],
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "border-blue-200 dark:border-blue-800",
      green: "border-green-200 dark:border-green-800",
      yellow: "border-yellow-200 dark:border-yellow-800",
      purple: "border-purple-200 dark:border-purple-800",
      red: "border-red-200 dark:border-red-800",
      orange: "border-orange-200 dark:border-orange-800",
    };
    return colorMap[color as keyof typeof colorMap] ||
      "border-gray-200 dark:border-gray-800";
  };

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      purple: "text-purple-600 dark:text-purple-400",
      red: "text-red-600 dark:text-red-400",
      orange: "text-orange-600 dark:text-orange-400",
    };
    return colorMap[color as keyof typeof colorMap] ||
      "text-gray-600 dark:text-gray-400";
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">营销管理</h1>
        <p className="text-muted-foreground mt-2">
          统一管理会员、优惠券、积分、推荐、广告和热门内容
        </p>
      </div>

      {/* 总体数据概览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总会员数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.members.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.members.growth}</span>
              {" "}
              较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃优惠券</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.coupons.active}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.coupons.growth}</span>
              {" "}
              使用率提升
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分活跃用户</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.points.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.points.growth}</span>{" "}
              较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">广告点击量</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.ads.clicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.ads.growth}</span> 较上月
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 功能模块卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.title}
              className={`hover:shadow-lg transition-shadow ${
                getColorClasses(module.color)
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      className={`h-6 w-6 ${getIconColorClasses(module.color)}`}
                    />
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {module.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-muted-foreground">
                        {stat.label}
                      </span>
                      <span className="font-medium">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <Link href={module.href}>
                  <Button className="w-full mt-4" variant="outline">
                    进入管理
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>快速操作</span>
          </CardTitle>
          <CardDescription>
            常用的营销管理操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/dashboard/marketing/coupons?action=create">
              <Button variant="outline" className="w-full justify-start">
                <Gift className="mr-2 h-4 w-4" />
                创建优惠券
              </Button>
            </Link>
            <Link href="/dashboard/marketing/members?action=levels">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                管理会员等级
              </Button>
            </Link>
            <Link href="/dashboard/marketing/points?action=rules">
              <Button variant="outline" className="w-full justify-start">
                <Star className="mr-2 h-4 w-4" />
                积分规则设置
              </Button>
            </Link>
            <Link href="/dashboard/marketing/advertisements?action=create">
              <Button variant="outline" className="w-full justify-start">
                <Target className="mr-2 h-4 w-4" />
                创建广告
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
