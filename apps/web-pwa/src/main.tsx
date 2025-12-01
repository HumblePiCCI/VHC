import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routes';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';

console.info('[vh:web-pwa] main.tsx executing, mounting router...');

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>
  );
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => console.log('[vh:web-pwa] SW registered:', reg))
    .catch((err) => console.warn('[vh:web-pwa] service worker registration failed', err));
}
