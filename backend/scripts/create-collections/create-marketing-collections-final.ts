/**
 * 营销管理模块 - PocketBase 集合创建脚本（最终版）
 * 包含：会员管理、优惠券、积分、推荐、广告、热门等模块
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

// 错误处理辅助函数
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// 管理员认证
async function authenticate() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功');
  } catch (error) {
    console.error('❌ 认证失败:', getErrorMessage(error));
    throw error;
  }
}

// 删除集合（如果存在）
async function deleteCollectionIfExists(collectionName: string) {
  try {
    const collections = await pb.collections.getFullList();
    const existingCollection = collections.find(c => c.name === collectionName);
    if (existingCollection) {
      await pb.collections.delete(existingCollection.id);
      console.log(`🗑️ 删除已存在的 ${collectionName} 集合`);
    }
  } catch (error) {
    console.log(`⚠️ 删除 ${collectionName} 集合失败 (可能不存在):`, getErrorMessage(error));
  }
}

// 创建会员等级集合
async function createMemberLevelsCollection() {
  const collection = {
    name: 'member_levels',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'discount_rate',
        type: 'number',
        required: true,
        options: { min: 0, max: 1 }
      },
      {
        name: 'points_required',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'benefits',
        type: 'json',
        required: false
      },
      {
        name: 'sort_order',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'color',
        type: 'text',
        required: false,
        options: { max: 7 }
      },
      {
        name: 'icon',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ member_levels 集合创建成功');
  } catch (error) {
    console.error('❌ member_levels 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建会员集合
async function createMembersCollection() {
  const collection = {
    name: 'members',
    type: 'base',
    fields: [
      {
        name: 'username',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'email',
        type: 'email',
        required: true
      },
      {
        name: 'phone',
        type: 'text',
        required: false,
        options: { max: 20 }
      },
      {
        name: 'avatar',
        type: 'file',
        required: false,
        options: { maxSelect: 1, maxSize: 5242880 }
      },
      {
        name: 'real_name',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'gender',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['male', 'female', 'other']
      },
      {
        name: 'birthday',
        type: 'date',
        required: false
      },
      {
        name: 'level_id',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'points',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'balance',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'total_orders',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'total_amount',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'banned']
      },
      {
        name: 'register_time',
        type: 'date',
        required: true
      },
      {
        name: 'last_login_time',
        type: 'date',
        required: false
      },
      {
        name: 'tags',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ members 集合创建成功');
  } catch (error) {
    console.log(error);
    console.error('❌ members 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建优惠券集合
async function createCouponsCollection() {
  const collection = {
    name: 'coupons',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'code',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['general', 'new_user', 'member_exclusive', 'birthday', 'event']
      },
      {
        name: 'discount_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['percentage', 'fixed', 'free_shipping']
      },
      {
        name: 'discount_value',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'min_amount',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'max_discount',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_quantity',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'used_quantity',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'per_user_limit',
        type: 'number',
        required: false,
        options: { min: 1 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'expired', 'used_up']
      },
      {
        name: 'start_time',
        type: 'date',
        required: true
      },
      {
        name: 'end_time',
        type: 'date',
        required: true
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'terms',
        type: 'text',
        required: false,
        options: { max: 1000 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ coupons 集合创建成功');
  } catch (error) {
    console.error('❌ coupons 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建优惠券使用记录集合
async function createCouponUsageCollection() {
  const collection = {
    name: 'coupon_usage',
    type: 'base',
    fields: [
      {
        name: 'coupon_id',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'member_id',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'order_id',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'discount_amount',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'used_time',
        type: 'date',
        required: true
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['used', 'refunded']
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ coupon_usage 集合创建成功');
  } catch (error) {
    console.error('❌ coupon_usage 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建积分规则集合
async function createPointsRulesCollection() {
  const collection = {
    name: 'points_rules',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['register', 'login', 'order', 'review', 'share', 'referral']
      },
      {
        name: 'points',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'condition',
        type: 'json',
        required: false
      },
      {
        name: 'daily_limit',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_limit',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive']
      },
      {
        name: 'start_time',
        type: 'date',
        required: false
      },
      {
        name: 'end_time',
        type: 'date',
        required: false
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ points_rules 集合创建成功');
  } catch (error) {
    console.error('❌ points_rules 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建积分兑换集合
async function createPointsExchangesCollection() {
  const collection = {
    name: 'points_exchanges',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['coupon', 'balance', 'product', 'privilege']
      },
      {
        name: 'points_required',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'value',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'stock',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'used_stock',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'per_user_limit',
        type: 'number',
        required: false,
        options: { min: 1 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'sold_out']
      },
      {
        name: 'start_time',
        type: 'date',
        required: false
      },
      {
        name: 'end_time',
        type: 'date',
        required: false
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'image',
        type: 'file',
        required: false,
        options: { maxSelect: 1, maxSize: 5242880 }
      },
      {
        name: 'sort_order',
        type: 'number',
        required: true,
        options: { min: 0 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ points_exchanges 集合创建成功');
  } catch (error) {
    console.error('❌ points_exchanges 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建积分记录集合
async function createPointsRecordsCollection() {
  const collection = {
    name: 'points_records',
    type: 'base',
    fields: [
      {
        name: 'member_id',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['earn', 'spend', 'expire', 'refund']
      },
      {
        name: 'points',
        type: 'number',
        required: true
      },
      {
        name: 'balance',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'source',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'reference_id',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'expire_time',
        type: 'date',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ points_records 集合创建成功');
  } catch (error) {
    console.error('❌ points_records 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建商品推荐集合
async function createRecommendationsCollection() {
  const collection = {
    name: 'recommendations',
    type: 'base',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['hot', 'new', 'editor', 'category']
      },
      {
        name: 'position',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'product_ids',
        type: 'json',
        required: true
      },
      {
        name: 'priority',
        type: 'number',
        required: true,
        options: { min: 1, max: 100 }
      },
      {
        name: 'views',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'clicks',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'conversions',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'scheduled']
      },
      {
        name: 'start_time',
        type: 'date',
        required: false
      },
      {
        name: 'end_time',
        type: 'date',
        required: false
      },
      {
        name: 'target_audience',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ recommendations 集合创建成功');
  } catch (error) {
    console.error('❌ recommendations 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建推荐规则集合
async function createRecommendationRulesCollection() {
  const collection = {
    name: 'recommendation_rules',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['sales', 'rating', 'views', 'new', 'category']
      },
      {
        name: 'condition',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'value',
        type: 'number',
        required: true
      },
      {
        name: 'limit',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'weight',
        type: 'number',
        required: true,
        options: { min: 0, max: 1 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive']
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ recommendation_rules 集合创建成功');
  } catch (error) {
    console.error('❌ recommendation_rules 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建广告集合
async function createAdvertisementsCollection() {
  const collection = {
    name: 'advertisements',
    type: 'base',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['banner', 'popup', 'sidebar', 'inline']
      },
      {
        name: 'position',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'image',
        type: 'file',
        required: false,
        options: { maxSelect: 1, maxSize: 10485760 }
      },
      {
        name: 'link',
        type: 'url',
        required: false
      },
      {
        name: 'content',
        type: 'text',
        required: false,
        options: { max: 1000 }
      },
      {
        name: 'priority',
        type: 'number',
        required: true,
        options: { min: 1, max: 100 }
      },
      {
        name: 'impressions',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'clicks',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'budget',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'cost',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'scheduled']
      },
      {
        name: 'start_time',
        type: 'date',
        required: false
      },
      {
        name: 'end_time',
        type: 'date',
        required: false
      },
      {
        name: 'target_audience',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ advertisements 集合创建成功');
  } catch (error) {
    console.error('❌ advertisements 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建热门商品集合
async function createTrendingItemsCollection() {
  const collection = {
    name: 'trending_items',
    type: 'base',
    fields: [
      {
        name: 'product_id',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'product_name',
        type: 'text',
        required: true,
        options: { max: 200 }
      },
      {
        name: 'category',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['manual', 'auto']
      },
      {
        name: 'source',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['sales', 'views', 'search', 'manual']
      },
      {
        name: 'rank',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'score',
        type: 'number',
        required: true,
        options: { min: 0, max: 100 }
      },
      {
        name: 'views',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'clicks',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'sales',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'trend',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['up', 'down', 'stable']
      },
      {
        name: 'trend_change',
        type: 'number',
        required: true
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive']
      },
      {
        name: 'start_date',
        type: 'date',
        required: false
      },
      {
        name: 'end_date',
        type: 'date',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ trending_items 集合创建成功');
  } catch (error) {
    console.error('❌ trending_items 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 创建热门规则集合
async function createTrendingRulesCollection() {
  const collection = {
    name: 'trending_rules',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['sales', 'views', 'search', 'rating']
      },
      {
        name: 'period',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['daily', 'weekly', 'monthly']
      },
      {
        name: 'limit',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'weight',
        type: 'number',
        required: true,
        options: { min: 0, max: 1 }
      },
      {
        name: 'conditions',
        type: 'json',
        required: false
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive']
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ trending_rules 集合创建成功');
  } catch (error) {
    console.error('❌ trending_rules 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// 更新关系字段
async function updateRelationFields() {
  console.log('🔄 更新关系字段...');
  
  try {
    // 获取集合信息
    const collections = await pb.collections.getFullList();
    const memberLevelsId = collections.find(c => c.name === 'member_levels')?.id;
    const membersId = collections.find(c => c.name === 'members')?.id;
    const couponsId = collections.find(c => c.name === 'coupons')?.id;

    if (memberLevelsId && membersId) {
      // 更新members集合中的level_id关系
      const membersCollection = collections.find(c => c.name === 'members');
      if (membersCollection) {
        const schema = membersCollection.fields;
        const levelField = schema.find(f => f.name === 'level_id');
        if (levelField) {
          levelField.options.collectionId = memberLevelsId;
          await pb.collections.update(membersCollection.id, { fields: schema });
          console.log('✅ 更新 members.level_id 关系字段');
        }
      }

      // 更新coupon_usage集合中的关系字段
      const couponUsageCollection = collections.find(c => c.name === 'coupon_usage');
      if (couponUsageCollection && couponsId) {
        const schema = couponUsageCollection.fields;
        
        const couponField = schema.find(f => f.name === 'coupon_id');
        if (couponField) {
          couponField.options.collectionId = couponsId;
        }
        
        const memberField = schema.find(f => f.name === 'member_id');
        if (memberField) {
          memberField.options.collectionId = membersId;
        }
        
        await pb.collections.update(couponUsageCollection.id, { fields: schema });
        console.log('✅ 更新 coupon_usage 关系字段');
      }

      // 更新points_records集合中的member_id关系
      const pointsRecordsCollection = collections.find(c => c.name === 'points_records');
      if (pointsRecordsCollection) {
        const schema = pointsRecordsCollection.fields;
        const memberField = schema.find(f => f.name === 'member_id');
        if (memberField) {
          memberField.options.collectionId = membersId;
          await pb.collections.update(pointsRecordsCollection.id, { fields: schema });
          console.log('✅ 更新 points_records.member_id 关系字段');
        }
      }
    }
  } catch (error) {
    console.error('❌ 更新关系字段失败:', getErrorMessage(error));
  }
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始创建营销管理模块集合...\n');
    
    await authenticate();
    
    // 先删除所有营销管理相关的集合
    console.log('\n🗑️ 清理所有营销管理相关集合...');
    const allMarketingCollections = [
      'member_levels',
      'members',
      'coupons',
      'coupon_usage',
      'points_rules',
      'points_exchanges',
      'points_records',
      'recommendations',
      'recommendation_rules',
      'advertisements',
      'trending_items',
      'trending_rules'
    ];
    
    for (const collectionName of allMarketingCollections) {
      await deleteCollectionIfExists(collectionName);
    }
    
    console.log('\n📝 创建基础集合...');
    // await createMemberLevelsCollection();
    await createMembersCollection();
    await createCouponsCollection();
    await createCouponUsageCollection();
    
    console.log('\n🎯 创建积分相关集合...');
    await createPointsRulesCollection();
    await createPointsExchangesCollection();
    await createPointsRecordsCollection();
    
    console.log('\n📈 创建推荐相关集合...');
    await createRecommendationsCollection();
    await createRecommendationRulesCollection();
    
    console.log('\n📱 创建广告相关集合...');
    await createAdvertisementsCollection();
    
    console.log('\n🔥 创建热门相关集合...');
    await createTrendingItemsCollection();
    await createTrendingRulesCollection();
    
    console.log('\n🔗 更新关系字段...');
    await updateRelationFields();
    
    console.log('\n✅ 营销管理模块集合创建完成！');
    console.log('\n📊 已创建的集合:');
    console.log('   - member_levels (会员等级)');
    console.log('   - members (会员信息)');
    console.log('   - coupons (优惠券)');
    console.log('   - coupon_usage (优惠券使用记录)');
    console.log('   - points_rules (积分规则)');
    console.log('   - points_exchanges (积分兑换)');
    console.log('   - points_records (积分记录)');
    console.log('   - recommendations (商品推荐)');
    console.log('   - recommendation_rules (推荐规则)');
    console.log('   - advertisements (广告)');
    console.log('   - trending_items (热门商品)');
    console.log('   - trending_rules (热门规则)');
    
  } catch (error) {
    console.error('\n❌ 营销管理模块集合创建失败:', getErrorMessage(error));
    Deno.exit(1);
  }
}

// 执行主函数
if (import.meta.main) {
  main();
} 