// 增强版商品管理集合配置
// 基于 GraphQL 模式创建完整的商品管理系统集合

import { CollectionBlueprint, PocketBaseCollectionCreator } from './collection-creator-framework.ts';

// 商品分类集合
export const productCategoriesBlueprint: CollectionBlueprint = {
  collection: {
    name: 'product_categories',
    type: 'base',
    listRule: '',
    viewRule: '',
    createRule: '',
    updateRule: '',
    deleteRule: '',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100, min: 1 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'parent_id',
        type: 'relation',
        required: false,
        options: {
          collectionName: 'product_categories',
          cascadeDelete: false
        }
      },
      {
        name: 'sort_order',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['active', 'inactive']
        }
      },
      {
        name: 'image',
        type: 'file',
        required: false,
        options: {
          fileMaxSize: 2097152, // 2MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      {
        name: 'icon',
        type: 'text',
        required: false,
        options: { max: 50 }
      },
      {
        name: 'seo_title',
        type: 'text',
        required: false,
        options: { max: 200 }
      },
      {
        name: 'seo_description',
        type: 'text',
        required: false,
        options: { max: 300 }
      }
    ]
  },
  testData: {
    count: 8,
    generator: (index: number) => {
      const categories = [
        { name: '电子产品', desc: '手机、电脑、数码配件等电子产品', icon: '📱' },
        { name: '服装鞋帽', desc: '男装、女装、鞋子、配饰等', icon: '👕' },
        { name: '家居用品', desc: '家具、装饰、厨具等家居产品', icon: '🏠' },
        { name: '图书文具', desc: '各类图书、办公文具用品', icon: '📚' },
        { name: '食品饮料', desc: '零食、饮品、生鲜食品等', icon: '🍎' },
        { name: '美妆护肤', desc: '化妆品、护肤品、个人护理', icon: '💄' },
        { name: '运动户外', desc: '运动装备、户外用品、健身器材', icon: '⚽' },
        { name: '母婴用品', desc: '婴儿用品、玩具、儿童服装', icon: '🍼' }
      ];
      
      const cat = categories[index];
      return {
        name: cat.name,
        description: cat.desc,
        parent_id: null,
        sort_order: index + 1,
        status: 'active',
        icon: cat.icon,
        seo_title: `${cat.name} - 优质商品分类`,
        seo_description: `${cat.desc}，品质保证，价格优惠`
      };
    }
  }
};

// 品牌集合
export const brandsBlueprint: CollectionBlueprint = {
  collection: {
    name: 'brands',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        unique: true,
        options: { max: 100, min: 1 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 1000 }
      },
      {
        name: 'logo',
        type: 'file',
        required: false,
        options: {
          fileMaxSize: 1048576, // 1MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
        }
      },
      {
        name: 'website',
        type: 'url',
        required: false
      },
      {
        name: 'sort_order',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['active', 'inactive']
        }
      }
    ]
  },
  testData: {
    count: 6,
    generator: (index: number) => {
      const brands = [
        { name: 'Apple', desc: '苹果公司，全球知名科技品牌', website: 'https://www.apple.com' },
        { name: 'Samsung', desc: '三星集团，韩国跨国企业集团', website: 'https://www.samsung.com' },
        { name: 'Nike', desc: '耐克，全球著名运动品牌', website: 'https://www.nike.com' },
        { name: 'Adidas', desc: '阿迪达斯，德国运动用品制造商', website: 'https://www.adidas.com' },
        { name: 'Uniqlo', desc: '优衣库，日本服装品牌', website: 'https://www.uniqlo.com' },
        { name: 'MUJI', desc: '无印良品，日本生活用品品牌', website: 'https://www.muji.com' }
      ];
      
      const brand = brands[index];
      return {
        name: brand.name,
        description: brand.desc,
        website: brand.website,
        sort_order: index + 1,
        status: 'active'
      };
    }
  }
};

// 商品类型集合
export const productTypesBlueprint: CollectionBlueprint = {
  collection: {
    name: 'product_types',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        unique: true,
        options: { max: 100, min: 1 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'attributes',
        type: 'json',
        required: false,
        options: { jsonMaxSize: 50000 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['active', 'inactive']
        }
      }
    ]
  },
  testData: {
    count: 5,
    generator: (index: number) => {
      const types = [
        {
          name: '电子设备',
          desc: '手机、平板、电脑等电子设备',
          attrs: [
            { name: '尺寸', type: 'text', required: true },
            { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '金色', '银色'] },
            { name: '存储容量', type: 'select', required: false, options: ['64GB', '128GB', '256GB', '512GB'] }
          ]
        },
        {
          name: '服装',
          desc: '各类服装产品',
          attrs: [
            { name: '尺码', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
            { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '红色', '蓝色', '灰色'] },
            { name: '材质', type: 'text', required: false }
          ]
        },
        {
          name: '图书',
          desc: '各类书籍',
          attrs: [
            { name: '作者', type: 'text', required: true },
            { name: '出版社', type: 'text', required: true },
            { name: 'ISBN', type: 'text', required: false },
            { name: '页数', type: 'number', required: false }
          ]
        },
        {
          name: '家具',
          desc: '家居家具产品',
          attrs: [
            { name: '材质', type: 'select', required: true, options: ['实木', '板材', '金属', '塑料'] },
            { name: '颜色', type: 'text', required: false },
            { name: '尺寸', type: 'text', required: true }
          ]
        },
        {
          name: '食品',
          desc: '食品饮料',
          attrs: [
            { name: '保质期', type: 'text', required: true },
            { name: '净含量', type: 'text', required: true },
            { name: '产地', type: 'text', required: false }
          ]
        }
      ];
      
      const type = types[index];
      return {
        name: type.name,
        description: type.desc,
        attributes: JSON.stringify(type.attrs),
        status: 'active'
      };
    }
  }
};

// 增强版商品集合
export const enhancedProductsBlueprint: CollectionBlueprint = {
  collection: {
    name: 'products',
    type: 'base',
    fields: [
      // 基本信息
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 200, min: 1 }
      },
      {
        name: 'subtitle',
        type: 'text',
        required: false,
        options: { max: 300 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 10000 }
      },
      
      // 价格信息
      {
        name: 'price',
        type: 'number',
        required: true,
        options: { min: 0, onlyInt: false }
      },
      {
        name: 'market_price',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: false }
      },
      {
        name: 'cost_price',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: false }
      },
      
      // 关联信息
      {
        name: 'category_id',
        type: 'relation',
        required: false,
        options: {
          collectionName: 'product_categories',
          cascadeDelete: false
        }
      },
      {
        name: 'brand_id',
        type: 'relation',
        required: false,
        options: {
          collectionName: 'brands',
          cascadeDelete: false
        }
      },
      {
        name: 'product_type_id',
        type: 'relation',
        required: false,
        options: {
          collectionName: 'product_types',
          cascadeDelete: false
        }
      },
      
      // 状态和标签
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
        name: 'tags',
        type: 'json',
        required: false,
        options: { jsonMaxSize: 5000 }
      },
      
      // 库存和物流
      {
        name: 'sku',
        type: 'text',
        required: false,
        unique: true,
        options: { max: 50 }
      },
      {
        name: 'stock',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      {
        name: 'unit',
        type: 'text',
        required: false,
        options: { max: 20 }
      },
      {
        name: 'weight',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: false }
      },
      
      // 媒体文件
      {
        name: 'images',
        type: 'file',
        required: false,
        options: {
          fileMaxSize: 5242880, // 5MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      
      // 排序和特性
      {
        name: 'sort_order',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      {
        name: 'is_featured',
        type: 'bool',
        required: false
      },
      {
        name: 'is_new',
        type: 'bool',
        required: false
      },
      {
        name: 'is_hot',
        type: 'bool',
        required: false
      },
      {
        name: 'is_published',
        type: 'bool',
        required: false
      },
      {
        name: 'is_recommended',
        type: 'bool',
        required: false
      },
      
      // 积分系统
      {
        name: 'points',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      {
        name: 'growth_value',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      {
        name: 'points_purchase_limit',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      
      // 其他功能
      {
        name: 'preview_enabled',
        type: 'bool',
        required: false
      },
      {
        name: 'service_guarantee',
        type: 'json',
        required: false,
        options: { jsonMaxSize: 5000 }
      },
      {
        name: 'attributes',
        type: 'json',
        required: false,
        options: { jsonMaxSize: 10000 }
      },
      
      // 统计数据
      {
        name: 'sales_count',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      {
        name: 'view_count',
        type: 'number',
        required: false,
        options: { min: 0, onlyInt: true }
      },
      
      // 审核状态
      {
        name: 'review_status',
        type: 'select',
        required: false,
        options: {
          maxSelect: 1,
          values: ['pending', 'approved', 'rejected']
        }
      }
    ]
  },
  testData: {
    count: 20,
    generator: (index: number) => {
      const productNames = [
        'iPhone 15 Pro Max', 'MacBook Air M2', 'AirPods Pro 2代',
        'Nike Air Max 270', 'Adidas Ultra Boost 22', 'Uniqlo羽绒服',
        '小米13 Ultra', '华为Mate 60 Pro', 'Tesla Model S钥匙扣',
        'MUJI懒人沙发', '宜家书架', '海尔冰箱',
        '《JavaScript高级程序设计》', '《Vue.js设计与实现》', '《深入理解计算机系统》',
        '星巴克咖啡豆', '元气森林苏打水', '三只松鼠坚果',
         'SK-II神仙水', '兰蔻小黑瓶'
      ];
      
      const categories = ['电子产品', '服装鞋帽', '家居用品', '图书文具', '食品饮料', '美妆护肤'];
      const brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Uniqlo', 'MUJI'];
      const units = ['件', '个', '套', '本', '瓶', '盒', '包'];
      
      return {
        name: productNames[index] || `测试商品 ${index + 1}`,
        subtitle: `精选优质商品 - ${productNames[index] || `商品${index + 1}`}`,
        description: `这是 ${productNames[index] || `测试商品${index + 1}`} 的详细描述。产品采用优质材料制作，工艺精良，品质保证。适合日常使用，是您的理想选择。`,
        price: Math.floor(Math.random() * 5000) + 100,
        market_price: Math.floor(Math.random() * 6000) + 150,
        cost_price: Math.floor(Math.random() * 2000) + 50,
        status: ['active', 'inactive', 'draft'][index % 3],
        tags: JSON.stringify(['热销', '新品', '推荐', '限时优惠'].slice(0, Math.floor(Math.random() * 4) + 1)),
        sku: `SKU-${String(index + 1).padStart(4, '0')}`,
        stock: Math.floor(Math.random() * 1000) + 10,
        unit: units[index % units.length],
        weight: (Math.random() * 5 + 0.1).toFixed(2),
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
      };
    }
  }
};

// 导出所有增强版蓝图
export const enhancedProductBlueprints = [
  productCategoriesBlueprint,
  brandsBlueprint,
  productTypesBlueprint,
  enhancedProductsBlueprint
];

// 创建所有商品相关集合的主函数
export async function createProductCollections(
  baseUrl: string = 'http://localhost:8090',
  adminEmail: string = 'admin@example.com',
  adminPassword: string = 'admin123456'
) {
  console.log('🚀 开始创建商品管理集合...');
  
  const creator = new PocketBaseCollectionCreator(baseUrl);
  
  // 管理员登录
  console.log('🔐 管理员登录...');
  const loginSuccess = await creator.adminLogin(adminEmail, adminPassword);
  
  if (!loginSuccess) {
    console.error('❌ 登录失败，请检查管理员账号和密码');
    return false;
  }
  
  console.log('✅ 登录成功！');
  
  try {
    // 按顺序创建集合（因为有依赖关系）
    const blueprints = [
      { name: '商品分类', blueprint: productCategoriesBlueprint },
      { name: '品牌', blueprint: brandsBlueprint },
      { name: '商品类型', blueprint: productTypesBlueprint },
      { name: '商品', blueprint: enhancedProductsBlueprint }
    ];
    
    for (const { name, blueprint } of blueprints) {
      console.log(`📦 创建${name}集合...`);
      const success = await creator.createFromBlueprint(blueprint);
      
      if (success) {
        console.log(`✅ ${name}集合创建成功！`);
      } else {
        console.error(`❌ ${name}集合创建失败`);
        return false;
      }
    }
    
    console.log('\n🎉 所有商品管理集合创建完成！');
    console.log('\n📋 已创建的集合:');
    console.log('- product_categories (商品分类)');
    console.log('- brands (品牌)');
    console.log('- product_types (商品类型)');
    console.log('- products (商品)');
    
    console.log('\n📊 测试数据统计:');
    console.log('- 8个商品分类');
    console.log('- 6个品牌');
    console.log('- 5个商品类型');
    console.log('- 20个测试商品');
    
    return true;
    
  } catch (error) {
    console.error('❌ 创建过程中发生错误:', error);
    return false;
  }
}

// 如果直接运行此文件
if (import.meta.main) {
  await createProductCollections();
} 