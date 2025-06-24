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
  Edit,
  Eye,
  Filter,
  Heart,
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

// 模拟数据类型
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  sales: number;
}

interface Recommendation {
  id: string;
  name: string;
  type: "hot" | "new" | "recommend" | "category";
  position: string;
  products: Product[];
  status: "active" | "inactive";
  priority: number;
  clicks: number;
  views: number;
  created: string;
  updated: string;
}

interface RecommendationRule {
  id: string;
  name: string;
  type: "sales" | "rating" | "views" | "new" | "category";
  condition: string;
  value: number;
  status: "active" | "inactive";
  created: string;
}

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [rules, setRules] = useState<RecommendationRule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<
    Recommendation | null
  >(null);
  const [selectedRule, setSelectedRule] = useState<RecommendationRule | null>(
    null,
  );

  // 模拟数据
  useEffect(() => {
    const mockRecommendations: Recommendation[] = [
      {
        id: "1",
        name: "首页热门推荐",
        type: "hot",
        position: "首页轮播",
        products: [
          {
            id: "p1",
            name: "iPhone 15 Pro",
            price: 7999,
            image: "/api/placeholder/100/100",
            category: "手机",
            rating: 4.8,
            sales: 1200,
          },
          {
            id: "p2",
            name: "MacBook Pro",
            price: 12999,
            image: "/api/placeholder/100/100",
            category: "电脑",
            rating: 4.9,
            sales: 800,
          },
        ],
        status: "active",
        priority: 1,
        clicks: 15420,
        views: 52800,
        created: "2024-01-01",
        updated: "2024-01-15",
      },
      {
        id: "2",
        name: "新品推荐",
        type: "new",
        position: "分类页顶部",
        products: [
          {
            id: "p3",
            name: "iPad Air",
            price: 4599,
            image: "/api/placeholder/100/100",
            category: "平板",
            rating: 4.7,
            sales: 600,
          },
        ],
        status: "active",
        priority: 2,
        clicks: 8900,
        views: 28600,
        created: "2024-01-10",
        updated: "2024-01-20",
      },
    ];

    const mockRules: RecommendationRule[] = [
      {
        id: "r1",
        name: "销量排行规则",
        type: "sales",
        condition: "大于",
        value: 100,
        status: "active",
        created: "2024-01-01",
      },
      {
        id: "r2",
        name: "评分推荐规则",
        type: "rating",
        condition: "大于等于",
        value: 4.5,
        status: "active",
        created: "2024-01-05",
      },
    ];

    setRecommendations(mockRecommendations);
    setRules(mockRules);
  }, []);

  // 过滤推荐
  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch = rec.name.toLowerCase().includes(
      searchTerm.toLowerCase(),
    );
    const matchesType = selectedType === "all" || rec.type === selectedType;
    const matchesPosition = selectedPosition === "all" ||
      rec.position.includes(selectedPosition);
    return matchesSearch && matchesType && matchesPosition;
  });

  const handleCreateRecommendation = () => {
    // 创建推荐逻辑
    setIsCreateDialogOpen(false);
  };

  const handleCreateRule = () => {
    // 创建规则逻辑
    setIsRuleDialogOpen(false);
  };

  const handleDeleteRecommendation = (id: string) => {
    setRecommendations(recommendations.filter((rec) => rec.id !== id));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((rule) => rule.id !== id));
  };

  const handleToggleStatus = (id: string, type: "recommendation" | "rule") => {
    if (type === "recommendation") {
      setRecommendations(
        recommendations.map((rec) =>
          rec.id === id
            ? {
              ...rec,
              status: rec.status === "active" ? "inactive" : "active",
            }
            : rec
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

  const typeOptions = [
    { value: "all", label: "全部类型" },
    { value: "hot", label: "热门推荐" },
    { value: "new", label: "新品推荐" },
    { value: "recommend", label: "编辑推荐" },
    { value: "category", label: "分类推荐" },
  ];

  const positionOptions = [
    { value: "all", label: "全部位置" },
    { value: "首页", label: "首页" },
    { value: "分类页", label: "分类页" },
    { value: "搜索页", label: "搜索页" },
    { value: "详情页", label: "详情页" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">商品推荐管理</h1>
          <p className="text-muted-foreground">管理商品推荐位置和推荐规则</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                推荐规则
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>创建推荐规则</DialogTitle>
                <DialogDescription>设置自动推荐商品的规则</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rule-name">规则名称</Label>
                  <Input id="rule-name" placeholder="输入规则名称" />
                </div>
                <div>
                  <Label htmlFor="rule-type">规则类型</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="选择规则类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">销量排行</SelectItem>
                      <SelectItem value="rating">评分排行</SelectItem>
                      <SelectItem value="views">浏览量排行</SelectItem>
                      <SelectItem value="new">新品推荐</SelectItem>
                      <SelectItem value="category">分类推荐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rule-condition">条件</Label>
                  <div className="flex gap-2">
                    <Select>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="条件" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gt">大于</SelectItem>
                        <SelectItem value="gte">大于等于</SelectItem>
                        <SelectItem value="lt">小于</SelectItem>
                        <SelectItem value="lte">小于等于</SelectItem>
                        <SelectItem value="eq">等于</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="数值"
                      className="flex-1"
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
                创建推荐
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建商品推荐</DialogTitle>
                <DialogDescription>添加新的商品推荐位置</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rec-name">推荐名称</Label>
                    <Input id="rec-name" placeholder="输入推荐名称" />
                  </div>
                  <div>
                    <Label htmlFor="rec-type">推荐类型</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择推荐类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hot">热门推荐</SelectItem>
                        <SelectItem value="new">新品推荐</SelectItem>
                        <SelectItem value="recommend">编辑推荐</SelectItem>
                        <SelectItem value="category">分类推荐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rec-position">显示位置</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="选择显示位置" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home-banner">首页轮播</SelectItem>
                        <SelectItem value="home-grid">首页网格</SelectItem>
                        <SelectItem value="category-top">分类页顶部</SelectItem>
                        <SelectItem value="search-side">搜索页侧边</SelectItem>
                        <SelectItem value="detail-bottom">
                          详情页底部
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rec-priority">优先级</Label>
                    <Input
                      id="rec-priority"
                      type="number"
                      placeholder="1-100"
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rec-description">推荐说明</Label>
                  <Textarea id="rec-description" placeholder="输入推荐说明" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="rec-status" />
                  <Label htmlFor="rec-status">立即启用</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  取消
                </Button>
                <Button onClick={handleCreateRecommendation}>创建推荐</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="recommendations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recommendations">推荐列表</TabsTrigger>
          <TabsTrigger value="rules">推荐规则</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="recommendations" className="space-y-4">
          {/* 过滤器 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索推荐名称..."
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
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={selectedPosition}
                  onValueChange={setSelectedPosition}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 推荐列表 */}
          <Card>
            <CardHeader>
              <CardTitle>推荐列表</CardTitle>
              <CardDescription>管理所有商品推荐位置</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>推荐名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>位置</TableHead>
                    <TableHead>商品数量</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>优先级</TableHead>
                    <TableHead>点击/浏览</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecommendations.map((recommendation) => (
                    <TableRow key={recommendation.id}>
                      <TableCell className="font-medium">
                        {recommendation.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={recommendation.type === "hot"
                            ? "destructive"
                            : recommendation.type === "new"
                            ? "default"
                            : recommendation.type === "recommend"
                            ? "secondary"
                            : "outline"}
                        >
                          {recommendation.type === "hot"
                            ? "热门"
                            : recommendation.type === "new"
                            ? "新品"
                            : recommendation.type === "recommend"
                            ? "编辑"
                            : "分类"}
                        </Badge>
                      </TableCell>
                      <TableCell>{recommendation.position}</TableCell>
                      <TableCell>{recommendation.products.length}</TableCell>
                      <TableCell>
                        <Badge
                          variant={recommendation.status === "active"
                            ? "default"
                            : "secondary"}
                        >
                          {recommendation.status === "active" ? "启用" : "禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>{recommendation.priority}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {recommendation.views.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Target className="h-3 w-3" />
                            {recommendation.clicks.toLocaleString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleStatus(
                                recommendation.id,
                                "recommendation",
                              )}
                          >
                            <Switch
                              checked={recommendation.status === "active"}
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
                                  确定要删除推荐"{recommendation
                                    .name}"吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteRecommendation(
                                      recommendation.id,
                                    )}
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
              <CardTitle>推荐规则</CardTitle>
              <CardDescription>管理自动推荐商品的规则</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>规则名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>条件</TableHead>
                    <TableHead>数值</TableHead>
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
                            : rule.type === "rating"
                            ? "评分"
                            : rule.type === "views"
                            ? "浏览"
                            : rule.type === "new"
                            ? "新品"
                            : "分类"}
                        </Badge>
                      </TableCell>
                      <TableCell>{rule.condition}</TableCell>
                      <TableCell>{rule.value}</TableCell>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总推荐数</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recommendations.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 相比上月
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总点击数</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recommendations.reduce((sum, rec) => sum + rec.clicks, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12.5% 相比上月
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总浏览数</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recommendations.reduce((sum, rec) => sum + rec.views, 0)
                    .toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8.2% 相比上月
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">点击率</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    (recommendations.reduce((sum, rec) => sum + rec.clicks, 0) /
                      recommendations.reduce(
                        (sum, rec) => sum + rec.views,
                        0,
                      )) * 100
                  ).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +3.1% 相比上月
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>推荐效果分析</CardTitle>
              <CardDescription>各推荐位置的效果对比</CardDescription>
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
