"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useToast } from "@/hooks/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import {
  BarChart3,
  Edit,
  Eye,
  Flame,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CREATE_TRENDING_ITEM,
  CREATE_TRENDING_RULE,
  DELETE_TRENDING_ITEM,
  DELETE_TRENDING_RULE,
  GET_TRENDING_ITEMS,
  GET_TRENDING_OVERVIEW_STATS,
  GET_TRENDING_RULES,
  REFRESH_TRENDING_SCORES,
  UPDATE_TRENDING_ITEM,
  UPDATE_TRENDING_RULE,
} from "@/lib/graphql/queries";

interface TrendingFormData {
  name: string;
  description: string;
  type: string;
  product_id: string;
  category: string;
  tags: string[];
  manual_score?: number;
  status: string;
  start_time?: string;
  end_time?: string;
}

interface RuleFormData {
  name: string;
  description: string;
  type: string;
  display_count: number;
  update_frequency: string;
  calculation_method: string;
  weight_config: any;
  is_active: boolean;
  sort_order: number;
}

export default function TrendingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState<TrendingFormData>({
    name: "",
    description: "",
    type: "product",
    product_id: "",
    category: "",
    tags: [],
    status: "active",
  });
  const [ruleFormData, setRuleFormData] = useState<RuleFormData>({
    name: "",
    description: "",
    type: "product",
    display_count: 10,
    update_frequency: "daily",
    calculation_method: "composite",
    weight_config: {},
    is_active: true,
    sort_order: 0,
  });

  // GraphQL queries
  const { data: itemsData, loading: itemsLoading, refetch: refetchItems } =
    useQuery(GET_TRENDING_ITEMS, {
      variables: {
        input: {
          search: searchTerm || undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          status: selectedStatus !== "all" ? selectedStatus : undefined,
          page: 1,
          perPage: 20,
        },
      },
    });

  const {
    data: rulesData,
    loading: rulesLoading,
    refetch: refetchRules,
    ...rest
  } = useQuery<TrendingRulesResponse>(GET_TRENDING_RULES, {
    variables: {
      input: {
        page: 1,
        perPage: 20,
      },
    },
  });
  console.log("Trending Rules Data:", rulesData, rest);
  const { data: statsData, loading: statsLoading } = useQuery(
    GET_TRENDING_OVERVIEW_STATS,
  );

  // GraphQL mutations
  const [createTrendingItem] = useMutation(CREATE_TRENDING_ITEM);
  const [updateTrendingItem] = useMutation(UPDATE_TRENDING_ITEM);
  const [deleteTrendingItem] = useMutation(DELETE_TRENDING_ITEM);
  const [createTrendingRule] = useMutation(CREATE_TRENDING_RULE);
  const [updateTrendingRule] = useMutation(UPDATE_TRENDING_RULE);
  const [deleteTrendingRule] = useMutation(DELETE_TRENDING_RULE);
  const [refreshTrendingScores] = useMutation(REFRESH_TRENDING_SCORES);
  const handleCreateTrending = async () => {
    try {
      await createTrendingItem({
        variables: {
          input: {
            ...formData,
            tags: formData.tags.filter((tag) => tag.trim()),
          },
        },
      });
      toast({
        title: "创建成功",
        description: "热门项目已创建",
      });
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        type: "product",
        product_id: "",
        category: "",
        tags: [],
        status: "active",
      });
      refetchItems();
    } catch (error) {
      console.error("Error creating trending item:", error);
      toast({
        title: "创建失败",
        description: "请检查表单数据",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTrending = async () => {
    if (!editingItem) return;

    try {
      await updateTrendingItem({
        variables: {
          id: editingItem.id,
          input: {
            ...formData,
            tags: formData.tags.filter((tag) => tag.trim()),
          },
        },
      });
      toast({
        title: "更新成功",
        description: "热门项目已更新",
      });
      setEditingItem(null);
      setIsCreateDialogOpen(false);
      refetchItems();
    } catch (error) {
      console.error("Error updating trending item:", error);
      toast({
        title: "更新失败",
        description: "请检查表单数据",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrending = async (id: string) => {
    try {
      await deleteTrendingItem({
        variables: { id },
      });
      toast({
        title: "删除成功",
        description: "热门项目已删除",
      });
      refetchItems();
    } catch (error) {
      console.error("Error deleting trending item:", error);
      toast({
        title: "删除失败",
        description: "删除操作失败",
        variant: "destructive",
      });
    }
  };

  const handleCreateRule = async () => {
    try {
      await createTrendingRule({
        variables: {
          input: ruleFormData,
        },
      });
      toast({
        title: "创建成功",
        description: "热门规则已创建",
      });
      setIsRuleDialogOpen(false);
      setRuleFormData({
        name: "",
        description: "",
        type: "product",
        display_count: 10,
        update_frequency: "daily",
        calculation_method: "composite",
        weight_config: {},
        is_active: true,
        sort_order: 0,
      });
      refetchRules();
    } catch (error) {
      console.error("Error creating trending rule:", error);
      toast({
        title: "创建失败",
        description: "请检查表单数据",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteTrendingRule({
        variables: { id },
      });
      toast({
        title: "删除成功",
        description: "热门规则已删除",
      });
      refetchRules();
    } catch (error) {
      console.error("Error deleting trending rule:", error);
      toast({
        title: "删除失败",
        description: "删除操作失败",
        variant: "destructive",
      });
    }
  };

  const handleRefreshScores = async () => {
    try {
      await refreshTrendingScores();
      toast({
        title: "刷新成功",
        description: "热门分数已刷新",
      });
      refetchItems();
    } catch (error) {
      console.error("Error refreshing scores:", error);
      toast({
        title: "刷新失败",
        description: "刷新操作失败",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      type: item.type || "product",
      product_id: item.product_id || "",
      category: item.category || "",
      tags: item.tags || [],
      manual_score: item.manual_score,
      status: item.status || "active",
      start_time: item.start_time,
      end_time: item.end_time,
    });
    setIsCreateDialogOpen(true);
  };

  const trendingItems = itemsData?.trendingItems?.items || [];
  const trendingRules = rulesData?.trendingRules?.items || [];
  const overviewStats = statsData?.trendingOverviewStats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">热门管理</h1>
          <p className="text-muted-foreground">管理热门商品和规则配置</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefreshScores} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新分数
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {overviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总热门项目</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewStats.totalItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃项目</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewStats.activeItems}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewStats.totalViews.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总点击量</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overviewStats.totalClicks.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">热门项目</TabsTrigger>
          <TabsTrigger value="rules">规则配置</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>热门项目管理</CardTitle>
                  <CardDescription>管理热门商品和内容</CardDescription>
                </div>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingItem(null)}>
                      <Plus className="h-4 w-4 mr-2" />
                      添加热门项目
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? "编辑热门项目" : "创建热门项目"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          名称
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          描述
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          类型
                        </Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">商品</SelectItem>
                            <SelectItem value="category">分类</SelectItem>
                            <SelectItem value="brand">品牌</SelectItem>
                            <SelectItem value="keyword">关键词</SelectItem>
                            <SelectItem value="content">内容</SelectItem>
                            <SelectItem value="topic">话题</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="product_id" className="text-right">
                          项目ID
                        </Label>
                        <Input
                          id="product_id"
                          value={formData.product_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              product_id: e.target.value,
                            })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                          分类
                        </Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                            })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="manual_score" className="text-right">
                          手动分数
                        </Label>
                        <Input
                          id="manual_score"
                          type="number"
                          value={formData.manual_score || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              manual_score: e.target.value
                                ? Number(e.target.value)
                                : undefined,
                            })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          状态
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">启用</SelectItem>
                            <SelectItem value="inactive">禁用</SelectItem>
                            <SelectItem value="expired">过期</SelectItem>
                            <SelectItem value="pending">待处理</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button
                        onClick={editingItem
                          ? handleUpdateTrending
                          : handleCreateTrending}
                      >
                        {editingItem ? "更新" : "创建"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    placeholder="搜索热门项目..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有类型</SelectItem>
                    <SelectItem value="product">商品</SelectItem>
                    <SelectItem value="category">分类</SelectItem>
                    <SelectItem value="brand">品牌</SelectItem>
                    <SelectItem value="keyword">关键词</SelectItem>
                    <SelectItem value="content">内容</SelectItem>
                    <SelectItem value="topic">话题</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="active">启用</SelectItem>
                    <SelectItem value="inactive">禁用</SelectItem>
                    <SelectItem value="expired">过期</SelectItem>
                    <SelectItem value="pending">待处理</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>排名</TableHead>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>分数</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemsLoading
                    ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          加载中...
                        </TableCell>
                      </TableRow>
                    )
                    : trendingItems.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          暂无数据
                        </TableCell>
                      </TableRow>
                    )
                    : (
                      trendingItems.map((item: any, index: number) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mr-2">
                                {item.rank || index + 1}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.product_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.type === "product"
                                ? "商品"
                                : item.type === "category"
                                ? "分类"
                                : item.type === "brand"
                                ? "品牌"
                                : item.type === "keyword"
                                ? "关键词"
                                : item.type === "content"
                                ? "内容"
                                : item.type === "topic"
                                ? "话题"
                                : item.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.category || "-"}</TableCell>
                          <TableCell>
                            <div className="font-bold text-lg">
                              {item.score?.toFixed(1) || "0.0"}
                            </div>
                            {item.manual_score && (
                              <div className="text-xs text-muted-foreground">
                                手动: {item.manual_score}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.status === "active"
                                ? "default"
                                : "secondary"}
                            >
                              {item.status === "active"
                                ? "启用"
                                : item.status === "inactive"
                                ? "禁用"
                                : item.status === "expired"
                                ? "过期"
                                : item.status === "pending"
                                ? "待处理"
                                : item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  openEditDialog(item)}
                              >
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
                                    <AlertDialogTitle>
                                      确认删除
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      确定要删除热门项目"{item
                                        .name}"吗？此操作无法撤销。
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDeleteTrending(item.id)}
                                    >
                                      删除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>规则配置</CardTitle>
                  <CardDescription>管理热门计算规则</CardDescription>
                </div>
                <Dialog
                  open={isRuleDialogOpen}
                  onOpenChange={setIsRuleDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      添加规则
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>创建热门规则</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rule-name" className="text-right">
                          名称
                        </Label>
                        <Input
                          id="rule-name"
                          value={ruleFormData.name}
                          onChange={(e) =>
                            setRuleFormData({
                              ...ruleFormData,
                              name: e.target.value,
                            })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="rule-type" className="text-right">
                          类型
                        </Label>
                        <Select
                          value={ruleFormData.type}
                          onValueChange={(value) =>
                            setRuleFormData({ ...ruleFormData, type: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="product">商品</SelectItem>
                            <SelectItem value="category">分类</SelectItem>
                            <SelectItem value="brand">品牌</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="display-count" className="text-right">
                          显示数量
                        </Label>
                        <Input
                          id="display-count"
                          type="number"
                          value={ruleFormData.display_count}
                          onChange={(e) =>
                            setRuleFormData({
                              ...ruleFormData,
                              display_count: Number(e.target.value),
                            })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="update-frequency"
                          className="text-right"
                        >
                          更新频率
                        </Label>
                        <Select
                          value={ruleFormData.update_frequency}
                          onValueChange={(value) =>
                            setRuleFormData({
                              ...ruleFormData,
                              update_frequency: value,
                            })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">实时</SelectItem>
                            <SelectItem value="hourly">每小时</SelectItem>
                            <SelectItem value="daily">每日</SelectItem>
                            <SelectItem value="weekly">每周</SelectItem>
                            <SelectItem value="manual">手动</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor="calculation-method"
                          className="text-right"
                        >
                          计算方法
                        </Label>
                        <Select
                          value={ruleFormData.calculation_method}
                          onValueChange={(value) =>
                            setRuleFormData({
                              ...ruleFormData,
                              calculation_method: value,
                            })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view_based">
                              基于浏览量
                            </SelectItem>
                            <SelectItem value="engagement_based">
                              基于互动
                            </SelectItem>
                            <SelectItem value="purchase_based">
                              基于购买
                            </SelectItem>
                            <SelectItem value="composite">综合</SelectItem>
                            <SelectItem value="manual">手动</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsRuleDialogOpen(false)}
                      >
                        取消
                      </Button>
                      <Button onClick={handleCreateRule}>创建</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>显示数量</TableHead>
                    <TableHead>更新频率</TableHead>
                    <TableHead>计算方法</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rulesLoading
                    ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          加载中...
                        </TableCell>
                      </TableRow>
                    )
                    : trendingRules.length === 0
                    ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">
                          暂无规则
                        </TableCell>
                      </TableRow>
                    )
                    : (
                      trendingRules.map((rule: any) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">
                            {rule.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {rule.type === "product"
                                ? "商品"
                                : rule.type === "category"
                                ? "分类"
                                : rule.type === "brand"
                                ? "品牌"
                                : rule.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{rule.display_count}</TableCell>
                          <TableCell>
                            {rule.update_frequency === "realtime"
                              ? "实时"
                              : rule.update_frequency === "hourly"
                              ? "每小时"
                              : rule.update_frequency === "daily"
                              ? "每日"
                              : rule.update_frequency === "weekly"
                              ? "每周"
                              : rule.update_frequency === "manual"
                              ? "手动"
                              : rule.update_frequency}
                          </TableCell>
                          <TableCell>
                            {rule.calculation_method === "view_based"
                              ? "基于浏览量"
                              : rule.calculation_method === "engagement_based"
                              ? "基于互动"
                              : rule.calculation_method === "purchase_based"
                              ? "基于购买"
                              : rule.calculation_method === "composite"
                              ? "综合"
                              : rule.calculation_method === "manual"
                              ? "手动"
                              : rule.calculation_method}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={rule.is_active ? "default" : "secondary"}
                            >
                              {rule.is_active ? "启用" : "禁用"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
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
                                    <AlertDialogTitle>
                                      确认删除
                                    </AlertDialogTitle>
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
                      ))
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
