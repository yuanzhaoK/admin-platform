"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  Coins,
  Crown,
  Edit,
  Eye,
  Filter,
  Gift,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CREATE_MEMBER_LEVEL,
  DELETE_MEMBER_LEVEL,
  GET_MEMBER_LEVEL_STATS,
  GET_MEMBER_LEVELS,
  UPDATE_MEMBER_LEVEL,
} from "@/lib/graphql/queries/member-system";

interface LevelData {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  slogan?: string;
  icon?: string;
  color: string;
  backgroundColor?: string;
  badgeImage?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  isDefault: boolean;
  upgradeConditions: Array<{
    type: string;
    operator: string;
    value: number;
    valueMax?: number;
    description: string;
    weight?: number;
  }>;
  pointsRequired: number;
  benefits: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    value?: number;
    condition?: string;
    icon?: string;
    isActive: boolean;
  }>;
  discountRate: number;
  pointsRate: number;
  freeShippingThreshold: number;
  memberCount: number;
  averageOrderValue: number;
  totalRevenue: number;
  allowDowngrade: boolean;
  autoUpgrade: boolean;
}

interface LevelFormData {
  name: string;
  displayName: string;
  description: string;
  slogan: string;
  color: string;
  backgroundColor: string;
  level: number;
  pointsRequired: number;
  discountRate: number;
  pointsRate: number;
  freeShippingThreshold: number;
  isActive: boolean;
  isDefault: boolean;
  allowDowngrade: boolean;
  autoUpgrade: boolean;
}

export default function MemberLevelsListPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);
  const [levelToDelete, setLevelToDelete] = useState<string | null>(null);

  const [levelForm, setLevelForm] = useState<LevelFormData>({
    name: "",
    displayName: "",
    description: "",
    slogan: "",
    color: "#3b82f6",
    backgroundColor: "#eff6ff",
    level: 1,
    pointsRequired: 0,
    discountRate: 0,
    pointsRate: 1,
    freeShippingThreshold: 0,
    isActive: true,
    isDefault: false,
    allowDowngrade: false,
    autoUpgrade: true,
  });

  // GraphQL queries and mutations
  const { data: levelsData, loading: levelsLoading, refetch: refetchLevels } =
    useQuery(GET_MEMBER_LEVELS, {
      variables: {
        query: {
          pagination: {
            page: 1,
            perPage: 100,
            sortBy: "sortOrder",
            sortOrder: "ASC",
          },
          includeBenefits: true,
          includeStats: true,
          includeMemberCount: true,
        },
      },
      errorPolicy: "all",
    });

  const { data: statsData } = useQuery(GET_MEMBER_LEVEL_STATS, {
    errorPolicy: "all",
  });

  const [createLevel] = useMutation(CREATE_MEMBER_LEVEL, {
    onCompleted: () => {
      refetchLevels();
      setLevelDialogOpen(false);
      resetForm();
    },
  });

  const [updateLevel] = useMutation(UPDATE_MEMBER_LEVEL, {
    onCompleted: () => {
      refetchLevels();
      setLevelDialogOpen(false);
      setEditingLevel(null);
      resetForm();
    },
  });

  const [deleteLevel] = useMutation(DELETE_MEMBER_LEVEL, {
    onCompleted: () => {
      refetchLevels();
      setDeleteDialogOpen(false);
      setLevelToDelete(null);
    },
  });

  // Data processing
  const levels = levelsData?.memberLevels?.items || [];
  const levelStats = statsData?.memberLevelStats?.overview;

  const filteredLevels = levels.filter((level: LevelData) => {
    const matchesSearch =
      level.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      level.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = showInactive || level.isActive;
    return matchesSearch && matchesStatus;
  });

  // Event handlers
  const resetForm = () => {
    setLevelForm({
      name: "",
      displayName: "",
      description: "",
      slogan: "",
      color: "#3b82f6",
      backgroundColor: "#eff6ff",
      level: levels.length + 1,
      pointsRequired: 0,
      discountRate: 0,
      pointsRate: 1,
      freeShippingThreshold: 0,
      isActive: true,
      isDefault: false,
      allowDowngrade: false,
      autoUpgrade: true,
    });
  };

  const handleCreateLevel = () => {
    setEditingLevel(null);
    resetForm();
    setLevelDialogOpen(true);
  };

  const handleEditLevel = (level: LevelData) => {
    setEditingLevel(level);
    setLevelForm({
      name: level.name,
      displayName: level.displayName,
      description: level.description || "",
      slogan: level.slogan || "",
      color: level.color,
      backgroundColor: level.backgroundColor || "",
      level: level.level,
      pointsRequired: level.pointsRequired,
      discountRate: level.discountRate,
      pointsRate: level.pointsRate,
      freeShippingThreshold: level.freeShippingThreshold,
      isActive: level.isActive,
      isDefault: level.isDefault,
      allowDowngrade: level.allowDowngrade,
      autoUpgrade: level.autoUpgrade,
    });
    setLevelDialogOpen(true);
  };

  const handleSaveLevel = () => {
    const input = {
      ...levelForm,
      upgradeConditions: [
        {
          type: "POINTS",
          operator: "GTE",
          value: levelForm.pointsRequired,
          description: `需要 ${levelForm.pointsRequired} 积分`,
          weight: 1,
        },
      ],
      benefits: [],
      sortOrder: levelForm.level,
    };

    if (editingLevel) {
      updateLevel({
        variables: {
          id: editingLevel.id,
          input,
        },
      });
    } else {
      createLevel({
        variables: {
          input,
        },
      });
    }
  };

  const handleDeleteLevel = (levelId: string) => {
    setLevelToDelete(levelId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (levelToDelete) {
      deleteLevel({
        variables: {
          id: levelToDelete,
        },
      });
    }
  };

  // Utility functions
  const getLevelBadge = (level: LevelData) => {
    return (
      <Badge
        style={{
          backgroundColor: level.color + "20",
          color: level.color,
          borderColor: level.color,
        }}
        variant="outline"
        className="flex items-center gap-1"
      >
        {level.icon && <span>{level.icon}</span>}
        <Crown className="h-3 w-3" />
        {level.displayName}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "启用" : "停用"}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const getBenefitTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      DISCOUNT: "折扣优惠",
      FREE_SHIPPING: "免费配送",
      PRIVILEGE: "专属特权",
      SERVICE: "专属服务",
      POINTS: "积分奖励",
      CUSTOM: "自定义",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">等级管理</h1>
          <p className="text-muted-foreground">
            管理会员等级体系、权益设置和升级规则
          </p>
        </div>
        <Button onClick={handleCreateLevel}>
          <Plus className="h-4 w-4 mr-2" />
          创建等级
        </Button>
      </div>

      {/* 统计卡片 */}
      {levelStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总等级数</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{levelStats.totalLevels}</div>
              <p className="text-xs text-muted-foreground">
                启用 {levelStats.activeLevels} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">会员分布</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {levelStats.totalMembers}
              </div>
              <p className="text-xs text-muted-foreground">
                平均等级 {levelStats.averageUpgradeTime?.toFixed(1) || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">升级活跃度</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89.5%</div>
              <p className="text-xs text-muted-foreground">
                本月升级率
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">权益使用</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">76.3%</div>
              <p className="text-xs text-muted-foreground">
                权益使用率
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">搜索筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索等级名称"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive">显示停用等级</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 等级列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>等级列表</CardTitle>
              <CardDescription>
                共 {filteredLevels.length} 个等级
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {levelsLoading
            ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )
            : filteredLevels.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无等级数据
              </div>
            )
            : (
              <div className="space-y-4">
                {filteredLevels.map((level: LevelData) => (
                  <Card key={level.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {/* 等级图标 */}
                          <div
                            className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold"
                            style={{
                              backgroundColor: level.backgroundColor ||
                                level.color + "20",
                              color: level.color,
                            }}
                          >
                            {level.icon || level.level}
                          </div>

                          {/* 等级信息 */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold">
                                {level.displayName}
                              </h3>
                              {getLevelBadge(level)}
                              {getStatusBadge(level.isActive)}
                              {level.isDefault && (
                                <Badge variant="outline">默认等级</Badge>
                              )}
                            </div>

                            {level.slogan && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {level.slogan}
                              </p>
                            )}

                            {level.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {level.description}
                              </p>
                            )}

                            {/* 等级属性 */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span>
                                  需要 {level.pointsRequired.toLocaleString()}
                                  {" "}
                                  积分
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Percent className="h-4 w-4 text-green-500" />
                                <span>{level.discountRate}% 折扣</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-purple-500" />
                                <span>{level.pointsRate}x 积分</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>{level.memberCount} 位会员</span>
                              </div>
                            </div>

                            {/* 权益列表 */}
                            {level.benefits && level.benefits.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                  {level.benefits.slice(0, 3).map((
                                    benefit,
                                    index,
                                  ) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <Gift className="h-3 w-3 mr-1" />
                                      {benefit.name}
                                    </Badge>
                                  ))}
                                  {level.benefits.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      +{level.benefits.length - 3} 项权益
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditLevel(level)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              编辑等级
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Gift className="mr-2 h-4 w-4" />
                              管理权益
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              升级规则
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              查看统计
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleDeleteLevel(level.id)}
                              className="text-red-600"
                              disabled={level.isDefault}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除等级
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* 统计信息 */}
                      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">平均订单值</span>
                          <div className="text-base font-semibold text-foreground">
                            {formatCurrency(level.averageOrderValue)}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">总贡献收入</span>
                          <div className="text-base font-semibold text-foreground">
                            {formatCurrency(level.totalRevenue)}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">会员占比</span>
                          <div className="text-base font-semibold text-foreground">
                            {((level.memberCount /
                              (levelStats?.totalMembers || 1)) * 100).toFixed(
                                1,
                              )}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

      {/* 等级编辑对话框 */}
      <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? "编辑等级" : "创建等级"}
            </DialogTitle>
            <DialogDescription>
              配置会员等级的基本信息和权益设置
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">等级代码</Label>
                <Input
                  id="name"
                  value={levelForm.name}
                  onChange={(e) =>
                    setLevelForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="如: bronze, silver"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">显示名称</Label>
                <Input
                  id="displayName"
                  value={levelForm.displayName}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      displayName: e.target.value,
                    }))}
                  placeholder="如: 青铜会员"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slogan">等级标语</Label>
              <Input
                id="slogan"
                value={levelForm.slogan}
                onChange={(e) =>
                  setLevelForm((prev) => ({ ...prev, slogan: e.target.value }))}
                placeholder="简短的等级宣传语"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">等级描述</Label>
              <Textarea
                id="description"
                value={levelForm.description}
                onChange={(e) =>
                  setLevelForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                placeholder="详细描述等级特点和权益"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">等级序号</Label>
                <Input
                  id="level"
                  type="number"
                  value={levelForm.level}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      level: Number(e.target.value),
                    }))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">主题色</Label>
                <Input
                  id="color"
                  type="color"
                  value={levelForm.color}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">背景色</Label>
                <Input
                  id="backgroundColor"
                  type="color"
                  value={levelForm.backgroundColor}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      backgroundColor: e.target.value,
                    }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsRequired">所需积分</Label>
                <Input
                  id="pointsRequired"
                  type="number"
                  value={levelForm.pointsRequired}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      pointsRequired: Number(e.target.value),
                    }))}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountRate">折扣率 (%)</Label>
                <Input
                  id="discountRate"
                  type="number"
                  value={levelForm.discountRate}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      discountRate: Number(e.target.value),
                    }))}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsRate">积分倍率</Label>
                <Input
                  id="pointsRate"
                  type="number"
                  value={levelForm.pointsRate}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      pointsRate: Number(e.target.value),
                    }))}
                  min="1"
                  step="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freeShippingThreshold">包邮门槛</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  value={levelForm.freeShippingThreshold}
                  onChange={(e) =>
                    setLevelForm((prev) => ({
                      ...prev,
                      freeShippingThreshold: Number(e.target.value),
                    }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={levelForm.isActive}
                  onCheckedChange={(checked) =>
                    setLevelForm((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">启用等级</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={levelForm.isDefault}
                  onCheckedChange={(checked) =>
                    setLevelForm((prev) => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">默认等级</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoUpgrade"
                  checked={levelForm.autoUpgrade}
                  onCheckedChange={(checked) =>
                    setLevelForm((prev) => ({ ...prev, autoUpgrade: checked }))}
                />
                <Label htmlFor="autoUpgrade">自动升级</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLevelDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveLevel}>
              {editingLevel ? "保存修改" : "创建等级"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个等级吗？此操作不可撤销，已属于该等级的会员将被调整到默认等级。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
