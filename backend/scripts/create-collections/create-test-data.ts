// 创建测试数据的Deno脚本

interface TestUser {
  id: string;
  email: string;
  name: string;
}

interface TestOrder {
  order_number: string;
  user_id: string;
  total_amount: number;
  payment_method: string;
  order_source: string;
  order_type: string;
  status: string;
  items: any[];
  shipping_address: any;
  logistics_info: any;
  notes: string;
}

interface TestRefundRequest {
  service_number: string;
  order_id: string;
  user_id: string;
  refund_type: string;
  refund_amount: number;
  reason: string;
  description: string;
  status: string;
  admin_notes: string;
}

class PocketBaseTestDataManager {
  private baseUrl: string;
  private authToken: string = '';

  constructor(baseUrl: string = 'http://localhost:8091') {
    this.baseUrl = baseUrl;
  }

  // 管理员登录
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

  // 创建测试用户
  async createTestUsers(): Promise<TestUser[]> {
    const users: TestUser[] = [];
    const testUsers = [
      { email: 'user1@test.com', password: 'test123456', name: '张三' },
      { email: 'user2@test.com', password: 'test123456', name: '李四' },
      { email: 'user3@test.com', password: 'test123456', name: '王五' },
    ];

    for (const userData of testUsers) {
      try {
        const response = await fetch(`${this.baseUrl}/api/collections/users/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            passwordConfirm: userData.password,
            name: userData.name,
            role: 'user',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          users.push({
            id: data.id,
            email: data.email,
            name: data.name,
          });
          console.log(`✅ 创建用户: ${userData.name} (${userData.email})`);
        } else {
          const errorData = await response.json();
          if (errorData.message.includes('already exists')) {
            // 用户已存在，获取用户信息
            const existingUser = await this.getUserByEmail(userData.email);
            if (existingUser) {
              users.push(existingUser);
              console.log(`⚠️ 用户已存在: ${userData.name} (${userData.email})`);
            }
          } else {
            console.error(`❌ 创建用户失败: ${userData.name}`, errorData.message);
          }
        }
      } catch (error) {
        console.error(`❌ 创建用户时发生错误: ${userData.name}`, error);
      }
    }

    return users;
  }

  // 根据邮箱获取用户
  async getUserByEmail(email: string): Promise<TestUser | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/users/records?filter=(email='${email}')`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.items.length > 0) {
          const user = data.items[0];
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      }
    } catch (error) {
      console.error('获取用户失败:', error);
    }
    return null;
  }

  // 创建测试订单
  async createTestOrders(users: TestUser[]): Promise<string[]> {
    const orderIds: string[] = [];
    const paymentMethods = ['支付宝', '微信支付', '银行卡', '余额支付'];
    const orderSources = ['官网', '微信小程序', 'APP', '第三方平台'];
    const orderTypes = ['普通订单', '预售订单', '团购订单', '秒杀订单'];
    const statuses = ['待付款', '待发货', '已发货', '已完成', '已取消'];

    for (let i = 0; i < 15; i++) {
      const user = users[i % users.length];
      const orderNumber = `ORD${Date.now()}${String(i).padStart(3, '0')}`;
      
      const orderData: TestOrder = {
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
            product_name: `商品${i + 1}`,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: Math.floor(Math.random() * 1000) + 50,
          }
        ],
        shipping_address: {
          name: user.name,
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
          const data = await response.json();
          orderIds.push(data.id);
          console.log(`✅ 创建订单: ${orderNumber} - ${user.name}`);
        } else {
          const errorData = await response.json();
          console.error(`❌ 创建订单失败: ${orderNumber}`, errorData.message);
        }
      } catch (error) {
        console.error(`❌ 创建订单时发生错误: ${orderNumber}`, error);
      }
    }

    return orderIds;
  }

  // 创建测试退货申请
  async createTestRefundRequests(users: TestUser[], orderIds: string[]): Promise<void> {
    const refundTypes = ['仅退款', '退货退款'];
    const reasons = ['商品质量问题', '不喜欢', '尺寸不合适', '发错货', '商品损坏'];
    const statuses = ['待处理', '处理中', '已同意', '已拒绝', '已完成'];

    for (let i = 0; i < Math.min(8, orderIds.length); i++) {
      const user = users[i % users.length];
      const orderId = orderIds[i];
      const serviceNumber = `REF${Date.now()}${String(i).padStart(3, '0')}`;
      
      const refundData: TestRefundRequest = {
        service_number: serviceNumber,
        order_id: orderId,
        user_id: user.id,
        refund_type: refundTypes[Math.floor(Math.random() * refundTypes.length)],
        refund_amount: Math.floor(Math.random() * 2000) + 100,
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
          console.log(`✅ 创建退货申请: ${serviceNumber} - ${user.name}`);
        } else {
          const errorData = await response.json();
          console.error(`❌ 创建退货申请失败: ${serviceNumber}`, errorData.message);
        }
      } catch (error) {
        console.error(`❌ 创建退货申请时发生错误: ${serviceNumber}`, error);
      }
    }
  }

  // 创建订单设置
  async createOrderSettings(): Promise<void> {
    const settings = [
      {
        setting_key: 'flash_sale_enabled',
        setting_name: '启用秒杀活动',
        setting_value: 'true',
        setting_type: 'boolean',
        description: '是否启用秒杀活动功能',
        category: 'flash_sale',
      },
      {
        setting_key: 'payment_timeout',
        setting_name: '支付超时时间',
        setting_value: '30',
        setting_type: 'number',
        description: '订单支付超时时间（分钟）',
        category: 'timeout',
      },
      {
        setting_key: 'shipping_timeout',
        setting_name: '发货超时时间',
        setting_value: '72',
        setting_type: 'number',
        description: '订单发货超时时间（小时）',
        category: 'timeout',
      },
      {
        setting_key: 'auto_complete_days',
        setting_name: '自动完成天数',
        setting_value: '7',
        setting_type: 'number',
        description: '订单自动完成天数',
        category: 'timeout',
      },
      {
        setting_key: 'auto_review_enabled',
        setting_name: '启用自动好评',
        setting_value: 'false',
        setting_type: 'boolean',
        description: '是否启用自动好评功能',
        category: 'review',
      },
    ];

    for (const setting of settings) {
      try {
        const response = await fetch(`${this.baseUrl}/api/collections/order_settings/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(setting),
        });

        if (response.ok) {
          console.log(`✅ 创建设置: ${setting.setting_name}`);
        } else {
          const errorData = await response.json();
          if (errorData.message.includes('already exists')) {
            console.log(`⚠️ 设置已存在: ${setting.setting_name}`);
          } else {
            console.error(`❌ 创建设置失败: ${setting.setting_name}`, errorData.message);
          }
        }
      } catch (error) {
        console.error(`❌ 创建设置时发生错误: ${setting.setting_name}`, error);
      }
    }
  }
}

async function createTestData() {
  console.log('🧪 开始创建测试数据...');
  console.log('');

  const manager = new PocketBaseTestDataManager();

  // 1. 管理员登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await manager.adminLogin('ahukpyu@outlook.com', 'kpyu1512..@');
  
  if (!loginSuccess) {
    console.log('❌ 管理员登录失败，请检查账号密码');
    return;
  }
  console.log('✅ 管理员登录成功');
  console.log('');

  // 2. 创建测试用户
  console.log('👤 创建测试用户...');
  const users = await manager.createTestUsers();
  console.log(`✅ 创建了 ${users.length} 个测试用户`);
  console.log('');

  // 3. 创建测试订单
  console.log('🛒 创建测试订单...');
  const orderIds = await manager.createTestOrders(users);
  console.log(`✅ 创建了 ${orderIds.length} 个测试订单`);
  console.log('');

  // 4. 创建测试退货申请
  console.log('💰 创建测试退货申请...');
  await manager.createTestRefundRequests(users, orderIds);
  console.log('✅ 创建测试退货申请完成');
  console.log('');

  // 5. 创建订单设置
  console.log('⚙️ 创建订单设置...');
  await manager.createOrderSettings();
  console.log('✅ 创建订单设置完成');
  console.log('');

  console.log('🎉 测试数据创建完成！');
  console.log('');
  console.log('📊 数据统计:');
  console.log(`👤 用户: ${users.length} 个`);
  console.log(`🛒 订单: ${orderIds.length} 个`);
  console.log('💰 退货申请: 8 个');
  console.log('⚙️ 订单设置: 5 个');
  console.log('');
  console.log('🌐 前端访问: http://localhost:3000/dashboard/orders');
  console.log('🌐 管理界面: http://localhost:8091/_/');
}

// 主函数
if (import.meta.main) {
  try {
    await createTestData();
    console.log('✅ 脚本执行完成');
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    Deno.exit(1);
  }
} 