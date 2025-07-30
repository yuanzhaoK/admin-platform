"use client";

import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Crown,
  Download,
  Minus,
  PieChart,
  RefreshCw,
  Star,
  Tag,
  Target,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  GET_MEMBER_TAGS,
  GET_TAG_ANALYSIS,
} from "@/lib/graphql/queries/member-system";

interface AnalysisData {
  overview: {
    totalTags: number;
    totalRelations: number;
    averageTagsPerMember: number;
    mostUsedTags: Array<{
      tagId: string;
      tagName: string;
      memberCount: number;
      usageRate: number;
    }>;
  };
  categoryDistribution: Array<{
    category: string;
    tagCount: number;
    memberCount: number;
    percentage: number;
  }>;
  tagPerformance: Array<{
    tagId: string;
    tagName: string;
    memberCount: number;
    conversionRate: number;
    averageOrderValue: number;
    businessValue: number;
    roi: number;
  }>;
  memberSegmentation: Array<{
    segment: string;
    description: string;
    memberCount: number;
    tags: string[];
    characteristics: Record<string, unknown>;
  }>;
  trendAnalysis: Array<{
    date: string;
    newTags: number;
    newRelations: number;
    expiredRelations: number;
    netGrowth: number;
  }>;
  recommendations: Array<{
    type: string;
    description: string;
    priority: string;
    impact: string;
    data: Record<string, unknown>;
  }>;
}

export default function TagStatsPage() {
  const [dateRange, setDateRange] = useState("30");

  // GraphQL queries
  const {
    data: analysisData,
    loading: analysisLoading,
    refetch: refetchAnalysis,
  } = useQuery(GET_TAG_ANALYSIS, {
    variables: {
      dateRange: {
        startDate: new Date(
          Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000,
        ).toISOString(),
        endDate: new Date().toISOString(),
      },
    },
    errorPolicy: "all",
  });

  const { data: tagsData } = useQuery(GET_MEMBER_TAGS, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 50,
          sortBy: "memberCount",
          sortOrder: "DESC",
        },
        includeStats: true,
      },
    },
    errorPolicy: "all",
  });

  // Data processing
  const analysis: AnalysisData | null = analysisData?.tagAnalysis || null;
  const tagStats = tagsData?.memberTags?.stats;

  // Utility functions
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTagTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      BEHAVIOR: { label: "行为", variant: "default" },
      DEMOGRAPHIC: { label: "属性", variant: "secondary" },
      TRANSACTION: { label: "交易", variant: "outline" },
      CUSTOM: { label: "自定义", variant: "outline" },
    };

    const typeInfo = typeMap[type] ||
      { label: type, variant: "outline" as const };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">标签统计分析</h1>
          <p className="text-muted-foreground">
            标签使用情况的数据分析和业务洞察
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">最近7天</SelectItem>
              <SelectItem value="30">最近30天</SelectItem>
              <SelectItem value="90">最近90天</SelectItem>
              <SelectItem value="365">最近一年</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => refetchAnalysis()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 核心指标概览 */}
      {analysis && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总标签数</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(analysis.overview.totalTags)}
              </div>
              <p className="text-xs text-muted-foreground">
                活跃标签占主导地位
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总关系数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(analysis.overview.totalRelations)}
              </div>
              <p className="text-xs text-muted-foreground">
                会员-标签关联总数
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均标签数</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analysis.overview.averageTagsPerMember.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                每个会员的平均标签数
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">标签覆盖率</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tagStats?.totalMembers && analysis.overview.totalRelations
                  ? formatPercentage(
                    (analysis.overview.totalRelations / tagStats.totalMembers) *
                      100,
                  )
                  : "0%"}
              </div>
              <p className="text-xs text-muted-foreground">
                被标记的会员比例
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 热门标签排行 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  热门标签排行
                </CardTitle>
                <CardDescription>使用最频繁的标签列表</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analysisLoading
              ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              )
              : analysis?.overview.mostUsedTags.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无数据</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {analysis?.overview.mostUsedTags.slice(0, 10).map((
                    tag,
                    index,
                  ) => (
                    <div
                      key={tag.tagId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index < 3
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{tag.tagName}</div>
                          <div className="text-sm text-muted-foreground">
                            使用率: {formatPercentage(tag.usageRate)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatNumber(tag.memberCount)} 人
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>

        {/* 分类分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              分类分布
            </CardTitle>
            <CardDescription>标签按分类的分布情况</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis?.categoryDistribution.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无分类数据</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {analysis?.categoryDistribution.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {category.tagCount} 个标签
                          </span>
                          <Badge variant="outline">
                            {formatPercentage(category.percentage)}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        覆盖会员: {formatNumber(category.memberCount)} 人
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 标签性能分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              标签性能分析
            </CardTitle>
            <CardDescription>按商业价值和转化率排序</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis?.tagPerformance.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无性能数据</p>
                </div>
              )
              : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>标签名称</TableHead>
                      <TableHead>会员数</TableHead>
                      <TableHead>转化率</TableHead>
                      <TableHead>商业价值</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis?.tagPerformance.slice(0, 8).map((tag) => (
                      <TableRow key={tag.tagId}>
                        <TableCell className="font-medium">
                          {tag.tagName}
                        </TableCell>
                        <TableCell>{formatNumber(tag.memberCount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-green-600 rounded-full"
                                style={{
                                  width: `${tag.conversionRate * 100}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs">
                              {formatPercentage(tag.conversionRate * 100)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {tag.businessValue.toFixed(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
          </CardContent>
        </Card>

        {/* 会员细分 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              会员细分
            </CardTitle>
            <CardDescription>基于标签的会员群体分析</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis?.memberSegmentation.length === 0
              ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <p>暂无细分数据</p>
                </div>
              )
              : (
                <div className="space-y-4">
                  {analysis?.memberSegmentation.slice(0, 5).map((segment) => (
                    <div
                      key={segment.segment}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{segment.segment}</h4>
                        <Badge variant="outline">
                          {formatNumber(segment.memberCount)} 人
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {segment.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {segment.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {segment.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{segment.tags.length - 3} 更多
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* 趋势分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            趋势分析
          </CardTitle>
          <CardDescription>标签创建和使用的时间趋势</CardDescription>
        </CardHeader>
        <CardContent>
          {analysis?.trendAnalysis.length === 0
            ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <p>暂无趋势数据</p>
                <p className="text-sm mt-2">请选择更长的时间范围查看趋势</p>
              </div>
            )
            : (
              <div className="space-y-6">
                {/* 简化的趋势展示 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {analysis?.trendAnalysis.reduce(
                        (sum, item) => sum + item.newTags,
                        0,
                      ) || 0}
                    </div>
                    <div className="text-sm text-blue-800">新增标签</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {analysis?.trendAnalysis.reduce(
                        (sum, item) => sum + item.newRelations,
                        0,
                      ) || 0}
                    </div>
                    <div className="text-sm text-green-800">新增关系</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {analysis?.trendAnalysis.reduce(
                        (sum, item) => sum + item.expiredRelations,
                        0,
                      ) || 0}
                    </div>
                    <div className="text-sm text-yellow-800">过期关系</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {analysis?.trendAnalysis.reduce(
                        (sum, item) => sum + item.netGrowth,
                        0,
                      ) || 0}
                    </div>
                    <div className="text-sm text-purple-800">净增长</div>
                  </div>
                </div>

                {/* 最近的趋势数据表格 */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead>新增标签</TableHead>
                      <TableHead>新增关系</TableHead>
                      <TableHead>过期关系</TableHead>
                      <TableHead>净增长</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis?.trendAnalysis.slice(-7).map((trend) => (
                      <TableRow key={trend.date}>
                        <TableCell>
                          {new Date(trend.date).toLocaleDateString("zh-CN")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{trend.newTags}</span>
                            {getTrendIcon(trend.newTags)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{trend.newRelations}</span>
                            {getTrendIcon(trend.newRelations)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{trend.expiredRelations}</span>
                            {getTrendIcon(trend.expiredRelations)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{trend.netGrowth}</span>
                            {getTrendIcon(trend.netGrowth)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
        </CardContent>
      </Card>

      {/* 智能建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            智能建议
          </CardTitle>
          <CardDescription>基于数据分析的优化建议</CardDescription>
        </CardHeader>
        <CardContent>
          {analysis?.recommendations.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4" />
                <p>暂无建议</p>
                <p className="text-sm mt-2">系统正在分析数据，请稍后查看</p>
              </div>
            )
            : (
              <div className="space-y-4">
                {analysis?.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {recommendation.type === "optimization" && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                          {recommendation.type === "warning" && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          {recommendation.type === "suggestion" && (
                            <ThumbsUp className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="font-medium">
                            {recommendation.type}
                          </span>
                        </div>
                        <Badge
                          className={`text-xs ${
                            getPriorityColor(recommendation.priority)
                          }`}
                          variant="outline"
                        >
                          {recommendation.priority} 优先级
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {recommendation.impact} 影响
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {recommendation.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
