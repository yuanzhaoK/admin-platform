#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env

/**
 * PocketBase 数据导入脚本
 * 
 * 使用方法:
 * deno run --allow-net --allow-read --allow-write --allow-env scripts/data-import.ts [options]
 * 
 * 选项:
 * --input=filename       输入文件路径
 * --format=json|csv      数据格式 (默认: json)
 * --collection=name      目标集合名 (CSV格式必需)
 * --admin-email=email    管理员邮箱
 * --admin-password=pass  管理员密码
 * --pb-url=url          PocketBase URL (默认: http://127.0.0.1:8090)
 * --dry-run             试运行，不实际导入数据
 * --batch-size=number   批量处理大小 (默认: 50)
 */

import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";
import { exists } from "https://deno.land/std@0.208.0/fs/mod.ts";

interface ImportOptions {
  input: string;
  format: 'json' | 'csv';
  collection?: string;
  adminEmail?: string;
  adminPassword?: string;
  pbUrl: string;
  dryRun: boolean;
  batchSize: number;
}

interface ImportData {
  metadata?: {
    exportDate: string;
    version: string;
    collections: any[];
  };
  data: any[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

class PocketBaseImporter {
  private token?: string;
  private options: ImportOptions;

  constructor(options: ImportOptions) {
    this.options = options;
  }

  async authenticate() {
    try {
      console.log('🔐 正在认证管理员...');
      
      const response = await fetch(`${this.options.pbUrl}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: this.options.adminEmail,
          password: this.options.adminPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`认证失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.token;
      console.log('✅ 认证成功');
    } catch (error) {
      throw new Error(`认证失败: ${(error as Error).message}`);
    }
  }

  async createCollectionIfNotExists(collectionName: string, schema?: any[]) {
    if (!this.token) {
      throw new Error('未认证，请先调用 authenticate()');
    }

    try {
      // 检查集合是否存在
      const checkResponse = await fetch(`${this.options.pbUrl}/api/collections/${collectionName}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (checkResponse.ok) {
        console.log(`📋 集合 ${collectionName} 已存在`);
        return;
      }

      if (this.options.dryRun) {
        console.log(`🚀 [试运行] 将创建集合: ${collectionName}`);
        return;
      }

      // 创建集合
      console.log(`📋 创建集合: ${collectionName}`);
      const createResponse = await fetch(`${this.options.pbUrl}/api/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: collectionName,
          type: 'base',
          schema: schema || [
            {
              name: 'data',
              type: 'json',
              required: false,
            }
          ],
        }),
      });

      if (!createResponse.ok) {
        throw new Error(`创建集合失败: ${createResponse.status} ${createResponse.statusText}`);
      }

      console.log(`✅ 集合 ${collectionName} 创建成功`);
    } catch (error) {
      console.warn(`⚠️ 集合操作失败: ${(error as Error).message}`);
    }
  }

  async importRecord(collectionName: string, record: any): Promise<boolean> {
    if (!this.token) {
      throw new Error('未认证，请先调用 authenticate()');
    }

    try {
      if (this.options.dryRun) {
        console.log(`🚀 [试运行] 将导入记录到 ${collectionName}:`, record.id || 'new');
        return true;
      }

      // 移除不需要的字段
      const cleanRecord = { ...record };
      delete cleanRecord.id;
      delete cleanRecord.created;
      delete cleanRecord.updated;
      delete cleanRecord.collectionId;
      delete cleanRecord.collectionName;

      const response = await fetch(`${this.options.pbUrl}/api/collections/${collectionName}/records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanRecord),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
      }

      return true;
    } catch (error) {
      console.error(`❌ 导入记录失败:`, (error as Error).message);
      return false;
    }
  }

  async importBatch(collectionName: string, records: any[]): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    console.log(`📦 导入批次: ${records.length} 条记录到 ${collectionName}`);

    for (const record of records) {
      try {
        const success = await this.importRecord(collectionName, record);
        if (success) {
          result.success++;
        } else {
          result.failed++;
        }
      } catch (error) {
        result.failed++;
        result.errors.push((error as Error).message);
      }
    }

    return result;
  }

  async parseJSON(filePath: string): Promise<ImportData> {
    try {
      const content = await Deno.readTextFile(filePath);
      const data = JSON.parse(content);
      
      // 检查是否是导出格式
      if (data.metadata && data.data) {
        return data as ImportData;
      }
      
      // 否则假设是记录数组
      return {
        data: Array.isArray(data) ? data : [data],
      };
    } catch (error) {
      throw new Error(`解析JSON文件失败: ${(error as Error).message}`);
    }
  }

  async parseCSV(filePath: string): Promise<any[]> {
    try {
      const content = await Deno.readTextFile(filePath);
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV文件至少需要包含头部和一行数据');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const record: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          
          // 尝试解析JSON
          if (value.startsWith('{') || value.startsWith('[')) {
            try {
              record[header] = JSON.parse(value);
            } catch {
              record[header] = value;
            }
          } else if (value === '') {
            record[header] = null;
          } else if (!isNaN(Number(value)) && value !== '') {
            record[header] = Number(value);
          } else if (value === 'true' || value === 'false') {
            record[header] = value === 'true';
          } else {
            record[header] = value;
          }
        });
        
        records.push(record);
      }

      return records;
    } catch (error) {
      throw new Error(`解析CSV文件失败: ${(error as Error).message}`);
    }
  }

  async import(): Promise<void> {
    try {
      // 检查文件是否存在
      if (!await exists(this.options.input)) {
        throw new Error(`文件不存在: ${this.options.input}`);
      }

      // 认证
      await this.authenticate();

      let importData: ImportData;
      let collectionName = this.options.collection;

      if (this.options.format === 'json') {
        importData = await this.parseJSON(this.options.input);
        
        // 如果没有指定集合名，尝试从数据中推断
        if (!collectionName) {
          if (importData.data.length > 0 && importData.data[0].collectionName) {
            collectionName = importData.data[0].collectionName;
          } else {
            throw new Error('JSON格式需要指定 --collection 参数或数据中包含 collectionName 字段');
          }
        }
      } else if (this.options.format === 'csv') {
        if (!collectionName) {
          throw new Error('CSV格式必须指定 --collection 参数');
        }
        
        const records = await this.parseCSV(this.options.input);
        importData = { data: records };
      } else {
        throw new Error('不支持的格式');
      }

      console.log(`📊 准备导入 ${importData.data.length} 条记录`);

      // 按集合分组数据
      const recordsByCollection = new Map<string, any[]>();
      
      for (const record of importData.data) {
        const targetCollection = record.collectionName || collectionName;
        if (!targetCollection) {
          console.warn('⚠️ 跳过没有集合名的记录:', record);
          continue;
        }
        
        if (!recordsByCollection.has(targetCollection)) {
          recordsByCollection.set(targetCollection, []);
        }
        recordsByCollection.get(targetCollection)!.push(record);
      }

      // 为每个集合创建或验证存在性
      for (const [collection, records] of recordsByCollection) {
        const schema = importData.metadata?.collections?.find(c => c.name === collection)?.schema;
        await this.createCollectionIfNotExists(collection, schema);
      }

      // 导入数据
      let totalSuccess = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];

      for (const [collection, records] of recordsByCollection) {
        console.log(`\n📋 导入集合: ${collection} (${records.length} 条记录)`);
        
        // 批量处理
        for (let i = 0; i < records.length; i += this.options.batchSize) {
          const batch = records.slice(i, i + this.options.batchSize);
          const result = await this.importBatch(collection, batch);
          
          totalSuccess += result.success;
          totalFailed += result.failed;
          allErrors.push(...result.errors);
          
          console.log(`  批次 ${Math.floor(i / this.options.batchSize) + 1}: ${result.success} 成功, ${result.failed} 失败`);
        }
      }

      console.log(`\n🎉 导入完成!`);
      console.log(`✅ 成功: ${totalSuccess}`);
      console.log(`❌ 失败: ${totalFailed}`);
      
      if (allErrors.length > 0) {
        console.log(`\n错误详情:`);
        allErrors.slice(0, 10).forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`);
        });
        
        if (allErrors.length > 10) {
          console.log(`  ... 还有 ${allErrors.length - 10} 个错误`);
        }
      }

    } catch (error) {
      console.error('❌ 导入失败:', (error as Error).message);
      Deno.exit(1);
    }
  }
}

async function main() {
  const args = parse(Deno.args, {
    string: ['input', 'format', 'collection', 'admin-email', 'admin-password', 'pb-url', 'batch-size'],
    boolean: ['dry-run', 'help', 'h'],
    default: {
      format: 'json',
      'pb-url': 'http://127.0.0.1:8090',
      'batch-size': '50',
      'dry-run': false,
    },
  });

  // 显示帮助
  if (args.help || args.h) {
    console.log(`
PocketBase 数据导入工具

使用方法:
  deno run --allow-net --allow-read --allow-write --allow-env scripts/data-import.ts [选项]

选项:
  --input=filename            输入文件路径 (必需)
  --format=json|csv          数据格式 (默认: json)
  --collection=name          目标集合名 (CSV格式必需，JSON格式可选)
  --admin-email=email        管理员邮箱 (必需)
  --admin-password=password  管理员密码 (必需)
  --pb-url=url              PocketBase URL (默认: http://127.0.0.1:8090)
  --dry-run                 试运行，不实际导入数据
  --batch-size=number       批量处理大小 (默认: 50)
  --help, -h                显示此帮助信息

示例:
  # 导入JSON备份文件
  deno run --allow-all scripts/data-import.ts --input=backup.json --admin-email=admin@admin.com --admin-password=1234567890

  # 导入CSV文件到指定集合
  deno run --allow-all scripts/data-import.ts --input=products.csv --format=csv --collection=products --admin-email=admin@admin.com --admin-password=1234567890

  # 试运行（不实际导入）
  deno run --allow-all scripts/data-import.ts --input=backup.json --dry-run --admin-email=admin@admin.com --admin-password=1234567890
    `);
    Deno.exit(0);
  }

  // 检查必需参数
  if (!args.input) {
    console.error('❌ 请提供输入文件路径 (--input)');
    console.error('使用 --help 查看帮助信息');
    Deno.exit(1);
  }

  if (!args['admin-email'] || !args['admin-password']) {
    console.error('❌ 请提供管理员邮箱和密码');
    console.error('使用 --help 查看帮助信息');
    Deno.exit(1);
  }

  const options: ImportOptions = {
    input: args.input,
    format: args.format as 'json' | 'csv',
    collection: args.collection,
    adminEmail: args['admin-email'],
    adminPassword: args['admin-password'],
    pbUrl: args['pb-url'],
    dryRun: args['dry-run'],
    batchSize: parseInt(args['batch-size']) || 50,
  };

  const importer = new PocketBaseImporter(options);
  await importer.import();
}

if (import.meta.main) {
  main();
} 