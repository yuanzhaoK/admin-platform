'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/hooks/use-i18n';
import {
  Settings,
  Server,
  Database,
  Shield,
  Palette,
  Key,
  Globe,
  Save,
  RefreshCw,
} from 'lucide-react';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Admin Platform',
    siteUrl: 'http://localhost:3000',
    adminEmail: 'admin@example.com',
    maxUsers: 1000,
    enableRegistration: true,
    enableNotifications: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // 模拟保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('保存设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      siteName: 'Admin Platform',
      siteUrl: 'http://localhost:3000',
      adminEmail: 'admin@example.com',
      maxUsers: 1000,
      enableRegistration: true,
      enableNotifications: true,
    });
    setTheme('system');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t('settings.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {t('settings.description')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.reset')}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? t('settings.saving') : t('settings.saveSettings')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基本设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              基本设置
            </CardTitle>
            <CardDescription>
              配置系统的基本信息和参数
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">站点名称</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">站点URL</Label>
              <Input
                id="siteUrl"
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">管理员邮箱</Label>
              <Input
                id="adminEmail"
                type="email"
                value={settings.adminEmail}
                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">最大用户数</Label>
              <Input
                id="maxUsers"
                type="number"
                value={settings.maxUsers}
                onChange={(e) => setSettings({ ...settings, maxUsers: parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 功能设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              功能设置
            </CardTitle>
            <CardDescription>
              控制系统功能的启用和禁用
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>用户注册</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  允许新用户自主注册
                </p>
              </div>
              <Badge variant={settings.enableRegistration ? 'default' : 'secondary'}>
                {settings.enableRegistration ? '启用' : '禁用'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>消息通知</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  系统消息和通知推送
                </p>
              </div>
              <Badge variant={settings.enableNotifications ? 'default' : 'secondary'}>
                {settings.enableNotifications ? '启用' : '禁用'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 服务器信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              服务器信息
            </CardTitle>
            <CardDescription>
              查看系统运行状态和服务器信息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="mr-2 h-4 w-4 text-slate-500" />
                <span className="text-sm">运行环境</span>
              </div>
              <Badge variant="outline">开发环境</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Database className="mr-2 h-4 w-4 text-slate-500" />
                <span className="text-sm">数据库状态</span>
              </div>
              <Badge variant="default">正常</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Key className="mr-2 h-4 w-4 text-slate-500" />
                <span className="text-sm">API状态</span>
              </div>
              <Badge variant="default">正常</Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">CPU使用率</span>
                <span>12%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">内存使用率</span>
                <span>34%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '34%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 外观设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="mr-2 h-5 w-5" />
              外观设置
            </CardTitle>
            <CardDescription>
              自定义系统的外观和显示选项
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>主题模式</Label>
              <div className="flex space-x-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  浅色
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  深色
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                >
                  跟随系统
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('settings.language')}</Label>
              <div className="flex space-x-2">
                <Button
                  variant={locale === 'zh-CN' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocale('zh-CN')}
                >
                  {t('settings.chinese')}
                </Button>
                <Button
                  variant={locale === 'en-US' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLocale('en-US')}
                >
                  {t('settings.english')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 危险操作区域 */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">危险操作</CardTitle>
          <CardDescription>
            以下操作可能会影响系统稳定性，请谨慎执行
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">清空系统日志</h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                删除所有系统日志记录，此操作不可恢复
              </p>
            </div>
            <Button variant="destructive" size="sm">
              清空日志
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">重置系统设置</h4>
              <p className="text-sm text-red-600 dark:text-red-400">
                将所有设置恢复为默认值，此操作不可恢复
              </p>
            </div>
            <Button variant="destructive" size="sm">
              重置设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 