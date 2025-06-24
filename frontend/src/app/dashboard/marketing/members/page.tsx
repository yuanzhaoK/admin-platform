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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Download,
  Edit,
  Eye,
  Filter,
  Gift,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";

// 模拟数据
const memberLevels = [
  {
    id: "1",
    name: "普通会员",
    discount: 0,
    pointsRequired: 0,
    color: "gray",
    memberCount: 8240,
  },
  {
    id: "2",
    name: "银卡会员",
    discount: 5,
    pointsRequired: 1000,
    color: "silver",
    memberCount: 4580,
  },
  {
    id: "3",
    name: "金卡会员",
    discount: 10,
    pointsRequired: 5000,
    color: "yellow",
    memberCount: 2100,
  },
  {
    id: "4",
    name: "钻石会员",
    discount: 15,
    pointsRequired: 20000,
    color: "blue",
    memberCount: 500,
  },
];

const mockMembers = [
  {
    id: "1",
    username: "user001",
    email: "user001@example.com",
    realName: "张三",
    phone: "13800138001",
    level: "金卡会员",
    points: 8500,
    balance: 280.50,
    status: "active",
    registerTime: "2024-01-15",
    totalOrders: 45,
    totalAmount: 12800,
  },
  {
    id: "2",
    username: "user002",
    email: "user002@example.com",
    realName: "李四",
    phone: "13800138002",
    level: "银卡会员",
    points: 2800,
    balance: 150.00,
    status: "active",
    registerTime: "2024-02-20",
    totalOrders: 28,
    totalAmount: 5600,
  },
  {
    id: "3",
    username: "user003",
    email: "user003@example.com",
    realName: "王五",
    phone: "13800138003",
    level: "普通会员",
    points: 580,
    balance: 0,
    status: "inactive",
    registerTime: "2024-03-10",
    totalOrders: 8,
    totalAmount: 1200,
  },
];

export default function MembersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("members");

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: {
        label: "活跃",
        variant: "default" as const,
        className: "bg-green-100 text-green-800",
      },
      inactive: {
        label: "不活跃",
        variant: "secondary" as const,
        className: "bg-gray-100 text-gray-800",
      },
      banned: {
        label: "已禁用",
        variant: "destructive" as const,
        className: "bg-red-100 text-red-800",
      },
    };
    const config = statusMap[status as keyof typeof statusMap] ||
      statusMap.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: string) => {
    const levelMap = {
      "普通会员": "bg-gray-100 text-gray-800",
      "银卡会员": "bg-slate-100 text-slate-800",
      "金卡会员": "bg-yellow-100 text-yellow-800",
      "钻石会员": "bg-blue-100 text-blue-800",
    };
    return (
      <Badge
        className={levelMap[level as keyof typeof levelMap] ||
          "bg-gray-100 text-gray-800"}
      >
        {level}
      </Badge>
    );
  };

  const getLevelIcon = (level: string) => {
    const iconMap = {
      "普通会员": <Users className="h-4 w-4" />,
      "银卡会员": <Star className="h-4 w-4" />,
      "金卡会员": <Crown className="h-4 w-4" />,
      "钻石会员": <Gift className="h-4 w-4" />,
    };
    return iconMap[level as keyof typeof iconMap] || (
      <Users className="h-4 w-4" />
    );
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">会员管理</h1>
          <p className="text-muted-foreground mt-2">
            管理会员信息、等级设置和权益配置
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            导入会员
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            添加会员
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总会员数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,420</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> 较上月
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃会员</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,340</div>
            <p className="text-xs text-muted-foreground">
              占总数的 <span className="text-blue-600">80.0%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月新增</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">856</div>
            <p className="text-xs text-muted-foreground">
              平均每日 <span className="text-green-600">27.6</span> 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">会员总积分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245万</div>
            <p className="text-xs text-muted-foreground">
              活跃积分 <span className="text-yellow-600">178万</span>
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
          <TabsTrigger value="members">会员列表</TabsTrigger>
          <TabsTrigger value="levels">等级管理</TabsTrigger>
          <TabsTrigger value="stats">数据统计</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
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
                      placeholder="搜索用户名、邮箱或手机号"
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
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">不活跃</SelectItem>
                    <SelectItem value="banned">已禁用</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部等级</SelectItem>
                    <SelectItem value="普通会员">普通会员</SelectItem>
                    <SelectItem value="银卡会员">银卡会员</SelectItem>
                    <SelectItem value="金卡会员">金卡会员</SelectItem>
                    <SelectItem value="钻石会员">钻石会员</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  高级筛选
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 会员列表 */}
          <Card>
            <CardHeader>
              <CardTitle>会员列表</CardTitle>
              <CardDescription>共 {mockMembers.length} 个会员</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>会员信息</TableHead>
                    <TableHead>等级</TableHead>
                    <TableHead>积分余额</TableHead>
                    <TableHead>订单统计</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>注册时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{member.realName}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.email}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLevelIcon(member.level)}
                          {getLevelBadge(member.level)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.points.toLocaleString()} 积分
                          </div>
                          <div className="text-sm text-muted-foreground">
                            余额 ¥{member.balance}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {member.totalOrders} 笔订单
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ¥{member.totalAmount.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(member.status)}
                      </TableCell>
                      <TableCell>{member.registerTime}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
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

        <TabsContent value="levels" className="space-y-4">
          {/* 等级管理 */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">会员等级管理</h2>
              <p className="text-muted-foreground">
                配置不同会员等级的权益和要求
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              添加等级
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {memberLevels.map((level) => (
              <Card key={level.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      {level.name === "普通会员" && (
                        <Users className="h-5 w-5" />
                      )}
                      {level.name === "银卡会员" &&
                        <Star className="h-5 w-5" />}
                      {level.name === "金卡会员" && (
                        <Crown className="h-5 w-5" />
                      )}
                      {level.name === "钻石会员" &&
                        <Gift className="h-5 w-5" />}
                      {level.name}
                    </CardTitle>
                    <div className="flex gap-2">
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
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        会员数量
                      </span>
                      <span className="font-medium">
                        {level.memberCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        升级要求
                      </span>
                      <span className="font-medium">
                        {level.pointsRequired.toLocaleString()} 积分
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        专享折扣
                      </span>
                      <span className="font-medium text-green-600">
                        {level.discount}%
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">专享权益</h4>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        专属客服
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        生日特权
                      </Badge>
                      {level.discount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          购物折扣
                        </Badge>
                      )}
                      {level.name === "钻石会员" && (
                        <Badge variant="outline" className="text-xs">
                          免费配送
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {/* 数据统计 */}
          <div>
            <h2 className="text-2xl font-bold">数据统计</h2>
            <p className="text-muted-foreground">会员相关的数据分析和统计</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>等级分布</CardTitle>
                <CardDescription>各等级会员数量分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {memberLevels.map((level) => {
                    const total = memberLevels.reduce(
                      (sum, l) => sum + l.memberCount,
                      0,
                    );
                    const percentage = ((level.memberCount / total) * 100)
                      .toFixed(1);
                    return (
                      <div
                        key={level.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          {level.name === "普通会员" && (
                            <Users className="h-4 w-4" />
                          )}
                          {level.name === "银卡会员" && (
                            <Star className="h-4 w-4" />
                          )}
                          {level.name === "金卡会员" && (
                            <Crown className="h-4 w-4" />
                          )}
                          {level.name === "钻石会员" && (
                            <Gift className="h-4 w-4" />
                          )}
                          <span className="text-sm">{level.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            >
                            </div>
                          </div>
                          <span className="text-sm font-medium">
                            {percentage}%
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({level.memberCount.toLocaleString()})
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>月度趋势</CardTitle>
                <CardDescription>最近6个月会员增长趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  图表组件将在后续实现
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
