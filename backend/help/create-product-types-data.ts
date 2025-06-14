#!/usr/bin/env deno run --allow-net --allow-env

/**
 * 通过GraphQL API创建商品类型测试数据
 */

const GRAPHQL_URL = Deno.env.get('GRAPHQL_URL') || 'http://localhost:8082/graphql';

const productTypesData = [
  {
    name: '电子设备',
    description: '手机、平板、电脑等电子设备',
    status: 'active',
    attributes: [
      { name: '尺寸', type: 'text', required: true },
      { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '金色', '银色'] },
      { name: '存储容量', type: 'select', required: false, options: ['64GB', '128GB', '256GB', '512GB'] },
      { name: '屏幕尺寸', type: 'number', required: false },
      { name: '是否支持5G', type: 'boolean', required: false }
    ]
  },
  {
    name: '服装鞋帽',
    description: '各类服装、鞋子、帽子等',
    status: 'active',
    attributes: [
      { name: '尺码', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '红色', '蓝色', '灰色', '咖啡色'] },
      { name: '材质', type: 'text', required: false },
      { name: '季节', type: 'select', required: false, options: ['春季', '夏季', '秋季', '冬季'] },
      { name: '适用性别', type: 'select', required: true, options: ['男性', '女性', '中性'] }
    ]
  },
  {
    name: '图书文具',
    description: '各类书籍、文具用品',
    status: 'active',
    attributes: [
      { name: '作者', type: 'text', required: true },
      { name: '出版社', type: 'text', required: true },
      { name: 'ISBN', type: 'text', required: false },
      { name: '页数', type: 'number', required: false },
      { name: '语言', type: 'select', required: true, options: ['中文', '英文', '日文', '其他'] },
      { name: '装帧方式', type: 'select', required: false, options: ['平装', '精装', '电子版'] }
    ]
  },
  {
    name: '家居用品',
    description: '家具、装饰品等家居用品',
    status: 'active',
    attributes: [
      { name: '材质', type: 'select', required: true, options: ['实木', '板材', '金属', '塑料', '玻璃', '陶瓷'] },
      { name: '颜色', type: 'text', required: false },
      { name: '尺寸', type: 'text', required: true },
      { name: '风格', type: 'select', required: false, options: ['现代简约', '欧式', '中式', '美式', '北欧'] },
      { name: '适用房间', type: 'multiselect', required: false, options: ['客厅', '卧室', '厨房', '书房', '卫生间'] }
    ]
  },
  {
    name: '食品饮料',
    description: '各类食品、饮料、调料等',
    status: 'active',
    attributes: [
      { name: '保质期', type: 'text', required: true },
      { name: '净含量', type: 'text', required: true },
      { name: '产地', type: 'text', required: false },
      { name: '口味', type: 'select', required: false, options: ['甜味', '咸味', '酸味', '辣味', '苦味', '原味'] },
      { name: '包装规格', type: 'text', required: false },
      { name: '储存方式', type: 'select', required: true, options: ['常温', '冷藏', '冷冻'] }
    ]
  },
  {
    name: '美妆护肤',
    description: '化妆品、护肤品等',
    status: 'active',
    attributes: [
      { name: '品牌', type: 'text', required: true },
      { name: '适用肤质', type: 'multiselect', required: false, options: ['干性', '油性', '混合性', '敏感性', '中性'] },
      { name: '适用年龄', type: 'select', required: false, options: ['青少年', '青年', '中年', '老年', '全年龄'] },
      { name: '容量规格', type: 'text', required: true },
      { name: '功效', type: 'multiselect', required: false, options: ['保湿', '美白', '抗衰老', '防晒', '控油', '祛痘'] }
    ]
  },
  {
    name: '运动户外',
    description: '运动器材、户外用品等',
    status: 'active',
    attributes: [
      { name: '运动类型', type: 'select', required: true, options: ['跑步', '健身', '游泳', '篮球', '足球', '登山', '骑行'] },
      { name: '适用性别', type: 'select', required: true, options: ['男性', '女性', '中性'] },
      { name: '尺码', type: 'select', required: false, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
      { name: '材质', type: 'text', required: false },
      { name: '重量', type: 'number', required: false }
    ]
  },
  {
    name: '母婴用品',
    description: '婴幼儿用品、孕妇用品等',
    status: 'active',
    attributes: [
      { name: '适用年龄', type: 'select', required: true, options: ['0-6个月', '6-12个月', '1-2岁', '2-3岁', '3岁以上', '孕妇'] },
      { name: '材质', type: 'text', required: true },
      { name: '安全认证', type: 'multiselect', required: false, options: ['3C认证', 'CE认证', 'FDA认证', '有机认证'] },
      { name: '功能特点', type: 'multiselect', required: false, options: ['防过敏', '易清洗', '可折叠', '便携式', '多功能'] },
      { name: '颜色', type: 'select', required: false, options: ['粉色', '蓝色', '黄色', '绿色', '白色', '彩色'] }
    ]
  }
];

async function createProductType(data: any) {
  const mutation = `
    mutation CreateProductType($input: ProductTypeInput!) {
      createProductType(input: $input) {
        id
        name
        status
        created
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: data
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(result.errors)}`);
  }

  return result.data.createProductType;
}

async function main() {
  console.log('🚀 开始创建商品类型测试数据...');
  console.log(`📡 GraphQL URL: ${GRAPHQL_URL}`);
  console.log('');

  let successCount = 0;
  let failureCount = 0;

  for (const [index, typeData] of productTypesData.entries()) {
    try {
      console.log(`📦 正在创建商品类型 ${index + 1}/${productTypesData.length}: ${typeData.name}`);
      
      const result = await createProductType(typeData);
      console.log(`✅ 创建成功: ${result.name} (ID: ${result.id})`);
      successCount++;
      
      // 添加小延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ 创建失败: ${typeData.name}`);
      console.error(`   错误信息: ${error instanceof Error ? error.message : String(error)}`);
      failureCount++;
    }
  }

  console.log('');
  console.log('📊 创建结果统计:');
  console.log(`   ✅ 成功: ${successCount} 个`);
  console.log(`   ❌ 失败: ${failureCount} 个`);
  console.log(`   📋 总计: ${productTypesData.length} 个`);
  
  if (successCount > 0) {
    console.log('');
    console.log('🔗 你现在可以在以下地址查看:');
    console.log('   - GraphQL 查询: http://localhost:8082/graphql');
    console.log('   - 前端商品类型页面: http://localhost:3000/dashboard/products/types');
  }

  if (failureCount > 0) {
    console.log('');
    console.log('⚠️  部分数据创建失败，请检查:');
    console.log('   1. GraphQL 服务器是否正在运行');
    console.log('   2. PocketBase 是否正在运行');
    console.log('   3. product_types 集合是否已创建');
  }
}

// 运行主函数
if (import.meta.main) {
  await main();
} 