import { pocketbaseClient } from '../../config/pocketbase.ts';

// 搜索结果类型映射
const SEARCH_TYPE_CONFIG = {
  PRODUCT: {
    collection: 'products',
    title: '商品',
    icon: 'Package',
    fields: ['name', 'description', 'brand'],
    urlPattern: '/dashboard/products/management',
    searchFields: 'name,description,brand,category'
  },
  CATEGORY: {
    collection: 'product_categories', 
    title: '商品分类',
    icon: 'FolderTree',
    fields: ['name', 'description'],
    urlPattern: '/dashboard/products/categories',
    searchFields: 'name,description'
  },
  BRAND: {
    collection: 'product_brands',
    title: '品牌',
    icon: 'Star',
    fields: ['name', 'description'],
    urlPattern: '/dashboard/products/brands',
    searchFields: 'name,description'
  },
  PRODUCT_TYPE: {
    collection: 'product_types',
    title: '商品类型',
    icon: 'Tag',
    fields: ['name', 'description'],
    urlPattern: '/dashboard/products/types',
    searchFields: 'name,description'
  },
  ORDER: {
    collection: 'orders',
    title: '订单',
    icon: 'ShoppingCart',
    fields: ['order_number', 'customer_email'],
    urlPattern: '/dashboard/orders/list',
    searchFields: 'order_number,customer_email'
  },
  USER: {
    collection: 'users',
    title: '用户',
    icon: 'Users',
    fields: ['name', 'email'],
    urlPattern: '/dashboard/users',
    searchFields: 'name,email'
  },
  PAGE: {
    collection: null, // 静态页面搜索
    title: '页面',
    icon: 'FileText',
    fields: [],
    urlPattern: '',
    searchFields: ''
  }
};

// 静态页面定义
const STATIC_PAGES = [
  {
    id: 'dashboard',
    title: '仪表板',
    description: '系统概览和统计信息',
    url: '/dashboard',
    keywords: ['仪表板', '概览', '统计', 'dashboard', 'overview']
  },
  {
    id: 'products',
    title: '商品管理',
    description: '管理商品信息、分类和库存',
    url: '/dashboard/products/management',
    keywords: ['商品', '产品', '库存', 'product', 'inventory']
  },
  {
    id: 'categories',
    title: '商品分类',
    description: '管理商品分类树形结构',
    url: '/dashboard/products/categories',
    keywords: ['分类', 'category', '树形']
  },
  {
    id: 'brands',
    title: '品牌管理',
    description: '管理商品品牌信息',
    url: '/dashboard/products/brands',
    keywords: ['品牌', 'brand']
  },
  {
    id: 'types',
    title: '商品类型',
    description: '管理商品类型和属性模板',
    url: '/dashboard/products/types',
    keywords: ['类型', 'type', '属性', 'attribute']
  },
  {
    id: 'orders',
    title: '订单管理',
    description: '查看和管理订单信息',
    url: '/dashboard/orders/list',
    keywords: ['订单', 'order']
  },
  {
    id: 'users',
    title: '用户管理',
    description: '管理系统用户和权限',
    url: '/dashboard/users',
    keywords: ['用户', 'user', '权限', 'permission']
  },
  {
    id: 'settings',
    title: '系统设置',
    description: '系统配置和参数设置',
    url: '/dashboard/settings',
    keywords: ['设置', 'settings', '配置', 'config']
  }
];

// 搜索单个集合
async function searchCollection(type: string, query: string, limit: number) {
  const config = SEARCH_TYPE_CONFIG[type as keyof typeof SEARCH_TYPE_CONFIG];
  if (!config || !config.collection) {
    return [];
  }

  try {
    const searchFilter = config.searchFields
      .split(',')
      .map(field => `${field} ~ "${query}"`)
      .join(' || ');

    console.log(`Searching ${type} with filter: ${searchFilter}`);
    
    // 对于商品搜索，先尝试不需要认证的方式
    let records;
    try {
      records = await pocketbaseClient.queueRequest(() => 
        pocketbaseClient.getClient().collection(config.collection!).getList(1, limit, {
          filter: searchFilter,
          sort: '-created'
        })
      );
    } catch (authError) {
      console.log(`Auth search failed for ${type}, trying with ensureAuth:`, authError);
      await pocketbaseClient.ensureAuth();
      records = await pocketbaseClient.queueRequest(() => 
        pocketbaseClient.getClient().collection(config.collection!).getList(1, limit, {
          filter: searchFilter,
          sort: '-created'
        })
      );
    }

    return records.items.map((record: any, index: number) => ({
      id: record.id,
      type,
      title: record[config.fields[0]] || record.name || record.title || 'Untitled',
      description: record[config.fields[1]] || record.description || '',
      subtitle: record[config.fields[2]] || '',
      url: `${config.urlPattern}?id=${record.id}`,
      icon: config.icon,
      metadata: {
        collection: config.collection,
        created: record.created,
        updated: record.updated
      },
      score: 1.0 - (index * 0.1) // 简单评分逻辑
    }));
  } catch (error) {
    console.error(`Failed to search ${type}:`, error);
    return [];
  }
}

// 搜索静态页面
function searchStaticPages(query: string, limit: number) {
  const queryLower = query.toLowerCase();
  
  const matches = STATIC_PAGES
    .filter(page => {
      const searchText = [
        page.title,
        page.description,
        ...page.keywords
      ].join(' ').toLowerCase();
      
      return searchText.includes(queryLower);
    })
    .slice(0, limit)
    .map((page, index) => ({
      id: page.id,
      type: 'PAGE',
      title: page.title,
      description: page.description,
      subtitle: '',
      url: page.url,
      icon: 'FileText',
      metadata: {
        keywords: page.keywords
      },
      score: 1.0 - (index * 0.1)
    }));

  return matches;
}

// 全局搜索resolver
export const globalSearchResolvers = {
  Query: {
    // 全局搜索
    globalSearch: async (_: any, { query, limit = 20, types }: {
      query: string;
      limit?: number;
      types?: string[];
    }) => {
      const startTime = Date.now();
      
      // 如果没有指定类型，搜索所有类型
      const searchTypes = types || Object.keys(SEARCH_TYPE_CONFIG);
      
      // 每个类型的限制数量
      const limitPerType = Math.ceil(limit / searchTypes.length);
      
      // 并行搜索所有类型
      const searchPromises = searchTypes.map(async (type) => {
        if (type === 'PAGE') {
          return {
            type,
            items: searchStaticPages(query, limitPerType)
          };
        } else {
          return {
            type,
            items: await searchCollection(type, query, limitPerType)
          };
        }
      });

      const results = await Promise.all(searchPromises);
      
      // 组织结果
      const groups = results
        .filter(result => result.items.length > 0)
        .map(result => {
          const config = SEARCH_TYPE_CONFIG[result.type as keyof typeof SEARCH_TYPE_CONFIG];
          return {
            type: result.type,
            title: config.title,
            icon: config.icon,
            items: result.items,
            total: result.items.length
          };
        });

      // 计算总数
      const total = groups.reduce((sum, group) => sum + group.total, 0);
      
      // 生成搜索建议
      const suggestions = generateSearchSuggestions(query);
      
      const executionTime = Date.now() - startTime;

      return {
        query,
        total,
        groups,
        suggestions,
        executionTime
      };
    }
  }
};

// 生成搜索建议
function generateSearchSuggestions(query: string, limit: number = 5): string[] {
  const commonSuggestions = [
    '商品管理',
    '商品分类',
    '品牌管理',
    '商品类型',
    '订单管理',
    '用户管理',
    '系统设置',
    '仪表板'
  ];

  // 基于查询生成建议
  const queryLower = query.toLowerCase();
  const filtered = commonSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(queryLower)
  );

  // 如果过滤结果不足，添加一些通用建议
  if (filtered.length < limit) {
    const additional = commonSuggestions
      .filter(s => !filtered.includes(s))
      .slice(0, limit - filtered.length);
    filtered.push(...additional);
  }

  return filtered.slice(0, limit);
} 