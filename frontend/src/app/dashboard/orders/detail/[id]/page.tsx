'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Truck, 
  MessageCircle,
  Edit,
  X,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { orderHelpers, type Order } from '@/lib/pocketbase';

// 本地类型定义
interface LocalShippingAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  zipCode: string;
}

// 状态映射
const statusMap = {
  pending_payment: { label: '待付款', color: 'bg-orange-100 text-orange-800' },
  paid: { label: '已付款', color: 'bg-blue-100 text-blue-800' },
  processing: { label: '处理中', color: 'bg-purple-100 text-purple-800' },
  shipped: { label: '已发货', color: 'bg-indigo-100 text-indigo-800' },
  delivered: { label: '已送达', color: 'bg-green-100 text-green-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
  refunding: { label: '退款中', color: 'bg-yellow-100 text-yellow-800' },
  refunded: { label: '已退款', color: 'bg-gray-100 text-gray-800' },
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState(false);
  const [notes, setNotes] = useState('');
  const [addressForm, setAddressForm] = useState<LocalShippingAddress>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    zipCode: ''
  });

  // 加载订单详情
  const loadOrderDetail = async () => {
    setLoading(true);
    try {
      const result = await orderHelpers.getOrder(orderId);
      
      if (result.success && result.data) {
        setOrder(result.data);
        setAddressForm({
          name: result.data.shipping_address.name,
          phone: result.data.shipping_address.phone,
          province: result.data.shipping_address.province,
          city: result.data.shipping_address.city,
          district: result.data.shipping_address.district,
          address: result.data.shipping_address.address,
          zipCode: result.data.shipping_address.postal_code || ''
        });
        setNotes(result.data.notes || '');
      } else {
        console.error('Failed to load order:', result.error);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (order) {
      try {
        const result = await orderHelpers.updateOrderStatus(order.id, newStatus);
        if (result.success && result.data) {
          setOrder(result.data);
          console.log(`订单状态更新为: ${newStatus}`);
        } else {
          console.error('Failed to update order status:', result.error);
        }
      } catch (error) {
        console.error('Error updating order status:', error);
      }
    }
  };

  const handleAddressUpdate = () => {
    if (order) {
      const updatedOrder = {
        ...order,
        shipping_address: {
          ...order.shipping_address,
          name: addressForm.name,
          phone: addressForm.phone,
          province: addressForm.province,
          city: addressForm.city,
          district: addressForm.district,
          address: addressForm.address,
          postal_code: addressForm.zipCode
        }
      };
      setOrder(updatedOrder);
      setEditingAddress(false);
      console.log('收货地址已更新');
    }
  };

  const handleNotesUpdate = () => {
    if (order) {
      setOrder({ ...order, notes });
      console.log('订单备注已更新');
    }
  };

  // 获取用户显示信息
  const getUserDisplay = (order: Order) => {
    if (order.expand?.user_id) {
      return order.expand.user_id.email || order.expand.user_id.name || order.user_id;
    }
    return order.user_id;
  };

  // 支付方式映射
  const paymentMethodMap = {
    alipay: '支付宝',
    wechat: '微信支付',
    credit_card: '信用卡',
    bank_transfer: '银行转账',
    cash_on_delivery: '货到付款'
  };

  // 订单来源映射
  const orderSourceMap = {
    web: '网站',
    mobile_app: '手机应用',
    wechat_mini_program: '微信小程序',
    h5: 'H5页面',
    api: 'API接口'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <X className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">订单不存在</p>
          <p className="text-slate-600 dark:text-slate-400 mt-2">请检查订单ID是否正确</p>
          <Link href="/dashboard/orders/list">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回订单列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/orders/list">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              订单详情
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              订单ID: {order.id}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={statusMap[order.status as keyof typeof statusMap]?.color}>
            {statusMap[order.status as keyof typeof statusMap]?.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                订单信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    订单编号
                  </Label>
                  <p className="font-mono text-sm mt-1">{order.order_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    下单时间
                  </Label>
                  <p className="text-sm mt-1">
                    订单ID: {order.id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    用户账号
                  </Label>
                  <p className="text-sm mt-1">{getUserDisplay(order)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    订单金额
                  </Label>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    ¥{order.total_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    支付方式
                  </Label>
                  <p className="text-sm mt-1">
                    {paymentMethodMap[order.payment_method as keyof typeof paymentMethodMap]}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    订单来源
                  </Label>
                  <p className="text-sm mt-1">
                    {orderSourceMap[order.order_source as keyof typeof orderSourceMap]}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 商品信息 */}
          <Card>
            <CardHeader>
              <CardTitle>商品清单</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_name}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        单价: ¥{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">¥{item.total.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 物流信息 */}
          {order.logistics_info && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2" />
                  物流信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      物流公司
                    </Label>
                    <p className="text-sm mt-1">{order.logistics_info.company}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      运单号
                    </Label>
                    <p className="font-mono text-sm mt-1">{order.logistics_info.tracking_number}</p>
                  </div>
                </div>
                
                {order.logistics_info.updates && order.logistics_info.updates.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 block">
                      物流跟踪
                    </Label>
                    <div className="space-y-3">
                      {order.logistics_info.updates.map((update, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm">{update.description}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {update.time} {update.location && `• ${update.location}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧操作面板 */}
        <div className="space-y-6">
          {/* 状态操作 */}
          <Card>
            <CardHeader>
              <CardTitle>订单操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.status === 'paid' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('shipped')}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  标记为已发货
                </Button>
              )}
              {order.status === 'shipped' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('delivered')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  标记为已送达
                </Button>
              )}
              {order.status === 'delivered' && (
                <Button 
                  className="w-full" 
                  onClick={() => handleStatusUpdate('completed')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  完成订单
                </Button>
              )}
              {(order.status === 'pending_payment' || order.status === 'paid') && (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleStatusUpdate('cancelled')}
                >
                  <X className="h-4 w-4 mr-2" />
                  取消订单
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 收货地址 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  收货地址
                </CardTitle>
                <Dialog open={editingAddress} onOpenChange={setEditingAddress}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>编辑收货地址</DialogTitle>
                      <DialogDescription>
                        修改订单的收货地址信息
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">收货人</Label>
                          <Input
                            id="name"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({...addressForm, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">联系电话</Label>
                          <Input
                            id="phone"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="province">省份</Label>
                          <Input
                            id="province"
                            value={addressForm.province}
                            onChange={(e) => setAddressForm({...addressForm, province: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="city">城市</Label>
                          <Input
                            id="city"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="district">区县</Label>
                          <Input
                            id="district"
                            value={addressForm.district}
                            onChange={(e) => setAddressForm({...addressForm, district: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">详细地址</Label>
                        <Input
                          id="address"
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">邮政编码</Label>
                        <Input
                          id="zipCode"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({...addressForm, zipCode: e.target.value})}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingAddress(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddressUpdate}>
                        保存
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>{order.shipping_address.name}</strong></p>
                <p>{order.shipping_address.phone}</p>
                <p>
                  {order.shipping_address.province} {order.shipping_address.city} {order.shipping_address.district}
                </p>
                <p>{order.shipping_address.address}</p>
                {order.shipping_address.postal_code && (
                  <p>邮编: {order.shipping_address.postal_code}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 订单备注 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2" />
                订单备注
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="添加订单备注..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
              <Button onClick={handleNotesUpdate} size="sm" className="w-full">
                保存备注
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 