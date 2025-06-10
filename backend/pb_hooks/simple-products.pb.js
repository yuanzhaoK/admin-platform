// 简化的产品集合创建
onAfterBootstrap((e) => {
  console.log('🔄 检查产品集合...');
  
  try {
    $app.dao().findCollectionByNameOrId('products');
    console.log('✅ 产品集合已存在');
  } catch (err) {
    console.log('📝 创建产品集合...');
    
    try {
      const collection = new Collection({
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
      });
      
      $app.dao().saveCollection(collection);
      console.log('✅ 产品集合创建成功!');
      
      // 创建一个测试产品
      const record = new Record(collection, {
        name: '测试产品',
        description: '这是一个测试产品',
        price: 99.99,
        category: '测试分类',
        status: 'active',
        sku: 'TEST001',
        stock: 10
      });
      
      $app.dao().saveRecord(record);
      console.log('✅ 测试产品创建成功!');
      
    } catch (createErr) {
      console.error('❌ 创建产品集合失败:', createErr);
    }
  }
}); 