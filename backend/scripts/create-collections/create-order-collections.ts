// Deno 版本的订单集合创建脚本
import { join } from '@std/path';

interface PocketBaseResponse {
  success: boolean;
  data?: any;
  error?: string;
}

interface CollectionSchema {
  name: string;
  type: 'base' | 'auth';
  schema: FieldSchema[];
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  options?: any;
}

interface FieldSchema {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  options?: any;
}

class PocketBaseManager {
  private baseUrl: string;
  private authToken: string = '';

  constructor(baseUrl: string = 'http://localhost:8091') {
    this.baseUrl = baseUrl;
  }

  // 管理员登录
  async adminLogin(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.token;
        console.log('✅ 管理员登录成功');
        return true;
      } else {
        console.log('❌ 管理员登录失败');
        return false;
      }
    } catch (error) {
      console.error('❌ 登录错误:', error);
      return false;
    }
  }

  // 创建集合
  async createCollection(schema: CollectionSchema): Promise<PocketBaseResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(schema),
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || '创建集合失败' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 检查集合是否存在
  async collectionExists(name: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/${name}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // 创建记录
  async createRecord(collection: string, data: any): Promise<PocketBaseResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/${collection}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (response.ok) {
        return { success: true, data: responseData };
      } else {
        return { success: false, error: responseData.message || '创建记录失败' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

async function createOrderCollections() {
  console.log('🚀 开始创建订单管理模块集合...');
  console.log('');

  const pb = new PocketBaseManager();

  // 1. 管理员登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await pb.adminLogin('ahukpyu@outlook.com', 'kpyu1512..@');
  
  if (!loginSuccess) {
    console.log('❌ 管理员登录失败，请检查账号密码');
    return;
  }

  console.log('');

  // 2. 检查并创建users集合
  console.log('👤 检查users集合...');
  const usersExists = await pb.collectionExists('users');
  
  if (!usersExists) {
    console.log('📝 创建users集合...');
    const usersSchema: CollectionSchema = {
      name: 'users',
      type: 'auth',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: false,
          options: {
            max: 100
          }
        },
        {
          name: 'avatar',
          type: 'file',
          required: false,
          options: {
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/gif']
          }
        },
        {
          name: 'role',
          type: 'select',
          required: false,
          options: {
            maxSelect: 1,
            values: ['admin', 'user']
          }
        }
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '',
      updateRule: '@request.auth.id = id',
      deleteRule: '@request.auth.id = id || @request.auth.role = "admin"',
      options: {
        allowEmailAuth: true,
        allowUsernameAuth: false,
        allowOAuth2Auth: false,
        requireEmail: true,
        exceptEmailDomains: [],
        onlyEmailDomains: [],
        minPasswordLength: 6
      }
    };

    const result = await pb.createCollection(usersSchema);
    if (result.success) {
      console.log('✅ users集合创建成功');
    } else {
      console.log('❌ users集合创建失败:', result.error);
    }
  } else {
    console.log('✅ users集合已存在');
  }

  // 3. 创建orders集合
  console.log('🛒 创建orders集合...');
  const ordersExists = await pb.collectionExists('orders');
  
  if (!ordersExists) {
    const ordersSchema: CollectionSchema = {
      name: 'orders',
      type: 'base',
      schema: [
        {
          name: 'order_number',
          type: 'text',
          required: true,
          unique: true,
          options: {
            max: 50,
            pattern: '^ORD[0-9]{8}$'
          }
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: false,
            maxSelect: 1,
            displayFields: ['email', 'name']
          }
        },
        {
          name: 'total_amount',
          type: 'number',
          required: true,
          options: {
            min: 0,
            noDecimal: false
          }
        },
        {
          name: 'payment_method',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['alipay', 'wechat', 'credit_card', 'bank_transfer', 'cash_on_delivery']
          }
        },
        {
          name: 'order_source',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['web', 'mobile_app', 'wechat_mini_program', 'h5', 'api']
          }
        },
        {
          name: 'order_type',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['normal', 'pre_order', 'group_buy', 'flash_sale', 'gift']
          }
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunding', 'refunded']
          }
        },
        {
          name: 'items',
          type: 'json',
          required: true,
          options: {}
        },
        {
          name: 'shipping_address',
          type: 'json',
          required: true,
          options: {}
        },
        {
          name: 'logistics_info',
          type: 'json',
          required: false,
          options: {}
        },
        {
          name: 'notes',
          type: 'text',
          required: false,
          options: {
            max: 1000
          }
        },
        {
          name: 'shipped_at',
          type: 'date',
          required: false,
          options: {}
        },
        {
          name: 'delivered_at',
          type: 'date',
          required: false,
          options: {}
        }
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.role = "admin"'
    };

    const result = await pb.createCollection(ordersSchema);
    if (result.success) {
      console.log('✅ orders集合创建成功');
    } else {
      console.log('❌ orders集合创建失败:', result.error);
    }
  } else {
    console.log('⚠️ orders集合已存在');
  }

  // 4. 创建order_settings集合
  console.log('⚙️ 创建order_settings集合...');
  const settingsExists = await pb.collectionExists('order_settings');
  
  if (!settingsExists) {
    const settingsSchema: CollectionSchema = {
      name: 'order_settings',
      type: 'base',
      schema: [
        {
          name: 'setting_key',
          type: 'text',
          required: true,
          unique: true,
          options: {
            max: 100
          }
        },
        {
          name: 'setting_name',
          type: 'text',
          required: true,
          options: {
            max: 200
          }
        },
        {
          name: 'setting_value',
          type: 'text',
          required: true,
          options: {
            max: 500
          }
        },
        {
          name: 'setting_type',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['number', 'boolean', 'text', 'json']
          }
        },
        {
          name: 'description',
          type: 'text',
          required: false,
          options: {
            max: 500
          }
        },
        {
          name: 'category',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['payment', 'shipping', 'timeout', 'auto_operations', 'notifications']
          }
        }
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.role = "admin"',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"'
    };

    const result = await pb.createCollection(settingsSchema);
    if (result.success) {
      console.log('✅ order_settings集合创建成功');

      // 创建默认设置
      console.log('📝 创建默认设置...');
      const defaultSettings = [
        {
          setting_key: 'payment_timeout',
          setting_name: '订单支付超时时间',
          setting_value: '30',
          setting_type: 'number',
          description: '订单支付超时时间（分钟）',
          category: 'payment'
        },
        {
          setting_key: 'auto_cancel_unpaid',
          setting_name: '自动取消未支付订单',
          setting_value: 'true',
          setting_type: 'boolean',
          description: '是否自动取消超时未支付的订单',
          category: 'auto_operations'
        },
        {
          setting_key: 'shipping_timeout',
          setting_name: '发货超时时间',
          setting_value: '72',
          setting_type: 'number',
          description: '订单发货超时时间（小时）',
          category: 'shipping'
        },
        {
          setting_key: 'auto_complete_timeout',
          setting_name: '订单自动完成时间',
          setting_value: '7',
          setting_type: 'number',
          description: '订单自动完成时间（天）',
          category: 'auto_operations'
        },
        {
          setting_key: 'flash_sale_duration',
          setting_name: '秒杀活动持续时间',
          setting_value: '60',
          setting_type: 'number',
          description: '秒杀活动持续时间（分钟）',
          category: 'payment'
        }
      ];

      for (const setting of defaultSettings) {
        const settingResult = await pb.createRecord('order_settings', setting);
        if (settingResult.success) {
          console.log(`✅ 创建设置: ${setting.setting_name}`);
        } else {
          console.log(`⚠️ 设置创建失败或已存在: ${setting.setting_name}`);
        }
      }
    } else {
      console.log('❌ order_settings集合创建失败:', result.error);
    }
  } else {
    console.log('⚠️ order_settings集合已存在');
  }

  // 5. 创建refund_requests集合
  console.log('💰 创建refund_requests集合...');
  const refundsExists = await pb.collectionExists('refund_requests');
  
  if (!refundsExists) {
    const refundsSchema: CollectionSchema = {
      name: 'refund_requests',
      type: 'base',
      schema: [
        {
          name: 'service_number',
          type: 'text',
          required: true,
          unique: true,
          options: {
            max: 50,
            pattern: '^SRV[0-9]{8}$'
          }
        },
        {
          name: 'order_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'orders',
            cascadeDelete: false,
            maxSelect: 1,
            displayFields: ['order_number']
          }
        },
        {
          name: 'user_id',
          type: 'relation',
          required: true,
          options: {
            collectionId: 'users',
            cascadeDelete: false,
            maxSelect: 1,
            displayFields: ['email', 'name']
          }
        },
        {
          name: 'refund_type',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['refund_only', 'return_and_refund', 'exchange']
          }
        },
        {
          name: 'refund_amount',
          type: 'number',
          required: true,
          options: {
            min: 0,
            noDecimal: false
          }
        },
        {
          name: 'reason',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['quality_issue', 'wrong_item', 'damaged_in_transit', 'not_as_described', 'size_issue', 'change_of_mind', 'other']
          }
        },
        {
          name: 'description',
          type: 'text',
          required: true,
          options: {
            min: 10,
            max: 1000
          }
        },
        {
          name: 'evidence_images',
          type: 'file',
          required: false,
          options: {
            maxSelect: 5,
            maxSize: 5242880,
            mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            thumbs: ['100x100']
          }
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled']
          }
        },
        {
          name: 'admin_notes',
          type: 'text',
          required: false,
          options: {
            max: 1000
          }
        },
        {
          name: 'processed_at',
          type: 'date',
          required: false,
          options: {}
        },
        {
          name: 'processed_by',
          type: 'relation',
          required: false,
          options: {
            collectionId: 'users',
            cascadeDelete: false,
            maxSelect: 1,
            displayFields: ['email', 'name']
          }
        }
      ],
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != ""',
      deleteRule: '@request.auth.role = "admin"'
    };

    const result = await pb.createCollection(refundsSchema);
    if (result.success) {
      console.log('✅ refund_requests集合创建成功');
    } else {
      console.log('❌ refund_requests集合创建失败:', result.error);
    }
  } else {
    console.log('⚠️ refund_requests集合已存在');
  }

  // 6. 创建测试用户
  console.log('👤 创建测试用户...');
  const testUserData = {
    email: 'test@example.com',
    password: 'test123456',
    passwordConfirm: 'test123456',
    name: '测试用户',
    role: 'user',
    verified: true
  };

  const userResult = await pb.createRecord('users', testUserData);
  if (userResult.success) {
    console.log('✅ 测试用户创建成功');
    console.log('📧 邮箱: test@example.com');
    console.log('🔑 密码: test123456');
  } else {
    console.log('⚠️ 测试用户创建失败或已存在');
  }

  console.log('');
  console.log('🎉 订单管理模块集合创建完成！');
  console.log('');
  console.log('📋 创建的集合:');
  console.log('✅ users - 用户集合');
  console.log('✅ orders - 订单集合');
  console.log('✅ order_settings - 订单设置集合');
  console.log('✅ refund_requests - 退货申请集合');
  console.log('');
  console.log('🌐 管理界面: http://localhost:8091/_/');
  console.log('📧 管理员: admin@example.com / admin123');
  console.log('👤 测试用户: test@example.com / test123456');
}

// 主函数
if (import.meta.main) {
  try {
    await createOrderCollections();
    console.log('✅ 脚本执行完成');
  } catch (error) {
    console.error('❌ 脚本执行失败:', error);
    Deno.exit(1);
  }
} 