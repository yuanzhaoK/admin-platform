"use client";

import { useState } from "react";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CREATE_COUPON } from "@/lib/graphql/queries";
import { Calendar, Info, Plus, X } from "lucide-react";

interface CouponCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
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
  applicable_products: string[];
  applicable_categories: string[];
  applicable_brands: string[];
  applicable_member_levels: string[];
}

const COUPON_TYPES = [
  { value: "general", label: "通用优惠券", description: "所有用户都可以使用" },
  { value: "new_user", label: "新用户专享", description: "仅限新注册用户使用" },
  {
    value: "member_exclusive",
    label: "会员专享",
    description: "仅限会员用户使用",
  },
  { value: "birthday", label: "生日优惠券", description: "生日当月可用" },
  { value: "activity", label: "活动优惠券", description: "特定活动期间使用" },
];

const DISCOUNT_TYPES = [
  { value: "fixed_amount", label: "固定金额", description: "减免固定金额" },
  { value: "percentage", label: "百分比折扣", description: "按比例折扣" },
  { value: "free_shipping", label: "免邮费", description: "免除配送费用" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "启用", color: "bg-green-100 text-green-800" },
  { value: "inactive", label: "禁用", color: "bg-gray-100 text-gray-800" },
];

export default function CouponCreateForm({
  open,
  onOpenChange,
  onSuccess,
}: CouponCreateFormProps) {
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
    start_time: new Date().toISOString().split("T")[0],
    end_time:
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split(
        "T",
      )[0],
    applicable_products: [],
    applicable_categories: [],
    applicable_brands: [],
    applicable_member_levels: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [advancedSettings, setAdvancedSettings] = useState(false);

  const [createCoupon, { loading }] = useMutation(CREATE_COUPON, {
    onCompleted: () => {
      toast({
        title: "创建成功",
        description: "优惠券已成功创建",
      });
      onSuccess?.();
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

    if (!validateForm()) {
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
    await createCoupon({ variables: { input } });
  };

  const handleClose = () => {
    setFormData({
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
      start_time: new Date().toISOString().split("T")[0],
      end_time:
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split(
          "T",
        )[0],
      applicable_products: [],
      applicable_categories: [],
      applicable_brands: [],
      applicable_member_levels: [],
    });
    setErrors({});
    setAdvancedSettings(false);
    onOpenChange(false);
  };

  const generateCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `COUPON${timestamp}${random}`;
    setFormData({ ...formData, code });
    setErrors({ ...errors, code: "" });
  };

  const updateFormData = (
    field: keyof CouponFormData,
    value: string | number | string[],
  ) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建优惠券</DialogTitle>
          <DialogDescription>
            填写以下信息创建新的优惠券
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">优惠券名称 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    placeholder="例如：春季大促销"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">优惠券代码 *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) =>
                        updateFormData("code", e.target.value.toUpperCase())}
                      placeholder="例如：SPRING2024"
                      className={errors.code ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCode}
                    >
                      生成
                    </Button>
                  </div>
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
                  onChange={(e) =>
                    updateFormData("description", e.target.value)}
                  placeholder="描述优惠券的用途和说明"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>优惠券类型</Label>
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
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>状态</Label>
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
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 优惠设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">优惠设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>优惠类型</Label>
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
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-500">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_amount">最小使用金额 (¥)</Label>
                  <Input
                    id="min_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.min_amount}
                    onChange={(e) =>
                      updateFormData("min_amount", Number(e.target.value))}
                    placeholder="0 表示无限制"
                    className={errors.min_amount ? "border-red-500" : ""}
                  />
                  {errors.min_amount && (
                    <p className="text-sm text-red-500">{errors.min_amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_discount">最大优惠金额 (¥)</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.max_discount}
                    onChange={(e) =>
                      updateFormData("max_discount", Number(e.target.value))}
                    placeholder="0 表示无限制"
                    disabled={formData.discount_type === "fixed_amount"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 使用限制 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">使用限制</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_quantity">总发行数量</Label>
                  <Input
                    id="total_quantity"
                    type="number"
                    min="0"
                    value={formData.total_quantity}
                    onChange={(e) =>
                      updateFormData("total_quantity", Number(e.target.value))}
                    placeholder="0 表示无限制"
                    className={errors.total_quantity ? "border-red-500" : ""}
                  />
                  {errors.total_quantity && (
                    <p className="text-sm text-red-500">
                      {errors.total_quantity}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="per_user_limit">每人使用限制</Label>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">开始时间</Label>
                  <Input
                    id="start_time"
                    type="date"
                    value={formData.start_time}
                    onChange={(e) =>
                      updateFormData("start_time", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">结束时间</Label>
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
            </CardContent>
          </Card>

          {/* 高级设置 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">高级设置</CardTitle>
                <Switch
                  checked={advancedSettings}
                  onCheckedChange={setAdvancedSettings}
                />
              </div>
              <CardDescription>
                设置优惠券的适用范围（商品、分类、品牌、会员等级）
              </CardDescription>
            </CardHeader>
            {advancedSettings && (
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    高级设置功能将在后续版本中完善，目前创建的优惠券适用于所有商品
                  </span>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "创建中..." : "创建优惠券"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
