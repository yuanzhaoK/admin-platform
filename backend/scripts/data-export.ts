#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env

/**
 * PocketBase 数据导出脚本
 * 
 * 使用方法:
 * deno run --allow-net --allow-read --allow-write --allow-env scripts/data-export.ts [options]
 * 
 * 选项:
 * --format=json|csv      导出格式 (默认: json)
 * --output=filename      输出文件名 (默认: backup-{timestamp})
 * --collections=name1,name2  指定要导出的集合 (默认: 所有)
 * --admin-email=email    管理员邮箱
 * --admin-password=pass  管理员密码
 * --pb-url=url          PocketBase URL (默认: http://127.0.0.1:8090)
 */

import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";

interface ExportOptions {
  format: 'json' | 'csv';
  output: string;
  collections?: string[];
  adminEmail?: string;
  adminPassword?: string;
  pbUrl: string;
}

interface Collection {
  id: string;
  name: string;
  type: string;
  schema: any[];
}

interface Record {
  id: string;
  created: string;
  updated: string;
  [key: string]: any;
}

class PocketBaseExporter {
  private token?: string;
  private options: ExportOptions;

  constructor(options: ExportOptions) {
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
      throw new Error(`认证失败: ${error.message}`);
    }
  }

  async getCollections(): Promise<Collection[]> {
    if (!this.token) {
      throw new Error('未认证，请先调用 authenticate()');
    }

    try {
      console.log('📋 获取集合列表...');
      
      const response = await fetch(`${this.options.pbUrl}/api/collections`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`获取集合失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const collections = data.items || [];
      
      // 过滤指定的集合
      if (this.options.collections && this.options.collections.length > 0) {
        return collections.filter((c: Collection) => 
          this.options.collections!.includes(c.name)
        );
      }
      
      return collections;
    } catch (error) {
      throw new Error(`获取集合失败: ${error.message}`);
    }
  }

  async exportCollection(collection: Collection): Promise<Record[]> {
    if (!this.token) {
      throw new Error('未认证，请先调用 authenticate()');
    }

    try {
      console.log(`📦 导出集合: ${collection.name}`);
      
      const allRecords: Record[] = [];
      let page = 1;
      const perPage = 200;

      while (true) {
        const response = await fetch(
          `${this.options.pbUrl}/api/collections/${collection.name}/records?page=${page}&perPage=${perPage}`, 
          {
            headers: {
              'Authorization': `Bearer ${this.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`导出集合 ${collection.name} 失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const records = data.items || [];
        
        allRecords.push(...records);
        
        // 检查是否还有更多数据
        if (records.length < perPage) {
          break;
        }
        
        page++;
      }

      console.log(`✅ 集合 ${collection.name} 导出完成，共 ${allRecords.length} 条记录`);
      return allRecords;
    } catch (error) {
      console.error(`❌ 导出集合 ${collection.name} 失败:`, error.message);
      return [];
    }
  }

  async exportToJSON(collections: Collection[], records: Record[]): Promise<void> {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        collections: collections.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type,
          schema: c.schema,
        })),
      },
      data: records,
    };

    const outputPath = `${this.options.output}.json`;
    await Deno.writeTextFile(outputPath, JSON.stringify(exportData, null, 2));
    console.log(`📄 JSON 导出完成: ${outputPath}`);
  }

  async exportToCSV(collections: Collection[], records: Record[]): Promise<void> {
    // 按集合分组导出CSV
    const recordsByCollection = new Map<string, Record[]>();
    
    for (const record of records) {
      const collectionName = record.collectionName || 'unknown';
      if (!recordsByCollection.has(collectionName)) {
        recordsByCollection.set(collectionName, []);
      }
      recordsByCollection.get(collectionName)!.push(record);
    }

    for (const [collectionName, collectionRecords] of recordsByCollection) {
      if (collectionRecords.length === 0) continue;

      // 获取所有字段名
      const allFields = new Set<string>();
      collectionRecords.forEach(record => {
        Object.keys(record).forEach(key => allFields.add(key));
      });

      const fields = Array.from(allFields).sort();
      
      // 生成CSV内容
      const csvLines = [
        fields.join(','), // 头部
        ...collectionRecords.map(record => 
          fields.map(field => {
            const value = record[field];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];

      const outputPath = `${this.options.output}_${collectionName}.csv`;
      await Deno.writeTextFile(outputPath, csvLines.join('\n'));
      console.log(`📊 CSV 导出完成: ${outputPath} (${collectionRecords.length} 记录)`);
    }
  }

  async export(): Promise<void> {
    try {
      // 认证
      await this.authenticate();
      
      // 获取集合
      const collections = await this.getCollections();
      console.log(`📚 找到 ${collections.length} 个集合`);

      // 导出所有数据
      const allRecords: Record[] = [];
      for (const collection of collections) {
        const records = await this.exportCollection(collection);
        // 为每条记录添加集合名
        records.forEach(record => {
          record.collectionName = collection.name;
        });
        allRecords.push(...records);
      }

      console.log(`📊 总共导出 ${allRecords.length} 条记录`);

      // 根据格式导出
      if (this.options.format === 'json') {
        await this.exportToJSON(collections, allRecords);
      } else if (this.options.format === 'csv') {
        await this.exportToCSV(collections, allRecords);
      }

      console.log('🎉 导出完成!');
    } catch (error) {
      console.error('❌ 导出失败:', error.message);
      Deno.exit(1);
    }
  }
}

async function main() {
  const args = parse(Deno.args, {
    string: ['format', 'output', 'collections', 'admin-email', 'admin-password', 'pb-url'],
    default: {
      format: 'json',
      output: `backup-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`,
      'pb-url': 'http://127.0.0.1:8090',
    },
  });

  // 显示帮助
  if (args.help || args.h) {
    console.log(`
PocketBase 数据导出工具

使用方法:
  deno run --allow-net --allow-read --allow-write --allow-env scripts/data-export.ts [选项]

选项:
  --format=json|csv           导出格式 (默认: json)
  --output=filename           输出文件名前缀 (默认: backup-{timestamp})
  --collections=name1,name2   指定要导出的集合，用逗号分隔 (默认: 所有集合)
  --admin-email=email         管理员邮箱
  --admin-password=password   管理员密码
  --pb-url=url               PocketBase URL (默认: http://127.0.0.1:8090)
  --help, -h                 显示此帮助信息

示例:
  # 导出所有数据为JSON
  deno run --allow-all scripts/data-export.ts --admin-email=admin@admin.com --admin-password=1234567890

  # 导出指定集合为CSV
  deno run --allow-all scripts/data-export.ts --format=csv --collections=products,users --admin-email=admin@admin.com --admin-password=1234567890
    `);
    Deno.exit(0);
  }

  // 检查必需参数
  if (!args['admin-email'] || !args['admin-password']) {
    console.error('❌ 请提供管理员邮箱和密码');
    console.error('使用 --help 查看帮助信息');
    Deno.exit(1);
  }

  const options: ExportOptions = {
    format: args.format as 'json' | 'csv',
    output: args.output,
    collections: args.collections ? args.collections.split(',') : undefined,
    adminEmail: args['admin-email'],
    adminPassword: args['admin-password'],
    pbUrl: args['pb-url'],
  };

  const exporter = new PocketBaseExporter(options);
  await exporter.export();
}

if (import.meta.main) {
  main();
} 