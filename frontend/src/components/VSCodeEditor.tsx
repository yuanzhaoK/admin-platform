'use client';

import React, { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileCode, 
  Package, 
  Search, 
  Settings,
  FolderOpen,
  Play,
  Zap
} from 'lucide-react';

interface VSCodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  functionName?: string;
  dependencies?: string[];
  onDependenciesChange?: (deps: string[]) => void;
}

// 常用Node.js模块的类型定义
const NODE_MODULES_TYPES = {
  'pocketbase': `
declare module 'pocketbase' {
  export interface BaseModel {
    id: string;
    created: string;
    updated: string;
  }

  export interface Admin extends BaseModel {
    avatar: string;
    email: string;
  }

  export interface Record extends BaseModel {
    [key: string]: any;
  }

  export interface AuthModel extends BaseModel {
    username?: string;
    email?: string;
    emailVisibility?: boolean;
    verified?: boolean;
  }

  export interface ListResult<T = Record> {
    page: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    items: T[];
  }

  export interface RecordOptions {
    expand?: string;
    fields?: string;
    filter?: string;
    sort?: string;
    skipTotal?: boolean;
  }

  export interface RecordListOptions extends RecordOptions {
    page?: number;
    perPage?: number;
  }

  export interface AuthOptions {
    expand?: string;
    fields?: string;
  }

  export interface FileOptions {
    download?: boolean;
  }

  export class BaseAuthStore {
    token: string;
    model: AuthModel | Admin | null;
    isValid: boolean;
    save(token: string, model: AuthModel | Admin | null): void;
    clear(): void;
    onChange(callback: (token: string, model: AuthModel | Admin | null) => void): () => void;
  }

  export class RecordService {
    constructor(client: PocketBase, collectionIdOrName: string);
    
    getFullList<T = Record>(options?: RecordListOptions): Promise<T[]>;
    getList<T = Record>(page?: number, perPage?: number, options?: RecordListOptions): Promise<ListResult<T>>;
    getFirstListItem<T = Record>(filter: string, options?: RecordOptions): Promise<T>;
    getOne<T = Record>(id: string, options?: RecordOptions): Promise<T>;
    create<T = Record>(bodyParams?: {[key:string]: any}, options?: RecordOptions): Promise<T>;
    update<T = Record>(id: string, bodyParams?: {[key:string]: any}, options?: RecordOptions): Promise<T>;
    delete(id: string): Promise<boolean>;
    
    // Auth methods
    authWithPassword<T = Record>(usernameOrEmail: string, password: string, options?: AuthOptions): Promise<{ token: string, record: T }>;
    authWithOAuth2<T = Record>(provider: string, code: string, codeVerifier: string, redirectUrl: string, options?: AuthOptions): Promise<{ token: string, record: T }>;
    authRefresh<T = Record>(options?: AuthOptions): Promise<{ token: string, record: T }>;
    requestPasswordReset(email: string): Promise<boolean>;
    confirmPasswordReset(passwordResetToken: string, password: string, passwordConfirm: string): Promise<boolean>;
    requestVerification(email: string): Promise<boolean>;
    confirmVerification(verificationToken: string): Promise<boolean>;
    requestEmailChange(newEmail: string): Promise<boolean>;
    confirmEmailChange(emailChangeToken: string, password: string): Promise<boolean>;
    
    // Subscriptions
    subscribe<T = Record>(callback: (data: { action: string, record: T }) => void): Promise<() => void>;
    unsubscribe(): Promise<void>;
  }

  export class AdminService {
    authWithPassword(email: string, password: string): Promise<{ token: string, admin: Admin }>;
    authRefresh(): Promise<{ token: string, admin: Admin }>;
    requestPasswordReset(email: string): Promise<boolean>;
    confirmPasswordReset(passwordResetToken: string, password: string, passwordConfirm: string): Promise<boolean>;
  }

  export class CollectionService {
    getFullList(): Promise<any[]>;
    getList(page?: number, perPage?: number): Promise<ListResult>;
    getOne(id: string): Promise<any>;
    create(bodyParams?: any): Promise<any>;
    update(id: string, bodyParams?: any): Promise<any>;
    delete(id: string): Promise<boolean>;
  }

  export class LogService {
    getRequestsList(page?: number, perPage?: number, options?: any): Promise<ListResult>;
    getRequest(id: string): Promise<any>;
    getRequestsStats(options?: any): Promise<any>;
  }

  export class SettingsService {
    getAll(): Promise<any>;
    update(bodyParams?: any): Promise<any>;
    testS3(filesystem?: string): Promise<boolean>;
    testEmail(toEmail: string, emailTemplate: string): Promise<boolean>;
    generateAppleClientSecret(clientId: string, teamId: string, keyId: string, privateKey: string): Promise<any>;
  }

  export class RealtimeService {
    subscribe(subscription: string, callback: (data: any) => void): Promise<() => void>;
    unsubscribe(subscription?: string): Promise<void>;
  }

  export default class PocketBase {
    baseUrl: string;
    lang: string;
    authStore: BaseAuthStore;
    admins: AdminService;
    collections: CollectionService;
    logs: LogService;
    settings: SettingsService;
    realtime: RealtimeService;

    constructor(baseUrl?: string, authStore?: BaseAuthStore, lang?: string);
    
    collection(idOrName: string): RecordService;
    autoCancellation(enable: boolean): PocketBase;
    cancelAllRequests(): PocketBase;
    filter(expr: string, params?: {[key: string]: any}): string;
    getFileUrl(record: Record, filename: string, options?: FileOptions): string;
    buildUrl(path: string): string;
    send(path: string, options?: any): Promise<any>;
  }
}`,
  'axios': `
declare module 'axios' {
  export interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request?: any;
  }
  
  export interface AxiosRequestConfig {
    url?: string;
    method?: string;
    data?: any;
    params?: any;
    headers?: any;
    timeout?: number;
  }
  
  export default function axios(config: AxiosRequestConfig): Promise<AxiosResponse>;
  export function get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  export function delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
}`,
  'lodash': `
declare module 'lodash' {
  export function chunk<T>(array: T[], size: number): T[][];
  export function compact<T>(array: (T | null | undefined | false | 0 | "")[]): T[];
  export function concat<T>(...arrays: (T | T[])[]): T[];
  export function difference<T>(array: T[], ...values: T[][]): T[];
  export function drop<T>(array: T[], n?: number): T[];
  export function fill<T>(array: T[], value: any, start?: number, end?: number): T[];
  export function findIndex<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean, fromIndex?: number): number;
  export function first<T>(array: T[]): T | undefined;
  export function flatten<T>(array: (T | T[])[]): T[];
  export function groupBy<T>(array: T[], iteratee: (value: T) => any): { [key: string]: T[] };
  export function includes<T>(collection: T[], value: T, fromIndex?: number): boolean;
  export function isEmpty(value: any): boolean;
  export function isEqual(value: any, other: any): boolean;
  export function map<T, U>(collection: T[], iteratee: (value: T, index: number, collection: T[]) => U): U[];
  export function merge<T>(object: T, ...sources: any[]): T;
  export function pick<T, K extends keyof T>(object: T, ...props: K[]): Pick<T, K>;
  export function reverse<T>(array: T[]): T[];
  export function shuffle<T>(array: T[]): T[];
  export function size(collection: any): number;
  export function sortBy<T>(array: T[], iteratees: ((value: T) => any)[]): T[];
  export function uniq<T>(array: T[]): T[];
  export function cloneDeep<T>(value: T): T;
  export default lodash;
}`,
  'moment': `
declare module 'moment' {
  interface Moment {
    format(format?: string): string;
    add(amount: number, unit: string): Moment;
    subtract(amount: number, unit: string): Moment;
    isAfter(date: Moment | string | Date): boolean;
    isBefore(date: Moment | string | Date): boolean;
    isSame(date: Moment | string | Date): boolean;
    diff(date: Moment | string | Date, unit?: string): number;
    valueOf(): number;
    toDate(): Date;
    toISOString(): string;
    unix(): number;
  }
  
  export default function moment(date?: string | Date | number): Moment;
  export function unix(timestamp: number): Moment;
  export function utc(date?: string | Date | number): Moment;
}`
};

const POPULAR_MODULES = [
  'pocketbase', 'axios', 'lodash', 'moment', 'uuid', 'crypto', 'fs', 'path', 'url', 'querystring', 
  'http', 'https', 'buffer', 'stream', 'events', 'util', 'os', 'child_process'
];

export default function VSCodeEditor({
  value = '',
  onChange,
  language = 'javascript',
  height = '500px',
  readOnly = false,
  functionName = 'untitled',
  dependencies = [],
  onDependenciesChange
}: VSCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [selectedTab, setSelectedTab] = useState('code');
  const [newDependency, setNewDependency] = useState('');

  // 编辑器配置
  const editorOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    fontFamily: 'JetBrains Mono, Consolas, Monaco, "Courier New", monospace',
    lineHeight: 20,
    tabSize: 2,
    insertSpaces: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    lineNumbers: 'on' as const,
    renderLineHighlight: 'all' as const,
    selectOnLineNumbers: true,
    matchBrackets: 'always' as const,
    theme: 'vs-dark',
    readOnly,
    // 智能提示配置
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    parameterHints: {
      enabled: true
    },
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on' as const,
    tabCompletion: 'on' as const,
    wordBasedSuggestions: 'currentDocument' as const,
    // 代码格式化
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full' as const,
    // 代码折叠
    folding: true,
    foldingHighlight: true,
    showFoldingControls: 'always' as const,
    // 其他功能
    multiCursorModifier: 'ctrlCmd' as const,
    copyWithSyntaxHighlighting: true,
    suggest: {
      showKeywords: true,
      showSnippets: true,
      showFunctions: true,
      showConstructors: true,
      showFields: true,
      showVariables: true,
      showClasses: true,
      showStructs: true,
      showInterfaces: true,
      showModules: true,
      showProperties: true,
      showEvents: true,
      showOperators: true,
      showUnits: true,
      showValues: true,
      showConstants: true,
      showEnums: true,
      showEnumMembers: true,
      showMethods: true,
      showReferences: true,
      showColors: true,
      showFiles: true,
      showFolders: true,
      showTypeParameters: true
    }
  };

  // Monaco编辑器挂载后的设置
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 设置自定义主题
    monaco.editor.defineTheme('vscode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editor.lineHighlightBackground': '#2A2D2E',
      }
    });

    monaco.editor.setTheme('vscode-dark');

    // 添加Node.js模块的类型定义
    addNodeModulesTypes(monaco);

    // 添加自定义代码片段
    addCustomSnippets(monaco);

    // 设置键盘快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // 阻止浏览器默认保存行为
      console.log('Save triggered');
    });

    // 设置代码格式化
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  // 添加Node.js模块类型定义
  const addNodeModulesTypes = (monaco: Monaco) => {
    // 添加内置Node.js类型
    const nodeTypesContent = `
declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};

declare const require: (id: string) => any;
declare const module: { exports: any };
declare const exports: any;
declare const __dirname: string;
declare const __filename: string;
declare const process: {
  env: { [key: string]: string | undefined };
  argv: string[];
  exit(code?: number): never;
};

declare const Buffer: {
  from(str: string, encoding?: string): Buffer;
  alloc(size: number): Buffer;
};

interface Buffer {
  toString(encoding?: string): string;
  length: number;
}
`;

    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      nodeTypesContent,
      'file:///node_modules/@types/node/index.d.ts'
    );

    // 添加流行模块的类型定义
    Object.entries(NODE_MODULES_TYPES).forEach(([moduleName, typeDef]) => {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        typeDef,
        `file:///node_modules/@types/${moduleName}/index.d.ts`
      );
    });

    // 配置TypeScript编译选项
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowJs: true,
      typeRoots: ['node_modules/@types']
    });
  };

  // 添加自定义代码片段
  const addCustomSnippets = (monaco: Monaco) => {
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions = [
          {
            label: 'async-function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'async function ${1:functionName}(${2:params}) {',
              '  try {',
              '    ${3:// Your async code here}',
              '    return { success: true, data: ${4:result} };',
              '  } catch (error) {',
              '    return { success: false, error: error.message };',
              '  }',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create an async function with error handling',
            range: range
          },
          {
            label: 'pocketbase-init',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'const PocketBase = require("pocketbase");',
              '',
              'const pb = new PocketBase("${1:http://127.0.0.1:8090}");',
              '',
              '// Auto-auth if available',
              'pb.authStore.loadFromCookie();'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Initialize PocketBase client',
            range: range
          },
          {
            label: 'pocketbase-auth',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'const PocketBase = require("pocketbase");',
              'const pb = new PocketBase("${1:http://127.0.0.1:8090}");',
              '',
              'try {',
              '  // Authenticate user',
              '  const authData = await pb.collection("${2:users}").authWithPassword(',
              '    "${3:email}",',
              '    "${4:password}"',
              '  );',
              '  ',
              '  return { success: true, user: authData.record, token: authData.token };',
              '} catch (error) {',
              '  return { success: false, error: error.message };',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'PocketBase user authentication',
            range: range
          },
          {
            label: 'pocketbase-crud',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'const PocketBase = require("pocketbase");',
              'const pb = new PocketBase("${1:http://127.0.0.1:8090}");',
              '',
              'try {',
              '  // Create record',
              '  const record = await pb.collection("${2:collection_name}").create({',
              '    ${3:"field": "value"}',
              '  });',
              '  ',
              '  // Get records',
              '  const records = await pb.collection("${2:collection_name}").getFullList({',
              '    sort: "-created"',
              '  });',
              '  ',
              '  // Update record',
              '  const updated = await pb.collection("${2:collection_name}").update("${4:RECORD_ID}", {',
              '    ${5:"field": "new_value"}',
              '  });',
              '  ',
              '  return { success: true, data: { record, records, updated } };',
              '} catch (error) {',
              '  return { success: false, error: error.message };',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'PocketBase CRUD operations',
            range: range
          },
          {
            label: 'pocketbase-realtime',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'const PocketBase = require("pocketbase");',
              'const pb = new PocketBase("${1:http://127.0.0.1:8090}");',
              '',
              'try {',
              '  // Subscribe to changes in a collection',
              '  const unsubscribe = await pb.collection("${2:collection_name}").subscribe("*", function (e) {',
              '    console.log(e.action); // create, update, delete',
              '    console.log(e.record); // the changed record',
              '  });',
              '  ',
              '  // Later to unsubscribe',
              '  // unsubscribe();',
              '  ',
              '  return { success: true, message: "Realtime subscription active" };',
              '} catch (error) {',
              '  return { success: false, error: error.message };',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'PocketBase realtime subscriptions',
            range: range
          },
          {
            label: 'api-call',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'const axios = require("axios");',
              '',
              'try {',
              '  const response = await axios.${1|get,post,put,delete|}("${2:url}"${3:, data});',
              '  return { success: true, data: response.data };',
              '} catch (error) {',
              '  return { success: false, error: error.message };',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Make an HTTP API call with axios',
            range: range
          },
          {
            label: 'validate-params',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'if (!params || typeof params !== "object") {',
              '  return { success: false, error: "Invalid parameters" };',
              '}',
              '',
              'const { ${1:requiredParam} } = params;',
              'if (!${1:requiredParam}) {',
              '  return { success: false, error: "${1:requiredParam} is required" };',
              '}'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Validate function parameters',
            range: range
          }
        ];

        return { suggestions };
      }
    });
  };

  // 添加依赖
  const addDependency = () => {
    if (newDependency && !dependencies.includes(newDependency)) {
      const newDeps = [...dependencies, newDependency];
      onDependenciesChange?.(newDeps);
      setNewDependency('');
    }
  };

  // 移除依赖
  const removeDependency = (dep: string) => {
    const newDeps = dependencies.filter(d => d !== dep);
    onDependenciesChange?.(newDeps);
  };

  return (
    <div className="bg-[#1E1E1E] border rounded-lg overflow-hidden" style={{ height }}>
      {/* VSCode风格的标签栏 */}
      <div className="bg-[#2D2D30] border-b border-[#3C3C3C] flex items-center">
        <div className="flex">
          <button
            className={`px-4 py-2 text-sm flex items-center space-x-2 border-r border-[#3C3C3C] ${
              selectedTab === 'code' 
                ? 'bg-[#1E1E1E] text-white' 
                : 'text-[#CCCCCC] hover:text-white hover:bg-[#37373D]'
            }`}
            onClick={() => setSelectedTab('code')}
          >
            <FileCode className="w-4 h-4" />
            <span>{functionName}.js</span>
          </button>
          <button
            className={`px-4 py-2 text-sm flex items-center space-x-2 ${
              selectedTab === 'deps' 
                ? 'bg-[#1E1E1E] text-white border-r border-[#3C3C3C]' 
                : 'text-[#CCCCCC] hover:text-white hover:bg-[#37373D]'
            }`}
            onClick={() => setSelectedTab('deps')}
          >
            <Package className="w-4 h-4" />
            <span>Dependencies</span>
            {dependencies.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 text-xs">
                {dependencies.length}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {selectedTab === 'code' ? (
        <div className="h-full">
          <Editor
            height="100%"
            language={language}
            value={value}
            onChange={onChange}
            onMount={handleEditorDidMount}
            options={editorOptions}
            theme="vscode-dark"
          />
        </div>
      ) : (
        <div className="p-4 text-white bg-[#1E1E1E] h-full">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Node.js Dependencies
              </h3>
              <p className="text-sm text-[#CCCCCC] mb-4">
                Add external Node.js modules to your function. Popular modules include type definitions for better code completion.
              </p>
            </div>

            {/* 添加依赖 */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newDependency}
                onChange={(e) => setNewDependency(e.target.value)}
                placeholder="Enter module name (e.g., axios, lodash)"
                className="flex-1 px-3 py-2 bg-[#3C3C3C] border border-[#5A5A5A] rounded text-white placeholder-[#CCCCCC] focus:outline-none focus:border-[#007ACC]"
                onKeyPress={(e) => e.key === 'Enter' && addDependency()}
              />
              <Button onClick={addDependency} className="bg-[#0E639C] hover:bg-[#1177BB]">
                Add
              </Button>
            </div>

            {/* 已添加的依赖 */}
            {dependencies.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Installed Dependencies:</h4>
                <div className="space-y-2">
                  {dependencies.map((dep) => (
                    <div key={dep} className="flex items-center justify-between bg-[#2D2D30] p-2 rounded">
                      <span className="font-mono text-sm">{dep}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDependency(dep)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 推荐模块 */}
            <div>
              <h4 className="font-medium mb-2">Popular Modules:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {POPULAR_MODULES.filter(mod => !dependencies.includes(mod)).map((module) => (
                  <Button
                    key={module}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newDeps = [...dependencies, module];
                      onDependenciesChange?.(newDeps);
                    }}
                    className="justify-start text-xs h-8 border-[#5A5A5A] text-[#CCCCCC] hover:text-white hover:bg-[#37373D]"
                  >
                    {module}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 