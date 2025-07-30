"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Coins,
  Crown,
  Download,
  Edit,
  Eye,
  FileText,
  Gift,
  History,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Plus,
  Settings,
  Shield,
  ShieldAlert,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  ACTIVATE_MEMBER,
  ADJUST_POINTS,
  BAN_MEMBER,
  DEACTIVATE_MEMBER,
  GET_ALL_MEMBER_LEVELS,
  GET_MEMBER_DETAIL,
  GET_POINTS_RECORDS,
  UNBAN_MEMBER,
  UPDATE_MEMBER,
  UPGRADE_TO_LEVEL,
} from "@/lib/graphql/queries/member-system";

interface PointsAdjustment {
  type: string;
  points: number;
  reason: string;
  description: string;
}

interface BalanceAdjustment {
  amount: number;
  reason: string;
  description: string;
}

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.id as string;

  // State management
  const [activeTab, setActiveTab] = useState("basic");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [levelDialogOpen, setLevelDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
    realName: "",
    nickname: "",
    gender: "",
    birthday: "",
    bio: "",
  });

  const [pointsAdjustment, setPointsAdjustment] = useState<PointsAdjustment>({
    type: "EARNED_ADMIN",
    points: 0,
    reason: "",
    description: "",
  });

  const [balanceAdjustment, setBalanceAdjustment] = useState<BalanceAdjustment>(
    {
      amount: 0,
      reason: "",
      description: "",
    },
  );

  const [selectedLevel, setSelectedLevel] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [banReason, setBanReason] = useState("");

  // GraphQL queries and mutations
  const { data: memberData, loading: memberLoading, refetch: refetchMember } =
    useQuery(GET_MEMBER_DETAIL, {
      variables: { id: memberId },
      errorPolicy: "all",
    });

  const { data: levelsData } = useQuery(GET_ALL_MEMBER_LEVELS, {
    errorPolicy: "all",
  });

  const { data: pointsData, loading: pointsLoading } = useQuery(
    GET_POINTS_RECORDS,
    {
      variables: {
        query: {
          userId: [memberId],
          pagination: {
            page: 1,
            perPage: 20,
            sortBy: "created",
            sortOrder: "DESC",
          },
          includeUser: true,
          includeRule: true,
        },
      },
      errorPolicy: "all",
    },
  );

  const [updateMember] = useMutation(UPDATE_MEMBER, {
    onCompleted: () => {
      refetchMember();
      setEditDialogOpen(false);
    },
  });

  const [adjustPoints] = useMutation(ADJUST_POINTS, {
    onCompleted: () => {
      refetchMember();
      setPointsDialogOpen(false);
    },
  });

  const [upgradeLevel] = useMutation(UPGRADE_TO_LEVEL, {
    onCompleted: () => {
      refetchMember();
      setLevelDialogOpen(false);
    },
  });

  const [activateMember] = useMutation(ACTIVATE_MEMBER, {
    onCompleted: () => refetchMember(),
  });

  const [deactivateMember] = useMutation(DEACTIVATE_MEMBER, {
    onCompleted: () => refetchMember(),
  });

  const [banMember] = useMutation(BAN_MEMBER, {
    onCompleted: () => refetchMember(),
  });

  const [unbanMember] = useMutation(UNBAN_MEMBER, {
    onCompleted: () => refetchMember(),
  });

  // Data processing
  const member = memberData?.memberDetail?.member;
  const recentOrders = memberData?.memberDetail?.recentOrders || [];
  const recentPoints = memberData?.memberDetail?.recentPoints || [];
  const loginHistory = memberData?.memberDetail?.loginHistory || [];
  const levels = levelsData?.allMemberLevels || [];
  const pointsRecords = pointsData?.pointsRecords?.items || [];

  // Initialize edit form when member data loads
  React.useEffect(() => {
    if (member) {
      setEditForm({
        username: member.profile.username || "",
        email: member.profile.email || "",
        phone: member.profile.phone || "",
        realName: member.profile.realName || "",
        nickname: member.profile.nickname || "",
        gender: member.profile.gender || "",
        birthday: member.profile.birthday || "",
        bio: member.profile.bio || "",
      });
    }
  }, [member]);

  // Event handlers
  const handleEdit = () => {
    updateMember({
      variables: {
        id: memberId,
        input: editForm,
      },
    });
  };

  const handlePointsAdjust = () => {
    adjustPoints({
      variables: {
        input: {
          userId: memberId,
          type: pointsAdjustment.type,
          points: pointsAdjustment.points,
          reason: pointsAdjustment.reason,
          description: pointsAdjustment.description,
        },
      },
    });
  };

  const handleLevelUpgrade = () => {
    upgradeLevel({
      variables: {
        memberId,
        levelId: selectedLevel,
        reason: "管理员手动升级",
      },
    });
  };

  const handleStatusChange = () => {
    switch (newStatus) {
      case "ACTIVE":
        activateMember({ variables: { id: memberId } });
        break;
      case "INACTIVE":
        deactivateMember({ variables: { id: memberId } });
        break;
      case "BANNED":
        banMember({ variables: { id: memberId, reason: banReason } });
        break;
      default:
        break;
    }
    setStatusDialogOpen(false);
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
        <Icon className="h-4 w-4" />
        <span>{risk.label}</span>
      </div>
    );
  };

  const getLevelBadge = (level: any) => {
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

  const getPointsTypeBadge = (type: string) => {
    const typeMap = {
      EARNED_REGISTRATION: {
        label: "注册奖励",
        color: "bg-blue-100 text-blue-800",
      },
      EARNED_LOGIN: { label: "登录奖励", color: "bg-green-100 text-green-800" },
      EARNED_ORDER: {
        label: "订单奖励",
        color: "bg-purple-100 text-purple-800",
      },
      EARNED_ADMIN: {
        label: "管理员增加",
        color: "bg-orange-100 text-orange-800",
      },
      SPENT_EXCHANGE: { label: "积分兑换", color: "bg-red-100 text-red-800" },
      SPENT_ORDER: { label: "订单抵扣", color: "bg-red-100 text-red-800" },
      EXPIRED: { label: "积分过期", color: "bg-gray-100 text-gray-800" },
    };

    const typeInfo = typeMap[type as keyof typeof typeMap] || {
      label: type,
      color: "bg-gray-100 text-gray-800",
    };

    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
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

  if (memberLoading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">会员不存在</h2>
          <p className="text-muted-foreground mt-2">请检查会员ID是否正确</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/members/management/list">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回会员列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/members/management/list">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">会员详情</h1>
            <p className="text-muted-foreground">
              {member.profile.realName || member.profile.username} 的详细信息
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                操作
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑信息
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setPointsDialogOpen(true)}>
                <Coins className="mr-2 h-4 w-4" />
                调整积分
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLevelDialogOpen(true)}>
                <Crown className="mr-2 h-4 w-4" />
                等级管理
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusDialogOpen(true)}>
                <Shield className="mr-2 h-4 w-4" />
                状态管理
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                导出数据
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除会员
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 会员基本信息卡片 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={member.profile.avatar}
                alt={member.profile.nickname || member.profile.username}
              />
              <AvatarFallback className="text-2xl">
                {(member.profile.nickname || member.profile.username)?.[0]
                  ?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-2xl font-bold">
                  {member.profile.realName || member.profile.nickname ||
                    member.profile.username}
                </h2>
                {member.isVerified && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="flex items-center space-x-4 mb-4">
                {getLevelBadge(member.level)}
                {getStatusBadge(member.status)}
                {getRiskBadge(member.riskLevel)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{member.profile.username}</span>
                </div>
                {member.profile.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{member.profile.email}</span>
                  </div>
                )}
                {member.profile.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{member.profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(member.registerTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">积分余额</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {member.points.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              冻结 {member.frozenPoints.toLocaleString()} 积分
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">账户余额</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(member.balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              冻结 {formatCurrency(member.frozenBalance)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订单统计</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {member.stats.totalOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              消费 {formatCurrency(member.stats.totalAmount)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">忠诚度</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {member.stats.loyaltyScore?.toFixed(1) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              平均订单 {formatCurrency(member.stats.averageOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细信息标签页 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="points">积分记录</TabsTrigger>
          <TabsTrigger value="addresses">地址管理</TabsTrigger>
          <TabsTrigger value="tags">标签管理</TabsTrigger>
          <TabsTrigger value="orders">订单历史</TabsTrigger>
          <TabsTrigger value="logs">操作日志</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>个人信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">真实姓名</Label>
                    <p className="font-medium">
                      {member.profile.realName || "未设置"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">昵称</Label>
                    <p className="font-medium">
                      {member.profile.nickname || "未设置"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">性别</Label>
                    <p className="font-medium">
                      {member.profile.gender === "MALE"
                        ? "男"
                        : member.profile.gender === "FEMALE"
                        ? "女"
                        : "未设置"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">生日</Label>
                    <p className="font-medium">
                      {member.profile.birthday
                        ? formatDate(member.profile.birthday)
                        : "未设置"}
                    </p>
                  </div>
                </div>
                {member.profile.bio && (
                  <div>
                    <Label className="text-muted-foreground">个人简介</Label>
                    <p className="font-medium">{member.profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>账户信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">用户名</span>
                    <span className="font-medium">
                      {member.profile.username}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">邮箱</span>
                    <span className="font-medium">
                      {member.profile.email || "未绑定"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">手机号</span>
                    <span className="font-medium">
                      {member.profile.phone || "未绑定"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">注册时间</span>
                    <span className="font-medium">
                      {formatDate(member.registerTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最后登录</span>
                    <span className="font-medium">
                      {member.lastLoginTime
                        ? formatDate(member.lastLoginTime)
                        : "从未登录"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">最后活跃</span>
                    <span className="font-medium">
                      {member.lastActiveTime
                        ? formatDate(member.lastActiveTime)
                        : "无记录"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>等级信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">当前等级</span>
                  {getLevelBadge(member.level)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>等级权益</span>
                    <span>{member.level.discountRate}% 折扣</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>积分倍率</span>
                    <span>{member.level.pointsRate}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>包邮门槛</span>
                    <span>
                      {formatCurrency(member.level.freeShippingThreshold)}
                    </span>
                  </div>
                </div>
                {member.level.benefits && member.level.benefits.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">专享权益</Label>
                    <div className="mt-2 space-y-1">
                      {member.level.benefits.map((benefit, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <Gift className="h-3 w-3 text-purple-500" />
                          <span>{benefit.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>风控信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">风险等级</span>
                  {getRiskBadge(member.riskLevel)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">信任分</span>
                  <span className="font-medium">
                    {member.trustScore?.toFixed(1) || 0}
                  </span>
                </div>
                {member.blacklistReason && (
                  <div>
                    <Label className="text-muted-foreground">风控原因</Label>
                    <p className="text-sm text-red-600 mt-1">
                      {member.blacklistReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>积分记录</CardTitle>
              <CardDescription>会员的积分获得和消费记录</CardDescription>
            </CardHeader>
            <CardContent>
              {pointsLoading
                ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse flex-1" />
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                )
                : pointsRecords.length === 0
                ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无积分记录
                  </div>
                )
                : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>类型</TableHead>
                        <TableHead>积分变动</TableHead>
                        <TableHead>原因</TableHead>
                        <TableHead>余额</TableHead>
                        <TableHead>时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pointsRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {getPointsTypeBadge(record.type)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={record.points > 0
                                ? "text-green-600"
                                : "text-red-600"}
                            >
                              {record.points > 0 ? "+" : ""}
                              {record.points}
                            </span>
                          </TableCell>
                          <TableCell>{record.reason}</TableCell>
                          <TableCell>
                            {record.balance.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(record.created)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>地址管理</CardTitle>
                  <CardDescription>会员的收货地址信息</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加地址
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无地址信息
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>标签管理</CardTitle>
                  <CardDescription>会员的标签分类和属性</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  添加标签
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {member.tags && member.tags.length > 0
                ? (
                  <div className="flex flex-wrap gap-2">
                    {member.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color }}
                        className="flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3" />
                        {tag.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 ml-1"
                        >
                          ×
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )
                : (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无标签信息
                  </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>订单历史</CardTitle>
              <CardDescription>会员的订单记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无订单记录
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
              <CardDescription>会员相关的操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                暂无操作记录
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑信息对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑会员信息</DialogTitle>
            <DialogDescription>
              修改会员的基本信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="realName">真实姓名</Label>
                <Input
                  id="realName"
                  value={editForm.realName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      realName: e.target.value,
                    }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">昵称</Label>
                <Input
                  id="nickname"
                  value={editForm.nickname}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      nickname: e.target.value,
                    }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性别</Label>
                <Select
                  value={editForm.gender}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择性别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">男</SelectItem>
                    <SelectItem value="FEMALE">女</SelectItem>
                    <SelectItem value="UNKNOWN">未知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="请输入个人简介"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEdit}>
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 积分调整对话框 */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>调整积分</DialogTitle>
            <DialogDescription>
              为会员调整积分余额
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>调整类型</Label>
              <Select
                value={pointsAdjustment.type}
                onValueChange={(value) =>
                  setPointsAdjustment((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EARNED_ADMIN">管理员增加</SelectItem>
                  <SelectItem value="SPENT_DEDUCTION">管理员扣除</SelectItem>
                  <SelectItem value="EXPIRED">积分过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>积分数量</Label>
              <Input
                type="number"
                placeholder="请输入积分数量"
                value={pointsAdjustment.points}
                onChange={(e) => setPointsAdjustment((prev) => ({
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
                onChange={(e) => setPointsAdjustment((prev) => ({
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
                onChange={(e) => setPointsAdjustment((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPointsDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handlePointsAdjust}
              disabled={pointsAdjustment.points === 0 ||
                !pointsAdjustment.reason}
            >
              确认调整
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 等级管理对话框 */}
      <Dialog open={levelDialogOpen} onOpenChange={setLevelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>等级管理</DialogTitle>
            <DialogDescription>
              调整会员等级
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">当前等级</Label>
              <div className="mt-2">{getLevelBadge(member.level)}</div>
            </div>
            <div className="space-y-2">
              <Label>目标等级</Label>
              <Select
                value={selectedLevel}
                onValueChange={setSelectedLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择目标等级" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLevelDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleLevelUpgrade}
              disabled={!selectedLevel || selectedLevel === member.levelId}
            >
              确认升级
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 状态管理对话框 */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>状态管理</DialogTitle>
            <DialogDescription>
              修改会员状态
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">当前状态</Label>
              <div className="mt-2">{getStatusBadge(member.status)}</div>
            </div>
            <div className="space-y-2">
              <Label>目标状态</Label>
              <Select
                value={newStatus}
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">正常</SelectItem>
                  <SelectItem value="INACTIVE">未激活</SelectItem>
                  <SelectItem value="BANNED">封禁</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newStatus === "BANNED" && (
              <div className="space-y-2">
                <Label>封禁原因</Label>
                <Textarea
                  placeholder="请输入封禁原因"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={!newStatus || newStatus === member.status}
            >
              确认修改
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
              您确定要删除这个会员吗？此操作不可撤销，将同时删除相关的积分记录、订单记录等数据。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
