"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Globe,
  Info,
  Lock,
  Percent,
  Plus,
  Receipt,
  RefreshCw,
  Save,
  Settings,
  Shield,
  TestTube,
  Trash2,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import {
  CREATE_PAYMENT_SETTING,
  GET_PAYMENT_SETTINGS,
  GET_SETTINGS_BY_CATEGORY,
  UPDATE_PAYMENT_SETTING,
} from "@/lib/graphql/queries/member-system";

interface PaymentSettingData {
  id: string;
  provider: string;
  name: string;
  config: Record<string, unknown>;
  is_enabled: boolean;
  is_sandbox: boolean;
  supported_currencies: string[];
  webhook_url?: string;
  created: string;
  updated: string;
}

interface SettingData {
  id: string;
  key: string;
  name: string;
  description?: string;
  value: string;
  type: string;
  is_readonly: boolean;
}

interface PaymentFormData {
  provider: string;
  name: string;
  config: Record<string, unknown>;
  is_enabled: boolean;
  is_sandbox: boolean;
  supported_currencies: string[];
  webhook_url: string;
}

interface PaymentStats {
  totalTransactions: number;
  successRate: number;
  totalRevenue: number;
  activeGateways: number;
  averageAmount: number;
  todayTransactions: number;
}

export default function PaymentSettingsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<
    PaymentSettingData | null
  >(null);
  const [activeTab, setActiveTab] = useState("gateways");

  const [formData, setFormData] = useState<PaymentFormData>({
    provider: "",
    name: "",
    config: {},
    is_enabled: true,
    is_sandbox: true,
    supported_currencies: ["CNY"],
    webhook_url: "",
  });

  // Mock payment stats - 在实际应用中这些数据应该来自API
  const [paymentStats] = useState<PaymentStats>({
    totalTransactions: 12543,
    successRate: 98.5,
    totalRevenue: 2345678.90,
    activeGateways: 3,
    averageAmount: 186.7,
    todayTransactions: 89,
  });

  // GraphQL queries and mutations
  const {
    data: paymentsData,
    loading: paymentsLoading,
    refetch: refetchPayments,
  } = useQuery(GET_PAYMENT_SETTINGS, {
    errorPolicy: "all",
  });

  const { data: settingsData } = useQuery(GET_SETTINGS_BY_CATEGORY, {
    variables: { category: "PAYMENT" },
    errorPolicy: "all",
  });

  const [createPaymentSetting] = useMutation(CREATE_PAYMENT_SETTING, {
    onCompleted: () => {
      setIsCreateModalOpen(false);
      resetForm();
      refetchPayments();
    },
  });

  const [updatePaymentSetting] = useMutation(UPDATE_PAYMENT_SETTING, {
    onCompleted: () => {
      setIsEditModalOpen(false);
      setSelectedSetting(null);
      resetForm();
      refetchPayments();
    },
  });

  // Data processing
  const payments: PaymentSettingData[] = paymentsData?.paymentSettings || [];
  const settings: SettingData[] = settingsData?.settingsByCategory || [];

  // Event handlers
  const resetForm = () => {
    setFormData({
      provider: "",
      name: "",
      config: {},
      is_enabled: true,
      is_sandbox: true,
      supported_currencies: ["CNY"],
      webhook_url: "",
    });
  };

  const handleCreatePayment = async () => {
    try {
      await createPaymentSetting({
        variables: {
          input: formData,
        },
      });
    } catch (error) {
      console.error("Error creating payment setting:", error);
    }
  };

  const handleEditPayment = (payment: PaymentSettingData) => {
    setSelectedSetting(payment);
    setFormData({
      provider: payment.provider,
      name: payment.name,
      config: payment.config,
      is_enabled: payment.is_enabled,
      is_sandbox: payment.is_sandbox,
      supported_currencies: payment.supported_currencies,
      webhook_url: payment.webhook_url || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!selectedSetting) return;

    try {
      await updatePaymentSetting({
        variables: {
          id: selectedSetting.id,
          input: formData,
        },
      });
    } catch (error) {
      console.error("Error updating payment setting:", error);
    }
  };

  const handleTogglePayment = async (payment: PaymentSettingData) => {
    try {
      await updatePaymentSetting({
        variables: {
          id: payment.id,
          input: {
            ...payment,
            is_enabled: !payment.is_enabled,
          },
        },
      });
    } catch (error) {
      console.error("Error toggling payment:", error);
    }
  };

  const handleAddCurrency = () => {
    setFormData((prev) => ({
      ...prev,
      supported_currencies: [...prev.supported_currencies, "USD"],
    }));
  };

  const handleRemoveCurrency = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      supported_currencies: prev.supported_currencies.filter((_, i) =>
        i !== index
      ),
    }));
  };

  const handleCurrencyChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      supported_currencies: prev.supported_currencies.map((curr, i) =>
        i === index ? value : curr
      ),
    }));
  };

  // Utility functions
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case "alipay":
        return <Wallet className="h-4 w-4" />;
      case "wechatpay":
        return <CreditCard className="h-4 w-4" />;
      case "stripe":
        return <CreditCard className="h-4 w-4" />;
      case "paypal":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    const colorMap: Record<string, string> = {
      alipay: "bg-blue-100 text-blue-700",
      wechatpay: "bg-green-100 text-green-700",
      stripe: "bg-purple-100 text-purple-700",
      paypal: "bg-yellow-100 text-yellow-700",
      unionpay: "bg-red-100 text-red-700",
    };
    return colorMap[provider.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const currencyOptions = [
    { value: "CNY", label: "人民币 (CNY)" },
    { value: "USD", label: "美元 (USD)" },
    { value: "EUR", label: "欧元 (EUR)" },
    { value: "GBP", label: "英镑 (GBP)" },
    { value: "JPY", label: "日元 (JPY)" },
    { value: "HKD", label: "港币 (HKD)" },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">支付设置</h1>
          <p className="text-muted-foreground">
            管理支付网关、货币配置和支付安全设置
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetchPayments()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新增支付网关
          </Button>
        </div>
      </div>

      {/* 支付统计概览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总交易量</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentStats.totalTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              累计处理交易
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(paymentStats.successRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              支付成功率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总收入</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paymentStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              累计收入金额
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃网关</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentStats.activeGateways}
            </div>
            <p className="text-xs text-muted-foreground">
              已启用网关数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均金额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(paymentStats.averageAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              单笔交易均值
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日交易</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paymentStats.todayTransactions}
            </div>
            <p className="text-xs text-muted-foreground">
              今日交易笔数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 支付网关配置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            支付网关配置
          </CardTitle>
          <CardDescription>
            管理各个支付渠道的配置和状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsLoading
            ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">加载支付配置中...</p>
              </div>
            )
            : payments.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4" />
                <p>暂无支付网关配置</p>
                <Button
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加第一个支付网关
                </Button>
              </div>
            )
            : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>支付渠道</TableHead>
                    <TableHead>配置名称</TableHead>
                    <TableHead>支持货币</TableHead>
                    <TableHead>模式</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>更新时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getProviderIcon(payment.provider)}
                          <Badge className={getProviderColor(payment.provider)}>
                            {payment.provider}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {payment.supported_currencies.slice(0, 3).map((
                            currency,
                          ) => (
                            <Badge
                              key={currency}
                              variant="outline"
                              className="text-xs"
                            >
                              {currency}
                            </Badge>
                          ))}
                          {payment.supported_currencies.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{payment.supported_currencies.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.is_sandbox ? "secondary" : "default"}
                        >
                          {payment.is_sandbox ? "测试" : "生产"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={payment.is_enabled}
                            onCheckedChange={() => handleTogglePayment(payment)}
                          />
                          <span className="text-sm">
                            {payment.is_enabled ? "启用" : "禁用"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payment.updated)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <TestTube className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {/* 全局支付设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            全局支付设置
          </CardTitle>
          <CardDescription>
            系统级别的支付配置参数
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>暂无全局支付设置</p>
              </div>
            )
            : (
              <div className="grid gap-4 md:grid-cols-2">
                {settings.map((setting) => (
                  <div
                    key={setting.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{setting.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {setting.description}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={setting.is_readonly ? "secondary" : "outline"}
                      >
                        {setting.type}
                      </Badge>
                      <span className="text-sm font-mono">{setting.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>

      {/* 支付安全检查 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            支付安全检查
          </CardTitle>
          <CardDescription>支付系统安全功能检查状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "SSL证书验证",
                status: true,
                description: "确保所有支付请求通过HTTPS加密传输",
              },
              {
                name: "Webhook签名验证",
                status: true,
                description: "验证支付回调的数字签名",
              },
              {
                name: "支付金额限制",
                status: true,
                description: "设置单笔和日累计支付限额",
              },
              {
                name: "异常交易监控",
                status: false,
                description: "实时监控可疑支付行为",
              },
              {
                name: "IP白名单",
                status: false,
                description: "限制支付API的访问来源",
              },
              {
                name: "支付审计日志",
                status: true,
                description: "记录所有支付相关操作",
              },
            ].map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {check.status
                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                    : <AlertTriangle className="h-5 w-5 text-red-500" />}
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {check.description}
                    </div>
                  </div>
                </div>
                <Badge variant={check.status ? "default" : "secondary"}>
                  {check.status ? "已启用" : "未启用"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 创建支付网关对话框 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>创建支付网关</DialogTitle>
            <DialogDescription>
              配置新的支付渠道和相关参数
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider">支付渠道</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择支付渠道" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alipay">支付宝 (Alipay)</SelectItem>
                    <SelectItem value="wechatpay">
                      微信支付 (WeChat Pay)
                    </SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="unionpay">
                      银联支付 (UnionPay)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">配置名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="输入配置名称"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>支持的货币</Label>
              <div className="space-y-2">
                {formData.supported_currencies.map((currency, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={currency}
                      onValueChange={(value) =>
                        handleCurrencyChange(index, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRemoveCurrency(index)}
                      disabled={formData.supported_currencies.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddCurrency}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加货币
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                value={formData.webhook_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    webhook_url: e.target.value,
                  }))}
                placeholder="https://api.example.com/webhook/payment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="config">配置参数 (JSON)</Label>
              <Textarea
                id="config"
                value={JSON.stringify(formData.config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    setFormData((prev) => ({ ...prev, config }));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"api_key": "your_api_key", "secret": "your_secret"}'
                className="font-mono text-sm"
                rows={6}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_enabled: checked }))}
                />
                <Label>启用此支付网关</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_sandbox}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_sandbox: checked }))}
                />
                <Label>沙箱模式</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCreatePayment}
              disabled={!formData.provider || !formData.name}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑支付网关对话框 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑支付网关</DialogTitle>
            <DialogDescription>
              修改支付渠道配置和参数
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-provider">支付渠道</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, provider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择支付渠道" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alipay">支付宝 (Alipay)</SelectItem>
                    <SelectItem value="wechatpay">
                      微信支付 (WeChat Pay)
                    </SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="unionpay">
                      银联支付 (UnionPay)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">配置名称</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="输入配置名称"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>支持的货币</Label>
              <div className="space-y-2">
                {formData.supported_currencies.map((currency, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Select
                      value={currency}
                      onValueChange={(value) =>
                        handleCurrencyChange(index, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencyOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleRemoveCurrency(index)}
                      disabled={formData.supported_currencies.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddCurrency}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加货币
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-webhook_url">Webhook URL</Label>
              <Input
                id="edit-webhook_url"
                value={formData.webhook_url}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    webhook_url: e.target.value,
                  }))}
                placeholder="https://api.example.com/webhook/payment"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-config">配置参数 (JSON)</Label>
              <Textarea
                id="edit-config"
                value={JSON.stringify(formData.config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    setFormData((prev) => ({ ...prev, config }));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{"api_key": "your_api_key", "secret": "your_secret"}'
                className="font-mono text-sm"
                rows={6}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_enabled: checked }))}
                />
                <Label>启用此支付网关</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.is_sandbox}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_sandbox: checked }))}
                />
                <Label>沙箱模式</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleUpdatePayment}
              disabled={!formData.provider || !formData.name}
            >
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 支付说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            支付配置说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• 支付网关配置包含敏感信息，请妥善保管API密钥和私钥</p>
            <p>• 建议在生产环境前充分测试沙箱模式，确保支付流程正常</p>
            <p>• Webhook URL用于接收支付状态通知，需要确保服务器可访问</p>
            <p>• 支持多货币的网关需要在对应平台开通相关权限</p>
            <p>• 定期检查支付网关的费率和政策变更，及时调整配置</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
