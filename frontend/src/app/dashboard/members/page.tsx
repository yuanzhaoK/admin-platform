"use client";

import React from "react";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  BarChart3,
  Calendar,
  Coins,
  Crown,
  Download,
  Eye,
  Mail,
  Phone,
  Plus,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  GET_MEMBER_STATS,
  GET_MEMBERS,
} from "@/lib/graphql/queries/member-system";

interface MemberData {
  id: string;
  profile: {
    username: string;
    email?: string;
    phone?: string;
    avatar?: string;
    realName?: string;
  };
  level: {
    name: string;
    displayName?: string;
    color: string;
    icon?: string;
  };
  points: number;
  status: string;
  registerTime: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon: React.ReactNode;
  href?: string;
}

function StatCard({ title, value, change, icon, href }: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        {change && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {change.type === "increase"
              ? <TrendingUp className="h-3 w-3 text-green-500" />
              : <TrendingDown className="h-3 w-3 text-red-500" />}
            <span
              className={change.type === "increase"
                ? "text-green-500"
                : "text-red-500"}
            >
              {change.value > 0 ? "+" : ""}
              {change.value}%
            </span>
            较上月
          </p>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
}

function QuickAction(
  { title, description, icon, href, color = "primary" }: QuickActionProps,
) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg bg-${color}/10 text-${color} group-hover:bg-${color}/20 transition-colors`}
            >
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm">{title}</CardTitle>
              <CardDescription className="text-xs">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

function getStatusBadge(status: string) {
  const statusMap = {
    ACTIVE: { label: "正常", variant: "default" as const },
    INACTIVE: { label: "未激活", variant: "secondary" as const },
    BANNED: { label: "已封禁", variant: "destructive" as const },
    PENDING: { label: "待审核", variant: "outline" as const },
  };

  const statusInfo = statusMap[status as keyof typeof statusMap] ||
    { label: status, variant: "default" as const };
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
}

function getLevelBadge(
  level: { color: string; icon?: string; displayName?: string; name: string },
) {
  return (
    <Badge
      style={{
        backgroundColor: level.color + "20",
        color: level.color,
        borderColor: level.color,
      }}
      variant="outline"
    >
      {level.icon && <span className="mr-1">{level.icon}</span>}
      {level.displayName || level.name}
    </Badge>
  );
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60),
  );

  if (diffInHours < 1) return "刚刚";
  if (diffInHours < 24) return `${diffInHours}小时前`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}天前`;

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}个月前`;

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
}

export default function MembersOverviewPage() {
  // 获取统计数据
  const { data: statsData } = useQuery(
    GET_MEMBER_STATS,
    {
      variables: { dateRange: null },
    },
  );

  // 获取最近会员数据
  const { data: membersData, loading: membersLoading } = useQuery(GET_MEMBERS, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 10,
          sortBy: "created",
          sortOrder: "DESC",
        },
        includeLevel: true,
        includeTags: true,
        includeStats: true,
      },
    },
  });

  const stats = statsData?.memberStats?.overview;
  const recentMembers = membersData?.members?.items || [];

  const quickActions = [
    {
      title: "添加会员",
      description: "手动添加新会员",
      icon: <UserPlus className="h-4 w-4" />,
      href: "/dashboard/members/management/list?action=create",
      color: "blue",
    },
    {
      title: "批量导入",
      description: "批量导入会员数据",
      icon: <Download className="h-4 w-4" />,
      href: "/dashboard/members/management/import",
      color: "green",
    },
    {
      title: "等级管理",
      description: "管理会员等级和权益",
      icon: <Crown className="h-4 w-4" />,
      href: "/dashboard/members/levels/list",
      color: "yellow",
    },
    {
      title: "积分规则",
      description: "设置积分获取规则",
      icon: <Coins className="h-4 w-4" />,
      href: "/dashboard/members/points/rules",
      color: "purple",
    },
    {
      title: "数据分析",
      description: "查看详细统计报表",
      icon: <BarChart3 className="h-4 w-4" />,
      href: "/dashboard/members/analytics/overview",
      color: "orange",
    },
    {
      title: "搜索会员",
      description: "查找特定会员信息",
      icon: <Search className="h-4 w-4" />,
      href: "/dashboard/members/management/list",
      color: "indigo",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">会员概览</h1>
          <p className="text-muted-foreground">
            管理会员信息、等级权益、积分系统和数据分析
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            时间筛选
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加会员
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="总会员数"
          value={stats?.total || 0}
          change={{ value: 12.5, type: "increase" }}
          icon={<Users className="h-4 w-4" />}
          href="/dashboard/members/management/list"
        />
        <StatCard
          title="活跃会员"
          value={stats?.active || 0}
          change={{ value: 8.3, type: "increase" }}
          icon={<TrendingUp className="h-4 w-4" />}
          href="/dashboard/members/management/list?status=ACTIVE"
        />
        <StatCard
          title="本月新增"
          value={stats?.newThisMonth || 0}
          change={{ value: -2.1, type: "decrease" }}
          icon={<UserPlus className="h-4 w-4" />}
          href="/dashboard/members/analytics/overview"
        />
        <StatCard
          title="留存率"
          value={stats?.retentionRate
            ? `${(stats.retentionRate * 100).toFixed(1)}%`
            : "0%"}
          change={{ value: 4.2, type: "increase" }}
          icon={<Star className="h-4 w-4" />}
          href="/dashboard/members/analytics/behavior"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 快速操作 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>快速操作</CardTitle>
              <CardDescription>
                常用的会员管理操作和功能入口
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quickActions.map((action, index) => (
                  <QuickAction key={index} {...action} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 系统状态 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">会员服务</span>
                </div>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">积分系统</span>
                </div>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">等级升级</span>
                </div>
                <span className="text-sm text-yellow-600">处理中</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">数据同步</span>
                </div>
                <span className="text-sm text-green-600">正常</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>待处理事项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">待审核认证</span>
                <Badge variant="outline">5</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">待处理申诉</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">积分异常</span>
                <Badge variant="outline">1</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">等级争议</span>
                <Badge variant="outline">0</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 最近活动 */}
      <Tabs defaultValue="recent-members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent-members">最新会员</TabsTrigger>
          <TabsTrigger value="level-changes">等级变动</TabsTrigger>
          <TabsTrigger value="points-activity">积分动态</TabsTrigger>
        </TabsList>

        <TabsContent value="recent-members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>最新注册会员</CardTitle>
                <CardDescription>最近注册的会员列表</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/members/management/list">
                  <Eye className="h-4 w-4 mr-2" />
                  查看全部
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {membersLoading
                ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                )
                : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>会员信息</TableHead>
                        <TableHead>等级</TableHead>
                        <TableHead>积分</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentMembers.map((member: MemberData) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.profile.avatar} />
                                <AvatarFallback>
                                  {member.profile.realName?.[0] ||
                                    member.profile.username?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {member.profile.realName ||
                                    member.profile.username}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-4">
                                  {member.profile.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {member.profile.email}
                                    </span>
                                  )}
                                  {member.profile.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {member.profile.phone}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getLevelBadge(member.level)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-yellow-500" />
                              {member.points?.toLocaleString() || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(member.status)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatTimeAgo(member.registerTime)}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                href={`/dashboard/members/management/list?member=${member.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="level-changes">
          <Card>
            <CardHeader>
              <CardTitle>等级变动记录</CardTitle>
              <CardDescription>最近的会员等级升级或降级记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无等级变动记录
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points-activity">
          <Card>
            <CardHeader>
              <CardTitle>积分动态</CardTitle>
              <CardDescription>最近的积分获得和消费记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无积分动态记录
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
