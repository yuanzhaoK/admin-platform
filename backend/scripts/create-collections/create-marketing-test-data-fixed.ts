/**
 * 营销管理模块 - 测试数据生成脚本（修复版）
 * 为各个营销模块创建测试数据
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// 错误处理辅助函数
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// 管理员认证
async function authenticate() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功');
  } catch (error) {
    console.log(error);
    console.error('❌ 认证失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建会员等级集合（如果不存在）
async function createMemberLevelsCollection() {
  try {
    // 检查集合是否存在
    await pb.collections.getOne('member_levels');
    console.log('✅ member_levels 集合已存在');
  } catch (error) {
    // 集合不存在，创建它
    console.log('📝 创建 member_levels 集合...');
    const memberLevelsSchema = {
      name: 'member_levels',
      type: 'base',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'description',
          type: 'text',
          required: false
        },
        {
          name: 'discount_rate',
          type: 'number',
          required: true
        },
        {
          name: 'points_required',
          type: 'number',
          required: true
        },
        {
          name: 'benefits',
          type: 'json',
          required: false
        },
        {
          name: 'sort_order',
          type: 'number',
          required: false
        },
        {
          name: 'color',
          type: 'text',
          required: false
        },
        {
          name: 'icon',
          type: 'text',
          required: false
        },
        {
          name: 'is_active',
          type: 'bool',
          required: false
        }
      ]
    };
    
    await pb.collections.create(memberLevelsSchema);
    console.log('✅ member_levels 集合创建成功');
  }
}

// 创建会员等级测试数据
async function createMemberLevelsTestData() {
  const levels = [
    {
      name: '青铜会员',
      description: '新用户默认等级',
      discount_rate: 0,
      points_required: 0,
      benefits: ['基础客服支持', '生日祝福'],
      sort_order: 1,
      color: '#CD7F32',
      icon: '🥉',
      is_active: true
    },
    {
      name: '白银会员',
      description: '累计消费满500元',
      discount_rate: 0.05,
      points_required: 500,
      benefits: ['5%购物折扣', '优先客服', '生日优惠券'],
      sort_order: 2,
      color: '#C0C0C0',
      icon: '🥈',
      is_active: true
    },
    {
      name: '黄金会员',
      description: '累计消费满2000元',
      discount_rate: 0.1,
      points_required: 2000,
      benefits: ['10%购物折扣', '免费配送', '专属客服', '生日礼品'],
      sort_order: 3,
      color: '#FFD700',
      icon: '🥇',
      is_active: true
    },
    {
      name: '钻石会员',
      description: '累计消费满10000元',
      discount_rate: 0.15,
      points_required: 10000,
      benefits: ['15%购物折扣', '免费配送', '7x24客服', '专享活动', '定制服务'],
      sort_order: 4,
      color: '#B9F2FF',
      icon: '💎',
      is_active: true
    }
  ];

  for (const level of levels) {
    try {
      await pb.collection('member_levels').create(level);
      console.log(`✅ 创建会员等级: ${level.name}`);
    } catch (error) {
      console.log(`⚠️ 会员等级 ${level.name} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 创建会员测试数据
async function createMembersTestData() {
  // 先获取会员等级数据
  const levels = await pb.collection('member_levels').getFullList();
  
  const members = [
    {
      username: 'testuser1',
      email: 'test1@example.com',
      phone: '13800138001',
      real_name: '张三',
      gender: 'male',
      birthday: '1990-01-15',
      level_id: levels[0]?.id,
      points: 150,
      balance: 100.50,
      total_orders: 5,
      total_amount: 1250.80,
      status: 'active',
      register_time: '2024-01-15T08:00:00Z',
      last_login_time: '2024-12-10T10:30:00Z',
      tags: ['新用户', '活跃用户']
    },
    {
      username: 'testuser2',
      email: 'test2@example.com',
      phone: '13800138002',
      real_name: '李四',
      gender: 'female',
      birthday: '1992-05-20',
      level_id: levels[1]?.id,
      points: 680,
      balance: 250.00,
      total_orders: 12,
      total_amount: 3450.60,
      status: 'active',
      register_time: '2024-02-10T09:00:00Z',
      last_login_time: '2024-12-09T15:20:00Z',
      tags: ['白银用户', '高价值用户']
    },
    {
      username: 'testuser3',
      email: 'test3@example.com',
      phone: '13800138003',
      real_name: '王五',
      gender: 'male',
      birthday: '1988-03-10',
      level_id: levels[2]?.id,
      points: 1250,
      balance: 500.00,
      total_orders: 25,
      total_amount: 8900.40,
      status: 'active',
      register_time: '2023-10-05T11:00:00Z',
      last_login_time: '2024-12-08T16:45:00Z',
      tags: ['黄金用户', 'VIP客户']
    }
  ];

  for (const member of members) {
    try {
      await pb.collection('members').create(member);
      console.log(`✅ 创建会员: ${member.username}`);
    } catch (error) {
      console.log(`⚠️ 会员 ${member.username} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 创建优惠券测试数据
async function createCouponsTestData() {
  const coupons = [
    {
      name: '新用户专享优惠券',
      code: 'NEW20',
      type: 'new_user',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_amount: 100,
      max_discount_amount: 50,
      total_quantity: 1000,
      used_quantity: 156,
      per_user_limit: 1,
      start_time: '2024-01-01T00:00:00Z',
      end_time: '2024-12-31T23:59:59Z',
      status: 'active',
      description: '新用户首次购买享受8折优惠',
      applicable_products: [],
      applicable_categories: []
    },
    {
      name: '满减优惠券',
      code: 'SAVE50',
      type: 'general',
      discount_type: 'fixed_amount',
      discount_value: 50,
      min_order_amount: 300,
      total_quantity: 500,
      used_quantity: 89,
      per_user_limit: 3,
      start_time: '2024-12-01T00:00:00Z',
      end_time: '2024-12-31T23:59:59Z',
      status: 'active',
      description: '满300减50元',
      applicable_products: [],
      applicable_categories: []
    },
    {
      name: '会员专享优惠券',
      code: 'VIP15',
      type: 'member_exclusive',
      discount_type: 'percentage',
      discount_value: 15,
      min_order_amount: 200,
      max_discount_amount: 100,
      total_quantity: 200,
      used_quantity: 45,
      per_user_limit: 2,
      start_time: '2024-12-01T00:00:00Z',
      end_time: '2024-12-31T23:59:59Z',
      status: 'active',
      description: '会员专享85折优惠',
      applicable_products: [],
      applicable_categories: []
    }
  ];

  for (const coupon of coupons) {
    try {
      await pb.collection('coupons').create(coupon);
      console.log(`✅ 创建优惠券: ${coupon.name}`);
    } catch (error) {
      console.log(`⚠️ 优惠券 ${coupon.name} 可能已存在:`, getErrorMessage(error));
    }
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

// 创建商品推荐测试数据
async function createRecommendationsTestData() {
  const recommendations = [
    {
      name: '首页热门推荐',
      type: 'hot',
      position: 'homepage_banner',
      products: ['prod_001', 'prod_002', 'prod_003', 'prod_004'],
      priority: 90,
      clicks: 1256,
      views: 8945,
      status: 'active',
      start_time: '2024-12-01T00:00:00Z',
      end_time: '2024-12-31T23:59:59Z',
      description: '首页横幅热门商品推荐'
    },
    {
      name: '新品推荐',
      type: 'new',
      position: 'category_top',
      products: ['prod_005', 'prod_006', 'prod_007'],
      priority: 80,
      clicks: 456,
      views: 2340,
      status: 'active',
      start_time: '2024-12-10T00:00:00Z',
      end_time: '2024-12-25T23:59:59Z',
      description: '分类页顶部新品推荐'
    },
    {
      name: '编辑精选',
      type: 'recommend',
      position: 'sidebar',
      products: ['prod_008', 'prod_009'],
      priority: 70,
      clicks: 234,
      views: 1567,
      status: 'active',
      description: '侧边栏编辑精选推荐'
    }
  ];

  for (const recommendation of recommendations) {
    try {
      await pb.collection('recommendations').create(recommendation);
      console.log(`✅ 创建商品推荐: ${recommendation.name}`);
    } catch (error) {
      console.log(`⚠️ 商品推荐 ${recommendation.name} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 创建广告测试数据
async function createAdvertisementsTestData() {
  const advertisements = [
    {
      title: '双12大促横幅广告',
      type: 'banner',
      position: 'homepage_top',
      link: 'https://example.com/sale',
      content: '双12大促，全场5折起！',
      priority: 95,
      impressions: 15680,
      clicks: 892,
      budget: 5000,
      cost: 1256.80,
      status: 'active',
      start_time: '2024-12-01T00:00:00Z',
      end_time: '2024-12-31T23:59:59Z',
      target_audience: {
        age_range: [18, 65],
        gender: 'all',
        member_level: ['bronze', 'silver', 'gold']
      }
    },
    {
      title: '新品发布弹窗',
      type: 'popup',
      position: 'center',
      link: 'https://example.com/new-products',
      content: '全新系列产品震撼上市！',
      priority: 80,
      impressions: 8950,
      clicks: 445,
      budget: 2000,
      cost: 678.90,
      status: 'active',
      start_time: '2024-12-15T00:00:00Z',
      end_time: '2024-12-30T23:59:59Z',
      target_audience: {
        age_range: [25, 45],
        gender: 'all',
        member_level: ['gold', 'diamond']
      }
    }
  ];

  for (const ad of advertisements) {
    try {
      await pb.collection('advertisements').create(ad);
      console.log(`✅ 创建广告: ${ad.title}`);
    } catch (error) {
      console.log(`⚠️ 广告 ${ad.title} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 创建热门商品测试数据
async function createTrendingItemsTestData() {
  const trendingItems = [
    {
      product_id: 'prod_001',
      product_name: 'iPhone 15 Pro Max',
      category: '手机数码',
      type: 'auto',
      source: 'sales',
      rank: 1,
      score: 95.5,
      views: 12580,
      clicks: 856,
      sales: 156,
      trend: 'up',
      trend_change: 12.5,
      status: 'active'
    },
    {
      product_id: 'prod_002',
      product_name: 'MacBook Pro 14英寸',
      category: '电脑办公',
      type: 'auto',
      source: 'views',
      rank: 2,
      score: 88.2,
      views: 9840,
      clicks: 567,
      sales: 89,
      trend: 'up',
      trend_change: 8.3,
      status: 'active'
    },
    {
      product_id: 'prod_003',
      product_name: 'Nike Air Max 270',
      category: '运动户外',
      type: 'manual',
      source: 'manual',
      rank: 3,
      score: 82.1,
      views: 7650,
      clicks: 423,
      sales: 234,
      trend: 'stable',
      trend_change: 0,
      status: 'active',
      start_date: '2024-12-01',
      end_date: '2024-12-31'
    },
    {
      product_id: 'prod_004',
      product_name: '小米13 Ultra',
      category: '手机数码',
      type: 'auto',
      source: 'search',
      rank: 4,
      score: 79.8,
      views: 6540,
      clicks: 389,
      sales: 178,
      trend: 'down',
      trend_change: -5.2,
      status: 'active'
    }
  ];

  for (const item of trendingItems) {
    try {
      await pb.collection('trending_items').create(item);
      console.log(`✅ 创建热门商品: ${item.product_name}`);
    } catch (error) {
      console.log(`⚠️ 热门商品 ${item.product_name} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 创建热门规则测试数据
async function createTrendingRulesTestData() {
  const rules = [
    {
      name: '销量热门规则',
      type: 'sales',
      period: 'weekly',
      limit: 10,
      weight: 0.4,
      conditions: {
        min_sales: 10,
        category_exclude: ['test']
      },
      status: 'active',
      description: '基于周销量的热门商品排序规则'
    },
    {
      name: '浏览量热门规则',
      type: 'views',
      period: 'daily',
      limit: 20,
      weight: 0.3,
      conditions: {
        min_views: 100
      },
      status: 'active',
      description: '基于日浏览量的热门商品排序规则'
    },
    {
      name: '搜索热度规则',
      type: 'search',
      period: 'monthly',
      limit: 15,
      weight: 0.2,
      conditions: {
        min_search_count: 50
      },
      status: 'active',
      description: '基于月搜索热度的热门商品排序规则'
    },
    {
      name: '评分优选规则',
      type: 'rating',
      period: 'weekly',
      limit: 12,
      weight: 0.1,
      conditions: {
        min_rating: 4.0,
        min_review_count: 20
      },
      status: 'active',
      description: '基于用户评分的优质商品推荐规则'
    }
  ];

  for (const rule of rules) {
    try {
      await pb.collection('trending_rules').create(rule);
      console.log(`✅ 创建热门规则: ${rule.name}`);
    } catch (error) {
      console.log(`⚠️ 热门规则 ${rule.name} 可能已存在:`, getErrorMessage(error));
    }
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始创建营销管理模块测试数据...\n');
    
    await authenticate();
    
    // 确保必要的集合存在
    await createMemberLevelsCollection();
    
    console.log('\n👥 创建会员相关测试数据...');
    await createMemberLevelsTestData();
    await createMembersTestData();
    
    console.log('\n🎫 创建优惠券测试数据...');
    await createCouponsTestData();
    
    console.log('\n🎯 创建积分相关测试数据...');
    await createPointsRulesTestData();
    await createPointsExchangesTestData();
    
    console.log('\n📈 创建商品推荐测试数据...');
    await createRecommendationsTestData();
    
    console.log('\n📱 创建广告测试数据...');
    await createAdvertisementsTestData();
    
    console.log('\n🔥 创建热门相关测试数据...');
    await createTrendingItemsTestData();
    await createTrendingRulesTestData();
    
    console.log('\n✅ 营销管理模块测试数据创建完成！');
    console.log('\n📊 已创建的测试数据:');
    console.log('   ✓ 4个会员等级 (青铜、白银、黄金、钻石)');
    console.log('   ✓ 3个测试会员');
    console.log('   ✓ 3张优惠券');
    console.log('   ✓ 4条积分规则');
    console.log('   ✓ 3个积分兑换项目');
    console.log('   ✓ 3个商品推荐位置');
    console.log('   ✓ 2个广告位');
    console.log('   ✓ 4个热门商品');
    console.log('   ✓ 4条热门规则');
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', getErrorMessage(error));
  }
}

// 运行脚本
if (import.meta.main) {
  main();
} 