// 手动创建products集合的脚本
// 在浏览器控制台中运行

const createProductsCollection = async () => {
  const adminAuth = await fetch('http://localhost:8091/api/admins/auth-with-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identity: 'admin@example.com',
      password: 'admin123'
    })
  });
  
  if (!adminAuth.ok) {
    console.error('Admin auth failed:', await adminAuth.text());
    return;
  }
  
  const authData = await adminAuth.json();
  const token = authData.token;
  
  // 创建products集合
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
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""'
  };
  
  const createResponse = await fetch('http://localhost:8091/api/collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(collection)
  });
  
  if (createResponse.ok) {
    console.log('✅ Products collection created successfully!');
    
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
    
    const productResponse = await fetch('http://localhost:8091/api/collections/products/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testProduct)
    });
    
    if (productResponse.ok) {
      console.log('✅ Test product created successfully!');
    } else {
      console.error('❌ Failed to create test product:', await productResponse.text());
    }
  } else {
    console.error('❌ Failed to create collection:', await createResponse.text());
  }
};

// 运行脚本
createProductsCollection(); 