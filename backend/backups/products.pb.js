// 产品集合相关的业务逻辑钩子

// 创建产品前的验证
onRecordBeforeCreateRequest((e) => {
  if (e.collection.name !== 'products') return;
  
  const data = e.record;
  
  // 验证产品名称不能为空
  if (!data.getString('name') || data.getString('name').trim() === '') {
    throw new BadRequestError('产品名称不能为空');
  }
  
  // 验证价格必须为正数
  if (data.getFloat('price') < 0) {
    throw new BadRequestError('产品价格不能为负数');
  }
  
  // 自动设置创建时间戳
  data.set('created', new Date().toISOString());
  
  console.log(`📝 Creating product: ${data.getString('name')}`);
});

// 创建产品后的处理
onRecordAfterCreateRequest((e) => {
  if (e.collection.name !== 'products') return;
  
  const record = e.record;
  console.log(`✅ Product created successfully: ${record.getString('name')} (ID: ${record.id})`);
  
  // 这里可以添加额外的处理逻辑，比如发送通知、更新缓存等
});

// 更新产品前的验证
onRecordBeforeUpdateRequest((e) => {
  if (e.collection.name !== 'products') return;
  
  const data = e.record;
  
  // 验证产品名称不能为空
  if (!data.getString('name') || data.getString('name').trim() === '') {
    throw new BadRequestError('产品名称不能为空');
  }
  
  // 验证价格必须为正数
  if (data.getFloat('price') < 0) {
    throw new BadRequestError('产品价格不能为负数');
  }
  
  // 自动更新修改时间戳
  data.set('updated', new Date().toISOString());
  
  console.log(`📝 Updating product: ${data.getString('name')} (ID: ${data.id})`);
});

// 更新产品后的处理
onRecordAfterUpdateRequest((e) => {
  if (e.collection.name !== 'products') return;
  
  const record = e.record;
  console.log(`✅ Product updated successfully: ${record.getString('name')} (ID: ${record.id})`);
});

// 删除产品前的验证
onRecordBeforeDeleteRequest((e) => {
  if (e.collection.name !== 'products') return;
  
  const record = e.record;
  console.log(`⚠️  Preparing to delete product: ${record.getString('name')} (ID: ${record.id})`);
  
  // 这里可以添加删除前的业务逻辑检查
  // 比如检查是否有关联的订单等
});

// 删除产品后的处理
onRecordAfterDeleteRequest((e) => {
  if (e.collection.name !== 'products') return;
  
  const record = e.record;
  console.log(`✅ Product deleted successfully: ${record.getString('name')} (ID: ${record.id})`);
  
  // 这里可以添加删除后的清理逻辑
}); 