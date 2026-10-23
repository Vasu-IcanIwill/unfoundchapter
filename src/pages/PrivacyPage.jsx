import PageShell from '../components/PageShell.jsx';
import PageIntro from '../components/PageIntro.jsx';
import LegalArticle from '../components/LegalArticle.jsx';
import { PRIVACY, DRAFT_NOTE } from '../content/legal.js';

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageIntro eyebrow="How we look after your details" title={<>Your <span style={{ fontStyle: 'italic', color: '#96745A' }}>privacy</span></>} note={DRAFT_NOTE} />
      <LegalArticle sections={PRIVACY} />
    </PageShell>
  );
}
