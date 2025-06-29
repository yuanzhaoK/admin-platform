#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import { pocketbaseClient } from '../config/pocketbase.ts';

// 获取错误信息
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// 验证推荐集合
async function validateRecommendationCollections() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    const requiredCollections = [
      'recommendations',
      'recommendation_rules',
      'recommendation_stats'
    ];

    console.log('🔍 验证推荐模块数据库集合...');

    for (const collectionName of requiredCollections) {
      try {
        const result = await pb.collection(collectionName).getList(1, 1);
        console.log(`✅ ${collectionName} 集合存在 (${result.totalItems} 条记录)`);
      } catch (error) {
        console.log(`❌ ${collectionName} 集合不存在或无法访问:`, getErrorMessage(error));
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ 验证集合失败:', getErrorMessage(error));
    return false;
  }
}

// 验证推荐数据
async function validateRecommendationData() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    console.log('🔍 验证推荐数据...');

    // 检查推荐数据
    const recommendations = await pb.collection('recommendations').getList(1, 10);
    console.log(`📊 推荐配置: ${recommendations.totalItems} 个`);

    if (recommendations.items.length > 0) {
      const sample = recommendations.items[0];
      console.log(`   示例: ${sample.name} (${sample.type}, ${sample.position})`);
    }

    // 检查推荐规则
    const rules = await pb.collection('recommendation_rules').getList(1, 10);
    console.log(`📊 推荐规则: ${rules.totalItems} 个`);

    if (rules.items.length > 0) {
      const sample = rules.items[0];
      console.log(`   示例: ${sample.name} (${sample.type})`);
    }

    // 检查统计数据
    const stats = await pb.collection('recommendation_stats').getList(1, 10);
    console.log(`📊 统计记录: ${stats.totalItems} 个`);

    return {
      recommendations: recommendations.totalItems,
      rules: rules.totalItems,
      stats: stats.totalItems
    };

  } catch (error) {
    console.error('❌ 验证推荐数据失败:', getErrorMessage(error));
    return null;
  }
}

// 测试GraphQL查询
async function testGraphQLQueries() {
  try {
    console.log('🔍 测试GraphQL查询功能...');

    // 模拟GraphQL查询测试
    const testQueries = [
      'productRecommendations',
      'recommendationRules', 
      'recommendationOverviewStats'
    ];

    console.log('📝 需要测试的GraphQL查询:');
    testQueries.forEach(query => {
      console.log(`   - ${query}`);
    });

    console.log('⚠️  GraphQL查询需要前端服务器运行才能完整测试');
    
    return true;
  } catch (error) {
    console.error('❌ GraphQL测试准备失败:', getErrorMessage(error));
    return false;
  }
}

// 生成推荐模块报告
async function generateRecommendationReport() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    console.log('📋 推荐模块功能报告');
    console.log('=' .repeat(50));

    // 获取详细统计
    const recommendations = await pb.collection('recommendations').getList(1, 100);
    const rules = await pb.collection('recommendation_rules').getList(1, 100);
    const stats = await pb.collection('recommendation_stats').getList(1, 100);

    // 按类型统计推荐
    const typeStats: Record<string, number> = {};
    const positionStats: Record<string, number> = {};
    const statusStats = { active: 0, inactive: 0 };

    recommendations.items.forEach((rec: any) => {
      typeStats[rec.type] = (typeStats[rec.type] || 0) + 1;
      positionStats[rec.position] = (positionStats[rec.position] || 0) + 1;
      if (rec.is_active) {
        statusStats.active++;
      } else {
        statusStats.inactive++;
      }
    });

    console.log('\n📊 推荐配置统计:');
    console.log(`   总数: ${recommendations.totalItems}`);
    console.log(`   启用: ${statusStats.active} | 禁用: ${statusStats.inactive}`);
    
    console.log('\n🏷️  推荐类型分布:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n📍 推荐位置分布:');
    Object.entries(positionStats).forEach(([position, count]) => {
      console.log(`   ${position}: ${count}`);
    });

    console.log('\n📏 推荐规则统计:');
    console.log(`   总数: ${rules.totalItems}`);
    const systemRules = rules.items.filter((r: any) => r.is_system).length;
    const customRules = rules.items.length - systemRules;
    console.log(`   系统规则: ${systemRules} | 自定义规则: ${customRules}`);

    console.log('\n📈 统计数据:');
    console.log(`   统计记录: ${stats.totalItems}`);
    
    if (stats.items.length > 0) {
      const totalViews = stats.items.reduce((sum: number, stat: any) => sum + (stat.view_count || 0), 0);
      const totalClicks = stats.items.reduce((sum: number, stat: any) => sum + (stat.click_count || 0), 0);
      const totalConversions = stats.items.reduce((sum: number, stat: any) => sum + (stat.conversion_count || 0), 0);
      
      console.log(`   总浏览量: ${totalViews.toLocaleString()}`);
      console.log(`   总点击量: ${totalClicks.toLocaleString()}`);
      console.log(`   总转化量: ${totalConversions.toLocaleString()}`);
      
      if (totalViews > 0) {
        const avgCTR = (totalClicks / totalViews) * 100;
        console.log(`   平均点击率: ${avgCTR.toFixed(2)}%`);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ 生成报告失败:', getErrorMessage(error));
    return false;
  }
}

// 主验证函数
async function main() {
  console.log('🚀 开始验证推荐模块功能...');
  console.log('');

  // 验证数据库集合
  const collectionsValid = await validateRecommendationCollections();
  if (!collectionsValid) {
    console.log('❌ 数据库集合验证失败，请先运行集合创建脚本');
    return;
  }

  console.log('');

  // 验证推荐数据
  const dataStats = await validateRecommendationData();
  if (!dataStats) {
    console.log('❌ 推荐数据验证失败');
    return;
  }

  console.log('');

  // 测试GraphQL查询
  await testGraphQLQueries();

  console.log('');

  // 生成详细报告
  await generateRecommendationReport();

  console.log('');
  console.log('✅ 推荐模块验证完成！');
  console.log('');
  console.log('🎯 下一步操作建议:');
  console.log('   1. 启动开发服务器: ./start-dev.sh');
  console.log('   2. 访问推荐管理页面: http://localhost:3000/dashboard/marketing/recommendations');
  console.log('   3. 测试创建、编辑、删除推荐功能');
  console.log('   4. 验证推荐规则和统计数据功能');
  console.log('');
  console.log('🔧 如果需要测试数据，运行:');
  console.log('   deno run --allow-net --allow-read --allow-env backend/scripts/create-collections/init-recommendation-data.ts');
}

// 运行脚本
if (import.meta.main) {
  main();
} 