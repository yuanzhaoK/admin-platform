const fs = require('fs-extra');
const path = require('path');
const downloadPocketBase = require('./download-pocketbase');

async function setup() {
  try {
    console.log('Setting up backend...');
    
    // 下载 PocketBase
    await downloadPocketBase();
    
    // 创建数据目录
    const dataDir = path.join(__dirname, 'pb_data');
    await fs.ensureDir(dataDir);
    
    // 创建 hooks 目录
    const hooksDir = path.join(__dirname, 'pb_hooks');
    await fs.ensureDir(hooksDir);
    
    // 创建基础的用户认证 hook
    const authHook = `
// PocketBase hooks for authentication and authorization
routerAdd("POST", "/api/custom/login", (c) => {
  const data = $apis.requestInfo(c).body;
  
  try {
    const record = $app.dao().findFirstRecordByData("users", "email", data.email);
    
    if (!record || !record.validatePassword(data.password)) {
      return c.json(400, {"error": "Invalid credentials"});
    }
    
    const token = $security.createJWT({
      "id": record.id,
      "email": record.email,
      "type": "authRecord",
      "collectionId": record.collection().id
    }, (24 * 60 * 60)); // 24 hours
    
    return c.json(200, {
      "token": token,
      "record": record,
    });
  } catch (e) {
    return c.json(400, {"error": e.message});
  }
}, $apis.requireGuestOnly())

// CORS middleware
routerUse((next) => {
  return (c) => {
    // Allow CORS for development
    c.response().header().set("Access-Control-Allow-Origin", "*")
    c.response().header().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")  
    c.response().header().set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    
    if (c.request().method != "OPTIONS") {
      return next(c)
    }
    
    return c.noContent(204)
  }
})
`;
    
    await fs.writeFile(path.join(hooksDir, 'main.pb.js'), authHook);
    
    console.log('Backend setup completed!');
    console.log('To start the backend, run: npm run dev');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  setup();
}

module.exports = setup; 