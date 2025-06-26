"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  CREATE_POINTS_RULE,
  type PointsRuleInput,
  type PointsRuleUpdateInput,
  UPDATE_POINTS_RULE,
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
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PointsRuleTemplateSelector from "./PointsRuleTemplateSelector";
import PointsRuleTemplateModal from "./PointsRuleTemplateModal";
import { type PointsRuleTemplate } from "@/lib/graphql/queries/points";

interface PointsRule {
  id: string;
  name: string;
  description?: string;
  type: string;
  points: number;
  is_active: boolean;
  daily_limit?: number;
  total_limit?: number;
  sort_order: number;
}

interface PointsRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule?: PointsRule;
  onSuccess: () => void;
}

const POINTS_TYPES = [
  { value: "earned_registration", label: "注册奖励" },
  { value: "earned_login", label: "签到奖励" },
  { value: "earned_order", label: "消费奖励" },
  { value: "earned_review", label: "评价奖励" },
  { value: "earned_referral", label: "推荐奖励" },
  { value: "earned_activity", label: "活动奖励" },
  { value: "earned_admin", label: "管理员奖励" },
];

export default function PointsRuleModal({
  open,
  onOpenChange,
  rule,
  onSuccess,
}: PointsRuleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    points: 10,
    is_active: true,
    daily_limit: "",
    total_limit: "",
    sort_order: 0,
  });
  const [error, setError] = useState("");
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const isEdit = !!rule;

  // GraphQL mutations
  const [createRule, { loading: createLoading }] = useMutation(
    CREATE_POINTS_RULE,
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

  const [updateRule, { loading: updateLoading }] = useMutation(
    UPDATE_POINTS_RULE,
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
    if (rule) {
      setFormData({
        name: rule.name,
        description: rule.description || "",
        type: rule.type,
        points: rule.points,
        is_active: rule.is_active,
        daily_limit: rule.daily_limit?.toString() || "",
        total_limit: rule.total_limit?.toString() || "",
        sort_order: rule.sort_order,
      });
    } else {
      resetForm();
    }
    setError("");
  }, [rule, open]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "",
      points: 10,
      is_active: true,
      daily_limit: "",
      total_limit: "",
      sort_order: 0,
    });
    setError("");
  };

  const handleTemplateSelect = (template: PointsRuleTemplate) => {
    const templateData = template.template_data as Record<string, unknown>;
    setFormData({
      name: (templateData.name as string) || "",
      description: (templateData.description as string) || "",
      type: (templateData.type as string) || "",
      points: (templateData.points as number) || 10,
      is_active: (templateData.is_active as boolean) !== false,
      daily_limit: (templateData.daily_limit as number)?.toString() || "",
      total_limit: (templateData.total_limit as number)?.toString() || "",
      sort_order: (templateData.sort_order as number) || 0,
    });
  };

  const handleSaveAsTemplate = () => {
    if (!formData.name.trim() || !formData.type) {
      setError("请先填写完整的规则信息");
      return;
    }
    setShowTemplateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("请输入规则名称");
      return;
    }

    if (!formData.type) {
      setError("请选择积分类型");
      return;
    }

    if (formData.points <= 0) {
      setError("积分数量必须大于0");
      return;
    }

    try {
      const input = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        points: formData.points,
        is_active: formData.is_active,
        daily_limit: formData.daily_limit
          ? parseInt(formData.daily_limit)
          : undefined,
        total_limit: formData.total_limit
          ? parseInt(formData.total_limit)
          : undefined,
        sort_order: formData.sort_order,
      };

      if (isEdit && rule) {
        await updateRule({
          variables: {
            id: rule.id,
            input: input as PointsRuleUpdateInput,
          },
        });
      } else {
        await createRule({
          variables: {
            input: input as PointsRuleInput,
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑积分规则" : "创建积分规则"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "修改积分规则的配置信息" : "创建新的积分获得规则"}
          </DialogDescription>
        </DialogHeader>

        {/* 模板功能按钮 */}
        {!isEdit && (
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowTemplateSelector(true)}
              className="flex-1"
            >
              从模板创建
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveAsTemplate}
              className="flex-1"
            >
              保存为模板
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">规则名称 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })}
              placeholder="输入规则名称"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">规则描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })}
              placeholder="输入规则描述"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">积分类型 *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择积分类型" />
              </SelectTrigger>
              <SelectContent>
                {POINTS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
              min="1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daily_limit">每日限制</Label>
              <Input
                id="daily_limit"
                type="number"
                value={formData.daily_limit}
                onChange={(e) =>
                  setFormData({ ...formData, daily_limit: e.target.value })}
                placeholder="不限制"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_limit">总限制</Label>
              <Input
                id="total_limit"
                type="number"
                value={formData.total_limit}
                onChange={(e) =>
                  setFormData({ ...formData, total_limit: e.target.value })}
                placeholder="不限制"
                min="0"
              />
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

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })}
            />
            <Label>启用规则</Label>
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
              {loading ? "保存中..." : isEdit ? "保存更改" : "创建规则"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* 模板选择器 */}
      <PointsRuleTemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />

      {/* 保存为模板 */}
      <PointsRuleTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        initialData={{
          name: formData.name,
          description: formData.description,
          type: formData.type,
          points: formData.points,
          daily_limit: formData.daily_limit
            ? parseInt(formData.daily_limit)
            : 0,
          total_limit: formData.total_limit
            ? parseInt(formData.total_limit)
            : 0,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
        }}
        onSuccess={() => {
          setShowTemplateModal(false);
          // 可以添加成功提示
        }}
      />
    </Dialog>
  );
}
