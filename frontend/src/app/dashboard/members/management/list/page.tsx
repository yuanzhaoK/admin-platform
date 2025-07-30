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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  Dialog,
  DialogContent,
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
import {
  CheckCircle,
  Coins,
  Download,
  Edit,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  ACTIVATE_MEMBER,
  BAN_MEMBER,
  BATCH_DELETE_MEMBERS,
  DEACTIVATE_MEMBER,
  DELETE_MEMBER,
  GET_ALL_MEMBER_LEVELS,
  GET_MEMBERS,
} from "@/lib/graphql/queries/member-system";

interface MemberData {
  id: string;
  created: string;
  updated: string;
  profile: {
    username: string;
    email?: string;
    phone?: string;
    avatar?: string;
    realName?: string;
    nickname?: string;
    gender: string;
    birthday?: string;
    bio?: string;
    location?: {
      province: string;
      city: string;
      district: string;
      address: string;
    };
  };
  level: {
    id: string;
    name: string;
    displayName: string;
    color: string;
    icon?: string;
  };
  levelId: string;
  points: number;
  frozenPoints: number;
  totalEarnedPoints: number;
  totalSpentPoints: number;
  balance: number;
  frozenBalance: number;
  status: string;
  isVerified: boolean;
  registerTime: string;
  lastLoginTime?: string;
  lastActiveTime?: string;
  stats: {
    totalOrders: number;
    totalAmount: number;
    averageOrderValue: number;
    loyaltyScore: number;
  };
  tags: Array<{
    id: string;
    name: string;
    color: string;
    type: string;
  }>;
  riskLevel: string;
  trustScore: number;
}

interface QueryFilters {
  search?: string;
  status?: string[];
  levelId?: string[];
  isVerified?: boolean;
  riskLevel?: string;
  registerDateRange?: {
    startDate: string;
    endDate: string;
  };
  pagination: {
    page: number;
    perPage: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  };
}

export default function MemberManagementListPage() {
  // State management
  const [filters, setFilters] = useState<QueryFilters>({
    pagination: { page: 1, perPage: 20, sortBy: "created", sortOrder: "DESC" },
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Dialog states
  const [memberDetailOpen, setMemberDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [batchActionOpen, setBatchActionOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // GraphQL queries and mutations
  const {
    data: membersData,
    loading: membersLoading,
    refetch: refetchMembers,
  } = useQuery(GET_MEMBERS, {
    variables: { query: filters },
    errorPolicy: "all",
  });

  const { data: levelsData } = useQuery(GET_ALL_MEMBER_LEVELS, {
    errorPolicy: "all",
  });

  const [deleteMember] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      refetchMembers();
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    },
  });

  const [batchDeleteMembers] = useMutation(BATCH_DELETE_MEMBERS, {
    onCompleted: () => {
      refetchMembers();
      setSelectedMembers([]);
      setBatchActionOpen(false);
    },
  });

  const [activateMember] = useMutation(ACTIVATE_MEMBER, {
    onCompleted: () => refetchMembers(),
  });

  const [deactivateMember] = useMutation(DEACTIVATE_MEMBER, {
    onCompleted: () => refetchMembers(),
  });

  const [banMember] = useMutation(BAN_MEMBER, {
    onCompleted: () => refetchMembers(),
  });

  // Data processing
  const members = membersData?.members?.items || [];
  const pagination = membersData?.members?.pagination;
  const stats = membersData?.members?.stats;
  const levels = levelsData?.allMemberLevels || [];

  // Event handlers
  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const handleFilterChange = (key: string, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pagination: { ...prev.pagination, page: 1 },
    }));
  };

  const handleMemberSelect = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMembers((prev) => [...prev, memberId]);
    } else {
      setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(members.map((m) => m.id));
    } else {
      setSelectedMembers([]);
    }
  };

  const handleDeleteMember = (memberId: string) => {
    setMemberToDelete(memberId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (memberToDelete) {
      deleteMember({ variables: { id: memberToDelete } });
    }
  };

  const handleStatusChange = (memberId: string, newStatus: string) => {
    switch (newStatus) {
      case "ACTIVE":
        activateMember({ variables: { id: memberId } });
        break;
      case "INACTIVE":
        deactivateMember({ variables: { id: memberId } });
        break;
      case "BANNED":
        banMember({ variables: { id: memberId, reason: "管理员操作" } });
        break;
      default:
        break;
    }
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  };

  const confirmBatchDelete = () => {
    batchDeleteMembers({ variables: { ids: selectedMembers } });
  };

  // Utility functions
  const getStatusBadge = (status: string) => {
    const statusMap = {
      ACTIVE: {
        label: "正常",
        variant: "default" as const,
        color: "text-green-600",
      },
      INACTIVE: {
        label: "未激活",
        variant: "secondary" as const,
        color: "text-gray-600",
      },
      BANNED: {
        label: "已封禁",
        variant: "destructive" as const,
        color: "text-red-600",
      },
      PENDING: {
        label: "待审核",
        variant: "outline" as const,
        color: "text-yellow-600",
      },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: "default" as const,
      color: "text-gray-600",
    };

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskMap = {
      LOW: { label: "低风险", icon: Shield, color: "text-green-600" },
      MEDIUM: { label: "中风险", icon: ShieldAlert, color: "text-yellow-600" },
      HIGH: { label: "高风险", icon: XCircle, color: "text-red-600" },
    };

    const risk = riskMap[riskLevel as keyof typeof riskMap];
    if (!risk) return null;

    const Icon = risk.icon;
    return (
      <div className={`flex items-center gap-1 ${risk.color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs">{risk.label}</span>
      </div>
    );
  };

  const getLevelBadge = (level: MemberData["level"]) => {
    return (
      <Badge
        style={{
          backgroundColor: level.color + "20",
          color: level.color,
          borderColor: level.color,
        }}
        variant="outline"
      >
        {level.icon && <span className="mr-1">{level.icon}</span>}
        {level.displayName}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">会员列表</h1>
          <p className="text-muted-foreground">
            管理所有会员信息，支持搜索、筛选和批量操作
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            添加会员
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总会员数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalActive + stats.totalInactive + stats.totalBanned}
              </div>
              <p className="text-xs text-muted-foreground">
                活跃 {stats.totalActive} 人
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃会员</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActive}</div>
              <p className="text-xs text-muted-foreground">
                占比 {((stats.totalActive /
                  (stats.totalActive + stats.totalInactive +
                    stats.totalBanned)) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">本月新增</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalNewThisMonth}
              </div>
              <p className="text-xs text-muted-foreground">
                平均等级 {stats.averageLevel?.toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总积分</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalPoints?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                总余额 {formatCurrency(stats.totalBalance || 0)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">搜索筛选</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "隐藏筛选" : "高级筛选"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基础搜索 */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名、邮箱、手机号"
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            {selectedMembers.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  已选择 {selectedMembers.length} 个
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      批量操作
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setBatchActionOpen(true)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      批量删除
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      导出选中
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* 高级筛选 */}
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>状态</Label>
                <Select
                  value={filters.status?.[0] || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "status",
                      value === "all" ? undefined : [value],
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="ACTIVE">正常</SelectItem>
                    <SelectItem value="INACTIVE">未激活</SelectItem>
                    <SelectItem value="BANNED">已封禁</SelectItem>
                    <SelectItem value="PENDING">待审核</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>会员等级</Label>
                <Select
                  value={filters.levelId?.[0] || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "levelId",
                      value === "all" ? undefined : [value],
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有等级</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>认证状态</Label>
                <Select
                  value={filters.isVerified === undefined
                    ? "all"
                    : filters.isVerified
                    ? "verified"
                    : "unverified"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "isVerified",
                      value === "all" ? undefined : value === "verified",
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="认证状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="verified">已认证</SelectItem>
                    <SelectItem value="unverified">未认证</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>风险等级</Label>
                <Select
                  value={filters.riskLevel || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "riskLevel",
                      value === "all" ? undefined : value,
                    )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="风险等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有等级</SelectItem>
                    <SelectItem value="LOW">低风险</SelectItem>
                    <SelectItem value="MEDIUM">中风险</SelectItem>
                    <SelectItem value="HIGH">高风险</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 会员列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>会员列表</CardTitle>
              <CardDescription>
                共 {pagination?.totalItems || 0} 个会员
                {selectedMembers.length > 0 &&
                  `, 已选择 ${selectedMembers.length} 个`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedMembers.length === members.length &&
                        members.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>会员信息</TableHead>
                  <TableHead>等级状态</TableHead>
                  <TableHead>积分余额</TableHead>
                  <TableHead>订单统计</TableHead>
                  <TableHead>风险评估</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membersLoading
                  ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
                            <div className="space-y-1">
                              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-5 bg-gray-200 rounded w-12 animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                        </TableCell>
                      </TableRow>
                    ))
                  )
                  : members.length === 0
                  ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        暂无会员数据
                      </TableCell>
                    </TableRow>
                  )
                  : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedMembers.includes(member.id)}
                            onCheckedChange={(checked) =>
                              handleMemberSelect(member.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={member.profile.avatar}
                                alt={member.profile.nickname ||
                                  member.profile.username}
                              />
                              <AvatarFallback>
                                {(member.profile.nickname ||
                                  member.profile.username)?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium flex items-center space-x-2">
                                <span>
                                  {member.profile.nickname ||
                                    member.profile.realName ||
                                    member.profile.username}
                                </span>
                                {member.isVerified && (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                                {member.profile.email && (
                                  <span className="flex items-center">
                                    <Mail className="mr-1 h-3 w-3" />
                                    {member.profile.email}
                                  </span>
                                )}
                                {member.profile.phone && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center">
                                      <Phone className="mr-1 h-3 w-3" />
                                      {member.profile.phone}
                                    </span>
                                  </>
                                )}
                              </div>
                              {member.tags && member.tags.length > 0 && (
                                <div className="flex items-center space-x-1 mt-1">
                                  {member.tags.slice(0, 2).map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      variant="secondary"
                                      className="text-xs px-1 py-0"
                                    >
                                      <Tag
                                        className="mr-1 h-2 w-2"
                                        style={{ color: tag.color }}
                                      />
                                      {tag.name}
                                    </Badge>
                                  ))}
                                  {member.tags.length > 2 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-1 py-0"
                                    >
                                      +{member.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getLevelBadge(member.level)}
                            {getStatusBadge(member.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Coins className="mr-1 h-3 w-3 text-yellow-500" />
                              {member.points.toLocaleString()} 积分
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Wallet className="mr-1 h-3 w-3" />
                              {formatCurrency(member.balance)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {member.stats.totalOrders} 订单
                            </div>
                            <div className="text-sm text-muted-foreground">
                              消费 {formatCurrency(member.stats.totalAmount)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(member.riskLevel)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(member.registerTime)}
                          </div>
                          {member.lastActiveTime && (
                            <div className="text-xs text-muted-foreground">
                              最后活跃: {formatDate(member.lastActiveTime)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/members/detail/${member.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  查看详情
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {member.status === "ACTIVE"
                                ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(member.id, "INACTIVE")}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    停用
                                  </DropdownMenuItem>
                                )
                                : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(member.id, "ACTIVE")}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    启用
                                  </DropdownMenuItem>
                                )}
                              {member.status !== "BANNED" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(member.id, "BANNED")}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  封禁
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDeleteMember(member.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                显示第 {(pagination.page - 1) * pagination.perPage + 1} -{" "}
                {Math.min(
                  pagination.page * pagination.perPage,
                  pagination.totalItems,
                )} 项，共 {pagination.totalItems} 项
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  上一页
                </Button>
                <div className="text-sm">
                  第 {pagination.page} / {pagination.totalPages} 页
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 会员详情对话框 */}
      <Dialog open={memberDetailOpen} onOpenChange={setMemberDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>会员详情</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={selectedMember.profile.avatar}
                    alt={selectedMember.profile.nickname ||
                      selectedMember.profile.username}
                  />
                  <AvatarFallback>
                    {(selectedMember.profile.nickname ||
                      selectedMember.profile.username)?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMember.profile.nickname ||
                      selectedMember.profile.realName ||
                      selectedMember.profile.username}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getLevelBadge(selectedMember.level)}
                    {getStatusBadge(selectedMember.status)}
                    {getRiskBadge(selectedMember.riskLevel)}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">用户名:</span>
                      <span>{selectedMember.profile.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">邮箱:</span>
                      <span className="flex items-center">
                        {selectedMember.profile.email || "未绑定"}
                        {selectedMember.isVerified && (
                          <CheckCircle className="ml-1 h-3 w-3 text-green-500" />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">手机:</span>
                      <span>{selectedMember.profile.phone || "未绑定"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">性别:</span>
                      <span>
                        {selectedMember.profile.gender === "MALE"
                          ? "男"
                          : selectedMember.profile.gender === "FEMALE"
                          ? "女"
                          : "未知"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">注册时间:</span>
                      <span>{formatDate(selectedMember.registerTime)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">账户统计</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">积分余额:</span>
                      <span className="font-medium text-yellow-600">
                        {selectedMember.points.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">账户余额:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(selectedMember.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">累计消费:</span>
                      <span>
                        {formatCurrency(selectedMember.stats.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订单数量:</span>
                      <span>{selectedMember.stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">忠诚度:</span>
                      <span>
                        {selectedMember.stats.loyaltyScore?.toFixed(1) || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedMember.tags && selectedMember.tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">会员标签</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          style={{ backgroundColor: tag.color }}
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个会员吗？此操作不可撤销。
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

      {/* 批量删除确认对话框 */}
      <AlertDialog open={batchActionOpen} onOpenChange={setBatchActionOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除选中的 {selectedMembers.length}{" "}
              个会员吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchDelete}
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
