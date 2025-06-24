import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function authenticate() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功');
  } catch (error) {
    console.error('❌ 认证失败:', getErrorMessage(error));
    throw error;
  }
}

async function fixPointsCollections() {
  try {
    await authenticate();
    
    // 删除有问题的集合
    const collectionsToFix = ['points_rules', 'points_exchanges', 'points_records'];
    
    for (const collName of collectionsToFix) {
      try {
        await pb.collections.delete(collName);
        console.log(`🗑️ 删除有问题的集合: ${collName}`);
      } catch (error) {
        console.log(`⚠️ 删除集合 ${collName} 失败:`, getErrorMessage(error));
      }
    }
    
    // 重新创建积分规则集合
    console.log('\n📝 重新创建积分规则集合...');
    const pointsRulesSchema = {
      name: 'points_rules',
      type: 'base',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['register', 'login', 'purchase', 'review', 'share', 'invite', 'other']
        },
        {
          name: 'points',
          type: 'number',
          required: true
        },
        {
          name: 'conditions',
          type: 'json',
          required: false
        },
        {
          name: 'daily_limit',
          type: 'number',
          required: false
        },
        {
          name: 'total_limit',
          type: 'number',
          required: false
        },
        {
          name: 'is_active',
          type: 'bool',
          required: false
        },
        {
          name: 'description',
          type: 'text',
          required: false
        }
      ]
    };
    
    await pb.collections.create(pointsRulesSchema);
    console.log('✅ points_rules 集合创建成功');
    
    // 重新创建积分兑换集合
    console.log('\n📝 重新创建积分兑换集合...');
    const pointsExchangesSchema = {
      name: 'points_exchanges',
      type: 'base',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'points_required',
          type: 'number',
          required: true
        },
        {
          name: 'exchange_type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['coupon', 'balance', 'product', 'privilege', 'other']
        },
        {
          name: 'exchange_value',
          type: 'json',
          required: false
        },
        {
          name: 'stock',
          type: 'number',
          required: false
        },
        {
          name: 'used_count',
          type: 'number',
          required: false
        },
        {
          name: 'per_user_limit',
          type: 'number',
          required: false
        },
        {
          name: 'status',
          type: 'select',
          required: false,
          maxSelect: 1,
          values: ['active', 'inactive', 'sold_out']
        },
        {
          name: 'description',
          type: 'text',
          required: false
        }
      ]
    };
    
    await pb.collections.create(pointsExchangesSchema);
    console.log('✅ points_exchanges 集合创建成功');
    
    // 重新创建积分记录集合
    console.log('\n📝 重新创建积分记录集合...');
    const pointsRecordsSchema = {
      name: 'points_records',
      type: 'base',
      fields: [
        {
          name: 'user_id',
          type: 'text',
          required: true
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['earn', 'spend', 'expire', 'adjust']
        },
        {
          name: 'points',
          type: 'number',
          required: true
        },
        {
          name: 'balance_before',
          type: 'number',
          required: false
        },
        {
          name: 'balance_after',
          type: 'number',
          required: false
        },
        {
          name: 'source',
          type: 'text',
          required: false
        },
        {
          name: 'source_id',
          type: 'text',
          required: false
        },
        {
          name: 'description',
          type: 'text',
          required: false
        },
        {
          name: 'expire_date',
          type: 'date',
          required: false
        }
      ]
    };
    
    await pb.collections.create(pointsRecordsSchema);
    console.log('✅ points_records 集合创建成功');
    
    console.log('\n✅ 积分相关集合修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  fixPointsCollections();
} 