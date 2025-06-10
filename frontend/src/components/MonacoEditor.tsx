'use client';

import { useEffect, useRef, useState } from 'react';

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  height?: string;
  theme?: string;
  options?: any;
  readOnly?: boolean;
}

export default function MonacoEditor({
  value = '',
  onChange,
  language = 'javascript',
  height = '400px',
  theme = 'vs-dark',
  options = {},
  readOnly = false
}: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [monaco, setMonaco] = useState<any>(null);

  useEffect(() => {
    // 动态导入Monaco Editor
    const loadMonaco = async () => {
      try {
        const monacoEditor = await import('monaco-editor');
        
        // 配置Monaco Editor
        monacoEditor.editor.defineTheme('vs-dark-custom', {
          base: 'vs-dark',
          inherit: true,
          rules: [],
          colors: {
            'editor.background': '#1e293b',
          }
        });

        setMonaco(monacoEditor);
      } catch (error) {
        console.error('Failed to load Monaco Editor:', error);
      }
    };

    loadMonaco();
  }, []);

  useEffect(() => {
    if (monaco && containerRef.current && !editorRef.current) {
      // 创建编辑器实例
      const editor = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme: theme === 'vs-dark' ? 'vs-dark-custom' : theme,
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        tabSize: 2,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        selectOnLineNumbers: true,
        ...options
      });

      // 监听内容变化
      editor.onDidChangeModelContent(() => {
        const currentValue = editor.getValue();
        onChange?.(currentValue);
      });

      editorRef.current = editor;
      setIsEditorReady(true);

      // 清理函数
      return () => {
        if (editorRef.current) {
          editorRef.current.dispose();
        }
      };
    }
  }, [monaco, language, theme, readOnly, options]);

  // 更新编辑器内容
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      const model = editorRef.current.getModel();
      if (model) {
        model.setValue(value);
      }
    }
  }, [value]);

  if (!monaco) {
    return (
      <div 
        style={{ height }}
        className="bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center border"
      >
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">Loading Editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      style={{ height }}
      className="border rounded-lg overflow-hidden"
    />
  );
} 