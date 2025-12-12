import React from 'react';

type ThemeVariant = 'venn' | 'hermes' | 'agora';

interface PageWrapperProps {
  variant?: ThemeVariant;
  children: React.ReactNode;
}

const bgVars: Record<ThemeVariant, string> = {
  venn: 'var(--page-bg-venn)',
  hermes: 'var(--page-bg-hermes)',
  agora: 'var(--page-bg-agora)'
};

export const PageWrapper: React.FC<PageWrapperProps> = ({ variant = 'venn', children }) => {
  return (
    <div
      data-theme={variant}
      className="min-h-screen text-slate-900 dark:text-slate-100"
      style={{ backgroundColor: bgVars[variant] }}
    >
      {children}
    </div>
  );
};
