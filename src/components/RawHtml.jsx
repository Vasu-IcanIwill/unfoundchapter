import { forwardRef, memo } from 'react';

/**
 * Renders approved static markup without adding a layout box (display: contents), so the DOM tree
 * and CSS behave exactly as in the original pages. The markup is static and trusted (see content/index.js).
 */
const RawHtml = memo(
  forwardRef(function RawHtml({ html }, ref) {
    // In production the client receives an empty string and keeps the prerendered markup (static island).
    return <div ref={ref} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} suppressHydrationWarning />;
  }),
);

export default RawHtml;
