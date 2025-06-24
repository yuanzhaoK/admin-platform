#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// 管理员登录信息
const adminEmail = 'ahukpyu@outlook.com';
const adminPassword = 'kpyu1512..@';

async function fixMemberPermissions() {
  try {
    console.log('🔐 正在登录管理员账户...');
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ 管理员登录成功');

    // 需要修复权限的集合
    const collections = [
      'members',
      'member_levels',
      'points_rules',
      'points_exchanges', 
      'points_records',
      'recommendations',
      'recommendation_rules',
      'advertisements',
      'trending_items',
      'trending_rules',
      'coupons',
      'coupon_usage'
    ];

    for (const collectionName of collections) {
      try {
        console.log(`📝 正在修复集合 ${collectionName} 的权限...`);
        
        // 获取集合信息
        const collection = await pb.collections.getFirstListItem('collections', {
          filter: `name="${collectionName}"`
        });
        
        // 更新权限设置 - 允许认证用户访问
        await pb.collections.update(collection.id, {
          listRule: '@request.auth.id != ""',  // 允许已认证用户列表查询
          viewRule: '@request.auth.id != ""',  // 允许已认证用户查看详情
          createRule: '@request.auth.id != ""', // 允许已认证用户创建
          updateRule: '@request.auth.id != ""', // 允许已认证用户更新
          deleteRule: '@request.auth.id != ""', // 允许已认证用户删除
        });
        
        console.log(`✅ 集合 ${collectionName} 权限修复成功`);
      } catch (error: any) {
        if (error.status === 404) {
          console.log(`⚠️  集合 ${collectionName} 不存在，跳过`);
        } else {
          console.error(`❌ 修复集合 ${collectionName} 权限失败:`, error.message);
        }
      }
    }

    console.log('🎉 所有集合权限修复完成！');
    
  } catch (error) {
    console.error('❌ 修复权限失败:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await fixMemberPermissions();
} 