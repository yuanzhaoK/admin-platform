import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';
import { PocketBaseAirCode } from '@/lib/pocketbase-aircode';

interface Function {
  id: string;
  name: string;
  code: string;
  language: 'javascript' | 'typescript';
  deployed: boolean;
  endpoint?: string;
  createdAt: string;
  updatedAt: string;
}

// 模拟的函数存储
let functions: Function[] = [
  {
    id: '1',
    name: 'hello-world',
    code: `const aircode = require('aircode');

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
    language: 'javascript',
    deployed: true,
    endpoint: 'https://your-app.aircode.run/hello-world',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// AirCode 风格的模拟环境
const createAirCodeEnvironment = () => {
  return {
    // 模拟 aircode.db
    db: {
      table: (name: string) => ({
        where: (conditions?: any) => ({
          find: async () => {
            // 模拟数据库查询
            const mockData = {
              users: [
                { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date().toISOString() },
                { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: new Date().toISOString() }
              ],
              posts: [
                { id: '1', title: 'Hello World', content: 'This is a test post', authorId: '1' },
                { id: '2', title: 'AirCode Tutorial', content: 'How to use AirCode', authorId: '2' }
              ]
            };
            return mockData[name as keyof typeof mockData] || [];
          },
          findOne: async () => {
            const mockData = {
              users: { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: new Date().toISOString() },
              posts: { id: '1', title: 'Hello World', content: 'This is a test post', authorId: '1' }
            };
            return mockData[name as keyof typeof mockData] || null;
          }
        }),
        save: async (data: any) => {
          return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() };
        },
        delete: async (id: string) => {
          return { success: true, deletedId: id };
        }
      })
    },

    // 模拟 aircode.files
    files: {
      upload: async (file: any, path?: string) => {
        return {
          url: `https://files.aircode.io/${path || 'uploads'}/${file.name}`,
          size: file.size || 1024
        };
      },
      download: async (url: string) => {
        return {
          url,
          content: 'Mock file content'
        };
      },
      delete: async (url: string) => {
        return { success: true, deletedUrl: url };
      }
    }
  };
};

// 执行函数的安全环境
const executeFunction = async (code: string, params: any, functionName: string) => {
  try {
    const aircode = createAirCodeEnvironment();
    
    // 创建模拟的 require 函数
    const mockRequire = (moduleName: string) => {
      switch (moduleName) {
        case 'aircode':
          return aircode;
        case 'axios':
          return {
            get: async (url: string) => ({ data: { message: 'Mock GET response', url }, status: 200 }),
            post: async (url: string, data: any) => ({ data: { message: 'Mock POST response', receivedData: data }, status: 200 })
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
            uniq: (array: any[]) => [...new Set(array)]
          };
        default:
          throw new Error(`Module '${moduleName}' not found`);
      }
    };

    // 创建上下文
    const context = {
      trigger: 'HTTP',
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      requestId: Date.now().toString()
    };

    // 模拟控制台
    const consoleLogs: string[] = [];
    const mockConsole = {
      log: (...args: any[]) => {
        consoleLogs.push(`[LOG] ${args.join(' ')}`);
        console.log('[Function Log]:', ...args);
      },
      error: (...args: any[]) => {
        consoleLogs.push(`[ERROR] ${args.join(' ')}`);
        console.error('[Function Error]:', ...args);
      },
      warn: (...args: any[]) => {
        consoleLogs.push(`[WARN] ${args.join(' ')}`);
        console.warn('[Function Warn]:', ...args);
      },
      info: (...args: any[]) => {
        consoleLogs.push(`[INFO] ${args.join(' ')}`);
        console.info('[Function Info]:', ...args);
      }
    };

    // 执行函数
    // eslint-disable-next-line no-new-func
    const executor = new Function(
      'params', 
      'context', 
      'require', 
      'console', 
      'module',
      `
      const exports = {};
      const module = { exports };
      
      ${code}
      
      // 支持多种导出方式
      if (typeof module.exports === 'function') {
        return module.exports(params, context);
      } else if (module.exports && typeof module.exports.default === 'function') {
        return module.exports.default(params, context);
      } else {
        // 尝试查找函数名
        const functionMatch = \`${code}\`.match(/(?:function\\s+(\\w+)|const\\s+(\\w+)\\s*=|let\\s+(\\w+)\\s*=|var\\s+(\\w+)\\s*=)/);
        if (functionMatch) {
          const detectedName = functionMatch[1] || functionMatch[2] || functionMatch[3] || functionMatch[4];
          if (typeof eval(detectedName) === 'function') {
            return eval(detectedName)(params, context);
          }
        }
        throw new Error('No valid function found to execute');
      }
      `
    );

    const result = await executor(params, context, mockRequire, mockConsole, { exports: {} });
    
    return {
      success: true,
      result,
      logs: consoleLogs,
      executionTime: Date.now() - parseInt(context.requestId)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      logs: [`[ERROR] ${error}`],
      executionTime: 0
    };
  }
};

// GET - 获取所有函数
export async function GET(req: NextRequest) {
    try {
        const pb = await getPocketBase();
        const airCode = new PocketBaseAirCode(pb);
        const functions = await airCode.listFunctions();
        return NextResponse.json(functions);
    } catch (error) {
        console.error('Error listing functions:', error);
        return NextResponse.json({ error: 'Failed to list functions' }, { status: 500 });
    }
}

// POST - 创建或更新函数
export async function POST(req: NextRequest) {
    try {
        const pb = await getPocketBase();
        const airCode = new PocketBaseAirCode(pb);
        const data = await req.json();
        const functionRecord = await airCode.createFunction(data);
        return NextResponse.json(functionRecord);
    } catch (error) {
        console.error('Error creating function:', error);
        return NextResponse.json({ error: 'Failed to create function' }, { status: 500 });
    }
}

// PUT - 更新函数
export async function PUT(req: NextRequest) {
    try {
        const pb = await getPocketBase();
        const airCode = new PocketBaseAirCode(pb);
        const data = await req.json();
        const { id, ...updates } = data;
        const functionRecord = await airCode.updateFunction(id, updates);
        return NextResponse.json(functionRecord);
    } catch (error) {
        console.error('Error updating function:', error);
        return NextResponse.json({ error: 'Failed to update function' }, { status: 500 });
    }
}

// DELETE - 删除函数
export async function DELETE(req: NextRequest) {
    try {
        const pb = await getPocketBase();
        const airCode = new PocketBaseAirCode(pb);
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Function ID is required' }, { status: 400 });
        }
        await airCode.deleteFunction(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting function:', error);
        return NextResponse.json({ error: 'Failed to delete function' }, { status: 500 });
    }
} 