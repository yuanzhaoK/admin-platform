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

// 导出所有蓝图
export const allBlueprints = [
  productsBlueprint,
  articlesBlueprint,
  commentsBlueprint,
  userSettingsBlueprint,
]; 