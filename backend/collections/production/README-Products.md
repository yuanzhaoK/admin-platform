# 产品模块文档

## 概述

产品模块是基于现代后端架构设计的完整CRUD系统，采用分层架构模式，包含服务层、控制器层、数据访问层和工具层。

## 架构设计

### 分层架构

```
┌─────────────────────────────────────┐
│           API 路由层                │
│        ProductRouter.ts             │
├─────────────────────────────────────┤
│          控制器层                   │
│      ProductController.ts           │
├─────────────────────────────────────┤
│          业务逻辑层                 │
│       ProductService.ts             │
├─────────────────────────────────────┤
│         数据访问层                  │
│      ProductRepository.ts           │
├─────────────────────────────────────┤
│          工具层                     │
│       ProductUtils.ts               │
└─────────────────────────────────────┘
```

### 核心组件

1. **ProductService** - 业务逻辑和数据验证
2. **ProductController** - HTTP请求处理
3. **ProductRepository** - 数据库交互
4. **ProductRouter** - 路由分发
5. **ProductUtils** - 工具函数

## API 接口

### 基础 CRUD 操作

#### 获取产品列表
```
GET /api/products
```

**查询参数:**
- `page` - 页码 (默认: 1)
- `perPage` - 每页数量 (默认: 20, 最大: 100)
- `status` - 状态过滤 (active/inactive/draft)
- `category` - 分类过滤
- `search` - 搜索关键词
- `sortBy` - 排序字段 (name/price/created/updated)
- `sortOrder` - 排序方向 (asc/desc)

**响应示例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "示例产品",
      "description": "产品描述",
      "price": 99.99,
      "category": "electronics",
      "status": "active",
      "tags": ["tag1", "tag2"],
      "sku": "ELE-SHI-123",
      "stock": 100,
      "created": "2024-01-01T00:00:00Z",
      "updated": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "perPage": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

#### 获取单个产品
```
GET /api/products/:id
```

#### 创建产品
```
POST /api/products
```

**请求体:**
```json
{
  "name": "新产品",
  "description": "产品描述",
  "price": 99.99,
  "category": "electronics",
  "status": "draft",
  "tags": ["tag1", "tag2"],
  "stock": 100
}
```

#### 更新产品
```
PUT /api/products/:id
```

#### 删除产品
```
DELETE /api/products/:id
```

### 高级功能

#### 获取产品统计
```
GET /api/products/stats
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 120,
    "inactive": 20,
    "draft": 10,
    "categories": {
      "electronics": 80,
      "clothing": 40,
      "books": 30
    },
    "avgPrice": 75.50,
    "totalStock": 5000
  }
}
```

#### 导出产品数据
```
GET /api/products/export?format=json|csv
```

#### 批量更新状态
```
POST /api/products/batch/status
```

**请求体:**
```json
{
  "productIds": ["id1", "id2", "id3"],
  "status": "active"
}
```

#### 批量删除
```
DELETE /api/products/batch
```

**请求体:**
```json
{
  "productIds": ["id1", "id2", "id3"]
}
```

## 数据模型

### Product Schema

```typescript
interface Product {
  id?: string;
  name: string;                    // 产品名称 (必填, 1-100字符)
  description?: string;            // 产品描述 (最大500字符)
  price?: number;                  // 价格 (≥0)
  category?: string;               // 分类 (最大50字符)
  status: 'active' | 'inactive' | 'draft';  // 状态
  tags?: string[];                 // 标签数组
  config?: Record<string, any>;    // 配置对象
  sku?: string;                    // SKU编码 (最大50字符)
  stock?: number;                  // 库存 (≥0)
  weight?: number;                 // 重量 (≥0)
  dimensions?: {                   // 尺寸
    length?: number;
    width?: number;
    height?: number;
  };
  images?: string[];               // 图片URL数组
  meta_data?: Record<string, any>; // 元数据
  created?: string;                // 创建时间
  updated?: string;                // 更新时间
}
```

## 业务规则

### 数据验证

1. **产品名称**: 必填，1-100字符
2. **价格**: 非负数
3. **库存**: 非负整数
4. **SKU**: 唯一性检查
5. **状态**: 枚举值验证

### 自动生成

1. **SKU**: 如未提供，自动生成格式 `{分类前缀}-{名称前缀}-{时间戳}`
2. **时间戳**: 创建和更新时间自动设置

### 重复检查

1. **产品名称**: 创建和更新时检查重复
2. **SKU**: 创建和更新时检查重复

## 使用示例

### 基本使用

```typescript
// 初始化控制器
const controller = new ProductController({
  host: '127.0.0.1',
  port: 8090,
  apiUrl: 'http://127.0.0.1:8090'
});

// 获取产品列表
const products = await controller.getProducts(request);

// 创建产品
const newProduct = await controller.createProduct(request);
```

### 服务层使用

```typescript
// 获取服务实例
const service = ProductService.getInstance();

// 验证产品数据
const validatedData = service.validateCreateProduct(productData);

// 生成SKU
const sku = service.generateSKU("产品名称", "electronics");

// 计算统计信息
const stats = service.calculateStats(products);
```

### 工具函数使用

```typescript
// 格式化价格
const formattedPrice = ProductUtils.formatPrice(99.99); // "¥99.99"

// 生成产品摘要
const summary = ProductUtils.generateSummary(product);

// 计算产品评分
const score = ProductUtils.calculateProductScore(product);

// 生成建议
const suggestions = ProductUtils.generateSuggestions(product);
```

## 错误处理

### 标准错误响应

```json
{
  "success": false,
  "error": "错误描述信息"
}
```

### 常见错误码

- `400` - 请求参数错误
- `404` - 产品不存在
- `409` - 数据冲突 (如名称重复)
- `500` - 服务器内部错误

## 性能优化

### 分页查询
- 默认每页20条记录
- 最大每页100条记录
- 支持排序和过滤

### 批量操作
- 支持批量更新状态
- 支持批量删除
- 错误处理和结果统计

### 缓存策略
- 统计信息可考虑缓存
- 分类列表可考虑缓存

## 扩展功能

### 搜索功能
- 支持名称、描述、SKU搜索
- 支持标签搜索
- 支持分类过滤

### 导出功能
- JSON格式导出
- CSV格式导出
- 自定义字段选择

### 统计分析
- 产品数量统计
- 分类分布统计
- 价格分析
- 库存统计

## 开发指南

### 添加新字段

1. 更新 `ProductSchema` 验证规则
2. 更新数据库迁移
3. 更新前端类型定义
4. 更新API文档

### 添加新业务规则

1. 在 `ProductService` 中添加验证逻辑
2. 在 `ProductController` 中调用验证
3. 添加相应的错误处理
4. 更新单元测试

### 性能监控

1. 记录API响应时间
2. 监控数据库查询性能
3. 跟踪错误率和成功率
4. 监控内存使用情况

## 测试

### 单元测试
- 服务层业务逻辑测试
- 数据验证测试
- 工具函数测试

### 集成测试
- API接口测试
- 数据库交互测试
- 端到端流程测试

### 性能测试
- 并发请求测试
- 大数据量测试
- 内存泄漏测试

## 部署说明

### 环境要求
- Deno 1.40+
- PocketBase 0.20+
- 数据库存储空间

### 配置文件
```typescript
const config = {
  host: '127.0.0.1',
  port: 8090,
  apiUrl: 'http://127.0.0.1:8090'
};
```

### 启动命令
```bash
# 开发环境
deno task dev

# 生产环境
deno task start
```

## 故障排除

### 常见问题

1. **连接数据库失败**
   - 检查PocketBase是否启动
   - 验证连接配置
   - 检查网络连接

2. **数据验证失败**
   - 检查输入数据格式
   - 验证必填字段
   - 检查数据类型

3. **性能问题**
   - 检查查询条件
   - 优化分页参数
   - 考虑添加索引

### 日志分析
- API请求日志
- 数据库操作日志
- 错误堆栈信息
- 性能指标日志 