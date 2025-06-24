/**
 * 简化的PocketBase启动脚本
 * 仅启动PocketBase，不包含GraphQL功能
 */

import { ensureDir, exists } from '@std/fs';
import { join } from '@std/path';
import { config } from './config/server.ts';

class SimplePocketBaseServer {
  process: Deno.ChildProcess | null = null;

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

      // 处理进程退出
      const handleShutdown = async () => {
        console.log('\n🛑 Shutting down server...');
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
  const server = new SimplePocketBaseServer();
  await server.start();
}

// 仅在直接运行时执行
if (import.meta.main) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    Deno.exit(1);
  });
}
