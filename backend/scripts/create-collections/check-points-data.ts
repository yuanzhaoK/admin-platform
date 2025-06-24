import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function checkPointsData() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功\n');

    // 检查积分相关集合的数据
    const collections = ['points_rules', 'points_exchanges', 'points_records'];
    
    for (const collName of collections) {
      try {
        const records = await pb.collection(collName).getFullList();
        console.log(`📊 ${collName}: ${records.length} 条记录`);
        if (records.length > 0) {
          console.log('  第一条记录:', JSON.stringify(records[0], null, 2));
        }
        console.log('');
      } catch (error) {
        console.log(`❌ ${collName}: 错误 - ${error instanceof Error ? error.message : String(error)}`);
        console.log('');
      }
    }
    
    // 尝试创建一条简单的积分规则测试数据
    console.log('🧪 尝试创建测试积分规则...');
    try {
      const testRule = {
        name: '测试规则',
        type: 'test',
        points: 10,
        conditions: { test: true },
        is_active: true,
        description: '这是一个测试规则'
      };
      
      const result = await pb.collection('points_rules').create(testRule);
      console.log('✅ 测试规则创建成功:', result.id);
      
      // 删除测试数据
      await pb.collection('points_rules').delete(result.id);
      console.log('🗑️ 测试数据已清理');
      
    } catch (error) {
      console.log('❌ 创建测试规则失败:', error instanceof Error ? error.message : String(error));
    }
    
  } catch (error) {
    console.error('❌ 错误:', error instanceof Error ? error.message : String(error));
  }
}

if (import.meta.main) {
  checkPointsData();
} 