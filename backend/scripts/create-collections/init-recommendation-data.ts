#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { pocketbaseClient } from '../../config/pocketbase.ts';

interface Product {
  id: string;
  name: string;
  price: number;
  category_id?: string;
  brand_id?: string;
  status: string;
  sales_count: number;
  rating: number;
  is_featured: boolean;
}

// 获取错误信息
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// 创建推荐测试数据
async function createRecommendationsTestData() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    // 获取一些商品用于推荐
    const products = await pb.collection('products').getList(1, 10, {
      filter: 'status = "active"',
      sort: '-sales_count'
    });

    if (products.items.length === 0) {
      console.log('⚠️ 没有找到商品，请先创建一些商品数据');
      return;
    }

    const productIds = products.items.map((p: any) => p.id);

    // 推荐配置数据
    const recommendations = [
      {
        name: '首页热门推荐',
        description: '首页轮播位置的热门商品推荐',
        type: 'hot_products',
        position: 'homepage_banner',
        product_ids: productIds.slice(0, 5),
        display_count: 5,
        sort_type: 'sales_desc',
        is_active: true,
        weight: 10,
        click_count: 1580,
        conversion_count: 158,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z'
      },
      {
        name: '首页新品推荐',
        description: '首页网格位置的新品推荐',
        type: 'new_products',
        position: 'homepage_grid',
        product_ids: productIds.slice(2, 8),
        display_count: 6,
        sort_type: 'created_desc',
        is_active: true,
        weight: 8,
        click_count: 920,
        conversion_count: 85,
        start_time: '2024-01-01T00:00:00Z'
      },
      {
        name: '分类页推荐',
        description: '分类页侧边栏推荐',
        type: 'category_based',
        position: 'category_sidebar',
        product_ids: productIds.slice(1, 5),
        conditions: { category_type: 'featured' },
        display_count: 4,
        sort_type: 'rating_desc',
        is_active: true,
        weight: 6,
        click_count: 650,
        conversion_count: 42
      },
      {
        name: '商品详情页相关推荐',
        description: '商品详情页的相关商品推荐',
        type: 'collaborative_filtering',
        position: 'product_detail_related',
        product_ids: productIds.slice(0, 4),
        display_count: 4,
        sort_type: 'manual',
        is_active: true,
        weight: 7,
        click_count: 1250,
        conversion_count: 98
      },
      {
        name: '购物车推荐',
        description: '购物车页面的商品推荐',
        type: 'user_behavior',
        position: 'cart_recommend',
        product_ids: productIds.slice(3, 7),
        display_count: 4,
        sort_type: 'price_asc',
        is_active: false,
        weight: 5,
        click_count: 380,
        conversion_count: 25
      }
    ];

    console.log('🔄 开始创建推荐测试数据...');

    for (const recommendation of recommendations) {
      try {
        const result = await pb.collection('recommendations').create(recommendation);
        console.log(`✅ 创建推荐成功: ${recommendation.name} (ID: ${result.id})`);
      } catch (error) {
        if (getErrorMessage(error).includes('duplicate')) {
          console.log(`⚠️ 推荐 "${recommendation.name}" 可能已存在`);
        } else {
          console.log(`❌ 推荐 "${recommendation.name}" 创建失败:`, getErrorMessage(error));
        }
      }
    }

    console.log('✅ 推荐测试数据创建完成');

  } catch (error) {
    console.error('❌ 创建推荐测试数据失败:', getErrorMessage(error));
  }
}

// 创建推荐规则测试数据
async function createRecommendationRulesTestData() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    const rules = [
      {
        name: '热门商品规则',
        description: '基于销量的热门商品推荐规则',
        type: 'hot_products',
        conditions: {
          min_sales_count: 100,
          min_rating: 4.0,
          category_filter: 'all'
        },
        default_display_count: 10,
        default_sort_type: 'sales_desc',
        is_system: true
      },
      {
        name: '新品推荐规则',
        description: '基于创建时间的新品推荐规则',
        type: 'new_products',
        conditions: {
          days_threshold: 30,
          min_rating: 3.5,
          status: 'active'
        },
        default_display_count: 8,
        default_sort_type: 'created_desc',
        is_system: true
      },
      {
        name: '编辑推荐规则',
        description: '编辑精选的推荐商品规则',
        type: 'recommended_products',
        conditions: {
          is_featured: true,
          min_rating: 4.5
        },
        default_display_count: 6,
        default_sort_type: 'rating_desc',
        is_system: true
      },
      {
        name: '分类推荐规则',
        description: '基于分类的商品推荐规则',
        type: 'category_based',
        conditions: {
          same_category: true,
          exclude_viewed: true,
          min_rating: 3.0
        },
        default_display_count: 5,
        default_sort_type: 'sales_desc',
        is_system: false
      },
      {
        name: '用户行为推荐规则',
        description: '基于用户浏览和购买行为的推荐规则',
        type: 'user_behavior',
        conditions: {
          user_history_days: 90,
          behavior_weight: {
            view: 1,
            cart: 2,
            purchase: 3
          },
          min_interaction_count: 3
        },
        default_display_count: 8,
        default_sort_type: 'random',
        is_system: false
      }
    ];

    console.log('🔄 开始创建推荐规则测试数据...');

    for (const rule of rules) {
      try {
        const result = await pb.collection('recommendation_rules').create(rule);
        console.log(`✅ 创建推荐规则成功: ${rule.name} (ID: ${result.id})`);
      } catch (error) {
        if (getErrorMessage(error).includes('duplicate')) {
          console.log(`⚠️ 推荐规则 "${rule.name}" 可能已存在`);
        } else {
          console.log(`❌ 推荐规则 "${rule.name}" 创建失败:`, getErrorMessage(error));
        }
      }
    }

    console.log('✅ 推荐规则测试数据创建完成');

  } catch (error) {
    console.error('❌ 创建推荐规则测试数据失败:', getErrorMessage(error));
  }
}

// 创建推荐统计测试数据
async function createRecommendationStatsTestData() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    // 获取推荐列表
    const recommendations = await pb.collection('recommendations').getList(1, 50);
    
    if (recommendations.items.length === 0) {
      console.log('⚠️ 没有找到推荐数据，请先创建推荐');
      return;
    }

    console.log('🔄 开始创建推荐统计测试数据...');

    // 为每个推荐创建最近30天的统计数据
    const today = new Date();
    
    for (const recommendation of recommendations.items) {
      for (let i = 0; i < 30; i++) {
        const statDate = new Date(today);
        statDate.setDate(today.getDate() - i);
        
        const dateStr = statDate.toISOString().split('T')[0];
        
        // 模拟统计数据
        const baseViews = Math.floor(Math.random() * 200) + 50;
        const baseClicks = Math.floor(baseViews * (Math.random() * 0.15 + 0.05)); // 5-20% 点击率
        const baseConversions = Math.floor(baseClicks * (Math.random() * 0.1 + 0.02)); // 2-12% 转化率
        
        const statData = {
          recommendation_id: recommendation.id,
          date: dateStr,
          view_count: baseViews,
          click_count: baseClicks,
          conversion_count: baseConversions,
          ctr: baseViews > 0 ? (baseClicks / baseViews) * 100 : 0,
          conversion_rate: baseClicks > 0 ? (baseConversions / baseClicks) * 100 : 0
        };

        try {
          await pb.collection('recommendation_stats').create(statData);
        } catch (error) {
          // 忽略重复数据错误
          if (!getErrorMessage(error).includes('duplicate')) {
            console.log(`⚠️ 创建统计数据失败: ${dateStr}`, getErrorMessage(error));
          }
        }
      }
      
      console.log(`✅ 为推荐 "${recommendation.name}" 创建统计数据完成`);
    }

    console.log('✅ 推荐统计测试数据创建完成');

  } catch (error) {
    console.error('❌ 创建推荐统计测试数据失败:', getErrorMessage(error));
  }
}

// 主执行函数
async function main() {
  console.log('🚀 开始初始化推荐模块测试数据...');
  
  try {
    // 按顺序执行
    await createRecommendationsTestData();
    await createRecommendationRulesTestData();
    await createRecommendationStatsTestData();
    
    console.log('');
    console.log('🎉 推荐模块测试数据初始化完成！');
    console.log('');
    console.log('📋 已创建的数据：');
    console.log('   - 商品推荐配置 (recommendations)');
    console.log('   - 推荐规则模板 (recommendation_rules)');
    console.log('   - 推荐统计数据 (recommendation_stats)');
    console.log('');
    console.log('🔗 现在可以在管理后台访问推荐管理页面测试功能');
    
  } catch (error) {
    console.error('❌ 初始化推荐模块测试数据失败:', getErrorMessage(error));
    Deno.exit(1);
  }
}

// 运行脚本
if (import.meta.main) {
  main();
} 