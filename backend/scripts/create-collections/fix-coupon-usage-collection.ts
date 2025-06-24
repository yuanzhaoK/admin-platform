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

async function fixCouponUsageCollection() {
  try {
    await authenticate();
    
    // 删除有问题的集合
    try {
      await pb.collections.delete('coupon_usage');
      console.log('🗑️ 删除有问题的集合: coupon_usage');
    } catch (error) {
      console.log('⚠️ 删除集合 coupon_usage 失败:', getErrorMessage(error));
    }
    
    // 重新创建优惠券使用记录集合
    console.log('\n📝 重新创建优惠券使用记录集合...');
    const couponUsageSchema = {
      name: 'coupon_usage',
      type: 'base',
      fields: [
        {
          name: 'coupon_id',
          type: 'text',
          required: true
        },
        {
          name: 'user_id',
          type: 'text',
          required: true
        },
        {
          name: 'order_id',
          type: 'text',
          required: false
        },
        {
          name: 'discount_amount',
          type: 'number',
          required: true
        },
        {
          name: 'original_amount',
          type: 'number',
          required: false
        },
        {
          name: 'final_amount',
          type: 'number',
          required: false
        },
        {
          name: 'use_time',
          type: 'date',
          required: true
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['used', 'refunded', 'expired', 'cancelled']
        },
        {
          name: 'refund_time',
          type: 'date',
          required: false
        },
        {
          name: 'refund_reason',
          type: 'text',
          required: false
        },
        {
          name: 'ip_address',
          type: 'text',
          required: false
        },
        {
          name: 'user_agent',
          type: 'text',
          required: false
        },
        {
          name: 'notes',
          type: 'text',
          required: false
        }
      ]
    };
    
    await pb.collections.create(couponUsageSchema);
    console.log('✅ coupon_usage 集合创建成功');
    
    console.log('\n✅ 优惠券使用记录集合修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  fixCouponUsageCollection();
} 