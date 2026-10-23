import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';

/** Hydrates the prerendered page in production; renders from scratch in `npm run dev`. */
export function mount(Page) {
  const el = document.getElementById('root');
  const tree = (
    <StrictMode>
      <App page={Page} />
    </StrictMode>
  );
  if (el.firstElementChild) hydrateRoot(el, tree);
  else createRoot(el).render(tree);
}
