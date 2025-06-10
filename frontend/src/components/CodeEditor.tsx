'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  height?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export default function CodeEditor({
  value = '',
  onChange,
  language = 'javascript',
  height = '400px',
  readOnly = false,
  placeholder = 'Enter your code here...'
}: CodeEditorProps) {
  const [code, setCode] = useState(value);

  useEffect(() => {
    setCode(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setCode(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { key, ctrlKey, metaKey } = event;
    
    // Tab键缩进
    if (key === 'Tab') {
      event.preventDefault();
      const textarea = event.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newValue);
      onChange?.(newValue);
      
      // 设置光标位置
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    
    // Ctrl/Cmd + S 保存（阻止默认行为）
    if ((ctrlKey || metaKey) && key === 's') {
      event.preventDefault();
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        className="font-mono text-sm resize-none"
        style={{ height, minHeight: height }}
      />
      {language && (
        <div className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
          {language}
        </div>
      )}
    </div>
  );
} 