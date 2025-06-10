'use client';

import { useI18n } from '@/hooks/use-i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Users, 
  Package, 
  Settings, 
  Zap,
  LayoutDashboard,
  Languages
} from 'lucide-react';

export default function I18nDemoPage() {
  const { t, locale, setLocale } = useI18n();

  const demoData = {
    stats: [
      { key: 'totalUsers', value: 1234, icon: Users },
      { key: 'totalProducts', value: 567, icon: Package },
      { key: 'totalOrders', value: 890, icon: LayoutDashboard },
    ],
    products: [
      { name: 'Product A', status: 'active', price: 99.99 },
      { name: 'Product B', status: 'inactive', price: 149.99 },
      { name: 'Product C', status: 'draft', price: 79.99 },
    ],
    users: [
      { name: 'John Doe', role: 'admin', status: 'active' },
      { name: 'Jane Smith', role: 'user', status: 'inactive' },
      { name: 'Bob Johnson', role: 'user', status: 'banned' },
    ]
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <Languages className="mr-3 h-8 w-8" />
            国际化演示 / I18n Demo
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            展示多语言支持功能 / Demonstrate multilingual support
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={locale === 'zh-CN' ? 'default' : 'outline'}
            onClick={() => setLocale('zh-CN')}
          >
            {t('settings.chinese')}
          </Button>
          <Button
            variant={locale === 'en-US' ? 'default' : 'outline'}
            onClick={() => setLocale('en-US')}
          >
            {t('settings.english')}
          </Button>
        </div>
      </div>

      {/* 当前语言信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>
            Current Language: <Badge variant="outline">{locale}</Badge>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 导航菜单翻译演示 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('nav.dashboard')} - Navigation Demo</CardTitle>
          <CardDescription>展示导航菜单的翻译效果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <LayoutDashboard className="h-8 w-8 mb-2 text-blue-600" />
              <span className="text-sm font-medium">{t('nav.dashboard')}</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Package className="h-8 w-8 mb-2 text-green-600" />
              <span className="text-sm font-medium">{t('nav.products')}</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mb-2 text-purple-600" />
              <span className="text-sm font-medium">{t('nav.users')}</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mb-2 text-yellow-600" />
              <span className="text-sm font-medium">{t('nav.functions')}</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Settings className="h-8 w-8 mb-2 text-gray-600" />
              <span className="text-sm font-medium">{t('nav.settings')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 仪表板统计演示 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.overview')}</CardTitle>
          <CardDescription>仪表板统计数据翻译演示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoData.stats.map((stat, index) => (
              <div key={index} className="flex items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <stat.icon className="h-8 w-8 mr-3 text-blue-600" />
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t(`dashboard.${stat.key}`)}
                  </p>
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 产品管理演示 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('products.title')}</CardTitle>
          <CardDescription>{t('products.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t('products.title')}</h3>
              <Button size="sm">
                {t('products.addProduct')}
              </Button>
            </div>
            <div className="space-y-2">
              {demoData.products.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    <span className="ml-2 text-slate-600">${product.price}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                      {t(`products.${product.status}`)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {t('common.edit')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用户管理演示 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('users.title')}</CardTitle>
          <CardDescription>{t('users.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">{t('users.title')}</h3>
              <Button size="sm">
                {t('users.addUser')}
              </Button>
            </div>
            <div className="space-y-2">
              {demoData.users.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{user.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {t(`users.${user.role}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        user.status === 'active' ? 'default' : 
                        user.status === 'banned' ? 'destructive' : 'secondary'
                      }
                    >
                      {t(`users.${user.status}`)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      {t('common.edit')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 通用操作演示 */}
      <Card>
        <CardHeader>
          <CardTitle>{t('common.save')} - Common Actions</CardTitle>
          <CardDescription>通用操作按钮翻译演示</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="default">{t('common.save')}</Button>
            <Button variant="outline">{t('common.cancel')}</Button>
            <Button variant="secondary">{t('common.edit')}</Button>
            <Button variant="destructive">{t('common.delete')}</Button>
            <Button variant="ghost">{t('common.reset')}</Button>
            <Button variant="outline">{t('common.add')}</Button>
            <Button variant="outline">{t('common.search')}</Button>
            <Button variant="outline">{t('common.confirm')}</Button>
          </div>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('common.loading')}
            </p>
            <p className="text-sm text-green-600">
              {t('messages.saveSuccess')}
            </p>
            <p className="text-sm text-red-600">
              {t('messages.saveFailed')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 