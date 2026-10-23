import { useEffect } from 'react';

/** Toggles a class on an element while it is at least `threshold` visible (download button twinkle). */
export default function useInViewClass(rootRef, selector, className, threshold = 0.6) {
  useEffect(() => {
    const root = rootRef.current;
    const el = root && root.querySelector(selector);
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add(className);
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      el.classList.toggle(className, entries.some((e) => e.isIntersecting));
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [rootRef, selector, className, threshold]);
}
