import { pocketbaseClient } from '../../config/pocketbase.ts';

async function importMobileCollections() {
  try {
    console.log('🚀 开始导入移动端集合...');
    
    // 确保认证
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();
    
    // 读取移动端集合定义
    const collectionsData = JSON.parse(await Deno.readTextFile('./collections/mobile.json'));
    
    console.log(`📦 找到 ${collectionsData.length} 个集合定义`);
    
    for (const collection of collectionsData) {
      try {
        console.log(`📝 创建集合: ${collection.name}`);
        
        // 检查集合是否已存在
        try {
          await pb.collections.getOne(collection.id);
          console.log(`⚠️ 集合 ${collection.name} 已存在，跳过`);
          continue;
        } catch (e) {
          // 集合不存在，继续创建
        }
        
        // 创建集合
        await pb.collections.create(collection);
        console.log(`✅ 成功创建集合: ${collection.name}`);
        
      } catch (error) {
        console.error(`❌ 创建集合 ${collection.name} 失败:`, error);
      }
    }
    
    console.log('✨ 移动端集合导入完成！');
    
  } catch (error) {
    console.error('❌ 导入失败:', error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await importMobileCollections();
} 