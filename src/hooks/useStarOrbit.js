import { useEffect } from 'react';
import { STAR_PATH, BOOKMARK_PATH, prefersReducedMotion } from '../utils/star.js';

const NS = 'http://www.w3.org/2000/svg';
const DARK = '.tuc-priv,.tuc-foot,.tuc-hdr,.tuc-dlband,.tuc-journal';
const HEAD = '.tuc-hdr,.tuc-head';
function headBottom() {
  const hd = document.querySelector('.tuc-hdr') || document.querySelector('.tuc-head');
  return hd ? hd.getBoundingClientRect().bottom : 0;
}

function eligible(el) {
  if (el.closest('.tuc-logo') || el.dataset.tucOrbit === 'off') return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.width < 520 && r.height < 90;
}

/**
 * Gold bookmark star that travels once around a hovered (or keyboard-focused) link or button,
 * tracing a fine gold line that then fades. Same timing and geometry as the approved version.
 */
export default function useStarOrbit() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const running = new Set();

    function orbit(el) {
      if (el._tucOrbiting) return;
      el._tucOrbiting = true;
      const pad = 7;
      const dur = 1100;
      let t0 = 0;
      const col = '#B89B65';
      const onDark = !!el.closest(DARK);
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;z-index:9996;overflow:visible;transition:opacity .5s ease';
      const trace = document.createElementNS(NS, 'rect');
      trace.setAttribute('fill', 'none');
      trace.setAttribute('stroke', col);
      trace.setAttribute('stroke-width', '0.8');
      trace.setAttribute('stroke-opacity', onDark ? '0.8' : '0.65');
      const star = document.createElementNS(NS, 'g');
      const p1 = document.createElementNS(NS, 'path');
      p1.setAttribute('d', STAR_PATH);
      p1.setAttribute('fill', 'none');
      p1.setAttribute('stroke', col);
      p1.setAttribute('stroke-width', '1.6');
      p1.setAttribute('stroke-linejoin', 'round');
      const p2 = document.createElementNS(NS, 'path');
      p2.setAttribute('d', BOOKMARK_PATH);
      p2.setAttribute('fill', col);
      star.append(p1, p2);
      svg.append(trace, star);
      document.body.appendChild(svg);
      const job = { svg, el, raf: 0, timer: 0 };
      running.add(job);
      const inHead = !!el.closest(HEAD);
      const radius = Math.min(16, (parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0) + pad);

      function frame(ts) {
        if (!t0) t0 = ts;
        const p = Math.min(1, (ts - t0) / dur);
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const r = el.getBoundingClientRect();
        const w = r.width + pad * 2;
        const h = r.height + pad * 2;
        const rad = Math.min(h / 2, radius);
        svg.setAttribute('width', w + 20);
        svg.setAttribute('height', h + 20);
        svg.style.transform = `translate(${r.left - pad - 10}px,${r.top - pad - 10}px)`;
        // never draw over the fixed header: clip whatever part of the orbit is above the header's bottom edge
        const cut = inHead ? 0 : Math.max(0, headBottom() - (r.top - pad - 10));
        svg.style.clipPath = cut > 0 ? `inset(${cut}px 0 0 0)` : 'none';
        trace.setAttribute('x', 10);
        trace.setAttribute('y', 10);
        trace.setAttribute('width', w);
        trace.setAttribute('height', h);
        trace.setAttribute('rx', rad);
        trace.setAttribute('ry', rad);
        const sx = w - 2 * rad;
        const sy = h - 2 * rad;
        const q = (Math.PI * rad) / 2;
        const L = 2 * sx + 2 * sy + 2 * Math.PI * rad;
        trace.setAttribute('stroke-dasharray', L);
        trace.setAttribute('stroke-dashoffset', L * (1 - e));
        // position along the rounded rect, from top centre, clockwise
        let d = (e * L + (w / 2 - rad)) % L;
        const segs = [sx, q, sy, q, sx, q, sy, q];
        let k = 0;
        while (k < 7 && d > segs[k]) {
          d -= segs[k];
          k += 1;
        }
        let x;
        let y;
        let a;
        if (k === 0) { x = rad + d; y = 0; }
        else if (k === 1) { a = -Math.PI / 2 + d / rad; x = w - rad + rad * Math.cos(a); y = rad + rad * Math.sin(a); }
        else if (k === 2) { x = w; y = rad + d; }
        else if (k === 3) { a = d / rad; x = w - rad + rad * Math.cos(a); y = h - rad + rad * Math.sin(a); }
        else if (k === 4) { x = w - rad - d; y = h; }
        else if (k === 5) { a = Math.PI / 2 + d / rad; x = rad + rad * Math.cos(a); y = h - rad + rad * Math.sin(a); }
        else if (k === 6) { x = 0; y = h - rad - d; }
        else { a = Math.PI + d / rad; x = rad + rad * Math.cos(a); y = rad + rad * Math.sin(a); }
        star.setAttribute('transform', `translate(${x + 10} ${y + 10}) rotate(${e * 360}) scale(0.62)`);
        if (p < 1) job.raf = requestAnimationFrame(frame);
        else {
          svg.style.opacity = '0';
          job.timer = setTimeout(() => {
            svg.remove();
            el._tucOrbiting = false;
            running.delete(job);
          }, 520);
        }
      }
      job.raf = requestAnimationFrame(frame);
    }

    // mouse / trackpad: orbit on hover. Touch and pen: orbit once on tap, as feedback (no fake hover).
    const onOver = (ev) => {
      if (ev.pointerType && ev.pointerType !== 'mouse') return;
      const el = ev.target.closest && ev.target.closest('a,button');
      if (!el || (ev.relatedTarget && el.contains(ev.relatedTarget))) return;
      if (eligible(el)) orbit(el);
    };
    const onFocus = (ev) => {
      const el = ev.target.closest && ev.target.closest('a,button');
      if (el && el.matches(':focus-visible') && eligible(el)) orbit(el);
    };
    const onDown = (ev) => {
      if (ev.pointerType === 'mouse') return;
      const el = ev.target.closest && ev.target.closest('a,button');
      if (el && eligible(el)) orbit(el);
    };
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('focusin', onFocus);
      running.forEach((job) => {
        cancelAnimationFrame(job.raf);
        clearTimeout(job.timer);
        job.svg.remove();
        job.el._tucOrbiting = false;
      });
      running.clear();
    };
  }, []);
}
