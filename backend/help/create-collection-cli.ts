#!/usr/bin/env node

// PocketBase 集合创建命令行工具
// 使用方法: npx tsx create-collection-cli.ts [collection-name]

import { PocketBaseCollectionCreator } from './collection-creator-framework.ts';
import { 
  productsBlueprint, 
  articlesBlueprint, 
  commentsBlueprint, 
  userSettingsBlueprint,
  allBlueprints 
} from './collection-blueprints.ts';

// 可用的蓝图映射
const availableBlueprints = {
  'products': productsBlueprint,
  'articles': articlesBlueprint,
  'comments': commentsBlueprint,
  'user_settings': userSettingsBlueprint,
  'all': allBlueprints,
};

async function showHelp() {
  console.log(`
🚀 PocketBase 集合创建工具

使用方法:
  npx tsx create-collection-cli.ts [集合名称]

可用的集合:
  products      - 产品集合
  articles      - 文章集合  
  comments      - 评论集合
  user_settings - 用户设置集合
  all          - 创建所有集合

示例:
  npx tsx create-collection-cli.ts products
  npx tsx create-collection-cli.ts all

环境变量:
  POCKETBASE_URL     - PocketBase 服务地址 (默认: http://localhost:8091)
  ADMIN_EMAIL        - 管理员邮箱 (默认: ahukpyu@outlook.com)
  ADMIN_PASSWORD     - 管理员密码 (默认: kpyu1512..@)
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    await showHelp();
    return;
  }

  const collectionName = args[0];
  
  if (!availableBlueprints[collectionName as keyof typeof availableBlueprints]) {
    console.error(`❌ 未知的集合名称: ${collectionName}`);
    console.log('\n可用的集合:');
    Object.keys(availableBlueprints).forEach(name => {
      console.log(`  - ${name}`);
    });
    return;
  }

  // 创建集合创建器
  const baseUrl = process.env.POCKETBASE_URL || 'http://localhost:8091';
  const adminEmail = process.env.ADMIN_EMAIL || 'ahukpyu@outlook.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'kpyu1512..@';

  const creator = new PocketBaseCollectionCreator(baseUrl);

  console.log(`🚀 开始创建集合: ${collectionName}`);
  console.log(`📡 PocketBase 地址: ${baseUrl}`);
  console.log('');

  // 管理员登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await creator.adminLogin(adminEmail, adminPassword);
  
  if (!loginSuccess) {
    console.error('❌ 登录失败，请检查管理员账号和密码');
    console.log('');
    console.log('请确认:');
    console.log('1. PocketBase 服务正在运行');
    console.log('2. 管理员账号和密码正确');
    console.log('3. 网络连接正常');
    return;
  }
  
  console.log('✅ 登录成功！');
  console.log('');

  try {
    if (collectionName === 'all') {
      // 创建所有集合
      console.log('📦 批量创建所有集合...');
      await creator.createMultipleCollections(allBlueprints);
    } else {
      // 创建单个集合
      const blueprint = availableBlueprints[collectionName as keyof typeof availableBlueprints];
      console.log(`📦 创建集合: ${collectionName}`);
      const success = await creator.createFromBlueprint(blueprint as any);
      
      if (!success) {
        console.error(`❌ 集合 ${collectionName} 创建失败`);
        return;
      }
    }

    console.log('');
    console.log('🎉 操作完成！');
    console.log('');
    console.log('📋 后续步骤:');
    console.log('1. 访问 PocketBase 管理界面查看集合');
    console.log(`2. 打开 ${baseUrl}/_/ 进行管理`);
    console.log('3. 检查集合字段和测试数据');

  } catch (error) {
    console.error('❌ 操作过程中发生错误:', error);
  }
}

// 运行命令行工具
main().catch(console.error); 