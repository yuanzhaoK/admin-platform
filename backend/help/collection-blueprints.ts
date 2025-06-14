// 集合蓝图配置文件
// 用户可以在这里定义各种集合的配置

import { CollectionBlueprint } from './collection-creator-framework.ts';

// 产品集合蓝图
export const productsBlueprint: CollectionBlueprint = {
  collection: {
    name: 'products',
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
        options: {
          max: 200,
          min: 1,
        },
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: {
          max: 1000,
        },
      },
      {
        name: 'price',
        type: 'number',
        required: true,
        options: {
          min: 0,
          onlyInt: false,
        },
      },
      {
        name: 'category',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['电子产品', '服装', '食品', '图书', '家居', '运动', '美妆', '其他'],
        },
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['active', 'inactive', 'out_of_stock'],
        },
      },
      {
        name: 'images',
        type: 'file',
        required: false,
        options: {
          fileMaxSize: 5242880, // 5MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
      },
      {
        name: 'specifications',
        type: 'json',
        required: false,
        options: {
          jsonMaxSize: 10000,
        },
      },
      {
        name: 'stock_quantity',
        type: 'number',
        required: true,
        options: {
          min: 0,
          onlyInt: true,
        },
      },
      {
        name: 'sku',
        type: 'text',
        required: true,
        unique: true,
        options: {
          max: 50,
          pattern: '^[A-Z0-9-]+$',
        },
      },
      {
        name: 'created_at',
        type: 'date',
        required: true,
      },
    ],
  },
  testData: {
    count: 5,
    generator: (index: number) => ({
      name: `测试产品 ${index + 1}`,
      description: `这是第 ${index + 1} 个测试产品的详细描述`,
      price: Math.floor(Math.random() * 1000) + 10,
      category: ['电子产品', '服装', '食品', '图书', '家居'][index % 5],
      status: ['active', 'inactive', 'out_of_stock'][index % 3],
      stock_quantity: Math.floor(Math.random() * 100) + 1,
      sku: `PROD-${String(index + 1).padStart(3, '0')}`,
      specifications: JSON.stringify({
        weight: `${Math.floor(Math.random() * 5) + 1}kg`,
        dimensions: `${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10}cm`,
        color: ['红色', '蓝色', '绿色', '黑色', '白色'][index % 5],
      }),
      created_at: new Date().toISOString(),
    }),
  },
};

// 文章集合蓝图
export const articlesBlueprint: CollectionBlueprint = {
  collection: {
    name: 'articles',
    type: 'base',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: {
          max: 200,
          min: 5,
        },
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        options: {
          max: 100,
          pattern: '^[a-z0-9-]+$',
        },
      },
      {
        name: 'content',
        type: 'text',
        required: true,
        options: {
          max: 50000,
        },
      },
      {
        name: 'excerpt',
        type: 'text',
        required: false,
        options: {
          max: 500,
        },
      },
      {
        name: 'author_id',
        type: 'relation',
        required: true,
        options: {
          collectionName: 'users',
          cascadeDelete: false,
        },
      },
      {
        name: 'category',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['技术', '生活', '旅行', '美食', '教育', '娱乐'],
        },
      },
      {
        name: 'tags',
        type: 'select',
        required: false,
        options: {
          maxSelect: 5,
          values: ['JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python', 'Go', 'Rust', '前端', '后端', '全栈', '移动开发'],
        },
      },
      {
        name: 'featured_image',
        type: 'file',
        required: false,
        options: {
          fileMaxSize: 2097152, // 2MB
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['draft', 'published', 'archived'],
        },
      },
      {
        name: 'published_at',
        type: 'date',
        required: false,
      },
      {
        name: 'view_count',
        type: 'number',
        required: true,
        options: {
          min: 0,
          onlyInt: true,
        },
      },
      {
        name: 'is_featured',
        type: 'bool',
        required: true,
      },
      {
        name: 'metadata',
        type: 'json',
        required: false,
        options: {
          jsonMaxSize: 5000,
        },
      },
    ],
  },
  testData: {
    count: 8,
    generator: (index: number) => ({
      title: `精彩文章标题 ${index + 1}`,
      slug: `article-${index + 1}`,
      content: `这是第 ${index + 1} 篇文章的详细内容。文章内容非常丰富，包含了各种有趣的信息和见解。`,
      excerpt: `这是第 ${index + 1} 篇文章的摘要`,
      author_id: 'user_id_placeholder', // 需要实际的用户ID
      category: ['技术', '生活', '旅行', '美食', '教育', '娱乐'][index % 6],
      tags: [['JavaScript', 'React'], ['Python', '后端'], ['旅行'], ['美食'], ['教育'], ['娱乐']][index % 6],
      status: ['draft', 'published', 'archived'][index % 3],
      published_at: index % 2 === 0 ? new Date().toISOString() : null,
      view_count: Math.floor(Math.random() * 1000),
      is_featured: index % 3 === 0,
      metadata: JSON.stringify({
        seo_title: `SEO标题 ${index + 1}`,
        seo_description: `SEO描述 ${index + 1}`,
        reading_time: Math.floor(Math.random() * 10) + 1,
      }),
    }),
  },
};

// 评论集合蓝图
export const commentsBlueprint: CollectionBlueprint = {
  collection: {
    name: 'comments',
    type: 'base',
    fields: [
      {
        name: 'content',
        type: 'text',
        required: true,
        options: {
          max: 1000,
          min: 1,
        },
      },
      {
        name: 'author_id',
        type: 'relation',
        required: true,
        options: {
          collectionName: 'users',
          cascadeDelete: true,
        },
      },
      {
        name: 'article_id',
        type: 'relation',
        required: true,
        options: {
          collectionName: 'articles',
          cascadeDelete: true,
        },
      },
      {
        name: 'parent_id',
        type: 'relation',
        required: false,
        options: {
          collectionName: 'comments',
          cascadeDelete: true,
        },
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['pending', 'approved', 'rejected', 'spam'],
        },
      },
      {
        name: 'like_count',
        type: 'number',
        required: true,
        options: {
          min: 0,
          onlyInt: true,
        },
      },
      {
        name: 'is_pinned',
        type: 'bool',
        required: true,
      },
      {
        name: 'created_at',
        type: 'date',
        required: true,
      },
    ],
  },
  testData: {
    count: 15,
    generator: (index: number) => ({
      content: `这是第 ${index + 1} 条评论的内容，用户分享了自己的观点和看法。`,
      author_id: 'user_id_placeholder',
      article_id: 'article_id_placeholder',
      parent_id: index > 5 ? 'comment_id_placeholder' : null,
      status: ['pending', 'approved', 'rejected', 'spam'][index % 4],
      like_count: Math.floor(Math.random() * 50),
      is_pinned: index % 10 === 0,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    }),
  },
};

// 用户配置集合蓝图
export const userSettingsBlueprint: CollectionBlueprint = {
  collection: {
    name: 'user_settings',
    type: 'base',
    fields: [
      {
        name: 'user_id',
        type: 'relation',
        required: true,
        unique: true,
        options: {
          collectionName: 'users',
          cascadeDelete: true,
        },
      },
      {
        name: 'theme',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['light', 'dark', 'auto'],
        },
      },
      {
        name: 'language',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'],
        },
      },
      {
        name: 'timezone',
        type: 'text',
        required: true,
        options: {
          max: 50,
        },
      },
      {
        name: 'email_notifications',
        type: 'bool',
        required: true,
      },
      {
        name: 'push_notifications',
        type: 'bool',
        required: true,
      },
      {
        name: 'privacy_level',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['public', 'friends', 'private'],
        },
      },
      {
        name: 'preferences',
        type: 'json',
        required: false,
        options: {
          jsonMaxSize: 10000,
        },
      },
      {
        name: 'updated_at',
        type: 'date',
        required: true,
      },
    ],
  },
  testData: {
    count: 3,
    generator: (index: number) => ({
      user_id: 'user_id_placeholder',
      theme: ['light', 'dark', 'auto'][index % 3],
      language: ['zh-CN', 'en-US', 'ja-JP'][index % 3],
      timezone: ['Asia/Shanghai', 'America/New_York', 'Europe/London'][index % 3],
      email_notifications: index % 2 === 0,
      push_notifications: index % 3 !== 0,
      privacy_level: ['public', 'friends', 'private'][index % 3],
      preferences: JSON.stringify({
        sidebar_collapsed: index % 2 === 0,
        items_per_page: [10, 20, 50][index % 3],
        default_view: ['list', 'grid', 'card'][index % 3],
      }),
      updated_at: new Date().toISOString(),
    }),
  },
};

// 商品类型集合蓝图
export const productTypesBlueprint: CollectionBlueprint = {
  collection: {
    name: 'product_types',
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
        unique: true,
        options: {
          max: 100,
          min: 1,
        },
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: {
          max: 500,
        },
      },
      {
        name: 'attributes',
        type: 'json',
        required: false,
        options: {
          jsonMaxSize: 50000,
        },
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['active', 'inactive'],
        },
      },
    ],
  },
  testData: {
    count: 8,
    generator: (index: number) => {
      const types = [
        {
          name: '电子设备',
          desc: '手机、平板、电脑等电子设备',
          attrs: [
            { name: '尺寸', type: 'text', required: true },
            { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '金色', '银色'] },
            { name: '存储容量', type: 'select', required: false, options: ['64GB', '128GB', '256GB', '512GB'] },
            { name: '屏幕尺寸', type: 'number', required: false },
            { name: '是否支持5G', type: 'boolean', required: false }
          ]
        },
        {
          name: '服装鞋帽',
          desc: '各类服装、鞋子、帽子等',
          attrs: [
            { name: '尺码', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
            { name: '颜色', type: 'select', required: true, options: ['黑色', '白色', '红色', '蓝色', '灰色', '咖啡色'] },
            { name: '材质', type: 'text', required: false },
            { name: '季节', type: 'select', required: false, options: ['春季', '夏季', '秋季', '冬季'] },
            { name: '适用性别', type: 'select', required: true, options: ['男性', '女性', '中性'] }
          ]
        },
        {
          name: '图书文具',
          desc: '各类书籍、文具用品',
          attrs: [
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
          desc: '家具、装饰品等家居用品',
          attrs: [
            { name: '材质', type: 'select', required: true, options: ['实木', '板材', '金属', '塑料', '玻璃', '陶瓷'] },
            { name: '颜色', type: 'text', required: false },
            { name: '尺寸', type: 'text', required: true },
            { name: '风格', type: 'select', required: false, options: ['现代简约', '欧式', '中式', '美式', '北欧'] },
            { name: '适用房间', type: 'multiselect', required: false, options: ['客厅', '卧室', '厨房', '书房', '卫生间'] }
          ]
        },
        {
          name: '食品饮料',
          desc: '各类食品、饮料、调料等',
          attrs: [
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
          desc: '化妆品、护肤品等',
          attrs: [
            { name: '品牌', type: 'text', required: true },
            { name: '适用肤质', type: 'multiselect', required: false, options: ['干性', '油性', '混合性', '敏感性', '中性'] },
            { name: '适用年龄', type: 'select', required: false, options: ['青少年', '青年', '中年', '老年', '全年龄'] },
            { name: '容量规格', type: 'text', required: true },
            { name: '功效', type: 'multiselect', required: false, options: ['保湿', '美白', '抗衰老', '防晒', '控油', '祛痘'] }
          ]
        },
        {
          name: '运动户外',
          desc: '运动器材、户外用品等',
          attrs: [
            { name: '运动类型', type: 'select', required: true, options: ['跑步', '健身', '游泳', '篮球', '足球', '登山', '骑行'] },
            { name: '适用性别', type: 'select', required: true, options: ['男性', '女性', '中性'] },
            { name: '尺码', type: 'select', required: false, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
            { name: '材质', type: 'text', required: false },
            { name: '重量', type: 'number', required: false }
          ]
        },
        {
          name: '母婴用品',
          desc: '婴幼儿用品、孕妇用品等',
          attrs: [
            { name: '适用年龄', type: 'select', required: true, options: ['0-6个月', '6-12个月', '1-2岁', '2-3岁', '3岁以上', '孕妇'] },
            { name: '材质', type: 'text', required: true },
            { name: '安全认证', type: 'multiselect', required: false, options: ['3C认证', 'CE认证', 'FDA认证', '有机认证'] },
            { name: '功能特点', type: 'multiselect', required: false, options: ['防过敏', '易清洗', '可折叠', '便携式', '多功能'] },
            { name: '颜色', type: 'select', required: false, options: ['粉色', '蓝色', '黄色', '绿色', '白色', '彩色'] }
          ]
        }
      ];
      
      const type = types[index % types.length];
      return {
        name: type.name,
        description: type.desc,
        attributes: JSON.stringify(type.attrs),
        status: 'active'
      };
    }
  },
};

// 导出所有蓝图
export const allBlueprints = [
  productsBlueprint,
  articlesBlueprint,
  commentsBlueprint,
  userSettingsBlueprint,
  productTypesBlueprint,
]; 