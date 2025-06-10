'use client';

import { ReactNode } from 'react';
import { I18nContext, useI18nLogic } from '@/hooks/use-i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const i18nLogic = useI18nLogic();

  return (
    <I18nContext.Provider value={i18nLogic}>
      {children}
    </I18nContext.Provider>
  );
} 