"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Filter, Search, X } from "lucide-react";

export interface PointsRecordFilterOptions {
  username?: string;
  user_id?: string;
  type?: string;
  points_min?: number;
  points_max?: number;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: string;
}

interface PointsRecordFilterProps {
  onFilter: (filters: PointsRecordFilterOptions) => void;
  onExport: (filters: PointsRecordFilterOptions) => void;
  loading?: boolean;
}

const POINTS_TYPES = [
  { value: "all", label: "全部类型" },
  { value: "earned_registration", label: "注册奖励" },
  { value: "earned_login", label: "签到奖励" },
  { value: "earned_order", label: "消费奖励" },
  { value: "earned_review", label: "评价奖励" },
  { value: "earned_referral", label: "推荐奖励" },
  { value: "earned_activity", label: "活动奖励" },
  { value: "earned_admin", label: "管理员奖励" },
  { value: "used_exchange", label: "积分兑换" },
  { value: "used_admin", label: "管理员扣除" },
];

const SORT_OPTIONS = [
  { value: "created", label: "创建时间" },
  { value: "points", label: "积分数量" },
  { value: "balance", label: "余额" },
  { value: "username", label: "用户名" },
];

const SORT_ORDERS = [
  { value: "desc", label: "降序" },
  { value: "asc", label: "升序" },
];

export default function PointsRecordFilter({
  onFilter,
  onExport,
  loading = false,
}: PointsRecordFilterProps) {
  const [filters, setFilters] = useState<PointsRecordFilterOptions>({
    sort_by: "created",
    sort_order: "desc",
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (
    key: keyof PointsRecordFilterOptions,
    value: string | number | undefined,
  ) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    // 清理空值和"all"值
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        value !== "" && value !== null && value !== undefined && value !== "all"
      ) {
        acc[key as keyof PointsRecordFilterOptions] = value;
      }
      return acc;
    }, {} as PointsRecordFilterOptions);

    onFilter(cleanFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      sort_by: "created",
      sort_order: "desc",
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const handleExport = () => {
    // 清理空值和"all"值
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (
        value !== "" && value !== null && value !== undefined && value !== "all"
      ) {
        acc[key as keyof PointsRecordFilterOptions] = value;
      }
      return acc;
    }, {} as PointsRecordFilterOptions);

    onExport(cleanFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "sort_by" || key === "sort_order") return false;
    return value !== "" && value !== null && value !== undefined &&
      value !== "all";
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选条件
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "简单筛选" : "高级筛选"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 基础筛选 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username">用户名</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                placeholder="搜索用户名"
                className="pl-8"
                value={filters.username || ""}
                onChange={(e) => handleFilterChange("username", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">积分类型</Label>
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleFilterChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
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
            <Label htmlFor="date_from">开始日期</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.date_from || ""}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_to">结束日期</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.date_to || ""}
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>
        </div>

        {/* 高级筛选 */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="user_id">用户ID</Label>
              <Input
                id="user_id"
                placeholder="输入用户ID"
                value={filters.user_id || ""}
                onChange={(e) => handleFilterChange("user_id", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points_min">最小积分</Label>
              <Input
                id="points_min"
                type="number"
                placeholder="最小积分数"
                value={filters.points_min || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "points_min",
                    parseInt(e.target.value) || undefined,
                  )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points_max">最大积分</Label>
              <Input
                id="points_max"
                type="number"
                placeholder="最大积分数"
                value={filters.points_max || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "points_max",
                    parseInt(e.target.value) || undefined,
                  )}
              />
            </div>

            <div className="space-y-2">
              <Label>排序方式</Label>
              <div className="flex gap-2">
                <Select
                  value={filters.sort_by || "created"}
                  onValueChange={(value) =>
                    handleFilterChange("sort_by", value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.sort_order || "desc"}
                  onValueChange={(value) =>
                    handleFilterChange("sort_order", value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_ORDERS.map((order) => (
                      <SelectItem key={order.value} value={order.value}>
                        {order.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>已应用筛选条件</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-6 px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  清除
                </Button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={loading}
            >
              重置
            </Button>
            <Button
              onClick={handleSearch}
              disabled={loading}
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? "搜索中..." : "搜索"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
