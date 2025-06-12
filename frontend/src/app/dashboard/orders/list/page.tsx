'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Truck, 
  MapPin,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { orderHelpers, type Order, type OrderQuery } from '@/lib/pocketbase';

// 订单状态映射
const statusMap = {
  '待付款': { label: '待付款', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
  '已付款': { label: '已付款', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  '处理中': { label: '处理中', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' },
  '已发货': { label: '已发货', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400' },
  '已送达': { label: '已送达', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  '已完成': { label: '已完成', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  '已取消': { label: '已取消', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  '退款中': { label: '退款中', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  '已退款': { label: '已退款', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
};

// 支付方式映射
const paymentMethodMap = {
  '支付宝': '支付宝',
  '微信支付': '微信支付',
  '信用卡': '信用卡',
  '银行卡': '银行卡',
  '银行转账': '银行转账',
  '货到付款': '货到付款'
};

// 订单来源映射
const orderSourceMap = {
  '网站': '网站',
  '手机应用': '手机应用',
  '微信小程序': '微信小程序',
  'H5页面': 'H5页面',
  'API接口': 'API接口'
};

export default function OrderListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 加载订单数据
  const loadOrders = async () => {
    setLoading(true);
    try {
      const query: OrderQuery = {
        page: currentPage,
        perPage: 20,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter as Order['status'] : undefined,
        order_source: sourceFilter !== 'all' ? sourceFilter as Order['order_source'] : undefined,
        sortBy: 'id',
        sortOrder: 'desc'
      };

      const result = await orderHelpers.getOrders(query);
      
      if (result.success && result.data) {
        setOrders(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        console.error('Failed to load orders:', result.error);
        // 如果API调用失败，显示空数据
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, sourceFilter]);

  // 搜索处理（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadOrders();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusAction = async (orderId: string, action: string) => {
    try {
      let newStatus: Order['status'];
      
      switch (action) {
        case 'ship':
          newStatus = '已发货';
          break;
        case 'deliver':
          newStatus = '已送达';
          break;
        case 'complete':
          newStatus = '已完成';
          break;
        case 'cancel':
          newStatus = '已取消';
          break;
        default:
          return;
      }

      const result = await orderHelpers.updateOrderStatus(orderId, newStatus);
      
      if (result.success) {
        // 重新加载订单列表
        loadOrders();
        console.log(`订单 ${orderId} 状态已更新为 ${newStatus}`);
      } else {
        console.error('Failed to update order status:', result.error);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('确定要删除这个订单吗？此操作不可撤销。')) {
      return;
    }

    try {
      const result = await orderHelpers.deleteOrder(orderId);
      
      if (result.success) {
        // 重新加载订单列表
        loadOrders();
        console.log(`订单 ${orderId} 已删除`);
      } else {
        console.error('Failed to delete order:', result.error);
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  const getUserDisplay = (order: Order) => {
    if (order.expand?.user_id) {
      return order.expand.user_id.email || order.expand.user_id.name || order.user_id;
    }
    return order.user_id;
  };

  const filteredOrders = orders;

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">订单列表</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            管理和查看所有订单信息
          </p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索与筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="搜索订单号或用户账号..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="订单状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(statusMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="订单来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部来源</SelectItem>
                {Object.entries(orderSourceMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 订单列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>订单列表 ({filteredOrders.length})</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              高级筛选
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">序号</TableHead>
                  <TableHead>订单编号</TableHead>
                  <TableHead>订单ID</TableHead>
                  <TableHead>用户账号</TableHead>
                  <TableHead>订单金额</TableHead>
                  <TableHead>支付方式</TableHead>
                  <TableHead>订单来源</TableHead>
                  <TableHead>订单类型</TableHead>
                  <TableHead>订单状态</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {order.order_number}
                    </TableCell>
                    <TableCell>
                      {order.id}
                    </TableCell>
                    <TableCell>{getUserDisplay(order)}</TableCell>
                    <TableCell className="font-medium">
                      ¥{(order.total_amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {paymentMethodMap[order.payment_method as keyof typeof paymentMethodMap]}
                    </TableCell>
                    <TableCell>
                      {orderSourceMap[order.order_source as keyof typeof orderSourceMap]}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.order_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusMap[order.status as keyof typeof statusMap]?.color}>
                        {statusMap[order.status as keyof typeof statusMap]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>操作</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orders/detail/${order.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </Link>
                          </DropdownMenuItem>
                          {order.status === '已付款' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusAction(order.id, 'ship')}
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              订单发货
                            </DropdownMenuItem>
                          )}
                          {order.status === '已发货' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusAction(order.id, 'track')}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              订单跟踪
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteOrder(order.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            删除订单
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>未找到匹配的订单</p>
              <p className="text-sm mt-1">请尝试调整搜索条件</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 