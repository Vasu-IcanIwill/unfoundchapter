import { defineConfig, devices } from '@playwright/test';
import { CHOSEN } from './tests/consent-state.js';

// Run after `npm run build`. Serves dist/ with the vercel.json headers emulated, plus the approved static
// site (reference/approved-static-site) for the visual comparison.
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: 'http://127.0.0.1:4175', ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, storageState: CHOSEN },
  webServer: [
    { command: 'node scripts/serve-static.mjs dist 4175 --vercel', url: 'http://127.0.0.1:4175/', reuseExistingServer: true },
    { command: 'node scripts/serve-static.mjs reference/approved-static-site 4176', url: 'http://127.0.0.1:4176/', reuseExistingServer: true },
  ],
});
