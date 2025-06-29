// PocketBase 服务器配置

export interface ServerConfig {
  server: {
    host: string;
    port: number;
    dev: boolean;
    origins: string;
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
    host: '47.111.142.237',
    port: 8090,
    dev: true,
    origins: '*',
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