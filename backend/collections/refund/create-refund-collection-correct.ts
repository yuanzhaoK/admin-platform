// 使用正确PocketBase字段格式创建refund_requests集合

class CorrectRefundCollectionCreator {
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

  async createRefundCollectionCorrectFormat(): Promise<boolean> {
    const collectionData = {
      name: 'refund_requests',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          id: this.generateFieldId('text'),
          name: 'service_number',
          type: 'text',
          required: true,
          unique: true,
          autogeneratePattern: '',
          hidden: false,
          max: 50,
          min: 1,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('relation'),
          name: 'order_id',
          type: 'relation',
          required: true,
          cascadeDelete: false,
          collectionId: 'pbc_3527180448', // orders集合ID
          hidden: false,
          maxSelect: 1,
          minSelect: 0,
          presentable: false,
          system: false
        },
        {
          id: this.generateFieldId('relation'),
          name: 'user_id',
          type: 'relation',
          required: true,
          cascadeDelete: false,
          collectionId: '_pb_users_auth_', // users集合ID
          hidden: false,
          maxSelect: 1,
          minSelect: 0,
          presentable: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'refund_type',
          type: 'text',
          required: true,
          autogeneratePattern: '',
          hidden: false,
          max: 50,
          min: 1,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('number'),
          name: 'refund_amount',
          type: 'number',
          required: true,
          hidden: false,
          max: null,
          min: 0,
          onlyInt: false,
          presentable: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'reason',
          type: 'text',
          required: true,
          autogeneratePattern: '',
          hidden: false,
          max: 200,
          min: 1,
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
          max: 1000,
          min: 0,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'status',
          type: 'text',
          required: true,
          autogeneratePattern: '',
          hidden: false,
          max: 50,
          min: 1,
          pattern: '',
          presentable: false,
          primaryKey: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'admin_notes',
          type: 'text',
          required: false,
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
          id: this.generateFieldId('file'),
          name: 'evidence_images',
          type: 'file',
          required: false,
          hidden: false,
          maxSelect: 5,
          maxSize: 5242880, // 5MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
          presentable: false,
          protected: false,
          system: false,
          thumbs: ['100x100']
        },
        {
          id: this.generateFieldId('date'),
          name: 'processed_at',
          type: 'date',
          required: false,
          hidden: false,
          max: '',
          min: '',
          presentable: false,
          system: false
        },
        {
          id: this.generateFieldId('text'),
          name: 'processed_by',
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

    console.log('📝 使用正确的PocketBase格式创建refund_requests集合...');

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

  async createTestRefunds(): Promise<void> {
    // 获取测试数据
    const [ordersResponse, usersResponse] = await Promise.all([
      fetch(`${this.baseUrl}/api/collections/orders/records?perPage=3`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` },
      }),
      fetch(`${this.baseUrl}/api/collections/users/records?perPage=3`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` },
      }),
    ]);

    if (!ordersResponse.ok || !usersResponse.ok) {
      console.error('❌ 获取订单或用户失败');
      return;
    }

    const [ordersData, usersData] = await Promise.all([
      ordersResponse.json(),
      usersResponse.json(),
    ]);

    if (ordersData.items.length === 0 || usersData.items.length === 0) {
      console.error('❌ 没有找到订单或用户');
      return;
    }

    const testRefunds = [
      {
        service_number: `REF${Date.now()}001`,
        order_id: ordersData.items[0].id,
        user_id: usersData.items[0].id,
        refund_type: '仅退款',
        refund_amount: 299.99,
        reason: '商品质量问题',
        description: '收到的商品与描述不符，申请退款处理',
        status: '待处理',
        admin_notes: '客户反馈商品质量问题，需要进一步核实',
        processed_by: '',
      },
      {
        service_number: `REF${Date.now()}002`,
        order_id: ordersData.items[1]?.id || ordersData.items[0].id,
        user_id: usersData.items[1]?.id || usersData.items[0].id,
        refund_type: '退货退款',
        refund_amount: 159.50,
        reason: '尺寸不合适',
        description: '购买的商品尺寸与预期不符，需要退货退款',
        status: '已批准',
        admin_notes: '已确认退货原因，批准退款申请',
        processed_by: 'admin',
        processed_at: new Date().toISOString(),
      },
      {
        service_number: `REF${Date.now()}003`,
        order_id: ordersData.items[2]?.id || ordersData.items[0].id,
        user_id: usersData.items[2]?.id || usersData.items[0].id,
        refund_type: '换货',
        refund_amount: 0,
        reason: '商品损坏',
        description: '收到的商品在运输过程中损坏，申请换货',
        status: '处理中',
        admin_notes: '已联系物流公司核实损坏情况',
        processed_by: 'admin',
      }
    ];

    console.log('🧪 创建测试退货申请...');

    for (let i = 0; i < testRefunds.length; i++) {
      const refundData = testRefunds[i];
      
      try {
        const response = await fetch(`${this.baseUrl}/api/collections/refund_requests/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(refundData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ 测试退货申请 ${i + 1} 创建成功！`);
          console.log(`  服务单号: ${result.service_number}`);
          console.log(`  退款类型: ${result.refund_type}`);
          console.log(`  退款金额: ${result.refund_amount}`);
          console.log(`  申请状态: ${result.status}`);
        } else {
          const errorData = await response.json();
          console.error(`❌ 测试退货申请 ${i + 1} 创建失败:`, errorData);
        }
      } catch (error) {
        console.error(`❌ 创建测试退货申请 ${i + 1} 时发生错误:`, error);
      }
    }
  }

  async verifyCollection(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/refund_requests`, {
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
        const recordsResponse = await fetch(`${this.baseUrl}/api/collections/refund_requests/records`, {
          headers: { 'Authorization': `Bearer ${this.authToken}` },
        });

        if (recordsResponse.ok) {
          const recordsData = await recordsResponse.json();
          console.log('📊 记录统计:');
          console.log('  总记录数:', recordsData.totalItems);
          console.log('  当前页记录数:', recordsData.items.length);
        }
      }
    } catch (error) {
      console.error('❌ 验证集合失败:', error);
    }
  }
}

async function main() {
  console.log('🚀 使用正确格式自动化创建refund_requests集合...');
  console.log('');

  const creator = new CorrectRefundCollectionCreator();

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
  await creator.deleteCollection('refund_requests');
  console.log('✅ 删除完成');
  console.log('');

  // 3. 创建新集合
  console.log('💰 创建新集合...');
  const createSuccess = await creator.createRefundCollectionCorrectFormat();
  
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
  await creator.createTestRefunds();
  console.log('');

  // 6. 最终验证
  console.log('🔍 最终验证...');
  await creator.verifyCollection();

  console.log('');
  console.log('🎉 refund_requests集合自动化创建完成！');
  console.log('🌐 PocketBase管理界面: http://localhost:8091/_/');
  console.log('📊 前端退货管理页面: http://localhost:3000/dashboard/orders/refunds');
}

if (import.meta.main) {
  await main();
} 