(function(){
/**
 * Handwritten ink for the enquiry form: what the visitor types appears in cursive, each new letter
 * flowing onto the line from left to right as if written with a pen. The real input keeps the value
 * (and the caret); its text is drawn transparent and a mirror "ink" layer on top shows the letters.
 * Returns { sync, destroy }. Call sync() after changing field values from code (e.g. a form reset).
 */
const FIELDS = 'input[name="name"],input[name="email"],input[name="phone"]';
const STAGGER = 38; // ms between letters of a pasted or autofilled run

function attachHandwriting(form) {
  if (!form || typeof window === 'undefined') return { sync() {}, destroy() {} };
  const animate = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  form.classList.add('tuc-hand');
  const items = Array.from(form.querySelectorAll(FIELDS)).map((el) => {
    const ink = document.createElement('span');
    ink.className = el.tagName === 'TEXTAREA' ? 'tuc-ink tuc-ink-area' : 'tuc-ink';
    ink.setAttribute('aria-hidden', 'true');
    el.insertAdjacentElement('afterend', ink);
    el.classList.add('tuc-inked');
    return { el, ink, prev: null };
  });

  function place(it) {
    const { el, ink } = it;
    ink.style.left = `${el.offsetLeft}px`;
    ink.style.top = `${el.offsetTop}px`;
    ink.style.width = `${el.offsetWidth}px`;
    ink.style.height = `${el.offsetHeight}px`;
    ink.style.paddingRight = `${2 + (el.offsetWidth - el.clientWidth)}px`;
    ink.scrollLeft = el.scrollLeft;
    ink.scrollTop = el.scrollTop;
  }
  function render(it, live) {
    const v = it.el.value;
    const old = it.prev == null ? v : it.prev;
    if (it.prev === v) { place(it); return; }
    let p = 0;
    while (p < old.length && p < v.length && old[p] === v[p]) p += 1;
    let s = 0;
    while (s < old.length - p && s < v.length - p && old[old.length - 1 - s] === v[v.length - 1 - s]) s += 1;
    const a = it.prev == null || !live || !animate ? v.length : p;
    const b = v.length - s;
    const frag = document.createDocumentFragment();
    if (a > 0) frag.append(v.slice(0, a));
    for (let i = a; i < b; i += 1) {
      const c = document.createElement('span');
      c.className = 'tuc-new';
      c.textContent = v[i];
      c.style.animationDelay = `${Math.min(i - a, 40) * STAGGER}ms`;
      c.addEventListener('animationend', () => c.classList.remove('tuc-new'), { once: true });
      frag.append(c);
    }
    if (b < v.length && a < v.length) frag.append(v.slice(Math.max(a, b)));
    if (it.el.tagName === 'TEXTAREA') frag.append('​');
    it.ink.replaceChildren(frag);
    it.prev = v;
    place(it);
  }
  const byEl = new Map(items.map((it) => [it.el, it]));
  const onInput = (e) => { const it = byEl.get(e.target); if (it) render(it, true); };
  const onMove = (e) => { const it = byEl.get(e.target); if (it) requestAnimationFrame(() => place(it)); };
  const onReset = () => setTimeout(() => items.forEach((it) => render(it, false)), 0);
  const onResize = () => items.forEach(place);
  form.addEventListener('input', onInput);
  form.addEventListener('change', onInput);
  form.addEventListener('reset', onReset);
  ['scroll', 'keyup', 'click', 'select', 'focusin'].forEach((t) => form.addEventListener(t, onMove, true));
  window.addEventListener('resize', onResize);
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(onResize) : null;
  if (ro) items.forEach((it) => ro.observe(it.el));
  items.forEach((it) => render(it, false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);

  return {
    sync() { items.forEach((it) => render(it, true)); },
    destroy() {
      form.removeEventListener('input', onInput);
      form.removeEventListener('change', onInput);
      form.removeEventListener('reset', onReset);
      ['scroll', 'keyup', 'click', 'select', 'focusin'].forEach((t) => form.removeEventListener(t, onMove, true));
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      items.forEach((it) => { it.ink.remove(); it.el.classList.remove('tuc-inked'); });
      form.classList.remove('tuc-hand');
    },
  };
}

/**
 * Keep the form fields on the notepad's ruled lines: every row is a whole number of rule heights
 * (see .tuc-grid in pages.css), and this nudges the grid down so it starts exactly on a rule.
 * Returns a cleanup function.
 */
function alignToRules(form) {
  const grid = form && form.querySelector('.tuc-grid');
  if (!grid || typeof window === 'undefined') return () => {};
  let raf = 0;
  function snap() {
    raf = 0;
    const rule = parseFloat(getComputedStyle(form).getPropertyValue('--rule')) || 34;
    grid.style.marginTop = '';
    const base = parseFloat(getComputedStyle(grid).marginTop) || 0;
    const off = grid.getBoundingClientRect().top - form.getBoundingClientRect().top - form.clientTop;
    const extra = (rule - (off % rule)) % rule;
    if (extra > 0.25 && rule - extra > 0.25) grid.style.marginTop = `${base + extra}px`;
  }
  const queue = () => { if (!raf) raf = requestAnimationFrame(snap); };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(queue) : null;
  if (ro) { ro.observe(form); const c = form.querySelector('.tuc-choice'); if (c) ro.observe(c); }
  window.addEventListener('resize', queue);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  snap();
  return () => {
    if (ro) ro.disconnect();
    window.removeEventListener('resize', queue);
    if (raf) cancelAnimationFrame(raf);
    grid.style.marginTop = '';
  };
}

var f = document.getElementById('tuc-enquiry');
attachHandwriting(f);
alignToRules(f);
})();
