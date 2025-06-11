# PocketBase 数据管理脚本

这个目录包含了用于管理PocketBase数据的工具脚本，支持数据的导入、导出、备份和恢复。

## 脚本列表

### 1. `data-manager.ts` - 数据管理器（推荐）
统一的数据管理工具，提供简单易用的命令行界面。

### 2. `data-export.ts` - 数据导出工具
直接的数据导出脚本，支持JSON和CSV格式。

### 3. `data-import.ts` - 数据导入工具  
直接的数据导入脚本，支持JSON和CSV格式。

## 快速开始

### 前置条件
- 确保Deno已安装
- PocketBase服务正在运行
- 有管理员账号和密码

### 使用数据管理器（推荐方式）

```bash
# 显示帮助
deno run --allow-all scripts/data-manager.ts help

# 创建完整备份
deno run --allow-all scripts/data-manager.ts backup \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 导出指定集合
deno run --allow-all scripts/data-manager.ts export \
  --collections=products,users \
  --format=json \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 列出所有备份
deno run --allow-all scripts/data-manager.ts list

# 恢复备份（试运行）
deno run --allow-all scripts/data-manager.ts restore \
  --backup=./backups/backup-2024-06-10T15-00-00 \
  --dry-run \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 导入CSV文件
deno run --allow-all scripts/data-manager.ts import \
  --input=products.csv \
  --format=csv \
  --collection=products \
  --admin-email=admin@admin.com \
  --admin-password=1234567890
```

## 详细使用说明

### 数据导出

#### 支持的格式
- **JSON**: 完整的数据结构，包含元数据和集合架构信息
- **CSV**: 每个集合生成单独的CSV文件

#### 导出选项
- `--format`: 导出格式 (json/csv)
- `--output`: 输出文件名前缀
- `--collections`: 指定要导出的集合，逗号分隔
- `--admin-email`: 管理员邮箱
- `--admin-password`: 管理员密码
- `--pb-url`: PocketBase服务地址

#### 导出示例

```bash
# 导出所有数据为JSON
deno run --allow-all scripts/data-export.ts \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 导出特定集合为CSV
deno run --allow-all scripts/data-export.ts \
  --format=csv \
  --collections=products,categories \
  --output=my-export \
  --admin-email=admin@admin.com \
  --admin-password=1234567890
```

### 数据导入

#### 支持的格式
- **JSON**: 导入导出工具生成的JSON格式，或简单的记录数组
- **CSV**: 标准CSV文件，第一行为字段名

#### 导入选项
- `--input`: 输入文件路径 (必需)
- `--format`: 数据格式 (json/csv)
- `--collection`: 目标集合名 (CSV格式必需)
- `--dry-run`: 试运行，不实际导入
- `--batch-size`: 批量处理大小
- `--admin-email`: 管理员邮箱
- `--admin-password`: 管理员密码

#### 导入示例

```bash
# 导入JSON备份
deno run --allow-all scripts/data-import.ts \
  --input=backup-2024-06-10.json \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 导入CSV到指定集合
deno run --allow-all scripts/data-import.ts \
  --input=products.csv \
  --format=csv \
  --collection=products \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 试运行导入
deno run --allow-all scripts/data-import.ts \
  --input=data.json \
  --dry-run \
  --admin-email=admin@admin.com \
  --admin-password=1234567890
```

### 备份管理

#### 创建备份
```bash
# 创建带时间戳的自动备份
deno run --allow-all scripts/data-manager.ts backup \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 创建命名备份
deno run --allow-all scripts/data-manager.ts backup \
  --name=before-migration \
  --admin-email=admin@admin.com \
  --admin-password=1234567890
```

#### 查看备份
```bash
# 列出所有备份
deno run --allow-all scripts/data-manager.ts list
```

#### 恢复备份
```bash
# 恢复指定备份
deno run --allow-all scripts/data-manager.ts restore \
  --backup=./backups/backup-2024-06-10T15-00-00 \
  --admin-email=admin@admin.com \
  --admin-password=1234567890

# 试运行恢复（不实际执行）
deno run --allow-all scripts/data-manager.ts restore \
  --backup=./backups/backup-2024-06-10T15-00-00 \
  --dry-run \
  --admin-email=admin@admin.com \
  --admin-password=1234567890
```

## 数据格式说明

### JSON导出格式
```json
{
  "metadata": {
    "exportDate": "2024-06-10T15:00:00.000Z",
    "version": "1.0.0",
    "collections": [
      {
        "id": "pbc_123456789",
        "name": "products",
        "type": "base",
        "schema": [...]
      }
    ]
  },
  "data": [
    {
      "id": "record_id",
      "collectionName": "products",
      "name": "Product Name",
      "price": 100,
      "created": "2024-06-10T15:00:00.000Z",
      "updated": "2024-06-10T15:00:00.000Z"
    }
  ]
}
```

### CSV格式
- 第一行为字段名
- 支持基本数据类型自动转换
- JSON对象/数组会保持为JSON字符串
- 每个集合生成单独的CSV文件

## 配置选项

### 环境变量
您可以设置环境变量来避免每次输入凭据：

```bash
export POCKETBASE_ADMIN_EMAIL=admin@admin.com
export POCKETBASE_ADMIN_PASSWORD=1234567890
export POCKETBASE_URL=http://127.0.0.1:8090
```

### 配置文件
也可以创建配置文件 `scripts/config.json`：

```json
{
  "adminEmail": "admin@admin.com", 
  "adminPassword": "1234567890",
  "pbUrl": "http://127.0.0.1:8090",
  "backupDir": "./backups"
}
```

## 故障排除

### 常见问题

1. **认证失败**
   - 检查管理员邮箱和密码是否正确
   - 确认PocketBase服务正在运行

2. **网络连接错误**
   - 检查PocketBase URL是否正确
   - 确认网络连接正常

3. **权限错误**
   - 确保使用的是超级管理员账号
   - 检查集合的API规则设置

4. **文件读写错误**
   - 检查文件路径是否正确
   - 确认有足够的磁盘空间和权限

### 日志和调试

所有脚本都会输出详细的执行日志，包括：
- 认证状态
- 数据处理进度
- 错误详情
- 执行结果统计

### 性能优化

- 使用 `--batch-size` 参数调整批量处理大小
- 对于大型数据集，建议分批次处理
- 使用 `--dry-run` 先测试，再执行实际操作

## 安全注意事项

1. **凭据安全**
   - 不要在脚本或配置文件中硬编码密码
   - 使用环境变量或安全的配置管理

2. **备份安全**
   - 定期备份重要数据
   - 将备份存储在安全的位置
   - 考虑加密敏感的备份文件

3. **权限控制**
   - 仅在必要时运行这些脚本
   - 确保脚本文件的访问权限适当

## 许可证

这些脚本作为项目的一部分，遵循项目的开源许可证。 