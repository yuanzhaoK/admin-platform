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
  Check, 
  X, 
  RefreshCw,
  FileText
} from 'lucide-react';
import { refundHelpers, type RefundRequest, type RefundQuery } from '@/lib/pocketbase';

// 状态映射
const statusMap = {
  pending: { label: '待处理', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' },
  approved: { label: '已批准', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  rejected: { label: '已拒绝', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' },
  processing: { label: '处理中', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  cancelled: { label: '已取消', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400' }
};

// 退货类型映射
const refundTypeMap = {
  refund_only: '仅退款',
  return_and_refund: '退货退款',
  exchange: '换货'
};



export default function RefundsPage() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 加载退款申请数据
  const loadRefunds = async () => {
    setLoading(true);
    try {
      const query: RefundQuery = {
        page: currentPage,
        perPage: 20,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter as RefundRequest['status'] : undefined,
        refund_type: typeFilter !== 'all' ? typeFilter as RefundRequest['refund_type'] : undefined,
        sortBy: 'created',
        sortOrder: 'desc'
      };

      const result = await refundHelpers.getRefunds(query);
      
      if (result.success && result.data) {
        setRefunds(result.data);
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        console.error('Failed to load refunds:', result.error);
        setRefunds([]);
      }
    } catch (error) {
      console.error('Error loading refunds:', error);
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, [currentPage, statusFilter, typeFilter]);

  // 搜索处理（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadRefunds();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusAction = async (refundId: string, action: RefundRequest['status']) => {
    try {
      const result = await refundHelpers.processRefund(refundId, action, `管理员操作: ${action}`);
      
      if (result.success) {
        // 重新加载退款列表
        loadRefunds();
        console.log(`执行操作 ${action} 对退货申请 ${refundId}`);
      } else {
        console.error('Failed to process refund:', result.error);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  // 获取用户显示信息
  const getUserDisplay = (refund: RefundRequest) => {
    if (refund.expand?.user_id) {
      return refund.expand.user_id.email || refund.expand.user_id.name || refund.user_id;
    }
    return refund.user_id;
  };

  // 获取订单号显示信息
  const getOrderNumber = (refund: RefundRequest) => {
    if (refund.expand?.order_id) {
      return refund.expand.order_id.order_number;
    }
    return refund.order_id;
  };

  const filteredRefunds = refunds.filter((refund) => {
    const matchesSearch = refund.service_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getOrderNumber(refund).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getUserDisplay(refund).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    const matchesType = typeFilter === 'all' || refund.refund_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">退货申请处理</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            查看和处理客户的退货退款申请
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
                  placeholder="搜索服务单号、订单号或用户账号..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="申请状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(statusMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="退货类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {Object.entries(refundTypeMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>{value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 退货申请列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>退货申请列表 ({filteredRefunds.length})</CardTitle>
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
                  <TableHead>服务单号</TableHead>
                  <TableHead>关联订单</TableHead>
                  <TableHead>申请时间</TableHead>
                  <TableHead>用户账号</TableHead>
                  <TableHead>退款金额</TableHead>
                  <TableHead>退货类型</TableHead>
                  <TableHead>申请状态</TableHead>
                  <TableHead>处理时间</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund, index) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {refund.service_number}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {getOrderNumber(refund)}
                    </TableCell>
                    <TableCell>
                      {new Date(refund.created).toLocaleString('zh-CN')}
                    </TableCell>
                    <TableCell>{getUserDisplay(refund)}</TableCell>
                    <TableCell className="font-medium">
                      ¥{(refund.refund_amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {refundTypeMap[refund.refund_type as keyof typeof refundTypeMap]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusMap[refund.status as keyof typeof statusMap]?.color}>
                        {statusMap[refund.status as keyof typeof statusMap]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {refund.processed_at ? 
                        new Date(refund.processed_at).toLocaleString('zh-CN') : 
                        '-'
                      }
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
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            查看详情
                          </DropdownMenuItem>
                          {refund.status === 'pending' && (
                            <>
                              <DropdownMenuItem 
                                onClick={() => handleStatusAction(refund.id, 'approved')}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                批准申请
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusAction(refund.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-2" />
                                拒绝申请
                              </DropdownMenuItem>
                            </>
                          )}
                          {refund.status === 'approved' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusAction(refund.id, 'processing')}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              开始处理
                            </DropdownMenuItem>
                          )}
                          {refund.status === 'processing' && (
                            <DropdownMenuItem 
                              onClick={() => handleStatusAction(refund.id, 'completed')}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              完成处理
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRefunds.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>未找到匹配的退货申请</p>
              <p className="text-sm mt-1">请尝试调整搜索条件</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 