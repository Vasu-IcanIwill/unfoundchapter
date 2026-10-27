import PageShell from '../components/PageShell.jsx';
import PageIntro from '../components/PageIntro.jsx';
import LegalArticle from '../components/LegalArticle.jsx';
import { PRIVACY, UPDATED_NOTE } from '../content/legal.jsx';

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageIntro eyebrow="How we look after your details" title={<>Your <span style={{ fontStyle: 'italic', color: '#96745A' }}>privacy</span></>} note={UPDATED_NOTE} />
      <LegalArticle sections={PRIVACY} />
    </PageShell>
  );
}
