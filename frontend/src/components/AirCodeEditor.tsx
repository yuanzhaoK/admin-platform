'use client';

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play, 
  Save, 
  Globe, 
  Database, 
  FileText, 
  Clock, 
  Settings, 
  Terminal, 
  Package,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface Function {
  id: string;
  name: string;
  code: string;
  language: 'javascript' | 'typescript';
  deployed: boolean;
  endpoint?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseTable {
  name: string;
  records?: Record<string, any>[];
  recordCount?: number;
  columns: { name: string; type: string }[];
  lastUpdated?: string;
}

interface ScheduledTask {
  id: string;
  name: string;
  functionName: string;
  schedule: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  functionName: string;
  message: string;
  source: 'function' | 'schedule' | 'system';
}

const AirCodeEditor: React.FC = () => {
  const [functions, setFunctions] = useState<Function[]>([]);
  const [currentFunction, setCurrentFunction] = useState<Function | null>(null);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [testParams, setTestParams] = useState('{}');
  const [testResult, setTestResult] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [databases, setDatabases] = useState<DatabaseTable[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [dependencies] = useState<string[]>(['aircode']);

  // AirCode 风格的默认模板
  const templates = {
    javascript: `const aircode = require('aircode');

module.exports = async function(params, context) {
  console.log('Received params:', params);
  
  // 使用内置数据库
  const UsersTable = aircode.db.table('users');
  
  // 示例：获取所有用户
  const users = await UsersTable.where().find();
  
  return {
    message: 'Hello from AirCode!',
    params,
    users: users.length,
    timestamp: new Date().toISOString()
  };
}`,
    typescript: `import aircode from 'aircode';

interface Params {
  [key: string]: any;
}

interface Context {
  trigger: 'HTTP' | 'SCHEDULE';
  method: string;
  headers: Record<string, string>;
}

export default async function(params: Params, context: Context) {
  console.log('Received params:', params);
  
  // 使用内置数据库
  const UsersTable = aircode.db.table('users');
  
  // 示例：获取所有用户
  const users = await UsersTable.where().find();
  
  return {
    message: 'Hello from AirCode with TypeScript!',
    params,
    users: users.length,
    timestamp: new Date().toISOString()
  };
}`
  };

  // 初始化
  useEffect(() => {
    loadFunctions();
    loadDatabases();
    loadScheduledTasks();
    loadLogs();
  }, []);

  // 加载函数列表
  const loadFunctions = async () => {
    try {
      const response = await fetch('/api/aircode/functions');
      if (response.ok) {
        const data = await response.json();
        setFunctions(data.functions || []);
        if (data.functions?.length > 0 && !currentFunction) {
          setCurrentFunction(data.functions[0]);
          setCode(data.functions[0].code);
        }
      }
    } catch (error) {
      console.error('Failed to load functions:', error);
    }
  };

  // 创建新函数
  const createFunction = (language: 'javascript' | 'typescript') => {
    const newFunction: Function = {
      id: Date.now().toString(),
      name: `new-function-${Date.now()}`,
      code: templates[language],
      language,
      deployed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setFunctions(prev => [...prev, newFunction]);
    setCurrentFunction(newFunction);
    setCode(newFunction.code);
  };

  // 保存函数
  const saveFunction = async () => {
    if (!currentFunction) return;
    
    setIsSaving(true);
    try {
      const updatedFunction = {
        ...currentFunction,
        code,
        updatedAt: new Date()
      };

      const response = await fetch('/api/aircode/functions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFunction)
      });

      if (response.ok) {
        setFunctions(prev => prev.map(f => f.id === currentFunction.id ? updatedFunction : f));
        setCurrentFunction(updatedFunction);
        addLog('info', 'system', `Function "${currentFunction.name}" saved successfully`);
      }
    } catch (error) {
      addLog('error', 'system', `Failed to save function: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  // 部署函数
  const deployFunction = async () => {
    if (!currentFunction) return;
    
    setIsDeploying(true);
    try {
      const response = await fetch(`/api/aircode/functions/${currentFunction.id}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (response.ok) {
        const data = await response.json();
        const deployedFunction = {
          ...currentFunction,
          deployed: true,
          endpoint: data.endpoint,
          code,
          updatedAt: new Date()
        };

        setFunctions(prev => prev.map(f => f.id === currentFunction.id ? deployedFunction : f));
        setCurrentFunction(deployedFunction);
        addLog('info', 'system', `Function "${currentFunction.name}" deployed successfully`);
      }
    } catch (error) {
      addLog('error', 'system', `Failed to deploy function: ${error}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // 测试函数
  const testFunction = async () => {
    if (!currentFunction) return;
    
    setIsRunning(true);
    setTestResult(null);
    try {
      let params = {};
      try {
        params = JSON.parse(testParams);
      } catch (e) {
        throw new Error('Invalid JSON in test parameters');
      }

      const response = await fetch('/api/aircode/functions/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          functionId: currentFunction.id,
          code,
          params
        })
      });

      const result = await response.json();
      setTestResult(result);
      addLog('info', currentFunction.name, `Function executed with result: ${JSON.stringify(result).slice(0, 100)}...`);
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setTestResult(errorResult);
      addLog('error', currentFunction.name, `Function execution failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // 添加日志
  const addLog = (level: 'info' | 'warn' | 'error', functionName: string, message: string) => {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      functionName,
      message,
      source: functionName === 'system' ? 'system' : 'function'
    };
    setLogs(prev => [logEntry, ...prev.slice(0, 49)]); // 保持最新50条
  };

  // 加载数据库
  const loadDatabases = async () => {
    try {
      const response = await fetch('/api/aircode/database');
      if (response.ok) {
        const data = await response.json();
        setDatabases(data.tables || []);
      }
    } catch (error) {
      console.error('Failed to load databases:', error);
    }
  };

  // 加载定时任务
  const loadScheduledTasks = async () => {
    try {
      const response = await fetch('/api/aircode/schedules');
      if (response.ok) {
        const data = await response.json();
        setScheduledTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to load scheduled tasks:', error);
    }
  };

  // 加载日志
  const loadLogs = async () => {
    try {
      const response = await fetch('/api/aircode/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* 侧边栏 - 函数列表 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Functions</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Function</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Button 
                    onClick={() => createFunction('javascript')}
                    className="justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    JavaScript Function
                  </Button>
                  <Button 
                    onClick={() => createFunction('typescript')}
                    variant="outline"
                    className="justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    TypeScript Function
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            {functions.map((func) => (
              <div
                key={func.id}
                className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                  currentFunction?.id === func.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setCurrentFunction(func);
                  setCode(func.code);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium truncate">{func.name}</span>
                  </div>
                  {func.deployed && (
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {func.language === 'typescript' ? 'TS' : 'JS'}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentFunction && (
                <>
                  <Input
                    value={currentFunction.name}
                    onChange={(e) => {
                      const updatedFunction = { ...currentFunction, name: e.target.value };
                      setCurrentFunction(updatedFunction);
                      setFunctions(prev => prev.map(f => f.id === currentFunction.id ? updatedFunction : f));
                    }}
                    className="w-48"
                  />
                  <Badge variant={currentFunction.deployed ? 'default' : 'secondary'}>
                    {currentFunction.deployed ? 'Deployed' : 'Draft'}
                  </Badge>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveFunction}
                disabled={isSaving || !currentFunction}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
              
              <Button
                size="sm"
                onClick={deployFunction}
                disabled={isDeploying || !currentFunction}
              >
                {isDeploying ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                Deploy
              </Button>
            </div>
          </div>
        </div>

        {/* 选项卡内容 */}
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="editor">Code</TabsTrigger>
              <TabsTrigger value="test">Test</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* 代码编辑器 */}
            <TabsContent value="editor" className="flex-1 m-4">
              <Card className="h-full">
                <CardContent className="p-0 h-full">
                  {currentFunction ? (
                    <Editor
                      height="100%"
                      language={currentFunction.language}
                      value={code}
                      onChange={(value) => setCode(value || '')}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on'
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      Select a function to start editing
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 测试面板 */}
            <TabsContent value="test" className="flex-1 m-4">
              <div className="grid grid-cols-2 gap-4 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Play className="w-5 h-5 mr-2" />
                      Test Function
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="test-params">Parameters (JSON)</Label>
                      <Textarea
                        id="test-params"
                        value={testParams}
                        onChange={(e) => setTestParams(e.target.value)}
                        placeholder='{"key": "value"}'
                        rows={6}
                      />
                    </div>
                    <Button
                      onClick={testFunction}
                      disabled={isRunning || !currentFunction}
                      className="w-full"
                    >
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Run Test
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Terminal className="w-5 h-5 mr-2" />
                      Test Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-80">
                      {testResult ? (
                        <pre className="text-sm bg-gray-50 p-3 rounded overflow-x-auto">
                          {JSON.stringify(testResult, null, 2)}
                        </pre>
                      ) : (
                        <div className="text-gray-500 text-center py-8">
                          No test results yet
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 数据库面板 */}
            <TabsContent value="database" className="flex-1 m-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Database Tables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {databases.length > 0 ? (
                      <div className="space-y-4">
                        {databases.map((table) => (
                          <Card key={table.name}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{table.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-gray-600">
                                {table.records?.length || table.recordCount || 0} records
                              </div>
                              {table.columns && (
                                <div className="mt-2">
                                  <div className="text-xs font-medium text-gray-500 mb-1">Columns:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {table.columns.map((col) => (
                                      <Badge key={col.name} variant="outline" className="text-xs">
                                        {col.name}: {col.type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No database tables found
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 定时任务面板 */}
            <TabsContent value="schedules" className="flex-1 m-4">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      Scheduled Tasks
                    </CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {scheduledTasks.length > 0 ? (
                      <div className="space-y-4">
                        {scheduledTasks.map((task) => (
                          <Card key={task.id}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">{task.name}</h4>
                                  <p className="text-sm text-gray-600">
                                    Function: {task.functionName} • Schedule: {task.schedule}
                                  </p>
                                </div>
                                <Badge variant={task.enabled ? 'default' : 'secondary'}>
                                  {task.enabled ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No scheduled tasks configured
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 日志面板 */}
            <TabsContent value="logs" className="flex-1 m-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Terminal className="w-5 h-5 mr-2" />
                    Runtime Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {logs.length > 0 ? (
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div key={log.id} className="flex items-start space-x-3 text-sm">
                            <div className="text-xs text-gray-500 min-w-20">
                              {log.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="flex items-center">
                              {log.level === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              ) : log.level === 'warn' ? (
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <div className="font-medium min-w-24">
                              {log.functionName}
                            </div>
                            <div className="flex-1">{log.message}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No logs available
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 设置面板 */}
            <TabsContent value="settings" className="flex-1 m-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="w-5 h-5 mr-2" />
                      Dependencies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dependencies.map((dep, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{dep}</span>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Package
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Environment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label>Runtime</Label>
                        <Select defaultValue="nodejs18">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nodejs18">Node.js 18</SelectItem>
                            <SelectItem value="nodejs20">Node.js 20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Timeout (seconds)</Label>
                        <Input type="number" defaultValue="30" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AirCodeEditor; 