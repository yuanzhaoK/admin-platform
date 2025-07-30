"use client";

import React, { useEffect, useState } from "react";
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

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  EyeOff,
  FileText,
  Info,
  Key,
  Lock,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Undo,
  UserCheck,
} from "lucide-react";
import {
  BATCH_UPDATE_SETTINGS,
  GET_SETTINGS_BY_CATEGORY,
  RESET_SETTING_TO_DEFAULT,
} from "@/lib/graphql/queries/member-system";

interface SettingData {
  id: string;
  key: string;
  name: string;
  description?: string;
  value: string;
  default_value?: string;
  type: string;
  category: string;
  scope: string;
  is_public: boolean;
  is_readonly: boolean;
  validation_rules?: Record<string, unknown>;
  options?: Record<string, unknown>;
  order_index: number;
  group_name?: string;
  icon?: string;
}

interface SecurityStats {
  activeUsers: number;
  failedLogins: number;
  blockedIPs: number;
  securityLevel: "low" | "medium" | "high";
  lastSecurityUpdate: string;
}

export default function SecuritySettingsPage() {
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("password");

  // Mock security stats - 在实际应用中这些数据应该来自API
  const [securityStats] = useState<SecurityStats>({
    activeUsers: 1234,
    failedLogins: 23,
    blockedIPs: 5,
    securityLevel: "medium",
    lastSecurityUpdate: "2024-01-15T10:30:00Z",
  });

  // GraphQL queries and mutations
  const { data, loading, refetch } = useQuery(GET_SETTINGS_BY_CATEGORY, {
    variables: { category: "SECURITY" },
    errorPolicy: "all",
  });

  const [batchUpdateSettings] = useMutation(BATCH_UPDATE_SETTINGS, {
    onCompleted: () => {
      setHasChanges(false);
      refetch();
    },
  });

  const [resetSetting] = useMutation(RESET_SETTING_TO_DEFAULT, {
    onCompleted: () => {
      refetch();
    },
  });

  // Data processing
  const settings: SettingData[] = data?.settingsByCategory || [];

  // Initialize form data when settings load
  useEffect(() => {
    if (settings.length > 0) {
      const initialData: Record<string, string> = {};
      settings.forEach((setting) => {
        initialData[setting.key] = setting.value;
      });
      setFormData(initialData);
    }
  }, [settings]);

  // Event handlers
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    try {
      const updates = Object.entries(formData)
        .filter(([key, value]) => {
          const setting = settings.find((s) => s.key === key);
          return setting && setting.value !== value;
        })
        .map(([key, value]) => ({ key, value }));

      if (updates.length > 0) {
        await batchUpdateSettings({
          variables: {
            input: { updates },
          },
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleResetSetting = async (key: string) => {
    try {
      await resetSetting({
        variables: { key },
      });

      const setting = settings.find((s) => s.key === key);
      if (setting?.default_value) {
        setFormData((prev) => ({ ...prev, [key]: setting.default_value! }));
      }
    } catch (error) {
      console.error("Error resetting setting:", error);
    }
  };

  const handleResetAll = () => {
    const resetData: Record<string, string> = {};
    settings.forEach((setting) => {
      resetData[setting.key] = setting.default_value || setting.value;
    });
    setFormData(resetData);
    setHasChanges(true);
  };

  // Utility functions
  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case "high":
        return <CheckCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      case "low":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const renderSettingInput = (setting: SettingData) => {
    const value = formData[setting.key] || "";
    const isChanged = value !== setting.value;

    switch (setting.type) {
      case "BOOLEAN":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === "true"}
              onCheckedChange={(checked) =>
                handleInputChange(setting.key, checked.toString())}
              disabled={setting.is_readonly}
            />
            <Label className="text-sm">
              {value === "true" ? "启用" : "禁用"}
            </Label>
          </div>
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={setting.is_readonly}
            className={isChanged ? "border-orange-300" : ""}
            min={setting.validation_rules?.min as number || undefined}
            max={setting.validation_rules?.max as number || undefined}
          />
        );

      case "PASSWORD":
        return (
          <div className="relative">
            <Input
              type="password"
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              disabled={setting.is_readonly}
              className={isChanged ? "border-orange-300" : ""}
            />
            {setting.is_readonly && (
              <EyeOff className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            )}
          </div>
        );

      case "SELECT":
        const options = setting.options as { options?: string[] } | undefined;
        return (
          <Select
            value={value}
            onValueChange={(newValue) =>
              handleInputChange(setting.key, newValue)}
            disabled={setting.is_readonly}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择..." />
            </SelectTrigger>
            <SelectContent>
              {options?.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={setting.is_readonly}
            className={isChanged ? "border-orange-300" : ""}
          />
        );
    }
  };

  const getGroupedSettings = () => {
    const groups: Record<string, SettingData[]> = {};
    settings.forEach((setting) => {
      const groupName = setting.group_name || "安全配置";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(setting);
    });

    Object.keys(groups).forEach((groupName) => {
      groups[groupName].sort((a, b) => a.order_index - b.order_index);
    });

    return groups;
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

  const groupedSettings = getGroupedSettings();

  // Security configuration sections
  const securitySections = [
    {
      id: "password",
      title: "密码策略",
      icon: <Lock className="h-5 w-5" />,
      description: "配置密码复杂度要求和有效期",
    },
    {
      id: "login",
      title: "登录安全",
      icon: <UserCheck className="h-5 w-5" />,
      description: "登录尝试限制和会话管理",
    },
    {
      id: "access",
      title: "访问控制",
      icon: <Shield className="h-5 w-5" />,
      description: "IP白名单和访问权限控制",
    },
    {
      id: "audit",
      title: "审计日志",
      icon: <FileText className="h-5 w-5" />,
      description: "安全事件记录和日志配置",
    },
    {
      id: "monitoring",
      title: "安全监控",
      icon: <Activity className="h-5 w-5" />,
      description: "实时威胁检测和报警设置",
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">安全设置</h1>
          <p className="text-muted-foreground">
            管理系统安全策略和访问控制配置
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          {hasChanges && (
            <>
              <Button variant="outline" onClick={handleResetAll}>
                <Undo className="h-4 w-4 mr-2" />
                重置
              </Button>
              <Button onClick={handleSaveAll}>
                <Save className="h-4 w-4 mr-2" />
                保存更改
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 安全状态概览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">安全等级</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getSecurityLevelIcon(securityStats.securityLevel)}
              <div
                className={`text-2xl font-bold capitalize ${
                  getSecurityLevelColor(securityStats.securityLevel)
                }`}
              >
                {securityStats.securityLevel === "high"
                  ? "高"
                  : securityStats.securityLevel === "medium"
                  ? "中"
                  : "低"}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              当前系统安全等级
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {securityStats.activeUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              当前在线用户数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">登录失败</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {securityStats.failedLogins}
            </div>
            <p className="text-xs text-muted-foreground">
              今日失败登录次数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">阻止IP</CardTitle>
            <Ban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">
              已阻止的恶意IP
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 安全警告提示 */}
      {securityStats.securityLevel !== "high" && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">安全建议</AlertTitle>
          <AlertDescription className="text-yellow-700">
            当前系统安全等级为{securityStats.securityLevel === "medium"
              ? "中等"
              : "较低"}， 建议启用更多安全功能以提高系统安全性。
          </AlertDescription>
        </Alert>
      )}

      {/* 更改提示 */}
      {hasChanges && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <AlertTitle className="text-orange-800">未保存更改</AlertTitle>
          <AlertDescription className="text-orange-700">
            您有未保存的安全设置更改，请记得保存以确保配置生效。
          </AlertDescription>
        </Alert>
      )}

      {/* 安全配置分类导航 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            安全配置分类
          </CardTitle>
          <CardDescription>选择要配置的安全功能类别</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {securitySections.map((section) => (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeTab === section.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveTab(section.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{section.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 设置组 */}
      {loading
        ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">加载安全配置中...</p>
              </div>
            </CardContent>
          </Card>
        )
        : Object.keys(groupedSettings).length === 0
        ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4" />
                <p>暂无安全配置项</p>
                <p className="text-sm mt-2">系统将使用默认安全策略</p>
              </div>
            </CardContent>
          </Card>
        )
        : (
          Object.entries(groupedSettings).map(([groupName, groupSettings]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {groupName}
                </CardTitle>
                <CardDescription>
                  {groupSettings.length} 个安全配置项
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {groupSettings.map((setting) => {
                    const isChanged = formData[setting.key] !== setting.value;
                    return (
                      <div key={setting.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label
                            htmlFor={setting.key}
                            className="flex items-center space-x-2"
                          >
                            <Key className="h-4 w-4" />
                            <span className="font-medium">{setting.name}</span>
                            {setting.is_readonly && (
                              <Badge variant="secondary" className="text-xs">
                                只读
                              </Badge>
                            )}
                            {isChanged && (
                              <Badge
                                variant="outline"
                                className="text-xs text-orange-600 border-orange-300"
                              >
                                已修改
                              </Badge>
                            )}
                          </Label>

                          {!setting.is_readonly && setting.default_value && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResetSetting(setting.key)}
                              className="text-xs"
                            >
                              <Undo className="h-3 w-3 mr-1" />
                              重置
                            </Button>
                          )}
                        </div>

                        {setting.description && (
                          <p className="text-sm text-muted-foreground">
                            {setting.description}
                          </p>
                        )}

                        <div className="space-y-2">
                          {renderSettingInput(setting)}

                          {setting.default_value && (
                            <p className="text-xs text-muted-foreground">
                              默认值: {setting.default_value}
                            </p>
                          )}

                          {setting.validation_rules && (
                            <p className="text-xs text-muted-foreground">
                              验证规则:{" "}
                              {JSON.stringify(setting.validation_rules)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}

      {/* 安全检查列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            安全检查清单
          </CardTitle>
          <CardDescription>系统安全功能检查状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "密码复杂度要求",
                status: true,
                description: "要求密码包含大小写字母、数字和特殊字符",
              },
              {
                name: "登录失败限制",
                status: true,
                description: "限制用户连续登录失败次数",
              },
              {
                name: "会话超时设置",
                status: false,
                description: "自动注销长时间未活动的用户会话",
              },
              {
                name: "IP访问控制",
                status: false,
                description: "限制特定IP地址或地域的访问",
              },
              {
                name: "双因素认证",
                status: false,
                description: "启用短信或邮箱验证码二次验证",
              },
              {
                name: "安全审计日志",
                status: true,
                description: "记录所有安全相关的操作和事件",
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

      {/* 安全说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            安全说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• 安全设置直接影响系统的安全性，请谨慎修改相关配置</p>
            <p>• 建议定期更新安全策略，并监控系统安全状态</p>
            <p>• 启用多因素认证和访问控制可以大大提高系统安全性</p>
            <p>• 修改安全配置后建议进行充分测试，确保不影响正常使用</p>
            <p>
              • 最后更新时间: {formatDate(securityStats.lastSecurityUpdate)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
