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
  Coins,
  Edit,
  Gift,
  History,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

// 模拟数据
const mockPointsRules = [
  {
    id: "1",
    name: "用户注册",
    type: "earned_registration",
    points: 100,
    description: "新用户注册完成后获得积分",
    isActive: true,
    conditions: { minAmount: 0 },
    dailyLimit: 1,
    totalLimit: 1,
  },
  {
    id: "2",
    name: "每日签到",
    type: "earned_login",
    points: 10,
    description: "每日首次登录获得积分",
    isActive: true,
    conditions: {},
    dailyLimit: 1,
    totalLimit: null,
  },
  {
    id: "3",
    name: "订单消费",
    type: "earned_order",
    points: 1,
    description: "每消费1元获得1积分",
    isActive: true,
    conditions: { per_yuan: 1 },
    dailyLimit: null,
    totalLimit: null,
  },
  {
    id: "4",
    name: "商品评价",
    type: "earned_review",
    points: 50,
    description: "完成订单商品评价获得积分",
    isActive: true,
    conditions: {},
    dailyLimit: 5,
    totalLimit: null,
  },
];

const mockExchangeItems = [
  {
    id: "1",
    name: "10元优惠券",
    pointsRequired: 1000,
    exchangeType: "coupon",
    stock: 500,
    usedCount: 245,
    status: "active",
    image: "/placeholder-coupon.jpg",
  },
  {
    id: "2",
    name: "账户余额充值",
    pointsRequired: 100,
    exchangeType: "balance",
    rewardValue: 1,
    stock: null,
    usedCount: 1560,
    status: "active",
  },
  {
    id: "3",
    name: "免费配送券",
    pointsRequired: 200,
    exchangeType: "privilege",
    stock: 1000,
    usedCount: 89,
    status: "active",
  },
];

const mockRecords = [
  {
    id: "1",
    username: "user001",
    type: "earned_order",
    points: 128,
    balance: 2580,
    reason: "订单消费获得积分",
    created: "2024-03-15 14:30:25",
  },
  {
    id: "2",
    username: "user002",
    type: "spent_exchange",
    points: -1000,
    balance: 1500,
    reason: "兑换10元优惠券",
    created: "2024-03-15 12:15:30",
  },
  {
    id: "3",
    username: "user003",
    type: "earned_login",
    points: 10,
    balance: 890,
    reason: "每日签到",
    created: "2024-03-15 09:20:15",
  },
];

export default function PointsPage() {
  const [selectedTab, setSelectedTab] = useState("rules");

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

  // 统计数据
  const stats = {
    totalPoints: 2450000,
    totalUsers: 8900,
    totalEarned: 1890000,
    totalSpent: 560000,
    activeRules: mockPointsRules.filter((r) => r.isActive).length,
    exchangeItems: mockExchangeItems.length,
  };

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
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            同步积分
          </Button>
          <Button>
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
            <Button>
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
                  {mockPointsRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rule.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {rule.description}
                          </div>
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
                          {rule.dailyLimit && (
                            <div>每日限制: {rule.dailyLimit}次</div>
                          )}
                          {rule.totalLimit && (
                            <div>总限制: {rule.totalLimit}次</div>
                          )}
                          {!rule.dailyLimit && !rule.totalLimit && (
                            <div className="text-muted-foreground">无限制</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={rule.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"}
                        >
                          {rule.isActive ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加兑换项
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockExchangeItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getExchangeTypeBadge(item.exchangeType)}
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {item.pointsRequired.toLocaleString()} 积分
                    </div>
                    {item.exchangeType === "balance" && item.rewardValue && (
                      <div className="text-sm text-muted-foreground">
                        = ¥{item.rewardValue}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>已兑换</span>
                      <span className="font-medium">
                        {item.usedCount.toLocaleString()}
                      </span>
                    </div>
                    {item.stock && (
                      <div className="flex justify-between text-sm">
                        <span>剩余库存</span>
                        <span className="font-medium">
                          {(item.stock - item.usedCount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {!item.stock && (
                      <div className="flex justify-between text-sm">
                        <span>库存</span>
                        <span className="font-medium text-green-600">无限</span>
                      </div>
                    )}
                  </div>

                  {item.stock && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(item.usedCount / item.stock) * 100}%`,
                          }}
                        >
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {((item.usedCount / item.stock) * 100).toFixed(1)}%
                        已兑换
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

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
          <div>
            <h2 className="text-2xl font-bold">积分记录</h2>
            <p className="text-muted-foreground">
              查看所有用户的积分获得和消费记录
            </p>
          </div>

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
                      placeholder="搜索用户名"
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="积分类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="earned">获得积分</SelectItem>
                    <SelectItem value="spent">消费积分</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="date" className="w-40" />
                <Input type="date" className="w-40" />
              </div>
            </CardContent>
          </Card>

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
                  {mockRecords.map((record) => (
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
                          {record.created}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  {mockExchangeItems
                    .sort((a, b) => b.usedCount - a.usedCount)
                    .map((item, index) => (
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
                          {item.usedCount.toLocaleString()} 次
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
