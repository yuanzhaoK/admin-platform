// 集合创建使用示例
// 演示如何使用标准化框架创建集合

import { PocketBaseCollectionCreator } from './collection-creator-framework.ts';
import { productsBlueprint, articlesBlueprint, allBlueprints } from './collection-blueprints.ts';

async function main() {
  // 创建集合创建器实例
  const creator = new PocketBaseCollectionCreator('http://localhost:8091');

  // 管理员登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await creator.adminLogin('ahukpyu@outlook.com', 'kpyu1512..@');
  
  if (!loginSuccess) {
    console.error('❌ 登录失败，请检查管理员账号和密码');
    return;
  }
  
  console.log('✅ 登录成功！');
  console.log('');

  // 示例1: 创建单个集合
  console.log('=== 示例1: 创建单个产品集合 ===');
  await creator.createFromBlueprint(productsBlueprint);
  console.log('');

  // 示例2: 创建多个集合
  console.log('=== 示例2: 批量创建所有集合 ===');
  await creator.createMultipleCollections(allBlueprints);
  console.log('');

  console.log('🎉 所有示例执行完成！');
}

// 运行示例
main().catch(console.error); 