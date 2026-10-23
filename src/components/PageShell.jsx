import Layout, { HOME_ROOT_STYLE } from './Layout.jsx';
import RawHtml from './RawHtml.jsx';
import { html } from '../content/index.js';

/** Chrome for contact, terms, privacy and 404: the home header and footer around a centred column. */
export default function PageShell({ children }) {
  return (
    <Layout>
      <div style={HOME_ROOT_STYLE}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <RawHtml html={html.pagesHeader} />
          <main id="main" className="tuc-page" style={{ maxWidth: 1320, margin: '0 auto', padding: '64px 40px 40px' }}>
            {children}
          </main>
          <RawHtml html={html.homeFooter} />
        </div>
      </div>
    </Layout>
  );
}
