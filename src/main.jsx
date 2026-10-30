import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import { inject } from '@vercel/analytics';

// Vercel Web Analytics: cookie-free page-view counts. Only on the live site (it needs Vercel's servers).
const LIVE = /(^|\.)unfoundchapter\.com$|\.vercel\.app$/;

/** Hydrates the prerendered page in production; renders from scratch in `npm run dev`. */
export function mount(Page) {
  if (LIVE.test(window.location.hostname)) inject({ mode: 'production' });
  const el = document.getElementById('root');
  const tree = (
    <StrictMode>
      <App page={Page} />
    </StrictMode>
  );
  if (el.firstElementChild) hydrateRoot(el, tree);
  else createRoot(el).render(tree);
}
