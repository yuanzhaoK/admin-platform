#!/usr/bin/env -S deno run --allow-all

// 为现有集合添加测试数据

class TestDataCreator {
  private baseUrl: string;
  private authToken: string = '';

  constructor(baseUrl: string = 'http://localhost:8090') {
    this.baseUrl = baseUrl;
  }

  async adminLogin(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password: password }),
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

  async createTestData(collectionName: string, data: any[]): Promise<void> {
    console.log(`📦 为 ${collectionName} 集合创建测试数据...`);
    
    for (const [index, item] of data.entries()) {
      try {
        const response = await fetch(`${this.baseUrl}/api/collections/${collectionName}/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(item),
        });

        if (response.ok) {
          console.log(`  ✅ 测试数据 ${index + 1} 创建成功`);
        } else {
          const error = await response.text();
          console.log(`  ⚠️  测试数据 ${index + 1} 创建失败:`, error);
        }
      } catch (error) {
        console.log(`  ❌ 创建测试数据 ${index + 1} 时发生错误:`, error);
      }
    }
  }

  async addProductTestData(): Promise<void> {
    // 为简单的products集合创建测试数据
    const productNames = [
      'iPhone 15 Pro Max', 'MacBook Air M2', 'AirPods Pro 2代', 'Nike Air Max 270', 'Adidas Ultra Boost 22',
      'Uniqlo羽绒服', '小米13 Ultra', '华为Mate 60 Pro', 'Tesla Model S钥匙扣', 'MUJI懒人沙发',
      '宜家书架', '海尔冰箱', '《JavaScript高级程序设计》', '《Vue.js设计与实现》', '《深入理解计算机系统》',
      '星巴克咖啡豆', '元气森林苏打水', '三只松鼠坚果', 'SK-II神仙水', '兰蔻小黑瓶'
    ];

    const categories = ['电子产品', '服装鞋帽', '家居用品', '图书文具', '食品饮料', '美妆护肤'];

    const productData = productNames.map((name, index) => ({
      name: name,
      description: `这是 ${name} 的详细描述。产品采用优质材料制作，工艺精良，品质保证。适合日常使用，是您的理想选择。`,
      price: Math.floor(Math.random() * 5000) + 100,
      category: categories[index % categories.length],
      status: ['active', 'inactive'][index % 2],
      sku: `SKU-${String(index + 1).padStart(4, '0')}`,
      stock: Math.floor(Math.random() * 1000) + 10
    }));

    await this.createTestData('products', productData);
  }

  async linkProductsToCategories(): Promise<void> {
    console.log('\n🔗 为products集合添加关联字段的测试数据...');
    
    // 获取分类ID
    try {
      const categoriesResponse = await fetch(`${this.baseUrl}/api/collections/product_categories/records`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      
      if (!categoriesResponse.ok) {
        console.log('⚠️  无法获取商品分类，跳过关联');
        return;
      }
      
      const categoriesData = await categoriesResponse.json();
      const categories = categoriesData.items;
      
      // 获取品牌ID
      const brandsResponse = await fetch(`${this.baseUrl}/api/collections/brands/records`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      
      if (!brandsResponse.ok) {
        console.log('⚠️  无法获取品牌，跳过关联');
        return;
      }
      
      const brandsData = await brandsResponse.json();
      const brands = brandsData.items;
      
      // 获取商品类型ID
      const typesResponse = await fetch(`${this.baseUrl}/api/collections/product_types/records`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      
      if (!typesResponse.ok) {
        console.log('⚠️  无法获取商品类型，跳过关联');
        return;
      }
      
      const typesData = await typesResponse.json();
      const types = typesData.items;
      
      console.log(`✅ 找到 ${categories.length} 个分类, ${brands.length} 个品牌, ${types.length} 个商品类型`);
      
    } catch (error) {
      console.log('⚠️  获取关联数据失败:', error);
    }
  }

  async addAllTestData(): Promise<boolean> {
    try {
      // 添加商品测试数据
      await this.addProductTestData();
      
      // 尝试建立关联
      await this.linkProductsToCategories();
      
      return true;
    } catch (error) {
      console.error('❌ 添加测试数据时发生错误:', error);
      return false;
    }
  }
}

async function main() {
  console.log('🚀 PocketBase 测试数据添加工具');
  console.log('===============================\n');

  const baseUrl = 'http://localhost:8090';
  const adminEmail = 'ahukpyu@outlook.com';
  const adminPassword = 'kpyu1512..@';

  console.log('📋 配置信息:');
  console.log(`   PocketBase URL: ${baseUrl}`);
  console.log(`   管理员邮箱: ${adminEmail}`);
  console.log('');

  const creator = new TestDataCreator(baseUrl);

  console.log('🔐 管理员登录...');
  const loginSuccess = await creator.adminLogin(adminEmail, adminPassword);

  if (!loginSuccess) {
    console.error('❌ 登录失败，请检查管理员账号和密码');
    return;
  }

  console.log('✅ 登录成功！');
  console.log('');

  const success = await creator.addAllTestData();

  if (success) {
    console.log('\n🎉 测试数据添加完成！');
    console.log('\n📋 已添加数据:');
    console.log('   - products: 20条商品测试数据');
    console.log('\n📝 后续步骤:');
    console.log(`   1. 访问 ${baseUrl}/_/ 查看管理界面`);
    console.log('   2. 检查集合数据');
    console.log('   3. 测试 GraphQL API');
  } else {
    console.log('\n❌ 添加失败，请检查日志并重试');
  }
}

if (import.meta.main) {
  await main();
} 