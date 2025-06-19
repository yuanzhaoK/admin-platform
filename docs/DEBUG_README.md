# VSCode Debugger 使用指南

本项目已经配置了完整的 VSCode Debugger 设置，支持 Deno backend 项目的断点调试。

## 🚀 快速开始

### 1. 安装推荐扩展

打开 VSCode 后，会自动提示安装推荐扩展，主要包括：

- **Deno for VSCode** - Deno 语言支持
- **GraphQL** - GraphQL 语法高亮和智能提示

### 2. 选择调试配置

按 `F5` 或打开调试面板（`Ctrl+Shift+D`），选择以下配置之一：

## 📋 可用的调试配置

### 🚀 Debug Backend Server（推荐）

- **用途**: 调试主后端服务器 (server.ts)
- **端口**: GraphQL 服务运行在 8082，PocketBase 在 8090
- **特点**: 启动时等待调试器附加，适合设置断点

### 🌐 Debug Proxy Server

- **用途**: 调试代理服务器 (proxy-server.ts)
- **特点**: 调试代理层逻辑

### 🚀 Debug Without Waiting (快速启动)

- **用途**: 不等待调试器的快速启动模式
- **特点**: 立即启动，可以在运行过程中设置断点

### 🔧 Debug Setup Script

- **用途**: 调试管理员设置脚本
- **适用**: 调试初始化和配置逻辑

### 🧪 Debug Helper Script

- **用途**: 调试帮助脚本
- **特点**: 可选择要调试的具体脚本文件

## 🛠️ 使用方法

### 设置断点

1. 在代码行号左侧点击设置红色断点
2. 可以设置条件断点（右键点击断点）
3. 可以设置日志点（在断点菜单中选择）

### 启动调试

1. 选择调试配置
2. 按 `F5` 开始调试
3. 或在调试面板点击绿色播放按钮

### 调试控制

- `F5`: 继续执行
- `F10`: 单步跳过 (Step Over)
- `F11`: 单步进入 (Step Into)
- `Shift+F11`: 单步跳出 (Step Out)
- `Ctrl+Shift+F5`: 重启调试
- `Shift+F5`: 停止调试

### 调试面板功能

- **变量**: 查看当前作用域的变量值
- **监视**: 添加自定义表达式监视
- **调用堆栈**: 查看函数调用链
- **断点**: 管理所有断点

## 🔧 预配置的任务

可以通过 `Ctrl+Shift+P` -> `Tasks: Run Task` 运行：

- **deno: check-backend** - 类型检查
- **deno: fmt-backend** - 代码格式化
- **deno: lint-backend** - 代码检查
- **deno: download-pocketbase** - 下载 PocketBase
- **backend: setup-admin** - 设置管理员
- **backend: clean** - 清理数据

## 🎯 调试技巧

### 1. 条件断点

```typescript
// 右键断点，设置条件，例如：
// userId === 'specific-id'
// count > 10
```

### 2. 日志点

```typescript
// 不中断执行，仅输出日志
// 在断点菜单中选择 "Add Logpoint"
// 输入: "User ID: {userId}, Count: {count}"
```

### 3. 监视表达式

```typescript
// 在监视面板添加：
request.headers;
pocketbaseClient.isAuthenticated();
formData.name;
```

### 4. 调试控制台

```javascript
// 在调试控制台中执行：
console.log(variableName);
JSON.stringify(complexObject, null, 2);
```

## 🌟 环境变量

调试配置中预设了以下环境变量：

```bash
POCKETBASE_URL=http://localhost:8090
GRAPHQL_PORT=8082
POCKETBASE_ADMIN_EMAIL=ahukpyu@outlook.com
POCKETBASE_ADMIN_PASSWORD=kpyu1512..@
```

## ⚡ 性能调试

### 1. 性能监控

- 使用 `performance.now()` 测量代码执行时间
- 在调试控制台查看 `performance` 对象

### 2. 内存调试

- 使用 `Deno.memoryUsage()` 查看内存使用
- 在变量面板监视内存相关变量

## 🐛 常见问题

### 调试器无法连接

1. 确保没有其他 Deno 进程占用端口
2. 检查防火墙设置
3. 重启 VSCode

### 断点不生效

1. 确保文件已保存
2. 检查断点是否在可执行代码行
3. 验证源码映射是否正确

### 类型错误

1. 运行 `deno check` 检查类型
2. 确保所有依赖已正确导入
3. 检查 deno.json 配置

## 📚 更多资源

- [Deno 调试文档](https://deno.land/manual/getting_started/debugging_your_code)
- [VSCode 调试指南](https://code.visualstudio.com/docs/editor/debugging)
- [GraphQL 调试技巧](https://graphql.org/learn/validation/)

## 🎉 开始调试

1. 打开要调试的文件（如 `backend/server.ts`）
2. 设置断点
3. 按 `F5` 选择调试配置
4. 开始调试之旅！

---

_配置文件自动生成，如有问题请参考官方文档或提交 Issue。_
