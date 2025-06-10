const http = require('http');

// 直接API调用
function apiCall(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: '127.0.0.1',
      port: 8090,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (postData) {
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const response = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: response
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: responseData
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function main() {
  console.log('🔧 直接通过API修复数据库...\n');
  
  try {
    // 测试基本连接
    console.log('1. 测试PocketBase连接...');
    const healthCheck = await apiCall('/api/health');
    console.log('   健康检查:', healthCheck.statusCode === 200 ? '✅ 正常' : '❌ 异常');
    
    // 检查是否已经有users集合
    console.log('\n2. 测试users集合...');
    const testAuth = await apiCall('/api/collections/users/auth-with-password', 'POST', {
      email: 'test@test.com',
      password: 'test123'
    });
    
    console.log('   用户认证测试状态码:', testAuth.statusCode);
    console.log('   响应:', testAuth.body);
    
    if (testAuth.statusCode === 404) {
      console.log('❌ users集合不存在');
      console.log('\n🔧 解决方案 - 手动创建数据库:');
      console.log('   由于PocketBase管理界面无法访问，我们需要手动操作:');
      console.log('');
      console.log('   选项1: 停止PocketBase并重新初始化');
      console.log('   1. 停止服务器: Ctrl+C');
      console.log('   2. 删除数据: rm -rf pb_data/');
      console.log('   3. 重启服务器: npm run dev');
      console.log('   4. 访问 http://127.0.0.1:8090/_/ 创建管理员');
      console.log('');
      console.log('   选项2: 使用SQLite直接操作数据库');
      console.log('   1. 我们可以创建SQLite脚本直接初始化数据库');
    } else if (testAuth.statusCode === 200) {
      if (testAuth.body.token) {
        console.log('✅ users集合存在且工作正常');
        console.log('   Token长度:', testAuth.body.token.length);
      } else {
        console.log('⚠️  users集合存在但返回空token');
        console.log('   可能是用户未验证');
      }
    } else {
      console.log('   其他状态:', testAuth.statusCode, testAuth.body);
    }
    
    // 尝试创建测试用户看是否有权限
    console.log('\n3. 测试创建用户权限...');
    const createUser = await apiCall('/api/collections/users/records', 'POST', {
      email: 'admin@example.com',
      password: 'admin123',
      passwordConfirm: 'admin123',
      name: '系统管理员',
      verified: true
    });
    
    console.log('   创建用户状态:', createUser.statusCode);
    console.log('   响应:', createUser.body);
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  }
}

main().catch(console.error); 