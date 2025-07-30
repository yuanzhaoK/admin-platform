"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CheckCircle,
  ChevronRight,
  Clock,
  Cpu,
  CreditCard,
  Database,
  Download,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Key,
  Mail,
  MessageSquare,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Upload,
  Zap,
} from "lucide-react";
import {
  GET_SETTINGS_GROUPS,
  GET_SYSTEM_SETTINGS,
} from "@/lib/graphql/queries/member-system";

interface QuickActionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  count?: number;
  status?: "healthy" | "warning" | "error";
}

interface SettingData {
  id: string;
  key: string;
  name: string;
  description?: string;
  value: string;
  default_value?: string;
  type: string;
  category: string;
  scope: string;
  is_public: boolean;
  is_readonly: boolean;
  validation_rules?: Record<string, unknown>;
  options?: Record<string, unknown>;
  order_index: number;
  group_name?: string;
  icon?: string;
  created: string;
  updated: string;
  updated_by?: string;
}

interface SettingsGroupData {
  category: string;
  name: string;
  description?: string;
  icon?: string;
  count: number;
  settings: Array<{
    id: string;
    key: string;
    name: string;
    description?: string;
    value: string;
    type: string;
    is_readonly: boolean;
    validation_rules?: Record<string, unknown>;
    options?: Record<string, unknown>;
    order_index: number;
    icon?: string;
  }>;
}

export default function SettingsOverviewPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // GraphQL queries
  const { data: groupsData, loading: groupsLoading, refetch: refetchGroups } =
    useQuery(GET_SETTINGS_GROUPS, {
      errorPolicy: "all",
    });

  const { data: settingsData } = useQuery(GET_SYSTEM_SETTINGS, {
    variables: {
      query: {
        page: 1,
        perPage: 100,
        search: searchQuery || undefined,
      },
    },
    errorPolicy: "all",
    skip: !searchQuery,
  });

  // Data processing
  const settingsGroups: SettingsGroupData[] = groupsData?.settingsGroups || [];
  const searchResults: SettingData[] = settingsData?.systemSettings?.items ||
    [];

  // Quick action configurations
  const quickActions: QuickActionCard[] = [
    {
      title: "基础设置",
      description: "系统名称、联系信息等基本配置",
      href: "/dashboard/members/settings/general",
      icon: Globe,
      color: "text-blue-600",
      count: settingsGroups.find((g) => g.category === "GENERAL")?.count || 0,
      status: "healthy",
    },
    {
      title: "通知设置",
      description: "邮件、短信、推送通知配置",
      href: "/dashboard/members/settings/notifications",
      icon: Bell,
      color: "text-green-600",
      count: settingsGroups.find((g) => g.category === "NOTIFICATION")?.count ||
        0,
      status: "healthy",
    },
    {
      title: "安全设置",
      description: "密码策略、登录安全等配置",
      href: "/dashboard/members/settings/security",
      icon: Shield,
      color: "text-red-600",
      count: settingsGroups.find((g) => g.category === "SECURITY")?.count || 0,
      status: "warning",
    },
    {
      title: "支付设置",
      description: "支付网关、货币、费率配置",
      href: "/dashboard/members/settings/payment",
      icon: CreditCard,
      color: "text-purple-600",
      count: settingsGroups.find((g) => g.category === "PAYMENT")?.count || 0,
      status: "healthy",
    },
    {
      title: "邮件设置",
      description: "SMTP配置、邮件模板设置",
      href: "/dashboard/members/settings/email",
      icon: Mail,
      color: "text-orange-600",
      count: settingsGroups.find((g) => g.category === "EMAIL")?.count || 0,
      status: "healthy",
    },
    {
      title: "高级设置",
      description: "API配置、缓存、维护模式等",
      href: "/dashboard/members/settings/advanced",
      icon: Settings,
      color: "text-gray-600",
      count: settingsGroups.reduce((sum, g) => {
        if (
          ["API", "BACKUP", "MAINTENANCE", "ANALYTICS"].includes(g.category)
        ) {
          return sum + g.count;
        }
        return sum;
      }, 0),
      status: "healthy",
    },
  ];

  // Utility functions
  const getStatusIcon = (status: "healthy" | "warning" | "error") => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<
      string,
      React.ComponentType<React.SVGProps<SVGSVGElement>>
    > = {
      GENERAL: Globe,
      NOTIFICATION: Bell,
      EMAIL: Mail,
      SMS: MessageSquare,
      SECURITY: Shield,
      PAYMENT: CreditCard,
      API: Key,
      THEME: Eye,
      ANALYTICS: Activity,
      BACKUP: Database,
      MAINTENANCE: Cpu,
    };
    return iconMap[category] || Settings;
  };

  const getCategoryDisplayName = (category: string) => {
    const nameMap: Record<string, string> = {
      GENERAL: "基础设置",
      PAYMENT: "支付设置",
      SHIPPING: "配送设置",
      NOTIFICATION: "通知设置",
      EMAIL: "邮件设置",
      SMS: "短信设置",
      SECURITY: "安全设置",
      API: "API设置",
      THEME: "主题设置",
      SEO: "SEO设置",
      ANALYTICS: "分析设置",
      BACKUP: "备份设置",
      MAINTENANCE: "维护设置",
    };
    return nameMap[category] || category;
  };

  const getTypeDisplay = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      STRING: { label: "文本", color: "bg-blue-100 text-blue-700" },
      NUMBER: { label: "数字", color: "bg-green-100 text-green-700" },
      BOOLEAN: { label: "布尔", color: "bg-purple-100 text-purple-700" },
      JSON: { label: "JSON", color: "bg-orange-100 text-orange-700" },
      ARRAY: { label: "数组", color: "bg-pink-100 text-pink-700" },
      EMAIL: { label: "邮箱", color: "bg-cyan-100 text-cyan-700" },
      URL: { label: "链接", color: "bg-indigo-100 text-indigo-700" },
      PASSWORD: { label: "密码", color: "bg-red-100 text-red-700" },
      COLOR: { label: "颜色", color: "bg-yellow-100 text-yellow-700" },
      FILE: { label: "文件", color: "bg-gray-100 text-gray-700" },
    };
    const typeInfo = typeMap[type] ||
      { label: type, color: "bg-gray-100 text-gray-700" };
    return (
      <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
        {typeInfo.label}
      </Badge>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">系统配置</h1>
          <p className="text-muted-foreground">
            管理会员系统的各项配置和参数设置
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetchGroups()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出配置
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            导入配置
          </Button>
        </div>
      </div>

      {/* 系统状态概览 */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">配置总数</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settingsGroups.reduce((sum, group) => sum + group.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              分布在 {settingsGroups.length} 个分类中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold text-green-600">正常</div>
            </div>
            <p className="text-xs text-muted-foreground">
              所有配置运行正常
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">安全等级</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div className="text-2xl font-bold text-yellow-600">中等</div>
            </div>
            <p className="text-xs text-muted-foreground">
              建议启用更多安全功能
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最近更新</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              今日更新的配置项
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            快速搜索配置
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="输入配置项名称或关键词..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {searchQuery && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">
                搜索结果 ({searchResults.length})
              </h4>
              <div className="grid gap-2">
                {searchResults.slice(0, 5).map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="font-medium">{setting.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {setting.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTypeDisplay(setting.type)}
                      <Badge
                        variant={setting.is_readonly ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {setting.is_readonly ? "只读" : "可编辑"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 配置分类快速入口 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            配置分类
          </CardTitle>
          <CardDescription>快速访问各个配置分类</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.href}
                  className="group hover:shadow-md transition-all cursor-pointer"
                >
                  <Link href={action.href}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-2 rounded-lg bg-gray-100 ${action.color}`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(action.status || "healthy")}
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {action.count} 项配置
                          </Badge>
                          <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                            点击管理 →
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 详细分组信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                配置分组详情
              </CardTitle>
              <CardDescription>查看各个分组的配置详情</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {groupsLoading
            ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">加载中...</p>
              </div>
            )
            : settingsGroups.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>暂无配置分组</p>
              </div>
            )
            : (
              <div className="space-y-4">
                {settingsGroups.map((group) => {
                  const CategoryIcon = getCategoryIcon(group.category);
                  return (
                    <div key={group.category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <CategoryIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {getCategoryDisplayName(group.category)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {group.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{group.count} 项</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/dashboard/members/settings/${group.category.toLowerCase()}`}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2">
                        {group.settings.slice(0, 4).map((setting) => (
                          <div
                            key={setting.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {setting.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {setting.description || setting.key}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 ml-2">
                              {getTypeDisplay(setting.type)}
                              {setting.is_readonly && (
                                <EyeOff className="h-3 w-3 text-gray-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {group.settings.length > 4 && (
                        <div className="mt-2 text-center">
                          <Button variant="link" size="sm" asChild>
                            <Link
                              href={`/dashboard/members/settings/${group.category.toLowerCase()}`}
                            >
                              查看全部 {group.settings.length} 项配置
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </CardContent>
      </Card>

      {/* 系统维护工具 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            系统维护
          </CardTitle>
          <CardDescription>系统维护和优化工具</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col">
              <RefreshCw className="h-5 w-5 mb-2" />
              <span>清除缓存</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-5 w-5 mb-2" />
              <span>备份配置</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="h-5 w-5 mb-2" />
              <span>恢复配置</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
