import { renderToString } from 'react-dom/server';
import App from './App.jsx';
import { PAGES } from './pages/registry.js';

/** Build-time only: renders a page to static HTML (see scripts/prerender.mjs). */
export function render(name) {
  const Page = PAGES[name];
  if (!Page) throw new Error(`Unknown page ${name}`);
  return renderToString(<App page={Page} />);
}
