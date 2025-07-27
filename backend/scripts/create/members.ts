import { authenticate, deleteCollectionIfExists, getErrorMessage, pb } from '../helper.ts';

// ========================= 会员等级集合 =========================
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
        name: 'display_name',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'slogan',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'icon',
        type: 'file',
        required: false,
        options: { maxSelect: 1, maxSize: 2097152 }
      },
      {
        name: 'color',
        type: 'text',
        required: true,
        options: { max: 20 }
      },
      {
        name: 'background_color',
        type: 'text',
        required: false,
        options: { max: 20 }
      },
      {
        name: 'badge_image',
        type: 'file',
        required: false,
        options: { maxSelect: 1, maxSize: 2097152 }
      },
      {
        name: 'level',
        type: 'number',
        required: true,
        options: { min: 1, max: 100 }
      },
      {
        name: 'sort_order',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      },
      {
        name: 'is_default',
        type: 'bool',
        required: true
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
        name: 'discount_rate',
        type: 'number',
        required: true,
        options: { min: 0, max: 1 }
      },
      {
        name: 'points_rate',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'free_shipping_threshold',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'upgrade_conditions',
        type: 'json',
        required: false
      },
      {
        name: 'maintenance_rule',
        type: 'json',
        required: false
      },
      {
        name: 'member_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'average_order_value',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_revenue',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'max_validity_days',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'allow_downgrade',
        type: 'bool',
        required: false
      },
      {
        name: 'auto_upgrade',
        type: 'bool',
        required: false
      },
      {
        name: 'custom_benefits',
        type: 'json',
        required: false
      },
      {
        name: 'business_rules',
        type: 'json',
        required: false
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
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

// ========================= 会员信息集合 =========================
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
        name: 'password_hash',
        type: 'text',
        required: false,
        options: { max: 255 }
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
        name: 'nickname',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'gender',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['male', 'female', 'unknown']
      },
      {
        name: 'birthday',
        type: 'date',
        required: false
      },
      {
        name: 'bio',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'level_id',
        type: 'relation',
        required: true,
        options: { 
          collectionId: 'member_levels',
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: 'points',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'frozen_points',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_earned_points',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_spent_points',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'balance',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'frozen_balance',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'banned', 'pending']
      },
      {
        name: 'is_verified',
        type: 'bool',
        required: false
      },
      {
        name: 'verification',
        type: 'json',
        required: false
      },
      {
        name: 'total_orders',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_amount',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_savings',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'average_order_value',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'favorite_categories',
        type: 'json',
        required: false
      },
      {
        name: 'loyalty_score',
        type: 'number',
        required: false,
        options: { min: 0, max: 100 }
      },
      {
        name: 'engagement_score',
        type: 'number',
        required: false,
        options: { min: 0, max: 100 }
      },
      {
        name: 'last_order_date',
        type: 'date',
        required: false
      },
      {
        name: 'membership_duration',
        type: 'number',
        required: false,
        options: { min: 0 }
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
        name: 'last_active_time',
        type: 'date',
        required: false
      },
      {
        name: 'level_upgrade_time',
        type: 'date',
        required: false
      },
      {
        name: 'wechat_openid',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'wechat_unionid',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'third_party_bindings',
        type: 'json',
        required: false
      },
      {
        name: 'groups',
        type: 'json',
        required: false
      },
      {
        name: 'segment',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'risk_level',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['low', 'medium', 'high']
      },
      {
        name: 'trust_score',
        type: 'number',
        required: false,
        options: { min: 0, max: 100 }
      },
      {
        name: 'blacklist_reason',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'preferences',
        type: 'json',
        required: false
      },
      {
        name: 'custom_fields',
        type: 'json',
        required: false
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ members 集合创建成功');
  } catch (error) {
    console.error('❌ members 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 地区信息集合 =========================
async function createRegionsCollection() {
  const collection = {
    name: 'regions',
    type: 'base',
    fields: [
      {
        name: 'code',
        type: 'text',
        required: true,
        options: { max: 20 }
      },
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'full_name',
        type: 'text',
        required: true,
        options: { max: 200 }
      },
      {
        name: 'short_name',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'english_name',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'level',
        type: 'number',
        required: true,
        options: { min: 1, max: 4 }
      },
      {
        name: 'parent_id',
        type: 'relation',
        required: false,
        options: { 
          collectionId: 'regions',
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: 'parent_path',
        type: 'text',
        required: true,
        options: { max: 200 }
      },
      {
        name: 'longitude',
        type: 'number',
        required: false
      },
      {
        name: 'latitude',
        type: 'number',
        required: false
      },
      {
        name: 'boundary_data',
        type: 'json',
        required: false
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      },
      {
        name: 'is_hot',
        type: 'bool',
        required: false
      },
      {
        name: 'sort_order',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ regions 集合创建成功');
  } catch (error) {
    console.error('❌ regions 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 收货地址集合 =========================
async function createAddressesCollection() {
  const collection = {
    name: 'addresses',
    type: 'base',
    fields: [
      {
        name: 'user_id',
        type: 'relation',
        required: true,
        options: { 
          collectionId: 'members',
          cascadeDelete: true,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'phone',
        type: 'text',
        required: true,
        options: { max: 20 }
      },
      {
        name: 'email',
        type: 'email',
        required: false
      },
      {
        name: 'province',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'city',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'district',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'street',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'address',
        type: 'text',
        required: true,
        options: { max: 200 }
      },
      {
        name: 'detail_address',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'postal_code',
        type: 'text',
        required: false,
        options: { max: 10 }
      },
      {
        name: 'longitude',
        type: 'number',
        required: false
      },
      {
        name: 'latitude',
        type: 'number',
        required: false
      },
      {
        name: 'location_accuracy',
        type: 'number',
        required: false
      },
      {
        name: 'tag',
        type: 'text',
        required: false,
        options: { max: 20 }
      },
      {
        name: 'tag_color',
        type: 'text',
        required: false,
        options: { max: 20 }
      },
      {
        name: 'is_default',
        type: 'bool',
        required: true
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      },
      {
        name: 'is_verified',
        type: 'bool',
        required: false
      },
      {
        name: 'verification_status',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['pending', 'verified', 'failed']
      },
      {
        name: 'verification_method',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['auto', 'manual', 'third_party']
      },
      {
        name: 'verification_time',
        type: 'date',
        required: false
      },
      {
        name: 'verification_details',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'usage_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'last_used_at',
        type: 'date',
        required: false
      },
      {
        name: 'order_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'source',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['manual', 'location', 'import', 'third_party']
      },
      {
        name: 'source_details',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'custom_fields',
        type: 'json',
        required: false
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ addresses 集合创建成功');
  } catch (error) {
    console.error('❌ addresses 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 会员标签集合 =========================
async function createMemberTagsCollection() {
  const collection = {
    name: 'member_tags',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'display_name',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['system', 'custom', 'behavior', 'preference', 'demographic']
      },
      {
        name: 'category',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'subcategory',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'color',
        type: 'text',
        required: true,
        options: { max: 20 }
      },
      {
        name: 'background_color',
        type: 'text',
        required: false,
        options: { max: 20 }
      },
      {
        name: 'icon',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'priority',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'is_system',
        type: 'bool',
        required: true
      },
      {
        name: 'is_auto_assigned',
        type: 'bool',
        required: false
      },
      {
        name: 'is_visible',
        type: 'bool',
        required: false
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      },
      {
        name: 'auto_rules',
        type: 'json',
        required: false
      },
      {
        name: 'member_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'usage_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'business_value',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'conversion_rate',
        type: 'number',
        required: false,
        options: { min: 0, max: 100 }
      },
      {
        name: 'average_order_value',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'validity_period',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'last_updated',
        type: 'date',
        required: false
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      },
      {
        name: 'custom_properties',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ member_tags 集合创建成功');
  } catch (error) {
    console.error('❌ member_tags 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 会员标签关联集合 =========================
async function createMemberTagRelationsCollection() {
  const collection = {
    name: 'member_tag_relations',
    type: 'base',
    fields: [
      {
        name: 'member_id',
        type: 'relation',
        required: true,
        options: { 
          collectionId: 'members',
          cascadeDelete: true,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: 'tag_id',
        type: 'relation',
        required: true,
        options: { 
          collectionId: 'member_tags',
          cascadeDelete: true,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: 'assigned_by',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['system', 'admin', 'api', 'import']
      },
      {
        name: 'assigned_by_user_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'assigned_reason',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'assigned_source',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'assigned_at',
        type: 'date',
        required: true
      },
      {
        name: 'expires_at',
        type: 'date',
        required: false
      },
      {
        name: 'last_updated',
        type: 'date',
        required: false
      },
      {
        name: 'value',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'properties',
        type: 'json',
        required: false
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      },
      {
        name: 'confidence',
        type: 'number',
        required: false,
        options: { min: 0, max: 1 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ member_tag_relations 集合创建成功');
  } catch (error) {
    console.error('❌ member_tag_relations 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 积分规则集合 =========================
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
        name: 'display_name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: [
          'earned_registration', 'earned_login', 'earned_order', 'earned_review',
          'earned_referral', 'earned_activity', 'earned_checkin', 'earned_share', 'earned_admin'
        ]
      },
      {
        name: 'category',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['basic', 'promotion', 'special', 'admin']
      },
      {
        name: 'points',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'points_max',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'conditions',
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
        name: 'weekly_limit',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'monthly_limit',
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
        name: 'user_daily_limit',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'user_total_limit',
        type: 'number',
        required: false,
        options: { min: 0 }
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
        name: 'valid_days',
        type: 'json',
        required: false
      },
      {
        name: 'valid_hours',
        type: 'json',
        required: false
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      },
      {
        name: 'priority',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'weight',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'formula',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'multiplier',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'exclude_users',
        type: 'json',
        required: false
      },
      {
        name: 'include_users',
        type: 'json',
        required: false
      },
      {
        name: 'usage_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_points_granted',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'last_used_at',
        type: 'date',
        required: false
      },
      {
        name: 'custom_config',
        type: 'json',
        required: false
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
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

// ========================= 积分记录集合 =========================
async function createPointsRecordsCollection() {
  const collection = {
    name: 'points_records',
    type: 'base',
    fields: [
      {
        name: 'user_id',
        type: 'relation',
        required: true,
        options: { 
          collectionId: 'members',
          cascadeDelete: true,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: 'username',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: [
          'earned_registration', 'earned_login', 'earned_order', 'earned_review',
          'earned_referral', 'earned_activity', 'earned_checkin', 'earned_share', 'earned_admin',
          'spent_exchange', 'spent_order', 'spent_deduction',
          'expired', 'frozen', 'unfrozen', 'admin_adjust'
        ]
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
        name: 'reason',
        type: 'text',
        required: true,
        options: { max: 255 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'order_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'product_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'rule_id',
        type: 'relation',
        required: false,
        options: { 
          collectionId: 'points_rules',
          cascadeDelete: false,
          maxSelect: 1
        }
      },
      {
        name: 'exchange_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'related_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'earned_at',
        type: 'date',
        required: false
      },
      {
        name: 'spent_at',
        type: 'date',
        required: false
      },
      {
        name: 'expired_at',
        type: 'date',
        required: false
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'expired', 'frozen', 'cancelled']
      },
      {
        name: 'is_reversible',
        type: 'bool',
        required: false
      },
      {
        name: 'source',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['system', 'manual', 'import', 'api']
      },
      {
        name: 'operator_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'operator_name',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'metadata',
        type: 'json',
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
    console.log('✅ points_records 集合创建成功');
  } catch (error) {
    console.error('❌ points_records 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 积分兑换商品集合 =========================
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
        name: 'display_name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 1000 }
      },
      {
        name: 'subtitle',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'image',
        type: 'file',
        required: false,
        options: { maxSelect: 1, maxSize: 5242880 }
      },
      {
        name: 'images',
        type: 'file',
        required: false,
        options: { maxSelect: 10, maxSize: 5242880 }
      },
      {
        name: 'category',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'tags',
        type: 'json',
        required: false
      },
      {
        name: 'points_required',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'original_price',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'exchange_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['balance', 'coupon', 'product', 'privilege', 'discount']
      },
      {
        name: 'reward_value',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'reward_unit',
        type: 'text',
        required: false,
        options: { max: 20 }
      },
      {
        name: 'reward_product_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'reward_coupon_id',
        type: 'text',
        required: false,
        options: { max: 15 }
      },
      {
        name: 'reward_config',
        type: 'json',
        required: false
      },
      {
        name: 'stock',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'unlimited_stock',
        type: 'bool',
        required: false
      },
      {
        name: 'virtual_stock',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'daily_stock',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'user_daily_limit',
        type: 'number',
        required: false,
        options: { min: 1 }
      },
      {
        name: 'user_total_limit',
        type: 'number',
        required: false,
        options: { min: 1 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'out_of_stock', 'expired']
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
        name: 'conditions',
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
        name: 'is_hot',
        type: 'bool',
        required: false
      },
      {
        name: 'is_new',
        type: 'bool',
        required: false
      },
      {
        name: 'is_recommended',
        type: 'bool',
        required: false
      },
      {
        name: 'used_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'total_points_spent',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'conversion_rate',
        type: 'number',
        required: false,
        options: { min: 0, max: 100 }
      },
      {
        name: 'rating',
        type: 'number',
        required: false,
        options: { min: 0, max: 5 }
      },
      {
        name: 'review_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'custom_config',
        type: 'json',
        required: false
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
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

// ========================= 积分兑换记录集合 =========================
async function createPointsExchangeRecordsCollection() {
  const collection = {
    name: 'points_exchange_records',
    type: 'base',
    fields: [
      {
        name: 'user_id',
        type: 'relation',
        required: true,
        options: { 
          collectionId: 'members',
          cascadeDelete: true,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: 'username',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'exchange_id',
        type: 'relation',
        required: true,
        options: { 
          collectionId: 'points_exchanges',
          cascadeDelete: false,
          minSelect: 1,
          maxSelect: 1
        }
      },
      {
        name: 'points_cost',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'quantity',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'total_points_cost',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'reward_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['balance', 'coupon', 'product', 'privilege', 'discount']
      },
      {
        name: 'reward_value',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'reward_description',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['pending', 'processing', 'completed', 'cancelled', 'failed', 'refunded']
      },
      {
        name: 'processed_at',
        type: 'date',
        required: false
      },
      {
        name: 'processed_by',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'failure_reason',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'shipping_address',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'tracking_number',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'shipped_at',
        type: 'date',
        required: false
      },
      {
        name: 'delivered_at',
        type: 'date',
        required: false
      },
      {
        name: 'notes',
        type: 'text',
        required: false,
        options: { max: 1000 }
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ points_exchange_records 集合创建成功');
  } catch (error) {
    console.error('❌ points_exchange_records 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 插入测试数据 =========================
async function insertTestMemberLevels() {
  const testLevels = [
    {
      name: 'bronze',
      display_name: '青铜会员',
      description: '新手会员，享受基础服务',
      color: '#CD7F32',
      level: 1,
      sort_order: 1,
      is_active: true,
      is_default: true,
      points_required: 0,
      discount_rate: 0.95,
      points_rate: 1.0,
      free_shipping_threshold: 99,
      benefits: [
        { type: 'discount', name: '95折优惠', value: 0.95 },
        { type: 'points', name: '1倍积分', value: 1.0 }
      ],
      member_count: 1250,
      average_order_value: 128.50,
      total_revenue: 160625
    },
    {
      name: 'silver',
      display_name: '白银会员',
      description: '进阶会员，享受更多优惠',
      color: '#C0C0C0',
      level: 2,
      sort_order: 2,
      is_active: true,
      is_default: false,
      points_required: 1000,
      discount_rate: 0.92,
      points_rate: 1.2,
      free_shipping_threshold: 79,
      benefits: [
        { type: 'discount', name: '92折优惠', value: 0.92 },
        { type: 'points', name: '1.2倍积分', value: 1.2 },
        { type: 'freeShipping', name: '满79免邮', value: 79 }
      ],
      member_count: 850,
      average_order_value: 168.30,
      total_revenue: 143055
    },
    {
      name: 'gold',
      display_name: '黄金会员',
      description: '高级会员，享受专属特权',
      color: '#FFD700',
      level: 3,
      sort_order: 3,
      is_active: true,
      is_default: false,
      points_required: 5000,
      discount_rate: 0.88,
      points_rate: 1.5,
      free_shipping_threshold: 59,
      benefits: [
        { type: 'discount', name: '88折优惠', value: 0.88 },
        { type: 'points', name: '1.5倍积分', value: 1.5 },
        { type: 'freeShipping', name: '满59免邮', value: 59 },
        { type: 'privilege', name: '生日特权', value: 1 }
      ],
      member_count: 420,
      average_order_value: 225.80,
      total_revenue: 94836
    },
    {
      name: 'platinum',
      display_name: '铂金会员',
      description: '尊贵会员，享受VIP服务',
      color: '#E5E4E2',
      level: 4,
      sort_order: 4,
      is_active: true,
      is_default: false,
      points_required: 20000,
      discount_rate: 0.85,
      points_rate: 1.8,
      free_shipping_threshold: 39,
      benefits: [
        { type: 'discount', name: '85折优惠', value: 0.85 },
        { type: 'points', name: '1.8倍积分', value: 1.8 },
        { type: 'freeShipping', name: '满39免邮', value: 39 },
        { type: 'privilege', name: '专属客服', value: 1 },
        { type: 'service', name: '优先发货', value: 1 }
      ],
      member_count: 180,
      average_order_value: 345.60,
      total_revenue: 62208
    },
    {
      name: 'diamond',
      display_name: '钻石会员',
      description: '至尊会员，享受最高礼遇',
      color: '#B9F2FF',
      level: 5,
      sort_order: 5,
      is_active: true,
      is_default: false,
      points_required: 50000,
      discount_rate: 0.80,
      points_rate: 2.0,
      free_shipping_threshold: 0,
      benefits: [
        { type: 'discount', name: '8折优惠', value: 0.80 },
        { type: 'points', name: '2倍积分', value: 2.0 },
        { type: 'freeShipping', name: '全场免邮', value: 0 },
        { type: 'privilege', name: '专属客服', value: 1 },
        { type: 'service', name: '优先发货', value: 1 },
        { type: 'privilege', name: '专享商品', value: 1 }
      ],
      member_count: 65,
      average_order_value: 520.30,
      total_revenue: 33819.5
    }
  ];

  try {
    for (const level of testLevels) {
      await pb.collection('member_levels').create(level);
      console.log(`✅ 会员等级 "${level.display_name}" 创建成功`);
    }
    console.log('✅ 所有测试会员等级数据插入完成');
  } catch (error) {
    console.error('❌ 测试会员等级数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

async function insertTestMembers() {
  try {
    // 获取会员等级ID
    const levels = await pb.collection('member_levels').getFullList();
    const bronzeLevel = levels.find(l => l.name === 'bronze');
    
    const testMembers = [
      {
        username: 'zhang_san',
        email: 'zhangsan@example.com',
        phone: '13800138001',
        real_name: '张三',
        nickname: '小张',
        gender: 'male',
        birthday: '1990-05-15',
        level_id: bronzeLevel?.id,
        points: 1250,
        balance: 98.50,
        status: 'active',
        is_verified: true,
        total_orders: 8,
        total_amount: 1580.00,
        register_time: '2024-01-15T08:30:00.000Z',
        last_login_time: '2024-03-28T14:22:00.000Z',
        wechat_openid: 'wx_zhangsan_001',
        preferences: {
          language: 'zh-CN',
          notifications: {
            email: true,
            sms: true,
            promotions: false
          }
        },
        risk_level: 'low',
        trust_score: 85
      },
      {
        username: 'li_mei',
        email: 'limei@example.com', 
        phone: '13800138002',
        real_name: '李美',
        nickname: '美美',
        gender: 'female',
        birthday: '1992-08-22',
        level_id: bronzeLevel?.id,
        points: 2850,
        balance: 156.30,
        status: 'active',
        is_verified: true,
        total_orders: 15,
        total_amount: 2890.00,
        register_time: '2024-02-08T10:15:00.000Z',
        last_login_time: '2024-03-29T09:45:00.000Z',
        wechat_openid: 'wx_limei_002',
        preferences: {
          language: 'zh-CN',
          notifications: {
            email: false,
            sms: true,
            promotions: true
          }
        },
        risk_level: 'low',
        trust_score: 92
      },
      {
        username: 'wang_qiang',
        email: 'wangqiang@example.com',
        phone: '13800138003',
        real_name: '王强',
        nickname: '阿强',
        gender: 'male',
        birthday: '1988-03-10',
        level_id: bronzeLevel?.id,
        points: 680,
        balance: 25.80,
        status: 'active',
        is_verified: false,
        total_orders: 3,
        total_amount: 450.00,
        register_time: '2024-03-01T16:20:00.000Z',
        last_login_time: '2024-03-25T20:10:00.000Z',
        wechat_openid: 'wx_wangqiang_003',
        preferences: {
          language: 'zh-CN',
          notifications: {
            email: true,
            sms: false,
            promotions: false
          }
        },
        risk_level: 'low',
        trust_score: 75
      }
    ];

    for (const member of testMembers) {
      await pb.collection('members').create(member);
      console.log(`✅ 会员 "${member.nickname}" 创建成功`);
    }
    console.log('✅ 所有测试会员数据插入完成');
  } catch (error) {
    console.error('❌ 测试会员数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

async function insertTestPointsRules() {
  const testRules = [
    {
      name: 'registration_reward',
      display_name: '注册奖励',
      description: '新用户注册完成后获得积分奖励',
      type: 'earned_registration',
      category: 'basic',
      points: 100,
      is_active: true,
      priority: 10,
      usage_count: 1250,
      total_points_granted: 125000
    },
    {
      name: 'daily_checkin',
      display_name: '每日签到',
      description: '每日签到获得积分，连续签到有额外奖励',
      type: 'earned_checkin',
      category: 'basic',
      points: 5,
      points_max: 20,
      conditions: [
        { field: 'consecutive_days', operator: 'gte', value: 1, description: '连续签到天数' }
      ],
      user_daily_limit: 1,
      is_active: true,
      priority: 8,
      usage_count: 8500,
      total_points_granted: 42500
    },
    {
      name: 'order_completion',
      display_name: '订单完成奖励',
      description: '订单完成后按消费金额1%返积分',
      type: 'earned_order',
      category: 'basic',
      points: 1,
      formula: 'orderAmount * 0.01',
      conditions: [
        { field: 'orderAmount', operator: 'gte', value: 50, description: '订单金额不少于50元' }
      ],
      is_active: true,
      priority: 9,
      usage_count: 2850,
      total_points_granted: 58500
    },
    {
      name: 'referral_reward',
      display_name: '邀请好友奖励',
      description: '成功邀请好友注册并完成首单后获得奖励',
      type: 'earned_referral',
      category: 'promotion',
      points: 500,
      conditions: [
        { field: 'inviteeFirstOrder', operator: 'eq', value: true, description: '被邀请人完成首单' }
      ],
      is_active: true,
      priority: 7,
      usage_count: 180,
      total_points_granted: 90000
    },
    {
      name: 'review_reward',
      display_name: '商品评价奖励',
      description: '完成商品评价后获得积分奖励',
      type: 'earned_review',
      category: 'basic',
      points: 20,
      points_max: 50,
      conditions: [
        { field: 'reviewLength', operator: 'gte', value: 20, description: '评价内容不少于20字' }
      ],
      user_daily_limit: 5,
      is_active: true,
      priority: 6,
      usage_count: 1200,
      total_points_granted: 36000
    }
  ];

  try {
    for (const rule of testRules) {
      await pb.collection('points_rules').create(rule);
      console.log(`✅ 积分规则 "${rule.display_name}" 创建成功`);
    }
    console.log('✅ 所有测试积分规则数据插入完成');
  } catch (error) {
    console.error('❌ 测试积分规则数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

async function insertTestPointsExchanges() {
  const testExchanges = [
    {
      name: 'coupon_10',
      display_name: '10元优惠券',
      description: '全场通用10元优惠券，满100元可用',
      category: '优惠券',
      points_required: 1000,
      original_price: 10,
      exchange_type: 'coupon',
      reward_value: 10,
      reward_unit: '元',
      stock: 500,
      unlimited_stock: false,
      user_daily_limit: 1,
      user_total_limit: 5,
      status: 'active',
      sort_order: 1,
      is_hot: true,
      used_count: 125,
      total_points_spent: 125000,
      conversion_rate: 8.5
    },
    {
      name: 'coupon_50',
      display_name: '50元优惠券',
      description: '全场通用50元优惠券，满500元可用',
      category: '优惠券',
      points_required: 5000,
      original_price: 50,
      exchange_type: 'coupon',
      reward_value: 50,
      reward_unit: '元',
      stock: 200,
      unlimited_stock: false,
      user_daily_limit: 1,
      user_total_limit: 2,
      status: 'active',
      sort_order: 2,
      is_recommended: true,
      used_count: 38,
      total_points_spent: 190000,
      conversion_rate: 12.8
    },
    {
      name: 'balance_20',
      display_name: '20元余额',
      description: '账户余额充值20元，可直接用于购买商品',
      category: '余额充值',
      points_required: 2000,
      exchange_type: 'balance',
      reward_value: 20,
      reward_unit: '元',
      unlimited_stock: true,
      user_daily_limit: 3,
      status: 'active',
      sort_order: 3,
      used_count: 89,
      total_points_spent: 178000,
      conversion_rate: 15.2
    },
    {
      name: 'free_shipping',
      display_name: '免邮特权券',
      description: '单次订单免邮特权，无金额限制',
      category: '特权服务',
      points_required: 500,
      exchange_type: 'privilege', 
      reward_value: 1,
      reward_unit: '次',
      stock: 1000,
      unlimited_stock: false,
      user_daily_limit: 2,
      user_total_limit: 10,
      status: 'active',
      sort_order: 4,
      is_new: true,
      used_count: 245,
      total_points_spent: 122500,
      conversion_rate: 18.5
    },
    {
      name: 'product_mug',
      display_name: '品牌马克杯',
      description: '精美品牌马克杯，限量版纪念品',
      category: '实物商品',
      points_required: 3000,
      original_price: 35,
      exchange_type: 'product',
      reward_product_id: 'prod_mug_001',
      stock: 50,
      unlimited_stock: false,
      user_total_limit: 1,
      status: 'active',
      sort_order: 5,
      used_count: 12,
      total_points_spent: 36000,
      conversion_rate: 6.8
    }
  ];

  try {
    for (const exchange of testExchanges) {
      await pb.collection('points_exchanges').create(exchange);
      console.log(`✅ 积分兑换商品 "${exchange.display_name}" 创建成功`);
    }
    console.log('✅ 所有测试积分兑换商品数据插入完成');
  } catch (error) {
    console.error('❌ 测试积分兑换商品数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

async function insertTestRegions() {
  const testRegions = [
    {
      code: '110000',
      name: '北京市',
      full_name: '北京市',
      short_name: '京',
      english_name: 'Beijing',
      level: 1,
      parent_path: '110000',
      is_active: true,
      is_hot: true,
      sort_order: 1
    },
    {
      code: '110100',
      name: '北京市',
      full_name: '北京市北京市',
      level: 2,
      parent_path: '110000/110100',
      is_active: true,
      sort_order: 1
    },
    {
      code: '110101',
      name: '东城区',
      full_name: '北京市北京市东城区',
      level: 3,
      parent_path: '110000/110100/110101',
      is_active: true,
      sort_order: 1
    },
    {
      code: '110102',
      name: '西城区',
      full_name: '北京市北京市西城区',
      level: 3,
      parent_path: '110000/110100/110102',
      is_active: true,
      sort_order: 2
    },
    {
      code: '310000',
      name: '上海市',
      full_name: '上海市',
      short_name: '沪',
      english_name: 'Shanghai',
      level: 1,
      parent_path: '310000',
      is_active: true,
      is_hot: true,
      sort_order: 2
    },
    {
      code: '440000',
      name: '广东省',
      full_name: '广东省',
      short_name: '粤',
      english_name: 'Guangdong',
      level: 1,
      parent_path: '440000',
      is_active: true,
      is_hot: true,
      sort_order: 3
    },
    {
      code: '440100',
      name: '广州市',
      full_name: '广东省广州市',
      level: 2,
      parent_path: '440000/440100',
      is_active: true,
      sort_order: 1
    },
    {
      code: '440300',
      name: '深圳市',
      full_name: '广东省深圳市',
      level: 2,
      parent_path: '440000/440300',
      is_active: true,
      is_hot: true,
      sort_order: 2
    }
  ];

  try {
    // 需要按层级顺序插入，以满足外键约束
    const level1Regions = testRegions.filter(r => r.level === 1);
    const level2Regions = testRegions.filter(r => r.level === 2);
    const level3Regions = testRegions.filter(r => r.level === 3);
    
    for (const region of level1Regions) {
      const created = await pb.collection('regions').create(region);
      console.log(`✅ 地区 "${region.name}" 创建成功`);
      // 更新level2的parent_id
      for (const level2 of level2Regions) {
        if (level2.parent_path.startsWith(region.code)) {
          level2.parent_id = created.id;
        }
      }
    }
    
    for (const region of level2Regions) {
      const created = await pb.collection('regions').create(region);
      console.log(`✅ 地区 "${region.name}" 创建成功`);
      // 更新level3的parent_id
      for (const level3 of level3Regions) {
        if (level3.parent_path.includes(region.code)) {
          level3.parent_id = created.id;
        }
      }
    }
    
    for (const region of level3Regions) {
      await pb.collection('regions').create(region);
      console.log(`✅ 地区 "${region.name}" 创建成功`);
    }
    
    console.log('✅ 所有测试地区数据插入完成');
  } catch (error) {
    console.error('❌ 测试地区数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 主函数 =========================
async function main() {
  try {
    await authenticate();
    
    // 按依赖关系的反序删除集合
    console.log('🗑️ 删除现有集合...');
    await deleteCollectionIfExists('points_exchange_records');
    await deleteCollectionIfExists('points_records');
    await deleteCollectionIfExists('member_tag_relations'); 
    await deleteCollectionIfExists('addresses');
    await deleteCollectionIfExists('members');
    await deleteCollectionIfExists('points_exchanges');
    await deleteCollectionIfExists('points_rules');
    await deleteCollectionIfExists('member_tags');
    await deleteCollectionIfExists('regions');
    await deleteCollectionIfExists('member_levels');
    
    console.log('🚀 开始创建会员系统集合...');
    
    // 创建基础集合（无依赖）
    await createMemberLevelsCollection();
    await createRegionsCollection();
    await createMemberTagsCollection();
    await createPointsRulesCollection();
    await createPointsExchangesCollection();
    
    // 创建依赖集合
    await createMembersCollection();
    await createAddressesCollection();
    await createMemberTagRelationsCollection();
    await createPointsRecordsCollection();
    await createPointsExchangeRecordsCollection();
    
    console.log('📊 开始插入测试数据...');
    await insertTestMemberLevels();
    await insertTestMembers();
    await insertTestPointsRules();
    await insertTestPointsExchanges();
    await insertTestRegions();
    
    console.log('🎉 所有会员系统集合和测试数据创建完成！');
    console.log('📈 数据统计:');
    console.log('  - 会员等级: 5个');
    console.log('  - 测试会员: 3个');
    console.log('  - 积分规则: 5个');
    console.log('  - 兑换商品: 5个');
    console.log('  - 地区数据: 8个');
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', getErrorMessage(error));
    Deno.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.main) {
  main();
} 