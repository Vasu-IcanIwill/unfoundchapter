import { STAR_PATH, BOOKMARK_PATH } from '../utils/star.js';

/** Gold line, bookmark star, gold line (120 x 14), as used under headings. */
export default function StarDivider() {
  return (
    <svg width="120" height="14" viewBox="0 0 120 14" aria-hidden="true">
      <line x1="0" y1="7" x2="50" y2="7" stroke="#B89B65" strokeWidth="1" />
      <g transform="translate(60 7) scale(0.62)">
        <path d={STAR_PATH} fill="none" stroke="#B89B65" strokeWidth="1.35" strokeLinejoin="round" strokeLinecap="round" />
        <path d={BOOKMARK_PATH} fill="#B89B65" />
      </g>
      <line x1="70" y1="7" x2="120" y2="7" stroke="#B89B65" strokeWidth="1" />
    </svg>
  );
}
