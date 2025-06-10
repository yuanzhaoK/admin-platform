// Deno 版本的数据库清理脚本
import { join } from '@std/path';
import { exists } from '@std/fs';
import { config } from './config/server.ts';

class DatabaseCleaner {
  private dataDirectory: string;

  constructor() {
    this.dataDirectory = config.directories.data;
  }

  async cleanDatabase(): Promise<void> {
    const dbFiles = [
      'data.db',
      'logs.db',
      'data.db-shm',
      'data.db-wal',
      'logs.db-shm',
      'logs.db-wal',
    ];

    console.log('🧹 Cleaning database files...');

    for (const file of dbFiles) {
      const filePath = join(this.dataDirectory, file);
      
      if (await exists(filePath)) {
        try {
          await Deno.remove(filePath);
          console.log(`✅ Removed: ${file}`);
        } catch (error) {
          console.warn(`⚠️  Failed to remove ${file}: ${error}`);
        }
      } else {
        console.log(`➖ Not found: ${file}`);
      }
    }
  }

  async cleanLogs(): Promise<void> {
    const logsDir = join(this.dataDirectory, 'logs');
    
    if (await exists(logsDir)) {
      try {
        await Deno.remove(logsDir, { recursive: true });
        console.log('✅ Removed logs directory');
      } catch (error) {
        console.warn(`⚠️  Failed to remove logs directory: ${error}`);
      }
    } else {
      console.log('➖ Logs directory not found');
    }
  }

  async cleanBackups(): Promise<void> {
    const backupsDir = join(this.dataDirectory, 'backups');
    
    if (await exists(backupsDir)) {
      try {
        await Deno.remove(backupsDir, { recursive: true });
        console.log('✅ Removed backups directory');
      } catch (error) {
        console.warn(`⚠️  Failed to remove backups directory: ${error}`);
      }
    } else {
      console.log('➖ Backups directory not found');
    }
  }

  async clean(options: { database?: boolean; logs?: boolean; backups?: boolean } = {}): Promise<void> {
    const { database = true, logs = false, backups = false } = options;

    console.log('🚀 Starting database cleanup...');
    console.log(`📁 Data directory: ${this.dataDirectory}`);

    if (!(await exists(this.dataDirectory))) {
      console.log('➖ Data directory does not exist, nothing to clean');
      return;
    }

    if (database) {
      await this.cleanDatabase();
    }

    if (logs) {
      await this.cleanLogs();
    }

    if (backups) {
      await this.cleanBackups();
    }

    console.log('🎉 Database cleanup completed!');
  }
}

// 主函数
async function main(): Promise<void> {
  const args = Deno.args;
  
  const options = {
    database: !args.includes('--no-database'),
    logs: args.includes('--logs'),
    backups: args.includes('--backups'),
  };

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧹 Database Cleaner for PocketBase

Usage: deno task clean [options]

Options:
  --no-database    Skip cleaning database files (data.db, logs.db)
  --logs           Also clean logs directory
  --backups        Also clean backups directory
  --help, -h       Show this help message

Examples:
  deno task clean                    # Clean database files only
  deno task clean --logs             # Clean database and logs
  deno task clean --logs --backups   # Clean everything
  deno task clean --no-database --logs  # Clean logs only
    `);
    return;
  }

  const cleaner = new DatabaseCleaner();
  await cleaner.clean(options);
}

// 仅在直接运行时执行
if (import.meta.main) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    Deno.exit(1);
  });
} 