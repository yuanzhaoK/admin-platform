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
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Smartphone,
  TestTube,
  Trash2,
  Users,
} from "lucide-react";
import {
  CREATE_NOTIFICATION_SETTING,
  GET_NOTIFICATION_SETTINGS,
  GET_SETTINGS_BY_CATEGORY,
  UPDATE_NOTIFICATION_SETTING,
} from "@/lib/graphql/queries/member-system";

interface NotificationSettingData {
  id: string;
  type: string;
  channel: string;
  template: string;
  is_enabled: boolean;
  config: Record<string, unknown>;
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

interface NotificationFormData {
  type: string;
  channel: string;
  template: string;
  is_enabled: boolean;
  config: Record<string, unknown>;
}

export default function NotificationSettingsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<
    NotificationSettingData | null
  >(null);
  const [activeTab, setActiveTab] = useState("email");

  const [formData, setFormData] = useState<NotificationFormData>({
    type: "",
    channel: "email",
    template: "",
    is_enabled: true,
    config: {},
  });

  // GraphQL queries and mutations
  const {
    data: notificationsData,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery(GET_NOTIFICATION_SETTINGS, {
    errorPolicy: "all",
  });

  const { data: settingsData, refetch: refetchSettings } = useQuery(
    GET_SETTINGS_BY_CATEGORY,
    {
      variables: { category: "NOTIFICATION" },
      errorPolicy: "all",
    },
  );

  const [createNotificationSetting] = useMutation(CREATE_NOTIFICATION_SETTING, {
    onCompleted: () => {
      setIsCreateModalOpen(false);
      resetForm();
      refetchNotifications();
    },
  });

  const [updateNotificationSetting] = useMutation(UPDATE_NOTIFICATION_SETTING, {
    onCompleted: () => {
      setIsEditModalOpen(false);
      setSelectedSetting(null);
      resetForm();
      refetchNotifications();
    },
  });

  // Data processing
  const notifications: NotificationSettingData[] =
    notificationsData?.notificationSettings || [];
  const settings: SettingData[] = settingsData?.settingsByCategory || [];

  // Filter notifications by channel
  const emailNotifications = notifications.filter((n) => n.channel === "email");
  const smsNotifications = notifications.filter((n) => n.channel === "sms");
  const pushNotifications = notifications.filter((n) => n.channel === "push");

  // Event handlers
  const resetForm = () => {
    setFormData({
      type: "",
      channel: "email",
      template: "",
      is_enabled: true,
      config: {},
    });
  };

  const handleCreateNotification = async () => {
    try {
      await createNotificationSetting({
        variables: {
          input: formData,
        },
      });
    } catch (error) {
      console.error("Error creating notification setting:", error);
    }
  };

  const handleEditNotification = (notification: NotificationSettingData) => {
    setSelectedSetting(notification);
    setFormData({
      type: notification.type,
      channel: notification.channel,
      template: notification.template,
      is_enabled: notification.is_enabled,
      config: notification.config,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateNotification = async () => {
    if (!selectedSetting) return;

    try {
      await updateNotificationSetting({
        variables: {
          id: selectedSetting.id,
          input: formData,
        },
      });
    } catch (error) {
      console.error("Error updating notification setting:", error);
    }
  };

  const handleToggleNotification = async (
    notification: NotificationSettingData,
  ) => {
    try {
      await updateNotificationSetting({
        variables: {
          id: notification.id,
          input: {
            ...notification,
            is_enabled: !notification.is_enabled,
          },
        },
      });
    } catch (error) {
      console.error("Error toggling notification:", error);
    }
  };

  // Utility functions
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "push":
        return <Smartphone className="h-4 w-4" />;
      case "wechat":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelName = (channel: string) => {
    const nameMap: Record<string, string> = {
      email: "邮件通知",
      sms: "短信通知",
      push: "推送通知",
      wechat: "微信通知",
    };
    return nameMap[channel] || channel;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      order: "bg-blue-100 text-blue-700",
      payment: "bg-green-100 text-green-700",
      promotion: "bg-purple-100 text-purple-700",
      system: "bg-orange-100 text-orange-700",
      security: "bg-red-100 text-red-700",
    };
    return colorMap[type] || "bg-gray-100 text-gray-700";
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

  const renderNotificationTable = (
    notifications: NotificationSettingData[],
    title: string,
  ) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getChannelIcon(notifications[0]?.channel || "")}
          {title}
        </CardTitle>
        <CardDescription>
          {notifications.length} 个通知配置
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.length === 0
          ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4" />
              <p>暂无 {title} 配置</p>
              <Button
                className="mt-4"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    channel: notifications[0]?.channel || "email",
                  }));
                  setIsCreateModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                添加配置
              </Button>
            </div>
          )
          : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>通知类型</TableHead>
                  <TableHead>模板</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.template}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={notification.is_enabled}
                          onCheckedChange={() =>
                            handleToggleNotification(notification)}
                        />
                        <span className="text-sm">
                          {notification.is_enabled ? "启用" : "禁用"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(notification.updated)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEditNotification(notification)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <TestTube className="h-4 w-4" />
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
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">通知设置</h1>
          <p className="text-muted-foreground">
            管理系统的通知渠道和模板配置
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetchNotifications()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新增通知
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总通知数</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              启用 {notifications.filter((n) => n.is_enabled).length} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">邮件通知</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {emailNotifications.length}
            </div>
            <p className="text-xs text-muted-foreground">
              启用 {emailNotifications.filter((n) => n.is_enabled).length} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">短信通知</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              启用 {smsNotifications.filter((n) => n.is_enabled).length} 个
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推送通知</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pushNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              启用 {pushNotifications.filter((n) => n.is_enabled).length} 个
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 通知渠道配置 */}
      <div className="space-y-6">
        {renderNotificationTable(emailNotifications, "邮件通知")}
        {renderNotificationTable(smsNotifications, "短信通知")}
        {renderNotificationTable(pushNotifications, "推送通知")}
      </div>

      {/* 全局通知设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            全局通知设置
          </CardTitle>
          <CardDescription>
            系统级别的通知配置参数
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.length === 0
            ? (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>暂无全局通知设置</p>
              </div>
            )
            : (
              <div className="space-y-4">
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

      {/* 创建通知设置对话框 */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>创建通知设置</DialogTitle>
            <DialogDescription>
              配置新的通知渠道和模板
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">通知类型</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  placeholder="如：order, payment, promotion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">通知渠道</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, channel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">邮件通知</SelectItem>
                    <SelectItem value="sms">短信通知</SelectItem>
                    <SelectItem value="push">推送通知</SelectItem>
                    <SelectItem value="wechat">微信通知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">模板内容</Label>
              <Textarea
                id="template"
                value={formData.template}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    template: e.target.value,
                  }))}
                placeholder="通知模板内容..."
                rows={4}
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
                placeholder='{"key": "value"}'
                className="font-mono text-sm"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_enabled: checked }))}
              />
              <Label>启用此通知</Label>
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
              onClick={handleCreateNotification}
              disabled={!formData.type || !formData.template}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑通知设置对话框 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>编辑通知设置</DialogTitle>
            <DialogDescription>
              修改通知渠道和模板配置
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">通知类型</Label>
                <Input
                  id="edit-type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  placeholder="如：order, payment, promotion"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-channel">通知渠道</Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, channel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">邮件通知</SelectItem>
                    <SelectItem value="sms">短信通知</SelectItem>
                    <SelectItem value="push">推送通知</SelectItem>
                    <SelectItem value="wechat">微信通知</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template">模板内容</Label>
              <Textarea
                id="edit-template"
                value={formData.template}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    template: e.target.value,
                  }))}
                placeholder="通知模板内容..."
                rows={4}
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
                placeholder='{"key": "value"}'
                className="font-mono text-sm"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_enabled: checked }))}
              />
              <Label>启用此通知</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleUpdateNotification}
              disabled={!formData.type || !formData.template}
            >
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
