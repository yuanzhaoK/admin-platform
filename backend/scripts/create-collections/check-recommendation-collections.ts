import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function checkRecommendationCollections() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功\n');

    // 检查推荐相关集合
    const collections = ['recommendations', 'recommendation_rules'];
    
    for (const collName of collections) {
      try {
        const collection = await pb.collections.getOne(collName);
        console.log(`📋 ${collName} 集合信息:`);
        console.log(`  ID: ${collection.id}`);
        console.log(`  类型: ${collection.type}`);
        console.log(`  字段:`);
        
        if (collection.schema && Array.isArray(collection.schema)) {
          collection.schema.forEach((field: any, index: number) => {
            console.log(`    ${index + 1}. ${field.name} (${field.type}) - 必填: ${field.required ? '是' : '否'}`);
            if (field.options) {
              console.log(`       选项:`, JSON.stringify(field.options, null, 8));
            }
          });
        } else {
          console.log('    无字段定义或字段格式异常');
        }
        
        // 检查现有数据
        const records = await pb.collection(collName).getFullList();
        console.log(`  现有记录数: ${records.length}`);
        console.log('');
        
      } catch (error) {
        console.log(`❌ ${collName}: 错误 - ${getErrorMessage(error)}`);
        console.log('');
      }
    }
    
    // 尝试创建一条简单的推荐测试数据
    console.log('🧪 尝试创建测试推荐数据...');
    try {
      const testRecommendation = {
        name: '测试推荐',
        type: 'test',
        position: 'test_position',
        products: ['test_product'],
        priority: 50,
        clicks: 0,
        views: 0,
        status: 'active',
        description: '这是一个测试推荐'
      };
      
      const result = await pb.collection('recommendations').create(testRecommendation);
      console.log('✅ 测试推荐创建成功:', result.id);
      
      // 删除测试数据
      await pb.collection('recommendations').delete(result.id);
      console.log('🗑️ 测试数据已清理');
      
    } catch (error) {
      console.log('❌ 创建测试推荐失败:', getErrorMessage(error));
    }
    
  } catch (error) {
    console.error('❌ 错误:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  checkRecommendationCollections();
} 