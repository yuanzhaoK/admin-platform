# PocketBase 集合管理工具

本目录包含用于管理PocketBase集合的工具和脚本。

## 文件说明

### 集合蓝图配置
- `collection-blueprints.ts` - 集合蓝图配置文件，定义各种集合的结构和测试数据
- `collection-creator-framework.ts` - 集合创建框架，提供标准化的集合创建工具

### 商品类型相关
- `product-types-schema.json` - 商品类型集合的PocketBase JSON schema定义
- `import-product-types.ts` - 通过集合创建框架导入商品类型集合
- `create-product-types-data.ts` - 通过GraphQL API创建商品类型测试数据

## 使用方法

### 方法1: 通过GraphQL API创建测试数据（推荐）

这是最简单的方法，前提是GraphQL服务器和PocketBase都在运行：

```bash
# 启动PocketBase (端口 8090)
./start.sh

# 启动GraphQL服务器 (端口 8082) 
cd backend && deno run --allow-net --allow-env --allow-read server.ts

# 创建商品类型测试数据
cd backend && deno run --allow-net --allow-env help/create-product-types-data.ts
```

### 方法2: 通过集合创建框架

如果需要创建完整的集合结构：

```bash
# 启动PocketBase
./start.sh

# 导入商品类型集合
cd backend && deno run --allow-net --allow-env --allow-read help/import-product-types.ts
```

### 方法3: 手动导入Schema

如果以上方法都不工作，可以手动通过PocketBase管理界面导入：

1. 访问 PocketBase 管理界面: http://localhost:8090/_/
2. 登录管理员账户
3. 使用 `product-types-schema.json` 中的配置手动创建集合

## 商品类型数据结构

系统会创建以下8种商品类型，每种都有丰富的属性配置：

1. **电子设备** - 手机、平板、电脑等
   - 尺寸、颜色、存储容量、屏幕尺寸、5G支持

2. **服装鞋帽** - 各类服装、鞋子、帽子
   - 尺码、颜色、材质、季节、适用性别

3. **图书文具** - 书籍、文具用品
   - 作者、出版社、ISBN、页数、语言、装帧方式

4. **家居用品** - 家具、装饰品
   - 材质、颜色、尺寸、风格、适用房间

5. **食品饮料** - 食品、饮料、调料
   - 保质期、净含量、产地、口味、包装、储存方式

6. **美妆护肤** - 化妆品、护肤品
   - 品牌、适用肤质、适用年龄、容量规格、功效

7. **运动户外** - 运动器材、户外用品
   - 运动类型、适用性别、尺码、材质、重量

8. **母婴用品** - 婴幼儿用品、孕妇用品
   - 适用年龄、材质、安全认证、功能特点、颜色

## 属性类型说明

系统支持以下属性类型：

- `text` - 文本输入
- `number` - 数字输入
- `select` - 单选下拉框
- `multiselect` - 多选下拉框
- `boolean` - 布尔值（是/否）
- `date` - 日期选择
- `color` - 颜色选择器
- `image` - 图片上传

## 验证结果

创建成功后，可以通过以下方式验证：

1. **前端页面**: http://localhost:3000/dashboard/products/types
2. **GraphQL查询**: http://localhost:8082/graphql
3. **PocketBase管理界面**: http://localhost:8090/_/

## 故障排除

### 常见问题

1. **连接失败**
   - 确保PocketBase正在运行 (端口8090)
   - 确保GraphQL服务器正在运行 (端口8082)

2. **认证失败**
   - 检查环境变量中的管理员账户信息
   - 确保PocketBase管理员账户已创建

3. **集合已存在**
   - 如果product_types集合已存在，删除后重新创建
   - 或直接使用GraphQL API创建数据

### 环境变量

可以通过环境变量自定义配置：

```bash
export POCKETBASE_URL="http://localhost:8090"
export POCKETBASE_ADMIN_EMAIL="your-email@example.com"
export POCKETBASE_ADMIN_PASSWORD="your-password"
export GRAPHQL_URL="http://localhost:8082/graphql"
```

## 注意事项

- 创建数据前确保相关服务正在运行
- 脚本会自动处理请求队列，避免并发冲突
- 数据创建失败时会有详细的错误信息
- 建议先在测试环境中验证后再在生产环境使用 