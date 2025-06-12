'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  Settings,
  RefreshCw
} from 'lucide-react';
import { orderSettingsHelpers, type OrderSetting } from '@/lib/pocketbase';

export default function OrderSettingsPage() {
  const [settings, setSettings] = useState<OrderSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 加载订单设置
  const loadSettings = async () => {
    setLoading(true);
    try {
      const result = await orderSettingsHelpers.getSettings();
      
      if (result.success && result.data) {
        setSettings(result.data);
      } else {
        console.error('Failed to load settings:', result.error);
        setSettings([]);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 这里可以批量保存设置
      console.log('保存设置:', settings);
      // 实际实现中，你可能需要遍历settings并调用updateSetting
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (settingKey: string, newValue: string) => {
    setSettings(prev => prev.map(setting => 
      setting.setting_key === settingKey 
        ? { ...setting, setting_value: newValue }
        : setting
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">订单设置</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            配置订单处理的相关参数和规则
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saving ? '保存中...' : '保存设置'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            基础设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.map((setting, index) => (
            <div key={setting.setting_key}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium">
                    {setting.setting_name}
                  </Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {setting.description}
                  </p>
                </div>
                <div className="w-32">
                  {setting.setting_type === 'boolean' ? (
                    <Switch 
                      checked={setting.setting_value === 'true'} 
                      onCheckedChange={(checked) => 
                        handleSettingChange(setting.setting_key, checked ? 'true' : 'false')
                      }
                    />
                  ) : (
                    <Input
                      type={setting.setting_type === 'number' ? 'number' : 'text'}
                      value={setting.setting_value}
                      onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
                      className="text-right"
                    />
                  )}
                </div>
              </div>
              {index < settings.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
} 