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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coffee,
  Crown,
  Edit,
  Gift,
  Mail,
  MoreHorizontal,
  Percent,
  Phone,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import {
  GET_MEMBER_LEVELS,
  UPDATE_MEMBER_LEVEL,
} from "@/lib/graphql/queries/member-system";

interface BenefitData {
  id: string;
  type: string;
  name: string;
  description: string;
  value?: number;
  condition?: string;
  icon?: string;
  isActive: boolean;
}

interface LevelData {
  id: string;
  name: string;
  displayName: string;
  color: string;
  level: number;
  isActive: boolean;
  benefits: BenefitData[];
  discountRate: number;
  pointsRate: number;
  freeShippingThreshold: number;
  memberCount: number;
}

interface BenefitFormData {
  type: string;
  name: string;
  description: string;
  value: number;
  condition: string;
  icon: string;
  isActive: boolean;
}

export default function LevelBenefitsPage() {
  // State management
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [benefitDialogOpen, setBenefitDialogOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<BenefitData | null>(
    null,
  );
  const [benefitForm, setBenefitForm] = useState<BenefitFormData>({
    type: "DISCOUNT",
    name: "",
    description: "",
    value: 0,
    condition: "",
    icon: "🎁",
    isActive: true,
  });

  // GraphQL queries and mutations
  const { data: levelsData, loading: levelsLoading, refetch: refetchLevels } =
    useQuery(GET_MEMBER_LEVELS, {
      variables: {
        query: {
          pagination: {
            page: 1,
            perPage: 100,
            sortBy: "level",
            sortOrder: "ASC",
          },
          includeBenefits: true,
          includeMemberCount: true,
        },
      },
      errorPolicy: "all",
    });

  const [updateLevel] = useMutation(UPDATE_MEMBER_LEVEL, {
    onCompleted: () => {
      refetchLevels();
      setBenefitDialogOpen(false);
      setEditingBenefit(null);
      resetBenefitForm();
    },
  });

  // Data processing
  const levels = levelsData?.memberLevels?.items || [];
  const currentLevel = levels.find((level: LevelData) =>
    level.id === selectedLevel
  );

  // Benefit type configurations
  const benefitTypes = [
    {
      value: "DISCOUNT",
      label: "折扣优惠",
      icon: Percent,
      description: "享受商品折扣",
      valueLabel: "折扣率 (%)",
      examples: ["95折优惠", "9折特权", "85折尊享"],
    },
    {
      value: "FREE_SHIPPING",
      label: "免费配送",
      icon: Truck,
      description: "免运费服务",
      valueLabel: "免运费门槛",
      examples: ["满99免运费", "无门槛包邮", "次日达免费"],
    },
    {
      value: "PRIVILEGE",
      label: "专属特权",
      icon: Crown,
      description: "特殊权限服务",
      valueLabel: "特权等级",
      examples: ["专属客服", "优先发货", "限量商品"],
    },
    {
      value: "SERVICE",
      label: "专属服务",
      icon: Shield,
      description: "增值服务",
      valueLabel: "服务等级",
      examples: ["7天无理由退货", "30天换货", "上门取件"],
    },
    {
      value: "POINTS",
      label: "积分奖励",
      icon: Star,
      description: "额外积分倍率",
      valueLabel: "积分倍率",
      examples: ["2倍积分", "生日5倍积分", "特定商品10倍积分"],
    },
    {
      value: "CUSTOM",
      label: "自定义权益",
      icon: Sparkles,
      description: "其他特殊权益",
      valueLabel: "权益价值",
      examples: ["生日礼品", "专属活动", "定制服务"],
    },
  ];

  const benefitIcons = [
    "🎁",
    "👑",
    "⭐",
    "🚚",
    "💳",
    "🎂",
    "📞",
    "💝",
    "🔥",
    "💎",
  ];

  // Event handlers
  const resetBenefitForm = () => {
    setBenefitForm({
      type: "DISCOUNT",
      name: "",
      description: "",
      value: 0,
      condition: "",
      icon: "🎁",
      isActive: true,
    });
  };

  const handleAddBenefit = () => {
    if (!selectedLevel) return;
    setEditingBenefit(null);
    resetBenefitForm();
    setBenefitDialogOpen(true);
  };

  const handleEditBenefit = (benefit: BenefitData) => {
    setEditingBenefit(benefit);
    setBenefitForm({
      type: benefit.type,
      name: benefit.name,
      description: benefit.description,
      value: benefit.value || 0,
      condition: benefit.condition || "",
      icon: benefit.icon || "🎁",
      isActive: benefit.isActive,
    });
    setBenefitDialogOpen(true);
  };

  const handleSaveBenefit = () => {
    if (!currentLevel) return;

    const newBenefit = {
      id: editingBenefit?.id || `benefit_${Date.now()}`,
      ...benefitForm,
    };

    let updatedBenefits;
    if (editingBenefit) {
      updatedBenefits = currentLevel.benefits.map((benefit) =>
        benefit.id === editingBenefit.id ? newBenefit : benefit
      );
    } else {
      updatedBenefits = [...currentLevel.benefits, newBenefit];
    }

    updateLevel({
      variables: {
        id: currentLevel.id,
        input: {
          benefits: updatedBenefits.map(({ id, ...benefit }) => benefit),
        },
      },
    });
  };

  const handleDeleteBenefit = (benefitId: string) => {
    if (!currentLevel) return;

    const updatedBenefits = currentLevel.benefits.filter(
      (benefit) => benefit.id !== benefitId,
    );

    updateLevel({
      variables: {
        id: currentLevel.id,
        input: {
          benefits: updatedBenefits.map(({ id, ...benefit }) => benefit),
        },
      },
    });
  };

  const handleToggleBenefit = (benefitId: string, isActive: boolean) => {
    if (!currentLevel) return;

    const updatedBenefits = currentLevel.benefits.map((benefit) =>
      benefit.id === benefitId ? { ...benefit, isActive } : benefit
    );

    updateLevel({
      variables: {
        id: currentLevel.id,
        input: {
          benefits: updatedBenefits.map(({ id, ...benefit }) => benefit),
        },
      },
    });
  };

  // Utility functions
  const getBenefitTypeConfig = (type: string) => {
    return benefitTypes.find((t) => t.value === type) || benefitTypes[0];
  };

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
        <Crown className="h-3 w-3" />
        {level.displayName}
      </Badge>
    );
  };

  const getBenefitIcon = (type: string) => {
    const config = getBenefitTypeConfig(type);
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">权益管理</h1>
          <p className="text-muted-foreground">
            为不同等级配置专属权益和特权服务
          </p>
        </div>
        <Button onClick={handleAddBenefit} disabled={!selectedLevel}>
          <Plus className="h-4 w-4 mr-2" />
          添加权益
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 等级选择 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">选择等级</CardTitle>
              <CardDescription>选择要管理权益的等级</CardDescription>
            </CardHeader>
            <CardContent>
              {levelsLoading
                ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-200 rounded animate-pulse"
                      />
                    ))}
                  </div>
                )
                : (
                  <div className="space-y-2">
                    {levels.map((level: LevelData) => (
                      <Card
                        key={level.id}
                        className={`cursor-pointer transition-all ${
                          selectedLevel === level.id
                            ? "ring-2 ring-primary"
                            : "hover:shadow-md"
                        }`}
                        onClick={() => setSelectedLevel(level.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {level.displayName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {level.memberCount} 位会员
                              </div>
                            </div>
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                              style={{
                                backgroundColor: level.color + "20",
                                color: level.color,
                              }}
                            >
                              {level.level}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {level.benefits?.length || 0} 项权益
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* 权益管理 */}
        <div className="lg:col-span-3">
          {!selectedLevel
            ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-4" />
                    <p>请先选择要管理的等级</p>
                  </div>
                </CardContent>
              </Card>
            )
            : (
              <Tabs defaultValue="benefits" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="benefits">权益列表</TabsTrigger>
                  <TabsTrigger value="templates">权益模板</TabsTrigger>
                  <TabsTrigger value="stats">使用统计</TabsTrigger>
                </TabsList>

                <TabsContent value="benefits">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {currentLevel && getLevelBadge(currentLevel)}
                            权益列表
                          </CardTitle>
                          <CardDescription>
                            管理该等级的专属权益和特权
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {currentLevel?.benefits?.length === 0
                        ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Gift className="h-12 w-12 mx-auto mb-4" />
                            <p>暂无权益配置</p>
                            <Button onClick={handleAddBenefit} className="mt-4">
                              <Plus className="h-4 w-4 mr-2" />
                              添加第一个权益
                            </Button>
                          </div>
                        )
                        : (
                          <div className="space-y-4">
                            {currentLevel?.benefits?.map((benefit) => (
                              <Card key={benefit.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3">
                                      <div className="text-2xl">
                                        {benefit.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h4 className="font-medium">
                                            {benefit.name}
                                          </h4>
                                          <Badge variant="outline">
                                            {getBenefitTypeConfig(benefit.type)
                                              .label}
                                          </Badge>
                                          {!benefit.isActive && (
                                            <Badge variant="secondary">
                                              停用
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {benefit.description}
                                        </p>
                                        {benefit.value && (
                                          <div className="text-sm">
                                            <span className="font-medium">
                                              权益值:
                                            </span>
                                            {benefit.value}
                                            {benefit.type === "DISCOUNT" && "%"}
                                            {benefit.type === "POINTS" && "x"}
                                          </div>
                                        )}
                                        {benefit.condition && (
                                          <div className="text-sm text-muted-foreground">
                                            <span className="font-medium">
                                              条件:
                                            </span>
                                            {benefit.condition}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={benefit.isActive}
                                        onCheckedChange={(checked) =>
                                          handleToggleBenefit(
                                            benefit.id,
                                            checked,
                                          )}
                                      />
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleEditBenefit(benefit)}
                                          >
                                            <Edit className="mr-2 h-4 w-4" />
                                            编辑
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleDeleteBenefit(benefit.id)}
                                            className="text-red-600"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            删除
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="templates">
                  <Card>
                    <CardHeader>
                      <CardTitle>权益模板</CardTitle>
                      <CardDescription>快速选择常用的权益配置</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {benefitTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <Card
                              key={type.value}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center space-x-3 mb-3">
                                  <Icon className="h-6 w-6 text-primary" />
                                  <div>
                                    <h4 className="font-medium">
                                      {type.label}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {type.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {type.examples.map((example, index) => (
                                    <div
                                      key={index}
                                      className="text-xs text-muted-foreground"
                                    >
                                      • {example}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="stats">
                  <Card>
                    <CardHeader>
                      <CardTitle>使用统计</CardTitle>
                      <CardDescription>权益使用情况和效果分析</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        暂无统计数据
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
        </div>
      </div>

      {/* 权益编辑对话框 */}
      <Dialog open={benefitDialogOpen} onOpenChange={setBenefitDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingBenefit ? "编辑权益" : "添加权益"}
            </DialogTitle>
            <DialogDescription>
              配置会员等级的专属权益和特权
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">权益类型</Label>
                <Select
                  value={benefitForm.type}
                  onValueChange={(value) =>
                    setBenefitForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {benefitTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">权益图标</Label>
                <Select
                  value={benefitForm.icon}
                  onValueChange={(value) =>
                    setBenefitForm((prev) => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {benefitIcons.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{icon}</span>
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">权益名称</Label>
              <Input
                id="name"
                value={benefitForm.name}
                onChange={(e) =>
                  setBenefitForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="如: 95折优惠"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">权益描述</Label>
              <Textarea
                id="description"
                value={benefitForm.description}
                onChange={(e) =>
                  setBenefitForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                placeholder="详细描述权益内容和使用方式"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  {getBenefitTypeConfig(benefitForm.type).valueLabel}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={benefitForm.value}
                  onChange={(e) =>
                    setBenefitForm((prev) => ({
                      ...prev,
                      value: Number(e.target.value),
                    }))}
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">使用条件</Label>
                <Input
                  id="condition"
                  value={benefitForm.condition}
                  onChange={(e) =>
                    setBenefitForm((prev) => ({
                      ...prev,
                      condition: e.target.value,
                    }))}
                  placeholder="如: 满100元使用"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={benefitForm.isActive}
                onCheckedChange={(checked) =>
                  setBenefitForm((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">启用权益</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBenefitDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveBenefit}>
              {editingBenefit ? "保存修改" : "添加权益"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
