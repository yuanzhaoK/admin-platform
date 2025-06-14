#!/usr/bin/env deno run --allow-net --allow-env --allow-read

import { PocketBaseCollectionCreator } from './collection-creator-framework.ts';
import { productTypesBlueprint } from './collection-blueprints.ts';

const POCKETBASE_URL = Deno.env.get('POCKETBASE_URL') || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = Deno.env.get('POCKETBASE_ADMIN_EMAIL') || 'ahukpyu@outlook.com';
const ADMIN_PASSWORD = Deno.env.get('POCKETBASE_ADMIN_PASSWORD') || 'kpyu1512..@';

async function main() {
  console.log('🚀 开始导入商品类型集合...');
  
  try {
    const creator = new PocketBaseCollectionCreator(POCKETBASE_URL);
    
    // 登录到PocketBase
    console.log('📊 连接到PocketBase...');
    const loginSuccess = await creator.adminLogin(ADMIN_EMAIL, ADMIN_PASSWORD);
    if (!loginSuccess) {
      throw new Error('无法登录到PocketBase');
    }
    
    // 创建商品类型集合
    console.log('📦 创建product_types集合...');
    const success = await creator.createFromBlueprint(productTypesBlueprint);
    
    if (success) {
      console.log('✅ 商品类型集合导入成功！');
      console.log('');
      console.log('📋 已创建的商品类型:');
      console.log('   1. 电子设备 - 手机、平板、电脑等电子设备');
      console.log('   2. 服装鞋帽 - 各类服装、鞋子、帽子等');
      console.log('   3. 图书文具 - 各类书籍、文具用品');
      console.log('   4. 家居用品 - 家具、装饰品等家居用品');
      console.log('   5. 食品饮料 - 各类食品、饮料、调料等');
      console.log('   6. 美妆护肤 - 化妆品、护肤品等');
      console.log('   7. 运动户外 - 运动器材、户外用品等');
      console.log('   8. 母婴用品 - 婴幼儿用品、孕妇用品等');
      console.log('');
      console.log('🔗 你现在可以在以下地址访问:');
      console.log(`   - PocketBase 管理界面: ${POCKETBASE_URL}/_/`);
      console.log('   - GraphQL 查询: http://localhost:8082/graphql');
      console.log('   - 前端商品类型页面: http://localhost:3000/dashboard/products/types');
    } else {
      console.log('❌ 商品类型集合导入失败');
      Deno.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 导入过程中出现错误:', error);
    Deno.exit(1);
  }
}

// 运行主函数
if (import.meta.main) {
  await main();
} 