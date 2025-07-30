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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Crown,
  Edit,
  MoreHorizontal,
  Plus,
  Settings,
  ShoppingCart,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  GET_MEMBER_LEVELS,
  UPDATE_MEMBER_LEVEL,
} from "@/lib/graphql/queries/member-system";

interface UpgradeCondition {
  type: string;
  operator: string;
  value: number;
  valueMax?: number;
  description: string;
  weight?: number;
}

interface MaintenanceRule {
  enabled: boolean;
  period: string;
  conditions: UpgradeCondition[];
  downgradeToLevelId?: string;
  gracePeriod?: number;
  notificationDays: number[];
}

interface LevelData {
  id: string;
  name: string;
  displayName: string;
  color: string;
  level: number;
  isActive: boolean;
  upgradeConditions: UpgradeCondition[];
  pointsRequired: number;
  maintenanceRule: MaintenanceRule;
  allowDowngrade: boolean;
  autoUpgrade: boolean;
  memberCount: number;
}

interface ConditionFormData {
  type: string;
  operator: string;
  value: number;
  valueMax: number;
  description: string;
  weight: number;
}

export default function LevelRulesPage() {
  // State management
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<
    UpgradeCondition | null
  >(null);
  const [conditionForm, setConditionForm] = useState<ConditionFormData>({
    type: "POINTS",
    operator: "GTE",
    value: 0,
    valueMax: 0,
    description: "",
    weight: 1,
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
          includeBenefits: false,
          includeMemberCount: true,
        },
      },
      errorPolicy: "all",
    });

  const [updateLevel] = useMutation(UPDATE_MEMBER_LEVEL, {
    onCompleted: () => {
      refetchLevels();
      setConditionDialogOpen(false);
      setMaintenanceDialogOpen(false);
      setEditingCondition(null);
      resetConditionForm();
    },
  });

  // Data processing
  const levels = levelsData?.memberLevels?.items || [];
  const currentLevel = levels.find((level: LevelData) =>
    level.id === selectedLevel
  );

  // Condition type configurations
  const conditionTypes = [
    {
      value: "POINTS",
      label: "积分条件",
      icon: Coins,
      description: "会员积分达到指定数量",
      operators: [
        { value: "GTE", label: "大于等于" },
        { value: "GT", label: "大于" },
        { value: "BETWEEN", label: "介于" },
      ],
      unit: "积分",
    },
    {
      value: "AMOUNT",
      label: "消费金额",
      icon: ShoppingCart,
      description: "累计消费金额达到条件",
      operators: [
        { value: "GTE", label: "大于等于" },
        { value: "GT", label: "大于" },
        { value: "BETWEEN", label: "介于" },
      ],
      unit: "元",
    },
    {
      value: "ORDERS",
      label: "订单数量",
      icon: BarChart3,
      description: "订单数量达到要求",
      operators: [
        { value: "GTE", label: "大于等于" },
        { value: "GT", label: "大于" },
        { value: "BETWEEN", label: "介于" },
      ],
      unit: "笔",
    },
    {
      value: "DURATION",
      label: "会员时长",
      icon: Calendar,
      description: "成为会员的时间长度",
      operators: [
        { value: "GTE", label: "大于等于" },
        { value: "GT", label: "大于" },
      ],
      unit: "天",
    },
  ];

  const maintenancePeriods = [
    { value: "MONTHLY", label: "每月" },
    { value: "QUARTERLY", label: "每季度" },
    { value: "YEARLY", label: "每年" },
  ];

  // Event handlers
  const resetConditionForm = () => {
    setConditionForm({
      type: "POINTS",
      operator: "GTE",
      value: 0,
      valueMax: 0,
      description: "",
      weight: 1,
    });
  };

  const handleAddCondition = () => {
    if (!selectedLevel) return;
    setEditingCondition(null);
    resetConditionForm();
    setConditionDialogOpen(true);
  };

  const handleEditCondition = (condition: UpgradeCondition) => {
    setEditingCondition(condition);
    setConditionForm({
      type: condition.type,
      operator: condition.operator,
      value: condition.value,
      valueMax: condition.valueMax || 0,
      description: condition.description,
      weight: condition.weight || 1,
    });
    setConditionDialogOpen(true);
  };

  const handleSaveCondition = () => {
    if (!currentLevel) return;

    const newCondition = {
      ...conditionForm,
      valueMax: conditionForm.operator === "BETWEEN"
        ? conditionForm.valueMax
        : undefined,
    };

    let updatedConditions;
    if (editingCondition) {
      updatedConditions = currentLevel.upgradeConditions.map((condition) =>
        condition === editingCondition ? newCondition : condition
      );
    } else {
      updatedConditions = [...currentLevel.upgradeConditions, newCondition];
    }

    updateLevel({
      variables: {
        id: currentLevel.id,
        input: {
          upgradeConditions: updatedConditions,
        },
      },
    });
  };

  const handleDeleteCondition = (condition: UpgradeCondition) => {
    if (!currentLevel) return;

    const updatedConditions = currentLevel.upgradeConditions.filter((c) =>
      c !== condition
    );

    updateLevel({
      variables: {
        id: currentLevel.id,
        input: {
          upgradeConditions: updatedConditions,
        },
      },
    });
  };

  const handleToggleAutoUpgrade = (autoUpgrade: boolean) => {
    if (!currentLevel) return;

    updateLevel({
      variables: {
        id: currentLevel.id,
        input: {
          autoUpgrade,
        },
      },
    });
  };

  const handleToggleAllowDowngrade = (allowDowngrade: boolean) => {
    if (!currentLevel) return;

    updateLevel({
      variables: {
        id: currentLevel.id,
        input: {
          allowDowngrade,
        },
      },
    });
  };

  // Utility functions
  const getConditionTypeConfig = (type: string) => {
    return conditionTypes.find((t) => t.value === type) || conditionTypes[0];
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

  const formatConditionText = (condition: UpgradeCondition) => {
    const typeConfig = getConditionTypeConfig(condition.type);
    const operator = typeConfig.operators.find((op) =>
      op.value === condition.operator
    );

    if (condition.operator === "BETWEEN") {
      return `${typeConfig.label} ${operator?.label} ${condition.value} - ${condition.valueMax} ${typeConfig.unit}`;
    }
    return `${typeConfig.label} ${operator?.label} ${condition.value} ${typeConfig.unit}`;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">升级规则</h1>
          <p className="text-muted-foreground">
            配置等级升级条件、保级规则和自动升级设置
          </p>
        </div>
        <Button onClick={handleAddCondition} disabled={!selectedLevel}>
          <Plus className="h-4 w-4 mr-2" />
          添加条件
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* 等级选择 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">选择等级</CardTitle>
              <CardDescription>选择要配置规则的等级</CardDescription>
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
                          <div className="mt-2 flex items-center gap-2">
                            {level.autoUpgrade && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                自动升级
                              </Badge>
                            )}
                            {level.allowDowngrade && (
                              <Badge variant="secondary" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                允许降级
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* 规则配置 */}
        <div className="lg:col-span-3">
          {!selectedLevel
            ? (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4" />
                    <p>请先选择要配置的等级</p>
                  </div>
                </CardContent>
              </Card>
            )
            : (
              <Tabs defaultValue="upgrade" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="upgrade">升级条件</TabsTrigger>
                  <TabsTrigger value="maintenance">保级规则</TabsTrigger>
                  <TabsTrigger value="settings">其他设置</TabsTrigger>
                </TabsList>

                <TabsContent value="upgrade">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {currentLevel && getLevelBadge(currentLevel)}
                            升级条件
                          </CardTitle>
                          <CardDescription>
                            配置升级到该等级需要满足的条件
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {currentLevel?.upgradeConditions?.length === 0
                        ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Target className="h-12 w-12 mx-auto mb-4" />
                            <p>暂无升级条件</p>
                            <Button
                              onClick={handleAddCondition}
                              className="mt-4"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              添加第一个条件
                            </Button>
                          </div>
                        )
                        : (
                          <div className="space-y-4">
                            {currentLevel?.upgradeConditions?.map(
                              (condition, index) => {
                                const typeConfig = getConditionTypeConfig(
                                  condition.type,
                                );
                                const Icon = typeConfig.icon;

                                return (
                                  <Card key={index}>
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                          <Icon className="h-5 w-5 text-primary" />
                                          <div>
                                            <div className="font-medium">
                                              {formatConditionText(condition)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                              {condition.description}
                                            </div>
                                            {condition.weight &&
                                              condition.weight !== 1 && (
                                              <div className="text-xs text-muted-foreground mt-1">
                                                权重: {condition.weight}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleEditCondition(condition)}
                                            >
                                              <Edit className="mr-2 h-4 w-4" />
                                              编辑
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleDeleteCondition(
                                                  condition,
                                                )}
                                              className="text-red-600"
                                            >
                                              <Trash2 className="mr-2 h-4 w-4" />
                                              删除
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              },
                            )}

                            {currentLevel?.upgradeConditions?.length > 1 && (
                              <div className="text-center text-sm text-muted-foreground">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                需要同时满足以上所有条件才能升级
                              </div>
                            )}
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="maintenance">
                  <Card>
                    <CardHeader>
                      <CardTitle>保级规则</CardTitle>
                      <CardDescription>
                        配置等级保持和降级的规则
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">启用保级检查</h4>
                            <p className="text-sm text-muted-foreground">
                              定期检查会员是否满足等级保持条件
                            </p>
                          </div>
                          <Switch
                            checked={currentLevel?.maintenanceRule?.enabled ||
                              false}
                            onCheckedChange={(checked) => {
                              if (!currentLevel) return;
                              updateLevel({
                                variables: {
                                  id: currentLevel.id,
                                  input: {
                                    maintenanceRule: {
                                      ...currentLevel.maintenanceRule,
                                      enabled: checked,
                                    },
                                  },
                                },
                              });
                            }}
                          />
                        </div>

                        {currentLevel?.maintenanceRule?.enabled && (
                          <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>检查周期</Label>
                                <Select
                                  value={currentLevel?.maintenanceRule
                                    ?.period || "MONTHLY"}
                                  onValueChange={(value) => {
                                    if (!currentLevel) return;
                                    updateLevel({
                                      variables: {
                                        id: currentLevel.id,
                                        input: {
                                          maintenanceRule: {
                                            ...currentLevel.maintenanceRule,
                                            period: value,
                                          },
                                        },
                                      },
                                    });
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {maintenancePeriods.map((period) => (
                                      <SelectItem
                                        key={period.value}
                                        value={period.value}
                                      >
                                        {period.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>宽限期（天）</Label>
                                <Input
                                  type="number"
                                  value={currentLevel?.maintenanceRule
                                    ?.gracePeriod || 0}
                                  onChange={(e) => {
                                    if (!currentLevel) return;
                                    updateLevel({
                                      variables: {
                                        id: currentLevel.id,
                                        input: {
                                          maintenanceRule: {
                                            ...currentLevel.maintenanceRule,
                                            gracePeriod: Number(e.target.value),
                                          },
                                        },
                                      },
                                    });
                                  }}
                                  min="0"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>提醒时间（天）</Label>
                              <div className="text-sm text-muted-foreground mb-2">
                                在不满足条件时提前多少天提醒用户
                              </div>
                              <div className="flex space-x-2">
                                {[7, 15, 30].map((days) => (
                                  <Badge
                                    key={days}
                                    variant="outline"
                                    className="cursor-pointer"
                                    onClick={() => {
                                      if (!currentLevel) return;
                                      const notificationDays =
                                        currentLevel.maintenanceRule
                                          ?.notificationDays || [];
                                      const newDays =
                                        notificationDays.includes(days)
                                          ? notificationDays.filter((d) =>
                                            d !== days
                                          )
                                          : [...notificationDays, days];

                                      updateLevel({
                                        variables: {
                                          id: currentLevel.id,
                                          input: {
                                            maintenanceRule: {
                                              ...currentLevel.maintenanceRule,
                                              notificationDays: newDays,
                                            },
                                          },
                                        },
                                      });
                                    }}
                                  >
                                    {days}天
                                    {currentLevel?.maintenanceRule
                                      ?.notificationDays?.includes(days) && (
                                      <CheckCircle className="h-3 w-3 ml-1" />
                                    )}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="text-center py-4 text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">保级规则配置功能开发中...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>其他设置</CardTitle>
                      <CardDescription>
                        等级相关的其他配置选项
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">自动升级</h4>
                            <p className="text-sm text-muted-foreground">
                              当满足条件时自动升级会员等级，无需手动操作
                            </p>
                          </div>
                          <Switch
                            checked={currentLevel?.autoUpgrade || false}
                            onCheckedChange={handleToggleAutoUpgrade}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">允许降级</h4>
                            <p className="text-sm text-muted-foreground">
                              允许会员等级降级，通常用于保级规则
                            </p>
                          </div>
                          <Switch
                            checked={currentLevel?.allowDowngrade || false}
                            onCheckedChange={handleToggleAllowDowngrade}
                          />
                        </div>

                        <div className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">升级流程预览</h4>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                1
                              </div>
                              <span>条件检查</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                2
                              </div>
                              <span>
                                {currentLevel?.autoUpgrade
                                  ? "自动升级"
                                  : "手动确认"}
                              </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                3
                              </div>
                              <span>权益生效</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
        </div>
      </div>

      {/* 条件编辑对话框 */}
      <Dialog open={conditionDialogOpen} onOpenChange={setConditionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCondition ? "编辑升级条件" : "添加升级条件"}
            </DialogTitle>
            <DialogDescription>
              配置等级升级需要满足的具体条件
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">条件类型</Label>
                <Select
                  value={conditionForm.type}
                  onValueChange={(value) =>
                    setConditionForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionTypes.map((type) => (
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
                <Label htmlFor="operator">比较方式</Label>
                <Select
                  value={conditionForm.operator}
                  onValueChange={(value) =>
                    setConditionForm((prev) => ({ ...prev, operator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getConditionTypeConfig(conditionForm.type).operators.map((
                      op,
                    ) => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">
                  {conditionForm.operator === "BETWEEN" ? "最小值" : "目标值"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={conditionForm.value}
                  onChange={(e) =>
                    setConditionForm((prev) => ({
                      ...prev,
                      value: Number(e.target.value),
                    }))}
                  min="0"
                />
              </div>
              {conditionForm.operator === "BETWEEN" && (
                <div className="space-y-2">
                  <Label htmlFor="valueMax">最大值</Label>
                  <Input
                    id="valueMax"
                    type="number"
                    value={conditionForm.valueMax}
                    onChange={(e) =>
                      setConditionForm((prev) => ({
                        ...prev,
                        valueMax: Number(e.target.value),
                      }))}
                    min="0"
                  />
                </div>
              )}
              {conditionForm.operator !== "BETWEEN" && (
                <div className="space-y-2">
                  <Label htmlFor="weight">权重</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={conditionForm.weight}
                    onChange={(e) =>
                      setConditionForm((prev) => ({
                        ...prev,
                        weight: Number(e.target.value),
                      }))}
                    min="0"
                    step="0.1"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">条件描述</Label>
              <Textarea
                id="description"
                value={conditionForm.description}
                onChange={(e) =>
                  setConditionForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                placeholder="描述这个条件的具体要求"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConditionDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleSaveCondition}>
              {editingCondition ? "保存修改" : "添加条件"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
