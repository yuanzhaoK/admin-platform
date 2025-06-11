#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env --allow-run

/**
 * PocketBase 数据管理器
 * 
 * 这是一个统一的数据管理工具，提供导入导出等功能
 * 
 * 使用方法:
 * deno run --allow-all scripts/data-manager.ts [command] [options]
 */

import { parse } from "https://deno.land/std@0.208.0/flags/mod.ts";

type Command = 'export' | 'import' | 'backup' | 'restore' | 'list' | 'help';

interface Config {
  adminEmail: string;
  adminPassword: string;
  pbUrl: string;
  backupDir: string;
}

class DataManager {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async export(options: {
    format?: 'json' | 'csv';
    output?: string;
    collections?: string;
  }) {
    console.log('🚀 开始数据导出...');
    
    const args = [
      'run',
      '--allow-all',
      'scripts/data-export.ts',
      '--admin-email=' + this.config.adminEmail,
      '--admin-password=' + this.config.adminPassword,
      '--pb-url=' + this.config.pbUrl,
    ];

    if (options.format) {
      args.push('--format=' + options.format);
    }

    if (options.output) {
      args.push('--output=' + options.output);
    }

    if (options.collections) {
      args.push('--collections=' + options.collections);
    }

    const process = new Deno.Command('deno', {
      args,
      cwd: Deno.cwd(),
    });

    const result = await process.output();
    
    if (result.code !== 0) {
      console.error('❌ 导出失败');
      const error = new TextDecoder().decode(result.stderr);
      console.error(error);
      return false;
    }

    console.log('✅ 导出成功');
    return true;
  }

  async import(options: {
    input: string;
    format?: 'json' | 'csv';
    collection?: string;
    dryRun?: boolean;
    batchSize?: number;
  }) {
    console.log('🚀 开始数据导入...');
    
    const args = [
      'run',
      '--allow-all',
      'scripts/data-import.ts',
      '--input=' + options.input,
      '--admin-email=' + this.config.adminEmail,
      '--admin-password=' + this.config.adminPassword,
      '--pb-url=' + this.config.pbUrl,
    ];

    if (options.format) {
      args.push('--format=' + options.format);
    }

    if (options.collection) {
      args.push('--collection=' + options.collection);
    }

    if (options.dryRun) {
      args.push('--dry-run');
    }

    if (options.batchSize) {
      args.push('--batch-size=' + options.batchSize);
    }

    const process = new Deno.Command('deno', {
      args,
      cwd: Deno.cwd(),
    });

    const result = await process.output();
    
    if (result.code !== 0) {
      console.error('❌ 导入失败');
      const error = new TextDecoder().decode(result.stderr);
      console.error(error);
      return false;
    }

    console.log('✅ 导入成功');
    return true;
  }

  async backup(name?: string) {
    console.log('📦 创建数据备份...');
    
    // 确保备份目录存在
    try {
      await Deno.mkdir(this.config.backupDir, { recursive: true });
    } catch (error) {
      if (!(error instanceof Deno.errors.AlreadyExists)) {
        throw error;
      }
    }

    // 生成备份文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const backupName = name || `backup-${timestamp}`;
    const backupPath = `${this.config.backupDir}/${backupName}`;

    // 导出数据
    const success = await this.export({
      format: 'json',
      output: backupPath,
    });

    if (success) {
      console.log(`💾 备份已保存: ${backupPath}.json`);
      
      // 创建备份信息文件
      const info = {
        name: backupName,
        created: new Date().toISOString(),
        size: 0,
        pbUrl: this.config.pbUrl,
      };

      try {
        const stat = await Deno.stat(`${backupPath}.json`);
        info.size = stat.size;
      } catch {
        // 忽略文件大小获取错误
      }

      await Deno.writeTextFile(
        `${backupPath}.info.json`,
        JSON.stringify(info, null, 2)
      );

      return backupPath;
    }

    return null;
  }

  async restore(backupPath: string, options?: { dryRun?: boolean }) {
    console.log(`🔄 恢复数据备份: ${backupPath}`);
    
    // 检查备份文件是否存在
    let fullPath = backupPath;
    if (!backupPath.endsWith('.json')) {
      fullPath = `${backupPath}.json`;
    }

    try {
      await Deno.stat(fullPath);
    } catch {
      throw new Error(`备份文件不存在: ${fullPath}`);
    }

    // 恢复数据
    const success = await this.import({
      input: fullPath,
      format: 'json',
      dryRun: options?.dryRun,
    });

    if (success) {
      console.log('🎉 数据恢复成功');
    }

    return success;
  }

  async listBackups() {
    console.log('📋 备份列表:');
    
    try {
      const backups = [];
      
      for await (const entry of Deno.readDir(this.config.backupDir)) {
        if (entry.isFile && entry.name.endsWith('.json') && !entry.name.endsWith('.info.json')) {
          const baseName = entry.name.replace('.json', '');
          const infoPath = `${this.config.backupDir}/${baseName}.info.json`;
          
          let info = null;
          try {
            const infoContent = await Deno.readTextFile(infoPath);
            info = JSON.parse(infoContent);
          } catch {
            // 如果没有info文件，使用文件stat信息
            const stat = await Deno.stat(`${this.config.backupDir}/${entry.name}`);
            info = {
              name: baseName,
              created: stat.mtime?.toISOString() || 'unknown',
              size: stat.size,
            };
          }
          
          backups.push({
            path: `${this.config.backupDir}/${baseName}`,
            ...info,
          });
        }
      }

      if (backups.length === 0) {
        console.log('  (没有找到备份文件)');
        return;
      }

      backups.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

      backups.forEach((backup, index) => {
        const size = backup.size ? `${Math.round(backup.size / 1024)}KB` : 'unknown';
        const date = new Date(backup.created).toLocaleString();
        console.log(`  ${index + 1}. ${backup.name}`);
        console.log(`     路径: ${backup.path}.json`);
        console.log(`     时间: ${date}`);
        console.log(`     大小: ${size}`);
        console.log('');
      });

    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        console.log('  备份目录不存在');
      } else {
        console.error('  获取备份列表失败:', (error as Error).message);
      }
    }
  }

  showHelp() {
    console.log(`
PocketBase 数据管理器

使用方法:
  deno run --allow-all scripts/data-manager.ts [命令] [选项]

命令:
  export    导出数据
  import    导入数据  
  backup    创建备份
  restore   恢复备份
  list      列出备份
  help      显示帮助

导出选项:
  --format=json|csv           导出格式 (默认: json)
  --output=filename           输出文件名
  --collections=name1,name2   指定集合

导入选项:
  --input=filename            输入文件路径 (必需)
  --format=json|csv          数据格式 (默认: json)
  --collection=name          目标集合名
  --dry-run                  试运行
  --batch-size=number        批量大小

备份选项:
  --name=backup-name         备份名称

恢复选项:
  --backup=path              备份路径
  --dry-run                  试运行

配置选项:
  --admin-email=email        管理员邮箱
  --admin-password=password  管理员密码
  --pb-url=url              PocketBase URL
  --backup-dir=path         备份目录

示例:
  # 创建备份
  deno run --allow-all scripts/data-manager.ts backup --admin-email=admin@admin.com --admin-password=1234567890

  # 导出特定集合
  deno run --allow-all scripts/data-manager.ts export --collections=products --admin-email=admin@admin.com --admin-password=1234567890

  # 列出备份
  deno run --allow-all scripts/data-manager.ts list

  # 恢复备份
  deno run --allow-all scripts/data-manager.ts restore --backup=./backups/backup-2024-01-01 --admin-email=admin@admin.com --admin-password=1234567890
    `);
  }
}

async function main() {
  const args = parse(Deno.args, {
    string: [
      'format', 'output', 'collections', 'input', 'collection', 'batch-size',
      'name', 'backup', 'admin-email', 'admin-password', 'pb-url', 'backup-dir'
    ],
    boolean: ['dry-run', 'help', 'h'],
    default: {
      'pb-url': 'http://127.0.0.1:8090',
      'backup-dir': './backups',
    },
  });

  const command = args._[0] as Command;

  // 显示帮助
  if (args.help || args.h || !command || command === 'help') {
    const manager = new DataManager({
      adminEmail: '',
      adminPassword: '',
      pbUrl: '',
      backupDir: '',
    });
    manager.showHelp();
    Deno.exit(0);
  }

  // 检查必需的配置（除了list命令）
  if (command !== 'list' && (!args['admin-email'] || !args['admin-password'])) {
    console.error('❌ 请提供管理员邮箱和密码');
    console.error('使用 --help 查看帮助信息');
    Deno.exit(1);
  }

  const config: Config = {
    adminEmail: args['admin-email'] || '',
    adminPassword: args['admin-password'] || '',
    pbUrl: args['pb-url'],
    backupDir: args['backup-dir'],
  };

  const manager = new DataManager(config);

  try {
    switch (command) {
      case 'export':
        await manager.export({
          format: args.format as 'json' | 'csv',
          output: args.output,
          collections: args.collections,
        });
        break;

      case 'import':
        if (!args.input) {
          console.error('❌ 导入命令需要指定 --input 参数');
          Deno.exit(1);
        }
        await manager.import({
          input: args.input,
          format: args.format as 'json' | 'csv',
          collection: args.collection,
          dryRun: args['dry-run'],
          batchSize: args['batch-size'] ? parseInt(args['batch-size']) : undefined,
        });
        break;

      case 'backup':
        await manager.backup(args.name);
        break;

      case 'restore':
        if (!args.backup) {
          console.error('❌ 恢复命令需要指定 --backup 参数');
          Deno.exit(1);
        }
        await manager.restore(args.backup, {
          dryRun: args['dry-run'],
        });
        break;

      case 'list':
        await manager.listBackups();
        break;

      default:
        console.error(`❌ 未知命令: ${command}`);
        console.error('使用 --help 查看帮助信息');
        Deno.exit(1);
    }
  } catch (error) {
    console.error('❌ 操作失败:', (error as Error).message);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
} 