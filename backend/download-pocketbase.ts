// Deno 版本的 PocketBase 下载脚本
import { join } from '@std/path';
import { ensureDir, exists } from '@std/fs';
import { config } from './config/server.ts';

// PocketBase 版本配置
const POCKETBASE_VERSION = '0.22.0';
const DOWNLOAD_BASE_URL = 'https://github.com/pocketbase/pocketbase/releases/download';

interface DownloadOptions {
  version: string;
  platform: string;
  arch: string;
  filename: string;
  extractedName: string;
}

class PocketBaseDownloader {
  private options: DownloadOptions;

  constructor() {
    this.options = this.getDownloadOptions();
  }

  // 获取当前平台的下载选项
  private getDownloadOptions(): DownloadOptions {
    const platform = Deno.build.os;
    const arch = Deno.build.arch;

    let platformName: string;
    let archName: string;
    let extension: string;

    // 映射平台名称
    switch (platform) {
      case 'windows':
        platformName = 'windows';
        extension = '.zip';
        break;
      case 'darwin':
        platformName = 'darwin';
        extension = '.zip';
        break;
      case 'linux':
        platformName = 'linux';
        extension = '.zip';
        break;
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }

    // 映射架构名称
    switch (arch) {
      case 'x86_64':
        archName = 'amd64';
        break;
      case 'aarch64':
        archName = 'arm64';
        break;
      default:
        throw new Error(`Unsupported architecture: ${arch}`);
    }

    const filename = `pocketbase_${POCKETBASE_VERSION}_${platformName}_${archName}${extension}`;
    const extractedName = platform === 'windows' ? 'pocketbase.exe' : 'pocketbase';

    return {
      version: POCKETBASE_VERSION,
      platform: platformName,
      arch: archName,
      filename,
      extractedName,
    };
  }

  // 下载文件
  private async downloadFile(url: string, outputPath: string): Promise<void> {
    console.log(`📥 Downloading from: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }

    const totalSize = parseInt(response.headers.get('content-length') || '0');
    let downloadedSize = 0;

    const file = await Deno.open(outputPath, { write: true, create: true });
    
    try {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        await file.write(value);
        downloadedSize += value.length;

        // 显示下载进度
        if (totalSize > 0) {
          const progress = ((downloadedSize / totalSize) * 100).toFixed(1);
          console.log(`📊 Progress: ${progress}% (${downloadedSize}/${totalSize} bytes)`);
        }
      }
    } finally {
      file.close();
    }

    console.log('✅ Download completed');
  }

  // 解压文件 (简单实现，仅支持 ZIP)
  private async extractZip(zipPath: string, extractDir: string): Promise<void> {
    console.log(`📦 Extracting: ${zipPath}`);
    
    // 在 Deno 中解压 ZIP 文件需要外部工具或者三方库
    // 这里使用系统命令来解压
    const command = new Deno.Command('unzip', {
      args: ['-o', zipPath, '-d', extractDir],
      stdout: 'piped',
      stderr: 'piped',
    });

    const process = command.spawn();
    const status = await process.status;

    if (!status.success) {
      // 如果 unzip 不可用，尝试使用其他方法
      console.log('❌ unzip command failed, trying alternative method...');
      throw new Error('Failed to extract ZIP file. Please install unzip command or extract manually.');
    }

    console.log('✅ Extraction completed');
  }

  // 主下载函数
  async download(): Promise<string> {
    try {
      // 确保目录存在
      await ensureDir(config.directories.bin);

      const binPath = join(config.directories.bin, this.options.extractedName);

      // 检查是否已存在
      if (await exists(binPath)) {
        console.log('✅ PocketBase already exists:', binPath);
        return binPath;
      }

      // 构建下载 URL
      const downloadUrl = `${DOWNLOAD_BASE_URL}/v${this.options.version}/${this.options.filename}`;
      const downloadPath = join(config.directories.bin, this.options.filename);

      // 下载文件
      await this.downloadFile(downloadUrl, downloadPath);

      // 解压文件
      await this.extractZip(downloadPath, config.directories.bin);

      // 设置可执行权限 (Unix-like 系统)
      if (Deno.build.os !== 'windows') {
        await Deno.chmod(binPath, 0o755);
        console.log('✅ Set executable permissions');
      }

      // 清理下载的压缩文件
      await Deno.remove(downloadPath);
      console.log('🧹 Cleaned up download file');

      // 验证文件是否存在
      if (!(await exists(binPath))) {
        throw new Error('PocketBase binary not found after extraction');
      }

      console.log('🎉 PocketBase downloaded successfully:', binPath);
      return binPath;

    } catch (error) {
      console.error('❌ Failed to download PocketBase:', error);
      throw error;
    }
  }
}

// 主函数
async function main(): Promise<void> {
  console.log('🚀 PocketBase Downloader for Deno');
  console.log(`📋 Target platform: ${Deno.build.os} ${Deno.build.arch}`);
  console.log(`📦 Version: ${POCKETBASE_VERSION}`);

  const downloader = new PocketBaseDownloader();
  await downloader.download();
}

// 仅在直接运行时执行
if (import.meta.main) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    Deno.exit(1);
  });
} 