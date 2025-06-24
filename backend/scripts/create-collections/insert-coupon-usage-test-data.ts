import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function authenticate() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功');
  } catch (error) {
    console.error('❌ 认证失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建优惠券使用记录测试数据
async function createCouponUsageTestData() {
  const usageRecords = [
    {
      coupon_id: 'coupon_001',
      user_id: 'user_001',
      order_id: 'order_001',
      discount_amount: 20.00,
      original_amount: 150.00,
      final_amount: 130.00,
      use_time: '2024-12-01T10:30:00Z',
      status: 'used',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      notes: '新用户专享优惠券使用'
    },
    {
      coupon_id: 'coupon_002',
      user_id: 'user_002',
      order_id: 'order_002',
      discount_amount: 50.00,
      original_amount: 350.00,
      final_amount: 300.00,
      use_time: '2024-12-02T14:15:00Z',
      status: 'used',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      notes: '满减优惠券使用'
    },
    {
      coupon_id: 'coupon_003',
      user_id: 'user_003',
      order_id: 'order_003',
      discount_amount: 30.00,
      original_amount: 200.00,
      final_amount: 170.00,
      use_time: '2024-12-03T09:45:00Z',
      status: 'used',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      notes: '会员专享优惠券使用'
    },
    {
      coupon_id: 'coupon_004',
      user_id: 'user_004',
      order_id: 'order_004',
      discount_amount: 15.00,
      original_amount: 120.00,
      final_amount: 105.00,
      use_time: '2024-12-04T16:20:00Z',
      status: 'refunded',
      refund_time: '2024-12-05T10:00:00Z',
      refund_reason: '订单取消，优惠券退回',
      ip_address: '192.168.1.103',
      user_agent: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/111.0 Firefox/109.0',
      notes: '优惠券使用后退款'
    },
    {
      coupon_id: 'coupon_005',
      user_id: 'user_005',
      order_id: 'order_005',
      discount_amount: 25.00,
      original_amount: 180.00,
      final_amount: 155.00,
      use_time: '2024-12-05T11:30:00Z',
      status: 'used',
      ip_address: '192.168.1.104',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
      notes: '限时优惠券使用'
    },
    {
      coupon_id: 'coupon_006',
      user_id: 'user_001',
      order_id: 'order_006',
      discount_amount: 10.00,
      original_amount: 80.00,
      final_amount: 70.00,
      use_time: '2024-12-06T13:45:00Z',
      status: 'used',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      notes: '二次购买优惠券使用'
    },
    {
      coupon_id: 'coupon_007',
      user_id: 'user_006',
      order_id: null,
      discount_amount: 0,
      original_amount: 0,
      final_amount: 0,
      use_time: '2024-12-07T18:00:00Z',
      status: 'expired',
      ip_address: '192.168.1.105',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
      notes: '优惠券过期未使用'
    },
    {
      coupon_id: 'coupon_008',
      user_id: 'user_007',
      order_id: 'order_007',
      discount_amount: 40.00,
      original_amount: 280.00,
      final_amount: 240.00,
      use_time: '2024-12-08T20:15:00Z',
      status: 'cancelled',
      refund_time: '2024-12-08T20:30:00Z',
      refund_reason: '用户主动取消订单',
      ip_address: '192.168.1.106',
      user_agent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
      notes: '订单取消，优惠券作废'
    }
  ];

  for (const usage of usageRecords) {
    try {
      await pb.collection('coupon_usage').create(usage);
      console.log(`✅ 创建优惠券使用记录: 用户${usage.user_id} - ${usage.status}`);
    } catch (error) {
      console.log(`⚠️ 优惠券使用记录创建失败:`, getErrorMessage(error));
    }
  }
}

async function main() {
  try {
    console.log('🚀 开始插入优惠券使用记录测试数据...\n');
    
    await authenticate();
    
    console.log('\n🎫 创建优惠券使用记录测试数据...');
    await createCouponUsageTestData();
    
    console.log('\n✅ 优惠券使用记录测试数据插入完成！');
    console.log('\n📊 已创建的测试数据:');
    console.log('   ✓ 8条优惠券使用记录');
    console.log('   ✓ 包含已使用、已退款、已过期、已取消等各种状态');
    console.log('   ✓ 包含不同用户的使用记录');
    console.log('   ✓ 包含完整的使用详情和设备信息');
    
  } catch (error) {
    console.error('❌ 插入测试数据失败:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  main();
} 