// The bookmark star (outline five-point star with a ribbon), in a -10..10 box. Shared by the orbit effect.
export const STAR_PATH = 'M0.15 -8.75 L2.24 -2.31 L9.23 -1.82 L3.85 2.08 L5.84 8.77 L-0.15 5.20 L-5.59 8.52 L-3.85 2.38 L-9.33 -2.02 L-2.29 -2.31Z';
export const BOOKMARK_PATH = 'M-1.55 -2.7H1.55V2.9L0 1.75L-1.55 2.9Z';
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
