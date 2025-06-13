#!/usr/bin/env -S deno run --allow-all

// 商品数据设置脚本
// 创建商品相关的 PocketBase 集合并填充测试数据

interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'bool' | 'email' | 'url' | 'date' | 'select' | 'relation' | 'file' | 'json';
  required?: boolean;
  unique?: boolean;
  options?: any;
}

interface CollectionConfig {
  name: string;
  type?: 'base' | 'auth';
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  fields: FieldConfig[];
}

class ProductCollectionSetup {
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

  private generateFieldId(type: string): string {
    return `${type}${Math.floor(Math.random() * 9999999999)}`;
  }

  private async buildField(fieldConfig: FieldConfig): Promise<any> {
    const baseField = {
      id: this.generateFieldId(fieldConfig.type),
      name: fieldConfig.name,
      type: fieldConfig.type,
      required: fieldConfig.required || false,
      hidden: false,
      presentable: false,
      system: false,
    };

    switch (fieldConfig.type) {
      case 'text':
      case 'email':
      case 'url':
        return {
          ...baseField,
          unique: fieldConfig.unique || false,
          autogeneratePattern: '',
          max: fieldConfig.options?.max || 0,
          min: fieldConfig.options?.min || 0,
          pattern: fieldConfig.options?.pattern || '',
          primaryKey: false,
        };
      case 'number':
        return {
          ...baseField,
          max: fieldConfig.options?.max || null,
          min: fieldConfig.options?.min || null,
          onlyInt: fieldConfig.options?.onlyInt || false,
        };
      case 'bool':
        return baseField;
      case 'select':
        return {
          ...baseField,
          maxSelect: fieldConfig.options?.maxSelect || 1,
          values: fieldConfig.options?.values || [],
        };
      case 'relation':
        return {
          ...baseField,
          cascadeDelete: fieldConfig.options?.cascadeDelete || false,
          collectionId: fieldConfig.options?.collectionId || '',
          maxSelect: 1,
          minSelect: 0,
        };
      case 'file':
        return {
          ...baseField,
          maxSelect: 1,
          maxSize: fieldConfig.options?.fileMaxSize || 5242880,
          mimeTypes: fieldConfig.options?.mimeTypes || [],
          protected: false,
          thumbs: null,
        };
      case 'json':
        return {
          ...baseField,
          maxSize: fieldConfig.options?.jsonMaxSize || 0,
        };
      default:
        return baseField;
    }
  }

  async createCollection(config: CollectionConfig): Promise<boolean> {
    try {
      const fields = [];
      for (const fieldConfig of config.fields) {
        const field = await this.buildField(fieldConfig);
        fields.push(field);
      }

      const collectionData = {
        name: config.name,
        type: config.type || 'base',
        listRule: config.listRule || '',
        viewRule: config.viewRule || '',
        createRule: config.createRule || '',
        updateRule: config.updateRule || '',
        deleteRule: config.deleteRule || '',
        fields: fields,
      };

      const response = await fetch(`${this.baseUrl}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(collectionData),
      });

      if (response.ok) {
        console.log(`✅ 集合 ${config.name} 创建成功`);
        return true;
      } else {
        const error = await response.text();
        console.error(`❌ 集合 ${config.name} 创建失败:`, error);
        return false;
      }
    } catch (error) {
      console.error(`❌ 创建集合 ${config.name} 时发生错误:`, error);
      return false;
    }
  }

  async createTestData(collectionName: string, data: any[]): Promise<void> {
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

  async setupProductCollections(): Promise<boolean> {
    // 1. 创建商品分类集合
    const categoriesConfig: CollectionConfig = {
      name: 'product_categories',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true, options: { max: 100 } },
        { name: 'description', type: 'text', required: false, options: { max: 500 } },
        { name: 'sort_order', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['active', 'inactive'] } },
        { name: 'icon', type: 'text', required: false, options: { max: 50 } },
        { name: 'seo_title', type: 'text', required: false, options: { max: 200 } },
        { name: 'seo_description', type: 'text', required: false, options: { max: 300 } }
      ]
    };

    if (!await this.createCollection(categoriesConfig)) return false;

    // 创建分类测试数据
    const categoryData = [
      { name: '电子产品', description: '手机、电脑、数码配件等电子产品', status: 'active', icon: '📱', sort_order: 1, seo_title: '电子产品 - 优质商品分类', seo_description: '手机、电脑、数码配件等电子产品，品质保证，价格优惠' },
      { name: '服装鞋帽', description: '男装、女装、鞋子、配饰等', status: 'active', icon: '👕', sort_order: 2, seo_title: '服装鞋帽 - 优质商品分类', seo_description: '男装、女装、鞋子、配饰等，品质保证，价格优惠' },
      { name: '家居用品', description: '家具、装饰、厨具等家居产品', status: 'active', icon: '🏠', sort_order: 3, seo_title: '家居用品 - 优质商品分类', seo_description: '家具、装饰、厨具等家居产品，品质保证，价格优惠' },
      { name: '图书文具', description: '各类图书、办公文具用品', status: 'active', icon: '📚', sort_order: 4, seo_title: '图书文具 - 优质商品分类', seo_description: '各类图书、办公文具用品，品质保证，价格优惠' },
      { name: '食品饮料', description: '零食、饮品、生鲜食品等', status: 'active', icon: '🍎', sort_order: 5, seo_title: '食品饮料 - 优质商品分类', seo_description: '零食、饮品、生鲜食品等，品质保证，价格优惠' },
      { name: '美妆护肤', description: '化妆品、护肤品、个人护理', status: 'active', icon: '💄', sort_order: 6, seo_title: '美妆护肤 - 优质商品分类', seo_description: '化妆品、护肤品、个人护理，品质保证，价格优惠' },
      { name: '运动户外', description: '运动装备、户外用品、健身器材', status: 'active', icon: '⚽', sort_order: 7, seo_title: '运动户外 - 优质商品分类', seo_description: '运动装备、户外用品、健身器材，品质保证，价格优惠' },
      { name: '母婴用品', description: '婴儿用品、玩具、儿童服装', status: 'active', icon: '🍼', sort_order: 8, seo_title: '母婴用品 - 优质商品分类', seo_description: '婴儿用品、玩具、儿童服装，品质保证，价格优惠' }
    ];

    console.log('📦 创建分类测试数据...');
    await this.createTestData('product_categories', categoryData);

    // 2. 创建品牌集合
    const brandsConfig: CollectionConfig = {
      name: 'brands',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true, unique: true, options: { max: 100 } },
        { name: 'description', type: 'text', required: false, options: { max: 1000 } },
        { name: 'website', type: 'url', required: false },
        { name: 'sort_order', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['active', 'inactive'] } }
      ]
    };

    if (!await this.createCollection(brandsConfig)) return false;

    // 创建品牌测试数据
    const brandData = [
      { name: 'Apple', description: '苹果公司，全球知名科技品牌', website: 'https://www.apple.com', sort_order: 1, status: 'active' },
      { name: 'Samsung', description: '三星集团，韩国跨国企业集团', website: 'https://www.samsung.com', sort_order: 2, status: 'active' },
      { name: 'Nike', description: '耐克，全球著名运动品牌', website: 'https://www.nike.com', sort_order: 3, status: 'active' },
      { name: 'Adidas', description: '阿迪达斯，德国运动用品制造商', website: 'https://www.adidas.com', sort_order: 4, status: 'active' },
      { name: 'Uniqlo', description: '优衣库，日本服装品牌', website: 'https://www.uniqlo.com', sort_order: 5, status: 'active' },
      { name: 'MUJI', description: '无印良品，日本生活用品品牌', website: 'https://www.muji.com', sort_order: 6, status: 'active' }
    ];

    console.log('📦 创建品牌测试数据...');
    await this.createTestData('brands', brandData);

    // 3. 创建商品类型集合
    const productTypesConfig: CollectionConfig = {
      name: 'product_types',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true, unique: true, options: { max: 100 } },
        { name: 'description', type: 'text', required: false, options: { max: 500 } },
        { name: 'attributes', type: 'json', required: false, options: { jsonMaxSize: 50000 } },
        { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['active', 'inactive'] } }
      ]
    };

    if (!await this.createCollection(productTypesConfig)) return false;

    // 创建商品类型测试数据
    const typeData = [
      { name: '电子设备', description: '手机、平板、电脑等电子设备', status: 'active', attributes: JSON.stringify([{ name: '尺寸', type: 'text', required: true }, { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '金色', '银色'] }]) },
      { name: '服装', description: '各类服装产品', status: 'active', attributes: JSON.stringify([{ name: '尺码', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] }, { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '红色', '蓝色', '灰色'] }]) },
      { name: '图书', description: '各类书籍', status: 'active', attributes: JSON.stringify([{ name: '作者', type: 'text', required: true }, { name: '出版社', type: 'text', required: true }, { name: 'ISBN', type: 'text', required: false }]) },
      { name: '家具', description: '家居家具产品', status: 'active', attributes: JSON.stringify([{ name: '材质', type: 'select', required: true, options: ['实木', '板材', '金属', '塑料'] }, { name: '颜色', type: 'text', required: false }]) },
      { name: '食品', description: '食品饮料', status: 'active', attributes: JSON.stringify([{ name: '保质期', type: 'text', required: true }, { name: '净含量', type: 'text', required: true }, { name: '产地', type: 'text', required: false }]) }
    ];

    console.log('📦 创建商品类型测试数据...');
    await this.createTestData('product_types', typeData);

    // 4. 创建商品集合
    const productsConfig: CollectionConfig = {
      name: 'products',
      type: 'base',
      fields: [
        { name: 'name', type: 'text', required: true, options: { max: 200 } },
        { name: 'subtitle', type: 'text', required: false, options: { max: 300 } },
        { name: 'description', type: 'text', required: false, options: { max: 10000 } },
        { name: 'price', type: 'number', required: true, options: { min: 0, onlyInt: false } },
        { name: 'market_price', type: 'number', required: false, options: { min: 0, onlyInt: false } },
        { name: 'cost_price', type: 'number', required: false, options: { min: 0, onlyInt: false } },
        { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['active', 'inactive', 'draft'] } },
        { name: 'tags', type: 'json', required: false, options: { jsonMaxSize: 5000 } },
        { name: 'sku', type: 'text', required: false, unique: true, options: { max: 50 } },
        { name: 'stock', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'unit', type: 'text', required: false, options: { max: 20 } },
        { name: 'weight', type: 'number', required: false, options: { min: 0, onlyInt: false } },
        { name: 'sort_order', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'is_featured', type: 'bool', required: false },
        { name: 'is_new', type: 'bool', required: false },
        { name: 'is_hot', type: 'bool', required: false },
        { name: 'is_published', type: 'bool', required: false },
        { name: 'is_recommended', type: 'bool', required: false },
        { name: 'points', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'growth_value', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'points_purchase_limit', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'preview_enabled', type: 'bool', required: false },
        { name: 'service_guarantee', type: 'json', required: false, options: { jsonMaxSize: 5000 } },
        { name: 'attributes', type: 'json', required: false, options: { jsonMaxSize: 10000 } },
        { name: 'sales_count', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'view_count', type: 'number', required: false, options: { min: 0, onlyInt: true } },
        { name: 'review_status', type: 'select', required: false, options: { maxSelect: 1, values: ['pending', 'approved', 'rejected'] } }
      ]
    };

    if (!await this.createCollection(productsConfig)) return false;

    // 创建商品测试数据
    const productNames = [
      'iPhone 15 Pro Max', 'MacBook Air M2', 'AirPods Pro 2代', 'Nike Air Max 270', 'Adidas Ultra Boost 22',
      'Uniqlo羽绒服', '小米13 Ultra', '华为Mate 60 Pro', 'Tesla Model S钥匙扣', 'MUJI懒人沙发',
      '宜家书架', '海尔冰箱', '《JavaScript高级程序设计》', '《Vue.js设计与实现》', '《深入理解计算机系统》',
      '星巴克咖啡豆', '元气森林苏打水', '三只松鼠坚果', 'SK-II神仙水', '兰蔻小黑瓶'
    ];

    const productData = productNames.map((name, index) => ({
      name: name,
      subtitle: `精选优质商品 - ${name}`,
      description: `这是 ${name} 的详细描述。产品采用优质材料制作，工艺精良，品质保证。适合日常使用，是您的理想选择。`,
      price: Math.floor(Math.random() * 5000) + 100,
      market_price: Math.floor(Math.random() * 6000) + 150,
      cost_price: Math.floor(Math.random() * 2000) + 50,
      status: ['active', 'inactive', 'draft'][index % 3],
      tags: JSON.stringify(['热销', '新品', '推荐', '限时优惠'].slice(0, Math.floor(Math.random() * 4) + 1)),
      sku: `SKU-${String(index + 1).padStart(4, '0')}`,
      stock: Math.floor(Math.random() * 1000) + 10,
      unit: ['件', '个', '套', '本', '瓶', '盒', '包'][index % 7],
      weight: parseFloat((Math.random() * 5 + 0.1).toFixed(2)),
      sort_order: index + 1,
      is_featured: index % 5 === 0,
      is_new: index % 3 === 0,
      is_hot: index % 4 === 0,
      is_published: index % 2 === 0,
      is_recommended: index % 6 === 0,
      points: Math.floor(Math.random() * 100) + 10,
      growth_value: Math.floor(Math.random() * 50) + 5,
      points_purchase_limit: Math.floor(Math.random() * 5) + 1,
      preview_enabled: index % 3 === 0,
      service_guarantee: JSON.stringify(['7天无理由退换', '全国包邮', '正品保证', '售后无忧']),
      attributes: JSON.stringify({
        color: ['红色', '蓝色', '黑色', '白色'][index % 4],
        size: ['S', 'M', 'L', 'XL'][index % 4],
        material: '优质材料'
      }),
      sales_count: Math.floor(Math.random() * 500),
      view_count: Math.floor(Math.random() * 5000) + 100,
      review_status: ['pending', 'approved', 'rejected'][index % 3]
    }));

    console.log('📦 创建商品测试数据...');
    await this.createTestData('products', productData);

    return true;
  }
}

async function main() {
  console.log('🚀 PocketBase 商品管理集合设置工具');
  console.log('=====================================\n');

  const baseUrl = Deno.env.get('POCKETBASE_URL') || 'http://localhost:8090';
  const adminEmail = Deno.env.get('ADMIN_EMAIL') || 'ahukpyu@outlook.com';
  const adminPassword = Deno.env.get('ADMIN_PASSWORD') || 'kpyu1512..@';

  console.log('📋 配置信息:');
  console.log(`   PocketBase URL: ${baseUrl}`);
  console.log(`   管理员邮箱: ${adminEmail}`);
  console.log('');

  console.log('⚠️  请确保:');
  console.log('   1. PocketBase 服务正在运行');
  console.log('   2. 管理员账号已创建');
  console.log('   3. 网络连接正常');
  console.log('');

  const setup = new ProductCollectionSetup(baseUrl);

  console.log('🔐 管理员登录...');
  const loginSuccess = await setup.adminLogin(adminEmail, adminPassword);

  if (!loginSuccess) {
    console.error('❌ 登录失败，请检查管理员账号和密码');
    return;
  }

  console.log('✅ 登录成功！');
  console.log('');

  console.log('📦 开始创建商品管理集合...');
  const success = await setup.setupProductCollections();

  if (success) {
    console.log('\n🎉 商品管理集合设置完成！');
    console.log('\n📋 已创建的集合:');
    console.log('   - product_categories (商品分类): 8条测试数据');
    console.log('   - brands (品牌): 6条测试数据');
    console.log('   - product_types (商品类型): 5条测试数据');
    console.log('   - products (商品): 20条测试数据');
    console.log('\n📝 后续步骤:');
    console.log(`   1. 访问 ${baseUrl}/_/ 查看管理界面`);
    console.log('   2. 检查集合字段和测试数据');
    console.log('   3. 根据需要调整权限规则');
    console.log('   4. 开始使用 GraphQL API');
  } else {
    console.log('\n❌ 设置失败，请检查日志并重试');
  }
}

if (import.meta.main) {
  await main();
} 