// Deno 代理服务器 - 替代 Express 版本
import { serve } from '@std/http';
import { join } from '@std/path';
import { exists } from '@std/fs';
import { config } from './config/server.ts';
import { ProductRouter } from './middlewares/ProductRouter.ts';

const PROXY_PORT = 8091; // 代理服务器端口
const POCKETBASE_PORT = config.server.port;

interface ProxyServerOptions {
  proxyPort: number;
  targetPort: number;
  enableCORS: boolean;
}

class DenoProxyServer {
  private pocketbaseProcess: Deno.ChildProcess | null = null;
  private options: ProxyServerOptions;
  private productRouter: ProductRouter;

  constructor(options: ProxyServerOptions) {
    this.options = options;
    this.productRouter = new ProductRouter();
  }

  // 启动 PocketBase 进程
  async startPocketBase(): Promise<void> {
    const pbPath = join(config.directories.bin, 'pocketbase');
    
    // 检查 PocketBase 二进制文件是否存在
    if (!(await exists(pbPath))) {
      throw new Error(`PocketBase binary not found at: ${pbPath}`);
    }

    console.log('🚀 Starting PocketBase...');
    
    const command = new Deno.Command(pbPath, {
      args: [
        'serve',
        `--http=${config.server.host}:${config.server.port}`,
        config.server.dev ? '--dev' : '',
        `--hooksDir=${config.directories.hooks}`,
        `--origins=${config.server.origins}`,
      ].filter(Boolean),
      cwd: new URL('.', import.meta.url).pathname,
      stdout: 'piped',
      stderr: 'piped',
    });

    this.pocketbaseProcess = command.spawn();

    // 处理 PocketBase 输出
    this.handlePocketBaseOutput();

    // 等待 PocketBase 启动
    await this.waitForPocketBase();
  }

  // 处理 PocketBase 进程输出
  private async handlePocketBaseOutput(): Promise<void> {
    if (!this.pocketbaseProcess) return;

    const decoder = new TextDecoder();

    // 处理标准输出
    const stdoutReader = this.pocketbaseProcess.stdout.getReader();
    this.readStream(stdoutReader, decoder, 'PocketBase');

    // 处理错误输出
    const stderrReader = this.pocketbaseProcess.stderr.getReader();
    this.readStream(stderrReader, decoder, 'PocketBase Error');
  }

  // 读取流输出
  private async readStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder,
    prefix: string
  ): Promise<void> {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        console.log(`${prefix}: ${text.trim()}`);
      }
    } catch (error) {
      console.error(`Error reading ${prefix} stream:`, error);
    }
  }

  // 等待 PocketBase 启动完成
  private async waitForPocketBase(): Promise<void> {
    const maxRetries = 30;
    const retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`http://${config.server.host}:${config.server.port}/api/health`);
        if (response.ok) {
          console.log('✅ PocketBase is ready!');
          return;
        }
      } catch (_error) {
        // PocketBase 还未准备好
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }

    throw new Error('PocketBase failed to start within timeout period');
  }

  // 添加 CORS 头部
  private addCORSHeaders(headers: Headers): void {
    if (this.options.enableCORS) {
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // 代理请求到 PocketBase
  private async proxyRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const targetUrl = `http://${config.server.host}:${this.options.targetPort}${url.pathname}${url.search}`;

    console.log(`🔄 Proxying ${request.method} ${url.pathname}`);

    // 处理 OPTIONS 请求 (CORS 预检)
    if (request.method === 'OPTIONS') {
      const response = new Response(null, { status: 200 });
      this.addCORSHeaders(response.headers);
      return response;
    }

    try {
      // 准备代理请求的头部
      const proxyHeaders = new Headers();
      
      // 复制原始请求的头部，但排除可能导致问题的头部
      for (const [key, value] of request.headers.entries()) {
        const lowerKey = key.toLowerCase();
        if (!['host', 'origin', 'accept-encoding'].includes(lowerKey)) {
          proxyHeaders.set(key, value);
        }
      }

      // 准备请求体
      let body: BodyInit | null = null;
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        body = await request.arrayBuffer();
      }

      // 发送代理请求
      const proxyResponse = await fetch(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body,
      });

      // 准备响应头部
      const responseHeaders = new Headers();
      
      // 复制 PocketBase 响应的头部，但排除编码相关头部
      for (const [key, value] of proxyResponse.headers.entries()) {
        const lowerKey = key.toLowerCase();
        // 排除可能导致内容解码问题的头部
        if (!['content-encoding', 'transfer-encoding'].includes(lowerKey)) {
          responseHeaders.set(key, value);
        }
      }

      // 添加 CORS 头部
      this.addCORSHeaders(responseHeaders);

      // 记录认证相关请求
      if (url.pathname.includes('auth-with-password')) {
        console.log('🔐 Auth request response:', {
          status: proxyResponse.status,
          url: url.pathname,
          headers: Object.fromEntries(proxyResponse.headers.entries()),
        });
      }

      // 获取响应体 - 使用 text() 而不是 arrayBuffer() 以避免编码问题
      let responseBody: string | ArrayBuffer;
      const contentType = proxyResponse.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        // 对于 JSON 响应，使用 text() 然后重新编码
        responseBody = await proxyResponse.text();
        responseHeaders.set('Content-Type', 'application/json; charset=utf-8');
      } else {
        // 对于其他类型，使用 arrayBuffer()
        responseBody = await proxyResponse.arrayBuffer();
      }

      return new Response(responseBody, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      console.error('❌ Proxy error:', error);
      
      const errorResponse = new Response(
        JSON.stringify({ 
          error: 'Proxy error', 
          details: error instanceof Error ? error.message : 'Unknown error' 
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json; charset=utf-8'
          }
        }
      );
      
      this.addCORSHeaders(errorResponse.headers);
      return errorResponse;
    }
  }

  // 启动代理服务器
  async start(): Promise<void> {
    try {
      // 启动 PocketBase
      await this.startPocketBase();

      // 启动代理服务器
      console.log(`\n🚀 Starting Deno proxy server on port ${this.options.proxyPort}...`);
      
      const handler = async (request: Request): Promise<Response> => {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/').filter(part => part.length > 0);
        
        // 处理 OPTIONS 请求 (CORS 预检)
        if (request.method === 'OPTIONS') {
          return this.productRouter.handleOptions();
        }
        
        // 检查是否是产品 API 请求
        if (pathParts[0] === 'api' && pathParts[1] === 'products') {
          console.log(`🎯 Handling product API: ${request.method} ${url.pathname}`);
          return await this.productRouter.handleRequest(request, pathParts.slice(1));
        }
        
        // 其他请求代理到 PocketBase
        return await this.proxyRequest(request);
      };

      await serve(handler, { 
        port: this.options.proxyPort,
        hostname: '127.0.0.1',
                 onListen: ({ port, hostname }: { port: number; hostname: string }) => {
          console.log(`\n🎉 Deno Proxy Server started successfully!`);
          console.log(`📦 PocketBase: http://${config.server.host}:${this.options.targetPort}`);
          console.log(`🌐 Proxy Server: http://${hostname}:${port}`);
          console.log(`🔗 Use http://${hostname}:${port} for API calls to avoid CORS issues`);
          console.log(`📊 Admin UI: http://${hostname}:${port}/_/`);
          console.log(`\n✨ Ready for development!`);
        }
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      await this.cleanup();
      Deno.exit(1);
    }
  }

  // 清理资源
  async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up...');
    
    if (this.pocketbaseProcess) {
      try {
        this.pocketbaseProcess.kill('SIGTERM');
        await this.pocketbaseProcess.status;
        console.log('✅ PocketBase process terminated');
      } catch (error) {
        console.error('❌ Error terminating PocketBase:', error);
      }
    }
  }
}

// 主函数
async function main(): Promise<void> {
  const server = new DenoProxyServer({
    proxyPort: PROXY_PORT,
    targetPort: POCKETBASE_PORT,
    enableCORS: config.development.enableCORS,
  });

  // 处理进程信号
  const handleShutdown = async () => {
    console.log('\n🛑 Received shutdown signal...');
    await server.cleanup();
    Deno.exit(0);
  };

  // 监听退出信号
  Deno.addSignalListener('SIGINT', handleShutdown);
  Deno.addSignalListener('SIGTERM', handleShutdown);

  // 启动服务器
  await server.start();
}

// 仅在直接运行时执行
if (import.meta.main) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    Deno.exit(1);
  });
} 