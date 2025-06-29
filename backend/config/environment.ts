/**
 * 环境配置文件
 * 集中管理所有环境变量和配置项
 */

export interface EnvironmentConfig {
  // PocketBase 配置
  pocketbase: {
    url: string;
    adminEmail: string;
    adminPassword: string;
    connectionTimeout: number;
    maxRetries: number;
    retryDelay: number;
    healthCheckInterval: number;
  };
  
  // GraphQL 配置
  graphql: {
    port: number;
    host: string;
    cors: boolean;
    playground: boolean;
  };
  
  // 服务器配置
  server: {
    environment: 'development' | 'production' | 'test';
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableMetrics: boolean;
  };
  
  // 功能开关
  features: {
    enableCaching: boolean;
    enableRateLimit: boolean;
    enableFileUpload: boolean;
    enableWebSocket: boolean;
  };
}

// 默认配置
const defaultConfig: EnvironmentConfig = {
  pocketbase: {
    url: 'http://47.111.142.237:8090',
    adminEmail: 'ahukpyu@outlook.com',
    adminPassword: 'kpyu1512..@',
    connectionTimeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,
    healthCheckInterval: 60000,
  },
  
  graphql: {
    port: 8082,
    host: '0.0.0.0',
    cors: true,
    playground: true,
  },
  
  server: {
    environment: 'development',
    logLevel: 'info',
    enableMetrics: true,
  },
  
  features: {
    enableCaching: true,
    enableRateLimit: false, // 开发环境关闭限流
    enableFileUpload: true,
    enableWebSocket: false, // 暂未实现
  },
};

// 从环境变量加载配置
function loadEnvironmentConfig(): EnvironmentConfig {
  const env = Deno.env.toObject();
  
  return {
    pocketbase: {
      url: env.POCKETBASE_URL || defaultConfig.pocketbase.url,
      adminEmail: env.POCKETBASE_ADMIN_EMAIL || defaultConfig.pocketbase.adminEmail,
      adminPassword: env.POCKETBASE_ADMIN_PASSWORD || defaultConfig.pocketbase.adminPassword,
      connectionTimeout: parseInt(env.POCKETBASE_TIMEOUT || '30000'),
      maxRetries: parseInt(env.POCKETBASE_MAX_RETRIES || '3'),
      retryDelay: parseInt(env.POCKETBASE_RETRY_DELAY || '1000'),
      healthCheckInterval: parseInt(env.POCKETBASE_HEALTH_INTERVAL || '60000'),
    },
    
    graphql: {
      port: parseInt(env.GRAPHQL_PORT || '8082'),
      host: env.GRAPHQL_HOST || defaultConfig.graphql.host,
      cors: env.GRAPHQL_CORS !== 'false',
      playground: env.GRAPHQL_PLAYGROUND !== 'false',
    },
    
    server: {
      environment: (env.NODE_ENV as any) || 'development',
      logLevel: (env.LOG_LEVEL as any) || defaultConfig.server.logLevel,
      enableMetrics: env.ENABLE_METRICS !== 'false',
    },
    
    features: {
      enableCaching: env.ENABLE_CACHING !== 'false',
      enableRateLimit: env.ENABLE_RATE_LIMIT === 'true',
      enableFileUpload: env.ENABLE_FILE_UPLOAD !== 'false',
      enableWebSocket: env.ENABLE_WEBSOCKET === 'true',
    },
  };
}

// 验证配置
function validateConfig(config: EnvironmentConfig): void {
  // 验证 PocketBase URL
  try {
    new URL(config.pocketbase.url);
  } catch {
    throw new Error(`Invalid PocketBase URL: ${config.pocketbase.url}`);
  }
  
  // 验证端口
  if (config.graphql.port < 1 || config.graphql.port > 65535) {
    throw new Error(`Invalid GraphQL port: ${config.graphql.port}`);
  }
  
  // 验证超时配置
  if (config.pocketbase.connectionTimeout < 1000) {
    throw new Error('Connection timeout must be at least 1000ms');
  }
  
  // 验证重试配置
  if (config.pocketbase.maxRetries < 1) {
    throw new Error('Max retries must be at least 1');
  }
}

// 创建并导出配置实例
const environmentConfig = loadEnvironmentConfig();

// 验证配置
try {
  validateConfig(environmentConfig);
  console.log('✅ Environment configuration loaded successfully');
  console.log(`🔗 PocketBase: ${environmentConfig.pocketbase.url}`);
  console.log(`🚀 GraphQL: http://${environmentConfig.graphql.host}:${environmentConfig.graphql.port}`);
  console.log(`🌍 Environment: ${environmentConfig.server.environment}`);
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('❌ Invalid environment configuration:', errorMessage);
  Deno.exit(1);
}

export { environmentConfig };
export default environmentConfig; 