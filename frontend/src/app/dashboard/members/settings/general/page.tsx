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
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  EyeOff,
  Globe,
  Info,
  Mail,
  RefreshCw,
  Save,
  Undo,
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

export default function GeneralSettingsPage() {
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // GraphQL queries and mutations
  const { data, loading, refetch } = useQuery(GET_SETTINGS_BY_CATEGORY, {
    variables: { category: "GENERAL" },
    errorPolicy: "all",
  });

  const [resetSetting] = useMutation(RESET_SETTING_TO_DEFAULT, {
    onCompleted: () => {
      refetch();
    },
  });

  const [batchUpdateSettings] = useMutation(BATCH_UPDATE_SETTINGS, {
    onCompleted: () => {
      setHasChanges(false);
      setValidationErrors({});
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

    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
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

      // Update form data
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
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EMAIL":
        return <Mail className="h-4 w-4" />;
      case "URL":
        return <Globe className="h-4 w-4" />;
      case "BOOLEAN":
        return <CheckCircle className="h-4 w-4" />;
      case "NUMBER":
        return <Clock className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
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

      case "EMAIL":
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={setting.is_readonly}
            className={isChanged ? "border-orange-300" : ""}
            placeholder="user@example.com"
          />
        );

      case "URL":
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={setting.is_readonly}
            className={isChanged ? "border-orange-300" : ""}
            placeholder="https://example.com"
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={setting.is_readonly}
            className={isChanged ? "border-orange-300" : ""}
          />
        );

      case "JSON":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(setting.key, e.target.value)}
            disabled={setting.is_readonly}
            className={`min-h-[100px] font-mono text-sm ${
              isChanged ? "border-orange-300" : ""
            }`}
            placeholder='{"key": "value"}'
          />
        );

      default: // STRING and others
        if (setting.description && setting.description.length > 100) {
          return (
            <Textarea
              value={value}
              onChange={(e) => handleInputChange(setting.key, e.target.value)}
              disabled={setting.is_readonly}
              className={isChanged ? "border-orange-300" : ""}
              rows={3}
            />
          );
        }
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
      const groupName = setting.group_name || "基础配置";
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(setting);
    });

    // Sort settings within each group by order_index
    Object.keys(groups).forEach((groupName) => {
      groups[groupName].sort((a, b) => a.order_index - b.order_index);
    });

    return groups;
  };

  const groupedSettings = getGroupedSettings();

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">基础设置</h1>
          <p className="text-muted-foreground">
            管理系统的基本信息和核心配置
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

      {/* 更改提示 */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-orange-800">
                您有未保存的更改，请记得保存设置。
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 设置组 */}
      {loading
        ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">加载配置中...</p>
              </div>
            </CardContent>
          </Card>
        )
        : Object.keys(groupedSettings).length === 0
        ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4" />
                <p>暂无基础配置项</p>
              </div>
            </CardContent>
          </Card>
        )
        : (
          Object.entries(groupedSettings).map(([groupName, groupSettings]) => (
            <Card key={groupName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {groupName}
                </CardTitle>
                <CardDescription>
                  {groupSettings.length} 个配置项
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
                            {getTypeIcon(setting.type)}
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

                          {validationErrors[setting.key] && (
                            <p className="text-sm text-red-600">
                              {validationErrors[setting.key]}
                            </p>
                          )}

                          {setting.default_value && (
                            <p className="text-xs text-muted-foreground">
                              默认值: {setting.default_value}
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

      {/* 设置说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            配置说明
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • 基础设置包含系统的核心配置信息，这些设置会影响整个系统的运行
            </p>
            <p>
              • 标记为&quot;只读&quot;的配置项通常由系统自动管理，无法手动修改
            </p>
            <p>• 修改配置后请记得保存，部分配置可能需要重启系统才能生效</p>
            <p>
              • 如需恢复默认值，可以点击&quot;重置&quot;按钮或联系系统管理员
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
