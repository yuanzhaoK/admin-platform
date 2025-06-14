'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SimpleGlobalSearch } from '@/components/SimpleGlobalSearch';
import { 
  Search, 
  Package, 
  FolderTree, 
  Star, 
  Tag, 
  ShoppingCart, 
  Users, 
  FileText,
  Keyboard,
  MousePointer,
  Zap
} from 'lucide-react';

const searchFeatures = [
  {
    icon: Search,
    title: '智能搜索',
    description: '支持模糊匹配，可搜索页面标题和描述内容'
  },
  {
    icon: Keyboard,
    title: '键盘导航',
    description: '使用 ↑↓ 键导航，回车键选择，ESC 键关闭'
  },
  {
    icon: MousePointer,
    title: '点击跳转',
    description: '点击搜索结果直接跳转到对应页面'
  },
  {
    icon: Zap,
    title: '快捷键',
    description: '使用 ⌘K (Mac) 或 Ctrl+K (Windows) 快速打开搜索'
  }
];

export default function SearchDemoPage() {
  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">全局搜索演示</h1>
        <p className="text-muted-foreground mt-2">
          体验系统的全局搜索功能，支持快速导航到任意页面
        </p>
      </div>

      {/* 搜索演示区 */}
      <Card>
        <CardHeader>
          <CardTitle>试试全局搜索</CardTitle>
          <CardDescription>
            在导航栏的搜索框中输入关键词，或者使用下面的演示搜索框
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 演示搜索框 */}
            <div className="flex justify-center">
              <SimpleGlobalSearch 
                placeholder="在这里试试搜索功能..." 
                className="w-full max-w-md"
              />
            </div>

            {/* 快捷提示 */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline">试试搜索 "商品"</Badge>
              <Badge variant="outline">试试搜索 "用户"</Badge>
              <Badge variant="outline">试试搜索 "设置"</Badge>
              <Badge variant="outline">使用 ⌘K 快速搜索</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 功能特性 */}
      <Card>
        <CardHeader>
          <CardTitle>搜索功能特性</CardTitle>
          <CardDescription>
            全局搜索提供了丰富的功能来提升用户体验
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">基本使用：</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>点击导航栏的搜索框开始输入</li>
                <li>系统会实时显示匹配的搜索结果</li>
                <li>点击任意结果直接跳转到对应页面</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">键盘快捷键：</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><code className="px-1 py-0.5 bg-muted rounded">⌘K</code> 或 <code className="px-1 py-0.5 bg-muted rounded">Ctrl+K</code> - 快速打开搜索</li>
                <li><code className="px-1 py-0.5 bg-muted rounded">↑↓</code> - 在搜索结果中导航</li>
                <li><code className="px-1 py-0.5 bg-muted rounded">Enter</code> - 选择当前高亮的结果</li>
                <li><code className="px-1 py-0.5 bg-muted rounded">Esc</code> - 关闭搜索框</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">搜索技巧：</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>支持中文和英文关键词搜索</li>
                <li>可以搜索页面标题或描述内容</li>
                <li>搜索结果按相关度排序</li>
                <li>支持模糊匹配，不需要输入完整单词</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 