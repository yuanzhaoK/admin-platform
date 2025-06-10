'use client';

import { useI18n } from '@/hooks/use-i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLocale('zh-CN')}
          className={locale === 'zh-CN' ? 'bg-slate-100 dark:bg-slate-700' : ''}
        >
          {t('settings.chinese')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLocale('en-US')}
          className={locale === 'en-US' ? 'bg-slate-100 dark:bg-slate-700' : ''}
        >
          {t('settings.english')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 