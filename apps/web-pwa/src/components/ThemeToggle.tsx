import React from 'react';
import { useTheme } from './ThemeProvider';

export const ThemeToggle: React.FC = () => {
  const { resolved, setTheme } = useTheme();

  const handleClick = () => {
    const next = resolved === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const label = `Toggle theme (current: ${resolved === 'dark' ? 'dark' : 'light'})`;

  const Icon = () =>
    resolved === 'dark' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 shadow-sm hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      aria-label={label}
      title={label}
    >
      <Icon />
    </button>
  );
};

export default ThemeToggle;
