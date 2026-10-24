import { useEffect } from 'react';
import RawHtml from './RawHtml.jsx';
import { html } from '../content/index.js';
import useHeaderState from '../hooks/useHeaderState.js';
import useStarOrbit from '../hooks/useStarOrbit.js';
import { initMobileMenu } from '../utils/mobileMenu.js';

/** Shared page chrome: the matted invitation frame, sticky-header state, star orbit on hover, skip link. */
export default function Layout({ variant = 'home', children }) {
  useHeaderState();
  useStarOrbit();
  useEffect(() => initMobileMenu(), []);
  return (
    <>
      <a className="tuc-skip" href="#main">Skip to content</a>
      <RawHtml html={variant === 'dev-diwali' ? html.ddFrame : html.frame} />
      {children}
    </>
  );
}

/** Wrapper styles copied from the approved pages (kept as inline styles, as before). */
export const HOME_ROOT_STYLE = {
  position: 'relative',
  color: '#1B2B4A',
  fontFamily: "'Montserrat', 'Montserrat Fallback', 'Montserrat Fallback Android', 'Montserrat Fallback Linux', system-ui, sans-serif",
  fontWeight: 300,
  minHeight: '100vh',
  WebkitFontSmoothing: 'antialiased',
};

export const DD_ROOT_STYLE = {
  background: '#F3EDE2',
  color: '#5E4A3A',
  fontFamily: "'Montserrat', 'Montserrat Fallback', 'Montserrat Fallback Android', 'Montserrat Fallback Linux', system-ui, sans-serif",
  fontWeight: 300,
  minHeight: '100vh',
  WebkitFontSmoothing: 'antialiased',
};
