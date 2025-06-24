"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  CREATE_MEMBER_LEVEL,
  UPDATE_MEMBER_LEVEL,
} from "@/lib/graphql/queries";

interface MemberLevel {
  id: string;
  name: string;
  description?: string;
  discount_rate: number;
  points_required: number;
  benefits?: string[];
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

interface MemberLevelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  level?: MemberLevel;
  onSuccess?: () => void;
}

export function MemberLevelForm(
  { open, onOpenChange, level, onSuccess }: MemberLevelFormProps,
) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_rate: 0,
    points_required: 0,
    benefits: [] as string[],
    icon: "",
    color: "gray",
    sort_order: 1,
    is_active: true,
  });
  const [newBenefit, setNewBenefit] = useState("");

  // 创建会员等级
  const [createMemberLevel, { loading: createLoading }] = useMutation(
    CREATE_MEMBER_LEVEL,
    {
      onCompleted: () => {
        toast({ title: "创建成功", description: "会员等级已成功创建" });
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

  // 更新会员等级
  const [updateMemberLevel, { loading: updateLoading }] = useMutation(
    UPDATE_MEMBER_LEVEL,
    {
      onCompleted: () => {
        toast({ title: "更新成功", description: "会员等级已成功更新" });
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

  const isEditing = !!level;
  const loading = createLoading || updateLoading;

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      discount_rate: 0,
      points_required: 0,
      benefits: [],
      icon: "",
      color: "gray",
      sort_order: 1,
      is_active: true,
    });
    setNewBenefit("");
  };

  // 当等级数据变化时更新表单
  useEffect(() => {
    if (level) {
      setFormData({
        name: level.name || "",
        description: level.description || "",
        discount_rate: level.discount_rate || 0,
        points_required: level.points_required || 0,
        benefits: level.benefits || [],
        icon: level.icon || "",
        color: level.color || "gray",
        sort_order: level.sort_order || 1,
        is_active: level.is_active !== undefined ? level.is_active : true,
      });
    } else {
      resetForm();
    }
  }, [level]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.name) {
      toast({
        title: "请填写必填字段",
        description: "等级名称为必填项",
        variant: "destructive",
      });
      return;
    }

    const input = {
      ...formData,
      discount_rate: Number(formData.discount_rate),
      points_required: Number(formData.points_required),
      sort_order: Number(formData.sort_order),
    };

    if (isEditing) {
      await updateMemberLevel({
        variables: {
          id: level.id,
          input,
        },
      });
    } else {
      await createMemberLevel({
        variables: {
          input,
        },
      });
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setFormData((prev) => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()],
      }));
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const colorOptions = [
    { value: "gray", label: "灰色", className: "bg-gray-100" },
    { value: "silver", label: "银色", className: "bg-slate-100" },
    { value: "gold", label: "金色", className: "bg-yellow-100" },
    { value: "blue", label: "蓝色", className: "bg-blue-100" },
    { value: "purple", label: "紫色", className: "bg-purple-100" },
    { value: "green", label: "绿色", className: "bg-green-100" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "编辑会员等级" : "添加会员等级"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "编辑会员等级信息" : "创建新的会员等级"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">等级名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="请输入等级名称"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">排序</Label>
              <Input
                id="sort_order"
                type="number"
                min="1"
                value={formData.sort_order}
                onChange={(e) =>
                  handleInputChange("sort_order", Number(e.target.value))}
                placeholder="排序号"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">等级描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="请输入等级描述"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points_required">升级所需积分</Label>
              <Input
                id="points_required"
                type="number"
                min="0"
                value={formData.points_required}
                onChange={(e) =>
                  handleInputChange("points_required", Number(e.target.value))}
                placeholder="所需积分"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_rate">折扣率 (%)</Label>
              <Input
                id="discount_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.discount_rate}
                onChange={(e) =>
                  handleInputChange("discount_rate", Number(e.target.value))}
                placeholder="折扣百分比"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">等级颜色</Label>
              <Select
                value={formData.color}
                onValueChange={(value) => handleInputChange("color", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择颜色" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded ${option.className} border`}
                        />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">图标</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleInputChange("icon", e.target.value)}
                placeholder="图标名称或URL"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>专享权益</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="输入权益内容"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addBenefit();
                    }
                  }}
                />
                <Button type="button" onClick={addBenefit} variant="outline">
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.benefits.map((benefit, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {benefit}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeBenefit(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange("is_active", e.target.checked)}
            />
            <Label htmlFor="is_active">启用此等级</Label>
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
