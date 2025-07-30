// 高级搜索引擎服务
import { esClient, SEARCH_CONFIGS } from '../config/elasticsearch.ts';
// 移除Redis依赖，使用内存缓存
import { logger } from '../utils/logger.ts';

// 搜索请求接口
export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  pagination?: SearchPagination;
  types?: string[];
  userId?: string;
  sessionId?: string;
}

// 搜索过滤器
export interface SearchFilters {
  priceRange?: { min?: number; max?: number };
  categories?: string[];
  brands?: string[];
  tags?: string[];
  status?: string[];
  dateRange?: { start?: string; end?: string };
  inStock?: boolean;
  featured?: boolean;
  new?: boolean;
  hot?: boolean;
}

// 搜索排序
export interface SearchSort {
  field: string;
  order: 'asc' | 'desc';
}

// 搜索分页
export interface SearchPagination {
  page: number;
  size: number;
}

// 搜索结果
export interface SearchResponse {
  query: string;
  total: number;
  hits: SearchHit[];
  aggregations?: SearchAggregations;
  suggestions?: string[];
  executionTime: number;
  cached: boolean;
}

// 搜索命中结果
export interface SearchHit {
  id: string;
  type: string;
  title: string;
  description?: string;
  subtitle?: string;
  url: string;
  icon?: string;
  score: number;
  highlight?: { [field: string]: string[] };
  metadata?: any;
}

// 搜索聚合结果
export interface SearchAggregations {
  categories?: { [key: string]: number };
  brands?: { [key: string]: number };
  priceRanges?: { [key: string]: number };
  tags?: { [key: string]: number };
}

export class SearchEngineService {
  private readonly CACHE_TTL = 300; // 5分钟缓存
  private readonly CACHE_PREFIX = 'search:';
  private cache = new Map<string, { value: any; timestamp: number }>();

  /**
   * 执行搜索
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();
    
    // 记录搜索日志
    this.logSearchRequest(request);
    
    // 检查缓存
    const cacheKey = this.generateCacheKey(request);
    const cached = await this.getCachedResult(cacheKey);
    if (cached) {
      return { ...cached, executionTime: Date.now() - startTime, cached: true };
    }

    try {
      // 构建Elasticsearch查询
      const esQuery = this.buildElasticsearchQuery(request);
      
      // 执行搜索
      const esResponse = await esClient.search(esQuery);
      
      // 转换结果
      const searchResponse = this.transformResponse(request, esResponse, Date.now() - startTime);
      
      // 缓存结果
      await this.cacheResult(cacheKey, searchResponse);
      
      // 记录搜索结果日志
      this.logSearchResult(request, searchResponse);
      
      return { ...searchResponse, cached: false };
      
    } catch (error) {
      logger.error('搜索执行失败:', error as Error);
      throw new Error(`搜索失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(query: string, size: number = 5): Promise<string[]> {
    if (!query.trim()) return [];

    try {
      const esQuery = {
        index: 'products',
        body: {
          suggest: {
            product_suggest: {
              prefix: query,
              completion: {
                field: 'name.suggest',
                size: size,
                skip_duplicates: true
              }
            }
          }
        }
      };

      const response = await esClient.search(esQuery);
      const suggestions = response.suggest?.product_suggest?.[0]?.options || [];
      
      return suggestions.map((item: any) => item.text);
      
    } catch (error) {
      logger.error('获取搜索建议失败:', error as Error);
      return [];
    }
  }

  /**
   * 获取热门搜索词
   */
  async getHotQueries(limit: number = 10): Promise<string[]> {
    const cacheKey = `${this.CACHE_PREFIX}hot_queries`;
    
    try {
             const cached = this.getCacheItem<string[]>(cacheKey);
       if (cached) {
         return cached;
       }

      // 从搜索日志聚合热门查询
      const esQuery = {
        index: 'search_logs',
        body: {
          size: 0,
          query: {
            range: {
              timestamp: {
                gte: 'now-7d' // 最近7天
              }
            }
          },
          aggs: {
            hot_queries: {
              terms: {
                field: 'query.keyword',
                size: limit,
                min_doc_count: 2
              }
            }
          }
        }
      };

      const response = await esClient.search(esQuery);
      const buckets = response.aggregations?.hot_queries?.buckets || [];
      const hotQueries = buckets.map((bucket: any) => bucket.key);

             // 缓存1小时
       this.setCacheItem(cacheKey, hotQueries, 3600);
      
      return hotQueries;
      
    } catch (error) {
      logger.error('获取热门搜索词失败:', error as Error);
      return [];
    }
  }

  /**
   * 获取搜索分析数据
   */
  async getSearchAnalytics(days: number = 7): Promise<any> {
    try {
      const esQuery = {
        index: 'search_logs',
        body: {
          size: 0,
          query: {
            range: {
              timestamp: {
                gte: `now-${days}d`
              }
            }
          },
          aggs: {
            daily_searches: {
              date_histogram: {
                field: 'timestamp',
                interval: '1d'
              }
            },
            top_queries: {
              terms: {
                field: 'query.keyword',
                size: 20
              }
            },
            avg_response_time: {
              avg: {
                field: 'response_time'
              }
            },
            zero_results: {
              filter: {
                term: { results_count: 0 }
              }
            }
          }
        }
      };

      const response = await esClient.search(esQuery);
      return response.aggregations;
      
    } catch (error) {
      logger.error('获取搜索分析数据失败:', error as Error);
      return null;
    }
  }

  /**
   * 构建Elasticsearch查询
   */
  private buildElasticsearchQuery(request: SearchRequest): any {
    const { query, filters, sort, pagination, types } = request;
    const { page = 1, size = 20 } = pagination || {};

    // 基础查询结构
    const esQuery: any = {
      index: this.getSearchIndexes(types),
      body: {
        size,
        from: (page - 1) * size,
        timeout: SEARCH_CONFIGS.DEFAULT.timeout,
        query: {
          bool: {
            must: [],
            filter: [],
            should: [],
            minimum_should_match: 0
          }
        },
        highlight: {
          fields: {
            'name': {},
            'description': {},
            'brand': {},
            'category': {}
          }
        },
        aggs: {
          categories: {
            terms: { field: 'category.keyword', size: 20 }
          },
          brands: {
            terms: { field: 'brand.keyword', size: 20 }
          },
          price_ranges: {
            range: {
              field: 'price',
              ranges: [
                { to: 100 },
                { from: 100, to: 500 },
                { from: 500, to: 1000 },
                { from: 1000 }
              ]
            }
          }
        }
      }
    };

    // 构建主查询
    if (query.trim()) {
      esQuery.body.query.bool.must.push({
        multi_match: {
          query: query,
          fields: [
            'name^3',
            'brand^2',
            'category^1.5',
            'description^1',
            'tags^2.5'
          ],
          type: 'best_fields',
          fuzziness: 'AUTO'
        }
      });

      // 添加拼音搜索支持
      esQuery.body.query.bool.should.push({
        multi_match: {
          query: query,
          fields: ['name.pinyin', 'brand.pinyin'],
          analyzer: 'pinyin_analyzer',
          boost: 0.5
        }
      });
    } else {
      esQuery.body.query.bool.must.push({ match_all: {} });
    }

    // 添加过滤器
    this.addFilters(esQuery.body.query.bool.filter, filters);

    // 添加业务权重
    this.addBusinessBoosts(esQuery.body.query.bool.should);

    // 添加排序
    this.addSorting(esQuery.body, sort);

    return esQuery;
  }

  /**
   * 添加过滤器
   */
  private addFilters(filterArray: any[], filters?: SearchFilters): void {
    if (!filters) return;

    // 价格范围过滤
    if (filters.priceRange) {
      const priceFilter: any = { range: { price: {} } };
      if (filters.priceRange.min !== undefined) {
        priceFilter.range.price.gte = filters.priceRange.min;
      }
      if (filters.priceRange.max !== undefined) {
        priceFilter.range.price.lte = filters.priceRange.max;
      }
      filterArray.push(priceFilter);
    }

    // 分类过滤
    if (filters.categories?.length) {
      filterArray.push({
        terms: { 'category.keyword': filters.categories }
      });
    }

    // 品牌过滤
    if (filters.brands?.length) {
      filterArray.push({
        terms: { 'brand.keyword': filters.brands }
      });
    }

    // 标签过滤
    if (filters.tags?.length) {
      filterArray.push({
        terms: { 'tags': filters.tags }
      });
    }

    // 状态过滤
    if (filters.status?.length) {
      filterArray.push({
        terms: { 'status': filters.status }
      });
    }

    // 库存过滤
    if (filters.inStock) {
      filterArray.push({
        range: { stock: { gt: 0 } }
      });
    }

    // 特性过滤
    if (filters.featured) {
      filterArray.push({ term: { is_featured: true } });
    }
    if (filters.new) {
      filterArray.push({ term: { is_new: true } });
    }
    if (filters.hot) {
      filterArray.push({ term: { is_hot: true } });
    }

    // 日期范围过滤
    if (filters.dateRange) {
      const dateFilter: any = { range: { created: {} } };
      if (filters.dateRange.start) {
        dateFilter.range.created.gte = filters.dateRange.start;
      }
      if (filters.dateRange.end) {
        dateFilter.range.created.lte = filters.dateRange.end;
      }
      filterArray.push(dateFilter);
    }
  }

  /**
   * 添加业务权重
   */
  private addBusinessBoosts(shouldArray: any[]): void {
    const weights = SEARCH_CONFIGS.BUSINESS_WEIGHTS;

    // 推荐商品权重提升
    shouldArray.push({
      term: { is_featured: { value: true, boost: weights.is_featured } }
    });

    // 热门商品权重提升
    shouldArray.push({
      term: { is_hot: { value: true, boost: weights.is_hot } }
    });

    // 新品权重提升
    shouldArray.push({
      term: { is_new: { value: true, boost: weights.is_new } }
    });

    // 基于销量的函数评分
    shouldArray.push({
      function_score: {
        field_value_factor: {
          field: 'sales_count',
          factor: weights.sales_boost,
          modifier: 'log1p',
          missing: 0
        }
      }
    });

    // 基于评分的函数评分
    shouldArray.push({
      function_score: {
        field_value_factor: {
          field: 'rating',
          factor: weights.rating_boost,
          modifier: 'none',
          missing: 0
        }
      }
    });
  }

  /**
   * 添加排序
   */
  private addSorting(queryBody: any, sort?: SearchSort): void {
    if (!sort) {
      // 默认排序：相关性 + 搜索权重
      queryBody.sort = [
        '_score',
        { 'search_weight': { order: 'desc' } },
        { 'created': { order: 'desc' } }
      ];
      return;
    }

    const sortField = sort.field;
    const sortOrder = sort.order;

    queryBody.sort = [];

    switch (sortField) {
      case 'price':
        queryBody.sort.push({ price: { order: sortOrder } });
        break;
      case 'created':
        queryBody.sort.push({ created: { order: sortOrder } });
        break;
      case 'sales':
        queryBody.sort.push({ sales_count: { order: sortOrder } });
        break;
      case 'rating':
        queryBody.sort.push({ rating: { order: sortOrder } });
        break;
      default:
        queryBody.sort.push('_score');
    }

    // 始终添加ID作为最后的排序字段，确保结果一致性
    queryBody.sort.push({ 'id': { order: 'asc' } });
  }

  /**
   * 获取搜索索引
   */
  private getSearchIndexes(types?: string[]): string[] {
    const indexMapping: { [key: string]: string } = {
      'PRODUCT': 'products',
      'ORDER': 'orders',
      'USER': 'users'
    };

    if (!types || types.length === 0) {
      return Object.values(indexMapping);
    }

    return types
      .map(type => indexMapping[type])
      .filter(index => index !== undefined);
  }

  /**
   * 转换搜索响应
   */
  private transformResponse(request: SearchRequest, esResponse: any, executionTime: number): SearchResponse {
    const hits = esResponse.hits?.hits?.map((hit: any) => this.transformHit(hit)) || [];
    const total = esResponse.hits?.total?.value || 0;
    
    return {
      query: request.query,
      total,
      hits,
      aggregations: this.transformAggregations(esResponse.aggregations),
      executionTime,
      cached: false
    };
  }

  /**
   * 转换搜索命中结果
   */
  private transformHit(hit: any): SearchHit {
    const source = hit._source;
    const highlight = hit.highlight;

    return {
      id: source.id,
      type: this.getTypeFromIndex(hit._index),
      title: source.name || source.order_number || source.email || 'Untitled',
      description: source.description || '',
      subtitle: source.brand || source.customer_name || '',
      url: this.generateUrl(hit._index, source.id),
      icon: this.getIconForType(hit._index),
      score: hit._score,
      highlight,
      metadata: {
        index: hit._index,
        created: source.created,
        updated: source.updated,
        ...this.getAdditionalMetadata(hit._index, source)
      }
    };
  }

  /**
   * 转换聚合结果
   */
  private transformAggregations(aggs: any): SearchAggregations | undefined {
    if (!aggs) return undefined;

    const result: SearchAggregations = {};

    if (aggs.categories) {
      result.categories = {};
      aggs.categories.buckets.forEach((bucket: any) => {
        result.categories![bucket.key] = bucket.doc_count;
      });
    }

    if (aggs.brands) {
      result.brands = {};
      aggs.brands.buckets.forEach((bucket: any) => {
        result.brands![bucket.key] = bucket.doc_count;
      });
    }

    if (aggs.price_ranges) {
      result.priceRanges = {};
      aggs.price_ranges.buckets.forEach((bucket: any, index: number) => {
        const ranges = ['0-100', '100-500', '500-1000', '1000+'];
        result.priceRanges![ranges[index]] = bucket.doc_count;
      });
    }

    return result;
  }

  /**
   * 辅助方法
   */
  private getTypeFromIndex(index: string): string {
    const mapping: { [key: string]: string } = {
      'products': 'PRODUCT',
      'orders': 'ORDER',
      'users': 'USER'
    };
    return mapping[index] || 'UNKNOWN';
  }

  private generateUrl(index: string, id: string): string {
    const baseUrls: { [key: string]: string } = {
      'products': '/dashboard/products/management',
      'orders': '/dashboard/orders/list',
      'users': '/dashboard/users'
    };
    return `${baseUrls[index] || '/dashboard'}?id=${id}`;
  }

  private getIconForType(index: string): string {
    const icons: { [key: string]: string } = {
      'products': 'Package',
      'orders': 'ShoppingCart',
      'users': 'Users'
    };
    return icons[index] || 'Search';
  }

  private getAdditionalMetadata(index: string, source: any): any {
    switch (index) {
      case 'products':
        return {
          price: source.price,
          stock: source.stock,
          status: source.status
        };
      case 'orders':
        return {
          status: source.status,
          total_amount: source.total_amount
        };
      case 'users':
        return {
          status: source.status,
          role: source.role
        };
      default:
        return {};
    }
  }

  /**
   * 缓存相关方法
   */
  private generateCacheKey(request: SearchRequest): string {
    const keyData = {
      query: request.query,
      filters: request.filters,
      sort: request.sort,
      pagination: request.pagination,
      types: request.types
    };
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(keyData));
    return `${this.CACHE_PREFIX}${btoa(String.fromCharCode(...data))}`;
  }

  private async getCachedResult(key: string): Promise<SearchResponse | null> {
    try {
      return this.getCacheItem(key);
    } catch (error) {
      logger.warn('获取缓存失败:', error as Error);
      return null;
    }
  }

  private async cacheResult(key: string, result: SearchResponse): Promise<void> {
    try {
      this.setCacheItem(key, result, this.CACHE_TTL);
    } catch (error) {
      logger.warn('缓存结果失败:', error as Error);
    }
  }

  /**
   * 内存缓存辅助方法
   */
  private getCacheItem<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() - item.timestamp > this.CACHE_TTL * 1000) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  private setCacheItem<T>(key: string, value: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });

    // 简单的LRU清理，保持缓存大小
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * 日志记录方法
   */
  private async logSearchRequest(request: SearchRequest): Promise<void> {
    try {
      const logDoc = {
        query: request.query,
        user_id: request.userId || 'anonymous',
        session_id: request.sessionId || '',
        search_type: request.types?.join(',') || 'all',
        filters: request.filters,
        timestamp: new Date()
      };

      await esClient.index({
        index: 'search_logs',
        body: logDoc
      });
    } catch (error) {
      logger.warn('记录搜索请求失败:', error as Error);
    }
  }

  private async logSearchResult(request: SearchRequest, response: SearchResponse): Promise<void> {
    try {
      await esClient.update({
        index: 'search_logs',
        id: `${request.sessionId || 'anonymous'}_${Date.now()}`,
        body: {
          doc: {
            results_count: response.total,
            response_time: response.executionTime
          },
          doc_as_upsert: true
        }
      });
    } catch (error) {
      logger.warn('记录搜索结果失败:', error as Error);
    }
  }
}

// 导出单例实例
export const searchEngineService = new SearchEngineService(); 