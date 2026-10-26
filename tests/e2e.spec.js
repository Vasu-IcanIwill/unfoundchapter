// Functional, accessibility-basics and delivery checks for the production build (dist/).
import { test, expect } from '@playwright/test';

const PAGES = ['/', '/dev-diwali.html', '/contact.html', '/terms.html', '/privacy.html'];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

function watchErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

test.describe('every page loads cleanly', () => {
  for (const path of PAGES) {
    test(`${path}: 200, title, description, no errors, prerendered content`, async ({ page, request }) => {
      const res = await request.get(path);
      expect(res.status()).toBe(200);
      const html = await res.text();
      expect(html).toContain('<main id="main"');            // content is in the HTML before any JS runs
      const errors = watchErrors(page);
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(/Unfound Chapter/);
      expect(await page.locator('meta[name="description"]').getAttribute('content')).toBeTruthy();
      expect(errors).toEqual([]);
    });
  }
});

test('no horizontal scrolling on any page at desktop, tablet and phone sizes', async ({ browser }) => {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    for (const path of [...PAGES, '/404.html']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(sw, `${path} at ${vp.name}`).toBeLessThanOrEqual(vp.width);
    }
    await ctx.close();
  }
});

test('every internal link and asset resolves', async ({ page, request }) => {
  const seen = new Set();
  for (const path of [...PAGES, '/404.html']) {
    await page.goto(path);
    const urls = await page.evaluate(() =>
      [...document.querySelectorAll('a[href], link[href], img[src], source[srcset], script[src]')].flatMap((el) => {
        if (el.srcset) return el.srcset.split(',').map((s) => s.trim().split(' ')[0]);
        return [el.getAttribute('href') || el.getAttribute('src')];
      }),
    );
    for (const u of urls) {
      if (!u || u.startsWith('#') || /^(https?:|mailto:|tel:)/.test(u)) continue;
      const clean = new URL(u, `http://127.0.0.1:4175${path}`).pathname;
      if (seen.has(clean)) continue;
      seen.add(clean);
      const r = await request.get(clean);
      expect(r.status(), `${clean} (linked from ${path})`).toBe(200);
    }
  }
  expect(seen.size).toBeGreaterThan(15);
});

test('navigation targets are the agreed pages', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.tuc-head a', { hasText: 'Enquire' })).toHaveAttribute('href', '/contact.html?journey=own');
  await expect(page.locator('.tuc-head a', { hasText: 'Group Trips' })).toHaveAttribute('href', '/dev-diwali.html');
  await expect(page.locator('#enquire a', { hasText: 'Request a conversation' })).toHaveAttribute('href', '/contact.html');
  const foot = page.locator('footer.tuc-foot');
  await expect(foot.locator('a', { hasText: 'Contact' })).toHaveAttribute('href', '/contact.html');
  await expect(foot.locator('a', { hasText: 'Terms' })).toHaveAttribute('href', '/terms.html');
  await expect(foot.locator('a', { hasText: 'Privacy' })).toHaveAttribute('href', '/privacy.html');
  await expect(foot.locator('a', { hasText: 'About' })).toHaveCount(0);
  await page.locator('.tuc-head a', { hasText: 'Group Trips' }).click();
  await expect(page).toHaveURL(/\/dev-diwali\.html$/);
});

test('the brochure button stays but nothing downloads yet', async ({ page, request }) => {
  await page.goto('/dev-diwali.html');
  const btn = page.locator('a.tuc-dl');
  await expect(btn).toHaveCount(1);
  await expect(btn).not.toHaveAttribute('href', /.*/);
  await expect(btn).not.toHaveAttribute('download', /.*/);
  await expect(page.locator('#tuc-dl-soon')).toHaveText('Coming soon');
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  expect((await request.get('/docs/The-Unfound-Chapter-Dev-Diwali-Itinerary.pdf')).status()).toBe(404);
});

test('unknown pages return the 404 page with status 404', async ({ request }) => {
  const r = await request.get('/no-such-chapter.html');
  expect(r.status()).toBe(404);
  expect(await r.text()).toContain('still');
  const asset = await request.get('/assets/missing-file.js');
  expect(asset.status()).toBe(404);                         // missing assets are not answered with a page
});

test('sticky header compacts on scroll and the frame stays above content', async ({ page }) => {
  await page.goto('/');
  await page.mouse.wheel(0, 600);
  await expect(page.locator('html')).toHaveClass(/tuc-scrolled/);
  const pos = await page.locator('.tuc-head').evaluate((el) => getComputedStyle(el).position);
  expect(pos).toBe('sticky');
  const z = await page.locator('.tuc-frame').evaluate((el) => +getComputedStyle(el).zIndex);
  expect(z).toBeGreaterThan(1000);
});

test('golden hour globe draws and turns when dragged', async ({ page }) => {
  await page.goto('/');
  await page.locator('#tuc-globe-canvas').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const c = document.getElementById('tuc-globe-canvas');
    if (!c || !c.width) return false;
    const d = c.getContext('2d').getImageData(c.width / 2, c.height / 2, 1, 1).data;
    return d[3] > 0;
  }, null, { timeout: 15000 });
  const box = await page.locator('#tuc-globe-canvas').boundingBox();
  const before = await page.locator('#tuc-globe-canvas').screenshot();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 220, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  const after = await page.locator('#tuc-globe-canvas').screenshot();
  expect(Buffer.compare(before, after)).not.toBe(0);
  await expect(page.locator('.tuc-utc').first()).toHaveText(/^\d\d:\d\d UTC$/);
  await expect(page.locator('#tuc-sky-label')).not.toHaveText('');
});

test('notepad: cover opens only when fully in view, then pages turn on click', async ({ page }) => {
  await page.goto('/');
  const nb = page.locator('.tuc-nb');
  await expect(nb).not.toHaveClass(/is-open/);
  await nb.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 160));
  await expect(nb).toHaveClass(/is-open/, { timeout: 4000 });
  await expect(nb).toHaveAttribute('data-page', '1');
  await page.locator('.tuc-nb-p1 .tuc-nb-turn').click();
  await expect(nb).toHaveAttribute('data-page', '2');
  expect(await page.locator('.tuc-nb-p1').evaluate((el) => el.inert)).toBe(true);
  await page.waitForTimeout(1200);
  await page.locator('.tuc-nb-p2 .tuc-nb-turn').click();
  await expect(nb).toHaveAttribute('data-page', '1');
  // scrolling no longer lifts page 1 (the peek was removed); the page stays flat
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 160);
  await page.waitForTimeout(400);
  expect(await page.locator('.tuc-nb-p1').evaluate((el) => el.style.transform)).toBe('');
  await page.mouse.wheel(0, -160);
  await page.waitForTimeout(600);
  // tap zones: right half turns forward, left half turns back, back again from page 1 to the cover
  const box = await page.locator('.tuc-nb-stack').boundingBox();
  const at = (fx) => page.mouse.click(box.x + box.width * fx, box.y + box.height * 0.3);
  await at(0.9);
  await expect(nb).toHaveAttribute('data-page', '2');
  await page.waitForTimeout(1200);
  await at(0.9);
  await expect(nb).toHaveAttribute('data-page', '2');
  await at(0.1);
  await expect(nb).toHaveAttribute('data-page', '1');
  await page.waitForTimeout(1200);
  await at(0.1);
  await expect(nb).not.toHaveClass(/is-open/);
  await page.waitForTimeout(1500);
  await expect(nb).not.toHaveClass(/is-open/); // stays closed while the visitor is still here
  await at(0.9);
  await expect(nb).toHaveClass(/is-open/);
  // turn to page 2, then scroll the notepad fully off screen: it closes and resets to page 1
  await page.locator('.tuc-nb-p1 .tuc-nb-turn').click();
  await expect(nb).toHaveAttribute('data-page', '2');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(nb).not.toHaveClass(/is-open/);
  await expect(nb).toHaveAttribute('data-page', '1');
  // and opens again on return
  await nb.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 160));
  await expect(nb).toHaveClass(/is-open/, { timeout: 4000 });
});

test('Dev Diwali scroll unrolls as the page scrolls', async ({ page }) => {
  await page.goto('/dev-diwali.html');
  const stage = page.locator('#tuc-scroll-stage');
  const top = await stage.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const heights = [];
  for (let y = top - 300; y < top + 1500; y += 150) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
    heights.push(await page.locator('.tuc-sheetwrap').evaluate((el) => el.getBoundingClientRect().height));
  }
  expect(heights[0]).toBeLessThan(5);
  expect(Math.max(...heights)).toBeGreaterThan(400);
});

test('star orbit appears on hover and cleans up', async ({ page }) => {
  await page.goto('/');
  await page.locator('.tuc-begin').hover();
  await expect(page.locator('svg[style*="9996"]')).toHaveCount(1);
  await page.waitForTimeout(2000);
  await expect(page.locator('svg[style*="9996"]')).toHaveCount(0);
});

test.describe('enquiry form', () => {
  test('preselects the chapter from ?journey=', async ({ page }) => {
    await page.goto('/contact.html?journey=own');
    await expect(page.locator('input[name="journey"][value="own"]')).toBeChecked();
    await page.goto('/contact.html?journey=dev-diwali');
    await expect(page.locator('input[name="journey"][value="dev-diwali"]')).toBeChecked();
  });

  test('validates required fields and clears errors as you type', async ({ page }) => {
    await page.goto('/contact.html');
    await page.getByRole('button', { name: 'Request invite' }).click();
    await expect(page.locator('.tuc-err')).toHaveText([
      'Choose one of the chapters.', 'Enter your name.', 'Enter your email.', 'Enter your phone or WhatsApp number.', 'Please tick the box so we can reply to you.',
    ]);
    await page.fill('input[name="name"]', 'Asha');
    await expect(page.locator('#err-name')).toHaveCount(0);
    await page.fill('input[name="email"]', 'not-an-email');
    await page.getByRole('button', { name: 'Request invite' }).click();
    await expect(page.locator('input[name="email"] ~ .tuc-err')).toHaveText('Check the email address.');
  });

  test('phone takes digits only and dates cannot be in the past', async ({ page }) => {
    await page.goto('/contact.html?journey=own');
    const phone = page.locator('input[name="phone"]');
    await phone.click();
    await expect(page.locator('select[name="cc"]')).toHaveValue('IN');
    await page.keyboard.type('98abc-765 43210');
    await expect(phone).toHaveValue('9876543210'); // digits only, capped at 10 for India
    await phone.fill('');
    await page.keyboard.type('12345');
    await page.getByRole('button', { name: 'Request invite' }).click();
    await expect(page.locator('#err-phone')).toHaveText('Enter the 10-digit number for India (+91).');
    await page.selectOption('select[name="cc"]', 'SG');
    await expect(phone).toHaveAttribute('maxlength', '8');
    await phone.fill('');
    await page.keyboard.type('812345678');
    await expect(phone).toHaveValue('81234567');
    const from = page.locator('input[name="from"]');
    const to = page.locator('input[name="to"]');
    const today = await page.evaluate(() => { const d = new Date(); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; });
    await expect(from).toHaveAttribute('min', today);
    await from.fill('2030-03-10');
    await expect(to).toHaveAttribute('min', '2030-03-10');
    await from.fill('2001-01-01');
    await page.getByRole('button', { name: 'Request invite' }).click();
    await expect(page.locator('#err-dates')).toHaveText('Choose dates from today onwards.');
    await expect(page.locator('textarea[name="message"]')).toHaveCount(0);
  });

  test('enquiries are emailed to the studio mailbox through FormSubmit', async ({ page }) => {
    let sent = null;
    await page.route('https://formsubmit.co/**', async (route) => {
      sent = { url: route.request().url(), body: route.request().postData() || '' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":"true"}' });
    });
    await page.goto('/contact.html?journey=own');
    await page.fill('input[name="name"]', 'Asha');
    await page.fill('input[name="email"]', 'asha@example.com');
    await page.fill('input[name="phone"]', '9876543210');
    await page.check('input[name="consent"]');
    await page.getByRole('button', { name: 'Request invite' }).click();
    await expect(page.locator('.tuc-status')).toHaveText(/Thank you/);
    expect(sent.url).toBe('https://formsubmit.co/ajax/unfoundchapter@gmail.com');
    expect(sent.body).toContain('Asha');
    expect(sent.body).toContain('asha@example.com');
    expect(sent.body).toContain('+91 9876543210');
  });
});

test('keyboard: skip link and visible focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.locator('.tuc-skip');
  await expect(skip).toBeFocused();
  await expect.poll(() => skip.evaluate((el) => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0); // slides in over 0.2s
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('reduced motion: notepad opens immediately and no star orbit', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.tuc-nb')).toHaveClass(/is-open/);
  await page.locator('.tuc-begin').hover();
  await page.waitForTimeout(300);
  await expect(page.locator('svg[style*="9996"]')).toHaveCount(0);
  await ctx.close();
});

test('cache headers (vercel.json, emulated locally)', async ({ request }) => {
  const html = await request.get('/');
  expect(html.headers()['cache-control']).toBe('public, max-age=0, must-revalidate');
  const page = await request.get('/dev-diwali.html');
  expect(page.headers()['cache-control']).toBe('public, max-age=0, must-revalidate');
  const htmlBody = await html.text();
  const asset = htmlBody.match(/\/assets\/[\w.-]+\.(?:js|css)/)[0];
  expect((await request.get(asset)).headers()['cache-control']).toBe('public, max-age=31536000, immutable');
});

test('SEO basics: canonical, Open Graph, robots and sitemap', async ({ page, request }) => {
  await page.goto('/dev-diwali.html');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  if (canonical) {
    expect(canonical).toMatch(/\/dev-diwali\.html$/);
    expect(await page.locator('meta[property="og:image"]').getAttribute('content')).toMatch(/^https?:\/\/.+\/og-image\.png$/);
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain('/dev-diwali.html');
  }
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toContain('Dev Diwali');
  const og = await request.get('/og-image.png');
  expect(og.status()).toBe(200);
});

test('enquiry form writes typed text in cursive ink', async ({ page }) => {
  await page.goto('/contact.html');
  const name = page.locator('input[name="name"]');
  await name.click();
  await page.keyboard.type('Asha', { delay: 40 });
  await expect(name).toHaveValue('Asha');
  const ink = page.locator('input[name="name"] + .tuc-ink');
  await expect(ink).toHaveText('Asha');
  expect(await ink.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Italianno');
  expect(await name.evaluate((el) => getComputedStyle(el).color)).toBe('rgba(0, 0, 0, 0)');
  await page.locator('input[name="phone"]').fill('9876543210');
  await expect(page.locator('input[name="phone"] + .tuc-ink')).toHaveText('9876543210');
});

test('choosing "We write your chapter" switches to the short form', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('input[name="from"]')).toBeVisible();
  await page.locator('label:has(input[value="dev-diwali"])').click();
  for (const n of ['name', 'email', 'phone']) await expect(page.locator(`input[name="${n}"]`)).toBeVisible();
  await expect(page.locator('select[name="travellers"]')).toBeVisible();
  await expect(page.locator('input[name="consent"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Request invite' })).toBeVisible();
  await expect(page.locator('input[name="from"]')).toBeHidden();
  await expect(page.locator('input[name="to"]')).toBeHidden();
  await page.locator('label:has(input[value="own"])').click();
  await expect(page.locator('input[name="to"]')).toBeVisible();
  await page.goto('/contact.html?journey=dev-diwali');
  await expect(page.locator('input[name="from"]')).toBeHidden();
});


test('phone menu: the = button opens every header link and closes again', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('.tuc-nav-l')).toBeHidden();
  const btn = page.locator('.tuc-menu-btn');
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('.tuc-menu-list a')).toHaveText(['Journeys', 'Group Trips', 'Concierge', 'Enquire']);
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#tuc-menu')).toBeHidden();
  await ctx.close();
});
