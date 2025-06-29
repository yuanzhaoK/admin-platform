#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env

import { pocketbaseClient } from '../config/pocketbase.ts';

interface ValidationTest {
  name: string;
  test: () => Promise<boolean>;
  description: string;
}

async function runValidationTests() {
  const tests: ValidationTest[] = [
    {
      name: '热门项目集合测试',
      description: '验证热门项目集合是否存在并包含测试数据',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        const result = await pb.collection('trending_items').getList(1, 5);
        return result.items.length > 0;
      }
    },
    {
      name: '热门规则集合测试',
      description: '验证热门规则集合是否存在并包含测试数据',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        const result = await pb.collection('trending_rules').getList(1, 5);
        return result.items.length > 0;
      }
    },
    {
      name: '热门项目查询测试',
      description: '验证热门项目查询功能',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        const result = await pb.collection('trending_items').getList(1, 10, {
          filter: 'status = "active"',
          sort: '-score'
        });
        return result.items.length > 0 && result.items[0].status === 'active';
      }
    },
    {
      name: '热门项目搜索测试',
      description: '验证热门项目搜索功能',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        const result = await pb.collection('trending_items').getList(1, 10, {
          filter: 'name ~ "iPhone"'
        });
        return result.items.some((item: any) => 
          item.name.toLowerCase().includes('iphone')
        );
      }
    },
    {
      name: '热门项目类型筛选测试',
      description: '验证按类型筛选热门项目',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        const result = await pb.collection('trending_items').getList(1, 10, {
          filter: 'type = "product"'
        });
        return result.items.every((item: any) => item.type === 'product');
      }
    },
    {
      name: '热门项目创建测试',
      description: '验证创建新的热门项目',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        const testItem = {
          name: '测试热门项目',
          description: '这是一个测试项目',
          type: 'product',
          item_id: 'test_001',
          category: '测试分类',
          score: 75.5,
          auto_score: 75.5,
          rank: 999,
          status: 'active'
        };
        
        try {
          const created = await pb.collection('trending_items').create(testItem);
          // 清理测试数据
          await pb.collection('trending_items').delete(created.id);
          return true;
        } catch (error) {
          console.error('创建测试失败:', error);
          return false;
        }
      }
    },
    {
      name: '热门项目更新测试',
      description: '验证更新热门项目信息',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        
        // 先获取一个项目
        const items = await pb.collection('trending_items').getList(1, 1);
        if (items.items.length === 0) return false;
        
        const item = items.items[0];
        const originalScore = item.score;
        const newScore = originalScore + 1;
        
        try {
          // 更新分数
          await pb.collection('trending_items').update(item.id, {
            score: newScore
          });
          
          // 验证更新
          const updated = await pb.collection('trending_items').getOne(item.id);
          const isUpdated = updated.score === newScore;
          
          // 恢复原始数据
          await pb.collection('trending_items').update(item.id, {
            score: originalScore
          });
          
          return isUpdated;
        } catch (error) {
          console.error('更新测试失败:', error);
          return false;
        }
      }
    },
    {
      name: '热门规则创建测试',
      description: '验证创建新的热门规则',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        const testRule = {
          name: '测试热门规则',
          description: '这是一个测试规则',
          type: 'product',
          display_count: 5,
          update_frequency: 'daily',
          calculation_method: 'composite',
          weight_config: {
            view_weight: 0.5,
            purchase_weight: 0.5
          },
          is_active: true,
          sort_order: 999
        };
        
        try {
          const created = await pb.collection('trending_rules').create(testRule);
          // 清理测试数据
          await pb.collection('trending_rules').delete(created.id);
          return true;
        } catch (error) {
          console.error('规则创建测试失败:', error);
          return false;
        }
      }
    },
    {
      name: '热门规则状态切换测试',
      description: '验证热门规则状态切换功能',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        
        // 获取一个规则
        const rules = await pb.collection('trending_rules').getList(1, 1);
        if (rules.items.length === 0) return false;
        
        const rule = rules.items[0];
        const originalStatus = rule.is_active;
        const newStatus = !originalStatus;
        
        try {
          // 切换状态
          await pb.collection('trending_rules').update(rule.id, {
            is_active: newStatus
          });
          
          // 验证更新
          const updated = await pb.collection('trending_rules').getOne(rule.id);
          const isToggled = updated.is_active === newStatus;
          
          // 恢复原始状态
          await pb.collection('trending_rules').update(rule.id, {
            is_active: originalStatus
          });
          
          return isToggled;
        } catch (error) {
          console.error('状态切换测试失败:', error);
          return false;
        }
      }
    },
    {
      name: '数据分页测试',
      description: '验证数据分页功能',
      test: async () => {
        const pb = pocketbaseClient.getClient();
        
        const page1 = await pb.collection('trending_items').getList(1, 2);
        const page2 = await pb.collection('trending_items').getList(2, 2);
        
        // 验证分页数据不重复
        const page1Ids = page1.items.map((item: any) => item.id);
        const page2Ids = page2.items.map((item: any) => item.id);
        const hasOverlap = page1Ids.some((id: string) => page2Ids.includes(id));
        
        return !hasOverlap && page1.items.length <= 2 && page2.items.length <= 2;
      }
    }
  ];

  console.log('🧪 开始验证热门管理模块功能...\n');

  let passedTests = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    try {
      console.log(`⏳ 正在执行: ${test.name}`);
      console.log(`   描述: ${test.description}`);
      
      const result = await test.test();
      
      if (result) {
        console.log('   ✅ 通过\n');
        passedTests++;
      } else {
        console.log('   ❌ 失败\n');
      }
    } catch (error) {
      console.log(`   💥 异常: ${error}\n`);
    }
  }

  console.log('📊 验证结果:');
  console.log(`   通过: ${passedTests}/${totalTests}`);
  console.log(`   成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 所有测试通过！热门管理模块功能正常。');
  } else {
    console.log('\n⚠️  部分测试失败，请检查相关功能。');
  }

  return passedTests === totalTests;
}

async function validateDataIntegrity() {
  console.log('\n🔍 验证数据完整性...\n');

  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    // 验证热门项目数据完整性
    const items = await pb.collection('trending_items').getList(1, 100);
    console.log(`📦 热门项目总数: ${items.totalItems}`);
    
    const activeItems = items.items.filter((item: any) => item.status === 'active');
    console.log(`🔥 活跃项目数: ${activeItems.length}`);
    
    const typeCounts = items.items.reduce((acc: any, item: any) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 项目类型分布:', typeCounts);

    // 验证热门规则数据完整性
    const rules = await pb.collection('trending_rules').getList(1, 100);
    console.log(`⚙️  热门规则总数: ${rules.totalItems}`);
    
    const activeRules = rules.items.filter((rule: any) => rule.is_active);
    console.log(`✅ 活跃规则数: ${activeRules.length}`);

    // 验证分数分布
    const scores = items.items.map((item: any) => item.score).filter((score: number) => score != null);
    if (scores.length > 0) {
      const avgScore = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      console.log(`📈 分数统计: 平均 ${avgScore.toFixed(2)}, 最高 ${maxScore}, 最低 ${minScore}`);
    }

    console.log('\n✅ 数据完整性验证完成');
    return true;

  } catch (error) {
    console.error('❌ 数据完整性验证失败:', error);
    return false;
  }
}

async function main() {
  try {
    console.log('🚀 热门管理模块验证开始...\n');
    
    await pocketbaseClient.ensureAuth();
    console.log('✅ PocketBase 连接成功\n');

    const functionalTestsPassed = await runValidationTests();
    const dataIntegrityPassed = await validateDataIntegrity();

    console.log('\n📋 总体验证结果:');
    console.log(`   功能测试: ${functionalTestsPassed ? '✅ 通过' : '❌ 失败'}`);
    console.log(`   数据完整性: ${dataIntegrityPassed ? '✅ 通过' : '❌ 失败'}`);

    if (functionalTestsPassed && dataIntegrityPassed) {
      console.log('\n🎊 恭喜！热门管理模块验证全部通过！');
      console.log('🎯 现在可以在前端页面中使用热门管理功能了。');
    } else {
      console.log('\n⚠️  验证过程中发现问题，请检查相关配置和数据。');
      Deno.exit(1);
    }

  } catch (error) {
    console.error('💥 验证过程异常:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
} 