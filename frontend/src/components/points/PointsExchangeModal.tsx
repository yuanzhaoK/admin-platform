"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  CREATE_POINTS_EXCHANGE,
  type PointsExchangeInput,
  type PointsExchangeUpdateInput,
  UPDATE_POINTS_EXCHANGE,
} from "@/lib/graphql/queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PointsExchange {
  id: string;
  name: string;
  description?: string;
  image?: string;
  points_required: number;
  exchange_type: string;
  reward_value?: number;
  reward_product_id?: string;
  reward_coupon_id?: string;
  stock?: number;
  status: string;
  sort_order: number;
}

interface PointsExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exchange?: PointsExchange;
  onSuccess: () => void;
}

const EXCHANGE_TYPES = [
  { value: "balance", label: "余额充值" },
  { value: "coupon", label: "优惠券" },
  { value: "product", label: "实物商品" },
  { value: "privilege", label: "特权服务" },
];

const EXCHANGE_STATUS = [
  { value: "active", label: "有效" },
  { value: "inactive", label: "无效" },
  { value: "out_of_stock", label: "库存不足" },
];

export default function PointsExchangeModal({
  open,
  onOpenChange,
  exchange,
  onSuccess,
}: PointsExchangeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    points_required: 100,
    exchange_type: "",
    reward_value: "",
    reward_product_id: "",
    reward_coupon_id: "",
    stock: "",
    status: "active",
    sort_order: 0,
  });
  const [error, setError] = useState("");

  const isEdit = !!exchange;

  // GraphQL mutations
  const [createExchange, { loading: createLoading }] = useMutation(
    CREATE_POINTS_EXCHANGE,
    {
      onCompleted: () => {
        onSuccess();
        onOpenChange(false);
        resetForm();
      },
      onError: (error) => {
        setError(error.message);
      },
    },
  );

  const [updateExchange, { loading: updateLoading }] = useMutation(
    UPDATE_POINTS_EXCHANGE,
    {
      onCompleted: () => {
        onSuccess();
        onOpenChange(false);
        resetForm();
      },
      onError: (error) => {
        setError(error.message);
      },
    },
  );

  useEffect(() => {
    if (exchange) {
      setFormData({
        name: exchange.name,
        description: exchange.description || "",
        image: exchange.image || "",
        points_required: exchange.points_required,
        exchange_type: exchange.exchange_type,
        reward_value: exchange.reward_value?.toString() || "",
        reward_product_id: exchange.reward_product_id || "",
        reward_coupon_id: exchange.reward_coupon_id || "",
        stock: exchange.stock?.toString() || "",
        status: exchange.status,
        sort_order: exchange.sort_order,
      });
    } else {
      resetForm();
    }
    setError("");
  }, [exchange, open]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      points_required: 100,
      exchange_type: "",
      reward_value: "",
      reward_product_id: "",
      reward_coupon_id: "",
      stock: "",
      status: "active",
      sort_order: 0,
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("请输入商品名称");
      return;
    }

    if (!formData.exchange_type) {
      setError("请选择兑换类型");
      return;
    }

    if (formData.points_required <= 0) {
      setError("所需积分必须大于0");
      return;
    }

    try {
      const input = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        image: formData.image.trim() || undefined,
        points_required: formData.points_required,
        exchange_type: formData.exchange_type,
        reward_value: formData.reward_value
          ? parseFloat(formData.reward_value)
          : undefined,
        reward_product_id: formData.reward_product_id.trim() || undefined,
        reward_coupon_id: formData.reward_coupon_id.trim() || undefined,
        stock: formData.stock ? parseInt(formData.stock) : undefined,
        status: formData.status,
        sort_order: formData.sort_order,
      };

      if (isEdit && exchange) {
        await updateExchange({
          variables: {
            id: exchange.id,
            input: input as PointsExchangeUpdateInput,
          },
        });
      } else {
        await createExchange({
          variables: {
            input: input as PointsExchangeInput,
          },
        });
      }
    } catch (err) {
      console.error("提交失败:", err);
    }
  };

  const loading = createLoading || updateLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑兑换商品" : "创建兑换商品"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改兑换商品的配置信息" : "创建新的积分兑换商品"}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[70vh] overflow-y-auto"
        >
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">商品名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })}
              placeholder="输入商品名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">商品描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })}
              placeholder="输入商品描述"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">商品图片URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })}
              placeholder="输入图片URL"
              type="url"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points_required">所需积分 *</Label>
              <Input
                id="points_required"
                type="number"
                value={formData.points_required}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_required: parseInt(e.target.value) || 0,
                  })}
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exchange_type">兑换类型 *</Label>
              <Select
                value={formData.exchange_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, exchange_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择兑换类型" />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.exchange_type === "balance" && (
            <div className="space-y-2">
              <Label htmlFor="reward_value">充值金额 (元)</Label>
              <Input
                id="reward_value"
                type="number"
                step="0.01"
                value={formData.reward_value}
                onChange={(e) =>
                  setFormData({ ...formData, reward_value: e.target.value })}
                placeholder="输入充值金额"
                min="0"
              />
            </div>
          )}

          {formData.exchange_type === "product" && (
            <div className="space-y-2">
              <Label htmlFor="reward_product_id">关联商品ID</Label>
              <Input
                id="reward_product_id"
                value={formData.reward_product_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reward_product_id: e.target.value,
                  })}
                placeholder="输入商品ID"
              />
            </div>
          )}

          {formData.exchange_type === "coupon" && (
            <div className="space-y-2">
              <Label htmlFor="reward_coupon_id">关联优惠券ID</Label>
              <Input
                id="reward_coupon_id"
                value={formData.reward_coupon_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reward_coupon_id: e.target.value,
                  })}
                placeholder="输入优惠券ID"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">库存数量</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })}
                placeholder="不限制"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">商品状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGE_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">排序顺序</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order: parseInt(e.target.value) || 0,
                })}
              placeholder="0"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEdit ? "保存更改" : "创建商品"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
