/*
 * Production client build: the approved markup is already in every prerendered HTML page, and React keeps
 * it as-is during hydration (static islands), so the browser bundle does not need a second copy of it.
 * vite.config.js swaps content/index.js for this module in client builds only (dev and SSR use the real one).
 */
export const html = new Proxy({}, { get: () => '' });
