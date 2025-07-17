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
  Edit,
  Eye,
  EyeOff,
  Plus,
  Search,
  Settings,
  Trash2,
  Users,
} from "lucide-react";

// GraphQL 查询和变更
import {
  CREATE_AD_GROUP,
  DELETE_AD_GROUP,
  GET_AD_GROUPS,
  GET_ADVERTISEMENTS,
  UPDATE_AD_GROUP,
} from "@/lib/graphql/queries";

interface AdGroup {
  id: string;
  name: string;
  description?: string;
  position: string;
  ad_ids: string;
  display_count: number;
  rotation_type: string;
  is_active: boolean;
  created: string;
  updated: string;
  ads?: Advertisement[];
}

interface Advertisement {
  id: string;
  title: string;
  type: string;
  status: string;
}

export default function AdGroupsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AdGroup | null>(null);
  const { toast } = useToast();

  // 表单状态
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    position: "homepage_top",
    ad_ids: [] as string[],
    display_count: 3,
    rotation_type: "sequential",
    is_active: true,
  });

  // GraphQL 查询
  const { data: adGroupsData, loading: groupsLoading, refetch: refetchGroups } =
    useQuery(GET_AD_GROUPS, {
      variables: {
        input: {
          page: 1,
          perPage: 50,
          search: searchTerm || undefined,
          position: selectedPosition !== "all" ? selectedPosition : undefined,
        },
      },
      errorPolicy: "all",
    });

  const { data: advertisementsData, loading: adsLoading } = useQuery(
    GET_ADVERTISEMENTS,
    {
      variables: {
        input: {
          page: 1,
          perPage: 100,
        },
      },
      errorPolicy: "all",
    },
  );

  // GraphQL 变更
  const [createGroup] = useMutation(CREATE_AD_GROUP, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告组创建成功" });
      setIsCreateDialogOpen(false);
      resetForm();
      refetchGroups();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [updateGroup] = useMutation(UPDATE_AD_GROUP, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告组更新成功" });
      setEditingGroup(null);
      resetForm();
      refetchGroups();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [deleteGroup] = useMutation(DELETE_AD_GROUP, {
    onCompleted: () => {
      toast({ title: "成功", description: "广告组删除成功" });
      refetchGroups();
    },
    onError: (error) => {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      position: "homepage_top",
      ad_ids: [],
      display_count: 3,
      rotation_type: "sequential",
      is_active: true,
    });
  };

  const handleCreateGroup = () => {
    createGroup({
      variables: {
        input: {
          ...formData,
          ad_ids: formData.ad_ids.join(","),
        },
      },
    });
  };

  const handleUpdateGroup = () => {
    if (!editingGroup) return;

    updateGroup({
      variables: {
        id: editingGroup.id,
        input: {
          ...formData,
          ad_ids: formData.ad_ids.join(","),
        },
      },
    });
  };

  const handleDeleteGroup = (id: string) => {
    deleteGroup({ variables: { id } });
  };

  const handleEditGroup = (group: AdGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      position: group.position,
      ad_ids: group.ad_ids ? group.ad_ids.split(",") : [],
      display_count: group.display_count,
      rotation_type: group.rotation_type,
      is_active: group.is_active,
    });
  };

  const getPositionLabel = (position: string) => {
    const positions: Record<string, string> = {
      homepage_top: "首页顶部",
      homepage_middle: "首页中部",
      homepage_bottom: "首页底部",
      category_top: "分类页顶部",
      category_sidebar: "分类页侧边栏",
      product_detail_top: "商品详情页顶部",
      product_detail_bottom: "商品详情页底部",
      cart_page: "购物车页面",
      checkout_page: "结算页面",
      search_results: "搜索结果页",
      mobile_banner: "移动端横幅",
    };
    return positions[position] || position;
  };

  const getRotationTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      sequential: "顺序轮播",
      random: "随机轮播",
      weighted: "权重轮播",
    };
    return types[type] || type;
  };

  const adGroups = adGroupsData?.adGroups?.items || [];
  const advertisements = advertisementsData?.advertisements?.items || [];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">广告组管理</h1>
          <p className="text-muted-foreground">
            管理广告组，控制广告的展示位置和轮播方式
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建广告组
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>创建广告组</DialogTitle>
              <DialogDescription>
                创建一个新的广告组，选择广告并设置展示规则
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">组名称</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入广告组名称"
                  />
                </div>
                <div>
                  <Label htmlFor="position">展示位置</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage_top">首页顶部</SelectItem>
                      <SelectItem value="homepage_middle">首页中部</SelectItem>
                      <SelectItem value="homepage_bottom">首页底部</SelectItem>
                      <SelectItem value="category_top">分类页顶部</SelectItem>
                      <SelectItem value="category_sidebar">
                        分类页侧边栏
                      </SelectItem>
                      <SelectItem value="product_detail_top">
                        商品详情页顶部
                      </SelectItem>
                      <SelectItem value="product_detail_bottom">
                        商品详情页底部
                      </SelectItem>
                      <SelectItem value="cart_page">购物车页面</SelectItem>
                      <SelectItem value="checkout_page">结算页面</SelectItem>
                      <SelectItem value="search_results">搜索结果页</SelectItem>
                      <SelectItem value="mobile_banner">移动端横幅</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="description">描述</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入广告组描述"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="display_count">展示数量</Label>
                  <Input
                    id="display_count"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.display_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_count: parseInt(e.target.value),
                      })}
                  />
                </div>
                <div>
                  <Label htmlFor="rotation_type">轮播方式</Label>
                  <Select
                    value={formData.rotation_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rotation_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">顺序轮播</SelectItem>
                      <SelectItem value="random">随机轮播</SelectItem>
                      <SelectItem value="weighted">权重轮播</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">启用状态</Label>
                </div>
              </div>
              <div>
                <Label>选择广告</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {advertisements.map((ad: Advertisement) => (
                    <div
                      key={ad.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        id={ad.id}
                        checked={formData.ad_ids.includes(ad.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              ad_ids: [...formData.ad_ids, ad.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              ad_ids: formData.ad_ids.filter((id) =>
                                id !== ad.id
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={ad.id} className="text-sm">
                        {ad.title} ({ad.type})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleCreateGroup}>创建</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 p-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索广告组..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={selectedPosition}
              onValueChange={setSelectedPosition}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择位置" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有位置</SelectItem>
                <SelectItem value="homepage_top">首页顶部</SelectItem>
                <SelectItem value="homepage_middle">首页中部</SelectItem>
                <SelectItem value="homepage_bottom">首页底部</SelectItem>
                <SelectItem value="category_top">分类页顶部</SelectItem>
                <SelectItem value="category_sidebar">分类页侧边栏</SelectItem>
                <SelectItem value="product_detail_top">
                  商品详情页顶部
                </SelectItem>
                <SelectItem value="product_detail_bottom">
                  商品详情页底部
                </SelectItem>
                <SelectItem value="cart_page">购物车页面</SelectItem>
                <SelectItem value="checkout_page">结算页面</SelectItem>
                <SelectItem value="search_results">搜索结果页</SelectItem>
                <SelectItem value="mobile_banner">移动端横幅</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 广告组列表 */}
      <Card>
        <CardHeader>
          <CardTitle>广告组列表</CardTitle>
          <CardDescription>
            共 {adGroups.length} 个广告组
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupsLoading
            ? <div className="text-center py-8">加载中...</div>
            : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>组名称</TableHead>
                    <TableHead>位置</TableHead>
                    <TableHead>广告数量</TableHead>
                    <TableHead>展示数量</TableHead>
                    <TableHead>轮播方式</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adGroups.map((group: AdGroup) => (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{group.name}</div>
                          {group.description && (
                            <div className="text-sm text-muted-foreground">
                              {group.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getPositionLabel(group.position)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {group.ad_ids ? group.ad_ids.split(",").length : 0} 个
                      </TableCell>
                      <TableCell>{group.display_count} 个</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getRotationTypeLabel(group.rotation_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={group.is_active ? "default" : "secondary"}
                        >
                          {group.is_active
                            ? (
                              <>
                                <Eye className="mr-1 h-3 w-3" /> 启用
                              </>
                            )
                            : (
                              <>
                                <EyeOff className="mr-1 h-3 w-3" /> 禁用
                              </>
                            )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(group.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditGroup(group)}
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
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除广告组 {group.name}{" "}
                                  吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteGroup(group.id)}
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

      {/* 编辑对话框 */}
      {editingGroup && (
        <Dialog
          open={!!editingGroup}
          onOpenChange={() => setEditingGroup(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑广告组</DialogTitle>
              <DialogDescription>
                修改广告组的设置和广告选择
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">组名称</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })}
                    placeholder="输入广告组名称"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-position">展示位置</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) =>
                      setFormData({ ...formData, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage_top">首页顶部</SelectItem>
                      <SelectItem value="homepage_middle">首页中部</SelectItem>
                      <SelectItem value="homepage_bottom">首页底部</SelectItem>
                      <SelectItem value="category_top">分类页顶部</SelectItem>
                      <SelectItem value="category_sidebar">
                        分类页侧边栏
                      </SelectItem>
                      <SelectItem value="product_detail_top">
                        商品详情页顶部
                      </SelectItem>
                      <SelectItem value="product_detail_bottom">
                        商品详情页底部
                      </SelectItem>
                      <SelectItem value="cart_page">购物车页面</SelectItem>
                      <SelectItem value="checkout_page">结算页面</SelectItem>
                      <SelectItem value="search_results">搜索结果页</SelectItem>
                      <SelectItem value="mobile_banner">移动端横幅</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })}
                  placeholder="输入广告组描述"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-display_count">展示数量</Label>
                  <Input
                    id="edit-display_count"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.display_count}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_count: parseInt(e.target.value),
                      })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-rotation_type">轮播方式</Label>
                  <Select
                    value={formData.rotation_type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rotation_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">顺序轮播</SelectItem>
                      <SelectItem value="random">随机轮播</SelectItem>
                      <SelectItem value="weighted">权重轮播</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="edit-is_active">启用状态</Label>
                </div>
              </div>
              <div>
                <Label>选择广告</Label>
                <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {advertisements.map((ad: Advertisement) => (
                    <div
                      key={ad.id}
                      className="flex items-center space-x-2 py-1"
                    >
                      <input
                        type="checkbox"
                        id={`edit-${ad.id}`}
                        checked={formData.ad_ids.includes(ad.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              ad_ids: [...formData.ad_ids, ad.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              ad_ids: formData.ad_ids.filter((id) =>
                                id !== ad.id
                              ),
                            });
                          }
                        }}
                      />
                      <Label htmlFor={`edit-${ad.id}`} className="text-sm">
                        {ad.title} ({ad.type})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setEditingGroup(null)}
              >
                取消
              </Button>
              <Button onClick={handleUpdateGroup}>更新</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
