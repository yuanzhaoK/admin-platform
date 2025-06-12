// 修复select字段格式的order_settings集合创建脚本

class OrderSettingsCollectionCreatorFixed {
  private baseUrl: string;
  private authToken: string = '';

  constructor(baseUrl: string = 'http://localhost:8091') {
    this.baseUrl = baseUrl;
  }

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
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  }

  async deleteCollection(name: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // 生成随机字段ID
  private generateFieldId(type: string): string {
    const randomNum = Math.floor(Math.random() * 9999999999);
    return `${type}${randomNum}`;
  }

  async createOrderSettingsCollection(): Promise<boolean> {
    const collectionData = {
      name: 'order_settings',
      type: 'base',
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id != ""',
      createRule: '@request.auth.role = "admin"',
      updateRule: '@request.auth.role = "admin"',
      deleteRule: '@request.auth.role = "admin"',
      fields: [
        {
          id: this.generateFieldId('text'),
          name: 'setting_key',
          type: 'text',
          required: true,
          unique: true,
          autogeneratePattern: '',
          hidden: false,
          max: 100,
          min: 1,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'setting_value',
          type: 'text',
          required: true,
          autogeneratePattern: '',
          hidden: false,
          max: 1000,
          min: 0,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'description',
          type: 'text',
          required: false,
          autogeneratePattern: '',
          hidden: false,
          max: 500,
          min: 0,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('select'),
          name: 'setting_type',
          type: 'select',
          required: true,
          hidden: false,
          presentable: false,
          system: false,
          maxSelect: 1,
          values: ['string', 'number', 'boolean', 'json']
        },
        {
          id: this.generateFieldId('text'),
          name: 'category',
          type: 'text',
          required: false,
          autogeneratePattern: '',
          hidden: false,
          max: 100,
          min: 0,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('bool'),
          name: 'is_active',
          type: 'bool',
          required: false,
          hidden: false,
          presentable: false,
          system: false
        },
        {
          id: this.generateFieldId('bool'),
          name: 'is_system',
          type: 'bool',
          required: false,
          hidden: false,
          presentable: false,
          system: false
        },
        {
          id: this.generateFieldId('number'),
          name: 'sort_order',
          type: 'number',
          required: false,
          hidden: false,
          max: null,
          min: 0,
          onlyInt: true,
          presentable: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'updated_by',
          type: 'text',
          required: false,
          autogeneratePattern: '',
          hidden: false,
          max: 100,
          min: 0,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        }
      ]
    };

    console.log('📝 使用修复后的格式创建order_settings集合...');

    try {
      const response = await fetch(`${this.baseUrl}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(collectionData),
      });

      console.log('📡 响应状态:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ 集合创建成功！');
        console.log('📋 字段数量:', result.fields?.length || 0);
        
        if (result.fields && result.fields.length > 1) {
          console.log('📝 字段列表:');
          result.fields.forEach((field: any, index: number) => {
            if (field.name !== 'id') {
              console.log(`  ${index}. ${field.name} (${field.type}) - 必填: ${field.required}`);
            }
          });
        }
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ 集合创建失败:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ 创建集合时发生错误:', error);
      return false;
    }
  }

  async createTestSettings(): Promise<void> {
    const testSettings = [
      {
        setting_key: 'order_number_prefix',
        setting_value: 'ORD',
        description: '订单号前缀',
        setting_type: 'string',
        category: 'order_generation',
        is_active: true,
        is_system: true,
        sort_order: 1,
        updated_by: 'admin'
      },
      {
        setting_key: 'order_number_length',
        setting_value: '12',
        description: '订单号总长度',
        setting_type: 'number',
        category: 'order_generation',
        is_active: true,
        is_system: true,
        sort_order: 2,
        updated_by: 'admin'
      },
      {
        setting_key: 'auto_confirm_payment',
        setting_value: 'false',
        description: '是否自动确认支付',
        setting_type: 'boolean',
        category: 'payment',
        is_active: true,
        is_system: false,
        sort_order: 10,
        updated_by: 'admin'
      },
      {
        setting_key: 'default_shipping_fee',
        setting_value: '10.00',
        description: '默认运费',
        setting_type: 'number',
        category: 'shipping',
        is_active: true,
        is_system: false,
        sort_order: 20,
        updated_by: 'admin'
      },
      {
        setting_key: 'free_shipping_threshold',
        setting_value: '99.00',
        description: '免运费门槛',
        setting_type: 'number',
        category: 'shipping',
        is_active: true,
        is_system: false,
        sort_order: 21,
        updated_by: 'admin'
      },
      {
        setting_key: 'order_timeout_minutes',
        setting_value: '30',
        description: '订单超时时间（分钟）',
        setting_type: 'number',
        category: 'order_management',
        is_active: true,
        is_system: false,
        sort_order: 30,
        updated_by: 'admin'
      },
      {
        setting_key: 'allow_guest_checkout',
        setting_value: 'true',
        description: '允许游客结账',
        setting_type: 'boolean',
        category: 'checkout',
        is_active: true,
        is_system: false,
        sort_order: 40,
        updated_by: 'admin'
      },
      {
        setting_key: 'payment_methods',
        setting_value: '{"alipay": true, "wechat": true, "bank_card": true, "cash_on_delivery": false}',
        description: '支持的支付方式',
        setting_type: 'json',
        category: 'payment',
        is_active: true,
        is_system: false,
        sort_order: 11,
        updated_by: 'admin'
      },
      {
        setting_key: 'notification_email',
        setting_value: 'admin@example.com',
        description: '订单通知邮箱',
        setting_type: 'string',
        category: 'notification',
        is_active: true,
        is_system: false,
        sort_order: 50,
        updated_by: 'admin'
      },
      {
        setting_key: 'max_order_items',
        setting_value: '50',
        description: '单个订单最大商品数量',
        setting_type: 'number',
        category: 'order_limits',
        is_active: true,
        is_system: false,
        sort_order: 60,
        updated_by: 'admin'
      }
    ];

    console.log('🧪 创建测试订单设置...');

    for (let i = 0; i < testSettings.length; i++) {
      const settingData = testSettings[i];
      
      try {
        const response = await fetch(`${this.baseUrl}/api/collections/order_settings/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(settingData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ 设置 ${i + 1} 创建成功！`);
          console.log(`  设置键: ${result.setting_key}`);
          console.log(`  设置值: ${result.setting_value}`);
          console.log(`  分类: ${result.category}`);
          console.log(`  类型: ${result.setting_type}`);
        } else {
          const errorData = await response.json();
          console.error(`❌ 设置 ${i + 1} 创建失败:`, errorData);
        }
      } catch (error) {
        console.error(`❌ 创建设置 ${i + 1} 时发生错误:`, error);
      }
    }
  }

  async verifyCollection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/order_settings`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const collection = await response.json();
        console.log('🔍 最终验证:');
        console.log('  集合名称:', collection.name);
        console.log('  集合ID:', collection.id);
        console.log('  字段数量:', collection.fields?.length || 0);
        
        if (collection.fields && collection.fields.length > 1) {
          console.log('✅ 所有字段创建成功！');
          console.log('📝 字段详情:');
          collection.fields.forEach((field: any) => {
            if (field.name !== 'id') {
              console.log(`  - ${field.name} (${field.type}) ${field.required ? '[必填]' : '[可选]'}`);
            }
          });
        } else {
          console.log('❌ 字段创建失败');
        }

        // 检查记录数量
        const recordsResponse = await fetch(`${this.baseUrl}/api/collections/order_settings/records`, {
          headers: { 'Authorization': `Bearer ${this.authToken}` },
        });

        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json();
          console.log('📊 记录统计:');
          console.log('  总记录数:', recordsData.totalItems);
          console.log('  当前页记录数:', recordsData.items.length);
          
          if (recordsData.items.length > 0) {
            console.log('📝 设置示例:');
            recordsData.items.slice(0, 3).forEach((item: any, index: number) => {
              console.log(`  ${index + 1}. ${item.setting_key}: ${item.setting_value} (${item.category})`);
            });
          }
        }
      }
    } catch (error) {
      console.error('❌ 验证集合失败:', error);
    }
  }
}

async function main() {
  console.log('🚀 自动化创建order_settings集合（修复版）...');
  console.log('');

  const creator = new OrderSettingsCollectionCreatorFixed();

  // 1. 登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await creator.adminLogin('ahukpyu@outlook.com', 'kpyu1512..@');
  if (!loginSuccess) {
    console.log('❌ 登录失败');
    return;
  }
  console.log('✅ 登录成功');
  console.log('');

  // 2. 删除现有集合
  console.log('🗑️ 删除现有集合...');
  await creator.deleteCollection('order_settings');
  console.log('✅ 删除完成');
  console.log('');

  // 3. 创建新集合
  console.log('⚙️ 创建新集合...');
  const createSuccess = await creator.createOrderSettingsCollection();
  
  if (!createSuccess) {
    console.log('❌ 集合创建失败');
    return;
  }
  console.log('');

  // 4. 验证集合
  console.log('🔍 验证集合...');
  await creator.verifyCollection();
  console.log('');

  // 5. 创建测试数据
  console.log('🧪 创建测试数据...');
  await creator.createTestSettings();
  console.log('');

  // 6. 最终验证
  console.log('🔍 最终验证...');
  await creator.verifyCollection();

  console.log('');
  console.log('🎉 order_settings集合自动化创建完成！');
  console.log('🌐 PocketBase管理界面: http://localhost:8091/_/');
  console.log('📊 前端设置管理页面: http://localhost:3000/dashboard/settings');
}

if (import.meta.main) {
  await main();
} 