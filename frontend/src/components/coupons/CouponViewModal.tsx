import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Copy, DollarSign, Gift, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  applicable_products?: string[];
  applicable_categories?: string[];
  applicable_brands?: string[];
  applicable_member_levels?: string[];
}

interface CouponViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

export default function CouponViewModal({
  open,
  onOpenChange,
  coupon,
}: CouponViewModalProps) {
  const { toast } = useToast();

  if (!coupon) return null;

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: "有效", className: "bg-green-100 text-green-800" },
      inactive: { label: "无效", className: "bg-gray-100 text-gray-800" },
      expired: { label: "已过期", className: "bg-red-100 text-red-800" },
      used_up: { label: "已用完", className: "bg-orange-100 text-orange-800" },
    };
    const config = statusMap[status as keyof typeof statusMap] ||
      statusMap.inactive;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      general: { label: "通用", className: "bg-blue-100 text-blue-800" },
      new_user: { label: "新用户", className: "bg-purple-100 text-purple-800" },
      member_exclusive: {
        label: "会员专享",
        className: "bg-yellow-100 text-yellow-800",
      },
      birthday: { label: "生日", className: "bg-pink-100 text-pink-800" },
      activity: { label: "活动", className: "bg-indigo-100 text-indigo-800" },
    };
    const config = typeMap[type as keyof typeof typeMap] || typeMap.general;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getDiscountDisplay = (type: string, value: number) => {
    if (type === "percentage") {
      return `${value}%`;
    } else if (type === "fixed_amount" || type === "fixed") {
      return `¥${value}`;
    } else {
      return "免邮";
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "复制成功",
        description: "优惠券代码已复制到剪贴板",
      });
    } catch {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      });
    }
  };

  const getUsageProgress = () => {
    if (!coupon.total_quantity) return null;
    const percentage = (coupon.used_quantity / coupon.total_quantity) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            优惠券详情
          </DialogTitle>
          <DialogDescription>
            查看优惠券的详细信息和使用情况
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{coupon.name}</h3>
                {coupon.description && (
                  <p className="text-muted-foreground">{coupon.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                {getTypeBadge(coupon.type)}
                {getStatusBadge(coupon.status)}
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  优惠券代码:
                </span>
                <code className="px-2 py-1 bg-background rounded font-mono text-sm">
                  {coupon.code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(coupon.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* 优惠信息 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                优惠设置
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    优惠类型
                  </span>
                  <span className="text-sm font-medium">
                    {coupon.discount_type === "percentage" && "百分比折扣"}
                    {coupon.discount_type === "fixed_amount" && "固定金额"}
                    {coupon.discount_type === "fixed" && "固定金额"}
                    {coupon.discount_type === "free_shipping" && "免邮费"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    优惠金额
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {getDiscountDisplay(
                      coupon.discount_type,
                      coupon.discount_value,
                    )}
                  </span>
                </div>
                {coupon.min_amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      最小金额
                    </span>
                    <span className="text-sm font-medium">
                      ¥{coupon.min_amount}
                    </span>
                  </div>
                )}
                {coupon.max_discount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      最大优惠
                    </span>
                    <span className="text-sm font-medium">
                      ¥{coupon.max_discount}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                使用限制
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">总数量</span>
                  <span className="text-sm font-medium">
                    {coupon.total_quantity || "无限制"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">已使用</span>
                  <span className="text-sm font-medium">
                    {coupon.used_quantity} 次
                  </span>
                </div>
                {coupon.total_quantity && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">使用进度</span>
                      <span className="font-medium">
                        {coupon.used_quantity}/{coupon.total_quantity}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getUsageProgress()}%` }}
                      />
                    </div>
                  </div>
                )}
                {coupon.per_user_limit && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      每人限制
                    </span>
                    <span className="text-sm font-medium">
                      {coupon.per_user_limit} 次
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* 有效期 */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              有效期
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">开始时间</span>
                <div className="text-sm font-medium">{coupon.start_time}</div>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">结束时间</span>
                <div className="text-sm font-medium">{coupon.end_time}</div>
              </div>
            </div>
          </div>

          {/* 适用范围 */}
          {((coupon.applicable_products?.length || 0) > 0 ||
            (coupon.applicable_categories?.length || 0) > 0 ||
            (coupon.applicable_brands?.length || 0) > 0 ||
            (coupon.applicable_member_levels?.length || 0) > 0) && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">适用范围</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {(coupon.applicable_products?.length || 0) > 0 && (
                    <div>
                      <span className="text-muted-foreground">适用商品:</span>
                      <div className="mt-1">
                        {coupon.applicable_products?.join(", ") || "无"}
                      </div>
                    </div>
                  )}
                  {(coupon.applicable_categories?.length || 0) > 0 && (
                    <div>
                      <span className="text-muted-foreground">适用分类:</span>
                      <div className="mt-1">
                        {coupon.applicable_categories?.join(", ") || "无"}
                      </div>
                    </div>
                  )}
                  {(coupon.applicable_brands?.length || 0) > 0 && (
                    <div>
                      <span className="text-muted-foreground">适用品牌:</span>
                      <div className="mt-1">
                        {coupon.applicable_brands?.join(", ") || "无"}
                      </div>
                    </div>
                  )}
                  {(coupon.applicable_member_levels?.length || 0) > 0 && (
                    <div>
                      <span className="text-muted-foreground">适用会员:</span>
                      <div className="mt-1">
                        {coupon.applicable_member_levels?.join(", ") || "无"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
