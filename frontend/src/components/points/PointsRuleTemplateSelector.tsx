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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@apollo/client";
import {
  GET_POINTS_RULE_TEMPLATES,
  type PointsRuleTemplate,
  type PointsRuleTemplateQueryInput,
} from "@/lib/graphql/queries/points";
import { Clock, Search, Star, Users } from "lucide-react";

interface PointsRuleTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: PointsRuleTemplate) => void;
}

const TEMPLATE_CATEGORIES = [
  { value: "", label: "全部分类" },
  { value: "daily", label: "每日任务" },
  { value: "activity", label: "活动奖励" },
  { value: "purchase", label: "购买奖励" },
  { value: "social", label: "社交互动" },
  { value: "growth", label: "成长任务" },
  { value: "special", label: "特殊活动" },
  { value: "other", label: "其他" },
];

const POINTS_TYPE_LABELS: Record<string, string> = {
  "earned_register": "注册奖励",
  "earned_login": "登录奖励",
  "earned_purchase": "购买奖励",
  "earned_share": "分享奖励",
  "earned_review": "评价奖励",
  "earned_invite": "邀请奖励",
  "earned_task": "任务完成",
  "earned_activity": "活动参与",
  "earned_bonus": "额外奖励",
  "manual_adjustment": "手动调整",
};

export default function PointsRuleTemplateSelector({
  isOpen,
  onClose,
  onSelect,
}: PointsRuleTemplateSelectorProps) {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    sortBy: "usage_count",
    sortOrder: "desc" as "asc" | "desc",
  });

  const queryInput: PointsRuleTemplateQueryInput = {
    page: 1,
    perPage: 20,
    search: filters.search || undefined,
    category: filters.category || undefined,
    is_public: true, // 只显示公开模板
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };

  const { data, loading, error, refetch } = useQuery(
    GET_POINTS_RULE_TEMPLATES,
    {
      variables: { input: queryInput },
      skip: !isOpen,
    },
  );

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTemplateSelect = (template: PointsRuleTemplate) => {
    onSelect(template);
    onClose();
  };

  const formatTemplateData = (templateData: Record<string, unknown>) => {
    return {
      type: templateData.type as string,
      points: templateData.points as number,
      daily_limit: templateData.daily_limit as number,
      total_limit: templateData.total_limit as number,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>选择积分规则模板</DialogTitle>
        </DialogHeader>

        {/* 筛选器 */}
        <div className="flex gap-4 p-4 border-b">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索模板名称或描述..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onValueChange={(value) => {
              const [sortBy, sortOrder] = value.split("_");
              handleFilterChange("sortBy", sortBy);
              handleFilterChange("sortOrder", sortOrder);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usage_count_desc">使用次数 ↓</SelectItem>
              <SelectItem value="usage_count_asc">使用次数 ↑</SelectItem>
              <SelectItem value="created_desc">创建时间 ↓</SelectItem>
              <SelectItem value="created_asc">创建时间 ↑</SelectItem>
              <SelectItem value="name_asc">名称 ↑</SelectItem>
              <SelectItem value="name_desc">名称 ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 模板列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="text-center py-8">
              <div className="text-gray-500">加载中...</div>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500">加载失败: {error.message}</div>
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="mt-2"
              >
                重试
              </Button>
            </div>
          )}

          {data?.pointsRuleTemplates?.items?.length === 0 && !loading && (
            <div className="text-center py-8">
              <div className="text-gray-500">没有找到符合条件的模板</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.pointsRuleTemplates?.items?.map(
              (template: PointsRuleTemplate) => {
                const templateData = formatTemplateData(template.template_data);

                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          {template.description && (
                            <CardDescription className="mt-1">
                              {template.description}
                            </CardDescription>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {template.category && (
                            <Badge variant="secondary" className="text-xs">
                              {TEMPLATE_CATEGORIES.find((c) =>
                                c.value === template.category
                              )?.label || template.category}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            <span>{template.usage_count}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            积分类型:
                          </span>
                          <Badge variant="outline">
                            {POINTS_TYPE_LABELS[templateData.type] ||
                              templateData.type}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            积分数量:
                          </span>
                          <span className="font-semibold text-blue-600">
                            +{templateData.points}
                          </span>
                        </div>

                        {templateData.daily_limit > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              每日限制:
                            </span>
                            <span className="text-sm">
                              {templateData.daily_limit}
                            </span>
                          </div>
                        )}

                        {templateData.total_limit > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              总限制:
                            </span>
                            <span className="text-sm">
                              {templateData.total_limit}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(template.created).toLocaleDateString()}
                            </span>
                          </div>

                          {template.usage_count > 10 && (
                            <div className="flex items-center gap-1 text-xs text-yellow-600">
                              <Star className="h-3 w-3 fill-current" />
                              <span>热门</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
