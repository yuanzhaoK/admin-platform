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
  CreditCard,
  Edit,
  Eye,
  Gift,
  MoreHorizontal,
  Package,
  Plus,
  RefreshCcw,
  Search,
  ShoppingBag,
  Star,
  Ticket,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  CREATE_POINTS_EXCHANGE,
  DELETE_POINTS_EXCHANGE,
  GET_POINTS_EXCHANGES,
  UPDATE_POINTS_EXCHANGE,
} from "@/lib/graphql/queries/member-system";

interface PointsExchangeData {
  id: string;
  created: string;
  updated: string;
  name: string;
  description?: string;
  exchangeType: string;
  pointsRequired: number;
  rewardValue?: number;
  stockTotal?: number;
  stockRemaining?: number;
  limitPerUser?: number;
  validFrom?: string;
  validTo?: string;
  isActive: boolean;
  exchangeCount: number;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdBy?: string;
  updatedBy?: string;
}

interface ExchangeFormData {
  name: string;
  description: string;
  exchangeType: string;
  pointsRequired: number;
  rewardValue: number;
  stockTotal: number;
  limitPerUser: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  category: string;
  tags: string;
  imageUrl: string;
  metadata: string;
}

export default function PointsExchangesPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingExchange, setEditingExchange] = useState<
    PointsExchangeData | null
  >(null);
  const [exchangeToDelete, setExchangeToDelete] = useState<string | null>(null);

  const [exchangeForm, setExchangeForm] = useState<ExchangeFormData>({
    name: "",
    description: "",
    exchangeType: "BALANCE",
    pointsRequired: 0,
    rewardValue: 0,
    stockTotal: 0,
    limitPerUser: 0,
    validFrom: "",
    validTo: "",
    isActive: true,
    category: "",
    tags: "",
    imageUrl: "",
    metadata: "{}",
  });

  // GraphQL queries and mutations
  const {
    data: exchangesData,
    loading: exchangesLoading,
    refetch: refetchExchanges,
  } = useQuery(GET_POINTS_EXCHANGES, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 100,
          sortBy: "created",
          sortOrder: "DESC",
        },
        search: searchTerm || undefined,
        exchangeType: filterType && filterType !== "all"
          ? filterType
          : undefined,
        isActive: filterStatus === "active"
          ? true
          : filterStatus === "inactive"
          ? false
          : undefined,
      },
    },
    errorPolicy: "all",
  });

  const [createExchange] = useMutation(CREATE_POINTS_EXCHANGE, {
    onCompleted: () => {
      refetchExchanges();
      setExchangeDialogOpen(false);
      resetForm();
    },
  });

  const [updateExchange] = useMutation(UPDATE_POINTS_EXCHANGE, {
    onCompleted: () => {
      refetchExchanges();
      setExchangeDialogOpen(false);
      setEditingExchange(null);
      resetForm();
    },
  });

  const [deleteExchange] = useMutation(DELETE_POINTS_EXCHANGE, {
    onCompleted: () => {
      refetchExchanges();
      setDeleteDialogOpen(false);
      setExchangeToDelete(null);
    },
  });

  // Data processing
  const exchanges = exchangesData?.pointsExchanges?.items || [];
  const stats = exchangesData?.pointsExchanges?.stats;

  const filteredExchanges = exchanges.filter((exchange: PointsExchangeData) => {
    const matchesSearch =
      exchange.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exchange.description &&
        exchange.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = !filterType || filterType === "all" ||
      exchange.exchangeType === filterType;
    const matchesStatus = !filterStatus || filterStatus === "all" ||
      (filterStatus === "active" && exchange.isActive) ||
      (filterStatus === "inactive" && !exchange.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  // Event handlers
  const resetForm = () => {
    setExchangeForm({
      name: "",
      description: "",
      exchangeType: "BALANCE",
      pointsRequired: 0,
      rewardValue: 0,
      stockTotal: 0,
      limitPerUser: 0,
      validFrom: "",
      validTo: "",
      isActive: true,
      category: "",
      tags: "",
      imageUrl: "",
      metadata: "{}",
    });
  };

  const handleCreateExchange = () => {
    setEditingExchange(null);
    resetForm();
    setExchangeDialogOpen(true);
  };

  const handleEditExchange = (exchange: PointsExchangeData) => {
    setEditingExchange(exchange);
    setExchangeForm({
      name: exchange.name,
      description: exchange.description || "",
      exchangeType: exchange.exchangeType,
      pointsRequired: exchange.pointsRequired,
      rewardValue: exchange.rewardValue || 0,
      stockTotal: exchange.stockTotal || 0,
      limitPerUser: exchange.limitPerUser || 0,
      validFrom: exchange.validFrom ? exchange.validFrom.split("T")[0] : "",
      validTo: exchange.validTo ? exchange.validTo.split("T")[0] : "",
      isActive: exchange.isActive,
      category: exchange.category || "",
      tags: exchange.tags?.join(", ") || "",
      imageUrl: exchange.imageUrl || "",
      metadata: JSON.stringify(exchange.metadata || {}, null, 2),
    });
    setExchangeDialogOpen(true);
  };

  const handleSaveExchange = () => {
    const input = {
      ...exchangeForm,
      metadata: exchangeForm.metadata ? JSON.parse(exchangeForm.metadata) : {},
      tags: exchangeForm.tags
        ? exchangeForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [],
      validFrom: exchangeForm.validFrom || undefined,
      validTo: exchangeForm.validTo || undefined,
      stockTotal: exchangeForm.stockTotal || undefined,
      limitPerUser: exchangeForm.limitPerUser || undefined,
      rewardValue: exchangeForm.rewardValue || undefined,
      category: exchangeForm.category || undefined,
      imageUrl: exchangeForm.imageUrl || undefined,
    };

    if (editingExchange) {
      updateExchange({
        variables: {
          id: editingExchange.id,
          input,
        },
      });
    } else {
      createExchange({
        variables: {
          input,
        },
      });
    }
  };

  const handleDeleteExchange = (exchangeId: string) => {
    setExchangeToDelete(exchangeId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (exchangeToDelete) {
      deleteExchange({
        variables: {
          id: exchangeToDelete,
        },
      });
    }
  };

  const handleToggleActive = (exchange: PointsExchangeData) => {
    updateExchange({
      variables: {
        id: exchange.id,
        input: {
          isActive: !exchange.isActive,
        },
      },
    });
  };

  const handleDuplicateExchange = (exchange: PointsExchangeData) => {
    setEditingExchange(null);
    setExchangeForm({
      name: `${exchange.name} (复制)`,
      description: exchange.description || "",
      exchangeType: exchange.exchangeType,
      pointsRequired: exchange.pointsRequired,
      rewardValue: exchange.rewardValue || 0,
      stockTotal: exchange.stockTotal || 0,
      limitPerUser: exchange.limitPerUser || 0,
      validFrom: "",
      validTo: "",
      isActive: false,
      category: exchange.category || "",
      tags: exchange.tags?.join(", ") || "",
      imageUrl: exchange.imageUrl || "",
      metadata: JSON.stringify(exchange.metadata || {}, null, 2),
    });
    setExchangeDialogOpen(true);
  };

  // Utility functions
  const getExchangeTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      {
        label: string;
        color: string;
        icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
      }
    > = {
      BALANCE: {
        label: "余额充值",
        color: "bg-green-100 text-green-800",
        icon: Wallet,
      },
      COUPON: {
        label: "优惠券",
        color: "bg-red-100 text-red-800",
        icon: Ticket,
      },
      PRODUCT: {
        label: "实物商品",
        color: "bg-blue-100 text-blue-800",
        icon: Package,
      },
      SERVICE: {
        label: "服务权益",
        color: "bg-purple-100 text-purple-800",
        icon: Star,
      },
      CARD: {
        label: "卡券",
        color: "bg-yellow-100 text-yellow-800",
        icon: CreditCard,
      },
      CUSTOM: {
        label: "自定义",
        color: "bg-gray-100 text-gray-800",
        icon: Gift,
      },
    };

    const typeInfo = typeMap[type] ||
      { label: type, color: "bg-gray-100 text-gray-800", icon: Gift };
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
        {isActive ? "上架" : "下架"}
      </Badge>
    );
  };

  const getStockStatus = (stockTotal?: number, stockRemaining?: number) => {
    if (!stockTotal) return null;

    const usedStock = stockTotal - (stockRemaining || 0);
    const usageRate = (usedStock / stockTotal) * 100;

    if (stockRemaining === 0) {
      return <Badge variant="destructive">售罄</Badge>;
    } else if (usageRate >= 80) {
      return (
        <Badge variant="outline" className="text-orange-600">库存紧张</Badge>
      );
    }
    return null;
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
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
          <h1 className="text-2xl font-bold tracking-tight">积分兑换</h1>
          <p className="text-muted-foreground">
            管理积分兑换商品和服务
          </p>
        </div>
        <Button onClick={handleCreateExchange}>
          <Plus className="h-4 w-4 mr-2" />
          添加兑换
        </Button>
      </div>

      {/* 统计概览 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">兑换商品</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalExchanges}</div>
              <p className="text-xs text-muted-foreground">
                上架 {stats.activeExchanges} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">兑换次数</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalRedemptions?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                本月兑换 {stats.monthlyRedemptions || 0} 次
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">积分消耗</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalPointsSpent?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                本月消耗 {stats.monthlyPointsSpent?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">热门商品</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.popularExchanges || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                兑换量前10%
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
              <Label>搜索商品</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索商品名称或描述"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>兑换类型</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="BALANCE">余额充值</SelectItem>
                  <SelectItem value="COUPON">优惠券</SelectItem>
                  <SelectItem value="PRODUCT">实物商品</SelectItem>
                  <SelectItem value="SERVICE">服务权益</SelectItem>
                  <SelectItem value="CARD">卡券</SelectItem>
                  <SelectItem value="CUSTOM">自定义</SelectItem>
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
                  <SelectItem value="active">上架</SelectItem>
                  <SelectItem value="inactive">下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => refetchExchanges()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 兑换列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>兑换商品</CardTitle>
              <CardDescription>
                共 {filteredExchanges.length} 个商品
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {exchangesLoading
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
            : filteredExchanges.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无兑换商品
              </div>
            )
            : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品信息</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>积分价格</TableHead>
                      <TableHead>价值/库存</TableHead>
                      <TableHead>兑换限制</TableHead>
                      <TableHead>有效期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>兑换次数</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExchanges.map((exchange: PointsExchangeData) => (
                      <TableRow key={exchange.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {exchange.imageUrl
                              ? (
                                <img
                                  src={exchange.imageUrl}
                                  alt={exchange.name}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              )
                              : (
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                  <Gift className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            <div>
                              <div className="font-medium">{exchange.name}</div>
                              {exchange.description && (
                                <div
                                  className="text-sm text-muted-foreground max-w-32 truncate"
                                  title={exchange.description}
                                >
                                  {exchange.description}
                                </div>
                              )}
                              {exchange.category && (
                                <div className="text-xs text-muted-foreground">
                                  分类: {exchange.category}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getExchangeTypeBadge(exchange.exchangeType)}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-orange-600">
                            {exchange.pointsRequired.toLocaleString()} 积分
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {exchange.rewardValue && (
                              <div className="font-medium">
                                价值 {formatCurrency(exchange.rewardValue)}
                              </div>
                            )}
                            {exchange.stockTotal
                              ? (
                                <div className="flex items-center space-x-2">
                                  <span>
                                    库存 {exchange.stockRemaining}/{exchange
                                      .stockTotal}
                                  </span>
                                  {getStockStatus(
                                    exchange.stockTotal,
                                    exchange.stockRemaining,
                                  )}
                                </div>
                              )
                              : (
                                <span className="text-muted-foreground">
                                  无库存限制
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {exchange.limitPerUser
                              ? <div>每人限 {exchange.limitPerUser} 次</div>
                              : (
                                <span className="text-muted-foreground">
                                  无限制
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {exchange.validFrom && exchange.validTo
                              ? (
                                <>
                                  <div>{formatDate(exchange.validFrom)}</div>
                                  <div>至 {formatDate(exchange.validTo)}</div>
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
                            {getStatusBadge(exchange.isActive)}
                            <Switch
                              checked={exchange.isActive}
                              onCheckedChange={() =>
                                handleToggleActive(exchange)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {exchange.exchangeCount?.toLocaleString() || 0}
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
                                onClick={() => handleEditExchange(exchange)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDuplicateExchange(exchange)}
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                复制
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                查看兑换记录
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeleteExchange(exchange.id)}
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

      {/* 兑换编辑对话框 */}
      <Dialog open={exchangeDialogOpen} onOpenChange={setExchangeDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingExchange ? "编辑兑换商品" : "添加兑换商品"}
            </DialogTitle>
            <DialogDescription>
              配置积分兑换商品的详细信息和兑换条件
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">商品名称 *</Label>
                <Input
                  id="name"
                  value={exchangeForm.name}
                  onChange={(e) => setExchangeForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))}
                  placeholder="如: 10元余额充值"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exchangeType">兑换类型 *</Label>
                <Select
                  value={exchangeForm.exchangeType}
                  onValueChange={(value) =>
                    setExchangeForm((prev) => ({
                      ...prev,
                      exchangeType: value,
                    }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BALANCE">余额充值</SelectItem>
                    <SelectItem value="COUPON">优惠券</SelectItem>
                    <SelectItem value="PRODUCT">实物商品</SelectItem>
                    <SelectItem value="SERVICE">服务权益</SelectItem>
                    <SelectItem value="CARD">卡券</SelectItem>
                    <SelectItem value="CUSTOM">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">商品描述</Label>
              <Textarea
                id="description"
                value={exchangeForm.description}
                onChange={(e) =>
                  setExchangeForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
                placeholder="描述商品的详细信息和使用说明"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pointsRequired">所需积分 *</Label>
                <Input
                  id="pointsRequired"
                  type="number"
                  value={exchangeForm.pointsRequired}
                  onChange={(e) =>
                    setExchangeForm((prev) => ({
                      ...prev,
                      pointsRequired: Number(e.target.value),
                    }))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rewardValue">商品价值</Label>
                <Input
                  id="rewardValue"
                  type="number"
                  value={exchangeForm.rewardValue}
                  onChange={(e) =>
                    setExchangeForm((prev) => ({
                      ...prev,
                      rewardValue: Number(e.target.value),
                    }))}
                  step="0.01"
                  min="0"
                  placeholder="现金价值"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limitPerUser">每人限制</Label>
                <Input
                  id="limitPerUser"
                  type="number"
                  value={exchangeForm.limitPerUser}
                  onChange={(e) =>
                    setExchangeForm((prev) => ({
                      ...prev,
                      limitPerUser: Number(e.target.value),
                    }))}
                  placeholder="0 表示不限制"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockTotal">库存总量</Label>
                <Input
                  id="stockTotal"
                  type="number"
                  value={exchangeForm.stockTotal}
                  onChange={(e) =>
                    setExchangeForm((prev) => ({
                      ...prev,
                      stockTotal: Number(e.target.value),
                    }))}
                  placeholder="0 表示无库存限制"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">商品分类</Label>
                <Input
                  id="category"
                  value={exchangeForm.category}
                  onChange={(e) =>
                    setExchangeForm((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))}
                  placeholder="如: 充值类, 实物类"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">生效日期</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={exchangeForm.validFrom}
                  onChange={(e) =>
                    setExchangeForm((prev) => ({
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
                  value={exchangeForm.validTo}
                  onChange={(e) =>
                    setExchangeForm((prev) => ({
                      ...prev,
                      validTo: e.target.value,
                    }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">商品图片</Label>
              <Input
                id="imageUrl"
                value={exchangeForm.imageUrl}
                onChange={(e) =>
                  setExchangeForm((prev) => ({
                    ...prev,
                    imageUrl: e.target.value,
                  }))}
                placeholder="图片URL地址"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">标签</Label>
              <Input
                id="tags"
                value={exchangeForm.tags}
                onChange={(e) =>
                  setExchangeForm((prev) => ({
                    ...prev,
                    tags: e.target.value,
                  }))}
                placeholder="用逗号分隔多个标签，如: 热门, 限时, 推荐"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">元数据 (JSON格式)</Label>
              <Textarea
                id="metadata"
                value={exchangeForm.metadata}
                onChange={(e) =>
                  setExchangeForm((prev) => ({
                    ...prev,
                    metadata: e.target.value,
                  }))}
                placeholder='{"couponCode": "ABC123", "expiry": "30天"}'
                className="font-mono text-sm"
                rows={4}
              />
              {exchangeForm.metadata && !isValidJson(exchangeForm.metadata) && (
                <p className="text-red-600 text-sm">JSON 格式不正确</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={exchangeForm.isActive}
                onCheckedChange={(checked) =>
                  setExchangeForm((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label>上架商品</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExchangeDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleSaveExchange}
              disabled={!exchangeForm.name ||
                exchangeForm.pointsRequired <= 0 ||
                (exchangeForm.metadata !== "" &&
                  !isValidJson(exchangeForm.metadata))}
            >
              {editingExchange ? "保存修改" : "添加商品"}
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
              您确定要删除这个兑换商品吗？此操作不可撤销，删除后相关的兑换记录仍会保留。
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
