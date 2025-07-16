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
  DollarSign,
  Edit,
  Eye,
  Image,
  Plus,
  RefreshCw,
  Search,
  Target,
  Trash2,
} from "lucide-react";

// GraphQL 查询和变更
import {
  CREATE_ADVERTISEMENT,
  DELETE_ADVERTISEMENT,
  DUPLICATE_ADVERTISEMENT,
  GET_AD_OVERVIEW_STATS,
  GET_ADVERTISEMENTS,
  PAUSE_ADVERTISEMENT,
  RESUME_ADVERTISEMENT,
  UPDATE_ADVERTISEMENT,
} from "@/lib/graphql/queries";

interface Advertisement {
  id: string;
  title: string;
  description?: string;
  type: string;
  position: string;
  image_url: string;
  link_type: string;
  link_url?: string;
  content?: string;
  status: string;
  start_time: string;
  end_time: string;
  weight: number;
  click_count: number;
  view_count: number;
  budget?: number;
  cost: number;
  tags?: string[];
  created: string;
  updated: string;
}

export default function AdvertisementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "banner",
    position: "homepage_top",
    image: "",
    link_type: "url",
    link_url: "",
    content: "",
    status: "active",
    start_time: "",
    end_time: "",
    weight: 1,
    budget: 0,
    tags: [] as string[],
  });

  // GraphQL 查询
  const { data: advertisementsData, loading: adsLoading, refetch: refetchAds } =
    useQuery(
      GET_ADVERTISEMENTS,
      {
        variables: {
          input: {
            page: 1,
            perPage: 50,
            search: searchTerm || undefined,
            type: selectedType !== "all" ? selectedType : undefined,
            status: selectedStatus !== "all" ? selectedStatus : undefined,
          },
        },
        errorPolicy: "all",
      },
    );

  const { data: statsData, loading: statsLoading } = useQuery(
    GET_AD_OVERVIEW_STATS,
    { errorPolicy: "all" },
  );

  // GraphQL 变更
  const [createAd] = useMutation(CREATE_ADVERTISEMENT, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告创建成功" });
      setIsCreateDialogOpen(false);
      resetForm();
      refetchAds();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [updateAd] = useMutation(UPDATE_ADVERTISEMENT, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告更新成功" });
      setEditingAd(null);
      resetForm();
      refetchAds();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [deleteAd] = useMutation(DELETE_ADVERTISEMENT, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告删除成功" });
      refetchAds();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [duplicateAd] = useMutation(DUPLICATE_ADVERTISEMENT, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告复制成功" });
      refetchAds();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [pauseAd] = useMutation(PAUSE_ADVERTISEMENT, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告已暂停" });
      refetchAds();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [resumeAd] = useMutation(RESUME_ADVERTISEMENT, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告已恢复" });
      refetchAds();
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
      type: "banner",
      position: "homepage_top",
      image: "",
      link_type: "url",
      link_url: "",
      content: "",
      status: "active",
      start_time: "",
      end_time: "",
      weight: 1,
      budget: 0,
      tags: [],
    });
  };

  // 数据获取
  const advertisements = advertisementsData?.advertisements?.items || [];
  const stats = statsData?.adOverviewStats;

  const filteredAds = advertisements.filter((ad: Advertisement) => {
    const matchesSearch = ad.title.toLowerCase().includes(
      searchTerm.toLowerCase(),
    );
    const matchesType = selectedType === "all" || ad.type === selectedType;
    const matchesStatus = selectedStatus === "all" ||
      ad.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // 处理函数
  const handleCreateAd = () => {
    createAd({
      variables: { input: formData },
    });
  };

  const handleUpdateAd = () => {
    if (!editingAd) return;
    updateAd({
      variables: {
        id: editingAd.id,
        input: formData,
      },
    });
  };

  const handleDeleteAd = (id: string) => {
    deleteAd({ variables: { id } });
  };

  const handleDuplicateAd = (id: string) => {
    duplicateAd({ variables: { id } });
  };

  const handleToggleStatus = (id: string) => {
    const ad = advertisements.find((a: Advertisement) => a.id === id);
    if (!ad) return;

    if (ad.status === "active") {
      pauseAd({ variables: { id } });
    } else {
      resumeAd({ variables: { id } });
    }
  };

  const handleEditAd = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      name: ad.title,
      description: ad.description || "",
      type: ad.type,
      position: ad.position,
      image: ad.image,
      link_type: ad.link_type,
      link_url: ad.link_url || "",
      content: ad.content || "",
      status: ad.status,
      start_time: ad.start_time,
      end_time: ad.end_time,
      weight: ad.weight,
      budget: ad.budget || 0,
      tags: ad.tags || [],
    });
    setIsCreateDialogOpen(true);
  };

  // 统计数据
  const totalViews = stats?.totalViews || 0;
  const totalClicks = stats?.totalClicks || 0;
  const totalCost = stats?.totalCost || 0;
  const avgCtr = stats?.avgCtr || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">广告管理</h1>
          <p className="text-muted-foreground">管理所有广告位和推广内容</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchAds();
            }}
            disabled={adsLoading || statsLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                adsLoading || statsLoading ? "animate-spin" : ""
              }`}
            />
            刷新
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setEditingAd(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                创建广告
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingAd ? "编辑广告" : "创建广告"}
                </DialogTitle>
                <DialogDescription>
                  {editingAd ? "修改广告内容" : "添加新的广告内容"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad-name">广告名称</Label>
                    <Input
                      id="ad-name"
                      placeholder="输入广告名称"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-type">广告类型</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择广告类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">横幅广告</SelectItem>
                        <SelectItem value="popup">弹窗广告</SelectItem>
                        <SelectItem value="floating">浮动广告</SelectItem>
                        <SelectItem value="text">文字广告</SelectItem>
                        <SelectItem value="video">视频广告</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad-position">广告位置</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) =>
                        setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择广告位置" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage_top">首页顶部</SelectItem>
                        <SelectItem value="homepage_middle">
                          首页中部
                        </SelectItem>
                        <SelectItem value="homepage_bottom">
                          首页底部
                        </SelectItem>
                        <SelectItem value="category_top">分类页顶部</SelectItem>
                        <SelectItem value="product_detail_top">
                          商品详情顶部
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ad-weight">权重</Label>
                    <Input
                      id="ad-weight"
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
                <div>
                  <Label htmlFor="ad-image">广告图片</Label>
                  <Input
                    id="ad-image"
                    placeholder="输入图片URL"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad-link-type">链接类型</Label>
                    <Select
                      value={formData.link_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, link_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择链接类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">外部链接</SelectItem>
                        <SelectItem value="product">商品页面</SelectItem>
                        <SelectItem value="category">分类页面</SelectItem>
                        <SelectItem value="page">自定义页面</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ad-link-url">链接地址</Label>
                    <Input
                      id="ad-link-url"
                      placeholder="输入链接地址"
                      value={formData.link_url}
                      onChange={(e) =>
                        setFormData({ ...formData, link_url: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ad-start-time">开始时间</Label>
                    <Input
                      id="ad-start-time"
                      type="datetime-local"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          start_time: e.target.value,
                        })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ad-end-time">结束时间</Label>
                    <Input
                      id="ad-end-time"
                      type="datetime-local"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        status: checked ? "active" : "inactive",
                      })}
                  />
                  <Label>立即启用</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingAd(null);
                    resetForm();
                  }}
                >
                  取消
                </Button>
                <Button onClick={editingAd ? handleUpdateAd : handleCreateAd}>
                  {editingAd ? "更新广告" : "创建广告"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="advertisements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="advertisements">广告列表</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="advertisements" className="space-y-4">
          {/* 统计卡片 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总展示数</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalViews.toLocaleString()}
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
                <div className="text-2xl font-bold">{avgCtr}%</div>
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
                  预算管理中
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
                      placeholder="搜索广告名称..."
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
                    <SelectItem value="floating">浮动</SelectItem>
                    <SelectItem value="text">文字</SelectItem>
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
                    <SelectItem value="paused">暂停</SelectItem>
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
              {adsLoading
                ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                )
                : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>广告名称</TableHead>
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
                      {filteredAds.map((ad: Advertisement) => (
                        <TableRow key={ad.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                                <Image className="h-4 w-4 text-gray-400" />
                              </div>
                              <div>
                                <div className="font-medium">{ad.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  权重: {ad.weight}
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
                                : ad.type === "floating"
                                ? "浮动"
                                : ad.type === "text"
                                ? "文字"
                                : "其他"}
                            </Badge>
                          </TableCell>
                          <TableCell>{ad.position}</TableCell>
                          <TableCell>
                            <Badge
                              variant={ad.status === "active"
                                ? "default"
                                : ad.status === "paused"
                                ? "secondary"
                                : "outline"}
                            >
                              {ad.status === "active"
                                ? "启用"
                                : ad.status === "paused"
                                ? "暂停"
                                : "禁用"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {ad.view_count.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Target className="h-3 w-3" />
                                {ad.click_count.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                预算: ¥{(ad.budget || 0).toLocaleString()}
                              </div>
                              <div className="text-muted-foreground">
                                消费: ¥{ad.cost.toLocaleString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                {new Date(ad.start_time).toLocaleDateString()}
                              </div>
                              <div className="text-muted-foreground">
                                至 {new Date(ad.end_time).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={ad.status === "active"}
                                onCheckedChange={() =>
                                  handleToggleStatus(ad.id)}
                                className="h-4 w-4"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditAd(ad)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicateAd(ad.id)}
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
                                      确定要删除广告&quot;{ad
                                        .name}&quot;吗？此操作无法撤销。
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
                        总广告数
                      </CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.totalAds || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        活跃: {stats?.activeAds || 0}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        总展示数
                      </CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(stats?.totalViews || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        今日展示
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        总点击数
                      </CardTitle>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {(stats?.totalClicks || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        点击率: {(stats?.avgCtr || 0).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        总消费
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ¥{(stats?.totalCost || 0).toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        广告投入
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>广告效果分析</CardTitle>
                    <CardDescription>各广告位的投放效果统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.topPerforming && stats.topPerforming.length > 0
                      ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">表现最佳的广告</h4>
                          {stats.topPerforming.map((
                            item: {
                              id: string;
                              name: string;
                              click_count: number;
                              view_count: number;
                            },
                          ) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <span>{item.name}</span>
                              <div className="text-sm text-muted-foreground">
                                点击: {item.click_count} | 展示:{" "}
                                {item.view_count}
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
