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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  CheckCircle,
  Copy,
  Edit,
  Eye,
  Gift,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Settings,
  ShoppingCart,
  Star,
  Trash2,
  User,
} from "lucide-react";
import {
  CREATE_POINTS_RULE,
  DELETE_POINTS_RULE,
  GET_POINTS_RULES,
  UPDATE_POINTS_RULE,
} from "@/lib/graphql/queries/member-system";

interface PointsRuleData {
  id: string;
  created: string;
  updated: string;
  name: string;
  code: string;
  description?: string;
  type: string;
  points: number;
  conditions?: Record<string, unknown>;
  limitPerUser?: number;
  limitTotal?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  usageCount: number;
  createdBy?: string;
  updatedBy?: string;
}

interface RuleFormData {
  name: string;
  code: string;
  description: string;
  type: string;
  points: number;
  limitPerUser: number;
  limitTotal: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  conditions: string;
}

export default function PointsRulesPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PointsRuleData | null>(null);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);

  const [ruleForm, setRuleForm] = useState<RuleFormData>({
    name: "",
    code: "",
    description: "",
    type: "EARNED_REGISTRATION",
    points: 0,
    limitPerUser: 0,
    limitTotal: 0,
    validFrom: "",
    validTo: "",
    isActive: true,
    conditions: "{}",
  });

  // GraphQL queries and mutations
  const { data: rulesData, loading: rulesLoading, refetch: refetchRules } =
    useQuery(GET_POINTS_RULES, {
      variables: {
        query: {
          pagination: {
            page: 1,
            perPage: 100,
            sortBy: "created",
            sortOrder: "DESC",
          },
          search: searchTerm || undefined,
          type: filterType && filterType !== "all" ? filterType : undefined,
          isActive: filterStatus === "active"
            ? true
            : filterStatus === "inactive"
            ? false
            : undefined,
        },
      },
      errorPolicy: "all",
    });

  const [createRule] = useMutation(CREATE_POINTS_RULE, {
    onCompleted: () => {
      refetchRules();
      setRuleDialogOpen(false);
      resetForm();
    },
  });

  const [updateRule] = useMutation(UPDATE_POINTS_RULE, {
    onCompleted: () => {
      refetchRules();
      setRuleDialogOpen(false);
      setEditingRule(null);
      resetForm();
    },
  });

  const [deleteRule] = useMutation(DELETE_POINTS_RULE, {
    onCompleted: () => {
      refetchRules();
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    },
  });

  // Data processing
  const rules = rulesData?.pointsRules?.items || [];

  const stats = rulesData?.pointsRules?.stats;

  const filteredRules = rules.filter((rule: PointsRuleData) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || filterType === "all" ||
      rule.type === filterType;
    const matchesStatus = !filterStatus || filterStatus === "all" ||
      (filterStatus === "active" && rule.isActive) ||
      (filterStatus === "inactive" && !rule.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Event handlers
  const resetForm = () => {
    setRuleForm({
      name: "",
      code: "",
      description: "",
      type: "EARNED_REGISTRATION",
      points: 0,
      limitPerUser: 0,
      limitTotal: 0,
      validFrom: "",
      validTo: "",
      isActive: true,
      conditions: "{}",
    });
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    resetForm();
    setRuleDialogOpen(true);
  };

  const handleEditRule = (rule: PointsRuleData) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      code: rule.code,
      description: rule.description || "",
      type: rule.type,
      points: rule.points,
      limitPerUser: rule.limitPerUser || 0,
      limitTotal: rule.limitTotal || 0,
      validFrom: rule.validFrom ? rule.validFrom.split("T")[0] : "",
      validTo: rule.validTo ? rule.validTo.split("T")[0] : "",
      isActive: rule.isActive,
      conditions: JSON.stringify(rule.conditions || {}, null, 2),
    });
    setRuleDialogOpen(true);
  };

  const handleSaveRule = () => {
    const input = {
      ...ruleForm,
      conditions: ruleForm.conditions ? JSON.parse(ruleForm.conditions) : {},
      validFrom: ruleForm.validFrom || undefined,
      validTo: ruleForm.validTo || undefined,
      limitPerUser: ruleForm.limitPerUser || undefined,
      limitTotal: ruleForm.limitTotal || undefined,
    };

    if (editingRule) {
      updateRule({
        variables: {
          id: editingRule.id,
          input,
        },
      });
    } else {
      createRule({
        variables: {
          input,
        },
      });
    }
  };

  const handleDeleteRule = (ruleId: string) => {
    setRuleToDelete(ruleId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteRule({
        variables: {
          id: ruleToDelete,
        },
      });
    }
  };

  const handleToggleActive = (rule: PointsRuleData) => {
    updateRule({
      variables: {
        id: rule.id,
        input: {
          isActive: !rule.isActive,
        },
      },
    });
  };

  const handleDuplicateRule = (rule: PointsRuleData) => {
    setEditingRule(null);
    setRuleForm({
      name: `${rule.name} (复制)`,
      code: `${rule.code}_copy_${Date.now()}`,
      description: rule.description || "",
      type: rule.type,
      points: rule.points,
      limitPerUser: rule.limitPerUser || 0,
      limitTotal: rule.limitTotal || 0,
      validFrom: "",
      validTo: "",
      isActive: false,
      conditions: JSON.stringify(rule.conditions || {}, null, 2),
    });
    setRuleDialogOpen(true);
  };

  // Utility functions
  const getRuleTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      {
        label: string;
        color: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      }
    > = {
      EARNED_REGISTRATION: {
        label: "注册奖励",
        color: "bg-blue-100 text-blue-800",
        icon: User,
      },
      EARNED_LOGIN: {
        label: "登录奖励",
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
      },
      EARNED_ORDER: {
        label: "订单奖励",
        color: "bg-purple-100 text-purple-800",
        icon: ShoppingCart,
      },
      EARNED_REVIEW: {
        label: "评价奖励",
        color: "bg-yellow-100 text-yellow-800",
        icon: Star,
      },
      EARNED_REFERRAL: {
        label: "推荐奖励",
        color: "bg-pink-100 text-pink-800",
        icon: Gift,
      },
      EARNED_BIRTHDAY: {
        label: "生日奖励",
        color: "bg-orange-100 text-orange-800",
        icon: Gift,
      },
      EARNED_ADMIN: {
        label: "管理员发放",
        color: "bg-gray-100 text-gray-800",
        icon: Settings,
      },
      SPENT_EXCHANGE: {
        label: "积分兑换",
        color: "bg-red-100 text-red-800",
        icon: Gift,
      },
      SPENT_ORDER: {
        label: "订单抵扣",
        color: "bg-red-100 text-red-800",
        icon: ShoppingCart,
      },
    };

    const typeInfo = typeMap[type] ||
      { label: type, color: "bg-gray-100 text-gray-800", icon: Star };
    const Icon = typeInfo.icon;

    return (
      <Badge className={`${typeInfo.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {typeInfo.label}
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const isValidJson = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">积分规则</h1>
          <p className="text-muted-foreground">
            管理积分获得和消费规则
          </p>
        </div>
        <Button onClick={handleCreateRule}>
          <Plus className="h-4 w-4 mr-2" />
          创建规则
        </Button>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总规则数</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRules}</div>
              <p className="text-xs text-muted-foreground">
                启用 {stats.activeRules} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">奖励规则</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.earnedRules}
              </div>
              <p className="text-xs text-muted-foreground">
                积分获得规则
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">消费规则</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.spentRules}
              </div>
              <p className="text-xs text-muted-foreground">
                积分消费规则
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">使用次数</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalUsage?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                总计使用次数
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>搜索规则</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索规则名称或代码"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>规则类型</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="EARNED_REGISTRATION">注册奖励</SelectItem>
                  <SelectItem value="EARNED_LOGIN">登录奖励</SelectItem>
                  <SelectItem value="EARNED_ORDER">订单奖励</SelectItem>
                  <SelectItem value="EARNED_REVIEW">评价奖励</SelectItem>
                  <SelectItem value="EARNED_REFERRAL">推荐奖励</SelectItem>
                  <SelectItem value="EARNED_BIRTHDAY">生日奖励</SelectItem>
                  <SelectItem value="SPENT_EXCHANGE">积分兑换</SelectItem>
                  <SelectItem value="SPENT_ORDER">订单抵扣</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => refetchRules()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 规则列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>积分规则</CardTitle>
              <CardDescription>
                共 {filteredRules.length} 条规则
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {rulesLoading
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
            : filteredRules.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无积分规则
              </div>
            )
            : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>规则信息</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>积分数</TableHead>
                      <TableHead>使用限制</TableHead>
                      <TableHead>有效期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>使用次数</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRules.map((rule: PointsRuleData) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rule.name}</div>
                            <div className="text-sm text-muted-foreground">
                              代码: {rule.code}
                            </div>
                            {rule.description && (
                              <div
                                className="text-sm text-muted-foreground max-w-32 truncate"
                                title={rule.description}
                              >
                                {rule.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRuleTypeBadge(rule.type)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`font-medium ${
                              rule.points > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {rule.points > 0 ? "+" : ""}
                            {rule.points}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {rule.limitPerUser && (
                              <div>每人: {rule.limitPerUser}次</div>
                            )}
                            {rule.limitTotal && (
                              <div>总计: {rule.limitTotal}次</div>
                            )}
                            {!rule.limitPerUser && !rule.limitTotal && (
                              <span className="text-muted-foreground">
                                无限制
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {rule.validFrom && rule.validTo
                              ? (
                                <>
                                  <div>{formatDate(rule.validFrom)}</div>
                                  <div>至 {formatDate(rule.validTo)}</div>
                                </>
                              )
                              : (
                                <span className="text-muted-foreground">
                                  永久有效
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(rule.isActive)}
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={() => handleToggleActive(rule)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {rule.usageCount?.toLocaleString() || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditRule(rule)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicateRule(rule)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                查看使用记录
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteRule(rule.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
        </CardContent>
      </Card>

      {/* 规则编辑对话框 */}
      <Dialog open={ruleDialogOpen} onOpenChange={setRuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRule ? "编辑积分规则" : "创建积分规则"}
            </DialogTitle>
            <DialogDescription>
              配置积分规则的详细信息和生效条件
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">规则名称 *</Label>
                <Input
                  id="name"
                  value={ruleForm.name}
                  onChange={(e) =>
                    setRuleForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="如: 注册送积分"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">规则代码 *</Label>
                <Input
                  id="code"
                  value={ruleForm.code}
                  onChange={(e) =>
                    setRuleForm((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="如: REGISTER_REWARD"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">规则描述</Label>
              <Textarea
                id="description"
                value={ruleForm.description}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                placeholder="描述规则的用途和使用场景"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">规则类型 *</Label>
                <Select
                  value={ruleForm.type}
                  onValueChange={(value) =>
                    setRuleForm((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EARNED_REGISTRATION">
                      注册奖励
                    </SelectItem>
                    <SelectItem value="EARNED_LOGIN">登录奖励</SelectItem>
                    <SelectItem value="EARNED_ORDER">订单奖励</SelectItem>
                    <SelectItem value="EARNED_REVIEW">评价奖励</SelectItem>
                    <SelectItem value="EARNED_REFERRAL">推荐奖励</SelectItem>
                    <SelectItem value="EARNED_BIRTHDAY">生日奖励</SelectItem>
                    <SelectItem value="EARNED_ADMIN">管理员发放</SelectItem>
                    <SelectItem value="SPENT_EXCHANGE">积分兑换</SelectItem>
                    <SelectItem value="SPENT_ORDER">订单抵扣</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">积分数 *</Label>
                <Input
                  id="points"
                  type="number"
                  value={ruleForm.points}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      points: Number(e.target.value),
                    }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="limitPerUser">每人限制次数</Label>
                <Input
                  id="limitPerUser"
                  type="number"
                  value={ruleForm.limitPerUser}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      limitPerUser: Number(e.target.value),
                    }))}
                  placeholder="0 表示不限制"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limitTotal">总限制次数</Label>
                <Input
                  id="limitTotal"
                  type="number"
                  value={ruleForm.limitTotal}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      limitTotal: Number(e.target.value),
                    }))}
                  placeholder="0 表示不限制"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">生效日期</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={ruleForm.validFrom}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      validFrom: e.target.value,
                    }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">失效日期</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={ruleForm.validTo}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      validTo: e.target.value,
                    }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">规则条件 (JSON格式)</Label>
              <Textarea
                id="conditions"
                value={ruleForm.conditions}
                onChange={(e) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    conditions: e.target.value,
                  }))}
                placeholder='{"minAmount": 100, "firstOrder": true}'
                className="font-mono text-sm"
                rows={4}
              />
              {ruleForm.conditions && !isValidJson(ruleForm.conditions) && (
                <p className="text-red-600 text-sm">JSON 格式不正确</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={ruleForm.isActive}
                onCheckedChange={(checked) =>
                  setRuleForm((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">启用规则</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRuleDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleSaveRule}
              disabled={!ruleForm.name || !ruleForm.code ||
                (ruleForm.conditions !== "" &&
                  !isValidJson(ruleForm.conditions))}
            >
              {editingRule ? "保存修改" : "创建规则"}
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
              您确定要删除这个积分规则吗？此操作不可撤销，删除后相关的积分记录仍会保留。
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
