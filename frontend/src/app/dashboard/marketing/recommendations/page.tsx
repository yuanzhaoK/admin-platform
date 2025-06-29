"use client";

import { useState } from "react";
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
  Copy,
  Edit,
  Eye,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";

// GraphQL 查询和变更
import {
  CREATE_PRODUCT_RECOMMENDATION,
  CREATE_RECOMMENDATION_RULE,
  DELETE_PRODUCT_RECOMMENDATION,
  DELETE_RECOMMENDATION_RULE,
  DUPLICATE_RECOMMENDATION,
  GET_PRODUCT_RECOMMENDATIONS,
  GET_RECOMMENDATION_OVERVIEW_STATS,
  GET_RECOMMENDATION_RULES,
  UPDATE_PRODUCT_RECOMMENDATION,
} from "@/lib/graphql/queries";

// 类型定义
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: {
    name: string;
  };
  brand?: {
    name: string;
  };
  rating?: number;
  sales_count?: number;
}

interface ProductRecommendation {
  id: string;
  name: string;
  description?: string;
  type: string;
  position: string;
  products: Product[];
  product_ids: string[];
  display_count: number;
  sort_type: string;
  is_active: boolean;
  start_time?: string;
  end_time?: string;
  weight: number;
  click_count: number;
  conversion_count: number;
  created: string;
  updated: string;
}

interface RecommendationRule {
  id: string;
  name: string;
  description?: string;
  type: string;
  conditions: Record<string, unknown>;
  default_display_count: number;
  default_sort_type: string;
  is_system: boolean;
  created: string;
  updated: string;
}

interface TopPerformingItem {
  id: string;
  name: string;
  click_count: number;
  conversion_count: number;
}

export default function RecommendationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRecommendation, setEditingRecommendation] = useState<
    ProductRecommendation | null
  >(null);
  const { toast } = useToast();
  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "hot_products",
    position: "homepage_banner",
    display_count: 10,
    sort_type: "manual",
    is_active: true,
    weight: 1,
    product_ids: [] as string[],
  });

  const [ruleFormData, setRuleFormData] = useState({
    name: "",
    description: "",
    type: "hot_products",
    conditions: {},
    default_display_count: 10,
    default_sort_type: "manual",
  });

  // GraphQL 查询
  const {
    data: recommendationsData,
    loading: recommendationsLoading,
    refetch: refetchRecommendations,
  } = useQuery(
    GET_PRODUCT_RECOMMENDATIONS,
    {
      variables: {
        input: {
          page: 1,
          perPage: 50,
          search: searchTerm || undefined,
          type: selectedType !== "all" ? selectedType : undefined,
          position: selectedPosition !== "all" ? selectedPosition : undefined,
        },
      },
      errorPolicy: "all",
    },
  );

  const { data: rulesData, loading: rulesLoading, refetch: refetchRules } =
    useQuery(
      GET_RECOMMENDATION_RULES,
      {
        variables: { input: { page: 1, perPage: 50 } },
        errorPolicy: "all",
      },
    );

  const { data: statsData, loading: statsLoading } = useQuery(
    GET_RECOMMENDATION_OVERVIEW_STATS,
    { errorPolicy: "all" },
  );

  // GraphQL 变更
  const [createRecommendation] = useMutation(CREATE_PRODUCT_RECOMMENDATION, {
    onCompleted: () => {
      toast({ title: "成功", description: "推荐创建成功" });
      setIsCreateDialogOpen(false);
      resetForm();
      refetchRecommendations();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [updateRecommendation] = useMutation(UPDATE_PRODUCT_RECOMMENDATION, {
    onCompleted: () => {
      toast({ title: "成功", description: "推荐更新成功" });
      setEditingRecommendation(null);
      resetForm();
      refetchRecommendations();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [deleteRecommendation] = useMutation(DELETE_PRODUCT_RECOMMENDATION, {
    onCompleted: () => {
      toast({ title: "成功", description: "推荐删除成功" });
      refetchRecommendations();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [duplicateRecommendation] = useMutation(DUPLICATE_RECOMMENDATION, {
    onCompleted: () => {
      toast({ title: "成功", description: "推荐复制成功" });
      refetchRecommendations();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [createRule] = useMutation(CREATE_RECOMMENDATION_RULE, {
    onCompleted: () => {
      toast({ title: "成功", description: "规则创建成功" });
      setIsRuleDialogOpen(false);
      resetRuleForm();
      refetchRules();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [deleteRule] = useMutation(DELETE_RECOMMENDATION_RULE, {
    onCompleted: () => {
      toast({ title: "成功", description: "规则删除成功" });
      refetchRules();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "hot_products",
      position: "homepage_banner",
      display_count: 10,
      sort_type: "manual",
      is_active: true,
      weight: 1,
      product_ids: [],
    });
  };

  const resetRuleForm = () => {
    setRuleFormData({
      name: "",
      description: "",
      type: "hot_products",
      conditions: {},
      default_display_count: 10,
      default_sort_type: "manual",
    });
  };

  // 处理函数
  const handleCreateRecommendation = () => {
    createRecommendation({
      variables: { input: formData },
    });
  };

  const handleUpdateRecommendation = () => {
    if (!editingRecommendation) return;
    updateRecommendation({
      variables: {
        id: editingRecommendation.id,
        input: formData,
      },
    });
  };

  const handleDeleteRecommendation = (id: string) => {
    deleteRecommendation({ variables: { id } });
  };

  const handleDuplicateRecommendation = (id: string) => {
    duplicateRecommendation({ variables: { id } });
  };

  const handleToggleRecommendationStatus = (
    recommendation: ProductRecommendation,
  ) => {
    updateRecommendation({
      variables: {
        id: recommendation.id,
        input: { is_active: !recommendation.is_active },
      },
    });
  };

  const handleCreateRule = () => {
    createRule({
      variables: { input: ruleFormData },
    });
  };

  const handleDeleteRule = (id: string) => {
    deleteRule({ variables: { id } });
  };

  // 编辑处理
  const handleEditRecommendation = (recommendation: ProductRecommendation) => {
    setEditingRecommendation(recommendation);
    setFormData({
      name: recommendation.name,
      description: recommendation.description || "",
      type: recommendation.type,
      position: recommendation.position,
      display_count: recommendation.display_count,
      sort_type: recommendation.sort_type,
      is_active: recommendation.is_active,
      weight: recommendation.weight,
      product_ids: recommendation.product_ids,
    });
    setIsCreateDialogOpen(true);
  };

  // 数据获取
  const recommendations = recommendationsData?.productRecommendations?.items ||
    [];
  const rules = rulesData?.recommendationRules?.items || [];
  const stats = statsData?.recommendationOverviewStats;

  // 过滤逻辑
  const filteredRecommendations = recommendations.filter(
    (rec: ProductRecommendation) => {
      const matchesSearch = rec.name.toLowerCase().includes(
        searchTerm.toLowerCase(),
      );
      const matchesType = selectedType === "all" || rec.type === selectedType;
      const matchesPosition = selectedPosition === "all" ||
        rec.position.includes(selectedPosition);
      return matchesSearch && matchesType && matchesPosition;
    },
  );

  // 选项配置
  const typeOptions = [
    { value: "all", label: "全部类型" },
    { value: "hot_products", label: "热门推荐" },
    { value: "new_products", label: "新品推荐" },
    { value: "recommended_products", label: "编辑推荐" },
    { value: "category_based", label: "分类推荐" },
    { value: "user_behavior", label: "用户行为" },
    { value: "collaborative_filtering", label: "协同过滤" },
    { value: "custom_selection", label: "自定义选择" },
  ];

  const positionOptions = [
    { value: "all", label: "全部位置" },
    { value: "homepage_banner", label: "首页轮播" },
    { value: "homepage_grid", label: "首页网格" },
    { value: "category_sidebar", label: "分类侧边" },
    { value: "product_detail_related", label: "商品详情相关" },
    { value: "cart_recommend", label: "购物车推荐" },
    { value: "checkout_recommend", label: "结算推荐" },
    { value: "search_recommend", label: "搜索推荐" },
  ];

  const sortOptions = [
    { value: "manual", label: "手动排序" },
    { value: "sales_desc", label: "销量降序" },
    { value: "price_asc", label: "价格升序" },
    { value: "price_desc", label: "价格降序" },
    { value: "created_desc", label: "创建时间降序" },
    { value: "rating_desc", label: "评分降序" },
    { value: "random", label: "随机排序" },
  ];

  // 获取类型显示文本
  const getTypeLabel = (type: string) => {
    const option = typeOptions.find((opt) => opt.value === type);
    return option?.label || type;
  };

  // 获取位置显示文本
  const getPositionLabel = (position: string) => {
    const option = positionOptions.find((opt) => opt.value === position);
    return option?.label || position;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">商品推荐管理</h1>
          <p className="text-muted-foreground">管理商品推荐位置和推荐规则</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchRecommendations();
              refetchRules();
            }}
            disabled={recommendationsLoading || rulesLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                recommendationsLoading || rulesLoading ? "animate-spin" : ""
              }`}
            />
            刷新
          </Button>
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
                  <Input
                    id="rule-name"
                    placeholder="输入规则名称"
                    value={ruleFormData.name}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        name: e.target.value,
                      })}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-description">规则描述</Label>
                  <Textarea
                    id="rule-description"
                    placeholder="输入规则描述"
                    value={ruleFormData.description}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        description: e.target.value,
                      })}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-type">规则类型</Label>
                  <Select
                    value={ruleFormData.type}
                    onValueChange={(value) =>
                      setRuleFormData({ ...ruleFormData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择规则类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.slice(1).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="rule-display-count">默认显示数量</Label>
                  <Input
                    id="rule-display-count"
                    type="number"
                    placeholder="10"
                    min="1"
                    max="50"
                    value={ruleFormData.default_display_count}
                    onChange={(e) =>
                      setRuleFormData({
                        ...ruleFormData,
                        default_display_count: parseInt(e.target.value) || 10,
                      })}
                  />
                </div>
                <div>
                  <Label htmlFor="rule-sort-type">默认排序类型</Label>
                  <Select
                    value={ruleFormData.default_sort_type}
                    onValueChange={(value) =>
                      setRuleFormData({
                        ...ruleFormData,
                        default_sort_type: value,
                      })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择排序类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRuleDialogOpen(false);
                    resetRuleForm();
                  }}
                >
                  取消
                </Button>
                <Button onClick={handleCreateRule}>创建规则</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingRecommendation(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建推荐
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRecommendation ? "编辑推荐" : "创建商品推荐"}
                </DialogTitle>
                <DialogDescription>
                  {editingRecommendation
                    ? "修改推荐配置"
                    : "添加新的商品推荐位置"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rec-name">推荐名称</Label>
                    <Input
                      id="rec-name"
                      placeholder="输入推荐名称"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rec-type">推荐类型</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择推荐类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.slice(1).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rec-position">显示位置</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) =>
                        setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择显示位置" />
                      </SelectTrigger>
                      <SelectContent>
                        {positionOptions.slice(1).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rec-weight">优先级</Label>
                    <Input
                      id="rec-weight"
                      type="number"
                      placeholder="1-100"
                      min="1"
                      max="100"
                      value={formData.weight}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weight: parseInt(e.target.value) || 1,
                        })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rec-display-count">显示数量</Label>
                    <Input
                      id="rec-display-count"
                      type="number"
                      placeholder="10"
                      min="1"
                      max="50"
                      value={formData.display_count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          display_count: parseInt(e.target.value) || 10,
                        })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="rec-sort-type">排序类型</Label>
                    <Select
                      value={formData.sort_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, sort_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择排序类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="rec-description">推荐说明</Label>
                  <Textarea
                    id="rec-description"
                    placeholder="输入推荐说明"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>立即启用</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingRecommendation(null);
                    resetForm();
                  }}
                >
                  取消
                </Button>
                <Button
                  onClick={editingRecommendation
                    ? handleUpdateRecommendation
                    : handleCreateRecommendation}
                >
                  {editingRecommendation ? "更新推荐" : "创建推荐"}
                </Button>
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
                  <SelectTrigger className="w-40">
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
                  <SelectTrigger className="w-40">
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
              {recommendationsLoading
                ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                )
                : (
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
                      {filteredRecommendations.map((
                        recommendation: ProductRecommendation,
                      ) => (
                        <TableRow key={recommendation.id}>
                          <TableCell className="font-medium">
                            {recommendation.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getTypeLabel(recommendation.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getPositionLabel(recommendation.position)}
                          </TableCell>
                          <TableCell>
                            {recommendation.products?.length || 0}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={recommendation.is_active
                                ? "default"
                                : "secondary"}
                            >
                              {recommendation.is_active ? "启用" : "禁用"}
                            </Badge>
                          </TableCell>
                          <TableCell>{recommendation.weight}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {recommendation.click_count?.toLocaleString() ||
                                  0}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Eye className="h-3 w-3" />
                                点击率: {recommendation.conversion_count || 0}%
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleToggleRecommendationStatus(
                                    recommendation,
                                  )}
                              >
                                <Switch
                                  checked={recommendation.is_active}
                                  className="h-4 w-4"
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditRecommendation(recommendation)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDuplicateRecommendation(
                                    recommendation.id,
                                  )}
                              >
                                <Copy className="h-4 w-4" />
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
                                      确定要删除推荐&quot;{recommendation
                                        .name}&quot;吗？此操作无法撤销。
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
                )}
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
              {rulesLoading
                ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                )
                : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>规则名称</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>默认显示数量</TableHead>
                        <TableHead>默认排序</TableHead>
                        <TableHead>系统规则</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rules.map((rule: RecommendationRule) => (
                        <TableRow key={rule.id}>
                          <TableCell className="font-medium">
                            {rule.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getTypeLabel(rule.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>{rule.default_display_count}</TableCell>
                          <TableCell>{rule.default_sort_type}</TableCell>
                          <TableCell>
                            <Badge
                              variant={rule.is_system ? "default" : "secondary"}
                            >
                              {rule.is_system ? "系统" : "自定义"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(rule.created).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {!rule.is_system && (
                                <>
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
                                          确定要删除规则&quot;{rule
                                            .name}&quot;吗？此操作无法撤销。
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          取消
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteRule(rule.id)}
                                        >
                                          删除
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {statsLoading
            ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
              </div>
            )
            : (
              <>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        总推荐数
                      </CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.totalRecommendations || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        活跃: {stats?.activeRecommendations || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        总点击数
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(stats?.totalClicks || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        总浏览: {(stats?.totalViews || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        总转化数
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(stats?.totalConversions || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        转化率: {(stats?.avgConversionRate || 0).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        点击率
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(stats?.avgCtr || 0).toFixed(1)}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        平均点击率
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
                    {stats?.topPerforming && stats.topPerforming.length > 0
                      ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">表现最佳的推荐</h4>
                          {stats.topPerforming.map((
                            item: TopPerformingItem,
                          ) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <span>{item.name}</span>
                              <div className="text-sm text-muted-foreground">
                                点击: {item.click_count} | 转化:{" "}
                                {item.conversion_count}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                      : (
                        <p className="text-sm text-muted-foreground">
                          暂无统计数据
                        </p>
                      )}
                  </CardContent>
                </Card>
              </>
            )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
