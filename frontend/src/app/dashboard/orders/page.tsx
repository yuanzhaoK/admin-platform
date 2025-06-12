'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  ShoppingCart, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  FileText
} from 'lucide-react';
import { orderHelpers, type OrderStats, type Order } from '@/lib/pocketbase';

export default function OrdersPage() {
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载统计数据和最近订单
  const loadData = async () => {
    setLoading(true);
    try {
      // 并行加载统计数据和最近订单
      const [statsResult, ordersResult] = await Promise.all([
        orderHelpers.getOrderStats(),
        orderHelpers.getOrders({ page: 1, perPage: 5, sortBy: 'created', sortOrder: 'desc' })
      ]);

      if (statsResult.success && statsResult.data) {
        setOrderStats(statsResult.data);
      }

      if (ordersResult.success && ordersResult.data) {
        setRecentOrders(ordersResult.data);
      }
    } catch (error) {
      console.error('Error loading order data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 构建统计卡片数据
  const getStatsCards = () => {
    if (!orderStats) {
      return [
        { title: '待付款', count: 0, icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
        { title: '待发货', count: 0, icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
        { title: '已发货', count: 0, icon: RefreshCw, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
        { title: '已完成', count: 0, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
        { title: '已取消', count: 0, icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' }
      ];
    }

    return [
      {
        title: '待付款',
        count: orderStats.pending_payment,
        icon: Clock,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      },
      {
        title: '待发货',
        count: orderStats.paid,
        icon: Package,
        color: 'text-blue-600', 
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      {
        title: '已发货',
        count: orderStats.shipped,
        icon: RefreshCw,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
      },
      {
        title: '已完成',
        count: orderStats.completed,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      },
      {
        title: '已取消',
        count: orderStats.cancelled,
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      }
    ];
  };

  const statsCards = getStatsCards();

  const quickActions = [
    {
      title: '订单列表',
      description: '查看和管理所有订单',
      href: '/dashboard/orders/list',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: '订单设置',
      description: '配置订单相关参数',
      href: '/dashboard/orders/settings',
      icon: Settings,
      color: 'text-green-600'
    },
    {
      title: '退货处理',
      description: '处理退货退款申请',
      href: '/dashboard/orders/refunds',
      icon: FileText,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">订单管理</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            管理所有订单、设置和退货申请
          </p>
        </div>
      </div>

      {/* 订单统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {loading ? (
          // 加载状态
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                  <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsCards.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {stat.count}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Card key={action.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800`}>
                    <IconComponent className={`h-6 w-6 ${action.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={action.href}>
                  <Button variant="outline" className="w-full">
                    进入管理
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 最近订单 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>最近订单</CardTitle>
              <CardDescription>最近提交的订单</CardDescription>
            </div>
            <Link href="/dashboard/orders/list">
              <Button variant="outline" size="sm">
                查看全部
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              // 加载状态
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">{order.order_number}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'pending_payment' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                        order.status === 'paid' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                      }`}>
                        {order.status === 'pending_payment' ? '待付款' :
                         order.status === 'paid' ? '已付款' :
                         order.status === 'shipped' ? '已发货' :
                         order.status === 'completed' ? '已完成' : '其他'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {new Date().toLocaleString('zh-CN')} • ¥{order.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <Link href={`/dashboard/orders/detail/${order.id}`}>
                    <Button variant="ghost" size="sm">
                      查看
                    </Button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无最近订单数据</p>
                <p className="text-sm mt-1">订单数据将在这里显示</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 