import { useRef } from 'react';
import Layout, { HOME_ROOT_STYLE } from '../components/Layout.jsx';
import RawHtml from '../components/RawHtml.jsx';
import GoldenHour from '../components/GoldenHour.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import useNotebook from '../hooks/useNotebook.js';
import { html } from '../content/index.js';

export default function HomePage() {
  const journeysRef = useRef(null);
  useNotebook(journeysRef);
  return (
    <Layout variant="home">
      <div style={HOME_ROOT_STYLE}>
        <RawHtml html={html.homeMap} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RawHtml html={html.homeHeader} />
          <main id="main">
            <RawHtml html={html.homeHero} />
            <ErrorBoundary fallback={<RawHtml html={html.homeGoldenHour} />}>
              <GoldenHour />
            </ErrorBoundary>
            <RawHtml html={html.homeStrip} />
            <RawHtml ref={journeysRef} html={html.homeJourneys} />
            <RawHtml html={html.homeChapters} />
            <RawHtml html={html.homePrivileges} />
            <RawHtml html={html.homeClosing} />
          </main>
          <RawHtml html={html.homeFooter} />
        </div>
      </div>
    </Layout>
  );
}
