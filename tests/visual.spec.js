// Visual parity: the React build (dist/, port 4175) against the approved static site
// (reference/approved-static-site, port 4176), page by page at desktop, tablet and phone sizes.
// Brand fonts are blocked in BOTH so the comparison is deterministic offline; the clock is frozen so the
// live sky and globe match; the two live canvases are masked in full-page captures and compared separately.
import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';

const REACT = 'http://127.0.0.1:4175';
const APPROVED = 'http://127.0.0.1:4176';
const FIXED = new Date('2026-10-21T14:30:00Z');
const VIEWPORTS = [[1440, 900], [768, 1024], [390, 844]];
const PAGES = [['index', '/'], ['dev-diwali', '/dev-diwali.html'], ['contact', '/contact.html'], ['terms', '/terms.html'], ['privacy', '/privacy.html'], ['404', '/404.html']];
// Approved, intentional content differences (see MIGRATION_REPORT.md): privacy now says fonts are self-hosted.
const ALLOWED = { privacy: 0.15 };
const LIMIT = 0.001; // 0.1% of pixels

async function capture(browser, base, path, width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, timezoneId: 'Asia/Kolkata', locale: 'en-GB' });
  const page = await ctx.newPage();
  await page.clock.install({ time: FIXED });
  await page.route(/(fonts\.googleapis|fonts\.gstatic|brygada|cinzel|italianno|montserrat)/, (r) => r.abort());
  await page.goto(base + path);
  await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => { i.loading = 'eager'; }));
  // The approved site had no metric-matched fallback faces; remove them so both use the same stand-in fonts.
  await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      for (let i = rules.length - 1; i >= 0; i -= 1) {
        if (rules[i] instanceof CSSFontFaceRule && /Fallback/.test(rules[i].style.getPropertyValue('font-family'))) sheet.deleteRule(i);
      }
    }
  });
  await page.clock.runFor(3000);
  await page.waitForLoadState('networkidle');
  await page.clock.runFor(3000);
  const masks = [page.locator('#tuc-sky'), page.locator('#tuc-globe-canvas')];
  const full = await page.screenshot({ fullPage: true, mask: masks, maskColor: '#FF00FF' });
  let globe = null;
  if (path === '/') {
    await page.evaluate(() => document.querySelector('.tuc-gh').scrollIntoView({ block: 'start' }));
    await page.clock.runFor(2000);
    await page.waitForTimeout(300);
    globe = await page.screenshot();
  }
  await ctx.close();
  return { full, globe };
}

function diff(a, b, out) {
  const A = PNG.sync.read(a);
  const B = PNG.sync.read(b);
  const w = Math.max(A.width, B.width);
  const h = Math.max(A.height, B.height);
  const pad = (img) => { const p = new PNG({ width: w, height: h }); p.data.fill(255); PNG.bitblt(img, p, 0, 0, img.width, img.height, 0, 0); return p; };
  const pa = pad(A); const pb = pad(B); const d = new PNG({ width: w, height: h });
  const n = pixelmatch(pa.data, pb.data, d.data, w, h, { threshold: 0.1 });
  if (n) writeFileSync(out, PNG.sync.write(d));
  return { ratio: n / (w * h), sameSize: A.width === B.width && A.height === B.height };
}

for (const [name, path] of PAGES) {
  for (const [width, height] of VIEWPORTS) {
    test(`matches approved design: ${name} at ${width}x${height}`, async ({ browser }) => {
      mkdirSync('test-results/visual', { recursive: true });
      const approved = await capture(browser, APPROVED, path === '/' ? '/index.html' : path, width, height);
      const react = await capture(browser, REACT, path, width, height);
      const full = diff(approved.full, react.full, `test-results/visual/${name}-${width}-diff.png`);
      writeFileSync(`test-results/visual/${name}-${width}-react.png`, react.full);
      const limit = ALLOWED[name] ?? LIMIT;
      expect(full.ratio, `${name} ${width}: ${(full.ratio * 100).toFixed(3)}% pixels differ`).toBeLessThanOrEqual(limit);
      if (!ALLOWED[name]) expect(full.sameSize, 'page height unchanged').toBe(true);
      if (approved.globe) {
        const g = diff(approved.globe, react.globe, `test-results/visual/${name}-${width}-globe-diff.png`);
        expect(g.ratio, `globe ${(g.ratio * 100).toFixed(3)}%`).toBeLessThanOrEqual(LIMIT);
      }
    });
  }
}
