import { useEffect } from 'react';
import { HEADER_EVENT } from './useHeaderState.js';

/**
 * Dev Diwali parchment scroll: pins in view and unrolls from the centre little by little as the visitor
 * scrolls, holds open, then rolls back up. Geometry, easing and timings are the approved ones.
 */
export default function useScrollUnroll(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    const el = root && root.querySelector('#tuc-scroll-stage');
    if (!el) return undefined;
    const pin = el.querySelector('.tuc-pin');
    const wrap = el.querySelector('.tuc-sheetwrap');
    const sheet = wrap && wrap.firstElementChild;
    const ink = el.querySelector('.tuc-ink');
    const seal = el.querySelector('.tuc-seal');
    const ribbon = el.querySelector('.tuc-ribbon');
    if (!pin || !wrap || !sheet) return undefined;

    let full = 0;
    let H = 0;
    let top = 0;
    let runway = 0;
    let cur = 0;
    let target = 0;
    let raf = 0;
    const clamp = (v) => Math.max(0, Math.min(1, v));

    const apply = (p) => {
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const h = full * e;
      wrap.style.height = `${h.toFixed(1)}px`;
      sheet.style.transform = `translateY(${(-(full - h) / 2).toFixed(1)}px)`;
      if (ink) ink.style.opacity = clamp((p - 0.06) / 0.4).toFixed(3);
      const so = clamp(1 - p * 5);
      if (seal) {
        seal.style.opacity = so.toFixed(3);
        seal.style.transform = `translate(-50%,-50%) scale(${(0.85 + 0.15 * so).toFixed(3)})`;
      }
      if (ribbon) ribbon.style.opacity = so.toFixed(3);
    };
    const measure = () => {
      const vh = window.innerHeight || 800;
      full = sheet.scrollHeight || sheet.offsetHeight;
      H = full + 48;
      const hd = document.querySelector('.tuc-hdr');
      const sm = window.innerWidth <= 700;
      const mat = sm ? 12 : 22;
      const hb = sm || !hd ? mat + 6 : mat + hd.offsetHeight + 10;
      top = Math.max(hb, (vh - H) / 2);
      runway = Math.round(vh * 1.35);
      pin.style.height = `${H}px`;
      pin.style.top = `${top}px`;
      el.style.height = `${H + runway}px`;
      apply(cur);
    };
    const read = () => {
      const vh = window.innerHeight || 800;
      const rc = el.getBoundingClientRect();
      const pr = pin.getBoundingClientRect();
      const opening = clamp((top - rc.top) / (runway * 0.75));
      const closing = clamp((pr.bottom - vh * 0.06) / (vh * 0.45));
      target = Math.min(opening, closing);
    };
    const tick = () => {
      raf = 0;
      read();
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.002) cur = target;
      apply(cur);
      if (cur !== target) raf = requestAnimationFrame(tick);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const onResize = () => { measure(); onScroll(); };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener(HEADER_EVENT, onResize);
    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && ink) {
      ro = new ResizeObserver(() => measure());
      ro.observe(ink);
    }
    measure();
    read();
    cur = target;
    apply(cur);
    // fonts can change the sheet height after first paint
    const t1 = setTimeout(onResize, 500);
    const t2 = setTimeout(onResize, 1500);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize).catch(() => {});

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener(HEADER_EVENT, onResize);
      if (ro) ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rootRef]);
}
