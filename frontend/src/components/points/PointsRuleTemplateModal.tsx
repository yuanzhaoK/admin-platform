"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@apollo/client";
import {
  CREATE_POINTS_RULE_TEMPLATE,
  type PointsRuleTemplate,
  type PointsRuleTemplateInput,
  type PointsRuleTemplateUpdateInput,
  UPDATE_POINTS_RULE_TEMPLATE,
} from "@/lib/graphql/queries/points";
import { useToast } from "@/hooks/use-toast";

interface PointsRuleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template?: PointsRuleTemplate | null;
  initialData?: {
    name: string;
    description: string;
    type: string;
    points: number;
    daily_limit: number;
    total_limit: number;
    is_active: boolean;
    sort_order: number;
  };
  onSuccess?: () => void;
}

const TEMPLATE_CATEGORIES = [
  { value: "daily", label: "每日任务" },
  { value: "activity", label: "活动奖励" },
  { value: "purchase", label: "购买奖励" },
  { value: "social", label: "社交互动" },
  { value: "growth", label: "成长任务" },
  { value: "special", label: "特殊活动" },
  { value: "other", label: "其他" },
];

const POINTS_TYPES = [
  { value: "earned_register", label: "注册奖励" },
  { value: "earned_login", label: "登录奖励" },
  { value: "earned_purchase", label: "购买奖励" },
  { value: "earned_share", label: "分享奖励" },
  { value: "earned_review", label: "评价奖励" },
  { value: "earned_invite", label: "邀请奖励" },
  { value: "earned_task", label: "任务完成" },
  { value: "earned_activity", label: "活动参与" },
  { value: "earned_bonus", label: "额外奖励" },
  { value: "manual_adjustment", label: "手动调整" },
];

export default function PointsRuleTemplateModal({
  isOpen,
  onClose,
  template,
  initialData,
  onSuccess,
}: PointsRuleTemplateModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    is_public: true,
    // 模板数据字段
    rule_name: "",
    rule_description: "",
    type: "",
    points: 0,
    daily_limit: 0,
    total_limit: 0,
    is_active: true,
    sort_order: 0,
  });

  const [createTemplate] = useMutation(CREATE_POINTS_RULE_TEMPLATE);
  const [updateTemplate] = useMutation(UPDATE_POINTS_RULE_TEMPLATE);

  useEffect(() => {
    if (template) {
      const templateData = template.template_data as Record<string, unknown>;
      setFormData({
        name: template.name,
        description: template.description || "",
        category: template.category || "",
        is_public: template.is_public,
        rule_name: (templateData.name as string) || "",
        rule_description: (templateData.description as string) || "",
        type: (templateData.type as string) || "",
        points: (templateData.points as number) || 0,
        daily_limit: (templateData.daily_limit as number) || 0,
        total_limit: (templateData.total_limit as number) || 0,
        is_active: (templateData.is_active as boolean) !== false,
        sort_order: (templateData.sort_order as number) || 0,
      });
    } else if (initialData) {
      // 使用初始数据填充表单
      setFormData({
        name: "",
        description: "",
        category: "",
        is_public: true,
        rule_name: initialData.name,
        rule_description: initialData.description,
        type: initialData.type,
        points: initialData.points,
        daily_limit: initialData.daily_limit,
        total_limit: initialData.total_limit,
        is_active: initialData.is_active,
        sort_order: initialData.sort_order,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        is_public: true,
        rule_name: "",
        rule_description: "",
        type: "",
        points: 0,
        daily_limit: 0,
        total_limit: 0,
        is_active: true,
        sort_order: 0,
      });
    }
  }, [template, initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const templateData = {
        name: formData.rule_name,
        description: formData.rule_description,
        type: formData.type,
        points: formData.points,
        daily_limit: formData.daily_limit || null,
        total_limit: formData.total_limit || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      };

      const input: PointsRuleTemplateInput | PointsRuleTemplateUpdateInput = {
        name: formData.name,
        description: formData.description || undefined,
        template_data: templateData,
        category: formData.category || undefined,
        is_public: formData.is_public,
      };

      if (template) {
        await updateTemplate({
          variables: {
            id: template.id,
            input,
          },
        });
        toast({
          title: "成功",
          description: "模板更新成功",
        });
      } else {
        await createTemplate({
          variables: { input },
        });
        toast({
          title: "成功",
          description: "模板创建成功",
        });
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "错误",
        description: template ? "更新模板失败" : "创建模板失败",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? "编辑积分规则模板" : "创建积分规则模板"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 模板基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">模板信息</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">模板名称 *</Label>
                <Input
                  id="template-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="输入模板名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-category">模板分类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)}
                >
                  <SelectTrigger id="template-category">
                    <SelectValue placeholder="选择分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">不分类</SelectItem>
                    {TEMPLATE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">模板描述</Label>
              <Textarea
                id="template-description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)}
                placeholder="输入模板描述"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) =>
                  handleInputChange("is_public", checked)}
              />
              <Label>公开模板（其他用户可见）</Label>
            </div>
          </div>

          {/* 积分规则配置 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">积分规则配置</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">规则名称 *</Label>
                <Input
                  id="rule-name"
                  value={formData.rule_name}
                  onChange={(e) =>
                    handleInputChange("rule_name", e.target.value)}
                  placeholder="输入规则名称"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-type">积分类型 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                  required
                >
                  <SelectTrigger id="rule-type">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description">规则描述</Label>
              <Textarea
                id="rule-description"
                value={formData.rule_description}
                onChange={(e) =>
                  handleInputChange("rule_description", e.target.value)}
                placeholder="输入规则描述"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-points">积分数量 *</Label>
                <Input
                  id="rule-points"
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    handleInputChange("points", parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-daily-limit">每日限制</Label>
                <Input
                  id="rule-daily-limit"
                  type="number"
                  value={formData.daily_limit}
                  onChange={(e) => handleInputChange(
                    "daily_limit",
                    parseInt(e.target.value) || 0,
                  )}
                  placeholder="0 = 无限制"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rule-total-limit">总限制</Label>
                <Input
                  id="rule-total-limit"
                  type="number"
                  value={formData.total_limit}
                  onChange={(e) =>
                    handleInputChange(
                      "total_limit",
                      parseInt(e.target.value) || 0,
                    )}
                  placeholder="0 = 无限制"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rule-sort-order">排序权重</Label>
                <Input
                  id="rule-sort-order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    handleInputChange(
                      "sort_order",
                      parseInt(e.target.value) || 0,
                    )}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    handleInputChange("is_active", checked)}
                />
                <Label>启用规则</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit">
              {template ? "更新模板" : "创建模板"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
