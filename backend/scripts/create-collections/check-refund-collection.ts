// 专门检查refund_requests集合的脚本

class RefundCollectionChecker {
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

  async checkRefundCollection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/refund_requests`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const collection = await response.json();
        console.log('📋 refund_requests 集合完整结构:');
        console.log(JSON.stringify(collection, null, 2));
        console.log('');
        
        console.log('📊 字段分析:');
        console.log('  总字段数:', collection.fields?.length || 0);
        
        if (collection.fields) {
          collection.fields.forEach((field: any, index: number) => {
            console.log(`  ${index + 1}. ${field.name} (${field.type}) - ID: ${field.id}`);
            if (field.type === 'relation') {
              console.log(`     关联集合ID: ${field.collectionId}`);
            }
          });
        }
      } else {
        console.error('❌ 获取refund_requests集合失败');
      }
    } catch (error) {
      console.error('❌ 检查refund_requests集合时发生错误:', error);
    }
  }

  async checkRecords(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/refund_requests/records`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 记录检查:');
        console.log('  总记录数:', data.totalItems);
        console.log('  当前页记录数:', data.items.length);
        
        if (data.items.length > 0) {
          console.log('📝 第一条记录示例:');
          console.log(JSON.stringify(data.items[0], null, 2));
        }
      } else {
        console.error('❌ 获取记录失败');
      }
    } catch (error) {
      console.error('❌ 检查记录时发生错误:', error);
    }
  }

  async testCreateRecord(): Promise<void> {
    // 获取测试数据
    const [ordersResponse, usersResponse] = await Promise.all([
      fetch(`${this.baseUrl}/api/collections/orders/records?perPage=1`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` },
      }),
      fetch(`${this.baseUrl}/api/collections/users/records?perPage=1`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` },
      }),
    ]);

    if (!ordersResponse.ok || !usersResponse.ok) {
      console.error('❌ 获取订单或用户失败');
      return;
    }

    const [ordersData, usersData] = await Promise.all([
      ordersResponse.json(),
      usersResponse.json(),
    ]);

    if (ordersData.items.length === 0 || usersData.items.length === 0) {
      console.error('❌ 没有找到订单或用户');
      return;
    }

    const testData = {
      service_number: `TEST${Date.now()}`,
      order_id: ordersData.items[0].id,
      user_id: usersData.items[0].id,
      refund_type: '测试退款',
      refund_amount: 100,
      reason: '测试原因',
      status: '测试状态',
    };

    console.log('🧪 测试创建记录...');
    console.log('测试数据:', testData);

    try {
      const response = await fetch(`${this.baseUrl}/api/collections/refund_requests/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(testData),
      });

      console.log('📡 创建响应状态:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 测试记录创建成功');
        console.log('📋 返回数据:');
        console.log(JSON.stringify(result, null, 2));
      } else {
        const errorData = await response.json();
        console.error('❌ 测试记录创建失败:');
        console.error(JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error('❌ 创建测试记录时发生错误:', error);
    }
  }
}

async function main() {
  console.log('🔍 详细检查refund_requests集合...');
  console.log('');

  const checker = new RefundCollectionChecker();

  // 登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await checker.adminLogin('ahukpyu@outlook.com', 'kpyu1512..@');
  if (!loginSuccess) {
    console.log('❌ 登录失败');
    return;
  }
  console.log('✅ 登录成功');
  console.log('');

  // 检查集合结构
  console.log('🔍 检查集合结构...');
  await checker.checkRefundCollection();
  console.log('');

  // 检查现有记录
  console.log('📊 检查现有记录...');
  await checker.checkRecords();
  console.log('');

  // 测试创建记录
  console.log('🧪 测试创建记录...');
  await checker.testCreateRecord();
}

if (import.meta.main) {
  await main();
} 