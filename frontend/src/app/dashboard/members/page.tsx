"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
import { MemberForm } from "@/components/members/MemberForm";
import { MemberLevelForm } from "@/components/members/MemberLevelForm";
import {
  BarChart3,
  CheckCircle,
  Coins,
  Crown,
  Download,
  Edit,
  Eye,
  Filter,
  Gift,
  Loader2,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shield,
  ShieldAlert,
  Star,
  Tag,
  Trash2,
  TrendingUp,
  Upload,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  ADJUST_MEMBER_BALANCE,
  ADJUST_MEMBER_POINTS,
  BATCH_DELETE_MEMBERS,
  CREATE_MEMBER_LEVEL,
  DELETE_MEMBER,
  DELETE_MEMBER_LEVEL,
  EXPORT_MEMBERS,
  GET_MEMBER_LEVELS,
  GET_MEMBER_STATS,
  GET_MEMBERS,
  IMPORT_MEMBERS,
  UPDATE_MEMBER_LEVEL,
} from "@/lib/graphql/queries";

// ========================= 类型定义 =========================
interface Member {
  id: string;
  username: string;
  email: string;
  phone?: string;
  nickname?: string;
  real_name?: string;
  avatar?: string;
  gender: "male" | "female" | "unknown";
  birthday?: string;
  status: "active" | "inactive" | "banned" | "pending";
  level?: {
    id: string;
    name: string;
    display_name: string;
    color: string;
    icon?: string;
  };
  profile: {
    points: number;
    balance: number;
    total_consumed: number;
    order_count: number;
    growth_value: number;
  };
  verification: {
    is_email_verified: boolean;
    is_phone_verified: boolean;
    is_identity_verified: boolean;
    risk_level: "low" | "medium" | "high";
    last_login?: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    display_name: string;
    color: string;
  }>;
  created_at: string;
  updated_at: string;
  last_active_at?: string;
}

interface MemberStats {
  total_members: number;
  active_members: number;
  new_members_today: number;
  new_members_week: number;
  new_members_month: number;
  total_points_issued: number;
  total_balance: number;
  average_order_value: number;
  retention_rate: number;
}

interface MemberQueryInput {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  level_id?: string;
  gender?: string;
  risk_level?: string;
  has_orders?: boolean;
  verified_status?: string;
  tags?: string[];
  register_date_start?: string;
  register_date_end?: string;
  sortBy?: string;
  sortOrder?: string;
}

// ========================= 主组件 =========================
export default function MembersPage() {
  const { toast } = useToast();

  // ========================= 状态管理 =========================
  const [selectedTab, setSelectedTab] = useState("members");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // 对话框状态
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberLevelFormOpen, setMemberLevelFormOpen] = useState(false);
  const [memberDetailOpen, setMemberDetailOpen] = useState(false);
  const [pointsAdjustOpen, setPointsAdjustOpen] = useState(false);
  const [balanceAdjustOpen, setBalanceAdjustOpen] = useState(false);
  const [tagManageOpen, setTagManageOpen] = useState(false);
  const [batchActionOpen, setBatchActionOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // 编辑状态
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

  // 调整表单状态
  const [pointsAdjustment, setPointsAdjustment] = useState({
    type: "earned_admin" as const,
    points: 0,
    reason: "",
    description: "",
  });

  const [balanceAdjustment, setBalanceAdjustment] = useState({
    amount: 0,
    reason: "",
    description: "",
  });

  // ========================= GraphQL 查询 =========================
  const queryVariables: MemberQueryInput = useMemo(() => ({
    page: currentPage,
    perPage: pageSize,
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(levelFilter !== "all" && { level_id: levelFilter }),
    ...(genderFilter !== "all" && { gender: genderFilter }),
    ...(riskFilter !== "all" && { risk_level: riskFilter }),
    ...(verifiedFilter !== "all" && { verified_status: verifiedFilter }),
    ...(tagFilter.length > 0 && { tags: tagFilter }),
    sortBy: "created_at",
    sortOrder: "desc",
  }), [
    currentPage,
    pageSize,
    searchTerm,
    statusFilter,
    levelFilter,
    genderFilter,
    riskFilter,
    verifiedFilter,
    tagFilter,
  ]);

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useQuery(GET_MEMBERS, {
    variables: { input: queryVariables },
    errorPolicy: "all",
  });

  const {
    data: levelsData,
    loading: levelsLoading,
  } = useQuery(GET_MEMBER_LEVELS, {
    variables: { input: { sortBy: "sort_order", sortOrder: "asc" } },
    errorPolicy: "all",
  });

  const {
    data: statsData,
    loading: statsLoading,
  } = useQuery(GET_MEMBER_STATS, {
    errorPolicy: "all",
  });

  // 暂时使用空数组，标签功能待后续实现
  const tagsData = { getMemberTags: { items: [] } };
  const tagsLoading = false;

  // ========================= GraphQL Mutations =========================
  const [deleteMember] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      toast({ title: "删除成功", description: "会员已成功删除" });
      refetchMembers();
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [batchDeleteMembers] = useMutation(BATCH_DELETE_MEMBERS, {
    onCompleted: (data) => {
      toast({
        title: "批量删除完成",
        description: data.batchDeleteMembers.message,
      });
      setSelectedMembers([]);
      setBatchActionOpen(false);
      refetchMembers();
    },
    onError: (error) => {
      toast({
        title: "批量删除失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [updateMemberPoints] = useMutation(ADJUST_MEMBER_POINTS, {
    onCompleted: () => {
      toast({ title: "积分调整成功" });
      setPointsAdjustOpen(false);
      refetchMembers();
    },
    onError: (error) => {
      toast({
        title: "积分调整失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [updateMemberBalance] = useMutation(ADJUST_MEMBER_BALANCE, {
    onCompleted: () => {
      toast({ title: "余额调整成功" });
      setBalanceAdjustOpen(false);
      refetchMembers();
    },
    onError: (error) => {
      toast({
        title: "余额调整失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 状态更新功能暂时注释，待后续实现
  // const [updateMemberStatus] = useMutation(UPDATE_MEMBER_STATUS, ...);

  const [exportMembers] = useMutation(EXPORT_MEMBERS, {
    onCompleted: (data) => {
      const blob = new Blob([data.exportMembers], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `members_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: "导出成功", description: "会员数据已导出" });
    },
    onError: (error) => {
      toast({
        title: "导出失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // ========================= 数据处理 =========================
  const members = membersData?.getMembers?.items || [];
  const totalMembers = membersData?.getMembers?.totalItems || 0;
  const levels = levelsData?.getMemberLevels?.items || [];
  const stats = statsData?.getMemberStats;
  const tags = tagsData?.getMemberTags?.items || [];

  // ========================= 事件处理 =========================
  useEffect(() => {
    const timer = setTimeout(() => {
      refetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    levelFilter,
    genderFilter,
    riskFilter,
    verifiedFilter,
    tagFilter,
    refetchMembers,
  ]);

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

  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setMemberDetailOpen(true);
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

  const handlePointsAdjust = (member: Member) => {
    setSelectedMember(member);
    setPointsAdjustment({
      type: "earned_admin",
      points: 0,
      reason: "",
      description: "",
    });
    setPointsAdjustOpen(true);
  };

  const handleBalanceAdjust = (member: Member) => {
    setSelectedMember(member);
    setBalanceAdjustment({
      amount: 0,
      reason: "",
      description: "",
    });
    setBalanceAdjustOpen(true);
  };

  const handleStatusChange = (memberId: string, newStatus: string) => {
    // 状态更新功能待后续实现
    toast({
      title: "功能开发中",
      description: "状态更新功能正在开发中",
    });
  };

  const submitPointsAdjustment = () => {
    if (!selectedMember || pointsAdjustment.points === 0) return;

    updateMemberPoints({
      variables: {
        id: selectedMember.id,
        input: {
          type: pointsAdjustment.type,
          points: pointsAdjustment.points,
          reason: pointsAdjustment.reason,
          description: pointsAdjustment.description,
        },
      },
    });
  };

  const submitBalanceAdjustment = () => {
    if (!selectedMember || balanceAdjustment.amount === 0) return;

    updateMemberBalance({
      variables: {
        id: selectedMember.id,
        input: {
          amount: balanceAdjustment.amount,
          reason: balanceAdjustment.reason,
          description: balanceAdjustment.description,
        },
      },
    });
  };

  const handleExport = () => {
    exportMembers({ variables: { input: queryVariables } });
  };

  const handleBatchAction = (action: string) => {
    if (selectedMembers.length === 0) {
      toast({
        title: "请选择要操作的会员",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case "delete":
        setBatchActionOpen(true);
        break;
      case "export":
        exportMembers({
          variables: {
            input: {
              ...queryVariables,
              memberIds: selectedMembers,
            },
          },
        });
        break;
      default:
        break;
    }
  };

  const confirmBatchDelete = () => {
    batchDeleteMembers({ variables: { ids: selectedMembers } });
  };

  // ========================= 工具函数 =========================
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: "活跃",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      inactive: {
        label: "不活跃",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
      banned: {
        label: "已禁用",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      pending: {
        label: "待激活",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.inactive;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getRiskBadge = (risk_level?: string) => {
    if (!risk_level) return null;
    const riskConfig = {
      low: {
        label: "低风险",
        className: "bg-green-100 text-green-800",
        icon: Shield,
      },
      medium: {
        label: "中风险",
        className: "bg-yellow-100 text-yellow-800",
        icon: ShieldAlert,
      },
      high: {
        label: "高风险",
        className: "bg-red-100 text-red-800",
        icon: XCircle,
      },
    };
    const config = riskConfig[risk_level as keyof typeof riskConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: any) => {
    if (!level) {
      return <Badge className="bg-gray-100 text-gray-800">未设置</Badge>;
    }

    const levelColors = {
      bronze: "bg-amber-100 text-amber-800",
      silver: "bg-slate-100 text-slate-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
      diamond: "bg-blue-100 text-blue-800",
    };

    const getLevelIcon = (name: string) => {
      const iconMap: Record<string, any> = {
        bronze: Users,
        silver: Star,
        gold: Crown,
        platinum: Gift,
        diamond: Crown,
      };
      const Icon = iconMap[name] || Users;
      return <Icon className="mr-1 h-3 w-3" />;
    };

    return (
      <Badge
        className={levelColors[level.name as keyof typeof levelColors] ||
          "bg-gray-100 text-gray-800"}
      >
        {getLevelIcon(level.name)}
        {level.display_name}
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

  // ========================= 渲染组件 =========================
  const renderStatsCards = () => {
    if (statsLoading || !stats) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse">
                  </div>
                </CardTitle>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse">
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1">
                </div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse">
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总会员数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_members.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              活跃会员 {stats.active_members.toLocaleString()} 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">新增会员</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new_members_today}</div>
            <p className="text-xs text-muted-foreground">
              本月新增 {stats.new_members_month} 人
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分总量</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_points_issued.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              总余额 {formatCurrency(stats.total_balance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均客单价</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.average_order_value)}
            </div>
            <p className="text-xs text-muted-foreground">
              留存率 {(stats.retention_rate * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderFilterSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          筛选条件
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <div className="space-y-2">
            <Label>搜索</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索用户名、邮箱、手机号"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有状态</SelectItem>
                <SelectItem value="active">活跃</SelectItem>
                <SelectItem value="inactive">不活跃</SelectItem>
                <SelectItem value="banned">已禁用</SelectItem>
                <SelectItem value="pending">待激活</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>会员等级</Label>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="选择等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有等级</SelectItem>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id}>
                    {level.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>性别</Label>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="选择性别" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有性别</SelectItem>
                <SelectItem value="male">男</SelectItem>
                <SelectItem value="female">女</SelectItem>
                <SelectItem value="unknown">未知</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>风险等级</Label>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="风险等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">所有等级</SelectItem>
                <SelectItem value="low">低风险</SelectItem>
                <SelectItem value="medium">中风险</SelectItem>
                <SelectItem value="high">高风险</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>认证状态</Label>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
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
        </div>
      </CardContent>
    </Card>
  );

  const renderMembersList = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>会员列表</CardTitle>
            <CardDescription>
              共 {totalMembers} 个会员
              {selectedMembers.length > 0 &&
                `, 已选择 ${selectedMembers.length} 个`}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {selectedMembers.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    批量操作 ({selectedMembers.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleBatchAction("export")}>
                    <Download className="mr-2 h-4 w-4" />
                    导出选中
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBatchAction("delete")}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    批量删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>

            <Button onClick={() => setMemberFormOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              添加会员
            </Button>
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
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse">
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse">
                          </div>
                          <div className="space-y-1">
                            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse">
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse">
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="h-5 bg-gray-200 rounded w-16 animate-pulse">
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse">
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse">
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse">
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse">
                          </div>
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse">
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-5 bg-gray-200 rounded w-12 animate-pulse">
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse">
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse">
                        </div>
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
                              src={member.avatar}
                              alt={member.nickname || member.username}
                            />
                            <AvatarFallback>
                              {(member.nickname || member.username)?.[0]
                                ?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center space-x-2">
                              <span>
                                {member.nickname || member.real_name ||
                                  member.username}
                              </span>
                              {member.verification.is_email_verified && (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center space-x-2">
                              {member.email && (
                                <span className="flex items-center">
                                  <Mail className="mr-1 h-3 w-3" />
                                  {member.email}
                                </span>
                              )}
                              {member.phone && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <Phone className="mr-1 h-3 w-3" />
                                    {member.phone}
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
                                    {tag.display_name}
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
                            {member.profile.points.toLocaleString()} 积分
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Wallet className="mr-1 h-3 w-3" />
                            {formatCurrency(member.profile.balance)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {member.profile.order_count} 订单
                          </div>
                          <div className="text-sm text-muted-foreground">
                            消费 {formatCurrency(member.profile.total_consumed)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(member.verification.risk_level)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(member.created_at)}
                        </div>
                        {member.last_active_at && (
                          <div className="text-xs text-muted-foreground">
                            最后活跃: {formatDate(member.last_active_at)}
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
                            <DropdownMenuItem
                              onClick={() => handleViewMember(member)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingMember(member);
                                setMemberFormOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handlePointsAdjust(member)}
                            >
                              <Coins className="mr-2 h-4 w-4" />
                              调整积分
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleBalanceAdjust(member)}
                            >
                              <Wallet className="mr-2 h-4 w-4" />
                              调整余额
                            </DropdownMenuItem>
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

        {totalMembers > pageSize && (
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              显示第 {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, totalMembers)} 项，共{" "}
              {totalMembers} 项
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <div className="text-sm">
                第 {currentPage} / {Math.ceil(totalMembers / pageSize)} 页
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage >= Math.ceil(totalMembers / pageSize)}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">会员管理</h2>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="members">会员列表</TabsTrigger>
          <TabsTrigger value="levels">等级管理</TabsTrigger>
          <TabsTrigger value="tags">标签管理</TabsTrigger>
          <TabsTrigger value="analytics">数据分析</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {renderStatsCards()}
          {renderFilterSection()}
          {renderMembersList()}
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>会员等级管理</CardTitle>
                  <CardDescription>
                    管理会员等级体系和权益配置
                  </CardDescription>
                </div>
                <Button onClick={() => setMemberLevelFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加等级
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {levels.map((level) => (
                  <Card key={level.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        {getLevelBadge(level)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingLevel(level);
                            setMemberLevelFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            升级条件:
                          </span>
                          {level.growth_value_required} 成长值
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">权益:</span>
                          积分比例 {level.points_ratio}x, 折扣{" "}
                          {level.discount_rate}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>标签管理</CardTitle>
                  <CardDescription>
                    管理会员标签和分组
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  添加标签
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tags.map((tag) => (
                  <Card key={tag.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Badge style={{ backgroundColor: tag.color }}>
                          {tag.display_name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {tag.member_count || 0} 人
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据分析</CardTitle>
              <CardDescription>
                会员数据统计和分析报告
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                数据分析功能开发中...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 会员表单对话框 */}
      <Dialog open={memberFormOpen} onOpenChange={setMemberFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "编辑会员" : "添加会员"}
            </DialogTitle>
          </DialogHeader>
          <MemberForm
            member={editingMember}
            onClose={() => {
              setMemberFormOpen(false);
              setEditingMember(null);
            }}
            onSuccess={() => {
              refetchMembers();
              setMemberFormOpen(false);
              setEditingMember(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* 会员等级表单对话框 */}
      <Dialog open={memberLevelFormOpen} onOpenChange={setMemberLevelFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? "编辑等级" : "添加等级"}
            </DialogTitle>
          </DialogHeader>
          <MemberLevelForm
            level={editingLevel}
            onClose={() => {
              setMemberLevelFormOpen(false);
              setEditingLevel(null);
            }}
            onSuccess={() => {
              refetchMembers();
              setMemberLevelFormOpen(false);
              setEditingLevel(null);
            }}
          />
        </DialogContent>
      </Dialog>

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
                    src={selectedMember.avatar}
                    alt={selectedMember.nickname || selectedMember.username}
                  />
                  <AvatarFallback>
                    {(selectedMember.nickname || selectedMember.username)?.[0]
                      ?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMember.nickname || selectedMember.real_name ||
                      selectedMember.username}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    {getLevelBadge(selectedMember.level)}
                    {getStatusBadge(selectedMember.status)}
                    {getRiskBadge(selectedMember.verification.risk_level)}
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
                      <span>{selectedMember.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">邮箱:</span>
                      <span className="flex items-center">
                        {selectedMember.email}
                        {selectedMember.verification.is_email_verified && (
                          <CheckCircle className="ml-1 h-3 w-3 text-green-500" />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">手机:</span>
                      <span className="flex items-center">
                        {selectedMember.phone || "未绑定"}
                        {selectedMember.verification.is_phone_verified && (
                          <CheckCircle className="ml-1 h-3 w-3 text-green-500" />
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">性别:</span>
                      <span>
                        {selectedMember.gender === "male"
                          ? "男"
                          : selectedMember.gender === "female"
                          ? "女"
                          : "未知"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">注册时间:</span>
                      <span>{formatDate(selectedMember.created_at)}</span>
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
                        {selectedMember.profile.points.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">账户余额:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(selectedMember.profile.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">累计消费:</span>
                      <span>
                        {formatCurrency(selectedMember.profile.total_consumed)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">订单数量:</span>
                      <span>{selectedMember.profile.order_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">成长值:</span>
                      <span>{selectedMember.profile.growth_value}</span>
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
                          {tag.display_name}
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

      {/* 积分调整对话框 */}
      <Dialog open={pointsAdjustOpen} onOpenChange={setPointsAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整积分</DialogTitle>
            <DialogDescription>
              为会员 {selectedMember?.nickname || selectedMember?.username}{" "}
              调整积分
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>调整类型</Label>
              <Select
                value={pointsAdjustment.type}
                onValueChange={(value: any) =>
                  setPointsAdjustment((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earned_admin">管理员增加</SelectItem>
                  <SelectItem value="consumed_admin">管理员扣除</SelectItem>
                  <SelectItem value="expired_admin">管理员过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>积分数量</Label>
              <Input
                type="number"
                placeholder="请输入积分数量"
                value={pointsAdjustment.points}
                onChange={(e) =>
                  setPointsAdjustment((prev) => ({
                    ...prev,
                    points: Number(e.target.value),
                  }))}
              />
            </div>
            <div className="space-y-2">
              <Label>调整原因</Label>
              <Input
                placeholder="请输入调整原因"
                value={pointsAdjustment.reason}
                onChange={(e) =>
                  setPointsAdjustment((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))}
              />
            </div>
            <div className="space-y-2">
              <Label>详细说明</Label>
              <Textarea
                placeholder="请输入详细说明（可选）"
                value={pointsAdjustment.description}
                onChange={(e) =>
                  setPointsAdjustment((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPointsAdjustOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={submitPointsAdjustment}
              disabled={pointsAdjustment.points === 0}
            >
              确认调整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 余额调整对话框 */}
      <Dialog open={balanceAdjustOpen} onOpenChange={setBalanceAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整余额</DialogTitle>
            <DialogDescription>
              为会员 {selectedMember?.nickname || selectedMember?.username}{" "}
              调整余额
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>调整金额</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="请输入调整金额"
                value={balanceAdjustment.amount}
                onChange={(e) =>
                  setBalanceAdjustment((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))}
              />
            </div>
            <div className="space-y-2">
              <Label>调整原因</Label>
              <Input
                placeholder="请输入调整原因"
                value={balanceAdjustment.reason}
                onChange={(e) =>
                  setBalanceAdjustment((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))}
              />
            </div>
            <div className="space-y-2">
              <Label>详细说明</Label>
              <Textarea
                placeholder="请输入详细说明（可选）"
                value={balanceAdjustment.description}
                onChange={(e) =>
                  setBalanceAdjustment((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBalanceAdjustOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={submitBalanceAdjustment}
              disabled={balanceAdjustment.amount === 0}
            >
              确认调整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量操作确认对话框 */}
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
    </div>
  );
}
