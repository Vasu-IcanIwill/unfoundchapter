import { useEffect } from 'react';

/** Fired (instead of a synthetic window "resize") when the sticky header changes height. */
export const HEADER_EVENT = 'tuc:header-change';

/**
 * Sticky header state, unchanged behaviour:
 *  - html.tuc-scrolled after 40px of scroll (compact header),
 *  - html.tuc-hide while scrolling down past 160px (CSS only applies it on phones).
 */
export default function useHeaderState() {
  useEffect(() => {
    const root = document.documentElement;
    let last = 0;
    let compact = null;
    let timer = 0;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY || 0;
      const s = y > 40;
      if (s !== compact) {
        const first = compact === null;
        compact = s;
        root.classList.toggle('tuc-scrolled', s);
        if (!first) {
          clearTimeout(timer);
          timer = setTimeout(() => window.dispatchEvent(new Event(HEADER_EVENT)), 380);
        }
      }
      const hide = y > 160 && y > last + 2 ? true : y < last - 2 || y <= 160 ? false : root.classList.contains('tuc-hide');
      root.classList.toggle('tuc-hide', hide);
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(timer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
