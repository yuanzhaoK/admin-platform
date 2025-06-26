"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADJUST_USER_POINTS } from "@/lib/graphql/queries";
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

interface PointsAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const ADJUSTMENT_TYPES = [
  { value: "earned_admin", label: "管理员奖励" },
  { value: "used_admin", label: "管理员扣除" },
  { value: "earned_compensation", label: "补偿积分" },
  { value: "used_correction", label: "积分纠正" },
];

export default function PointsAdjustmentModal({
  open,
  onOpenChange,
  onSuccess,
}: PointsAdjustmentModalProps) {
  const [formData, setFormData] = useState({
    user_id: "",
    points: 0,
    type: "",
    reason: "",
    admin_notes: "",
  });
  const [error, setError] = useState("");

  // GraphQL mutation
  const [adjustUserPoints, { loading }] = useMutation(
    ADJUST_USER_POINTS,
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

  const resetForm = () => {
    setFormData({
      user_id: "",
      points: 0,
      type: "",
      reason: "",
      admin_notes: "",
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.user_id.trim()) {
      setError("请输入用户ID");
      return;
    }

    if (formData.points === 0) {
      setError("积分数量不能为0");
      return;
    }

    if (!formData.type) {
      setError("请选择调整类型");
      return;
    }

    if (!formData.reason.trim()) {
      setError("请输入调整原因");
      return;
    }

    try {
      const input = {
        user_id: formData.user_id.trim(),
        points: formData.points,
        type: formData.type,
        reason: formData.reason.trim(),
        admin_notes: formData.admin_notes.trim() || undefined,
      };

      await adjustUserPoints({
        variables: { input },
      });
    } catch (err) {
      console.error("提交失败:", err);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>调整用户积分</DialogTitle>
          <DialogDescription>
            为指定用户调整积分数量，请谨慎操作
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="user_id">用户ID *</Label>
            <Input
              id="user_id"
              value={formData.user_id}
              onChange={(e) =>
                setFormData({ ...formData, user_id: e.target.value })}
              placeholder="输入用户ID"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">积分数量 *</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 0,
                  })}
                placeholder="正数为增加，负数为减少"
                required
              />
              <p className="text-xs text-gray-500">
                正数为增加积分，负数为减少积分
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">调整类型 *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择调整类型" />
                </SelectTrigger>
                <SelectContent>
                  {ADJUSTMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">调整原因 *</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })}
              placeholder="请详细说明调整原因"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin_notes">管理员备注</Label>
            <Textarea
              id="admin_notes"
              value={formData.admin_notes}
              onChange={(e) =>
                setFormData({ ...formData, admin_notes: e.target.value })}
              placeholder="可选的管理员内部备注"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "处理中..." : "确认调整"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
