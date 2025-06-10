const fetch = require('node-fetch');

async function fixProductsRules() {
  try {
    console.log('🔧 开始修复products集合API规则...');
    
    // 1. 获取admin认证
    const authResponse = await fetch('http://localhost:8090/api/admins/auth-with-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    if (!authResponse.ok) {
      throw new Error(`认证失败: ${await authResponse.text()}`);
    }
    
    const authData = await authResponse.json();
    const token = authData.token;
    console.log('✅ Admin认证成功');
    
    // 2. 获取products集合信息
    const getResponse = await fetch('http://localhost:8090/api/collections/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!getResponse.ok) {
      throw new Error(`获取集合失败: ${await getResponse.text()}`);
    }
    
    const collection = await getResponse.json();
    console.log('✅ 获取products集合信息成功');
    
    // 3. 更新API规则为允许所有访问
    collection.listRule = '';
    collection.viewRule = '';
    collection.createRule = '';
    collection.updateRule = '';
    collection.deleteRule = '';
    
    const updateResponse = await fetch('http://localhost:8090/api/collections/products', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(collection)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`更新集合失败: ${await updateResponse.text()}`);
    }
    
    console.log('✅ Products集合API规则已修复!');
    console.log('✅ 现在所有用户都可以访问products API');
    
    // 4. 测试创建产品
    const testProduct = {
      name: '测试产品',
      description: '这是一个测试产品',
      price: 99.99,
      category: '测试分类',
      status: 'active',
      sku: 'TEST001',
      stock: 10
    };
    
    const createResponse = await fetch('http://localhost:8090/api/collections/products/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProduct)
    });
    
    if (createResponse.ok) {
      const product = await createResponse.json();
      console.log('✅ 测试产品创建成功:', product.name);
    } else {
      console.log('⚠️  测试产品创建失败，但API规则已修复');
    }
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
  }
}

fixProductsRules(); 