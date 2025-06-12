// 创建最终测试数据的脚本

class FinalTestDataCreator {
  private baseUrl: string;
  private authToken: string = '';

  constructor(baseUrl: string = 'http://localhost:8091') {
    this.baseUrl = baseUrl;
  }

  async adminLogin(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  }

  async getExistingUsers(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/users/records`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.items;
      }
      return [];
    } catch (error) {
      console.error('获取用户失败:', error);
      return [];
    }
  }

  async clearOldOrders(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/orders/records`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`🗑️ 清理 ${data.totalItems} 个旧订单记录...`);
        
        for (const order of data.items) {
          const deleteResponse = await fetch(`${this.baseUrl}/api/collections/orders/records/${order.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.authToken}`,
            },
          });

          if (deleteResponse.ok) {
            console.log(`✅ 删除订单: ${order.id}`);
          }
        }
      }
    } catch (error) {
      console.error('清理旧订单失败:', error);
    }
  }

  async createTestOrders(users: any[]): Promise<void> {
    const paymentMethods = ['支付宝', '微信支付', '银行卡', '余额支付'];
    const orderSources = ['官网', '微信小程序', 'APP', '第三方平台'];
    const orderTypes = ['普通订单', '预售订单', '团购订单', '秒杀订单'];
    const statuses = ['待付款', '待发货', '已发货', '已完成', '已取消'];

    console.log(`🛒 使用 ${users.length} 个现有用户创建测试订单...`);

    for (let i = 0; i < 10; i++) {
      const user = users[i % users.length];
      const orderNumber = `ORD${Date.now()}${String(i).padStart(3, '0')}`;
      
      const orderData = {
        order_number: orderNumber,
        user_id: user.id,
        total_amount: Math.floor(Math.random() * 5000) + 100,
        payment_method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        order_source: orderSources[Math.floor(Math.random() * orderSources.length)],
        order_type: orderTypes[Math.floor(Math.random() * orderTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        items: [
          {
            product_id: `prod_${i + 1}`,
            product_name: `测试商品${i + 1}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.floor(Math.random() * 1000) + 50,
          }
        ],
        shipping_address: {
          name: user.name || '测试用户',
          phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: `测试地址${i + 1}号`,
        },
        logistics_info: {
          company: '顺丰快递',
          tracking_number: `SF${Date.now()}${i}`,
          status: '运输中',
        },
        notes: `测试订单${i + 1}的备注信息`,
      };

      try {
        const response = await fetch(`${this.baseUrl}/api/collections/orders/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ 创建订单: ${orderNumber} - ${user.name || user.email} - ¥${orderData.total_amount}`);
        } else {
          const errorData = await response.json();
          console.error(`❌ 创建订单失败: ${orderNumber}`, errorData.message);
        }
      } catch (error) {
        console.error(`❌ 创建订单时发生错误: ${orderNumber}`, error);
      }

      // 添加延迟避免订单号重复
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async createRefundRequests(users: any[]): Promise<void> {
    // 获取一些订单
    const ordersResponse = await fetch(`${this.baseUrl}/api/collections/orders/records?perPage=5`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
      },
    });

    if (!ordersResponse.ok) {
      console.error('❌ 获取订单失败，无法创建退货申请');
      return;
    }

    const ordersData = await ordersResponse.json();
    const orders = ordersData.items;

    if (orders.length === 0) {
      console.error('❌ 没有找到订单，无法创建退货申请');
      return;
    }

    const refundTypes = ['仅退款', '退货退款'];
    const reasons = ['商品质量问题', '不喜欢', '尺寸不合适', '发错货', '商品损坏'];
    const statuses = ['待处理', '处理中', '已同意', '已拒绝', '已完成'];

    console.log(`💰 基于 ${orders.length} 个订单创建退货申请...`);

    for (let i = 0; i < Math.min(5, orders.length); i++) {
      const order = orders[i];
      const user = users.find(u => u.id === order.user_id) || users[0];
      const serviceNumber = `REF${Date.now()}${String(i).padStart(3, '0')}`;
      
      const refundData = {
        service_number: serviceNumber,
        order_id: order.id,
        user_id: user.id,
        refund_type: refundTypes[Math.floor(Math.random() * refundTypes.length)],
        refund_amount: Math.floor(order.total_amount * 0.8), // 80%退款
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        description: `退货申请${i + 1}的详细描述`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        admin_notes: `管理员备注${i + 1}`,
      };

      try {
        const response = await fetch(`${this.baseUrl}/api/collections/refund_requests/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(refundData),
        });

        if (response.ok) {
          console.log(`✅ 创建退货申请: ${serviceNumber} - ¥${refundData.refund_amount}`);
        } else {
          const errorData = await response.json();
          console.error(`❌ 创建退货申请失败: ${serviceNumber}`, errorData.message);
        }
      } catch (error) {
        console.error(`❌ 创建退货申请时发生错误: ${serviceNumber}`, error);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async verifyData(): Promise<void> {
    try {
      // 验证订单
      const ordersResponse = await fetch(`${this.baseUrl}/api/collections/orders/records?perPage=3`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        console.log(`📊 订单数据验证: ${ordersData.totalItems} 条记录`);
        
        ordersData.items.forEach((order: any, index: number) => {
          console.log(`  订单 ${index + 1}: ${order.order_number} - ${order.status} - ¥${order.total_amount}`);
        });
      }

      // 验证退货申请
      const refundsResponse = await fetch(`${this.baseUrl}/api/collections/refund_requests/records?perPage=3`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (refundsResponse.ok) {
        const refundsData = await refundsResponse.json();
        console.log(`📊 退货申请验证: ${refundsData.totalItems} 条记录`);
        
        refundsData.items.forEach((refund: any, index: number) => {
          console.log(`  退货 ${index + 1}: ${refund.service_number} - ${refund.status} - ¥${refund.refund_amount}`);
        });
      }
    } catch (error) {
      console.error('❌ 验证数据时发生错误:', error);
    }
  }
}

async function main() {
  console.log('🎯 创建最终测试数据...');
  console.log('');

  const creator = new FinalTestDataCreator();

  // 1. 登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await creator.adminLogin('ahukpyu@outlook.com', 'kpyu1512..@');
  if (!loginSuccess) {
    console.log('❌ 登录失败');
    return;
  }
  console.log('✅ 登录成功');
  console.log('');

  // 2. 获取现有用户
  console.log('👤 获取现有用户...');
  const users = await creator.getExistingUsers();
  console.log(`✅ 找到 ${users.length} 个用户`);
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name || '未命名'} (${user.email})`);
  });
  console.log('');

  if (users.length === 0) {
    console.log('❌ 没有找到用户，无法创建测试数据');
    return;
  }

  // 3. 清理旧订单
  console.log('🗑️ 清理旧订单...');
  await creator.clearOldOrders();
  console.log('');

  // 4. 创建测试订单
  console.log('🛒 创建测试订单...');
  await creator.createTestOrders(users);
  console.log('');

  // 5. 创建退货申请
  console.log('💰 创建退货申请...');
  await creator.createRefundRequests(users);
  console.log('');

  // 6. 验证数据
  console.log('🔍 验证创建的数据...');
  await creator.verifyData();
  console.log('');

  console.log('🎉 测试数据创建完成！');
  console.log('');
  console.log('🌐 访问地址:');
  console.log('  前端: http://localhost:3000/dashboard/orders');
  console.log('  管理界面: http://localhost:8091/_/');
}

if (import.meta.main) {
  await main();
} 