import Layout, { DD_ROOT_STYLE } from '../components/Layout.jsx';
import RawHtml from '../components/RawHtml.jsx';
import ItineraryWalk from '../components/ItineraryWalk.jsx';
import { html } from '../content/index.js';

export default function ItineraryPage() {
  return (
    <Layout variant="dev-diwali">
      <div style={DD_ROOT_STYLE}>
        <RawHtml html={html.ddHeader} />
        <main id="main">
          <ItineraryWalk />
        </main>
        <RawHtml html={html.ddFooter} />
      </div>
    </Layout>
  );
}
