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
import { MemberForm } from "@/components/members/MemberForm";
import { MemberLevelForm } from "@/components/members/MemberLevelForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Download,
  Edit,
  Eye,
  Filter,
  Gift,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
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

interface MemberQueryVariables {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  level_id?: string;
  gender?: string;
  register_date_start?: string;
  register_date_end?: string;
  sortBy?: string;
  sortOrder?: string;
}

export default function MembersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("members");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // 表单状态
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [memberLevelFormOpen, setMemberLevelFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [editingLevel, setEditingLevel] = useState<any>(null);

  // 构建查询变量
  const queryVariables: MemberQueryVariables = {
    page: currentPage,
    perPage: pageSize,
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(levelFilter !== "all" && { level_id: levelFilter }),
    sortBy: "register_time",
    sortOrder: "desc",
  };

  // GraphQL查询
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
    error: levelsError,
  } = useQuery(GET_MEMBER_LEVELS, {
    variables: { input: { sortBy: "sort_order", sortOrder: "asc" } },
    errorPolicy: "all",
  });

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
  } = useQuery(GET_MEMBER_STATS, {
    errorPolicy: "all",
  });

  // GraphQL Mutations
  const [deleteMember] = useMutation(DELETE_MEMBER, {
    onCompleted: () => {
      toast({ title: "删除成功", description: "会员已成功删除" });
      refetchMembers();
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

  const [exportMembers] = useMutation(EXPORT_MEMBERS, {
    onCompleted: (data) => {
      // 下载CSV文件
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

  // 重新获取数据当搜索条件改变时
  useEffect(() => {
    const timer = setTimeout(() => {
      refetchMembers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, levelFilter, refetchMembers]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: {
        label: "活跃",
        className: "bg-green-100 text-green-800",
      },
      inactive: {
        label: "不活跃",
        className: "bg-gray-100 text-gray-800",
      },
      banned: {
        label: "已禁用",
        className: "bg-red-100 text-red-800",
      },
    };
    const config = statusMap[status as keyof typeof statusMap] ||
      statusMap.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getLevelBadge = (level: any) => {
    if (!level) {
      return <Badge className="bg-gray-100 text-gray-800">未设置</Badge>;
    }

    const colorMap: Record<string, string> = {
      gray: "bg-gray-100 text-gray-800",
      silver: "bg-slate-100 text-slate-800",
      yellow: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      gold: "bg-yellow-100 text-yellow-800",
    };

    return (
      <Badge className={colorMap[level.color] || "bg-gray-100 text-gray-800"}>
        {level.name}
      </Badge>
    );
  };

  const getLevelIcon = (level: any) => {
    if (!level) return <Users className="h-4 w-4" />;

    const iconMap: Record<string, JSX.Element> = {
      "普通会员": <Users className="h-4 w-4" />,
      "银卡会员": <Star className="h-4 w-4" />,
      "金卡会员": <Crown className="h-4 w-4" />,
      "钻石会员": <Gift className="h-4 w-4" />,
    };
    return iconMap[level.name] || <Users className="h-4 w-4" />;
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm("确定要删除这个会员吗？")) {
      await deleteMember({ variables: { id } });
    }
  };

  const handleBatchDelete = async () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "请选择要删除的会员",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`确定要删除选中的 ${selectedMembers.length} 个会员吗？`)) {
      await batchDeleteMembers({ variables: { ids: selectedMembers } });
    }
  };

  const handleExport = async () => {
    await exportMembers({ variables: { input: queryVariables } });
  };

  const handleCreateMember = () => {
    setEditingMember(null);
    setMemberFormOpen(true);
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setMemberFormOpen(true);
  };

  const handleCreateLevel = () => {
    setEditingLevel(null);
    setMemberLevelFormOpen(true);
  };

  const handleEditLevel = (level: any) => {
    setEditingLevel(level);
    setMemberLevelFormOpen(true);
  };

  const handleFormSuccess = () => {
    refetchMembers();
  };

  const members = membersData?.members?.items || [];
  const membersPagination = membersData?.members?.pagination;
  const levels = levelsData?.memberLevels?.items || [];
  const stats = statsData?.memberStats;

  if (membersError || levelsError || statsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">加载数据时出错</p>
          <Button onClick={() => window.location.reload()}>重新加载</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">会员管理</h1>
          <p className="text-muted-foreground mt-2">
            管理会员信息、等级设置和权益配置
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            导入会员
          </Button>
          <Button onClick={handleCreateMember}>
            <Plus className="mr-2 h-4 w-4" />
            添加会员
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总会员数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.total?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  本月新增{" "}
                  <span className="text-green-600">
                    {stats?.newMembersThisMonth || 0}
                  </span>{" "}
                  人
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃会员</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.active?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  占总数的{" "}
                  <span className="text-blue-600">
                    {stats?.total
                      ? ((stats.active / stats.total) * 100).toFixed(1)
                      : 0}%
                  </span>
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">不活跃会员</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.inactive?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  已禁用{" "}
                  <span className="text-red-600">{stats?.banned || 0}</span> 人
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">会员总积分</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalPoints
                    ? (stats.totalPoints / 10000).toFixed(1) + "万"
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">
                  总余额{" "}
                  <span className="text-yellow-600">
                    ¥{stats?.totalBalance?.toLocaleString() || 0}
                  </span>
                </p>
              </>
            )}
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
          <TabsTrigger value="members">会员列表</TabsTrigger>
          <TabsTrigger value="levels">等级管理</TabsTrigger>
          <TabsTrigger value="stats">数据统计</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
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
                      placeholder="搜索用户名、邮箱或手机号"
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
                    <SelectItem value="active">活跃</SelectItem>
                    <SelectItem value="inactive">不活跃</SelectItem>
                    <SelectItem value="banned">已禁用</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="等级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部等级</SelectItem>
                    {levels.map((level: any) => (
                      <SelectItem key={level.id} value={level.id}>
                        {level.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  高级筛选
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 批量操作 */}
          {selectedMembers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedMembers.length} 个会员
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBatchDelete}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      批量删除
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMembers([])}
                    >
                      取消选择
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 会员列表 */}
          <Card>
            <CardHeader>
              <CardTitle>会员列表</CardTitle>
              <CardDescription>
                共 {membersPagination?.totalItems || 0} 个会员
              </CardDescription>
            </CardHeader>
            <CardContent>
              {membersLoading
                ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )
                : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedMembers.length ===
                                members.length && members.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMembers(
                                  members.map((m: any) => m.id),
                                );
                              } else {
                                setSelectedMembers([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>会员信息</TableHead>
                        <TableHead>等级</TableHead>
                        <TableHead>积分余额</TableHead>
                        <TableHead>订单统计</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member: any) => (
                        <TableRow key={member.id}>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedMembers.includes(member.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedMembers([
                                    ...selectedMembers,
                                    member.id,
                                  ]);
                                } else {
                                  setSelectedMembers(
                                    selectedMembers.filter((id) =>
                                      id !== member.id
                                    ),
                                  );
                                }
                              }}
                              aria-label="选择会员"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {member.real_name || member.username}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                              {member.phone && (
                                <div className="text-xs text-muted-foreground">
                                  {member.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLevelIcon(member.level)}
                              {getLevelBadge(member.level)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {member.points?.toLocaleString() || 0} 积分
                              </div>
                              <div className="text-sm text-muted-foreground">
                                余额 ¥{member.balance || 0}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {member.total_orders || 0} 笔订单
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ¥{member.total_amount?.toLocaleString() || 0}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(member.status)}
                          </TableCell>
                          <TableCell>
                            {member.register_time
                              ? new Date(member.register_time)
                                .toLocaleDateString()
                              : new Date(member.created).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMember(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

              {/* 分页 */}
              {membersPagination && membersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    第 {membersPagination.page} 页，共{" "}
                    {membersPagination.totalPages} 页
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === membersPagination.totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          {/* 等级管理 */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">会员等级管理</h2>
              <p className="text-muted-foreground">
                配置不同会员等级的权益和要求
              </p>
            </div>
            <Button onClick={handleCreateLevel}>
              <Plus className="mr-2 h-4 w-4" />
              添加等级
            </Button>
          </div>

          {levelsLoading
            ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )
            : (
              <div className="grid gap-4 md:grid-cols-2">
                {levels.map((level: any) => (
                  <Card key={level.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          {level.name === "普通会员" && (
                            <Users className="h-5 w-5" />
                          )}
                          {level.name === "银卡会员" && (
                            <Star className="h-5 w-5" />
                          )}
                          {level.name === "金卡会员" && (
                            <Crown className="h-5 w-5" />
                          )}
                          {level.name === "钻石会员" && (
                            <Gift className="h-5 w-5" />
                          )}
                          {level.name}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditLevel(level)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            升级要求
                          </span>
                          <span className="font-medium">
                            {level.points_required?.toLocaleString() || 0} 积分
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            专享折扣
                          </span>
                          <span className="font-medium text-green-600">
                            {level.discount_rate || 0}%
                          </span>
                        </div>
                      </div>
                      {level.description && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-medium mb-2">等级描述</h4>
                          <p className="text-sm text-muted-foreground">
                            {level.description}
                          </p>
                        </div>
                      )}
                      {level.benefits && level.benefits.length > 0 && (
                        <div className="pt-2 border-t">
                          <h4 className="text-sm font-medium mb-2">专享权益</h4>
                          <div className="flex flex-wrap gap-1">
                            {level.benefits.map((
                              benefit: string,
                              index: number,
                            ) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          {/* 数据统计 */}
          <div>
            <h2 className="text-2xl font-bold">数据统计</h2>
            <p className="text-muted-foreground">会员相关的数据分析和统计</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>等级分布</CardTitle>
                <CardDescription>各等级会员数量分布</CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading
                  ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  )
                  : (
                    <div className="space-y-4">
                      {stats?.levelDistribution &&
                        Object.entries(stats.levelDistribution).map(
                          ([levelId, data]: [string, any]) => {
                            const percentage = stats.total > 0
                              ? ((data.count / stats.total) * 100).toFixed(1)
                              : "0";
                            return (
                              <div
                                key={levelId}
                                className="flex items-center justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  {data.name === "普通会员" && (
                                    <Users className="h-4 w-4" />
                                  )}
                                  {data.name === "银卡会员" && (
                                    <Star className="h-4 w-4" />
                                  )}
                                  {data.name === "金卡会员" && (
                                    <Crown className="h-4 w-4" />
                                  )}
                                  {data.name === "钻石会员" && (
                                    <Gift className="h-4 w-4" />
                                  )}
                                  <span className="text-sm">{data.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-blue-600 h-2 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {percentage}%
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    ({data.count.toLocaleString()})
                                  </span>
                                </div>
                              </div>
                            );
                          },
                        )}
                    </div>
                  )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>月度趋势</CardTitle>
                <CardDescription>最近6个月会员增长趋势</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  图表组件将在后续实现
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 会员表单 */}
      <MemberForm
        open={memberFormOpen}
        onOpenChange={setMemberFormOpen}
        member={editingMember}
        onSuccess={handleFormSuccess}
      />

      {/* 会员等级表单 */}
      <MemberLevelForm
        open={memberLevelFormOpen}
        onOpenChange={setMemberLevelFormOpen}
        level={editingLevel}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
