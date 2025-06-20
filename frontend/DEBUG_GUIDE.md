# Frontend 调试指南

## 🔧 调试配置说明

为了方便在VSCode中调试前端应用，我们已经为你配置了完整的调试环境。

## 📋 可用的调试配置

### 1. 单独调试配置

#### 💻 Debug Frontend (Next.js)
- **用途**: 使用npm运行调试模式
- **端口**: 3000
- **特点**: 基础的Node.js调试模式

#### 🔍 Attach to Frontend (Next.js)  
- **用途**: 附加到正在运行的Next.js进程
- **端口**: 9229 (调试端口)
- **使用场景**: 当你已经用`npm run dev:debug`启动了应用

#### 🌟 Debug Frontend Server-Side
- **用途**: 调试Next.js服务端代码 (API路由、SSR等)
- **特点**: 启用Node.js调试器，可以断点调试服务端逻辑

#### 🔥 Debug Frontend Client-Side (Chrome)
- **用途**: 调试React组件和客户端JavaScript
- **浏览器**: Chrome
- **特点**: 支持React组件调试和源码映射

### 2. 组合调试配置

#### 🚀 Debug Full Stack
- **包含**: 后端服务器 + 前端服务端 + 前端客户端
- **用途**: 全栈应用调试
- **推荐**: 用于完整的应用开发和调试

#### 💻 Debug Frontend Only
- **包含**: 前端服务端 + 前端客户端
- **用途**: 仅调试前端应用
- **推荐**: 当后端已经单独运行时使用

## 🚀 快速开始

### 方法1: 使用VSCode调试面板

1. 打开VSCode调试面板 (`Ctrl+Shift+D` 或 `Cmd+Shift+D`)
2. 从下拉菜单选择调试配置:
   - `💻 Debug Frontend Only` - 仅调试前端
   - `🚀 Debug Full Stack` - 全栈调试
3. 点击绿色播放按钮开始调试

### 方法2: 手动启动调试模式

```bash
# 进入frontend目录
cd frontend

# 启动调试模式 (可附加调试器)
npm run dev:debug

# 或者启动断点调试模式 (启动时暂停)
npm run dev:debug-brk
```

然后在VSCode中选择 `🔍 Attach to Frontend (Next.js)` 配置。

## 📝 调试技巧

### 1. 服务端调试 (API路由、SSR)

```typescript
// 在API路由或服务端代码中设置断点
// src/app/api/example/route.ts
export async function GET() {
  debugger; // 或在此行设置断点
  const data = await fetchData();
  return Response.json(data);
}
```

### 2. 客户端调试 (React组件)

```tsx
// 在React组件中设置断点
// src/components/MyComponent.tsx
export default function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    debugger; // 或在此行设置断点
    fetchData().then(setData);
  }, []);
  
  return <div>{data}</div>;
}
```

### 3. 同时调试前后端

1. 选择 `🚀 Debug Full Stack` 配置
2. 可以同时在前端和后端代码中设置断点
3. 调试器会在遇到断点时自动暂停

## 🔍 调试端口说明

- **3000**: Next.js开发服务器端口
- **9229**: Node.js调试器端口 (默认)
- **8090**: PocketBase数据库端口
- **8082**: GraphQL API端口

## ⚠️ 注意事项

1. **Chrome调试**: 确保Chrome浏览器已安装
2. **端口冲突**: 确保相关端口未被占用
3. **源码映射**: TypeScript和JSX文件会自动生成源码映射
4. **热重载**: 调试模式下仍支持热重载
5. **生产模式**: 生产构建不包含调试信息

## 🛠️ 常见问题

### Q: 调试器无法连接？
A: 检查端口是否被占用，尝试重启VSCode或终端

### Q: 断点不生效？
A: 确保源码映射正确，检查断点是否设置在可执行代码行

### Q: 无法调试TypeScript文件？
A: 确保tsconfig.json中包含正确的sourceMap配置

### Q: Chrome调试器打开错误页面？
A: 确保Next.js开发服务器正在运行 (端口3000)

## 🎯 最佳实践

1. **组合配置**: 使用组合调试配置可以同时调试多个部分
2. **断点管理**: 合理设置断点，避免过多断点影响性能
3. **控制台调试**: 结合使用`console.log`和断点调试
4. **网络调试**: 使用Chrome开发者工具调试网络请求
5. **状态调试**: 利用React DevTools调试组件状态

## 🔗 相关文档

- [Next.js调试文档](https://nextjs.org/docs/advanced-features/debugging)
- [VSCode调试指南](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools](https://developers.google.com/web/tools/chrome-devtools) 