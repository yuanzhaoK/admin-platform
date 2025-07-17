"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Eye,
  MousePointer,
  RefreshCw,
  Search,
  TrendingUp,
} from "lucide-react";

// GraphQL 查询
import {
  GET_AD_OVERVIEW_STATS,
  GET_AD_STATS,
  GET_ADVERTISEMENTS,
} from "@/lib/graphql/queries";

interface AdStats {
  id: string;
  ad_id: string;
  date: string;
  view_count: number;
  click_count: number;
  ctr: number;
  cost: number;
  conversion_count: number;
  conversion_rate: number;
  ad?: Advertisement;
}

interface Advertisement {
  id: string;
  title: string;
  type: string;
  status: string;
}

interface AdOverviewStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalClicks: number;
  totalCost: number;
  avgCtr: number;
  topPerforming: Advertisement[];
  positionStats: Record<string, any>;
  typeStats: Record<string, any>;
  dailyStats: any[];
}

export default function AdStatsPage() {
  const [selectedAd, setSelectedAd] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7d");
  const { toast } = useToast();

  // 设置默认日期范围（最近7天）
  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const defaultDates = getDefaultDateRange();
  const [currentStartDate, setCurrentStartDate] = useState(defaultDates.start);
  const [currentEndDate, setCurrentEndDate] = useState(defaultDates.end);

  // GraphQL 查询
  const { data: statsData, loading: statsLoading, refetch: refetchStats } =
    useQuery(GET_AD_STATS, {
      variables: {
        input: {
          ad_id: selectedAd !== "all" ? selectedAd : undefined,
          start_date: currentStartDate,
          end_date: currentEndDate,
          page: 1,
          perPage: 100,
        },
      },
      errorPolicy: "all",
    });

  const { data: advertisementsData, loading: adsLoading } = useQuery(
    GET_ADVERTISEMENTS,
    {
      variables: {
        input: {
          page: 1,
          perPage: 100,
        },
      },
      errorPolicy: "all",
    },
  );

  const { data: overviewData, loading: overviewLoading } = useQuery(
    GET_AD_OVERVIEW_STATS,
    { errorPolicy: "all" },
  );

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    const end = new Date();
    const start = new Date();

    switch (period) {
      case "7d":
        start.setDate(start.getDate() - 7);
        break;
      case "30d":
        start.setDate(start.getDate() - 30);
        break;
      case "90d":
        start.setDate(start.getDate() - 90);
        break;
      case "1y":
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }

    setCurrentStartDate(start.toISOString().split("T")[0]);
    setCurrentEndDate(end.toISOString().split("T")[0]);
  };

  const handleCustomDateRange = () => {
    if (!startDate || !endDate) {
      toast({
        title: "错误",
        description: "请选择开始和结束日期",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "错误",
        description: "开始日期不能晚于结束日期",
        variant: "destructive",
      });
      return;
    }

    setCurrentStartDate(startDate);
    setCurrentEndDate(endDate);
    setSelectedPeriod("custom");
  };

  const exportStats = () => {
    // 这里可以实现导出功能
    toast({
      title: "功能开发中",
      description: "导出功能正在开发中",
    });
  };

  const stats = statsData?.adStats?.items || [];
  const advertisements = advertisementsData?.advertisements?.items || [];
  const overview = overviewData?.adOverviewStats;

  // 计算统计数据
  const totalViews = stats.reduce(
    (sum: number, stat: AdStats) => sum + stat.view_count,
    0,
  );
  const totalClicks = stats.reduce(
    (sum: number, stat: AdStats) => sum + stat.click_count,
    0,
  );
  const totalCost = stats.reduce(
    (sum: number, stat: AdStats) => sum + stat.cost,
    0,
  );
  const avgCtr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const totalConversions = stats.reduce(
    (sum: number, stat: AdStats) => sum + stat.conversion_count,
    0,
  );
  const avgConversionRate = totalClicks > 0
    ? (totalConversions / totalClicks) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">广告统计</h1>
          <p className="text-muted-foreground">
            查看广告的详细统计数据和分析报告
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportStats}>
            <Download className="mr-2 h-4 w-4" />
            导出数据
          </Button>
          <Button variant="outline" onClick={() => refetchStats()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
        </div>
      </div>

      {/* 概览统计卡片 */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总广告数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalAds}</div>
              <p className="text-xs text-muted-foreground">
                活跃: {overview.activeAds} 个
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总浏览量</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.totalViews.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                平均 CTR: {overview.avgCtr.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总点击量</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overview.totalClicks.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                转化率: {avgConversionRate.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总花费</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ¥{overview.totalCost.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                平均 CPC: ¥{(overview.totalCost / overview.totalClicks || 0)
                  .toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选器 */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="ad-select">选择广告</Label>
              <Select value={selectedAd} onValueChange={setSelectedAd}>
                <SelectTrigger>
                  <SelectValue placeholder="所有广告" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有广告</SelectItem>
                  {advertisements.map((ad: Advertisement) => (
                    <SelectItem key={ad.id} value={ad.id}>
                      {ad.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="period-select">时间周期</Label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">最近7天</SelectItem>
                  <SelectItem value="30d">最近30天</SelectItem>
                  <SelectItem value="90d">最近90天</SelectItem>
                  <SelectItem value="1y">最近1年</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedPeriod === "custom" && (
              <>
                <div>
                  <Label htmlFor="start-date">开始日期</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">结束日期</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            {selectedPeriod === "custom" && (
              <div className="flex items-end">
                <Button onClick={handleCustomDateRange}>
                  <Calendar className="mr-2 h-4 w-4" />
                  应用
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 当前筛选的统计数据 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              筛选期间浏览量
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              从 {currentStartDate} 至 {currentEndDate}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              筛选期间点击量
            </CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalClicks.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              CTR: {avgCtr.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">筛选期间花费</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{totalCost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              CPC: ¥{(totalCost / totalClicks || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">转化数</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalConversions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              转化率: {avgConversionRate.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 统计数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle>详细统计数据</CardTitle>
          <CardDescription>
            按日期显示的详细统计数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading
            ? <div className="text-center py-8">加载中...</div>
            : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>日期</TableHead>
                    <TableHead>广告</TableHead>
                    <TableHead>浏览量</TableHead>
                    <TableHead>点击量</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>花费</TableHead>
                    <TableHead>转化数</TableHead>
                    <TableHead>转化率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((stat: AdStats) => {
                    const ad = advertisements.find((a: Advertisement) =>
                      a.id === stat.ad_id
                    );
                    return (
                      <TableRow key={stat.id}>
                        <TableCell>
                          {new Date(stat.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {ad?.title || `广告 ${stat.ad_id}`}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {ad?.type} - {ad?.status}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {stat.view_count.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {stat.click_count.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {stat.ctr.toFixed(2)}%
                          </Badge>
                        </TableCell>
                        <TableCell>¥{stat.cost.toFixed(2)}</TableCell>
                        <TableCell>
                          {stat.conversion_count.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {stat.conversion_rate.toFixed(2)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {stats.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {/* 表现最好的广告 */}
      {overview?.topPerforming && overview.topPerforming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>表现最好的广告</CardTitle>
            <CardDescription>
              按点击量排序的前5个广告
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.topPerforming.map((
                ad: Advertisement,
                index: number,
              ) => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{ad.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {ad.type} - {ad.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {ad.click_count?.toLocaleString() || 0} 点击
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ad.view_count?.toLocaleString() || 0} 浏览
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
