import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function checkCouponUsage() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功\n');

    try {
      const collection = await pb.collections.getOne('coupon_usage');
      console.log('📋 coupon_usage 集合信息:');
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
      const records = await pb.collection('coupon_usage').getFullList();
      console.log(`  现有记录数: ${records.length}`);
      
      if (records.length > 0) {
        console.log('  第一条记录:', JSON.stringify(records[0], null, 2));
      }
      
    } catch (error) {
      console.log('❌ coupon_usage 集合错误:', getErrorMessage(error));
    }
    
    // 尝试创建一条简单的测试数据
    console.log('\n🧪 尝试创建测试优惠券使用记录...');
    try {
      const testUsage = {
        coupon_id: 'test_coupon_001',
        user_id: 'test_user_001',
        order_id: 'test_order_001',
        discount_amount: 10.00,
        use_time: '2024-12-11T12:00:00Z',
        status: 'used'
      };
      
      const result = await pb.collection('coupon_usage').create(testUsage);
      console.log('✅ 测试记录创建成功:', result.id);
      
      // 删除测试数据
      await pb.collection('coupon_usage').delete(result.id);
      console.log('🗑️ 测试数据已清理');
      
    } catch (error) {
      console.log('❌ 创建测试记录失败:', getErrorMessage(error));
    }
    
  } catch (error) {
    console.error('❌ 错误:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  checkCouponUsage();
} 