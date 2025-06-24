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
    },
    {
      name: '品牌推荐',
      type: 'brand',
      position: 'homepage_grid',
      products: ['prod_010', 'prod_011', 'prod_012'],
      priority: 75,
      clicks: 678,
      views: 3421,
      status: 'active',
      start_time: '2024-12-01T00:00:00Z',
      end_time: '2024-12-31T23:59:59Z',
      description: '首页网格品牌推荐'
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

// 创建推荐规则测试数据
async function createRecommendationRulesTestData() {
  const rules = [
    {
      name: '热销商品推荐规则',
      type: 'sales',
      algorithm: 'popularity',
      conditions: {
        min_sales: 100,
        time_period: 'last_30_days',
        category_filter: ['electronics', 'fashion']
      },
      weight: 0.4,
      limit: 10,
      sort_order: 1,
      is_active: true,
      description: '基于销量的热门商品推荐算法'
    },
    {
      name: '高评分商品推荐规则',
      type: 'rating',
      algorithm: 'content_based',
      conditions: {
        min_rating: 4.5,
        min_review_count: 20,
        exclude_out_of_stock: true
      },
      weight: 0.3,
      limit: 8,
      sort_order: 2,
      is_active: true,
      description: '基于用户评分的优质商品推荐'
    },
    {
      name: '新品推荐规则',
      type: 'new',
      algorithm: 'trending',
      conditions: {
        max_days_since_launch: 30,
        min_stock: 10
      },
      weight: 0.2,
      limit: 6,
      sort_order: 3,
      is_active: true,
      description: '新上架商品的推荐规则'
    },
    {
      name: '协同过滤推荐规则',
      type: 'manual',
      algorithm: 'collaborative',
      conditions: {
        user_behavior_weight: 0.6,
        item_similarity_weight: 0.4,
        min_user_interactions: 5
      },
      weight: 0.1,
      limit: 12,
      sort_order: 4,
      is_active: true,
      description: '基于用户行为的协同过滤推荐'
    }
  ];

  for (const rule of rules) {
    try {
      await pb.collection('recommendation_rules').create(rule);
      console.log(`✅ 创建推荐规则: ${rule.name}`);
    } catch (error) {
      console.log(`⚠️ 推荐规则 ${rule.name} 可能已存在:`, getErrorMessage(error));
    }
  }
}

async function main() {
  try {
    console.log('🚀 开始插入推荐相关测试数据...\n');
    
    await authenticate();
    
    console.log('\n📈 创建商品推荐测试数据...');
    await createRecommendationsTestData();
    
    console.log('\n⚙️ 创建推荐规则测试数据...');
    await createRecommendationRulesTestData();
    
    console.log('\n✅ 推荐相关测试数据插入完成！');
    console.log('\n📊 已创建的测试数据:');
    console.log('   ✓ 4个商品推荐位置 (首页热门、新品推荐、编辑精选、品牌推荐)');
    console.log('   ✓ 4条推荐规则 (热销商品、高评分商品、新品推荐、协同过滤)');
    
  } catch (error) {
    console.error('❌ 插入测试数据失败:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  main();
} 