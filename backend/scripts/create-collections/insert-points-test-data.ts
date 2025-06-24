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

// 创建积分规则测试数据
async function createPointsRulesTestData() {
  const rules = [
    {
      name: '注册奖励',
      type: 'register',
      points: 100,
      conditions: {},
      daily_limit: null,
      total_limit: 1,
      is_active: true,
      description: '新用户注册即送100积分'
    },
    {
      name: '每日签到',
      type: 'login',
      points: 10,
      conditions: { consecutive_days: 7, bonus: 50 },
      daily_limit: 1,
      total_limit: null,
      is_active: true,
      description: '每日签到获得10积分，连续7天额外奖励50积分'
    },
    {
      name: '购物返积分',
      type: 'purchase',
      points: 1,
      conditions: { per_yuan: 1 },
      daily_limit: null,
      total_limit: null,
      is_active: true,
      description: '每消费1元获得1积分'
    },
    {
      name: '商品评价',
      type: 'review',
      points: 20,
      conditions: { with_image: 30 },
      daily_limit: 5,
      total_limit: null,
      is_active: true,
      description: '评价商品获得20积分，带图评价额外获得10积分'
    }
  ];

  for (const rule of rules) {
    try {
      await pb.collection('points_rules').create(rule);
      console.log(`✅ 创建积分规则: ${rule.name}`);
    } catch (error) {
      console.log(`⚠️ 积分规则 ${rule.name} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 创建积分兑换测试数据
async function createPointsExchangesTestData() {
  const exchanges = [
    {
      name: '10元优惠券',
      points_required: 1000,
      exchange_type: 'coupon',
      exchange_value: {
        coupon_code: 'POINTS10',
        discount_value: 10,
        min_order_amount: 50
      },
      stock: 100,
      used_count: 23,
      per_user_limit: 5,
      status: 'active',
      description: '使用1000积分兑换10元优惠券'
    },
    {
      name: '账户余额充值',
      points_required: 500,
      exchange_type: 'balance',
      exchange_value: {
        amount: 5
      },
      stock: null,
      used_count: 156,
      per_user_limit: 10,
      status: 'active',
      description: '500积分兑换5元账户余额'
    },
    {
      name: 'VIP特权体验',
      points_required: 2000,
      exchange_type: 'privilege',
      exchange_value: {
        privilege: 'vip_trial',
        duration: 30
      },
      stock: 50,
      used_count: 8,
      per_user_limit: 1,
      status: 'active',
      description: '2000积分兑换30天VIP特权体验'
    }
  ];

  for (const exchange of exchanges) {
    try {
      await pb.collection('points_exchanges').create(exchange);
      console.log(`✅ 创建积分兑换: ${exchange.name}`);
    } catch (error) {
      console.log(`⚠️ 积分兑换 ${exchange.name} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 创建积分记录测试数据
async function createPointsRecordsTestData() {
  const records = [
    {
      user_id: 'user_001',
      type: 'earn',
      points: 100,
      balance_before: 0,
      balance_after: 100,
      source: 'register',
      source_id: 'reg_001',
      description: '新用户注册奖励',
      expire_date: '2025-12-31'
    },
    {
      user_id: 'user_001',
      type: 'earn',
      points: 10,
      balance_before: 100,
      balance_after: 110,
      source: 'login',
      source_id: 'login_001',
      description: '每日签到奖励',
      expire_date: '2025-12-31'
    },
    {
      user_id: 'user_001',
      type: 'earn',
      points: 50,
      balance_before: 110,
      balance_after: 160,
      source: 'purchase',
      source_id: 'order_001',
      description: '购物消费50元获得积分',
      expire_date: '2025-12-31'
    },
    {
      user_id: 'user_002',
      type: 'earn',
      points: 20,
      balance_before: 200,
      balance_after: 220,
      source: 'review',
      source_id: 'review_001',
      description: '商品评价奖励',
      expire_date: '2025-12-31'
    },
    {
      user_id: 'user_002',
      type: 'spend',
      points: -500,
      balance_before: 220,
      balance_after: -280,
      source: 'exchange',
      source_id: 'exchange_001',
      description: '兑换账户余额',
      expire_date: null
    }
  ];

  for (const record of records) {
    try {
      await pb.collection('points_records').create(record);
      console.log(`✅ 创建积分记录: ${record.description}`);
    } catch (error) {
      console.log(`⚠️ 积分记录创建失败:`, getErrorMessage(error));
    }
  }
}

async function main() {
  try {
    console.log('🚀 开始插入积分相关测试数据...\n');
    
    await authenticate();
    
    console.log('\n🎯 创建积分规则测试数据...');
    await createPointsRulesTestData();
    
    console.log('\n💰 创建积分兑换测试数据...');
    await createPointsExchangesTestData();
    
    console.log('\n📊 创建积分记录测试数据...');
    await createPointsRecordsTestData();
    
    console.log('\n✅ 积分相关测试数据插入完成！');
    console.log('\n📊 已创建的测试数据:');
    console.log('   ✓ 4条积分规则 (注册奖励、每日签到、购物返积分、商品评价)');
    console.log('   ✓ 3个积分兑换项目 (优惠券、余额充值、VIP特权)');
    console.log('   ✓ 5条积分记录 (包含获得和消费记录)');
    
  } catch (error) {
    console.error('❌ 插入测试数据失败:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  main();
} 