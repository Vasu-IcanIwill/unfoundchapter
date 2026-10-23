import PageShell from '../components/PageShell.jsx';
import PageIntro from '../components/PageIntro.jsx';
import LegalArticle from '../components/LegalArticle.jsx';
import { TERMS, DRAFT_NOTE } from '../content/legal.js';

export default function TermsPage() {
  return (
    <PageShell>
      <PageIntro eyebrow="The fine print" title={<>Terms and <span style={{ fontStyle: 'italic', color: '#96745A' }}>cancellation</span></>} note={DRAFT_NOTE} />
      <LegalArticle sections={TERMS} />
    </PageShell>
  );
}
