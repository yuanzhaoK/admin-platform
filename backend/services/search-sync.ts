// 数据同步服务
import { esClient, INDEX_CONFIGS } from '../config/elasticsearch.ts';
import { pocketbaseClient } from '../config/pocketbase.ts';
import { logger } from '../utils/logger.ts';

export interface SyncJob {
  id: string;
  type: 'full' | 'incremental';
  collection: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  processedCount: number;
  errorCount: number;
  lastError?: string;
}

export class SearchSyncService {
  private syncJobs: Map<string, SyncJob> = new Map();
  private isRunning: boolean = false;
  private lastSyncTime: Map<string, Date> = new Map();

  constructor() {
    // 启动时初始化上次同步时间
    this.initializeLastSyncTimes();
  }

  /**
   * 全量同步所有数据
   */
  async fullSync(): Promise<void> {
    if (this.isRunning) {
      throw new Error('同步任务正在运行中');
    }

    this.isRunning = true;
    logger.info('开始全量数据同步...');

    try {
      // 同步各个集合
      await Promise.allSettled([
        this.syncCollection('products', true),
        this.syncCollection('orders', true),
        this.syncCollection('users', true)
      ]);

      logger.info('全量数据同步完成');
    } catch (error) {
      logger.error('全量数据同步失败:', error as Error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 增量同步
   */
  async incrementalSync(): Promise<void> {
    if (this.isRunning) {
      logger.warn('同步任务正在运行中，跳过增量同步');
      return;
    }

    this.isRunning = true;
    logger.info('开始增量数据同步...');

    try {
      await Promise.allSettled([
        this.syncCollection('products', false),
        this.syncCollection('orders', false),
        this.syncCollection('users', false)
      ]);

      logger.info('增量数据同步完成');
    } catch (error) {
      logger.error('增量数据同步失败:', error as Error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * 同步指定集合
   */
  private async syncCollection(collection: string, isFullSync: boolean): Promise<void> {
    const jobId = `${collection}_${Date.now()}`;
    const job: SyncJob = {
      id: jobId,
      type: isFullSync ? 'full' : 'incremental',
      collection,
      status: 'pending',
      processedCount: 0,
      errorCount: 0
    };

    this.syncJobs.set(jobId, job);

    try {
      job.status = 'running';
      job.startTime = new Date();

      logger.info(`开始同步集合: ${collection} (${job.type})`);

      // 构建查询条件
      let filter = '';
      if (!isFullSync) {
        const lastSync = this.lastSyncTime.get(collection);
        if (lastSync) {
          filter = `updated >= "${lastSync.toISOString()}"`;
        }
      }

      // 分页获取数据
      let page = 1;
      const perPage = 100;
      let hasMore = true;

      while (hasMore) {
        try {
          const records = await pocketbaseClient.queueRequest(() =>
            pocketbaseClient.getClient().collection(collection).getList(page, perPage, {
              filter,
              sort: 'updated'
            })
          );

          if (records.items.length === 0) {
            hasMore = false;
            break;
          }

          // 批量索引到 Elasticsearch
          await this.bulkIndexDocuments(collection, records.items);
          
          job.processedCount += records.items.length;
          
          logger.debug(`同步集合 ${collection} 第 ${page} 页，处理 ${records.items.length} 条记录`);

          // 检查是否还有更多数据
          hasMore = records.items.length === perPage;
          page++;

        } catch (error) {
          job.errorCount++;
          job.lastError = (error as Error).message;
          logger.error(`同步集合 ${collection} 第 ${page} 页失败:`, error as Error);
          
          // 继续处理下一页，不中断整个同步过程
          page++;
          hasMore = page <= 10; // 最多重试10页
        }
      }

      // 更新最后同步时间
      this.lastSyncTime.set(collection, new Date());
      
      job.status = 'completed';
      job.endTime = new Date();
      
      logger.info(`集合 ${collection} 同步完成，处理 ${job.processedCount} 条记录，错误 ${job.errorCount} 条`);

    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.lastError = (error as Error).message;
      
      logger.error(`集合 ${collection} 同步失败:`, error as Error);
      throw error;
    }
  }

  /**
   * 批量索引文档到 Elasticsearch
   */
  private async bulkIndexDocuments(collection: string, records: any[]): Promise<void> {
    if (records.length === 0) return;

    const indexName = this.getIndexName(collection);
    if (!indexName) {
      throw new Error(`未找到集合 ${collection} 对应的索引配置`);
    }

    // 构建批量操作
    const body: any[] = [];
    
    for (const record of records) {
      // 索引操作
      body.push({
        index: {
          _index: indexName,
          _id: record.id
        }
      });
      
      // 文档数据
      body.push(this.transformRecord(collection, record));
    }

    try {
      const response = await esClient.bulk({ body });
      
      if (response.errors) {
        const errors = response.items
          .filter((item: any) => item.index?.error)
          .map((item: any) => item.index.error);
        
        logger.warn(`批量索引部分失败:`, errors);
      }
      
    } catch (error) {
      logger.error('批量索引失败:', error as Error);
      throw error;
    }
  }

  /**
   * 转换记录格式
   */
  private transformRecord(collection: string, record: any): any {
    const baseFields = {
      id: record.id,
      created: record.created,
      updated: record.updated
    };

    switch (collection) {
      case 'products':
        return {
          ...baseFields,
          name: record.name || '',
          description: record.description || '',
          brand: record.brand || '',
          category: record.category || '',
          price: parseFloat(record.price) || 0,
          stock: parseInt(record.stock) || 0,
          status: record.status || 'draft',
          tags: Array.isArray(record.tags) ? record.tags : [],
          is_featured: Boolean(record.is_featured),
          is_new: Boolean(record.is_new),
          is_hot: Boolean(record.is_hot),
          sales_count: parseInt(record.sales_count) || 0,
          view_count: parseInt(record.view_count) || 0,
          rating: parseFloat(record.rating) || 0,
          search_weight: this.calculateSearchWeight(record)
        };

      case 'orders':
        return {
          ...baseFields,
          order_number: record.order_number || '',
          customer_email: record.customer_email || '',
          customer_name: record.customer_name || '',
          status: record.status || 'pending',
          total_amount: parseFloat(record.total_amount) || 0,
          items: Array.isArray(record.items) ? record.items : []
        };

      case 'users':
        return {
          ...baseFields,
          name: record.name || '',
          email: record.email || '',
          phone: record.phone || '',
          status: record.status || 'active',
          role: record.role || 'user',
          last_login: record.last_login || null,
          tags: Array.isArray(record.tags) ? record.tags : []
        };

      default:
        return baseFields;
    }
  }

  /**
   * 计算搜索权重
   */
  private calculateSearchWeight(record: any): number {
    let weight = 1.0;

    // 基于业务规则计算权重
    if (record.is_featured) weight += 0.5;
    if (record.is_hot) weight += 0.3;
    if (record.is_new) weight += 0.2;
    
    // 基于销量和评分
    const salesCount = parseInt(record.sales_count) || 0;
    const rating = parseFloat(record.rating) || 0;
    
    weight += Math.min(salesCount / 1000, 1.0) * 0.3; // 销量权重
    weight += (rating / 5.0) * 0.2; // 评分权重

    return Math.round(weight * 100) / 100; // 保留两位小数
  }

  /**
   * 获取索引名称
   */
  private getIndexName(collection: string): string | null {
    const mapping: { [key: string]: string } = {
      'products': INDEX_CONFIGS.PRODUCTS.index,
      'orders': INDEX_CONFIGS.ORDERS.index,
      'users': INDEX_CONFIGS.USERS.index
    };
    
    return mapping[collection] || null;
  }

  /**
   * 单个文档同步（实时同步用）
   */
  async syncDocument(collection: string, recordId: string, operation: 'create' | 'update' | 'delete'): Promise<void> {
    const indexName = this.getIndexName(collection);
    if (!indexName) {
      logger.warn(`未找到集合 ${collection} 对应的索引配置`);
      return;
    }

    try {
      if (operation === 'delete') {
        await esClient.delete({
          index: indexName,
          id: recordId
        });
        logger.debug(`删除文档: ${indexName}/${recordId}`);
      } else {
        // 获取最新记录
        const record = await pocketbaseClient.queueRequest(() =>
          pocketbaseClient.getClient().collection(collection).getOne(recordId)
        );

        await esClient.index({
          index: indexName,
          id: recordId,
          body: this.transformRecord(collection, record)
        });
        
        logger.debug(`${operation === 'create' ? '创建' : '更新'}文档: ${indexName}/${recordId}`);
      }
    } catch (error) {
      logger.error(`同步文档失败: ${collection}/${recordId}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): {
    isRunning: boolean;
    jobs: SyncJob[];
    lastSyncTimes: { [collection: string]: Date };
  } {
    return {
      isRunning: this.isRunning,
      jobs: Array.from(this.syncJobs.values()),
      lastSyncTimes: Object.fromEntries(this.lastSyncTime)
    };
  }

  /**
   * 初始化上次同步时间
   */
  private async initializeLastSyncTimes(): Promise<void> {
    // 这里可以从数据库或配置文件读取上次同步时间
    // 暂时使用默认值
    const collections = ['products', 'orders', 'users'];
    const defaultTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时前

    collections.forEach(collection => {
      if (!this.lastSyncTime.has(collection)) {
        this.lastSyncTime.set(collection, defaultTime);
      }
    });
  }

  /**
   * 启动定时同步任务
   */
  startScheduledSync(intervalMinutes: number = 30): void {
    setInterval(async () => {
      try {
        await this.incrementalSync();
             } catch (error) {
         logger.error('定时同步任务执行失败:', error as Error);
       }
    }, intervalMinutes * 60 * 1000);

    logger.info(`定时同步任务已启动，间隔: ${intervalMinutes} 分钟`);
  }
}

// 导出单例实例
export const searchSyncService = new SearchSyncService(); 