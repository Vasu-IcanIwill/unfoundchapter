import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

// One HTML entry per public page, so the existing URLs (/dev-diwali.html, /contact.html, ...) keep working
// as real files: no SPA fallback, correct 404s, and page-specific metadata in the static HTML.
export const PAGES = ['index', 'dev-diwali', 'contact', 'terms', 'privacy', '404'];

// Client production builds get an empty stand-in for the page markup (see src/content/client.js).
function staticIslands() {
  let isBuild = false;
  return {
    name: 'tuc-static-islands',
    enforce: 'pre',
    configResolved(config) {
      isBuild = config.command === 'build';
    },
    resolveId(source, importer, options) {
      if (!isBuild || (options && options.ssr) || !importer) return null;
      if (/[\\/]content[\\/]index\.js$/.test(source) || source.endsWith('/content/index.js')) return resolve(root, 'src/content/client.js');
      return null;
    },
  };
}

export default defineConfig({
  plugins: [staticIslands(), react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 2048,
    // the prerender (SSR) build also writes the images used only inside page markup; prerender.mjs copies them
    ssrEmitAssets: true,
    rollupOptions: {
      input: Object.fromEntries(PAGES.map((p) => [p, resolve(root, `${p}.html`)])),
    },
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
