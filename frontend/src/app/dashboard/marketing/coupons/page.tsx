"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Activity,
  Copy,
  DollarSign,
  Edit,
  Eye,
  Gift,
  Loader2,
  Percent,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  BATCH_DELETE_COUPONS,
  DELETE_COUPON,
  GET_COUPON_STATS,
  GET_COUPON_USAGES,
  GET_COUPONS,
} from "@/lib/graphql/queries";
import CouponCreateForm from "@/components/coupons/CouponCreateForm";
import CouponViewModal from "@/components/coupons/CouponViewModal";
import CouponEditModal from "@/components/coupons/CouponEditModal";
import BatchGenerateModal from "@/components/coupons/BatchGenerateModal";

interface Coupon {
  id: string;
  name: string;
  description?: string;
  code: string;
  type: string;
  discount_type: string;
  discount_value: number;
  min_amount?: number;
  max_discount?: number;
  total_quantity?: number;
  used_quantity: number;
  per_user_limit?: number;
  status: string;
  start_time: string;
  end_time: string;
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  applicable_member_levels?: string[];
}

interface CouponStats {
  total: number;
  active: number;
  expired: number;
  used_up: number;
  totalUsage: number;
  totalDiscount: number;
  typeDistribution: Record<string, number>;
  usageThisMonth: number;
}

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("coupons");
  const [currentPage] = useState(1);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSingleDeleteDialog, setShowSingleDeleteDialog] = useState(false);
  const [showBatchGenerateDialog, setShowBatchGenerateDialog] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const { toast } = useToast();

  // GraphQL查询
  const {
    data: couponsData,
    loading: couponsLoading,
    refetch: refetchCoupons,
  } = useQuery(GET_COUPONS, {
    variables: {
      input: {
        page: currentPage,
        perPage: 20,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        sortBy: "start_time",
        sortOrder: "desc",
      },
    },
  });

  const { data: statsData, loading: statsLoading } = useQuery(GET_COUPON_STATS);

  const { data: usagesData, loading: usagesLoading } = useQuery(
    GET_COUPON_USAGES,
    {
      variables: {
        input: {
          page: 1,
          perPage: 50,
          sortBy: "used_time",
          sortOrder: "desc",
        },
      },
      skip: selectedTab !== "usage",
    },
  );

  // GraphQL变更
  const [deleteCoupon] = useMutation(DELETE_COUPON);
  const [batchDeleteCoupons] = useMutation(BATCH_DELETE_COUPONS);

  const coupons: Coupon[] = couponsData?.coupons?.items || [];
  const stats: CouponStats = statsData?.couponStats || {
    total: 0,
    active: 0,
    expired: 0,
    used_up: 0,
    totalUsage: 0,
    totalDiscount: 0,
    typeDistribution: {},
    usageThisMonth: 0,
  };

  // 重新获取数据当搜索条件改变时
  useEffect(() => {
    const timer = setTimeout(() => {
      refetchCoupons();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, typeFilter, refetchCoupons]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "有效", className: "bg-green-100 text-green-800" },
      inactive: { label: "无效", className: "bg-gray-100 text-gray-800" },
      expired: { label: "已过期", className: "bg-red-100 text-red-800" },
      used_up: { label: "已用完", className: "bg-orange-100 text-orange-800" },
    };
    const config = statusMap[status as keyof typeof statusMap] ||
      statusMap.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      general: { label: "通用", className: "bg-blue-100 text-blue-800" },
      new_user: { label: "新用户", className: "bg-purple-100 text-purple-800" },
      member_exclusive: {
        label: "会员专享",
        className: "bg-yellow-100 text-yellow-800",
      },
      birthday: { label: "生日", className: "bg-pink-100 text-pink-800" },
      activity: { label: "活动", className: "bg-indigo-100 text-indigo-800" },
    };
    const config = typeMap[type as keyof typeof typeMap] || typeMap.general;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getDiscountDisplay = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    } else if (type === "fixed_amount") {
      return `¥${value}`;
    } else {
      return "免邮";
    }
  };

  const getUsageProgress = (used: number, limit: number | null | undefined) => {
    if (limit === null || limit === undefined) return null;
    const percentage = (used / limit) * 100;
    return {
      percentage: Math.min(percentage, 100),
      text: `${used}/${limit}`,
    };
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setShowSingleDeleteDialog(true);
  };

  const confirmDeleteCoupon = async () => {
    if (!couponToDelete) return;

    try {
      await deleteCoupon({ variables: { id: couponToDelete.id } });
      toast({
        title: "删除成功",
        description: "优惠券已成功删除",
      });
      refetchCoupons();
      setShowSingleDeleteDialog(false);
      setCouponToDelete(null);
    } catch (error) {
      console.error("Delete coupon error:", error);
      toast({
        title: "删除失败",
        description: "删除优惠券时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedCoupons.length === 0) return;

    try {
      const result = await batchDeleteCoupons({
        variables: { ids: selectedCoupons },
      });

      toast({
        title: "批量删除完成",
        description: result.data?.batchDeleteCoupons?.message || "操作完成",
      });

      setSelectedCoupons([]);
      setShowDeleteDialog(false);
      refetchCoupons();
    } catch (error) {
      console.error("Batch delete error:", error);
      toast({
        title: "批量删除失败",
        description: "批量删除优惠券时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleSelectCoupon = (couponId: string, checked: boolean) => {
    setSelectedCoupons((prev) =>
      checked ? [...prev, couponId] : prev.filter((id) => id !== couponId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedCoupons(checked ? coupons.map((c) => c.id) : []);
  };

  // 批量生成功能已移至 BatchGenerateModal 组件

  const handleViewCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowViewModal(true);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowEditModal(true);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "复制成功",
        description: "优惠券代码已复制到剪贴板",
      });
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      });
    }
  };

  if (couponsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">优惠券管理</h1>
          <p className="text-muted-foreground mt-2">
            创建和管理各类优惠券活动，提升用户购买转化
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBatchGenerateDialog(true)}
          >
            <Copy className="mr-2 h-4 w-4" />
            批量生成
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            创建优惠券
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">优惠券总数</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              有效券 <span className="text-green-600">{stats.active}</span> 张
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累计使用</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsage.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">+{stats.usageThisMonth}</span>
              {" "}
              本月新增
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总节省金额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{stats.totalDiscount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              平均每券{" "}
              <span className="text-green-600">
                ¥{stats.totalUsage > 0
                  ? Math.round(stats.totalDiscount / stats.totalUsage)
                  : 0}
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">使用率</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0
                ? ((stats.totalUsage / stats.total) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              较上月 <span className="text-green-600">+5.2%</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区 */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="coupons">优惠券列表</TabsTrigger>
          <TabsTrigger value="templates">模板管理</TabsTrigger>
          <TabsTrigger value="usage">使用记录</TabsTrigger>
          <TabsTrigger value="stats">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="coupons" className="space-y-4">
          {/* 搜索和过滤 */}
          <Card>
            <CardHeader>
              <CardTitle>筛选条件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索优惠券名称或代码"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="active">有效</SelectItem>
                    <SelectItem value="inactive">无效</SelectItem>
                    <SelectItem value="expired">已过期</SelectItem>
                    <SelectItem value="used_up">已用完</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部类型</SelectItem>
                    <SelectItem value="general">通用</SelectItem>
                    <SelectItem value="new_user">新用户</SelectItem>
                    <SelectItem value="member_exclusive">会员专享</SelectItem>
                    <SelectItem value="birthday">生日</SelectItem>
                    <SelectItem value="activity">活动</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 优惠券列表 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>优惠券列表</CardTitle>
                  <CardDescription>
                    共 {coupons.length} 张优惠券
                    {selectedCoupons.length > 0 && (
                      <span className="ml-2 text-blue-600">
                        已选择 {selectedCoupons.length} 张
                      </span>
                    )}
                  </CardDescription>
                </div>
                {selectedCoupons.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    删除选中 ({selectedCoupons.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedCoupons.length === coupons.length &&
                          coupons.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>优惠券信息</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>优惠额度</TableHead>
                    <TableHead>使用情况</TableHead>
                    <TableHead>有效期</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const progress = getUsageProgress(
                      coupon.used_quantity,
                      coupon.total_quantity,
                    );
                    return (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedCoupons.includes(coupon.id)}
                            onCheckedChange={(checked) =>
                              handleSelectCoupon(coupon.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{coupon.name}</div>
                            <div className="text-sm text-muted-foreground">
                              代码: {coupon.code}
                            </div>
                            {coupon.min_amount && (
                              <div className="text-xs text-muted-foreground">
                                满¥{coupon.min_amount}可用
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(coupon.type)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-lg text-green-600">
                            {getDiscountDisplay(
                              coupon.discount_type,
                              coupon.discount_value,
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {coupon.used_quantity.toLocaleString()} 次
                            </div>
                            {progress && (
                              <div className="mt-1">
                                <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{ width: `${progress.percentage}%` }}
                                  >
                                  </div>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {progress.text}
                                </div>
                              </div>
                            )}
                            {!progress && (
                              <div className="text-xs text-muted-foreground">
                                无限制
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{coupon.start_time}</div>
                            <div>至 {coupon.end_time}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(coupon.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCoupon(coupon)}
                              title="查看详情"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCoupon(coupon)}
                              title="编辑"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(coupon.code)}
                              title="复制代码"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCoupon(coupon)}
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">模板管理</h2>
            <p className="text-muted-foreground">
              创建和管理优惠券模板，快速生成批量优惠券
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-dashed border-2">
              <CardContent className="flex items-center justify-center h-48">
                <Button variant="ghost" className="h-full w-full">
                  <div className="text-center">
                    <Plus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-muted-foreground">创建新模板</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>新用户注册优惠</CardTitle>
                <CardDescription>新用户注册完成后自动发放</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>优惠金额</span>
                    <span className="font-medium">¥50</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>使用门槛</span>
                    <span className="font-medium">满¥100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>有效期</span>
                    <span className="font-medium">30天</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    编辑
                  </Button>
                  <Button size="sm" className="flex-1">使用</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">使用记录</h2>
            <p className="text-muted-foreground">
              查看优惠券的使用详情和用户行为
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>使用记录</CardTitle>
              <CardDescription>
                最近的优惠券使用记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usagesLoading
                ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                )
                : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>优惠券</TableHead>
                        <TableHead>用户ID</TableHead>
                        <TableHead>订单ID</TableHead>
                        <TableHead>优惠金额</TableHead>
                        <TableHead>使用时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usagesData?.couponUsages?.items?.map((usage: {
                        id: string;
                        coupon?: { name?: string; code?: string };
                        coupon_id: string;
                        user_id: string;
                        order_id?: string;
                        discount_amount: number;
                        used_time: string;
                      }) => (
                        <TableRow key={usage.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {usage.coupon?.name || "未知优惠券"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {usage.coupon?.code || usage.coupon_id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{usage.user_id}</TableCell>
                          <TableCell>{usage.order_id || "-"}</TableCell>
                          <TableCell>
                            <span className="font-medium text-green-600">
                              ¥{usage.discount_amount}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(usage.used_time).toLocaleString("zh-CN")}
                          </TableCell>
                        </TableRow>
                      )) || (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            暂无使用记录
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">数据分析</h2>
            <p className="text-muted-foreground">优惠券使用效果和转化分析</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>类型分布</CardTitle>
                <CardDescription>各类型优惠券数量分布</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.typeDistribution).map((
                    [type, count],
                  ) => (
                    <div
                      key={type}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center gap-2">
                        {getTypeBadge(type)}
                        <span className="text-sm">{type}</span>
                      </div>
                      <span className="font-medium">{count} 张</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>状态统计</CardTitle>
                <CardDescription>优惠券状态分布情况</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        有效
                      </Badge>
                    </div>
                    <span className="font-medium">{stats.active} 张</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">已过期</Badge>
                    </div>
                    <span className="font-medium">{stats.expired} 张</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800">
                        已用完
                      </Badge>
                    </div>
                    <span className="font-medium">{stats.used_up} 张</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 单个优惠券删除确认对话框 */}
        <Dialog
          open={showSingleDeleteDialog}
          onOpenChange={setShowSingleDeleteDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除优惠券</DialogTitle>
              <DialogDescription>
                您确定要删除优惠券 &ldquo;{couponToDelete?.name}&rdquo;
                吗？此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            {couponToDelete && (
              <div className="py-4">
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      优惠券名称:
                    </span>
                    <span className="text-sm font-medium">
                      {couponToDelete.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      优惠券代码:
                    </span>
                    <code className="text-sm font-mono">
                      {couponToDelete.code}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      已使用次数:
                    </span>
                    <span className="text-sm">
                      {couponToDelete.used_quantity} 次
                    </span>
                  </div>
                  {couponToDelete.used_quantity > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      ⚠️ 注意：该优惠券已被使用 {couponToDelete.used_quantity}
                      {" "}
                      次，删除后相关使用记录将无法恢复。
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSingleDeleteDialog(false);
                  setCouponToDelete(null);
                }}
              >
                取消
              </Button>
              <Button variant="destructive" onClick={confirmDeleteCoupon}>
                确认删除
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 批量删除确认对话框 */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认批量删除</DialogTitle>
              <DialogDescription>
                您确定要删除选中的 {selectedCoupons.length}{" "}
                个优惠券吗？此操作不可撤销。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="text-sm text-muted-foreground mb-2">
                  将要删除的优惠券：
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {coupons
                    .filter((coupon) => selectedCoupons.includes(coupon.id))
                    .map((coupon) => (
                      <div
                        key={coupon.id}
                        className="flex justify-between text-sm"
                      >
                        <span>{coupon.name}</span>
                        <code className="font-mono">{coupon.code}</code>
                      </div>
                    ))}
                </div>
                {coupons.some((coupon) =>
                  selectedCoupons.includes(coupon.id) &&
                  coupon.used_quantity > 0
                ) && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    ⚠️ 注意：部分优惠券已被使用，删除后相关使用记录将无法恢复。
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                取消
              </Button>
              <Button variant="destructive" onClick={handleBatchDelete}>
                确认删除 {selectedCoupons.length} 个
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* 批量生成优惠券 */}
        <BatchGenerateModal
          open={showBatchGenerateDialog}
          onOpenChange={setShowBatchGenerateDialog}
          onSuccess={refetchCoupons}
        />

        {/* 创建优惠券表单 */}
        <CouponCreateForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSuccess={refetchCoupons}
        />

        {/* 查看优惠券详情 */}
        <CouponViewModal
          open={showViewModal}
          onOpenChange={setShowViewModal}
          coupon={selectedCoupon}
        />

        {/* 编辑优惠券 */}
        <CouponEditModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          coupon={selectedCoupon}
          onSuccess={refetchCoupons}
        />
      </Tabs>
    </div>
  );
}
