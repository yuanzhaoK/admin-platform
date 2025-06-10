const fetch = require('node-fetch');

async function createProductsCollection() {
  try {
    console.log('🔄 尝试创建products集合...');
    
    // 直接创建集合，不需要认证（如果PocketBase允许）
    const collection = {
      name: 'products',
      type: 'base',
      schema: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'description',
          type: 'text',
          required: false
        },
        {
          name: 'price',
          type: 'number',
          required: false
        },
        {
          name: 'category',
          type: 'text',
          required: false
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['active', 'inactive', 'draft']
          }
        },
        {
          name: 'sku',
          type: 'text',
          required: false
        },
        {
          name: 'stock',
          type: 'number',
          required: false
        }
      ],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: ''
    };
    
    // 尝试通过8090端口直接访问PocketBase
    const response = await fetch('http://localhost:8090/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(collection)
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Products集合创建成功!');
      
      // 创建测试产品
      const testProduct = {
        name: '测试产品',
        description: '这是一个测试产品',
        price: 99.99,
        category: '测试分类',
        status: 'active',
        sku: 'TEST001',
        stock: 10
      };
      
      const productResponse = await fetch('http://localhost:8090/api/collections/products/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testProduct)
      });
      
      const productResult = await productResponse.text();
      console.log('Product creation response:', productResult);
      
      if (productResponse.ok) {
        console.log('✅ 测试产品创建成功!');
      }
    }
  } catch (error) {
    console.error('❌ 错误:', error);
  }
}

createProductsCollection(); 