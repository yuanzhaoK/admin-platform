import React, { useState } from "react";
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
import {
  BATCH_CREATE_COUPONS,
  GENERATE_COUPON_CODES,
} from "@/lib/graphql/queries";
import { Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BatchGenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface BatchFormData {
  name: string;
  description: string;
  template: string;
  count: number;
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

export default function BatchGenerateModal({
  open,
  onOpenChange,
  onSuccess,
}: BatchGenerateModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BatchFormData>({
    name: "批量生成优惠券",
    description: "",
    template: "COUPON{RANDOM}",
    count: 10,
    type: "general",
    discount_type: "fixed_amount",
    discount_value: 10,
    min_amount: 0,
    max_discount: 0,
    total_quantity: 1,
    per_user_limit: 1,
    status: "active",
    start_time: new Date().toISOString().split("T")[0],
    end_time:
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split(
        "T",
      )[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<"form" | "generating" | "success">("form");
  const [generatedCount, setGeneratedCount] = useState(0);

  const [generateCouponCodes] = useMutation(GENERATE_COUPON_CODES);
  const [batchCreateCoupons] = useMutation(BATCH_CREATE_COUPONS);

  const updateFormData = (key: keyof BatchFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "请输入优惠券名称";
    }

    if (!formData.template.trim()) {
      newErrors.template = "请输入代码模板";
    }

    if (formData.count < 1 || formData.count > 1000) {
      newErrors.count = "生成数量必须在1-1000之间";
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

  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    setStep("generating");

    try {
      // 1. 生成优惠券代码
      const codesResult = await generateCouponCodes({
        variables: {
          template: formData.template,
          count: formData.count,
        },
      });

      const codes = codesResult.data?.generateCouponCodes || [];

      if (codes.length === 0) {
        throw new Error("生成代码失败");
      }

      // 2. 批量创建优惠券
      const couponInput = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === "free_shipping"
          ? 0
          : formData.discount_value,
        min_amount: formData.min_amount === 0 ? undefined : formData.min_amount,
        max_discount: formData.max_discount === 0
          ? undefined
          : formData.max_discount,
        total_quantity: formData.total_quantity === 0
          ? undefined
          : formData.total_quantity,
        per_user_limit: formData.per_user_limit,
        status: formData.status,
        start_time: formData.start_time,
        end_time: formData.end_time,
      };

      const result = await batchCreateCoupons({
        variables: {
          input: couponInput,
          codes,
        },
      });

      setGeneratedCount(result.data?.batchCreateCoupons?.successCount || 0);
      setStep("success");

      toast({
        title: "批量生成成功",
        description: `成功生成 ${
          result.data?.batchCreateCoupons?.successCount || 0
        } 个优惠券`,
      });
    } catch (error) {
      setStep("form");
      toast({
        title: "批量生成失败",
        description: error instanceof Error
          ? error.message
          : "批量生成优惠券时发生错误",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    if (step === "success") {
      onSuccess();
    }
    setStep("form");
    setErrors({});
    setGeneratedCount(0);
    onOpenChange(false);
  };

  const getPreviewCodes = () => {
    const preview: string[] = [];
    for (let i = 0; i < Math.min(3, formData.count); i++) {
      let code = formData.template;
      code = code.replace(/\{RANDOM\}/g, "ABC123");
      code = code.replace(/\{NUMBER\}/g, "1234");
      code = code.replace(/\{DATE\}/g, "1201");
      code = code.replace(/\{INDEX\}/g, (i + 1).toString().padStart(3, "0"));

      if (!formData.template.includes("{")) {
        code = `${formData.template}ABC1`;
      }

      preview.push(code);
    }
    return preview;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量生成优惠券</DialogTitle>
          <DialogDescription>
            快速生成多个具有相同设置的优惠券
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-6">
            {/* 生成设置 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">生成设置</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template">代码模板 *</Label>
                  <Input
                    id="template"
                    value={formData.template}
                    onChange={(e) => updateFormData("template", e.target.value)}
                    className={errors.template ? "border-red-500" : ""}
                  />
                  {errors.template && (
                    <p className="text-sm text-red-500">{errors.template}</p>
                  )}

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      支持占位符：{"{RANDOM}"} 随机字符、{"{NUMBER}"}{" "}
                      随机数字、{"{DATE}"} 日期、{"{INDEX}"} 序号
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="count">生成数量 *</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.count}
                    onChange={(e) =>
                      updateFormData("count", Number(e.target.value))}
                    className={errors.count ? "border-red-500" : ""}
                  />
                  {errors.count && (
                    <p className="text-sm text-red-500">{errors.count}</p>
                  )}
                </div>
              </div>

              {/* 代码预览 */}
              <div className="space-y-2">
                <Label>代码预览</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">
                    示例代码：
                  </div>
                  <div className="space-y-1">
                    {getPreviewCodes().map((code, index) => (
                      <code key={index} className="block font-mono text-sm">
                        {code}
                      </code>
                    ))}
                    {formData.count > 3 && (
                      <div className="text-sm text-muted-foreground">
                        ... 还有 {formData.count - 3} 个
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本信息</h3>

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
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)}
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
                  <Label htmlFor="total_quantity">每张总数量 (0=无限制)</Label>
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
                    onChange={(e) =>
                      updateFormData("start_time", e.target.value)}
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
              >
                取消
              </Button>
              <Button onClick={handleGenerate}>
                生成 {formData.count} 个优惠券
              </Button>
            </div>
          </div>
        )}

        {step === "generating" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <h3 className="text-lg font-medium mb-2">正在生成优惠券...</h3>
            <p className="text-muted-foreground">请稍候，正在批量创建优惠券</p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">生成成功！</h3>
            <p className="text-muted-foreground mb-6">
              成功生成了 {generatedCount} 个优惠券
            </p>
            <Button onClick={handleClose}>
              完成
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
