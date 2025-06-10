# 管理平台设置指南

## 快速启动

1. **启动后端代理服务器**
   ```bash
   cd packages/admin-platform/backend
   npm run dev
   ```
   
   这会启动：
   - PocketBase 服务器 (内部端口 8090)
   - Express 代理服务器 (端口 8091，解决 CORS 问题)

2. **启动前端开发服务器**
   ```bash
   cd packages/admin-platform/frontend  
   npm run dev
   ```

3. **配置 PocketBase 数据库**
   
   访问 PocketBase 管理界面：http://localhost:8091/_/
   
   ### 创建管理员账户
   首次访问时会提示创建管理员账户，请设置：
   - 邮箱：admin@example.com
   - 密码：admin123
   
   ### 创建 users 集合
   1. 在管理界面中，点击 "Collections" → "New collection"
   2. 选择 "Auth collection"
   3. 命名为 "users"
   4. 添加以下字段：
      - `name` (Text, 可选)
      - `role` (Select, 可选, 选项: admin, user)
   5. 设置规则：
      - List rule: `@request.auth.id != ""`
      - View rule: `@request.auth.id != ""`
      - Create rule: 留空
      - Update rule: `@request.auth.id = id`
      - Delete rule: `@request.auth.id = id`

   ### 创建 products 集合
   1. 点击 "New collection" → "Base collection"
   2. 命名为 "products"
   3. 添加以下字段：
      - `name` (Text, 必填)
      - `description` (Text, 可选)
      - `status` (Select, 必填, 选项: active, inactive)
      - `config` (JSON, 可选)
   4. 设置规则：
      - List rule: `@request.auth.id != ""`
      - View rule: `@request.auth.id != ""`
      - Create rule: `@request.auth.role = "admin"`
      - Update rule: `@request.auth.role = "admin"`
      - Delete rule: `@request.auth.role = "admin"`

   ### 创建测试用户
   1. 在 users 集合中，点击 "New record"
   2. 设置：
      - Email: admin@example.com
      - Password: admin123
      - Name: 系统管理员
      - Role: admin
      - Verified: ✓ (勾选)

   ### 创建测试产品数据
   在 products 集合中创建一些测试数据：
   
   **产品 1:**
   - name: 示例产品1
   - description: 这是一个示例产品
   - status: active
   - config: `{"price": 99.99, "category": "electronics"}`
   
   **产品 2:**
   - name: 示例产品2  
   - description: 这是另一个示例产品
   - status: inactive
   - config: `{"price": 149.99, "category": "books"}`

4. **测试登录**
   
   访问前端应用：http://localhost:3000
   
   使用测试账户登录：
   - 邮箱：admin@example.com
   - 密码：admin123

## 故障排除

### CORS 错误
- 确保使用代理服务器 (端口 8091)
- 前端配置应该指向 `http://localhost:8091`

### 登录失败
1. 检查浏览器控制台是否有错误信息
2. 确认 users 集合已创建
3. 确认测试用户已创建且已验证
4. 检查 PocketBase 服务器是否正常运行

### 页面跳转问题
1. 打开浏览器开发者工具
2. 查看控制台日志
3. 确认登录成功后的状态变化

## 技术架构

```
Frontend (Next.js :3000)
    ↓ HTTP requests
Express Proxy (:8091)
    ↓ HTTP requests  
PocketBase (:8090)
    ↓ SQLite
Database (pb_data/)
```

## 环境要求

- Node.js 18+
- npm 或 yarn
- 现代浏览器

## 端口使用

- 3000: Next.js 前端
- 8091: Express 代理服务器 (对外)
- 8090: PocketBase 服务器 (内部) 