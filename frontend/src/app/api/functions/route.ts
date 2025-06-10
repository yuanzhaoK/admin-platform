import { NextRequest, NextResponse } from 'next/server';

// 函数信息接口
interface FunctionInfo {
  name: string;
  code: string;
  description: string;
  created: string;
  updated: string;
  published: boolean;
  dependencies: string[];
  params?: Record<string, string>; // 参数类型定义
}

// 函数执行器类型
type FunctionExecutor = (params: Record<string, any>) => any;

// 动态函数存储
const functions = new Map<string, FunctionExecutor>();
const functionInfos = new Map<string, FunctionInfo>();

// 初始化示例函数
function initializeExampleFunctions() {
  const helloFunc = (params: Record<string, any>) => {
    return { message: `Hello, ${params.name || 'World'}!` };
  };
  
  const calculateFunc = (params: Record<string, any>) => {
    const { operation, a, b } = params;
    switch (operation) {
      case 'add':
        return { result: a + b };
      case 'subtract':
        return { result: a - b };
      case 'multiply':
        return { result: a * b };
      case 'divide':
        return { result: b !== 0 ? a / b : 'Cannot divide by zero' };
      default:
        return { error: 'Unknown operation' };
    }
  };
  
  const systemInfoFunc = () => {
    return {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime(),
    };
  };

  // 注册示例函数
  functions.set('hello', helloFunc);
  functionInfos.set('hello', {
    name: 'hello',
    code: `function hello(params) {
  return { message: \`Hello, \${params.name || 'World'}!\` };
}`,
    description: 'Returns a greeting message',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    published: true,
    dependencies: [],
    params: { name: 'string' }
  });

  functions.set('calculate', calculateFunc);
  functionInfos.set('calculate', {
    name: 'calculate',
    code: `function calculate(params) {
  const { operation, a, b } = params;
  switch (operation) {
    case 'add': return { result: a + b };
    case 'subtract': return { result: a - b };
    case 'multiply': return { result: a * b };
    case 'divide': return { result: b !== 0 ? a / b : 'Cannot divide by zero' };
    default: return { error: 'Unknown operation' };
  }
}`,
    description: 'Performs basic arithmetic operations',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    published: true,
    dependencies: [],
    params: { operation: 'string', a: 'number', b: 'number' }
  });

  functions.set('getSystemInfo', systemInfoFunc);
  functionInfos.set('getSystemInfo', {
    name: 'getSystemInfo',
    code: `function getSystemInfo() {
  return {
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    uptime: process.uptime(),
  };
}`,
    description: 'Returns system information',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    published: true,
    dependencies: [],
    params: {}
  });
}

// 确保示例函数已初始化
if (functions.size === 0) {
  initializeExampleFunctions();
}

// POST - 执行函数
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { functionName, params = {} } = body;

    if (!functionName) {
      return NextResponse.json(
        { error: 'Function name is required' },
        { status: 400 }
      );
    }

    const func = functions.get(functionName);
    const funcInfo = functionInfos.get(functionName);
    
    if (!func || !funcInfo) {
      return NextResponse.json(
        { error: `Function '${functionName}' not found` },
        { status: 404 }
      );
    }

    if (!funcInfo.published) {
      return NextResponse.json(
        { error: `Function '${functionName}' is not published` },
        { status: 403 }
      );
    }

    const result = await func(params);
    
    return NextResponse.json({
      success: true,
      functionName,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Function execution failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET - 获取函数列表或单个函数信息
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const functionName = searchParams.get('name');

  if (functionName) {
    // 获取单个函数信息
    const funcInfo = functionInfos.get(functionName);
    if (!funcInfo) {
      return NextResponse.json(
        { error: `Function '${functionName}' not found` },
        { status: 404 }
      );
    }
    return NextResponse.json(funcInfo);
  }

  // 获取所有函数列表
  const allFunctions = Array.from(functionInfos.values()).map(func => ({
    name: func.name,
    description: func.description,
    published: func.published,
    created: func.created,
    updated: func.updated,
    dependencies: func.dependencies,
    params: func.params
  }));

  return NextResponse.json({
    availableFunctions: allFunctions,
    count: allFunctions.length
  });
}

// PUT - 创建或更新函数
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      functionName, 
      code, 
      description = '', 
      dependencies = [],
      params = {},
      published = false 
    } = body;

    if (!functionName || !code) {
      return NextResponse.json(
        { error: 'Function name and code are required' },
        { status: 400 }
      );
    }

    // 验证函数代码 - 简化版本
    try {
      // 尝试执行代码看是否有语法错误
      // eslint-disable-next-line no-new-func
      new Function(code);
      
      // 检查代码中是否包含函数定义
      const hasFunctionDefinition = 
        code.includes('function ') || 
        code.includes('=>') || 
        code.includes('= function');
      
      if (!hasFunctionDefinition) {
        throw new Error('Code must contain a function definition');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid function code';
      return NextResponse.json(
        { error: `Function validation failed: ${errorMessage}` },
        { status: 400 }
      );
    }

    // 创建模拟的require函数
    const createMockRequire = () => {
      return (moduleName: string) => {
        switch (moduleName) {
          case 'pocketbase':
            return class MockPocketBase {
              baseUrl: string;
              authStore: any;
              
              constructor(baseUrl = 'http://127.0.0.1:8090') {
                this.baseUrl = baseUrl;
                this.authStore = {
                  token: '',
                  model: null,
                  isValid: false,
                  save: () => {},
                  clear: () => {},
                  loadFromCookie: () => {}
                };
              }
              
              collection(name: string) {
                return {
                  getFullList: async () => [
                    { id: '1', created: '2024-01-01T00:00:00Z', name: 'Sample Record 1' },
                    { id: '2', created: '2024-01-01T00:00:00Z', name: 'Sample Record 2' }
                  ],
                  getList: async (page = 1, perPage = 30) => ({
                    page, perPage, totalItems: 2, totalPages: 1,
                    items: [
                      { id: '1', created: '2024-01-01T00:00:00Z', name: 'Sample Record 1' },
                      { id: '2', created: '2024-01-01T00:00:00Z', name: 'Sample Record 2' }
                    ]
                  }),
                  getOne: async (id: string) => ({ id, created: '2024-01-01T00:00:00Z', name: `Sample Record ${id}` }),
                  create: async (data: any) => ({ id: 'new_id', created: new Date().toISOString(), ...data }),
                  update: async (id: string, data: any) => ({ id, created: '2024-01-01T00:00:00Z', updated: new Date().toISOString(), ...data }),
                  delete: async () => true,
                  authWithPassword: async (email: string, password: string) => ({
                    token: 'mock_token_123',
                    record: { id: 'user_1', email, username: email }
                  })
                };
              }
              
              filter(expr: string, params: any = {}) {
                return expr.replace(/{:(\w+)}/g, (match, key) => params[key] || match);
              }
            };
          
          case 'axios':
            return {
              get: async (url: string) => ({ data: { message: 'Mock GET response', url }, status: 200 }),
              post: async (url: string, data: any) => ({ data: { message: 'Mock POST response', url, receivedData: data }, status: 200 }),
              put: async (url: string, data: any) => ({ data: { message: 'Mock PUT response', url, receivedData: data }, status: 200 }),
              delete: async (url: string) => ({ data: { message: 'Mock DELETE response', url }, status: 200 })
            };
          
          case 'lodash':
            return {
              chunk: (array: any[], size: number) => {
                const chunks = [];
                for (let i = 0; i < array.length; i += size) {
                  chunks.push(array.slice(i, i + size));
                }
                return chunks;
              },
              uniq: (array: any[]) => [...new Set(array)],
              isEmpty: (value: any) => value == null || (Array.isArray(value) || typeof value === 'string') ? value.length === 0 : Object.keys(value).length === 0
            };
          
          case 'moment':
            return () => ({
              format: () => new Date().toISOString().slice(0, 19).replace('T', ' '),
              valueOf: () => Date.now(),
              toISOString: () => new Date().toISOString()
            });
          
          case 'uuid':
            return {
              v4: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
              })
            };
          
          default:
            throw new Error(`Module '${moduleName}' not found. Available modules: pocketbase, axios, lodash, moment, uuid`);
        }
      };
    };

    // 创建函数执行器
    const createExecutor = (code: string, functionName: string) => {
      return (params: Record<string, any>) => {
        try {
          const mockRequire = createMockRequire();
          const mockConsole = {
            log: (...args: any[]) => console.log('[Function Log]:', ...args),
            error: (...args: any[]) => console.error('[Function Error]:', ...args),
            warn: (...args: any[]) => console.warn('[Function Warn]:', ...args),
            info: (...args: any[]) => console.info('[Function Info]:', ...args)
          };

          // 创建执行函数
          // eslint-disable-next-line no-new-func
          const executor = new Function('params', 'require', 'console', `
            ${code}
            
            // 尝试多种方式查找并执行函数
            let result = null;
            
            // 方式1: 直接调用函数名
            if (typeof ${functionName} !== 'undefined') {
              result = ${functionName}(params);
            }
            
            // 方式2: 自动检测函数名
            if (result === null) {
              const functionMatch = \`${code}\`.match(/function\\s+(\\w+)\\s*\\(/);
              if (functionMatch) {
                const detectedName = functionMatch[1];
                if (typeof eval(detectedName) === 'function') {
                  result = eval(detectedName)(params);
                }
              }
            }
            
            // 方式3: 检查变量赋值的函数
            if (result === null) {
              const varMatch = \`${code}\`.match(/(?:const|let|var)\\s+(\\w+)\\s*=/);
              if (varMatch) {
                const varName = varMatch[1];
                if (typeof eval(varName) === 'function') {
                  result = eval(varName)(params);
                }
              }
            }
            
            return result;
          `);
          
          return executor(params, mockRequire, mockConsole);
        } catch (error) {
          throw error;
        }
      };
    };

    const existingFunc = functionInfos.get(functionName);
    const now = new Date().toISOString();

    const functionInfo: FunctionInfo = {
      name: functionName,
      code,
      description,
      created: existingFunc ? existingFunc.created : now,
      updated: now,
      published,
      dependencies,
      params
    };

    // 创建执行器
    const wrappedFunc = createExecutor(code, functionName);
    
    functions.set(functionName, wrappedFunc);
    functionInfos.set(functionName, functionInfo);

    return NextResponse.json({
      success: true,
      message: `Function '${functionName}' ${existingFunc ? 'updated' : 'created'} successfully`,
      function: functionInfo,
      timestamp: now
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Function creation failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// DELETE - 删除函数
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const functionName = searchParams.get('name');

    if (!functionName) {
      return NextResponse.json(
        { error: 'Function name is required' },
        { status: 400 }
      );
    }

    if (!functionInfos.has(functionName)) {
      return NextResponse.json(
        { error: `Function '${functionName}' not found` },
        { status: 404 }
      );
    }

    functions.delete(functionName);
    functionInfos.delete(functionName);

    return NextResponse.json({
      success: true,
      message: `Function '${functionName}' deleted successfully`,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Function deletion failed';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 