#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-run

/**
 * PocketBase 管理员设置脚本
 * 通过重置数据库来确保可以创建管理员
 */

import { join } from '@std/path';
import { exists } from '@std/fs';

async function main() {
  console.log('🔧 PocketBase Admin Setup');
  console.log('==========================\n');

  const dataDir = './pb_data';
  const dbFile = join(dataDir, 'data.db');

  try {
    // 检查数据库文件是否存在
    const dbExists = await exists(dbFile);
    
    if (dbExists) {
      console.log('📁 PocketBase database found');
      console.log('ℹ️  To create the first admin account:');
      console.log('');
      console.log('   Option 1 - Reset and start fresh:');
      console.log('   1. Stop all servers (Ctrl+C)');
      console.log('   2. rm -rf pb_data/');
      console.log('   3. Start server: deno run --allow-net --allow-read --allow-run proxy-server.ts');
      console.log('   4. Visit: http://127.0.0.1:8091/_/');
      console.log('   5. Create admin account in the web interface');
      console.log('');
      console.log('   Option 2 - Use existing database:');
      console.log('   1. Visit: http://127.0.0.1:8091/_/');
      console.log('   2. If admin already exists, login with existing credentials');
      console.log('   3. If no admin exists, you will see the setup page');
      console.log('');
      console.log('   Suggested admin credentials:');
      console.log('   📧 Email: admin@example.com');
      console.log('   🔑 Password: admin123');
    } else {
      console.log('📁 No database found - this is perfect for first setup!');
      console.log('');
      console.log('✅ Next steps:');
      console.log('   1. Start the server: deno run --allow-net --allow-read --allow-run proxy-server.ts');
      console.log('   2. Visit: http://127.0.0.1:8091/_/');
      console.log('   3. Create your first admin account');
      console.log('');
      console.log('   Suggested admin credentials:');
      console.log('   📧 Email: admin@example.com');
      console.log('   🔑 Password: admin123');
    }

    console.log('\n🔗 Useful URLs:');
    console.log('   • PocketBase Admin: http://127.0.0.1:8091/_/');
    console.log('   • API Base: http://127.0.0.1:8091/api/');
    console.log('   • Health Check: http://127.0.0.1:8091/api/health');
    
    console.log('\n💡 Troubleshooting:');
    console.log('   • If you see "connection refused": start the server first');
    console.log('   • If you see "database locked": stop all running servers');
    console.log('   • If admin UI shows errors: clear browser cache and try again');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

if (import.meta.main) {
  main();
} 