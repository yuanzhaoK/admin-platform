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
import { Textarea } from "@/components/ui/textarea";
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
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Heart,
  Image,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

interface Advertisement {
  id: string;
  title: string;
  type: "banner" | "popup" | "sidebar" | "inline";
  position: string;
  image: string;
  link: string;
  status: "active" | "inactive" | "scheduled";
  priority: number;
  impressions: number;
  clicks: number;
  cost: number;
  budget: number;
  startDate: string;
  endDate: string;
  created: string;
}

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 模拟数据
  useEffect(() => {
    const mockAds: Advertisement[] = [
      {
        id: "1",
        title: "春季促销横幅",
        type: "banner",
        position: "首页顶部",
        image: "/api/placeholder/300/150",
        link: "/promotions/spring",
        status: "active",
        priority: 1,
        impressions: 125600,
        clicks: 3840,
        cost: 2580,
        budget: 5000,
        startDate: "2024-03-01",
        endDate: "2024-03-31",
        created: "2024-02-25",
      },
      {
        id: "2",
        title: "新品发布弹窗",
        type: "popup",
        position: "全站弹窗",
        image: "/api/placeholder/400/300",
        link: "/products/new",
        status: "scheduled",
        priority: 2,
        impressions: 45200,
        clicks: 1260,
        cost: 890,
        budget: 2000,
        startDate: "2024-04-01",
        endDate: "2024-04-15",
        created: "2024-03-20",
      },
    ];

    setAdvertisements(mockAds);
  }, []);

  const filteredAds = advertisements.filter((ad) => {
    const matchesSearch = ad.title.toLowerCase().includes(
      searchTerm.toLowerCase(),
    );
    const matchesType = selectedType === "all" || ad.type === selectedType;
    const matchesStatus = selectedStatus === "all" ||
      ad.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateAd = () => {
    setIsCreateDialogOpen(false);
  };

  const handleDeleteAd = (id: string) => {
    setAdvertisements(advertisements.filter((ad) => ad.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setAdvertisements(
      advertisements.map((ad) =>
        ad.id === id
          ? { ...ad, status: ad.status === "active" ? "inactive" : "active" }
          : ad
      ),
    );
  };

  const totalImpressions = advertisements.reduce(
    (sum, ad) => sum + ad.impressions,
    0,
  );
  const totalClicks = advertisements.reduce((sum, ad) => sum + ad.clicks, 0);
  const totalCost = advertisements.reduce((sum, ad) => sum + ad.cost, 0);
  const totalBudget = advertisements.reduce((sum, ad) => sum + ad.budget, 0);
  const ctr = totalImpressions > 0
    ? (totalClicks / totalImpressions * 100).toFixed(2)
    : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">广告管理</h1>
          <p className="text-muted-foreground">管理所有广告位和推广内容</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建广告
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建广告</DialogTitle>
              <DialogDescription>添加新的广告内容</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad-title">广告标题</Label>
                  <Input id="ad-title" placeholder="输入广告标题" />
                </div>
                <div>
                  <Label htmlFor="ad-type">广告类型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择广告类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">横幅广告</SelectItem>
                      <SelectItem value="popup">弹窗广告</SelectItem>
                      <SelectItem value="sidebar">侧边栏广告</SelectItem>
                      <SelectItem value="inline">内容广告</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad-position">展示位置</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择展示位置" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home-top">首页顶部</SelectItem>
                      <SelectItem value="home-side">首页侧边</SelectItem>
                      <SelectItem value="category-top">分类页顶部</SelectItem>
                      <SelectItem value="product-bottom">商品页底部</SelectItem>
                      <SelectItem value="popup-center">弹窗中心</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ad-priority">优先级</Label>
                  <Input
                    id="ad-priority"
                    type="number"
                    placeholder="1-100"
                    min="1"
                    max="100"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="ad-link">跳转链接</Label>
                <Input id="ad-link" placeholder="输入跳转链接" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ad-budget">预算金额</Label>
                  <Input id="ad-budget" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="ad-start">开始日期</Label>
                  <Input id="ad-start" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="ad-end">结束日期</Label>
                <Input id="ad-end" type="date" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="ad-status" />
                <Label htmlFor="ad-status">立即启用</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleCreateAd}>创建广告</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">广告列表</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
          <TabsTrigger value="settings">广告设置</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总展示数</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalImpressions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">+12.5% 相比上月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总点击数</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalClicks.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">+8.2% 相比上月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">点击率</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ctr}%</div>
                <p className="text-xs text-muted-foreground">+2.1% 相比上月</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总消费</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ¥{totalCost.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  预算: ¥{totalBudget.toLocaleString()}
                </p>
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
                      placeholder="搜索广告标题..."
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
                    <SelectItem value="banner">横幅</SelectItem>
                    <SelectItem value="popup">弹窗</SelectItem>
                    <SelectItem value="sidebar">侧边栏</SelectItem>
                    <SelectItem value="inline">内容</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                    <SelectItem value="scheduled">定时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 广告列表 */}
          <Card>
            <CardHeader>
              <CardTitle>广告列表</CardTitle>
              <CardDescription>管理所有广告内容</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>广告标题</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>位置</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>展示/点击</TableHead>
                    <TableHead>预算/消费</TableHead>
                    <TableHead>投放期间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAds.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                            <Image className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{ad.title}</div>
                            <div className="text-sm text-muted-foreground">
                              优先级: {ad.priority}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {ad.type === "banner"
                            ? "横幅"
                            : ad.type === "popup"
                            ? "弹窗"
                            : ad.type === "sidebar"
                            ? "侧边栏"
                            : "内容"}
                        </Badge>
                      </TableCell>
                      <TableCell>{ad.position}</TableCell>
                      <TableCell>
                        <Badge
                          variant={ad.status === "active"
                            ? "default"
                            : ad.status === "scheduled"
                            ? "secondary"
                            : "outline"}
                        >
                          {ad.status === "active"
                            ? "启用"
                            : ad.status === "scheduled"
                            ? "定时"
                            : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {ad.impressions.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Target className="h-3 w-3" />
                            {ad.clicks.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>预算: ¥{ad.budget.toLocaleString()}</div>
                          <div className="text-muted-foreground">
                            消费: ¥{ad.cost.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{ad.startDate}</div>
                          <div className="text-muted-foreground">
                            至 {ad.endDate}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(ad.id)}
                          >
                            <Switch
                              checked={ad.status === "active"}
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
                                  确定要删除广告"{ad.title}"吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAd(ad.id)}
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
              <CardTitle>广告效果分析</CardTitle>
              <CardDescription>各广告位的投放效果统计</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                图表组件 - 后续实现
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>广告设置</CardTitle>
              <CardDescription>配置广告系统的全局设置</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-rotate">自动轮播广告</Label>
                  <p className="text-sm text-muted-foreground">
                    在同一位置自动轮播多个广告
                  </p>
                </div>
                <Switch id="auto-rotate" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="click-tracking">点击跟踪</Label>
                  <p className="text-sm text-muted-foreground">
                    跟踪广告点击数据
                  </p>
                </div>
                <Switch id="click-tracking" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-close">自动关闭弹窗</Label>
                  <p className="text-sm text-muted-foreground">
                    弹窗广告自动关闭时间(秒)
                  </p>
                </div>
                <Input type="number" placeholder="10" className="w-20" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
