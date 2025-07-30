import { authenticate, deleteCollectionIfExists, getErrorMessage, pb } from '../helper.ts';

// ========================= 会员等级集合 =========================
async function createMemberLevelsCollection() {
  const collection = {
    name: 'member_levels',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
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
        required: false
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
        name: 'upgrade_conditions',
        type: 'json',
        required: false
      },
      {
        name: 'maintenance_rules',
        type: 'json',
        required: false
      },
      {
        name: 'statistics',
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "member_levels" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 member_levels 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 会员标签集合 =========================
async function createMemberTagsCollection() {
  const collection = {
    name: 'member_tags',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
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
        values: ['SYSTEM', 'CUSTOM', 'BEHAVIORAL', 'DEMOGRAPHIC', 'MARKETING']
      },
      {
        name: 'category',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'color',
        type: 'text',
        required: true,
        options: { max: 20 }
      },
      {
        name: 'icon',
        type: 'text',
        required: false,
        options: { max: 50 }
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
        name: 'is_system',
        type: 'bool',
        required: false
      },
      {
        name: 'is_visible',
        type: 'bool',
        required: false
      },
      {
        name: 'auto_assign',
        type: 'bool',
        required: false
      },
      {
        name: 'rules',
        type: 'json',
        required: false
      },
      {
        name: 'conditions',
        type: 'json',
        required: false
      },
      {
        name: 'actions',
        type: 'json',
        required: false
      },
      {
        name: 'statistics',
        type: 'json',
        required: false
      },
      {
        name: 'created_by',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'custom_properties',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "member_tags" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 member_tags 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 积分规则集合 =========================
async function createPointsRulesCollection() {
  const collection = {
    name: 'points_rules',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
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
          'EARNED_REGISTRATION', 'EARNED_LOGIN', 'EARNED_ORDER', 'EARNED_REVIEW',
          'EARNED_REFERRAL', 'EARNED_ACTIVITY', 'EARNED_CHECKIN', 'EARNED_SHARE',
          'EARNED_ADMIN', 'SPENT_EXCHANGE', 'SPENT_ORDER', 'SPENT_DEDUCTION',
          'EXPIRED', 'FROZEN', 'UNFROZEN', 'ADMIN_ADJUST'
        ]
      },
      {
        name: 'category',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'points',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'max_points_per_day',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'max_points_per_month',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'is_active',
        type: 'bool'
      },
      {
        name: 'is_system',
        type: 'bool',
        required: false
      },
      {
        name: 'priority',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'expiry_days',
        type: 'number',
        required: false,
        options: { min: 0 }
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
      },
      {
        name: 'conditions',
        type: 'json',
        required: false
      },
      {
        name: 'member_level_restrictions',
        type: 'json',
        required: false
      },
      {
        name: 'statistics',
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "points_rules" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 points_rules 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 积分兑换集合 =========================
async function createPointsExchangesCollection() {
  const collection = {
    name: 'points_exchanges',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      {
        name: 'name',
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
        name: 'image',
        type: 'file',
        required: false,
        options: { maxSelect: 5, maxSize: 5242880 }
      },
      {
        name: 'exchange_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['BALANCE', 'COUPON', 'PRODUCT', 'PRIVILEGE', 'DISCOUNT']
      },
      {
        name: 'points_required',
        type: 'number',
        required: true,
        options: { min: 1 }
      },
      {
        name: 'reward_value',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'reward_data',
        type: 'json',
        required: false
      },
      {
        name: 'stock_total',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'stock_remaining',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'exchange_limit_per_user',
        type: 'number',
        required: false,
        options: { min: 1 }
      },
      {
        name: 'exchange_limit_per_day',
        type: 'number',
        required: false,
        options: { min: 1 }
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      },
      {
        name: 'is_featured',
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
        name: 'start_date',
        type: 'date',
        required: false
      },
      {
        name: 'end_date',
        type: 'date',
        required: false
      },
      {
        name: 'exchange_count',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'member_level_restrictions',
        type: 'json',
        required: false
      },
      {
        name: 'conditions',
        type: 'json',
        required: false
      },
      {
        name: 'statistics',
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "points_exchanges" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 points_exchanges 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 地区集合 =========================
async function createRegionsCollection() {
  const collection = {
    name: 'regions',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
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
        options: { max: 100 }
      },
      {
        name: 'level',
        type: 'number',
        required: true,
        options: { min: 1, max: 5 }
      },
      // parent_id 字段将在创建后添加
      {
        name: 'parent_path',
        type: 'text',
        required: true,
        options: { max: 500 }
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "regions" 创建成功`);
    
    // 添加 parent_id 自关联字段
    const parentIdField: any = {
      name: 'parent_id',
      type: 'relation',
      required: false,
      options: {
        collectionId: created.id,
        cascadeDelete: false,
        maxSelect: 1,
        displayFields: ['name']
      }
    };
    
    const updatedSchema: any[] = [...collection.fields];
    // 在 level 字段后插入 parent_id 字段
    const levelIndex = updatedSchema.findIndex((field: any) => field.name === 'level');
    updatedSchema.splice(levelIndex + 1, 0, parentIdField);
    
    await pb.collections.update(created.id, { schema: updatedSchema });
    console.log(`✅ 集合 "regions" 自关联字段添加成功`);
    
    return created;
  } catch (error) {
    console.error('❌ 创建 regions 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 会员集合 =========================
async function createMembersCollection() {
  const collection = {
    name: 'members',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      // 基础资料
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
        options: { maxSelect: 1, maxSize: 2097152 }
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
        required: true,
        maxSelect: 1,
        values: ['MALE', 'FEMALE', 'UNKNOWN']
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
      // 等级和积分
      {
        name: 'level_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'points',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'frozen_points',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'total_earned_points',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'total_spent_points',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'balance',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'frozen_balance',
        type: 'number',
        options: { min: 0 }
      },
      // 状态
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING']
      },
      {
        name: 'is_verified',
        type: 'bool',
      },
      {
        name: 'verification',
        type: 'json',
        required: false
      },
      // 时间信息
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
      // 第三方绑定
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
      // 标签和分组
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
      // 风控信息
      {
        name: 'risk_level',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['low', 'medium', 'high']
      },
      {
        name: 'trust_score',
        type: 'number',
        required: true,
        options: { min: 0, max: 100 }
      },
      {
        name: 'blacklist_reason',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      // 统计数据
      {
        name: 'stats',
        type: 'json',
        required: false
      },
      // 偏好设置
      {
        name: 'preferences',
        type: 'json',
        required: false
      },
      // 位置信息
      {
        name: 'location',
        type: 'json',
        required: false
      },
      // 扩展字段
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "members" 创建成功`);
    return created;
  } catch (error) {
    console.log(error);
    console.error('❌ 创建 members 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 地址集合 =========================
async function createAddressesCollection() {
  const collection = {
    name: 'addresses',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      {
        name: 'user_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      // 联系人信息
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
      // 地址信息
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
        options: { max: 20 }
      },
      // 地理位置
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
      // 地址标签
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
      // 地址状态
      {
        name: 'is_default',
        type: 'bool',
        defaultValue: false
      },
      {
        name: 'is_active',
        type: 'bool',
        required: false
      },
      {
        name: 'is_verified',
        type: 'bool'
      },
      // 验证信息
      {
        name: 'verification_status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['PENDING', 'VERIFIED', 'FAILED']
      },
      {
        name: 'verification_method',
        type: 'select',
        required: false,
        maxSelect: 1,
        values: ['AUTO', 'MANUAL', 'THIRD_PARTY']
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
      // 使用统计
      {
        name: 'usage_count',
        type: 'number',
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
        options: { min: 0 }
      },
      // 地址来源
      {
        name: 'source',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['MANUAL', 'LOCATION', 'IMPORT', 'THIRD_PARTY']
      },
      {
        name: 'source_details',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      // 扩展字段
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "addresses" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 addresses 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 会员标签关系集合 =========================
async function createMemberTagRelationsCollection() {
  const collection = {
    name: 'member_tag_relations',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      {
        name: 'member_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'tag_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'assigned_by',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'assigned_method',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['MANUAL', 'AUTO', 'RULE', 'IMPORT']
      },
      {
        name: 'assigned_reason',
        type: 'text',
        required: false,
        options: { max: 200 }
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
        name: 'is_active',
        type: 'bool',
      },
      {
        name: 'priority',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'source_data',
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "member_tag_relations" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 member_tag_relations 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 积分记录集合 =========================
async function createPointsRecordsCollection() {
  const collection = {
    name: 'points_records',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      {
        name: 'member_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'rule_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: [
            'EARNED_REGISTRATION', 'EARNED_LOGIN', 'EARNED_ORDER', 'EARNED_REVIEW',
            'EARNED_REFERRAL', 'EARNED_ACTIVITY', 'EARNED_CHECKIN', 'EARNED_SHARE',
            'EARNED_ADMIN', 'SPENT_EXCHANGE', 'SPENT_ORDER', 'SPENT_DEDUCTION',
            'EXPIRED', 'FROZEN', 'UNFROZEN', 'ADMIN_ADJUST'
          ]
      },
      {
        name: 'points',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'balance_before',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'balance_after',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'title',
        type: 'text',
        options: { max: 100 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'related_id',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'related_type',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'expires_at',
        type: 'date',
        required: false
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['ACTIVE', 'EXPIRED', 'FROZEN', 'USED']
      },
      {
        name: 'operator_id',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'operator_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['SYSTEM', 'ADMIN', 'MEMBER']
      },
      {
        name: 'source_data',
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "points_records" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 points_records 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 积分兑换记录集合 =========================
async function createPointsExchangeRecordsCollection() {
  const collection = {
    name: 'points_exchange_records',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      {
        name: 'member_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'exchange_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'exchange_code',
        type: 'text',
        options: { max: 50 }
      },
      {
        name: 'points_spent',
        type: 'number',
        options: { min: 1 }
      },
      {
        name: 'reward_value',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'quantity',
        type: 'number',
        options: { min: 1 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED', 'REFUNDED']
      },
      {
        name: 'exchange_time',
        type: 'date',
        required: true
      },
      {
        name: 'processing_time',
        type: 'date',
        required: false
      },
      {
        name: 'completion_time',
        type: 'date',
        required: false
      },
      {
        name: 'cancellation_time',
        type: 'date',
        required: false
      },
      {
        name: 'failure_reason',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'delivery_info',
        type: 'json',
        required: false
      },
      {
        name: 'contact_info',
        type: 'json',
        required: false
      },
      {
        name: 'notes',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'operator_id',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'external_order_id',
        type: 'text',
        required: false,
        options: { max: 100 }
      },
      {
        name: 'tracking_info',
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
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "points_exchange_records" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 points_exchange_records 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 地址模板集合 =========================
async function createAddressTemplatesCollection() {
  const collection = {
    name: 'address_templates',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      {
        name: 'name',
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
        name: 'template',
        type: 'json',
        required: true
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['SYSTEM', 'CUSTOM', 'POPULAR']
      },
      {
        name: 'category',
        type: 'text',
        required: true,
        options: { max: 50 }
      },
      {
        name: 'usage_count',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'popularity_score',
        type: 'number',
        options: { min: 0 }
      },
      {
        name: 'is_active',
        type: 'bool',
      },
      {
        name: 'is_public',
        type: 'bool',
      },
      {
        name: 'created_by',
        type: 'text',
        options: { max: 50 }
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "address_templates" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 address_templates 集合失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 地址使用记录集合 =========================
async function createAddressUsageRecordsCollection() {
  const collection = {
    name: 'address_usage_records',
    type: 'base',
    listRule: null,
    viewRule: null,
    createRule: "", // 临时允许创建，用于插入测试数据
    updateRule: null,
    deleteRule: null,
    options: {},
    fields: [
      {
        name: 'address_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'user_id',
        type: 'text', // 临时设为text，创建后再改为relation
        required: false,
        options: { max: 50 }
      },
      {
        name: 'usage_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['ORDER', 'SHIPPING', 'BILLING', 'OTHER']
      },
      {
        name: 'order_id',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'address_snapshot',
        type: 'json',
        required: true
      },
      {
        name: 'result',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['SUCCESS', 'FAILED', 'CANCELLED']
      },
      {
        name: 'result_details',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'metadata',
        type: 'json',
        required: false
      }
    ]
  };

  try {
    const created = await pb.collections.create(collection);
    console.log(`✅ 集合 "address_usage_records" 创建成功`);
    return created;
  } catch (error) {
    console.error('❌ 创建 address_usage_records 集合失败:', getErrorMessage(error));
    throw error;
  }
} 

// ========================= 更新关联关系 =========================
async function updateCollectionRelations(createdCollections: any) {
  try {
    // 更新members集合的level_id关联
    const membersCollection = createdCollections.members;
    const memberLevelsCollection = createdCollections.member_levels;
    
    const membersSchema = membersCollection.fields.map((field: any) => {
      if (field.name === 'level_id') {
        // 从text类型改为relation类型
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: memberLevelsCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
          displayFields: ['name']
        };
      }
      return field;
    });
    
    try {
      await pb.collections.update(membersCollection.id, { schema: membersSchema });
      console.log(`✅ 更新 members 集合关联关系成功`);
    } catch (error) {
      console.log(error);
      console.error(`❌ 更新 members 集合关联关系失败:`, getErrorMessage(error));
      throw error;
    }
    
    // 更新addresses集合的user_id关联
    const addressesCollection = createdCollections.addresses;
    const addressesSchema = addressesCollection.fields.map((field: any) => {
      if (field.name === 'user_id') {
        // 从text类型改为relation类型
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: membersCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
          displayFields: ['username']
        };
      }
      return field;
    });
    
    try {
      await pb.collections.update(addressesCollection.id, { schema: addressesSchema });
      console.log(`✅ 更新 addresses 集合关联关系成功`);
    } catch (error) {
      console.error(`❌ 更新 addresses 集合关联关系失败:`, getErrorMessage(error));
      throw error;
    }
    
    // 更新member_tag_relations集合的关联关系
    const tagRelationsCollection = createdCollections.member_tag_relations;
    const memberTagsCollection = createdCollections.member_tags;
    
    const tagRelationsSchema = tagRelationsCollection.fields.map((field: any) => {
      if (field.name === 'member_id') {
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: membersCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
          displayFields: ['username']
        };
      } else if (field.name === 'tag_id') {
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: memberTagsCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
          displayFields: ['name']
        };
      }
      return field;
    });
    
    try {
      await pb.collections.update(tagRelationsCollection.id, { schema: tagRelationsSchema });
      console.log(`✅ 更新 member_tag_relations 集合关联关系成功`);
    } catch (error) {
      console.error(`❌ 更新 member_tag_relations 集合关联关系失败:`, getErrorMessage(error));
      throw error;
    }
    
    // 更新points_records集合的关联关系
    const pointsRecordsCollection = createdCollections.points_records;
    const pointsRulesCollection = createdCollections.points_rules;
    
    const pointsRecordsSchema = pointsRecordsCollection.fields.map((field: any) => {
      if (field.name === 'member_id') {
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: membersCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
          displayFields: ['username']
        };
      } else if (field.name === 'rule_id') {
        field.type = 'relation';
        field.required = false;
        field.options = {
          collectionId: pointsRulesCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
          displayFields: ['name']
        };
      }
      return field;
    });
    
    try {
      await pb.collections.update(pointsRecordsCollection.id, { schema: pointsRecordsSchema });
      console.log(`✅ 更新 points_records 集合关联关系成功`);
    } catch (error) {
      console.error(`❌ 更新 points_records 集合关联关系失败:`, getErrorMessage(error));
      throw error;
    }
    
    // 更新points_exchange_records集合的关联关系
    const exchangeRecordsCollection = createdCollections.points_exchange_records;
    const pointsExchangesCollection = createdCollections.points_exchanges;
    
    const exchangeRecordsSchema = exchangeRecordsCollection.fields.map((field: any) => {
      if (field.name === 'member_id') {
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: membersCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
          displayFields: ['username']
        };
      } else if (field.name === 'exchange_id') {
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: pointsExchangesCollection.id,
          cascadeDelete: false,
          maxSelect: 1,
          displayFields: ['name']
        };
      }
      return field;
    });
    
    try {
      await pb.collections.update(exchangeRecordsCollection.id, { schema: exchangeRecordsSchema });
      console.log(`✅ 更新 points_exchange_records 集合关联关系成功`);
    } catch (error) {
      console.error(`❌ 更新 points_exchange_records 集合关联关系失败:`, getErrorMessage(error));
      throw error;
    }
    
    // 更新address_usage_records集合的关联关系
    const addressUsageCollection = createdCollections.address_usage_records;
    
    const addressUsageSchema = addressUsageCollection.fields.map((field: any) => {
      if (field.name === 'address_id') {
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: addressesCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
          displayFields: ['name']
        };
      } else if (field.name === 'user_id') {
        field.type = 'relation';
        field.required = true;
        field.options = {
          collectionId: membersCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
          displayFields: ['username']
        };
      }
      return field;
    });
    
    try {
      await pb.collections.update(addressUsageCollection.id, { schema: addressUsageSchema });
      console.log(`✅ 更新 address_usage_records 集合关联关系成功`);
    } catch (error) {
      console.error(`❌ 更新 address_usage_records 集合关联关系失败:`, getErrorMessage(error));
      throw error;
    }
    
  } catch (error) {
    console.error('❌ 更新集合关联关系失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= Mock数据生成器 =========================

// 生成随机中文姓名
function generateChineseName(): string {
  const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
  const names = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞'];
  const surname = surnames[Math.floor(Math.random() * surnames.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  return surname + name;
}

// 生成随机手机号
function generatePhoneNumber(): string {
  const prefixes = ['138', '139', '156', '158', '159', '176', '177', '178', '188', '189'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + suffix;
}

// 生成随机邮箱
function generateEmail(username: string): string {
  const domains = ['qq.com', '163.com', 'gmail.com', 'sina.com', 'hotmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username.toLowerCase()}${Math.floor(Math.random() * 1000)}@${domain}`;
}

// 生成随机日期
function generateRandomDate(startDate: Date, endDate: Date): string {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString().split('T')[0];
}

// 插入测试会员等级数据
async function insertTestMemberLevels() {
  console.log('📊 开始插入会员等级测试数据...');
  
  try {
  
  const testLevels = [
    {
      name: 'bronze',
      display_name: '青铜会员',
      description: '新手会员，享受基础权益',
      slogan: '开启您的会员之旅',
      color: '#CD7F32',
      background_color: '#F5E6D3',
      level: 1,
      sort_order: 1,
      is_active: true,
      is_default: true,
      points_required: 100,
      benefits: {
        discounts: ['新人专享9.5折'],
        privileges: ['生日专享优惠'],
        services: ['专属客服咨询']
      },
      discount_rate: 0.95,
      points_rate: 1.0,
      upgrade_conditions: {
        totalOrders: 5,
        totalAmount: 500,
        period: 30
      },
      statistics: {
        memberCount: 0,
        totalSpent: 0
      }
    },
    {
      name: 'silver',
      display_name: '白银会员',
      description: '进阶会员，享受更多优惠',
      slogan: '尊享更多会员特权',
      color: '#C0C0C0',
      background_color: '#F8F8FF',
      level: 2,
      sort_order: 2,
      is_active: true,
      is_default: false,
      points_required: 1000,
      benefits: {
        discounts: ['全场9折优惠', '生日专享8.5折'],
        privileges: ['免邮特权', '专属活动邀请'],
        services: ['优先客服', '专属生日礼品']
      },
      discount_rate: 0.9,
      points_rate: 1.2,
      upgrade_conditions: {
        totalOrders: 15,
        totalAmount: 2000,
        period: 90
      },
      statistics: {
        memberCount: 0,
        totalSpent: 0
      }
    },
    {
      name: 'gold',
      display_name: '黄金会员',
      description: '高级会员，享受黄金级服务',
      slogan: '尊贵体验，黄金品质',
      color: '#FFD700',
      background_color: '#FFFACD',
      level: 3,
      sort_order: 3,
      is_active: true,
      is_default: false,
      points_required: 5000,
      benefits: {
        discounts: ['全场8.5折优惠', '生日专享8折'],
        privileges: ['免邮特权', '专属活动邀请', '积分翻倍'],
        services: ['VIP客服通道', '专属生日礼品', '个人购物顾问']
      },
      discount_rate: 0.85,
      points_rate: 1.5,
      upgrade_conditions: {
        totalOrders: 30,
        totalAmount: 8000,
        period: 180
      },
      statistics: {
        memberCount: 0,
        totalSpent: 0
      }
    },
    {
      name: 'platinum',
      display_name: '白金会员',
      description: '顶级会员，享受白金级尊贵服务',
      slogan: '至尊体验，白金礼遇',
      color: '#E5E4E2',
      background_color: '#F7F7F7',
      level: 4,
      sort_order: 4,
      is_active: true,
      is_default: false,
      points_required: 15000,
      benefits: {
        discounts: ['全场8折优惠', '生日专享7.5折'],
        privileges: ['免邮特权', '专属活动邀请', '积分翻倍', '新品优先购买'],
        services: ['VIP客服通道', '专属生日礼品', '个人购物顾问', '专属客户经理']
      },
      discount_rate: 0.8,
      points_rate: 2.0,
      upgrade_conditions: {
        totalOrders: 50,
        totalAmount: 20000,
        period: 365
      },
      statistics: {
        memberCount: 0,
        totalSpent: 0
      }
    },
    {
      name: 'diamond',
      display_name: '钻石会员',
      description: '至尊会员，享受钻石级超VIP服务',
      slogan: '至尊无上，钻石永恒',
      color: '#B9F2FF',
      background_color: '#F0F8FF',
      level: 5,
      sort_order: 5,
      is_active: true,
      is_default: false,
      points_required: 50000,
      benefits: {
        discounts: ['全场7.5折优惠', '生日专享7折'],
        privileges: ['免邮特权', '专属活动邀请', '积分翻倍', '新品优先购买', '限量商品专享'],
        services: ['VIP客服通道', '专属生日礼品', '个人购物顾问', '专属客户经理', '年度尊享礼盒']
      },
      discount_rate: 0.75,
      points_rate: 3.0,
      upgrade_conditions: {
        totalOrders: 100,
        totalAmount: 100000,
        period: 365
      },
      statistics: {
        memberCount: 0,
        totalSpent: 0
      }
    }
  ];

  for (const level of testLevels) {
    const created = await pb.collection('member_levels').create(level);
    console.log(`✅ 会员等级 "${level.display_name}" 创建成功`);
  }
  console.log('✅ 所有测试会员等级数据插入完成');
  } catch (error) {
    console.log(error);
    console.error('❌ 测试会员等级数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// 插入测试会员标签数据
async function insertTestMemberTags() {
  console.log('📊 开始插入会员标签测试数据...');
  
  const testTags = [
    {
      name: 'new_user',
      display_name: '新用户',
      description: '最近30天内注册的新用户',
      type: 'SYSTEM',
      category: '用户生命周期',
      color: '#52c41a',
      icon: 'user-add',
      sort_order: 1,
      is_active: true,
      is_system: true,
      is_visible: true,
      auto_assign: true,
      rules: {
        conditions: [
          {
            field: 'register_time',
            operator: 'gte',
            value: '30_days_ago',
            description: '注册时间在30天内'
          }
        ]
      },
      statistics: {
        memberCount: 0,
        assignmentCount: 0
      }
    },
    {
      name: 'high_value',
      display_name: '高价值客户',
      description: '累计消费金额超过10000元的客户',
      type: 'BEHAVIORAL',
      category: '消费行为',
      color: '#fa8c16',
      icon: 'crown',
      sort_order: 2,
      is_active: true,
      is_system: false,
      is_visible: true,
      auto_assign: true,
      rules: {
        conditions: [
          {
            field: 'totalAmount',
            operator: 'gte',
            value: 10000,
            description: '累计消费金额大于等于10000元'
          }
        ]
      },
      statistics: {
        memberCount: 0,
        assignmentCount: 0
      }
    },
    {
      name: 'frequent_buyer',
      display_name: '频繁购买者',
      description: '近3个月内下单次数超过10次',
      type: 'BEHAVIORAL',
      category: '购买频次',
      color: '#1890ff',
      icon: 'shopping',
      sort_order: 3,
      is_active: true,
      is_system: false,
      is_visible: true,
      auto_assign: true,
      rules: {
        conditions: [
          {
            field: 'recentOrderCount',
            operator: 'gte',
            value: 10,
            description: '近3个月订单数量大于等于10次'
          }
        ]
      },
      statistics: {
        memberCount: 0,
        assignmentCount: 0
      }
    },
    {
      name: 'mobile_user',
      display_name: '移动端用户',
      description: '主要使用移动端进行购物的用户',
      type: 'DEMOGRAPHIC',
      category: '使用习惯',
      color: '#722ed1',
      icon: 'mobile',
      sort_order: 4,
      is_active: true,
      is_system: false,
      is_visible: true,
      auto_assign: false,
      statistics: {
        memberCount: 0,
        assignmentCount: 0
      }
    },
    {
      name: 'birthday_month',
      display_name: '生日月用户',
      description: '当月生日的用户',
      type: 'MARKETING',
      category: '营销活动',
      color: '#eb2f96',
      icon: 'gift',
      sort_order: 5,
      is_active: true,
      is_system: true,
      is_visible: false,
      auto_assign: true,
      rules: {
        conditions: [
          {
            field: 'birthday_month',
            operator: 'eq',
            value: 'current_month',
            description: '生日月份为当前月份'
          }
        ]
      },
      statistics: {
        memberCount: 0,
        assignmentCount: 0
      }
    }
  ];

  try {
    for (const tag of testTags) {
      const created = await pb.collection('member_tags').create(tag);
      console.log(`✅ 会员标签 "${tag.display_name}" 创建成功`);
    }
    console.log('✅ 所有测试会员标签数据插入完成');
  } catch (error) {
    console.log(error);
    console.error('❌ 测试会员标签数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// 插入测试积分规则数据
async function insertTestPointsRules() {
  console.log('📊 开始插入积分规则测试数据...');
  
  const testRules = [
    {
      name: '注册奖励',
      code: 'registration_bonus',
      description: '新用户注册即可获得积分奖励',
      type: 'EARNED_REGISTRATION',
      category: '注册奖励',
      points: 100,
      is_active: true,
      is_system: true,
      priority: 1,
      expiry_days: 365,
      conditions: {
        maxTimesPerUser: 1,
        requireVerification: false
      },
      statistics: {
        totalAwarded: 0,
        memberCount: 0
      }
    },
    {
      name: '每日签到',
      code: 'daily_checkin',
      description: '每日签到可获得积分，连续签到奖励更多',
      type: 'EARNED_CHECKIN',
      category: '签到奖励',
      points: 10,
      max_points_per_day: 50,
      is_active: true,
      is_system: true,
      priority: 2,
      expiry_days: 180,
      conditions: {
        consecutiveBonusMultiplier: [1, 1.2, 1.5, 2.0],
        resetAfterMissedDays: 1
      },
      statistics: {
        totalAwarded: 0,
        memberCount: 0
      }
    },
    {
      name: '订单完成奖励',
      code: 'order_completion',
      description: '订单完成后根据订单金额获得相应积分',
      type: 'EARNED_ORDER',
      category: '购物奖励',
      points: 1,
      is_active: true,
      is_system: true,
      priority: 3,
      expiry_days: 365,
      conditions: {
        minOrderAmount: 10,
        pointsPerYuan: 1,
        maxPointsPerOrder: 1000
      },
      statistics: {
        totalAwarded: 0,
        memberCount: 0
      }
    },
    {
      name: '商品评价奖励',
      code: 'product_review',
      description: '完成商品评价后获得积分奖励',
      type: 'EARNED_REVIEW',
      category: '互动奖励',
      points: 20,
      max_points_per_day: 100,
      is_active: true,
      is_system: true,
      priority: 4,
      expiry_days: 180,
      conditions: {
        requirePurchase: true,
        minReviewLength: 10,
        bonusForImages: 10
      },
      statistics: {
        totalAwarded: 0,
        memberCount: 0
      }
    },
    {
      name: '邀请好友奖励',
      code: 'referral_bonus',
      description: '成功邀请好友注册并完成首单后获得奖励',
      type: 'EARNED_REFERRAL',
      category: '推荐奖励',
      points: 200,
      is_active: true,
      is_system: true,
      priority: 5,
      expiry_days: 365,
      conditions: {
        requireInviteeFirstOrder: true,
        minInviteeOrderAmount: 50,
        maxReferralsPerDay: 5
      },
      statistics: {
        totalAwarded: 0,
        memberCount: 0
      }
    }
  ];

  try {
    for (const rule of testRules) {
      const created = await pb.collection('points_rules').create(rule);
      console.log(`✅ 积分规则 "${rule.name}" 创建成功`);
    }
    console.log('✅ 所有测试积分规则数据插入完成');
  } catch (error) {
    console.error('❌ 测试积分规则数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// 插入测试积分兑换数据
async function insertTestPointsExchanges() {
  console.log('📊 开始插入积分兑换测试数据...');
  
  const testExchanges = [
    {
      name: '10元优惠券',
      description: '全场通用10元优惠券，满100元可用',
      exchange_type: 'COUPON',
      points_required: 1000,
      reward_value: 10,
      reward_data: {
        couponType: 'discount',
        minOrderAmount: 100,
        validDays: 30
      },
      stock_total: 1000,
      stock_remaining: 1000,
      exchange_limit_per_user: 5,
      exchange_limit_per_day: 2,
      is_active: true,
      is_featured: true,
      is_hot: false,
      sort_order: 1,
      exchange_count: 0,
      conditions: {
        memberLevelRequired: 1,
        maxExchangePerMonth: 10
      },
      statistics: {
        totalExchanged: 0,
        memberCount: 0
      }
    },
    {
      name: '20元优惠券',
      description: '全场通用20元优惠券，满200元可用',
      exchange_type: 'COUPON',
      points_required: 2000,
      reward_value: 20,
      reward_data: {
        couponType: 'discount',
        minOrderAmount: 200,
        validDays: 30
      },
      stock_total: 500,
      stock_remaining: 500,
      exchange_limit_per_user: 3,
      exchange_limit_per_day: 1,
      is_active: true,
      is_featured: true,
      is_hot: true,
      sort_order: 2,
      exchange_count: 0,
      conditions: {
        memberLevelRequired: 2,
        maxExchangePerMonth: 5
      },
      statistics: {
        totalExchanged: 0,
        memberCount: 0
      }
    },
    {
      name: '余额充值5元',
      description: '账户余额充值5元，可用于任意消费',
      exchange_type: 'BALANCE',
      points_required: 500,
      reward_value: 5,
      reward_data: {
        balanceType: 'general',
        validDays: 365
      },
      exchange_limit_per_user: 10,
      exchange_limit_per_day: 3,
      is_active: true,
      is_featured: true,
      is_hot: false,
      sort_order: 3,
      exchange_count: 0,
      conditions: {
        memberLevelRequired: 1
      },
      statistics: {
        totalExchanged: 0,
        memberCount: 0
      }
    },
    {
      name: '免邮特权卡',
      description: '30天免邮特权，无订单金额限制',
      exchange_type: 'PRIVILEGE',
      points_required: 800,
      reward_value: 10,
      reward_data: {
        privilegeType: 'free_shipping',
        validDays: 30
      },
      stock_total: 200,
      stock_remaining: 200,
      exchange_limit_per_user: 2,
      exchange_limit_per_day: 1,
      is_active: true,
      is_featured: true,
      is_hot: true,
      sort_order: 4,
      exchange_count: 0,
      conditions: {
        memberLevelRequired: 2
      },
      statistics: {
        totalExchanged: 0,
        memberCount: 0
      }
    },
    {
      name: '专属定制水杯',
      description: '品牌定制保温水杯，可刻印专属文字',
      exchange_type: 'PRODUCT',
      points_required: 5000,
      reward_value: 50,
      reward_data: {
        productId: 'custom_mug_001',
        customizable: true,
        shippingRequired: true
      },
      stock_total: 50,
      stock_remaining: 50,
      exchange_limit_per_user: 1,
      exchange_limit_per_day: 1,
      is_active: true,
      is_featured: true,
      is_hot: true,
      sort_order: 5,
      exchange_count: 0,
      conditions: {
        memberLevelRequired: 3,
        requireShippingAddress: true
      },
      statistics: {
        totalExchanged: 0,
        memberCount: 0
      }
    }
  ];

  try {
    for (const exchange of testExchanges) {
      const created = await pb.collection('points_exchanges').create(exchange);
      console.log(`✅ 积分兑换 "${exchange.name}" 创建成功`);
    }
    console.log('✅ 所有测试积分兑换数据插入完成');
  } catch (error) {
    console.log(error);
    console.error('❌ 测试积分兑换数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// 插入测试地区数据
async function insertTestRegions() {
  console.log('📊 开始插入地区测试数据...');
  
  const testRegions = [
    // 一级区域（省/直辖市）
    {
      code: '110000',
      name: '北京市',
      full_name: '北京市',
      short_name: '京',
      english_name: 'Beijing',
      level: 1,
      parent_path: '110000',
      longitude: 116.405285,
      latitude: 39.904989,
      is_active: true,
      is_hot: true,
      sort_order: 1
    },
    {
      code: '310000',
      name: '上海市',
      full_name: '上海市',
      short_name: '沪',
      english_name: 'Shanghai',
      level: 1,
      parent_path: '310000',
      longitude: 121.472644,
      latitude: 31.231706,
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
      longitude: 113.280637,
      latitude: 23.125178,
      is_active: true,
      is_hot: true,
      sort_order: 3
    },
    // 二级区域（市）
    {
      code: '110100',
      name: '北京市',
      full_name: '北京市北京市',
      level: 2,
      parent_path: '110000/110100',
      longitude: 116.405285,
      latitude: 39.904989,
      is_active: true,
      is_hot: true,
      sort_order: 1
    },
    {
      code: '440100',
      name: '广州市',
      full_name: '广东省广州市',
      level: 2,
      parent_path: '440000/440100',
      longitude: 113.280637,
      latitude: 23.125178,
      is_active: true,
      is_hot: true,
      sort_order: 1
    },
    {
      code: '440300',
      name: '深圳市',
      full_name: '广东省深圳市',
      level: 2,
      parent_path: '440000/440300',
      longitude: 114.085947,
      latitude: 22.547,
      is_active: true,
      is_hot: true,
      sort_order: 2
    },
    // 三级区域（区/县）
    {
      code: '110101',
      name: '东城区',
      full_name: '北京市北京市东城区',
      level: 3,
      parent_path: '110000/110100/110101',
      longitude: 116.416357,
      latitude: 39.928353,
      is_active: true,
      is_hot: false,
      sort_order: 1
    },
    {
      code: '110102',
      name: '西城区',
      full_name: '北京市北京市西城区',
      level: 3,
      parent_path: '110000/110100/110102',
      longitude: 116.365868,
      latitude: 39.912289,
      is_active: true,
      is_hot: false,
      sort_order: 2
    }
  ];

  try {
    // 按层级顺序插入，并建立父子关系
    const level1Regions = testRegions.filter(r => r.level === 1);
    const level2Regions = testRegions.filter(r => r.level === 2);
    const level3Regions = testRegions.filter(r => r.level === 3);
    
    const regionIdMap: Record<string, string> = {};
    
    // 插入一级区域
    for (const region of level1Regions) {
      const created = await pb.collection('regions').create(region);
      regionIdMap[region.code] = created.id;
      console.log(`✅ 地区 "${region.name}" 创建成功`);
    }
    
    // 插入二级区域并设置父子关系
    for (const region of level2Regions) {
      const parentCode = region.parent_path.split('/')[0];
      const regionData = { ...region, parent_id: regionIdMap[parentCode] };
      const created = await pb.collection('regions').create(regionData);
      regionIdMap[region.code] = created.id;
      console.log(`✅ 地区 "${region.name}" 创建成功`);
    }
    
    // 插入三级区域并设置父子关系
    for (const region of level3Regions) {
      const parentCode = region.parent_path.split('/')[1];
      const regionData = { ...region, parent_id: regionIdMap[parentCode] };
      const created = await pb.collection('regions').create(regionData);
      regionIdMap[region.code] = created.id;
      console.log(`✅ 地区 "${region.name}" 创建成功`);
    }
    
    console.log('✅ 所有测试地区数据插入完成');
  } catch (error) {
    console.error('❌ 测试地区数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// 插入测试会员数据
async function insertTestMembers() {
  console.log('📊 开始插入会员测试数据...');
  
  try {
    // 获取等级数据
    const levels = await pb.collection('member_levels').getFullList({
      sort: 'level'
    });
    
    if (levels.length === 0) {
      throw new Error('请先创建会员等级数据');
    }
    
    const testMembers = [
      {
        username: 'demo_user_001',
        email: 'demo001@example.com',
        phone: generatePhoneNumber(),
        real_name: generateChineseName(),
        nickname: '购物达人',
        gender: 'FEMALE',
        birthday: '1990-05-15',
        bio: '热爱购物，追求品质生活',
        level_id: levels[2].id, // 黄金会员
        points: 8500,
        frozen_points: 1,
        total_earned_points: 12000,
        total_spent_points: 3500,
        balance: 156.80,
        frozen_balance: 0.1,
        status: 'ACTIVE',
        is_verified: true,
        is_default: true,
        verification: {
          status: 'VERIFIED',
          type: 'phone',
          verifiedAt: '2024-01-15T10:30:00Z'
        },
        register_time: '2023-06-01',
        last_login_time: '2024-01-20',
        last_active_time: '2024-01-20',
        level_upgrade_time: '2023-12-01',
        groups: ['vip_customer', 'frequent_buyer'],
        segment: 'high_value',
        risk_level: 'low',
        trust_score: 95,
        stats: {
          totalOrders: 25,
          totalAmount: 8650.50,
          totalSavings: 1200.30,
          averageOrderValue: 346.02,
          favoriteCategories: ['服装', '美妆', '家居'],
          loyaltyScore: 85,
          engagementScore: 90,
          lastOrderDate: '2024-01-15',
          membershipDuration: 233
        },
        preferences: {
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          currency: 'CNY',
          notifications: {
            email: true,
            sms: true,
            push: true,
            wechat: false,
            orderUpdates: true,
            promotions: true,
            pointsUpdates: true,
            systemMessages: false
          },
          privacy: {
            profileVisibility: 'friends',
            showLocation: false,
            showBirthday: true,
            showPhone: false,
            showEmail: false,
            allowSearch: true,
            allowRecommendation: true
          },
          marketing: {
            emailMarketing: true,
            smsMarketing: false,
            pushMarketing: true,
            personalizedRecommendations: true,
            behaviorTracking: true
          }
        },
        location: {
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          postalCode: '518000'
        }
      },
      {
        username: 'demo_user_002',
        email: 'demo002@example.com',
        phone: generatePhoneNumber(),
        real_name: generateChineseName(),
        nickname: '新手小白',
        gender: 'MALE',
        birthday: '1995-08-22',
        bio: '刚开始网购，正在学习中',
        level_id: levels[0].id, // 青铜会员
        points: 280,
        frozen_points: 1,
        total_earned_points: 300,
        total_spent_points: 20,
        balance: 50.00,
        frozen_balance: 0.1,
        status: 'ACTIVE',
        is_verified: true,
        is_default: true,
        verification: {
          status: 'PENDING',
          type: 'none'
        },
        register_time: '2024-01-10',
        last_login_time: '2024-01-19',
        last_active_time: '2024-01-19',
        groups: ['new_user'],
        segment: 'potential',
        risk_level: 'low',
        trust_score: 75,
        stats: {
          totalOrders: 2,
          totalAmount: 189.90,
          totalSavings: 15.50,
          averageOrderValue: 94.95,
          favoriteCategories: ['数码', '图书'],
          loyaltyScore: 30,
          engagementScore: 40,
          lastOrderDate: '2024-01-18',
          membershipDuration: 10
        },
        preferences: {
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          currency: 'CNY',
          notifications: {
            email: true,
            sms: false,
            push: true,
            wechat: false,
            orderUpdates: true,
            promotions: false,
            pointsUpdates: true,
            systemMessages: true
          },
          privacy: {
            profileVisibility: 'private',
            showLocation: false,
            showBirthday: false,
            showPhone: false,
            showEmail: false,
            allowSearch: false,
            allowRecommendation: true
          },
          marketing: {
            emailMarketing: false,
            smsMarketing: false,
            pushMarketing: false,
            personalizedRecommendations: true,
            behaviorTracking: false
          }
        },
        location: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          postalCode: '100000'
        }
      },
      {
        username: 'demo_user_003',
        email: 'demo003@example.com',
        phone: generatePhoneNumber(),
        real_name: generateChineseName(),
        nickname: '白金贵宾',
        gender: 'FEMALE',
        birthday: '1988-12-03',
        bio: '资深会员，享受购物乐趣',
        level_id: levels[3].id, // 白金会员
        points: 22500,
        frozen_points: 500,
        total_earned_points: 35000,
        total_spent_points: 12500,
        balance: 888.88,
        frozen_balance: 100.00,
        status: 'ACTIVE',
        is_default: true,
        is_verified: true,
        verification: {
          status: 'VERIFIED',
          type: 'identity',
          identityCard: {
            verified: true,
            verifiedAt: '2023-05-20T14:20:00Z'
          },
          verifiedAt: '2023-05-20T14:20:00Z'
        },
        register_time: '2022-03-15',
        last_login_time: '2024-01-20',
        last_active_time: '2024-01-20',
        level_upgrade_time: '2023-08-15',
        wechat_openid: 'wx_openid_demo_003',
        third_party_bindings: [
          {
            platform: 'wechat',
            platformUserId: 'wx_demo_003',
            bindTime: '2022-03-20T10:00:00Z',
            isActive: true
          }
        ],
        groups: ['vip_customer', 'high_value', 'frequent_buyer'],
        segment: 'premium',
        risk_level: 'low',
        trust_score: 98,
        stats: {
          totalOrders: 68,
          totalAmount: 25680.99,
          totalSavings: 4500.20,
          averageOrderValue: 377.66,
          favoriteCategories: ['奢侈品', '美妆', '服装', '珠宝'],
          loyaltyScore: 95,
          engagementScore: 98,
          lastOrderDate: '2024-01-18',
          membershipDuration: 675
        },
        preferences: {
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          currency: 'CNY',
          notifications: {
            email: true,
            sms: true,
            push: true,
            wechat: true,
            orderUpdates: true,
            promotions: true,
            pointsUpdates: true,
            systemMessages: true
          },
          privacy: {
            profileVisibility: 'public',
            showLocation: true,
            showBirthday: true,
            showPhone: false,
            showEmail: false,
            allowSearch: true,
            allowRecommendation: true
          },
          marketing: {
            emailMarketing: true,
            smsMarketing: true,
            pushMarketing: true,
            personalizedRecommendations: true,
            behaviorTracking: true
          }
        },
        location: {
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          postalCode: '200000'
        }
      }
    ];

    for (const member of testMembers) {
      const created = await pb.collection('members').create(member);
      console.log(`✅ 会员 "${member.nickname}" 创建成功`);
    }
    
    console.log('✅ 所有测试会员数据插入完成');
  } catch (error) {
    console.log(error);
    console.error('❌ 测试会员数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// 插入测试地址数据
async function insertTestAddresses() {
  console.log('📊 开始插入地址测试数据...');
  
  try {
    // 获取会员数据
    const members = await pb.collection('members').getFullList();
    
    if (members.length === 0) {
      throw new Error('请先创建会员数据');
    }
    
    const testAddresses = [
      // 第一个会员的地址
      {
        user_id: members[0].id,
        name: '张小姐',
        phone: '13800138001',
        email: 'zhang@example.com',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        street: '科技园南区',
        address: '深圳湾科技生态园10栋A座',
        detail_address: '2001室',
        postal_code: '518057',
        longitude: 113.942578,
        latitude: 22.531309,
        tag: '公司',
        tag_color: '#1890ff',
        is_default: true,
        is_active: true,
        is_verified: true,
        verification_status: 'VERIFIED',
        verification_method: 'AUTO',
        verification_time: '2023-06-15',
        usage_count: 15,
        last_used_at: '2024-01-15',
        order_count: 12,
        source: 'MANUAL',
        source_details: '用户手动添加'
      },
      {
        user_id: members[0].id,
        name: '张小姐',
        phone: '13800138001',
        province: '广东省',
        city: '深圳市',
        district: '福田区',
        street: '华强北街道',
        address: '华强北路1234号',
        detail_address: '华强广场B座1505',
        postal_code: '518031',
        longitude: 114.088947,
        latitude: 22.548857,
        tag: '家',
        tag_color: '#52c41a',
        is_default: false,
        is_active: true,
        is_verified: true,
        verification_status: 'VERIFIED',
        verification_method: 'MANUAL',
        verification_time: '2023-08-20',
        usage_count: 8,
        last_used_at: '2024-01-10',
        order_count: 6,
        source: 'LOCATION',
        source_details: '通过定位获取'
      },
      // 第二个会员的地址
      {
        user_id: members[1].id,
        name: '李先生',
        phone: '13900139002',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        street: '三里屯',
        address: '三里屯太古里南区',
        detail_address: 'S8-32',
        postal_code: '100027',
        longitude: 116.456297,
        latitude: 39.937095,
        tag: '收货地址',
        tag_color: '#fa8c16',
        is_default: true,
        is_active: true,
        is_verified: false,
        verification_status: 'PENDING',
        usage_count: 2,
        last_used_at: '2024-01-18',
        order_count: 2,
        source: 'MANUAL',
        source_details: '新用户首次添加'
      },
      // 第三个会员的地址
      {
        user_id: members[2].id,
        name: '王女士',
        phone: '13700137003',
        email: 'wang@example.com',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        street: '陆家嘴',
        address: '世纪大道1号',
        detail_address: '东方明珠塔旁金茂大厦88层',
        postal_code: '200120',
        longitude: 121.506377,
        latitude: 31.245944,
        tag: '办公室',
        tag_color: '#722ed1',
        is_default: true,
        is_active: true,
        is_verified: true,
        verification_status: 'VERIFIED',
        verification_method: 'THIRD_PARTY',
        verification_time: '2022-03-25',
        usage_count: 45,
        last_used_at: '2024-01-18',
        order_count: 38,
        source: 'IMPORT',
        source_details: '从第三方平台导入'
      },
      {
        user_id: members[2].id,
        name: '王女士',
        phone: '13700137003',
        province: '上海市',
        city: '上海市',
        district: '静安区',
        street: '南京西路',
        address: '南京西路1788号',
        detail_address: '高端住宅区A栋2902室',
        postal_code: '200040',
        longitude: 121.445201,
        latitude: 31.234419,
        tag: '家',
        tag_color: '#eb2f96',
        is_default: false,
        is_active: true,
        is_verified: true,
        verification_status: 'VERIFIED',
        verification_method: 'AUTO',
        verification_time: '2022-05-10',
        usage_count: 25,
        last_used_at: '2024-01-12',
        order_count: 20,
        source: 'MANUAL',
        source_details: '用户添加家庭住址'
      }
    ];

    for (const address of testAddresses) {
      const created = await pb.collection('addresses').create(address);
      console.log(`✅ 地址 "${address.tag}" 创建成功`);
    }
    
    console.log('✅ 所有测试地址数据插入完成');
  } catch (error) {
    console.log(error);
    console.error('❌ 测试地址数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 主函数 =========================
async function main() {
  try {
    await authenticate();
    
    console.log('🗑️ 删除现有集合...');
    // 按依赖关系的反序删除集合
    await deleteCollectionIfExists('points_exchange_records');
    await deleteCollectionIfExists('points_records');
    await deleteCollectionIfExists('address_usage_records');
    await deleteCollectionIfExists('member_tag_relations');
    await deleteCollectionIfExists('addresses');
    await deleteCollectionIfExists('members');
    await deleteCollectionIfExists('address_templates');
    await deleteCollectionIfExists('points_exchanges');
    await deleteCollectionIfExists('points_rules');
    await deleteCollectionIfExists('member_tags');
    await deleteCollectionIfExists('regions');
    await deleteCollectionIfExists('member_levels');
    
    console.log('🚀 开始创建会员系统集合...');
    
    // 创建基础集合（无依赖）
    const memberLevels = await createMemberLevelsCollection();
    const regions = await createRegionsCollection();
    const memberTags = await createMemberTagsCollection();
    const pointsRules = await createPointsRulesCollection();
    const pointsExchanges = await createPointsExchangesCollection();
    const addressTemplates = await createAddressTemplatesCollection();
    
    // 创建依赖集合
    const members = await createMembersCollection();
    const addresses = await createAddressesCollection();
    const memberTagRelations = await createMemberTagRelationsCollection();
    const pointsRecords = await createPointsRecordsCollection();
    const pointsExchangeRecords = await createPointsExchangeRecordsCollection();
    const addressUsageRecords = await createAddressUsageRecordsCollection();
    
    // 存储集合引用以便更新关联
    const createdCollections = {
      member_levels: memberLevels,
      regions: regions,
      member_tags: memberTags,
      points_rules: pointsRules,
      points_exchanges: pointsExchanges,
      address_templates: addressTemplates,
      members: members,
      addresses: addresses,
      member_tag_relations: memberTagRelations,
      points_records: pointsRecords,
      points_exchange_records: pointsExchangeRecords,
      address_usage_records: addressUsageRecords
    };
    
    console.log('🔗 更新集合关联关系...');
    await updateCollectionRelations(createdCollections);
    
    console.log('📊 开始插入测试数据...');
    await insertTestMemberLevels();
    await insertTestMemberTags();
    await insertTestPointsRules();
    await insertTestPointsExchanges();
    await insertTestRegions();
    await insertTestMembers();
    await insertTestAddresses();
    
    console.log('🎉 所有会员系统集合和测试数据创建完成！');
    console.log('📈 数据统计:');
    console.log('  - 会员等级: 5个');
    console.log('  - 会员标签: 5个');
    console.log('  - 积分规则: 5个');
    console.log('  - 积分兑换: 5个');
    console.log('  - 地区数据: 8个');
    console.log('  - 测试会员: 3个');
    console.log('  - 测试地址: 5个');
    console.log('');
    console.log('🌟 会员系统功能特性:');
    console.log('  ✅ 完整的会员等级体系');
    console.log('  ✅ 灵活的会员标签系统');
    console.log('  ✅ 完善的积分奖励机制');
    console.log('  ✅ 丰富的积分兑换商城');
    console.log('  ✅ 精准的地址管理系统');
    console.log('  ✅ 智能的用户风控体系');
    console.log('  ✅ 详细的统计分析功能');
    console.log('');
    console.log('🔧 下一步可以:');
    console.log('  - 在管理后台配置具体的积分规则');
    console.log('  - 设置会员等级的升级条件');
    console.log('  - 添加更多积分兑换商品');
    console.log('  - 配置会员标签的自动分配规则');
    console.log('  - 导入更多地区数据');
    
  } catch (error) {
    console.error('❌ 脚本执行失败:', getErrorMessage(error));
    Deno.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.main) {
  main();
} 