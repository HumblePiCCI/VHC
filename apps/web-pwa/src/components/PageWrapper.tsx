import React from 'react';

type ThemeVariant = 'venn' | 'hermes' | 'agora';

interface PageWrapperProps {
  variant?: ThemeVariant;
  children: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ variant = 'venn', children }) => {
  return (
    <div data-theme={variant} className="min-h-screen bg-surface-light text-slate-900 dark:bg-surface-dark dark:text-slate-100">
      {children}
    </div>
  );
};
