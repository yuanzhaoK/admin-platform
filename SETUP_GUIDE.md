# 管理平台设置指南

## 项目架构

本项目采用现代化的全栈架构，包含以下组件：

- **前端**: Next.js + React + TypeScript + Tailwind CSS
- **后端**: Deno + TypeScript + PocketBase
- **数据库**: PocketBase (内置SQLite)
- **数据管理**: 完整的导入导出脚本系统

## 快速启动

### 1. 启动后端服务

```bash
cd backend

# 首次运行需要下载PocketBase
deno run --allow-all download-pocketbase.ts

# 启动代理服务器 (包含PocketBase)
deno run --allow-all proxy-server.ts
```

这会启动：
- PocketBase 服务器 (内部端口 8090)
- Deno 代理服务器 (端口 8091，解决 CORS 问题)

### 2. 启动前端开发服务器

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

### 3. 配置 PocketBase 数据库
   
访问 PocketBase 管理界面：http://localhost:8090/_/

#### 创建管理员账户
首次访问时会提示创建管理员账户，推荐设置：
- 邮箱：admin@admin.com
- 密码：1234567890

> **注意**: 这些凭据将用于系统登录和数据管理脚本
   
#### 创建 products 集合

**推荐方式**: 使用自动化脚本创建

```bash
cd backend
deno run --allow-all create-collections.js
```

**手动方式**:
1. 在管理界面中，点击 "Collections" → "New collection"
2. 选择 "Base collection"，命名为 "products"
3. 添加以下字段：
   - `name` (Text, 必填)
   - `description` (Text, 可选)
   - `price` (Number, 可选)
   - `category` (Text, 可选)
   - `status` (Select, 必填, 选项: active, inactive, draft)
   - `tags` (JSON, 可选)
   - `sku` (Text, 可选)
   - `stock` (Number, 可选)
   - `weight` (Number, 可选)
   - `dimensions` (JSON, 可选)
   - `images` (JSON, 可选)
   - `meta_data` (JSON, 可选)

4. **重要**: 清空所有API规则以避免权限问题
   - List rule: 留空
   - View rule: 留空  
   - Create rule: 留空
   - Update rule: 留空
   - Delete rule: 留空

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