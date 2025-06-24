"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  CREATE_MEMBER,
  GET_MEMBER_LEVELS,
  UPDATE_MEMBER,
} from "@/lib/graphql/queries";

interface MemberFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member?: any;
  onSuccess?: () => void;
}

export function MemberForm(
  { open, onOpenChange, member, onSuccess }: MemberFormProps,
) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    real_name: "",
    gender: "",
    birthday: "",
    level_id: "",
    points: 0,
    balance: 0,
    total_orders: 0,
    total_amount: 0,
    status: "active",
  });

  // 获取会员等级列表
  const { data: levelsData } = useQuery(GET_MEMBER_LEVELS, {
    variables: { input: { sortBy: "sort_order", sortOrder: "asc" } },
  });

  // 创建会员
  const [createMember, { loading: createLoading }] = useMutation(
    CREATE_MEMBER,
    {
      onCompleted: () => {
        toast({ title: "创建成功", description: "会员已成功创建" });
        onSuccess?.();
        onOpenChange(false);
        resetForm();
      },
      onError: (error) => {
        toast({
          title: "创建失败",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  );

  // 更新会员
  const [updateMember, { loading: updateLoading }] = useMutation(
    UPDATE_MEMBER,
    {
      onCompleted: () => {
        toast({ title: "更新成功", description: "会员信息已成功更新" });
        onSuccess?.();
        onOpenChange(false);
        resetForm();
      },
      onError: (error) => {
        toast({
          title: "更新失败",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  );

  const levels = levelsData?.memberLevels?.items || [];
  const isEditing = !!member;
  const loading = createLoading || updateLoading;

  // 重置表单
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phone: "",
      real_name: "",
      gender: "",
      birthday: "",
      level_id: "",
      points: 0,
      balance: 0,
      total_orders: 0,
      total_amount: 0,
      status: "active",
    });
  };

  // 当会员数据变化时更新表单
  useEffect(() => {
    if (member) {
      setFormData({
        username: member.username || "",
        email: member.email || "",
        phone: member.phone || "",
        real_name: member.real_name || "",
        gender: member.gender || "",
        birthday: member.birthday || "",
        level_id: member.level?.id || "",
        points: member.points || 0,
        balance: member.balance || 0,
        total_orders: member.total_orders || 0,
        total_amount: member.total_amount || 0,
        status: member.status || "active",
      });
    } else {
      resetForm();
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.username || !formData.email || !formData.level_id) {
      toast({
        title: "请填写必填字段",
        description: "用户名、邮箱和会员等级为必填项",
        variant: "destructive",
      });
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "邮箱格式错误",
        description: "请输入正确的邮箱格式",
        variant: "destructive",
      });
      return;
    }

    const input = {
      ...formData,
      points: Number(formData.points),
      balance: Number(formData.balance),
    };

    if (isEditing) {
      await updateMember({
        variables: {
          id: member.id,
          input,
        },
      });
    } else {
      await createMember({
        variables: {
          input,
        },
      });
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "编辑会员" : "添加会员"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "编辑会员信息" : "创建新的会员账户"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名 *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                placeholder="请输入用户名"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱 *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="请输入邮箱"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="real_name">真实姓名</Label>
              <Input
                id="real_name"
                value={formData.real_name}
                onChange={(e) => handleInputChange("real_name", e.target.value)}
                placeholder="请输入真实姓名"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">手机号</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="请输入手机号"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">性别</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="unknown">未知</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthday">生日</Label>
              <Input
                id="birthday"
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level_id">会员等级 *</Label>
              <Select
                value={formData.level_id}
                onValueChange={(value) => handleInputChange("level_id", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择会员等级" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level: any) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">不活跃</SelectItem>
                  <SelectItem value="banned">已禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">积分</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) =>
                  handleInputChange("points", Number(e.target.value))}
                placeholder="请输入积分数量"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">余额</Label>
              <Input
                id="balance"
                type="number"
                min="0"
                step="0.01"
                value={formData.balance}
                onChange={(e) =>
                  handleInputChange("balance", Number(e.target.value))}
                placeholder="请输入余额"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_orders">总订单数</Label>
              <Input
                id="total_orders"
                type="number"
                min="0"
                value={formData.total_orders}
                onChange={(e) =>
                  handleInputChange("total_orders", Number(e.target.value))}
                placeholder="请输入总订单数"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">总消费金额</Label>
              <Input
                id="total_amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) =>
                  handleInputChange("total_amount", Number(e.target.value))}
                placeholder="请输入总消费金额"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEditing ? "更新" : "创建"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
