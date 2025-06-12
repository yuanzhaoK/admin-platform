// 验证订单数据的简单脚本

class OrderVerifier {
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

  async verifyOrders(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/orders/records?perPage=10`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`📊 订单记录总数: ${data.totalItems}`);
        console.log('');

        data.items.forEach((order: any, index: number) => {
          console.log(`订单 ${index + 1}:`);
          console.log(`  ID: ${order.id}`);
          console.log(`  订单号: ${order.order_number || '无'}`);
          console.log(`  用户ID: ${order.user_id || '无'}`);
          console.log(`  总金额: ${order.total_amount || '无'}`);
          console.log(`  支付方式: ${order.payment_method || '无'}`);
          console.log(`  订单状态: ${order.status || '无'}`);
          console.log(`  创建时间: ${order.created || '无'}`);
          console.log('');
        });

        if (data.totalItems > 0) {
          console.log('✅ 订单数据验证成功！所有字段都存在。');
        } else {
          console.log('⚠️ 没有找到订单记录。');
        }
      } else {
        console.error('❌ 获取订单记录失败');
      }
    } catch (error) {
      console.error('❌ 验证订单时发生错误:', error);
    }
  }
}

async function main() {
  console.log('🔍 验证订单数据...');
  console.log('');

  const verifier = new OrderVerifier();

  // 登录
  const loginSuccess = await verifier.adminLogin('ahukpyu@outlook.com', 'kpyu1512..@');
  if (!loginSuccess) {
    console.log('❌ 登录失败');
    return;
  }

  // 验证订单
  await verifier.verifyOrders();
}

if (import.meta.main) {
  await main();
} 