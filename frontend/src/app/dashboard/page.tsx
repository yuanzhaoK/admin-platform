'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiHelpers, Product, User } from '@/lib/pocketbase';
import { Activity, Users, Package, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    loading: true
  });

  useEffect(() => {
    console.log('Dashboard page: 认证状态 =', isAuthenticated, '用户 =', user);
    
    const fetchStats = async () => {
      try {
        const [usersResult, productsResult] = await Promise.all([
          apiHelpers.getUsers(),
          apiHelpers.getProducts()
        ]);

        const users = usersResult.success ? (usersResult.data || []) : [];
        const products = productsResult.success ? (productsResult.data || []) : [];
        const activeProducts = products.filter((p: Product) => p.status === 'active');

        setStats({
          totalUsers: users.length,
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: '总用户数',
      value: stats.totalUsers,
      description: '系统注册用户总数',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: '产品总数',
      value: stats.totalProducts,
      description: '管理的产品总数',
      icon: Package,
      color: 'text-green-600'
    },
    {
      title: '活跃产品',
      value: stats.activeProducts,
      description: '当前活跃的产品数量',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: '系统状态',
      value: '正常',
      description: '系统运行状态良好',
      icon: Activity,
      color: 'text-emerald-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          仪表板
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          欢迎回到运营管理平台，{user?.name || user?.email || '用户'}
        </p>
        {/* Debug info */}
        <div className="text-xs text-slate-400 mt-1">
          认证状态: {isAuthenticated ? '已认证' : '未认证'} | 用户ID: {user?.id || '无'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats.loading ? (
                  <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-8 w-16 rounded"></div>
                ) : (
                  stat.value
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              快速操作
            </CardTitle>
            <CardDescription>
              常用的管理操作
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Package className="h-6 w-6 text-blue-600 mb-2" />
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  添加产品
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  创建新产品配置
                </div>
              </button>
              <button className="p-4 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Users className="h-6 w-6 text-green-600 mb-2" />
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  用户管理
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  管理系统用户
                </div>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              系统信息
            </CardTitle>
            <CardDescription>
              当前系统运行状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">后端状态</span>
              <span className="text-sm font-medium text-green-600">运行中</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">数据库</span>
              <span className="text-sm font-medium text-green-600">SQLite</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">版本</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">v1.0.0</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 