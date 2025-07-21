"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Edit,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  GET_USERS,
  type GetUsersData,
  type User,
} from "@/lib/graphql/queries/users";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  // GraphQL 查询
  const { data, loading, error, refetch } = useQuery<GetUsersData>(GET_USERS, {
    errorPolicy: "all",
    onError: (error) => {
      console.error("GraphQL 用户查询错误:", error);
      toast({
        title: "获取用户列表失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    },
  });

  // 表单状态
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "user",
    password: "",
  });

  const users = data?.users.items || [] as User[];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // TODO: 实现 GraphQL 更新用户 mutation
        toast({
          title: "功能开发中",
          description: "用户更新功能正在开发中",
          variant: "default",
        });
      } else {
        // TODO: 实现 GraphQL 创建用户 mutation
        toast({
          title: "功能开发中",
          description: "用户创建功能正在开发中",
          variant: "default",
        });
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ email: "", name: "", role: "user", password: "" });
      refetch();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : "请稍后重试";
      toast({
        title: editingUser ? "更新用户失败" : "创建用户失败",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name || "",
      role: user.role || "user",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (confirm(`确定要删除用户 ${user.email} 吗？`)) {
      try {
        // TODO: 实现 GraphQL 删除用户 mutation
        toast({
          title: "功能开发中",
          description: "用户删除功能正在开发中",
          variant: "default",
        });
        refetch();
      } catch {
        toast({
          title: "删除用户失败",
          description: "请稍后重试",
          variant: "destructive",
        });
      }
    }
  };
  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 显示错误信息
  if (error && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              用户管理
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              管理系统中的所有用户账户
            </p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
            加载用户数据失败
          </h3>
          <p className="text-red-600 dark:text-red-300 mb-4">
            {error.message}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            用户管理
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            管理系统中的所有用户账户 (GraphQL)
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  email: "",
                  name: "",
                  role: "user",
                  password: "",
                });
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              添加用户
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "编辑用户" : "添加新用户"}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? "修改用户信息" : "创建一个新的用户账户"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">角色</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") =>
                    setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">普通用户</SelectItem>
                    <SelectItem value="admin">管理员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                  />
                </div>
              )}
              <DialogFooter>
                <Button type="submit">
                  {editingUser ? "更新" : "创建"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索栏 */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <Users className="h-4 w-4" />
          <span>共 {users.length} 个用户</span>
        </div>
      </div>

      {/* 用户表格 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        {loading
          ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">
              </div>
            </div>
          )
          : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0
                  ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        {searchTerm ? "没有找到匹配的用户" : "暂无用户数据"}
                      </TableCell>
                    </TableRow>
                  )
                  : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.avatar}
                                alt={user.name || user.email}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                {user.name?.[0] || user.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-slate-100">
                                {user.name || "未设置"}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.role === "admin"
                              ? "default"
                              : "secondary"}
                            className="flex items-center w-fit"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {user.role === "admin" ? "管理员" : "普通用户"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.verified ? "default" : "destructive"}
                          >
                            {user.verified ? "已验证" : "未验证"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(user.created)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>操作</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEdit(user)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(user)}
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
          )}
      </div>
    </div>
  );
}
