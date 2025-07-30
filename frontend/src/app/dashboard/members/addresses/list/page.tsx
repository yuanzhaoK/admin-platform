"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import Link from "next/link";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DropdownMenuLabel,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowUpDown,
  Building,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  Home,
  Mail,
  MapIcon,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCcw,
  School,
  Search,
  Shield,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  CREATE_ADDRESS,
  DELETE_ADDRESS,
  GET_ADDRESSES,
  SEARCH_REGIONS,
  SET_DEFAULT_ADDRESS,
  UPDATE_ADDRESS,
  VALIDATE_ADDRESS,
} from "@/lib/graphql/queries/member-system";

// 类型定义
interface AddressData {
  id: string;
  created: string;
  updated: string;
  userId: string;
  user?: {
    id: string;
    profile: {
      username: string;
      avatar?: string;
    };
  };
  name: string;
  phone: string;
  email?: string;
  province: string;
  city: string;
  district: string;
  street?: string;
  address: string;
  detailAddress?: string;
  postalCode?: string;
  longitude?: number;
  latitude?: number;
  tag?: string;
  tagColor?: string;
  isDefault: boolean;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: string;
  usageCount: number;
  lastUsedAt?: string;
  orderCount: number;
  source: string;
  fullAddress: string;
}

interface QueryFilters {
  userId?: string;
  name?: string;
  phone?: string;
  province?: string;
  city?: string;
  tag?: string;
  isDefault?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  verificationStatus?: string;
  source?: string;
}

interface AddressFormData {
  name: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  district: string;
  street: string;
  address: string;
  detailAddress: string;
  postalCode: string;
  tag: string;
  tagColor: string;
  isDefault: boolean;
  isActive: boolean;
}

export default function AddressListPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<QueryFilters>({});
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [editingAddress, setEditingAddress] = useState<AddressData | null>(
    null,
  );
  const [addressToDelete, setAddressToDelete] = useState<AddressData | null>(
    null,
  );
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null,
  );

  const [addressForm, setAddressForm] = useState<AddressFormData>({
    name: "",
    phone: "",
    email: "",
    province: "",
    city: "",
    district: "",
    street: "",
    address: "",
    detailAddress: "",
    postalCode: "",
    tag: "",
    tagColor: "#3b82f6",
    isDefault: false,
    isActive: true,
  });

  // GraphQL queries and mutations
  const {
    data: addressesData,
    loading: addressesLoading,
    refetch: refetchAddresses,
  } = useQuery(GET_ADDRESSES, {
    variables: {
      query: {
        pagination: {
          page: currentPage,
          perPage: pageSize,
          sortBy,
          sortOrder,
        },
        search: searchTerm || undefined,
        ...filters,
        includeUser: true,
      },
    },
    errorPolicy: "all",
  });

  const [createAddress] = useMutation(CREATE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setAddressDialogOpen(false);
      resetForm();
    },
  });

  const [updateAddress] = useMutation(UPDATE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setAddressDialogOpen(false);
      setEditingAddress(null);
      resetForm();
    },
  });

  const [deleteAddress] = useMutation(DELETE_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    },
  });

  const [setDefaultAddress] = useMutation(SET_DEFAULT_ADDRESS, {
    onCompleted: () => {
      refetchAddresses();
    },
  });

  const [validateAddress] = useMutation(VALIDATE_ADDRESS);

  // Data processing
  const addresses = addressesData?.addresses?.items || [];
  const pagination = addressesData?.addresses?.pagination;
  const stats = addressesData?.addresses?.stats;

  // Event handlers
  const resetForm = () => {
    setAddressForm({
      name: "",
      phone: "",
      email: "",
      province: "",
      city: "",
      district: "",
      street: "",
      address: "",
      detailAddress: "",
      postalCode: "",
      tag: "",
      tagColor: "#3b82f6",
      isDefault: false,
      isActive: true,
    });
  };

  const handleCreateAddress = async () => {
    try {
      await createAddress({
        variables: {
          userId: "current-user", // 实际应用中应该获取当前用户ID
          input: {
            ...addressForm,
            source: "MANUAL",
          },
        },
      });
    } catch (error) {
      console.error("Create address error:", error);
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddress) return;

    try {
      await updateAddress({
        variables: {
          id: editingAddress.id,
          input: addressForm,
        },
      });
    } catch (error) {
      console.error("Update address error:", error);
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      await deleteAddress({
        variables: {
          id: addressToDelete.id,
        },
      });
    } catch (error) {
      console.error("Delete address error:", error);
    }
  };

  const handleSetDefault = async (addressId: string, userId: string) => {
    try {
      await setDefaultAddress({
        variables: {
          userId,
          addressId,
        },
      });
    } catch (error) {
      console.error("Set default address error:", error);
    }
  };

  const handleValidateAddress = async (address: AddressData) => {
    try {
      const result = await validateAddress({
        variables: {
          input: {
            province: address.province,
            city: address.city,
            district: address.district,
            street: address.street,
            address: address.address,
            postalCode: address.postalCode,
            longitude: address.longitude,
            latitude: address.latitude,
            validateCoordinates: true,
            validatePostalCode: true,
            validateStructure: true,
            getSuggestions: true,
            standardize: true,
          },
        },
      });

      console.log("Validation result:", result.data?.validateAddress);
    } catch (error) {
      console.error("Validate address error:", error);
    }
  };

  // Utility functions
  const getVerificationBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      VERIFIED: { label: "已验证", variant: "default" },
      PENDING: { label: "待验证", variant: "secondary" },
      FAILED: { label: "验证失败", variant: "destructive" },
    };

    const statusInfo = statusMap[status] ||
      { label: status, variant: "secondary" as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getSourceBadge = (source: string) => {
    const sourceMap: Record<string, { label: string; color: string }> = {
      MANUAL: { label: "手动录入", color: "blue" },
      LOCATION: { label: "定位获取", color: "green" },
      IMPORT: { label: "批量导入", color: "purple" },
      THIRD_PARTY: { label: "第三方", color: "orange" },
    };

    const sourceInfo = sourceMap[source] || { label: source, color: "gray" };
    return <Badge variant="outline">{sourceInfo.label}</Badge>;
  };

  const getTagIcon = (tag?: string) => {
    const tagMap: Record<
      string,
      React.ComponentType<React.SVGProps<SVGSVGElement>>
    > = {
      "家": Home,
      "公司": Building,
      "学校": School,
    };

    return tagMap[tag || ""] || Home;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === "ASC"
      ? <ArrowUpDown className="h-4 w-4 rotate-180" />
      : <ArrowUpDown className="h-4 w-4" />;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">地址列表</h1>
          <p className="text-muted-foreground">
            管理会员收货地址信息
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingAddress(null);
            setAddressDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          新增地址
        </Button>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总地址数</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAddresses?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已验证</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.verifiedAddresses || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">默认地址</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.defaultAddresses || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">关联用户</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
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
              <Label>搜索地址</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名、电话、地址"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>验证状态</Label>
              <Select
                value={filters.verificationStatus || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    verificationStatus: value === "all" ? undefined : value,
                  })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="VERIFIED">已验证</SelectItem>
                  <SelectItem value="PENDING">待验证</SelectItem>
                  <SelectItem value="FAILED">验证失败</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>地址来源</Label>
              <Select
                value={filters.source || "all"}
                onValueChange={(value) =>
                  setFilters({
                    ...filters,
                    source: value === "all" ? undefined : value,
                  })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择来源" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有来源</SelectItem>
                  <SelectItem value="MANUAL">手动录入</SelectItem>
                  <SelectItem value="LOCATION">定位获取</SelectItem>
                  <SelectItem value="IMPORT">批量导入</SelectItem>
                  <SelectItem value="THIRD_PARTY">第三方</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => refetchAddresses()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 地址列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>地址列表</CardTitle>
              <CardDescription>
                共 {pagination?.totalItems || 0} 条地址记录
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {addressesLoading
            ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            )
            : addresses.length === 0
            ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无地址记录</h3>
                <p className="text-muted-foreground mb-4">
                  没有找到符合条件的地址记录
                </p>
                <Button
                  onClick={() => {
                    resetForm();
                    setEditingAddress(null);
                    setAddressDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个地址
                </Button>
              </div>
            )
            : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("name")}
                          className="p-0 h-auto font-medium"
                        >
                          联系人
                          {getSortIcon("name")}
                        </Button>
                      </TableHead>
                      <TableHead>地址信息</TableHead>
                      <TableHead>标签</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("usageCount")}
                          className="p-0 h-auto font-medium"
                        >
                          使用次数
                          {getSortIcon("usageCount")}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("created")}
                          className="p-0 h-auto font-medium"
                        >
                          创建时间
                          {getSortIcon("created")}
                        </Button>
                      </TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addresses.map((address: AddressData) => {
                      const TagIcon = getTagIcon(address.tag);
                      return (
                        <TableRow key={address.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {address.user?.profile?.avatar
                                ? (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={address.user.profile.avatar}
                                    />
                                    <AvatarFallback>
                                      {address.name.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                )
                                : (
                                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                    {address.name.slice(0, 1)}
                                  </div>
                                )}
                              <div>
                                <div className="font-medium">
                                  {address.name}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {address.phone}
                                </div>
                                {address.email && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {address.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="font-medium">
                                {address.fullAddress}
                              </div>
                              {address.postalCode && (
                                <div className="text-sm text-muted-foreground">
                                  邮编: {address.postalCode}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {address.tag && (
                                <Badge
                                  style={{
                                    backgroundColor: address.tagColor
                                      ? `${address.tagColor}20`
                                      : undefined,
                                    color: address.tagColor || undefined,
                                    borderColor: address.tagColor || undefined,
                                  }}
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <TagIcon className="h-3 w-3" />
                                  {address.tag}
                                </Badge>
                              )}
                              {address.isDefault && <Badge>默认</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {getVerificationBadge(address.verificationStatus)}
                              {getSourceBadge(address.source)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-center">
                              <div className="font-medium">
                                {address.usageCount}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                订单: {address.orderCount}
                              </div>
                              {address.lastUsedAt && (
                                <div className="text-xs text-muted-foreground">
                                  最后使用: {formatDate(address.lastUsedAt)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(address.created)}
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
                                <DropdownMenuLabel>操作</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAddress(address);
                                    setDetailDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  查看详情
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingAddress(address);
                                    setAddressForm({
                                      name: address.name,
                                      phone: address.phone,
                                      email: address.email || "",
                                      province: address.province,
                                      city: address.city,
                                      district: address.district,
                                      street: address.street || "",
                                      address: address.address,
                                      detailAddress: address.detailAddress ||
                                        "",
                                      postalCode: address.postalCode || "",
                                      tag: address.tag || "",
                                      tagColor: address.tagColor || "#3b82f6",
                                      isDefault: address.isDefault,
                                      isActive: address.isActive,
                                    });
                                    setAddressDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {!address.isDefault && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleSetDefault(
                                        address.id,
                                        address.userId,
                                      )}
                                  >
                                    <Star className="h-4 w-4 mr-2" />
                                    设为默认
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleValidateAddress(address)}
                                >
                                  <Shield className="h-4 w-4 mr-2" />
                                  验证地址
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setAddressToDelete(address);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* 分页 */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      显示 {(currentPage - 1) * pageSize + 1} 到{" "}
                      {Math.min(currentPage * pageSize, pagination.totalItems)}
                      {" "}
                      项， 共 {pagination.totalItems} 项
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="text-sm">
                        第 {currentPage} 页，共 {pagination.totalPages} 页
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNext}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
        </CardContent>
      </Card>

      {/* 地址表单对话框 */}
      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "编辑地址" : "新增地址"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress ? "修改地址信息" : "添加新的收货地址"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">联系人 *</Label>
                <Input
                  id="name"
                  value={addressForm.name}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))}
                  placeholder="收货人姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">手机号 *</Label>
                <Input
                  id="phone"
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))}
                  placeholder="手机号码"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={addressForm.email}
                onChange={(e) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))}
                placeholder="邮箱地址（可选）"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">省份 *</Label>
                <Input
                  id="province"
                  value={addressForm.province}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      province: e.target.value,
                    }))}
                  placeholder="省份"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">城市 *</Label>
                <Input
                  id="city"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))}
                  placeholder="城市"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">区县 *</Label>
                <Input
                  id="district"
                  value={addressForm.district}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      district: e.target.value,
                    }))}
                  placeholder="区县"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">街道</Label>
              <Input
                id="street"
                value={addressForm.street}
                onChange={(e) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    street: e.target.value,
                  }))}
                placeholder="街道/乡镇（可选）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">详细地址 *</Label>
              <Textarea
                id="address"
                value={addressForm.address}
                onChange={(e) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))}
                placeholder="详细地址"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailAddress">门牌号/楼层</Label>
              <Input
                id="detailAddress"
                value={addressForm.detailAddress}
                onChange={(e) =>
                  setAddressForm((prev) => ({
                    ...prev,
                    detailAddress: e.target.value,
                  }))}
                placeholder="门牌号、楼层等详细信息（可选）"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">邮政编码</Label>
                <Input
                  id="postalCode"
                  value={addressForm.postalCode}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))}
                  placeholder="邮政编码（可选）"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tag">地址标签</Label>
                <Input
                  id="tag"
                  value={addressForm.tag}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      tag: e.target.value,
                    }))}
                  placeholder="如：家、公司、学校"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onCheckedChange={(checked) =>
                    setAddressForm((prev) => ({ ...prev, isDefault: checked }))}
                />
                <Label htmlFor="isDefault">设为默认地址</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={addressForm.isActive}
                  onCheckedChange={(checked) =>
                    setAddressForm((prev) => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">启用地址</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddressDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={editingAddress
                ? handleUpdateAddress
                : handleCreateAddress}
              disabled={!addressForm.name || !addressForm.phone ||
                !addressForm.province || !addressForm.city ||
                !addressForm.district || !addressForm.address}
            >
              {editingAddress ? "更新" : "创建"}
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
              确定要删除地址 "{addressToDelete?.fullAddress}" 吗？
              此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAddress}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 地址详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>地址详情</DialogTitle>
            <DialogDescription>查看完整的地址信息</DialogDescription>
          </DialogHeader>

          {selectedAddress && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">联系信息</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">联系人:</span>
                      <span>{selectedAddress.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">手机号:</span>
                      <span>{selectedAddress.phone}</span>
                    </div>
                    {selectedAddress.email && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">邮箱:</span>
                        <span>{selectedAddress.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">地址信息</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">完整地址:</span>
                      <span className="text-right">
                        {selectedAddress.fullAddress}
                      </span>
                    </div>
                    {selectedAddress.postalCode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">邮政编码:</span>
                        <span>{selectedAddress.postalCode}</span>
                      </div>
                    )}
                    {selectedAddress.longitude && selectedAddress.latitude && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">坐标:</span>
                        <span>
                          {selectedAddress.longitude},{" "}
                          {selectedAddress.latitude}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 状态信息 */}
              <div>
                <h3 className="font-semibold mb-3">状态信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">验证状态:</span>
                    {getVerificationBadge(selectedAddress.verificationStatus)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">地址来源:</span>
                    {getSourceBadge(selectedAddress.source)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">是否默认:</span>
                    <Badge
                      variant={selectedAddress.isDefault
                        ? "default"
                        : "outline"}
                    >
                      {selectedAddress.isDefault ? "是" : "否"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">是否启用:</span>
                    <Badge
                      variant={selectedAddress.isActive
                        ? "default"
                        : "destructive"}
                    >
                      {selectedAddress.isActive ? "启用" : "禁用"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* 使用统计 */}
              <div>
                <h3 className="font-semibold mb-3">使用统计</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedAddress.usageCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      总使用次数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedAddress.orderCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      订单次数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-600">
                      {selectedAddress.lastUsedAt
                        ? formatDate(selectedAddress.lastUsedAt)
                        : "未使用"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      最后使用
                    </div>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              <div>
                <h3 className="font-semibold mb-3">时间信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">创建时间:</span>
                    <span>{formatDate(selectedAddress.created)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">更新时间:</span>
                    <span>{formatDate(selectedAddress.updated)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              关闭
            </Button>
            <Button
              onClick={() => {
                if (selectedAddress) {
                  setEditingAddress(selectedAddress);
                  setAddressForm({
                    name: selectedAddress.name,
                    phone: selectedAddress.phone,
                    email: selectedAddress.email || "",
                    province: selectedAddress.province,
                    city: selectedAddress.city,
                    district: selectedAddress.district,
                    street: selectedAddress.street || "",
                    address: selectedAddress.address,
                    detailAddress: selectedAddress.detailAddress || "",
                    postalCode: selectedAddress.postalCode || "",
                    tag: selectedAddress.tag || "",
                    tagColor: selectedAddress.tagColor || "#3b82f6",
                    isDefault: selectedAddress.isDefault,
                    isActive: selectedAddress.isActive,
                  });
                  setDetailDialogOpen(false);
                  setAddressDialogOpen(true);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              编辑地址
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
