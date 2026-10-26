import { useRef } from 'react';
import Layout, { DD_ROOT_STYLE } from '../components/Layout.jsx';
import RawHtml from '../components/RawHtml.jsx';
import useScrollUnroll from '../hooks/useScrollUnroll.js';
import useInViewClass from '../hooks/useInViewClass.js';
import { html } from '../content/index.js';

export default function DevDiwaliPage() {
  const itineraryRef = useRef(null);
  const downloadRef = useRef(null);
  useScrollUnroll(itineraryRef);
  useInViewClass(downloadRef, '#tuc-dl', 'is-on', 0.6);
  return (
    <Layout variant="dev-diwali">
      <div style={DD_ROOT_STYLE}>
        <RawHtml html={html.ddHeader} />
        <main id="main">
          <RawHtml html={html.ddHero} />
          <RawHtml ref={itineraryRef} html={html.ddItinerary} />
          <RawHtml ref={downloadRef} html={html.ddDownload} />
          <RawHtml html={html.ddReserve} />
        </main>
        <RawHtml html={html.ddFooter} />
      </div>
    </Layout>
  );
}
