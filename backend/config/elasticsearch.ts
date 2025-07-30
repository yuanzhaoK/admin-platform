// Elasticsearch 配置文件
import { Client } from 'elasticsearch';

// 获取环境变量
const getEnvVar = (key: string, defaultValue: string) => {
  return Deno.env.get(key) || defaultValue;
};

// Elasticsearch 客户端配置
export const elasticsearchConfig = {
  node: getEnvVar('ELASTICSEARCH_URL', 'http://localhost:9200'),
  auth: {
    username: getEnvVar('ELASTICSEARCH_USERNAME', 'elastic'),
    password: getEnvVar('ELASTICSEARCH_PASSWORD', 'password')
  },
  requestTimeout: 30000,
  maxRetries: 3
};

// 创建 Elasticsearch 客户端
export const esClient = new Client(elasticsearchConfig);

// 索引配置
export const INDEX_CONFIGS = {
  // 商品索引
  PRODUCTS: {
    index: 'products',
    mappings: {
      properties: {
        id: { type: 'keyword' },
        name: { 
          type: 'text',
          analyzer: 'ik_max_word',
          search_analyzer: 'ik_smart',
          fields: {
            keyword: { type: 'keyword' },
            suggest: { type: 'completion' }
          }
        },
        description: { 
          type: 'text',
          analyzer: 'ik_max_word',
          search_analyzer: 'ik_smart'
        },
        brand: {
          type: 'text',
          analyzer: 'ik_max_word',
          fields: { keyword: { type: 'keyword' } }
        },
        category: {
          type: 'text',
          analyzer: 'ik_max_word',
          fields: { keyword: { type: 'keyword' } }
        },
        price: { type: 'double' },
        stock: { type: 'integer' },
        status: { type: 'keyword' },
        tags: { type: 'keyword' },
        is_featured: { type: 'boolean' },
        is_new: { type: 'boolean' },
        is_hot: { type: 'boolean' },
        sales_count: { type: 'integer' },
        view_count: { type: 'integer' },
        rating: { type: 'float' },
        created: { type: 'date' },
        updated: { type: 'date' },
        // 向量字段用于语义搜索
        name_vector: {
          type: 'dense_vector',
          dims: 768
        },
        // 权重字段用于排序
        search_weight: { type: 'float' }
      }
    },
    settings: {
      number_of_shards: 2,
      number_of_replicas: 1,
      analysis: {
        analyzer: {
          pinyin_analyzer: {
            tokenizer: 'pinyin_tokenizer',
            filter: ['lowercase', 'stop']
          }
        },
        tokenizer: {
          pinyin_tokenizer: {
            type: 'pinyin',
            keep_full_pinyin: true,
            keep_joined_full_pinyin: true,
            keep_original: true,
            limit_first_letter_length: 16,
            remove_duplicated_term: true
          }
        }
      }
    }
  },

  // 订单索引
  ORDERS: {
    index: 'orders',
    mappings: {
      properties: {
        id: { type: 'keyword' },
        order_number: { 
          type: 'text',
          fields: { keyword: { type: 'keyword' } }
        },
        customer_email: { 
          type: 'text',
          fields: { keyword: { type: 'keyword' } }
        },
        customer_name: {
          type: 'text',
          analyzer: 'ik_max_word',
          fields: { keyword: { type: 'keyword' } }
        },
        status: { type: 'keyword' },
        total_amount: { type: 'double' },
        created: { type: 'date' },
        updated: { type: 'date' },
        items: {
          type: 'nested',
          properties: {
            product_id: { type: 'keyword' },
            product_name: { 
              type: 'text',
              analyzer: 'ik_max_word' 
            },
            quantity: { type: 'integer' },
            price: { type: 'double' }
          }
        }
      }
    }
  },

  // 用户索引
  USERS: {
    index: 'users',
    mappings: {
      properties: {
        id: { type: 'keyword' },
        name: {
          type: 'text',
          analyzer: 'ik_max_word',
          fields: { keyword: { type: 'keyword' } }
        },
        email: {
          type: 'text',
          fields: { keyword: { type: 'keyword' } }
        },
        phone: { type: 'keyword' },
        status: { type: 'keyword' },
        role: { type: 'keyword' },
        created: { type: 'date' },
        updated: { type: 'date' },
        last_login: { type: 'date' },
        tags: { type: 'keyword' }
      }
    }
  },

  // 搜索日志索引
  SEARCH_LOGS: {
    index: 'search_logs',
    mappings: {
      properties: {
        query: { 
          type: 'text',
          analyzer: 'ik_max_word',
          fields: { keyword: { type: 'keyword' } }
        },
        user_id: { type: 'keyword' },
        results_count: { type: 'integer' },
        click_position: { type: 'integer' },
        clicked_item_id: { type: 'keyword' },
        search_type: { type: 'keyword' },
        response_time: { type: 'integer' },
        timestamp: { type: 'date' },
        filters: { type: 'object' },
        session_id: { type: 'keyword' }
      }
    }
  }
};

// 搜索配置
export const SEARCH_CONFIGS = {
  // 默认搜索配置
  DEFAULT: {
    size: 20,
    from: 0,
    timeout: '5s',
    explain: false
  },

  // 相关性权重配置
  RELEVANCE_WEIGHTS: {
    name: 3.0,           // 商品名称权重最高
    brand: 2.0,          // 品牌权重较高
    category: 1.5,       // 分类权重中等
    description: 1.0,    // 描述权重基础
    tags: 2.5           // 标签权重较高
  },

  // 业务权重配置
  BUSINESS_WEIGHTS: {
    is_featured: 1.5,    // 推荐商品
    is_hot: 1.3,         // 热门商品
    is_new: 1.2,         // 新品
    sales_boost: 0.1,    // 销量加权
    rating_boost: 0.2    // 评分加权
  }
};

// 初始化索引
export async function initializeIndexes() {
  for (const [key, config] of Object.entries(INDEX_CONFIGS)) {
    try {
      const exists = await esClient.indices.exists({ index: config.index });
      
      if (!exists) {
        await esClient.indices.create({
          index: config.index,
          body: {
            mappings: config.mappings,
            settings: (config as any).settings || {}
          }
        });
        console.log(`✓ Created index: ${config.index}`);
      } else {
        console.log(`✓ Index already exists: ${config.index}`);
      }
    } catch (error) {
      console.error(`✗ Failed to create index ${config.index}:`, error);
    }
  }
}

// 健康检查
export async function checkElasticsearchHealth() {
  try {
    const health = await esClient.cluster.health();
    return {
      status: health.status,
      cluster_name: health.cluster_name,
      number_of_nodes: health.number_of_nodes,
      active_shards: health.active_shards
    };
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
    throw error;
  }
} 