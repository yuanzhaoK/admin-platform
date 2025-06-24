"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Activity,
  Calendar,
  Copy,
  DollarSign,
  Edit,
  Eye,
  Gift,
  Percent,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

// 模拟数据
const mockCoupons = [
  {
    id: "1",
    name: "新用户专享优惠券",
    code: "NEWUSER50",
    type: "new_user",
    discountType: "fixed_amount",
    discountValue: 50,
    minAmount: 100,
    usageLimit: 1000,
    usedCount: 342,
    startTime: "2024-01-01",
    endTime: "2024-12-31",
    status: "active",
  },
  {
    id: "2",
    name: "春季大促销",
    code: "SPRING20",
    type: "general",
    discountType: "percentage",
    discountValue: 20,
    minAmount: 200,
    usageLimit: 5000,
    usedCount: 2840,
    startTime: "2024-03-01",
    endTime: "2024-05-31",
    status: "active",
  },
  {
    id: "3",
    name: "会员专享折扣",
    code: "VIP15",
    type: "member_exclusive",
    discountType: "percentage",
    discountValue: 15,
    minAmount: 0,
    usageLimit: null,
    usedCount: 1560,
    startTime: "2024-01-01",
    endTime: "2024-12-31",
    status: "active",
  },
  {
    id: "4",
    name: "生日特惠券",
    code: "BIRTHDAY",
    type: "birthday",
    discountType: "fixed_amount",
    discountValue: 30,
    minAmount: 50,
    usageLimit: null,
    usedCount: 89,
    startTime: "2024-01-01",
    endTime: "2024-12-31",
    status: "active",
  },
];

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("coupons");

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "有效", className: "bg-green-100 text-green-800" },
      inactive: { label: "无效", className: "bg-gray-100 text-gray-800" },
      expired: { label: "已过期", className: "bg-red-100 text-red-800" },
      used_up: { label: "已用完", className: "bg-orange-100 text-orange-800" },
    };
    const config = statusMap[status as keyof typeof statusMap] ||
      statusMap.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      general: { label: "通用", className: "bg-blue-100 text-blue-800" },
      new_user: { label: "新用户", className: "bg-purple-100 text-purple-800" },
      member_exclusive: {
        label: "会员专享",
        className: "bg-yellow-100 text-yellow-800",
      },
      birthday: { label: "生日", className: "bg-pink-100 text-pink-800" },
      activity: { label: "活动", className: "bg-indigo-100 text-indigo-800" },
    };
    const config = typeMap[type as keyof typeof typeMap] || typeMap.general;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getDiscountDisplay = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    } else if (type === "fixed_amount") {
      return `¥${value}`;
    } else {
      return "免邮";
    }
  };

  const getUsageProgress = (used: number, limit: number | null) => {
    if (limit === null) return null;
    const percentage = (used / limit) * 100;
    return {
      percentage: Math.min(percentage, 100),
      text: `${used}/${limit}`,
    };
  };

  // 统计数据
  const stats = {
    total: mockCoupons.length,
    active: mockCoupons.filter((c) => c.status === "active").length,
    totalUsed: mockCoupons.reduce((sum, c) => sum + c.usedCount, 0),
    totalSavings: mockCoupons.reduce((sum, c) => {
      if (c.discountType === "fixed_amount") {
        return sum + (c.discountValue * c.usedCount);
      }
      return sum + (c.usedCount * 20); // 假设平均节省20元
    }, 0),
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">优惠券管理</h1>
          <p className="text-muted-foreground mt-2">
            创建和管理各类优惠券活动，提升用户购买转化
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            批量生成
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            创建优惠券
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">优惠券总数</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              有效券 <span className="text-green-600">{stats.active}</span> 张
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累计使用</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsed.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+156</span> 今日新增
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总节省金额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{stats.totalSavings.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              平均每券{" "}
              <span className="text-green-600">
                ¥{Math.round(stats.totalSavings / stats.totalUsed)}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">使用率</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> 较上月
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
          <TabsTrigger value="coupons">优惠券列表</TabsTrigger>
          <TabsTrigger value="templates">模板管理</TabsTrigger>
          <TabsTrigger value="usage">使用记录</TabsTrigger>
          <TabsTrigger value="stats">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          {/* 搜索和过滤 */}
          <Card>
            <CardHeader>
              <CardTitle>筛选条件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索优惠券名称或代码"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">有效</SelectItem>
                    <SelectItem value="inactive">无效</SelectItem>
                    <SelectItem value="expired">已过期</SelectItem>
                    <SelectItem value="used_up">已用完</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="general">通用</SelectItem>
                    <SelectItem value="new_user">新用户</SelectItem>
                    <SelectItem value="member_exclusive">会员专享</SelectItem>
                    <SelectItem value="birthday">生日</SelectItem>
                    <SelectItem value="activity">活动</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 优惠券列表 */}
          <Card>
            <CardHeader>
              <CardTitle>优惠券列表</CardTitle>
              <CardDescription>
                共 {mockCoupons.length} 张优惠券
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>优惠券信息</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优惠额度</TableHead>
                    <TableHead>使用情况</TableHead>
                    <TableHead>有效期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCoupons.map((coupon) => {
                    const progress = getUsageProgress(
                      coupon.usedCount,
                      coupon.usageLimit,
                    );
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{coupon.name}</div>
                            <div className="text-sm text-muted-foreground">
                              代码: {coupon.code}
                            </div>
                            {coupon.minAmount > 0 && (
                              <div className="text-xs text-muted-foreground">
                                满¥{coupon.minAmount}可用
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(coupon.type)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-lg text-green-600">
                            {getDiscountDisplay(
                              coupon.discountType,
                              coupon.discountValue,
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {coupon.usedCount.toLocaleString()} 次
                            </div>
                            {progress && (
                              <div className="mt-1">
                                <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{ width: `${progress.percentage}%` }}
                                  >
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {progress.text}
                                </div>
                              </div>
                            )}
                            {!progress && (
                              <div className="text-xs text-muted-foreground">
                                无限制
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{coupon.startTime}</div>
                            <div>至 {coupon.endTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(coupon.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">模板管理</h2>
            <p className="text-muted-foreground">
              创建和管理优惠券模板，快速生成批量优惠券
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-dashed border-2">
              <CardContent className="flex items-center justify-center h-48">
                <Button variant="ghost" className="h-full w-full">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-muted-foreground">创建新模板</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>新用户注册优惠</CardTitle>
                <CardDescription>新用户注册完成后自动发放</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>优惠金额</span>
                    <span className="font-medium">¥50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>使用门槛</span>
                    <span className="font-medium">满¥100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>有效期</span>
                    <span className="font-medium">30天</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    编辑
                  </Button>
                  <Button size="sm" className="flex-1">使用</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">使用记录</h2>
            <p className="text-muted-foreground">
              查看优惠券的使用详情和用户行为
            </p>
          </div>

          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              使用记录列表将在后续实现
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">数据分析</h2>
            <p className="text-muted-foreground">优惠券使用效果和转化分析</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>使用趋势</CardTitle>
                <CardDescription>最近30天优惠券使用趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  图表组件将在后续实现
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>类型分布</CardTitle>
                <CardDescription>各类型优惠券使用占比</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  饼图组件将在后续实现
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
