"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  Clock,
  Edit,
  Eye,
  Flame,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  Star,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

interface TrendingItem {
  id: string;
  product_id: string;
  product_name: string;
  category: string;
  type: "manual" | "auto";
  source: "sales" | "views" | "search" | "manual";
  rank: number;
  score: number;
  views: number;
  clicks: number;
  sales: number;
  trend: "up" | "down" | "stable";
  trend_change: number;
  status: "active" | "inactive";
  start_date: string;
  end_date: string;
  created: string;
  updated: string;
}

interface TrendingRule {
  id: string;
  name: string;
  type: "sales" | "views" | "search" | "rating";
  period: "daily" | "weekly" | "monthly";
  limit: number;
  weight: number;
  status: "active" | "inactive";
  created: string;
}

export default function TrendingPage() {
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [rules, setRules] = useState<TrendingRule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);

  // 模拟数据
  useEffect(() => {
    const mockTrendingItems: TrendingItem[] = [
      {
        id: "1",
        product_id: "p1",
        product_name: "iPhone 15 Pro",
        category: "手机",
        type: "auto",
        source: "sales",
        rank: 1,
        score: 95.8,
        views: 25600,
        clicks: 3200,
        sales: 580,
        trend: "up",
        trend_change: 12.5,
        status: "active",
        start_date: "2024-03-01",
        end_date: "2024-03-31",
        created: "2024-03-01",
        updated: "2024-03-15",
      },
      {
        id: "2",
        product_id: "p2",
        product_name: "MacBook Pro M3",
        category: "电脑",
        type: "manual",
        source: "manual",
        rank: 2,
        score: 89.2,
        views: 18900,
        clicks: 2100,
        sales: 320,
        trend: "stable",
        trend_change: 0.8,
        status: "active",
        start_date: "2024-03-01",
        end_date: "2024-04-30",
        created: "2024-02-28",
        updated: "2024-03-10",
      },
      {
        id: "3",
        product_id: "p3",
        product_name: "AirPods Pro 2",
        category: "音频",
        type: "auto",
        source: "views",
        rank: 3,
        score: 82.6,
        views: 32100,
        clicks: 1800,
        sales: 450,
        trend: "down",
        trend_change: -5.2,
        status: "active",
        start_date: "2024-03-05",
        end_date: "2024-03-25",
        created: "2024-03-05",
        updated: "2024-03-12",
      },
    ];

    const mockRules: TrendingRule[] = [
      {
        id: "r1",
        name: "销量热门规则",
        type: "sales",
        period: "weekly",
        limit: 20,
        weight: 0.4,
        status: "active",
        created: "2024-01-01",
      },
      {
        id: "r2",
        name: "浏览量热门规则",
        type: "views",
        period: "daily",
        limit: 15,
        weight: 0.3,
        status: "active",
        created: "2024-01-01",
      },
      {
        id: "r3",
        name: "搜索热门规则",
        type: "search",
        period: "daily",
        limit: 10,
        weight: 0.2,
        status: "active",
        created: "2024-01-05",
      },
    ];

    setTrendingItems(mockTrendingItems);
    setRules(mockRules);
  }, []);

  const filteredItems = trendingItems.filter((item) => {
    const matchesSearch = item.product_name.toLowerCase().includes(
      searchTerm.toLowerCase(),
    );
    const matchesType = selectedType === "all" || item.type === selectedType;
    const matchesSource = selectedSource === "all" ||
      item.source === selectedSource;
    return matchesSearch && matchesType && matchesSource;
  });

  const handleCreateTrending = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCreateRule = () => {
    setIsRuleDialogOpen(false);
  };

  const handleDeleteTrending = (id: string) => {
    setTrendingItems(trendingItems.filter((item) => item.id !== id));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleToggleStatus = (id: string, type: "trending" | "rule") => {
    if (type === "trending") {
      setTrendingItems(
        trendingItems.map((item) =>
          item.id === id
            ? {
              ...item,
              status: item.status === "active" ? "inactive" : "active",
            }
            : item
        ),
      );
    } else {
      setRules(
        rules.map((rule) =>
          rule.id === id
            ? {
              ...rule,
              status: rule.status === "active" ? "inactive" : "active",
            }
            : rule
        ),
      );
    }
  };

  const handleRefreshTrending = () => {
    // 刷新热门数据逻辑
    console.log("刷新热门数据");
  };

  const totalViews = trendingItems.reduce((sum, item) => sum + item.views, 0);
  const totalClicks = trendingItems.reduce((sum, item) => sum + item.clicks, 0);
  const totalSales = trendingItems.reduce((sum, item) => sum + item.sales, 0);
  const avgScore = trendingItems.length > 0
    ? (trendingItems.reduce((sum, item) => sum + item.score, 0) /
      trendingItems.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">热门管理</h1>
          <p className="text-muted-foreground">管理热门商品和热门排行规则</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefreshTrending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新数据
          </Button>
          <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                热门规则
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>创建热门规则</DialogTitle>
                <DialogDescription>
                  设置自动计算热门商品的规则
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">规则名称</Label>
                  <Input id="rule-name" placeholder="输入规则名称" />
                </div>
                <div>
                  <Label htmlFor="rule-type">数据源</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择数据源" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">销量数据</SelectItem>
                      <SelectItem value="views">浏览量数据</SelectItem>
                      <SelectItem value="search">搜索热度</SelectItem>
                      <SelectItem value="rating">评分数据</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rule-period">统计周期</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择统计周期" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">每日</SelectItem>
                      <SelectItem value="weekly">每周</SelectItem>
                      <SelectItem value="monthly">每月</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-limit">商品数量</Label>
                    <Input id="rule-limit" type="number" placeholder="20" />
                  </div>
                  <div>
                    <Label htmlFor="rule-weight">权重</Label>
                    <Input
                      id="rule-weight"
                      type="number"
                      step="0.1"
                      placeholder="0.5"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="rule-status" />
                  <Label htmlFor="rule-status">启用规则</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsRuleDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreateRule}>创建规则</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                手动添加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>手动添加热门商品</DialogTitle>
                <DialogDescription>手动指定商品为热门商品</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="product-search">搜索商品</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="product-search"
                      placeholder="输入商品名称搜索..."
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trending-rank">排名位置</Label>
                    <Input
                      id="trending-rank"
                      type="number"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trending-score">热门分数</Label>
                    <Input
                      id="trending-score"
                      type="number"
                      placeholder="95.0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">开始时间</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="end-date">结束时间</Label>
                    <Input id="end-date" type="date" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="trending-status" />
                  <Label htmlFor="trending-status">立即生效</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreateTrending}>添加热门</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="trending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trending">热门列表</TabsTrigger>
          <TabsTrigger value="rules">热门规则</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  热门商品数
                </CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trendingItems.length}</div>
                <p className="text-xs text-muted-foreground">
                  启用中:{" "}
                  {trendingItems.filter((item) => item.status === "active")
                    .length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalViews.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">+15.2% 相比上周</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总销量</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalSales.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">+8.9% 相比上周</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均热度</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgScore}</div>
                <p className="text-xs text-muted-foreground">+2.3 相比上周</p>
              </CardContent>
            </Card>
          </div>

          {/* 过滤器 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索商品名称..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="auto">自动</SelectItem>
                    <SelectItem value="manual">手动</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedSource}
                  onValueChange={setSelectedSource}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部来源</SelectItem>
                    <SelectItem value="sales">销量</SelectItem>
                    <SelectItem value="views">浏览</SelectItem>
                    <SelectItem value="search">搜索</SelectItem>
                    <SelectItem value="manual">手动</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 热门列表 */}
          <Card>
            <CardHeader>
              <CardTitle>热门商品列表</CardTitle>
              <CardDescription>按热门排名显示商品</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>排名</TableHead>
                    <TableHead>商品信息</TableHead>
                    <TableHead>类型/来源</TableHead>
                    <TableHead>热门分数</TableHead>
                    <TableHead>趋势</TableHead>
                    <TableHead>数据统计</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>有效期</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.sort((a, b) => a.rank - b.rank).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              item.rank <= 3
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.rank}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.category}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant={item.type === "auto"
                              ? "default"
                              : "secondary"}
                          >
                            {item.type === "auto" ? "自动" : "手动"}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {item.source === "sales"
                              ? "销量"
                              : item.source === "views"
                              ? "浏览"
                              : item.source === "search"
                              ? "搜索"
                              : "手动"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-lg font-bold">{item.score}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.trend === "up"
                            ? <TrendingUp className="h-4 w-4 text-green-500" />
                            : item.trend === "down"
                            ? <TrendingDown className="h-4 w-4 text-red-500" />
                            : <div className="h-4 w-4" />}
                          <span
                            className={`text-sm ${
                              item.trend === "up"
                                ? "text-green-500"
                                : item.trend === "down"
                                ? "text-red-500"
                                : "text-gray-500"
                            }`}
                          >
                            {item.trend_change > 0 ? "+" : ""}
                            {item.trend_change}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {item.clicks.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            {item.sales.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.status === "active"
                            ? "default"
                            : "secondary"}
                        >
                          {item.status === "active" ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{item.start_date}</div>
                          <div className="text-muted-foreground">
                            至 {item.end_date}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(item.id, "trending")}
                          >
                            <Switch
                              checked={item.status === "active"}
                              className="h-4 w-4"
                            />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除热门商品"{item
                                    .product_name}"吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTrending(item.id)}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>热门规则配置</CardTitle>
              <CardDescription>管理自动计算热门商品的规则</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>规则名称</TableHead>
                    <TableHead>数据源</TableHead>
                    <TableHead>统计周期</TableHead>
                    <TableHead>商品数量</TableHead>
                    <TableHead>权重</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {rule.type === "sales"
                            ? "销量"
                            : rule.type === "views"
                            ? "浏览"
                            : rule.type === "search"
                            ? "搜索"
                            : "评分"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.period === "daily"
                          ? "每日"
                          : rule.period === "weekly"
                          ? "每周"
                          : "每月"}
                      </TableCell>
                      <TableCell>{rule.limit}</TableCell>
                      <TableCell>{rule.weight}</TableCell>
                      <TableCell>
                        <Badge
                          variant={rule.status === "active"
                            ? "default"
                            : "secondary"}
                        >
                          {rule.status === "active" ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>{rule.created}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(rule.id, "rule")}
                          >
                            <Switch
                              checked={rule.status === "active"}
                              className="h-4 w-4"
                            />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除规则"{rule
                                    .name}"吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRule(rule.id)}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>热门趋势分析</CardTitle>
              <CardDescription>热门商品的趋势变化统计</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                图表组件 - 后续实现
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
