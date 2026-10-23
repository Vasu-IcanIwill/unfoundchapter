import { useEffect } from 'react';
import { prefersReducedMotion } from '../utils/star.js';

const PEEK_MAX = 68; // degrees page 1 lifts while scrolling down
/**
 * "Two ways to begin" notepad, read like a book (pages turn right to left).
 *  - the indigo cover opens by itself when the whole notepad is on screen (or, if taller than the screen,
 *    when its top reaches the header) and the visitor has paused there for 650ms,
 *  - scrolling down while page 1 is open lifts the page part way: a peek at the next page,
 *  - a click on the right half of the notepad turns forward (cover > page 1 > page 2); a click on the
 *    left half turns back (page 2 > page 1 > cover). Links keep working; the turn buttons stay for keyboards,
 *  - once the notepad has left the screen completely it closes again, ready to open afresh,
 *  - the hidden page is aria-hidden + inert; keyboard users get focus moved to the new page's button.
 */
export default function useNotebook(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    const nb = root && root.querySelector('.tuc-nb');
    if (!nb) return undefined;
    const p1 = nb.querySelector('.tuc-nb-p1');
    const p2 = nb.querySelector('.tuc-nb-p2');
    const stack = nb.querySelector('.tuc-nb-stack') || nb;
    const animated = !prefersReducedMotion() && typeof IntersectionObserver !== 'undefined';
    const timers = new Set();
    const later = (fn, ms) => {
      const t = setTimeout(() => { timers.delete(t); fn(); }, ms);
      timers.add(t);
      return t;
    };
    const cancel = (t) => { if (t) { clearTimeout(t); timers.delete(t); } return 0; };

    let open = !animated;
    let manualClosed = false;
    let timer = 0;
    let settle = 0;
    let raf = 0;
    let peekFrom = 0;

    function setPeek(deg) {
      nb.style.setProperty('--nb-peek', deg.toFixed(2));
      nb.classList.toggle('nb-lifted', deg > 1);
    }
    function setPage(n, focus) {
      nb.setAttribute('data-page', String(n));
      nb.classList.remove('nb-peeking');
      setPeek(0);
      peekFrom = window.scrollY;
      const on = n === 2 ? p2 : p1;
      const off = n === 2 ? p1 : p2;
      on.removeAttribute('aria-hidden');
      on.inert = false;
      off.setAttribute('aria-hidden', 'true');
      off.inert = true;
      if (focus) {
        const b = on.querySelector('.tuc-nb-turn');
        if (b) later(() => b.focus({ preventScroll: true }), 600);
      }
    }
    function openNow() {
      open = true;
      manualClosed = false;
      timer = cancel(timer);
      nb.classList.add('is-open');
      setPage(1, false);
    }
    function closeNow(byClick) {
      open = false;
      manualClosed = !!byClick;
      nb.classList.remove('is-open');
      setPage(1, false);
    }
    setPage(1, false);

    const onClick = (e) => {
      const b = e.target.closest('.tuc-nb-turn');
      if (b) {
        setPage(b.getAttribute('data-nb') === 'next' ? 2 : 1, e.detail === 0);
        return;
      }
      if (e.target.closest('a, button, input, select, textarea, label')) return;
      const r = stack.getBoundingClientRect();
      const right = e.clientX >= r.left + r.width / 2;
      const page = nb.getAttribute('data-page');
      if (!open) { if (right && animated) openNow(); return; }
      if (page === '1') {
        if (right) setPage(2, false);
        else if (animated) closeNow(true);
      } else if (!right) {
        setPage(1, false);
      }
    };
    nb.addEventListener('click', onClick);

    if (!animated) {
      nb.classList.add('is-open');
      return () => nb.removeEventListener('click', onClick);
    }
    nb.classList.add('nb-ready');

    function headTop() {
      const hd = document.querySelector('.tuc-head');
      return hd ? Math.max(0, hd.getBoundingClientRect().bottom) : 0;
    }
    function fully() {
      const r = nb.getBoundingClientRect();
      const vh = window.innerHeight;
      const top = headTop();
      if (r.height <= vh - top - 24) return r.top >= top - 40 && r.bottom <= vh + 2;
      return r.top <= top + 40 && r.top >= top - 160;
    }
    function gone() {
      const r = nb.getBoundingClientRect();
      return r.bottom < headTop() || r.top > window.innerHeight;
    }
    function peek() {
      if (!open || nb.getAttribute('data-page') !== '1') return;
      const y = window.scrollY;
      if (y < peekFrom) peekFrom = y;
      const deg = Math.min(PEEK_MAX, ((y - peekFrom) / Math.max(240, window.innerHeight * 0.4)) * PEEK_MAX);
      nb.classList.add('nb-peeking');
      setPeek(deg);
      settle = cancel(settle);
      settle = later(() => { settle = 0; nb.classList.remove('nb-peeking'); }, 180);
    }
    function check() {
      raf = 0;
      if (open || manualClosed) {
        if (gone()) { if (open) closeNow(false); manualClosed = false; }
        else peek();
        return;
      }
      if (fully()) {
        if (!timer) timer = later(() => { timer = 0; if (!open && !manualClosed && fully()) openNow(); }, 650);
      } else {
        timer = cancel(timer);
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    check();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      nb.removeEventListener('click', onClick);
      timers.forEach(clearTimeout);
      timers.clear();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [rootRef]);
}
