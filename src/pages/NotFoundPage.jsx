import PageShell from '../components/PageShell.jsx';
import StarDivider from '../components/StarDivider.jsx';
import { EYEBROW, H1, LEAD } from '../components/PageIntro.jsx';

export default function NotFoundPage() {
  return (
    <PageShell>
      <div className="tuc-intro" style={{ alignItems: 'center', textAlign: 'center', padding: '60px 0 40px' }}>
        <span style={EYEBROW}>Page not found</span>
        <h1 style={H1}>This page is still <span style={{ fontFamily: "'Italianno', cursive", fontSize: '1.3em', lineHeight: 0.8 }}>unwritten.</span></h1>
        <p style={{ ...LEAD, maxWidth: 'none' }}>The page you were looking for has not been written yet, or it has moved.</p>
        <StarDivider />
        <a href="/" className="tuc-send" style={{ marginTop: 8 }}>Return to the first page</a>
      </div>
    </PageShell>
  );
}
