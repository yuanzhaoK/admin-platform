# PocketBase 集合创建标准化框架

🚀 一个强大的 TypeScript 框架，用于自动化创建和管理 PocketBase 集合。

## ✨ 特性

- 🎯 **类型安全** - 完整的 TypeScript 支持
- 🚀 **自动化创建** - 一键创建复杂集合
- 📝 **完整字段支持** - 支持所有 PocketBase 字段类型
- 🧪 **测试数据生成** - 自动生成真实测试数据
- 🔍 **集合验证** - 创建后自动验证
- 📦 **批量操作** - 支持批量创建多个集合
- 🎨 **灵活配置** - 通过蓝图文件轻松配置

## 📁 文件结构

```
backend/
├── collection-creator-framework.ts    # 核心框架
├── collection-blueprints.ts          # 集合蓝图配置
├── create-collection-cli.ts          # 命令行工具
├── create-collections-example.ts     # 使用示例
├── COLLECTION-CREATOR-GUIDE.md       # 详细使用指南
├── package.json                      # 项目配置
└── README.md                         # 本文件
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动 PocketBase

确保 PocketBase 服务正在运行：
```bash
# 在另一个终端中启动 PocketBase
./pocketbase serve --http=localhost:8091
```

### 3. 使用命令行工具

```bash
# 查看帮助
npm run help

# 创建产品集合
npm run create:products

# 创建文章集合
npm run create:articles

# 创建所有集合
npm run create:all
```

### 4. 或者运行示例

```bash
npm run example
```

## 📋 可用命令

| 命令 | 描述 |
|------|------|
| `npm run create:products` | 创建产品集合 |
| `npm run create:articles` | 创建文章集合 |
| `npm run create:comments` | 创建评论集合 |
| `npm run create:user-settings` | 创建用户设置集合 |
| `npm run create:all` | 创建所有集合 |
| `npm run example` | 运行使用示例 |
| `npm run help` | 显示帮助信息 |

## 🎯 支持的字段类型

- ✅ **text** - 文本字段
- ✅ **number** - 数字字段  
- ✅ **bool** - 布尔字段
- ✅ **email** - 邮箱字段
- ✅ **url** - URL字段
- ✅ **date** - 日期字段
- ✅ **select** - 选择字段
- ✅ **relation** - 关联字段
- ✅ **file** - 文件字段
- ✅ **json** - JSON字段

## 📝 创建自定义集合

### 1. 定义集合蓝图

在 `collection-blueprints.ts` 中添加新的蓝图：

```typescript
export const myCollectionBlueprint: CollectionBlueprint = {
  collection: {
    name: 'my_collection',
    type: 'base',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: { max: 200 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['active', 'inactive']
        }
      }
    ]
  },
  testData: {
    count: 5,
    generator: (index: number) => ({
      title: `标题 ${index + 1}`,
      status: ['active', 'inactive'][index % 2]
    })
  }
};
```

### 2. 使用框架创建

```typescript
import { PocketBaseCollectionCreator } from './collection-creator-framework.ts';

const creator = new PocketBaseCollectionCreator();
await creator.adminLogin('admin@example.com', 'password');
await creator.createFromBlueprint(myCollectionBlueprint);
```

## 🔧 环境配置

可以通过环境变量配置：

```bash
export POCKETBASE_URL="http://localhost:8091"
export ADMIN_EMAIL="your-admin@example.com"
export ADMIN_PASSWORD="your-password"
```

## 📖 详细文档

查看 [COLLECTION-CREATOR-GUIDE.md](./COLLECTION-CREATOR-GUIDE.md) 获取完整的使用指南。

## 🎨 示例集合

框架包含以下预定义集合：

### 产品集合 (products)
- 产品名称、价格、分类
- 库存数量、SKU
- 产品图片、规格信息

### 文章集合 (articles)  
- 标题、内容、摘要
- 作者关联、分类标签
- 发布状态、浏览统计

### 评论集合 (comments)
- 评论内容、作者关联
- 文章关联、父评论
- 审核状态、点赞统计

### 用户设置集合 (user_settings)
- 主题、语言、时区
- 通知偏好、隐私设置
- 个性化配置

## 🛠️ 高级用法

### 批量创建

```typescript
const blueprints = [
  productsBlueprint,
  articlesBlueprint,
  commentsBlueprint
];

await creator.createMultipleCollections(blueprints);
```

### 自定义验证

```typescript
await creator.createFromBlueprint(blueprint);
await creator.verifyCollection('my_collection');
```

### 关联字段处理

```typescript
{
  name: 'user_id',
  type: 'relation',
  required: true,
  options: {
    collectionName: 'users',  // 自动查找集合ID
    cascadeDelete: true
  }
}
```

## 🐛 故障排除

### 常见问题

1. **登录失败**
   - 检查 PocketBase 是否运行
   - 确认管理员账号密码

2. **集合创建失败**
   - 检查字段配置
   - 确认关联集合存在

3. **关联字段问题**
   - 先创建被关联的集合
   - 使用 `collectionName` 而不是 `collectionId`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

---

🎉 **开始使用这个强大的框架来管理你的 PocketBase 集合吧！** 