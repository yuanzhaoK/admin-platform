#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env

import { pocketbaseClient } from '../../config/pocketbase.ts';

async function createTrendingCollections() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    console.log('🔥 开始创建热门管理数据集合...');

    // 1. 创建热门项目集合
    try {
      await pb.collections.create({
        name: 'trending_items',
        type: 'base',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true
          },
          {
            name: 'description',
            type: 'text'
          },
          {
            name: 'type',
            type: 'select',
            required: true,
            options: {
              values: ['product', 'category', 'brand', 'keyword', 'content', 'topic']
            }
          },
          {
            name: 'item_id',
            type: 'text',
            required: true
          },
          {
            name: 'item_data',
            type: 'json'
          },
          {
            name: 'category',
            type: 'text'
          },
          {
            name: 'tags',
            type: 'json'
          },
          {
            name: 'score',
            type: 'number',
            required: true
          },
          {
            name: 'manual_score',
            type: 'number'
          },
          {
            name: 'auto_score',
            type: 'number',
            required: true
          },
          {
            name: 'rank',
            type: 'number',
            required: true
          },
          {
            name: 'status',
            type: 'select',
            required: true,
            options: {
              values: ['active', 'inactive', 'expired', 'pending']
            }
          },
          {
            name: 'start_time',
            type: 'date'
          },
          {
            name: 'end_time',
            type: 'date'
          },
          {
            name: 'view_count',
            type: 'number'
          },
          {
            name: 'click_count',
            type: 'number'
          }
        ]
      });
      console.log('✅ trending_items 集合创建成功');
    } catch (error) {
      if (!error.message?.includes('already exists')) {
        throw error;
      }
      console.log('ℹ️ trending_items 集合已存在');
    }

    // 2. 创建热门规则集合
    try {
      await pb.collections.create({
        name: 'trending_rules',
        type: 'base',
        fields: [
          {
            name: 'name',
            type: 'text',
            required: true
          },
          {
            name: 'description',
            type: 'text'
          },
          {
            name: 'type',
            type: 'select',
            required: true,
            options: {
              values: ['product', 'category', 'brand', 'keyword', 'content', 'topic']
            }
          },
          {
            name: 'display_count',
            type: 'number',
            required: true
          },
          {
            name: 'update_frequency',
            type: 'select',
            required: true,
            options: {
              values: ['realtime', 'hourly', 'daily', 'weekly', 'manual']
            }
          },
          {
            name: 'calculation_method',
            type: 'select',
            required: true,
            options: {
              values: ['view_based', 'engagement_based', 'purchase_based', 'composite', 'manual']
            }
          },
          {
            name: 'weight_config',
            type: 'json'
          },
          {
            name: 'is_active',
            type: 'bool',
            required: true
          },
          {
            name: 'sort_order',
            type: 'number',
            required: true
          }
        ]
      });
      console.log('✅ trending_rules 集合创建成功');
    } catch (error) {
      if (!error.message?.includes('already exists')) {
        throw error;
      }
      console.log('ℹ️ trending_rules 集合已存在');
    }

    console.log('🎉 热门管理数据集合创建完成！');
  } catch (error) {
    console.error('❌ 创建热门管理数据集合失败:', error);
    throw error;
  }
}

async function insertTestData() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    console.log('📊 开始插入测试数据...');

    // 插入热门规则测试数据
    const testRules = [
      {
        name: '商品销量热门规则',
        description: '基于商品销量计算热门排行',
        type: 'product',
        display_count: 20,
        update_frequency: 'daily',
        calculation_method: 'purchase_based',
        weight_config: {
          purchase_weight: 0.6,
          view_weight: 0.3,
          engagement_weight: 0.1
        },
        is_active: true,
        sort_order: 1
      },
      {
        name: '分类浏览热门规则',
        description: '基于分类浏览量计算热门排行',
        type: 'category',
        display_count: 15,
        update_frequency: 'hourly',
        calculation_method: 'view_based',
        weight_config: {
          view_weight: 0.8,
          engagement_weight: 0.2
        },
        is_active: true,
        sort_order: 2
      },
      {
        name: '品牌综合热门规则',
        description: '基于品牌综合指标计算热门排行',
        type: 'brand',
        display_count: 10,
        update_frequency: 'daily',
        calculation_method: 'composite',
        weight_config: {
          purchase_weight: 0.4,
          view_weight: 0.3,
          engagement_weight: 0.3
        },
        is_active: true,
        sort_order: 3
      }
    ];

    for (const rule of testRules) {
      try {
        await pb.collection('trending_rules').create(rule);
        console.log(`✅ 已创建规则: ${rule.name}`);
      } catch (error) {
        console.log(`ℹ️ 规则 ${rule.name} 已存在或创建失败`);
      }
    }

    // 插入热门项目测试数据
    const testItems = [
      {
        name: 'iPhone 15 Pro Max',
        description: '苹果最新旗舰手机，配备A17 Pro芯片',
        type: 'product',
        item_id: 'prod_001',
        item_data: {
          price: 9999,
          brand: 'Apple',
          model: 'iPhone 15 Pro Max'
        },
        category: '手机数码',
        tags: ['苹果', 'iPhone', '5G', '高端'],
        score: 95.8,
        manual_score: null,
        auto_score: 95.8,
        rank: 1,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: null,
        view_count: 85600,
        click_count: 12800
      },
      {
        name: 'MacBook Pro M3',
        description: 'Apple M3芯片的专业级笔记本电脑',
        type: 'product',
        item_id: 'prod_002',
        item_data: {
          price: 14999,
          brand: 'Apple',
          model: 'MacBook Pro 14-inch'
        },
        category: '电脑办公',
        tags: ['Apple', 'MacBook', 'M3', '专业'],
        score: 92.4,
        manual_score: 95.0,
        auto_score: 90.8,
        rank: 2,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: null,
        view_count: 72300,
        click_count: 9800
      },
      {
        name: 'AirPods Pro 第三代',
        description: '主动降噪无线耳机，空间音频技术',
        type: 'product',
        item_id: 'prod_003',
        item_data: {
          price: 1899,
          brand: 'Apple',
          model: 'AirPods Pro 3rd Gen'
        },
        category: '数码配件',
        tags: ['Apple', 'AirPods', '降噪', '无线'],
        score: 89.6,
        manual_score: null,
        auto_score: 89.6,
        rank: 3,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: null,
        view_count: 96500,
        click_count: 15600
      },
      {
        name: '小米14 Ultra',
        description: '小米旗舰摄影手机，徕卡相机系统',
        type: 'product',
        item_id: 'prod_004',
        item_data: {
          price: 6499,
          brand: 'Xiaomi',
          model: 'Mi 14 Ultra'
        },
        category: '手机数码',
        tags: ['小米', 'Ultra', '徕卡', '摄影'],
        score: 87.2,
        manual_score: null,
        auto_score: 87.2,
        rank: 4,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: null,
        view_count: 68900,
        click_count: 8900
      },
      {
        name: 'Nintendo Switch OLED',
        description: '任天堂游戏主机OLED版本',
        type: 'product',
        item_id: 'prod_005',
        item_data: {
          price: 2599,
          brand: 'Nintendo',
          model: 'Switch OLED'
        },
        category: '游戏娱乐',
        tags: ['任天堂', 'Switch', 'OLED', '游戏'],
        score: 84.8,
        manual_score: 88.0,
        auto_score: 82.6,
        rank: 5,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: null,
        view_count: 54200,
        click_count: 7300
      },
      {
        name: '智能手表',
        description: '热门智能手表分类',
        type: 'category',
        item_id: 'cat_001',
        item_data: {
          product_count: 156,
          avg_price: 1299
        },
        category: '数码配件',
        tags: ['智能手表', '健康监测', '运动'],
        score: 82.4,
        manual_score: null,
        auto_score: 82.4,
        rank: 6,
        status: 'active',
        start_time: new Date().toISOString(),
        end_time: null,
        view_count: 45600,
        click_count: 6200
      }
    ];

    for (const item of testItems) {
      try {
        await pb.collection('trending_items').create(item);
        console.log(`✅ 已创建热门项目: ${item.name}`);
      } catch (error) {
        console.log(`ℹ️ 热门项目 ${item.name} 已存在或创建失败`);
      }
    }

    console.log('🎉 热门管理测试数据插入完成！');

  } catch (error) {
    console.error('❌ 插入测试数据失败:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 开始初始化热门管理模块数据...');
    
    await createTrendingCollections();
    await insertTestData();
    
    console.log('✨ 热门管理模块数据初始化完成！');
    console.log('');
    console.log('📝 创建的集合:');
    console.log('   - trending_items: 热门项目');
    console.log('   - trending_rules: 热门规则');
    console.log('');
    console.log('📊 测试数据:');
    console.log('   - 3个热门规则');
    console.log('   - 6个热门项目');
    console.log('');
    console.log('🎯 现在可以测试热门管理功能了！');
    
  } catch (error) {
    console.error('💥 初始化失败:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
} 