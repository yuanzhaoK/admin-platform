import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

async function checkCollections() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功');
    
    const collections = await pb.collections.getFullList();
    console.log('\n📋 当前集合列表:');
    collections.forEach(col => {
      console.log(`  ✓ ${col.name} (${col.id})`);
    });
    
    // 检查营销管理模块的集合
    const marketingCollections = [
      'members', 'member_levels', 'coupons', 'coupon_usage',
      'points_rules', 'points_exchanges', 'points_records',
      'recommendations', 'recommendation_rules',
      'advertisements', 'trending_items', 'trending_rules'
    ];
    
    console.log('\n🔍 营销管理模块集合检查:');
    for (const collectionName of marketingCollections) {
      const exists = collections.some(col => col.name === collectionName);
      console.log(`  ${exists ? '✅' : '❌'} ${collectionName}`);
    }
    
  } catch (error) {
    console.error('❌ 错误:', error instanceof Error ? error.message : String(error));
  }
}

if (import.meta.main) {
  checkCollections();
} 