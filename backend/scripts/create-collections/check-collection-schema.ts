import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function checkCollectionSchema() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功\n');

    // 检查积分相关集合的字段定义
    const collections = ['points_rules', 'points_exchanges', 'points_records'];
    
    for (const collName of collections) {
      try {
        const collection = await pb.collections.getOne(collName);
        console.log(`📋 ${collName} 集合字段定义:`);
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
        console.log('');
      } catch (error) {
        console.log(`❌ ${collName}: 错误 - ${error instanceof Error ? error.message : String(error)}`);
        console.log('');
      }
    }
    
  } catch (error) {
    console.error('❌ 错误:', error instanceof Error ? error.message : String(error));
  }
}

if (import.meta.main) {
  checkCollectionSchema();
} 