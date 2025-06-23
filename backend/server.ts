import { GraphQLHTTP } from 'https://deno.land/x/gql@1.1.2/mod.ts';
import { makeExecutableSchema } from 'https://deno.land/x/graphql_tools@0.0.2/mod.ts';
import { pocketbaseClient } from './config/pocketbase.ts';
import { resolvers } from './resolvers/index.ts';
import { getTypeDefs, validateSchema } from './schema/index.ts';

// Deno 版本的 PocketBase 直接启动服务器
import { ensureDir, exists } from '@std/fs';
import { join } from '@std/path';
import { config } from './config/server.ts';

interface PocketBaseServer {
  process: Deno.ChildProcess | null;
  downloadPocketBase(): Promise<string>;
  start(): Promise<void>;
  cleanup(): Promise<void>;
}

// 验证并构建 GraphQL schema
console.log('🔍 验证 GraphQL Schema...');
if (!validateSchema()) {
  console.error('❌ GraphQL Schema 验证失败！');
  Deno.exit(1);
}

const typeDefs = getTypeDefs();
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// CORS 配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理 CORS 预检请求
function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  return null;
}

// GraphQL 服务器处理函数
async function handleGraphQL(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // 健康检查端点
  if (url.pathname === '/health') {
    try {
      const isHealthy = await pocketbaseClient.healthCheck();
      return new Response(
        JSON.stringify({
          status: isHealthy ? 'OK' : 'ERROR',
          timestamp: new Date().toISOString(),
          pocketbase: isHealthy ? 'connected' : 'disconnected',
        }),
        {
          status: isHealthy ? 200 : 503,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({
          status: 'ERROR',
          error: errorMessage,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    }
  }

  // GraphQL 端点
  if (url.pathname === '/graphql') {
    try {
      const graphQLResponse = await GraphQLHTTP<Request>({
        schema,
        graphiql: true, // 启用 GraphiQL 界面
        context: (_request: Request) => ({
          request: _request,
          pocketbase: pocketbaseClient,
        }),
      })(request);

      // 添加 CORS 头
      const headers = new Headers(graphQLResponse.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new Response(graphQLResponse.body, {
        status: graphQLResponse.status,
        headers,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('GraphQL error:', error);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: errorMessage,
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        },
      );
    }
  }

  // API 信息端点
  if (url.pathname === '/api' || url.pathname === '/api/info') {
    return new Response(
      JSON.stringify({
        name: 'Admin Platform GraphQL API',
        version: '1.0.0',
        description: 'GraphQL API wrapper for PocketBase admin platform',
        endpoints: {
          graphql: '/graphql',
          health: '/health',
          graphiql: '/graphql (GET request)',
        },
        pocketbase: {
          url: Deno.env.get('POCKETBASE_URL') || 'http://localhost:8090',
          status: 'connected',
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    );
  }

  // 404 处理
  return new Response(
    JSON.stringify({
      error: 'Not Found',
      message: `Path ${url.pathname} not found`,
      availablePaths: ['/graphql', '/health', '/api'],
    }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    },
  );
}

class DenoServerManager implements PocketBaseServer {
  process: Deno.ChildProcess | null = null;
  graphqlServer: AbortController | null = null;

  async downloadPocketBase(): Promise<string> {
    const pbPath = join(config.directories.bin, 'pocketbase');

    // 检查 PocketBase 是否已存在
    if (await exists(pbPath)) {
      console.log('✅ PocketBase binary found');
      return pbPath;
    }

    console.log('📥 PocketBase binary not found, please run: deno task download-pb');
    throw new Error('PocketBase binary not found. Please download it first.');
  }

  async startGraphQLServer(): Promise<void> {
    const graphqlPort = parseInt(Deno.env.get('GRAPHQL_PORT') || '8082');

    console.log(`🚀 Starting GraphQL Server...`);
    console.log(`📊 PocketBase URL: ${Deno.env.get('POCKETBASE_URL') || 'http://localhost:8090'}`);
    console.log(`🌐 GraphQL Server: http://localhost:${graphqlPort}`);
    console.log(`🔍 GraphiQL available at: http://localhost:${graphqlPort}/graphql`);
    console.log(`❤️  Health check at: http://localhost:${graphqlPort}/health`);

    // 初始化 PocketBase 连接
    try {
      await pocketbaseClient.ensureAuth();
      console.log('✅ PocketBase connection initialized for GraphQL');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to initialize PocketBase connection:', errorMessage);
      console.log('⚠️  GraphQL server will start but may not function properly');
    }

    // 创建 GraphQL 服务器处理函数
    const graphqlHandler = async (request: Request): Promise<Response> => {
      // 处理 CORS
      const corsResponse = handleCORS(request);
      if (corsResponse) return corsResponse;

      return await handleGraphQL(request);
    };

    // 启动 GraphQL 服务器
    this.graphqlServer = new AbortController();

    try {
      const server = Deno.serve({
        port: graphqlPort,
        signal: this.graphqlServer.signal,
        handler: graphqlHandler,
      });
      await server.finished;
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('❌ GraphQL server error:', error);
      }
    }
  }

  async start(): Promise<void> {
    try {
      // 确保 PocketBase 已下载
      const pbPath = await this.downloadPocketBase();

      // 确保目录存在
      await ensureDir(config.directories.data);
      await ensureDir(config.directories.hooks);
      await ensureDir(config.directories.migrations);

      console.log('🚀 Starting PocketBase server...');
      console.log(`📊 Admin UI: http://${config.server.host}:${config.server.port}/_/`);
      console.log(`🌐 API endpoint: http://${config.server.host}:${config.server.port}/api/`);
      console.log(`📁 Data directory: ${config.directories.data}`);
      console.log(`🔗 Hooks directory: ${config.directories.hooks}`);

      // 启动 PocketBase
      const command = new Deno.Command(pbPath, {
        args: [
          'serve',
          `--http=${config.server.host}:${config.server.port}`,
          config.server.dev ? '--dev' : '',
          `--hooksDir=${config.directories.hooks}`,
          `--origins=${config.server.origins}`,
        ].filter(Boolean),
        cwd: Deno.cwd(),
        env: {
          ...Deno.env.toObject(),
          PB_DISABLE_HTTPS_REDIRECT: '1',
        },
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
      });

      this.process = command.spawn();

      // 等待 PocketBase 启动后再启动 GraphQL 服务器
      console.log('⏳ Waiting for PocketBase to start...');
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 并行启动 GraphQL 服务器
      this.startGraphQLServer().catch((error) => {
        console.error('❌ Failed to start GraphQL server:', error);
      });

      // 处理进程退出
      const handleShutdown = async () => {
        console.log('\n🛑 Shutting down servers...');
        await this.cleanup();
        Deno.exit(0);
      };

      // 监听退出信号
      Deno.addSignalListener('SIGINT', handleShutdown);
      Deno.addSignalListener('SIGTERM', handleShutdown);

      // 等待进程结束
      const status = await this.process.status;
      console.log(`PocketBase server exited with code ${status.code}`);

      if (!status.success) {
        Deno.exit(status.code || 1);
      }
    } catch (error) {
      console.error('❌ Error starting server:', error);
      await this.cleanup();
      Deno.exit(1);
    }
  }

  async cleanup(): Promise<void> {
    // 停止 GraphQL 服务器
    if (this.graphqlServer) {
      try {
        this.graphqlServer.abort();
        console.log('✅ GraphQL server stopped');
      } catch (error) {
        console.error('❌ Error stopping GraphQL server:', error);
      }
      this.graphqlServer = null;
    }

    // 停止 PocketBase 进程
    if (this.process) {
      try {
        this.process.kill('SIGTERM');
        await this.process.status;
        console.log('✅ PocketBase process terminated');
      } catch (error) {
        console.error('❌ Error terminating PocketBase:', error);
      }
      this.process = null;
    }
  }
}

// 主函数
async function main(): Promise<void> {
  const server = new DenoServerManager();
  await server.start();
}

// 仅在直接运行时执行
if (import.meta.main) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    Deno.exit(1);
  });
}
