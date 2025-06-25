import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";
import { UPDATE_COUPON } from "@/lib/graphql/queries";
import { Loader2 } from "lucide-react";

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
  applicable_products: string[];
  applicable_categories: string[];
  applicable_brands: string[];
  applicable_member_levels: string[];
}

interface CouponEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
  onSuccess: () => void;
}

interface CouponFormData {
  name: string;
  description: string;
  code: string;
  type: string;
  discount_type: string;
  discount_value: number;
  min_amount: number;
  max_discount: number;
  total_quantity: number;
  per_user_limit: number;
  status: string;
  start_time: string;
  end_time: string;
}

const COUPON_TYPES = [
  { value: "general", label: "通用优惠券" },
  { value: "new_user", label: "新用户专享" },
  { value: "member_exclusive", label: "会员专享" },
  { value: "birthday", label: "生日优惠券" },
  { value: "activity", label: "活动优惠券" },
];

const DISCOUNT_TYPES = [
  { value: "fixed_amount", label: "固定金额" },
  { value: "percentage", label: "百分比折扣" },
  { value: "free_shipping", label: "免邮费" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "启用" },
  { value: "inactive", label: "禁用" },
];

export default function CouponEditModal({
  open,
  onOpenChange,
  coupon,
  onSuccess,
}: CouponEditModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CouponFormData>({
    name: "",
    description: "",
    code: "",
    type: "general",
    discount_type: "fixed_amount",
    discount_value: 0,
    min_amount: 0,
    max_discount: 0,
    total_quantity: 0,
    per_user_limit: 1,
    status: "active",
    start_time: "",
    end_time: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [updateCoupon, { loading: updating }] = useMutation(UPDATE_COUPON, {
    onCompleted: () => {
      toast({
        title: "更新成功",
        description: "优惠券已成功更新",
      });
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "更新失败",
        description: error.message || "更新优惠券时发生错误",
        variant: "destructive",
      });
    },
  });

  // 当优惠券数据变化时更新表单
  useEffect(() => {
    if (coupon) {
      setFormData({
        name: coupon.name,
        description: coupon.description || "",
        code: coupon.code,
        type: coupon.type,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_amount: coupon.min_amount || 0,
        max_discount: coupon.max_discount || 0,
        total_quantity: coupon.total_quantity || 0,
        per_user_limit: coupon.per_user_limit || 1,
        status: coupon.status,
        start_time: coupon.start_time,
        end_time: coupon.end_time,
      });
      setErrors({});
    }
  }, [coupon]);

  const updateFormData = (
    key: keyof CouponFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // 清除相关错误
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入优惠券名称";
    }

    if (!formData.code.trim()) {
      newErrors.code = "请输入优惠券代码";
    } else if (!/^[A-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = "代码只能包含大写字母、数字、下划线和连字符";
    }

    if (formData.discount_value <= 0) {
      newErrors.discount_value = "优惠值必须大于0";
    }

    if (
      formData.discount_type === "percentage" && formData.discount_value > 100
    ) {
      newErrors.discount_value = "百分比折扣不能超过100%";
    }

    if (formData.min_amount < 0) {
      newErrors.min_amount = "最小金额不能为负数";
    }

    if (formData.total_quantity < 0) {
      newErrors.total_quantity = "总数量不能为负数";
    }

    if (formData.per_user_limit < 1) {
      newErrors.per_user_limit = "用户限制数量至少为1";
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      newErrors.end_time = "结束时间必须晚于开始时间";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coupon || !validateForm()) {
      return;
    }

    const input = {
      ...formData,
      // 如果是无限制，则不传递 total_quantity
      total_quantity: formData.total_quantity === 0
        ? undefined
        : formData.total_quantity,
      // 如果是免邮，优惠值设为0
      discount_value: formData.discount_type === "free_shipping"
        ? 0
        : formData.discount_value,
      // 如果没有最大优惠限制，则不传递
      max_discount: formData.max_discount === 0
        ? undefined
        : formData.max_discount,
      // 如果没有最小金额限制，则不传递
      min_amount: formData.min_amount === 0 ? undefined : formData.min_amount,
    };

    await updateCoupon({
      variables: {
        id: coupon.id,
        input,
      },
    });
  };

  const handleClose = () => {
    setErrors({});
    onOpenChange(false);
  };

  if (!coupon) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑优惠券</DialogTitle>
          <DialogDescription>
            修改优惠券信息，保存后立即生效
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">基本信息</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">优惠券名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">优惠券代码 *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    updateFormData("code", e.target.value.toUpperCase())}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">优惠券类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateFormData("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUPON_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">优惠类型 *</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) =>
                    updateFormData("discount_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">状态 *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 优惠设置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">优惠设置</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  优惠值 *
                  {formData.discount_type === "percentage" && " (%)"}
                  {formData.discount_type === "fixed_amount" && " (¥)"}
                </Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  max={formData.discount_type === "percentage"
                    ? "100"
                    : undefined}
                  step={formData.discount_type === "percentage"
                    ? "0.1"
                    : "0.01"}
                  value={formData.discount_value}
                  onChange={(e) =>
                    updateFormData("discount_value", Number(e.target.value))}
                  disabled={formData.discount_type === "free_shipping"}
                  className={errors.discount_value ? "border-red-500" : ""}
                />
                {errors.discount_value && (
                  <p className="text-sm text-red-500">
                    {errors.discount_value}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_amount">最小金额 (¥)</Label>
                <Input
                  id="min_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.min_amount}
                  onChange={(e) =>
                    updateFormData("min_amount", Number(e.target.value))}
                  className={errors.min_amount ? "border-red-500" : ""}
                />
                {errors.min_amount && (
                  <p className="text-sm text-red-500">{errors.min_amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_discount">最大优惠 (¥)</Label>
                <Input
                  id="max_discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.max_discount}
                  onChange={(e) =>
                    updateFormData("max_discount", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* 使用限制 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">使用限制</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_quantity">总数量 (0=无限制)</Label>
                <Input
                  id="total_quantity"
                  type="number"
                  min="0"
                  value={formData.total_quantity}
                  onChange={(e) =>
                    updateFormData("total_quantity", Number(e.target.value))}
                  className={errors.total_quantity ? "border-red-500" : ""}
                />
                {errors.total_quantity && (
                  <p className="text-sm text-red-500">
                    {errors.total_quantity}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="per_user_limit">每人限制 *</Label>
                <Input
                  id="per_user_limit"
                  type="number"
                  min="1"
                  value={formData.per_user_limit}
                  onChange={(e) =>
                    updateFormData("per_user_limit", Number(e.target.value))}
                  className={errors.per_user_limit ? "border-red-500" : ""}
                />
                {errors.per_user_limit && (
                  <p className="text-sm text-red-500">
                    {errors.per_user_limit}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 有效期 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">有效期</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">开始时间 *</Label>
                <Input
                  id="start_time"
                  type="date"
                  value={formData.start_time}
                  onChange={(e) => updateFormData("start_time", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">结束时间 *</Label>
                <Input
                  id="end_time"
                  type="date"
                  value={formData.end_time}
                  onChange={(e) => updateFormData("end_time", e.target.value)}
                  className={errors.end_time ? "border-red-500" : ""}
                />
                {errors.end_time && (
                  <p className="text-sm text-red-500">{errors.end_time}</p>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updating}
            >
              取消
            </Button>
            <Button type="submit" disabled={updating}>
              {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存更改
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
