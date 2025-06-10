'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { zhCN } from '@/locales/zh-CN';
import { enUS } from '@/locales/en-US';

type Locale = 'zh-CN' | 'en-US';
type Messages = typeof zhCN;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, any>) => string;
  messages: Messages;
}

const localeMessages = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useI18nLogic() {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');

  useEffect(() => {
    // 从localStorage获取保存的语言设置
    const savedLocale = localStorage.getItem('locale') as Locale | null;
    if (savedLocale && ['zh-CN', 'en-US'].includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language;
      if (browserLang.startsWith('zh')) {
        setLocaleState('zh-CN');
      } else {
        setLocaleState('en-US');
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    
    // 更新HTML lang属性
    document.documentElement.lang = newLocale;
  };

  const messages = localeMessages[locale];

  // 翻译函数，支持嵌套键和参数替换
  const t = (key: string, params?: Record<string, any>): string => {
    const keys = key.split('.');
    let value: any = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }
    
    // 参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match: string, paramKey: string) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value;
  };

  return {
    locale,
    setLocale,
    t,
    messages,
  };
} 