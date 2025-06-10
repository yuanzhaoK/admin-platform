#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-run

/**
 * PocketBase 管理员账户初始化脚本
 * 
 * 此脚本用于创建第一个管理员账户，解决登录认证问题
 */

import { join } from '@std/path';
import { exists } from '@std/fs';
import { config } from './config/server.ts';

interface AdminCreateRequest {
  email: string;
  password: string;
  passwordConfirm: string;
}

class AdminInitializer {
  private baseUrl: string;
  public pocketbaseProcess: Deno.ChildProcess | null = null;

  constructor() {
    this.baseUrl = `http://${config.server.host}:${config.server.port}`;
  }

  // 启动 PocketBase (如果没有运行)
  async startPocketBase(): Promise<void> {
    const pbPath = join(config.directories.bin, 'pocketbase');
    
    if (!(await exists(pbPath))) {
      throw new Error(`PocketBase binary not found at: ${pbPath}`);
    }

    console.log('🚀 Starting PocketBase for admin setup...');
    
    const command = new Deno.Command(pbPath, {
      args: [
        'serve',
        `--http=${config.server.host}:${config.server.port}`,
        config.server.dev ? '--dev' : '',
        `--hooksDir=${config.directories.hooks}`,
      ].filter(Boolean),
      cwd: new URL('.', import.meta.url).pathname,
      stdout: 'piped',
      stderr: 'piped',
    });

    this.pocketbaseProcess = command.spawn();

    // 等待 PocketBase 启动
    await this.waitForPocketBase();
  }

  // 等待 PocketBase 准备就绪
  private async waitForPocketBase(): Promise<void> {
    const maxRetries = 30;
    const retryDelay = 1000;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(`${this.baseUrl}/api/health`);
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

  // 检查是否已有管理员
  async hasAdmins(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/admins/auth-refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // 如果返回 401 或 404，说明没有管理员或需要认证
      return response.status !== 401 && response.status !== 404;
    } catch (error) {
      console.error('检查管理员状态失败:', error);
      return false;
    }
  }

  // 创建管理员账户
  async createAdmin(email: string, password: string): Promise<boolean> {
    try {
      console.log(`📝 Creating admin account: ${email}`);

      const adminData: AdminCreateRequest = {
        email,
        password,
        passwordConfirm: password,
      };

      const response = await fetch(`${this.baseUrl}/api/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Admin account created successfully!');
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${password}`);
        console.log(`👤 Admin ID: ${result.id}`);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Failed to create admin:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error creating admin:', error);
      return false;
    }
  }

  // 测试管理员登录
  async testAdminLogin(email: string, password: string): Promise<boolean> {
    try {
      console.log(`🔐 Testing admin login: ${email}`);

      const response = await fetch(`${this.baseUrl}/api/admins/auth-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Admin login test successful!');
        console.log(`🎟️  Token length: ${result.token?.length || 0}`);
        console.log(`👤 Admin: ${result.admin?.email || 'Unknown'}`);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Admin login test failed:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error testing admin login:', error);
      return false;
    }
  }

  // 清理资源
  async cleanup(): Promise<void> {
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
  const initializer = new AdminInitializer();

  // 默认管理员账户信息
  const defaultEmail = 'admin@example.com';
  const defaultPassword = 'admin123456';

  console.log('🔧 PocketBase Admin Initializer');
  console.log('================================\n');

  try {
    // 检查是否需要启动 PocketBase
    let needsStartup = false;
    try {
      await fetch(`http://${config.server.host}:${config.server.port}/api/health`);
      console.log('✅ PocketBase is already running');
    } catch (_error) {
      needsStartup = true;
    }

    if (needsStartup) {
      await initializer.startPocketBase();
    }

    // 检查是否已有管理员
    const hasAdmins = await initializer.hasAdmins();
    if (hasAdmins) {
      console.log('ℹ️  Admin accounts already exist');
      
      // 测试默认管理员登录
      const loginSuccess = await initializer.testAdminLogin(defaultEmail, defaultPassword);
      if (loginSuccess) {
        console.log('✅ Default admin credentials work fine');
      } else {
        console.log('⚠️  Default admin credentials may not work');
        console.log('💡 Try logging in with existing credentials');
      }
    } else {
      console.log('📝 No admin accounts found, creating default admin...');
      
      // 创建默认管理员
      const createSuccess = await initializer.createAdmin(defaultEmail, defaultPassword);
      if (createSuccess) {
        // 测试登录
        await initializer.testAdminLogin(defaultEmail, defaultPassword);
      }
    }

    console.log('\n🎉 Admin initialization completed!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the development server: npm run dev');
    console.log('   2. Visit frontend login page');
    console.log(`   3. Login with: ${defaultEmail} / ${defaultPassword}`);
    console.log('   4. Change password after first login');

  } catch (error) {
    console.error('💥 Initialization failed:', error);
  } finally {
    // 如果我们启动了PocketBase，则清理
    if (initializer.pocketbaseProcess) {
      await initializer.cleanup();
    }
  }
}

// 处理进程信号
const handleShutdown = async () => {
  console.log('\n🛑 Received shutdown signal...');
  Deno.exit(0);
};

Deno.addSignalListener('SIGINT', handleShutdown);
Deno.addSignalListener('SIGTERM', handleShutdown);

// 执行主函数
if (import.meta.main) {
  main().catch((error) => {
    console.error('💥 Fatal error:', error);
    Deno.exit(1);
  });
} 