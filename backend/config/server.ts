// PocketBase 服务器配置
import { join } from '@std/path';

export interface ServerConfig {
  server: {
    host: string;
    port: number;
    dev: boolean;
    origins: string;
  };
  directories: {
    data: string;
    hooks: string;
    migrations: string;
    bin: string;
  };
  database: {
    autoBackup: boolean;
    backupInterval: string;
  };
  auth: {
    minPasswordLength: number;
    requireEmail: boolean;
    allowEmailAuth: boolean;
    allowUsernameAuth: boolean;
    allowOAuth2Auth: boolean;
  };
  files: {
    maxSize: number;
    allowedTypes: string[];
  };
  development: {
    enableCORS: boolean;
    logLevel: string;
    hotReload: boolean;
  };
}

// 获取当前文件目录
const currentDir = new URL('.', import.meta.url).pathname;

const config: ServerConfig = {
  // 服务器配置
  server: {
    host: '127.0.0.1',
    port: 8090,
    dev: true,
    origins: '*',
  },

  // 目录配置
  directories: {
    data: join(currentDir, '../pb_data'),
    hooks: join(currentDir, '../pb_hooks'),
    migrations: join(currentDir, '../pb_migrations'),
    bin: join(currentDir, '../bin'),
  },

  // 数据库配置
  database: {
    autoBackup: true,
    backupInterval: '24h',
  },

  // 认证配置
  auth: {
    minPasswordLength: 6,
    requireEmail: true,
    allowEmailAuth: true,
    allowUsernameAuth: false,
    allowOAuth2Auth: false,
  },

  // 文件上传配置
  files: {
    maxSize: 5242880, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  },

  // 开发环境配置
  development: {
    enableCORS: true,
    logLevel: 'debug',
    hotReload: true,
  },
};

export { config };
export default config;