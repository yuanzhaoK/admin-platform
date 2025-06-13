#!/usr/bin/env -S deno run --allow-all

// 创建完整的商品管理集合系统
// 使用方法: deno run --allow-all create-product-collections.ts

import { createProductCollections } from './enhanced-product-collections.ts';

async function main() {
  console.log('🚀 PocketBase 商品管理集合创建工具');
  console.log('=====================================\n');
  
  // 配置参数
  const config = {
    baseUrl: Deno.env.get('POCKETBASE_URL') || 'http://localhost:8090',
    adminEmail: Deno.env.get('ADMIN_EMAIL') || 'ahukpyu@outlook.com',
    adminPassword: Deno.env.get('ADMIN_PASSWORD') || 'kpyu1512..@'
  };
  
  console.log('📋 配置信息:');
  console.log(`   PocketBase URL: ${config.baseUrl}`);
  console.log(`   管理员邮箱: ${config.adminEmail}`);
  console.log('');
  
  console.log('⚠️  请确保:');
  console.log('   1. PocketBase 服务正在运行');
  console.log('   2. 管理员账号已创建');
  console.log('   3. 网络连接正常');
  console.log('');
  
  // 询问用户确认
  const confirm = prompt('是否继续创建商品管理集合? (y/N): ');
  
  if (confirm?.toLowerCase() !== 'y' && confirm?.toLowerCase() !== 'yes') {
    console.log('❌ 操作已取消');
    return;
  }
  
  console.log('');
  
  try {
    const success = await createProductCollections(
      config.baseUrl,
      config.adminEmail,
      config.adminPassword
    );
    
    if (success) {
      console.log('\n🎉 商品管理集合创建完成！');
      console.log('\n📝 后续步骤:');
      console.log(`   1. 访问 ${config.baseUrl}/_/ 查看管理界面`);
      console.log('   2. 检查集合字段和测试数据');
      console.log('   3. 根据需要调整权限规则');
      console.log('   4. 开始使用 GraphQL API');
      
      console.log('\n🔗 集合结构:');
      console.log('   product_categories: 商品分类 (支持树形结构)');
      console.log('   brands: 品牌管理');
      console.log('   product_types: 商品类型 (含属性配置)');
      console.log('   products: 商品信息 (完整字段)');
      
    } else {
      console.log('\n❌ 创建失败，请检查日志并重试');
      Deno.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 发生未预期的错误:', error);
    Deno.exit(1);
  }
}

// 运行主函数
if (import.meta.main) {
  await main();
} 